import OpenAI from 'openai';
import { z } from 'zod';

import { env } from '@/config/env';
import { CONDITIONS } from '@/config/constants';
import type { ConditionId } from '@/domain/entities/Condition';
import { SCORE_TO_VERDICT, type VerdictScore } from '@/domain/entities/Verdict';
import type { ScanItem, ScanType } from '@/domain/entities/Scan';
import { uuid } from '@/utils/id';
import { AppError } from '@/types/global';

const MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_INSIGHT_CHARS = 240;
const MAX_REASONING_CHARS = 200;
const MAX_DAMAGE_CONTROL_CHARS = 320;

export interface AnalyseInput {
  photoBase64?: string;
  text?: string;
  conditions: ConditionId[];
  customConditions: string[];
  ageYears: number;
  weightKg: number;
}

export interface AnalyseResult {
  scanType: ScanType;
  items: ScanItem[];
  dishSafetyPct: number;
  insight: string;
  productName: string | null;
}

const scoreSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const itemSchema = z.object({
  name: z.string().min(1).max(80),
  score: scoreSchema,
  reasoning: z.string().max(MAX_REASONING_CHARS),
  damageControl: z.string().max(MAX_DAMAGE_CONTROL_CHARS).default(''),
});

const responseSchema = z.object({
  scanType: z.enum(['meal', 'ingredients', 'text', 'unrecognised']),
  productName: z.string().max(80).nullable().optional(),
  items: z.array(itemSchema).max(20),
  dishSafetyPct: z.number().int().min(0).max(100),
  insight: z.string().max(MAX_INSIGHT_CHARS),
});

let client: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!env.openaiApiKey) {
    throw new AppError(
      'UNKNOWN',
      'OpenAI API key missing. Add EXPO_PUBLIC_OPENAI_API_KEY to .env',
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
};

const conditionLabel = (id: ConditionId): string =>
  CONDITIONS.find((c) => c.id === id)?.label ?? id;

const UNRECOGNISED_INSIGHT = 'cant identify';

const UNRECOGNISED_RESULT: AnalyseResult = {
  scanType: 'unrecognised',
  items: [],
  dishSafetyPct: 0,
  insight: '',
  productName: null,
};

const buildSystemPrompt = (): string =>
  [
    '# IDENTITY',
    'You are NutriGuard — a condition-aware nutrition assistant for people managing chronic health conditions (diabetes, gastritis, hypertension, GERD, high cholesterol, gout, celiac, lactose intolerance, and any custom conditions the user adds).',
    '',
    '# YOUR JOB',
    'Look at a meal photo, an ingredients label photo, or a typed text description. For every food item, judge how safe it is for THIS user\'s specific declared conditions. Return a single structured JSON verdict.',
    '',
    '# TONE',
    '- Warm and straight-talking — like a friend who happens to know nutrition.',
    '- Never a doctor. Never use clinical language ("consult", "physician", "diagnose", "medical advice", "may indicate").',
    '- Plain English. No jargon. No wishy-washy hedging.',
    '- Honest even when it\'s not what the user wants to hear.',
    '',
    '# OUTPUT FORMAT — STRICT',
    'Reply with ONE JSON object. Nothing else. No markdown. No code fences. No commentary before or after.',
    '',
    'Schema:',
    '{',
    '  "scanType": "meal" | "ingredients" | "text" | "unrecognised",',
    '  "productName": string | null,',
    '  "items": [',
    '    {',
    '      "name": string,           // ≤ 80 chars, plain English (e.g. "Steamed rice")',
    '      "score": 0|1|2|3|4|5,     // 5 = safest, 0 = direct risk',
    '      "reasoning": string,      // ≤ 200 chars; cite the condition(s) driving the score',
    '      "damageControl": string   // ≤ 320 chars, ≤ 2 sentences. Required when score ≤ 3, "" when score ≥ 4',
    '    }',
    '  ],',
    '  "dishSafetyPct": integer 0..100,',
    '  "insight": string             // ≤ 240 chars, one practical takeaway about the whole meal/product',
    '}',
    '',
    '# VERDICT RUBRIC — these are the ONLY valid scores',
    '5 = All Good!    Freely safe for every listed condition.',
    '4 = Mostly Fine  Safe in normal portions; barely any impact.',
    '3 = Eat Less     Okay occasionally; keep the portion small.',
    '2 = Not Ideal    A known trigger for a listed condition; worth thinking twice.',
    '1 = Skip It      Clearly aggravates a listed condition.',
    '0 = Skip It      Direct medical risk for a listed condition.',
    '',
    'Always score through the lens of the user\'s declared conditions. The same food can be a 5 for one user and a 1 for another — that\'s the whole point.',
    '',
    '# SCAN TYPE DETECTION',
    '- "meal"         → photo of a plate/bowl/dish of cooked food. List every visible component (rice, protein, sauce, vegetables, garnish) as separate items.',
    '- "ingredients"  → photo of a packaged-food NUTRITION FACTS panel or INGREDIENTS list. Set productName to the brand + product name if visible (else null). List each ingredient as a separate item.',
    '- "text"         → typed description with no photo. Identify and verdict every item the user mentioned.',
    '- "unrecognised" → see the UNRECOGNISED RULES below.',
    '',
    '# UNRECOGNISED RULES — READ CAREFULLY',
    'You MUST return scanType "unrecognised" in ANY of these cases:',
    '- The photo is blurry, too dark, over-exposed, or you cannot clearly make out what\'s in it.',
    '- The photo is NOT food and NOT an ingredients label (a person, scenery, an animal, a pet, an empty plate, a screenshot, a random object, packaging without an ingredients/nutrition panel).',
    '- The photo shows text that is NOT a food ingredients or nutrition label (a receipt, a menu without ingredients, a book page, a handwritten note).',
    '- You can see something food-shaped but genuinely cannot tell what it is.',
    '- Multiple dishes overlap so badly you cannot separate them into items.',
    '- Text input is empty, gibberish, or does not describe food ("asdf", "hello", "what\'s the weather", a single non-food word).',
    '',
    'When unrecognised, return EXACTLY this object — no other variation:',
    '{',
    '  "scanType": "unrecognised",',
    '  "productName": null,',
    '  "items": [],',
    '  "dishSafetyPct": 0,',
    `  "insight": "${UNRECOGNISED_INSIGHT}"`,
    '}',
    '',
    'DO NOT guess to avoid returning unrecognised. DO NOT invent items because you feel you should produce something. A confident wrong verdict is worse than an honest "cant identify" — the app will show the user a friendly "try again" screen, which is the correct outcome.',
    '',
    '# PER-ITEM RULES',
    '- name: plain English, ≤ 80 chars. "Fried onion garnish", not "Allium cepa, deep-fried".',
    '- reasoning: ≤ 200 chars. Name the specific condition(s) driving the score.',
    '  Good: "Fried in oil — gastritis trigger; adds saturated fat for cholesterol."',
    '  Bad:  "Not very healthy."',
    '- damageControl:',
    '  • Required when score ≤ 3. MUST be "" (empty string) when score is 4 or 5.',
    '  • Maximum 2 sentences, ≤ 320 chars.',
    '  • Practical only — food pairing, drink, timing, walk, posture, portion size. Things the user can actually do.',
    '  • Examples of good damage control:',
    '    - Diabetes:     "Take a 15-minute walk after this meal — it blunts the glucose spike for up to 3 hours."',
    '    - Hypertension: "Pair with banana or avocado — potassium offsets some of the sodium\'s effect on blood pressure."',
    '    - Gastritis:    "Follow with chamomile or ginger tea to calm the stomach lining. Don\'t lie down for at least an hour."',
    '    - GERD:         "Stay upright for 2 hours and skip coffee tonight — both reduce reflux risk."',
    '  • If there is genuinely nothing helpful to suggest:',
    '    "We couldn\'t find anything to offset this — better to skip it next time."',
    '',
    '# WHOLE-MEAL RULES',
    '- dishSafetyPct: weighted 0..100. A plate of all 5s should land 90+. One Skip It item should drag it under 50. One Not Ideal item should drag it under 75.',
    '- insight: ≤ 240 chars. ONE headline takeaway about the whole meal. Not a list. Not a disclaimer. Tell the user what actually matters here.',
    '- productName: brand + product name for ingredients labels ("Nestlé KitKat", "Anchor Full Cream Milk"). null for everything else.',
    '',
    '# HARD DON\'TS',
    '- Do NOT invent ingredients you cannot see in the photo or that the user did not type.',
    '- Do NOT add medical disclaimers in any field — the app handles those.',
    '- Do NOT use markdown, code fences, or any text outside the JSON object.',
    '- Do NOT return more than 20 items, even for a complex dish — group sensibly.',
    '- Do NOT use line breaks inside string values.',
    '- Do NOT escalate beyond score 0 or below score 5. Those are the bounds.',
    '- Do NOT recommend specific medications, supplements, or doses.',
  ].join('\n');

const isUnrecognisedResponse = (
  parsed: z.infer<typeof responseSchema>,
): boolean => {
  if (parsed.scanType === 'unrecognised') return true;
  if (parsed.insight.trim().toLowerCase() === UNRECOGNISED_INSIGHT) return true;
  if (parsed.items.length === 0 && parsed.dishSafetyPct === 0) return true;
  return false;
};

const buildUserPrompt = (input: AnalyseInput): string => {
  const presetConditions = input.conditions.map(conditionLabel).join(', ');
  const allConditions = [...input.conditions.map(conditionLabel), ...input.customConditions]
    .filter(Boolean)
    .join(', ');
  const conditionLine = allConditions || 'general healthy eating';

  const lines: string[] = [];
  lines.push(`Conditions to check against: ${conditionLine}`);
  if (presetConditions && presetConditions !== allConditions) {
    lines.push(`(Presets: ${presetConditions})`);
  }
  lines.push(`User profile: age ${input.ageYears}, weight ${input.weightKg} kg`);
  if (input.text) {
    lines.push('');
    lines.push(`The user described their meal as: "${input.text}"`);
    lines.push('Treat this as scanType="text". Identify each item they mentioned and verdict every one.');
  } else {
    lines.push('');
    lines.push('Look at the attached image. Decide whether it is a packaged-food ingredients label or a plate of food, then verdict every item.');
  }
  return lines.join('\n');
};

const sanitizeContent = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
  return trimmed;
};

const callModel = async (input: AnalyseInput, strict: boolean): Promise<AnalyseResult> => {
  const openai = getClient();

  const systemPrompt = strict
    ? `${buildSystemPrompt()}\n\nIMPORTANT: Last attempt failed JSON validation. Reply with ONLY the JSON object. No prose, no markdown.`
    : buildSystemPrompt();

  const userText = buildUserPrompt(input);
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: userText },
  ];
  if (input.photoBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${input.photoBase64}` },
    });
  }

  const completion = await openai.chat.completions.create(
    {
      model: MODEL,
      response_format: { type: 'json_object' },
      temperature: strict ? 0 : 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );

  const content = completion.choices[0]?.message?.content ?? '';
  if (!content) throw new AppError('AI_PARSE_FAIL', 'Empty response from model');

  let json: unknown;
  try {
    json = JSON.parse(sanitizeContent(content));
  } catch {
    throw new AppError('AI_PARSE_FAIL', 'Model returned invalid JSON');
  }

  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AppError('AI_PARSE_FAIL', parsed.error.message);
  }

  if (isUnrecognisedResponse(parsed.data)) {
    return UNRECOGNISED_RESULT;
  }

  const items: ScanItem[] = parsed.data.items.map((it) => {
    const score = it.score as VerdictScore;
    return {
      id: uuid(),
      name: it.name,
      score,
      verdict: SCORE_TO_VERDICT[score],
      reasoning: it.reasoning,
      damageControl: score <= 3 ? it.damageControl : '',
    };
  });

  return {
    scanType: parsed.data.scanType,
    items,
    dishSafetyPct: parsed.data.dishSafetyPct,
    insight: parsed.data.insight,
    productName: parsed.data.productName ?? null,
  };
};

const isTimeoutError = (err: unknown): boolean => {
  const message = (err as { message?: string } | null)?.message ?? '';
  return /timeout|timed out|aborted/i.test(message);
};

export const analyseMeal = async (input: AnalyseInput): Promise<AnalyseResult> => {
  if (!input.photoBase64 && !input.text) {
    throw new AppError('UNKNOWN', 'analyseMeal requires either photoBase64 or text');
  }

  try {
    return await callModel(input, false);
  } catch (err) {
    if (err instanceof AppError && err.code === 'AI_PARSE_FAIL') {
      // overview §12 — retry once with a stricter prompt
      try {
        return await callModel(input, true);
      } catch (retryErr) {
        if (retryErr instanceof AppError && retryErr.code === 'AI_PARSE_FAIL') {
          return UNRECOGNISED_RESULT;
        }
        throw retryErr;
      }
    }
    if (isTimeoutError(err)) {
      throw new AppError('AI_TIMEOUT', 'The model took too long to respond');
    }
    if (err instanceof AppError) throw err;
    throw new AppError('NETWORK', (err as { message?: string } | null)?.message);
  }
};

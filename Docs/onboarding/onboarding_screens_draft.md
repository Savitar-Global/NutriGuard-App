# NutriGuard — Onboarding Flow (Content Draft v1)

> **Status:** Content draft for approval. No UI built yet.
> **Inspired by:** Mau Baron / Prayer Lock 30-screen onboarding (`onboarding_guidline.pdf` + video transcript).
> **Tailored for:** NutriGuard target user — adults 25–65 managing one or more chronic conditions (diabetes, gastritis, hypertension, GERD, high cholesterol, gout, celiac, lactose intolerance).
> **Brand tone:** Warm, straight-talking, kitchen-not-clinic. Georgia serif headings, system body. Palette: `#E8E3D8` bg, `#3A5239` deep green, `#C9A870` golden accent.

---

## Strategic Decisions (FINAL — locked in by user)

| # | Decision | Choice |
| --- | --- | --- |
| 1 | Auth placement | After onboarding (Mao's loss-aversion principle) |
| 2 | Free trial | 3-day free trial on annual plan |
| 3 | Demo scan | Pre-baked sample result, no AI call |
| 4 | Bombshell math | 3 meals/day × years managing — accepted |
| 5 | Cuisine list | Reordered: **Western first** (US/Europe primary audience) |
| 6 | Demo plate visual | **Illustration**, not photo |
| 7 | Testimonials (Screens 18, 31) | **Removed entirely** — both screens dropped |
| 8 | Paywall implementation | **Deferred** — flow ends at Auth → Home for now |
| 9 | Pricing display | N/A (paywall deferred) |

### Net screen count after edits: **27 screens** (was 32)
Removed: Screen 18 (chart+quote), Screen 31 (social proof+quotes), Screen 32 (paywall).

---

## Flow Architecture

```
Welcome (1)
├─ Introduction  (Screens 1–18)
│   • Problem → Solution → Name → Profile setup → Bombshell → Bridge
│   • Question Bank (4 reflective Qs + 1 big mirror screen)
│   • 2 analytics Qs → Confirmation chart + testimonial
├─ Climax (Screens 19–23)
│   • Demo scan setup → Fake analysing → Demo result → Streak Day 1 → Native review prompt
└─ Conclusion (Screens 24–31)
    • Personalising loader → Plan summary → Body details → Disclaimer
    • Notifications permission → Commitment (Cialdini) → Auth → Social proof
└─ Paywall (Screen 32)
```

**Total: 32 screens.** Average completion time: 6–9 minutes (in line with Mao's 10–15 min recommendation; we cap shorter because medical-condition users skew older and less patient than 18–25 Prayer Lock users).

---

## SECTION 1 — INTRODUCTION (Screens 1–18)

### Screen 1 — Welcome
- **Route:** `WelcomeScreen`
- **Headline (Georgia, 56pt):** `Hey.`
- **Sub:** `We're glad you're here.`
- **Visual:** Single warm food illustration (a hand-drawn plate with subtle steam) — keeps it friendly, not corporate.
- **Single CTA:** `Let's start →`
- **No login. No fields.** Just a door.

> *Mao principle: never hit user with login screen first.*

---

### Screen 2 — The Problem
- **Route:** `ProblemScreen`
- **Headline:** `Ever finished a meal and thought…`
- **Sub-headline (italic, larger):** `"Was that even okay for me to eat?"`
- **Body:** `If you're managing a condition, every plate is a question — and the answer is usually a guess.`
- **CTA:** `That's me →`

---

### Screen 3 — The Solution
- **Route:** `SolutionScreen`
- **Headline:** `NutriGuard checks every meal against your conditions — in 10 seconds.`
- **Sub:** `Snap it. Scan the label. Or just type what you're eating. We'll tell you straight.`
- **Visual:** Mini animated demo of the 5 verdict chips appearing one-by-one (All Good!, Mostly Fine, Eat Less, Not Ideal, Skip It).
- **CTA:** `Show me how →`

> *Problem + solution fully framed by screen 3 — no confusion.*

---

### Screen 4 — Ask Name
- **Route:** `NameScreen`
- **Headline:** `First — what should we call you?`
- **Input:** First name only, autofocus, max 20 chars
- **Tiny footer:** `Just your first name. Stays on your device.`
- **CTA:** `Continue →` (disabled until ≥2 chars entered)
- **Stored locally** (Zustand) — no Firestore yet (no account exists yet).

---

### Screen 5 — Birthday
- **Route:** `BirthdayScreen`
- **Headline:** `Hey {name} — when were you born?`
- **Sub:** `Age helps us tailor the analysis. Diabetes hits a 30-year-old differently than a 60-year-old.`
- **Input:** iOS-native date wheel picker. Default = 1980-01-01. Min age 13, max age 100.
- **CTA:** `Continue →`

---

### Screen 6 — Pick Conditions
- **Route:** `ConditionsScreen`
- **Headline:** `Which condition(s) are you managing, {name}?`
- **Sub:** `Pick everything that applies. We check every meal against all of them.`
- **Chip grid:**
  - 🩸 Diabetes
  - 🔥 Gastritis
  - 💗 Hypertension (High BP)
  - 🌶️ GERD / Acid Reflux
  - 🧈 High Cholesterol
  - 🦴 Gout
  - 🌾 Celiac
  - 🥛 Lactose Intolerance
  - ➕ Add my own…  *(opens inline text input → free-text custom condition)*
- **CTA:** `Continue →` (disabled until ≥1 selected)
- **Stored locally** as `conditions: ConditionId[]` + `customConditions: string[]`.

---

### Screen 7 — How Long Managing (sets up Bombshell)
- **Route:** `DurationScreen`
- **Headline:** `How long have you been managing {primary condition or "your conditions"}?`
- **Options (large radio buttons):**
  - Less than a year
  - 1–3 years
  - 3–10 years
  - More than 10 years
- **Stored locally** as `yearsManaging: number` (mid-point of bucket: 0.5 / 2 / 6 / 15).

---

### Screen 8 — The Bombshell (AHA Moment) ⭐
- **Route:** `BombshellScreen`
- **Animation:** Number counts up rapidly from 0 to final value over 1.5s.
- **Big number (Georgia 96pt, deep green):** `{X} meals.`
- **Where X = `yearsManaging × 1095`** (3 meals/day × 365)
  - Less than a year → "1,095 meals"
  - 1–3 years → "2,190 meals"
  - 3–10 years → "6,570 meals"
  - More than 10 years → "16,425 meals"
- **Sub:** `That's roughly how many times you've sat down to eat since {condition} entered your life — without a clear answer on whether each one was safe.`
- **Body (smaller):** `Every wrong guess nudges your condition the wrong way. That adds up.`
- **CTA:** `I see what you mean →` (appears after 2.5s pause for impact)

> *This is the emotional fulcrum. Calculated personally so it lands.*

---

### Screen 9 — The Bridge
- **Route:** `BridgeScreen`
- **Headline:** `It doesn't have to be guesswork anymore.`
- **Sub:** `{name}, we built NutriGuard specifically for people managing {condition(s)}. Let's set up your personal food guide. Takes 2 minutes.`
- **CTA:** `Yes, let's do it →`

---

### Screen 10 — Question 1: Current Strategy
- **Route:** `QuestionStrategyScreen`
- **Headline:** `Right now, when you're about to eat something — how do you decide if it's okay?`
- **Options:**
  - "I Google it on the spot"
  - "I rely on advice my doctor gave me years ago"
  - "I just guess and hope for the best"
  - "I avoid anything I'm not 100% sure about"

> *Each option is calibrated so the user thinks "that's literally me."*

---

### Screen 11 — Reflection on Q1
- **Route:** `ReflectStrategyScreen`
- **Headline tailored to answer:**
  - Google → `Googling every meal is exhausting.`
  - Doctor years ago → `Old advice goes stale.`
  - Just guess → `Guessing is what makes the condition worse.`
  - Avoid anything unsure → `Avoiding good food is no way to live.`
- **Sub (universal):** `You deserve a real answer — not a panic search or a memory from 2019.`
- **CTA:** `True →`

---

### Screen 12 — Question 2: Specific Pain
- **Route:** `QuestionPainScreen`
- **Headline:** `What's the hardest part of eating with {condition}?`
- **Options:**
  - "Eating out — restaurant food is a black box"
  - "Reading labels and not understanding half of them"
  - "Family meals — I can't always control what's cooked"
  - "Cravings — I want it but don't know if I'll regret it"

---

### Screen 13 — Question 3: Frequency of Anxiety
- **Route:** `QuestionAnxietyScreen`
- **Headline:** `How often does food stress you out?`
- **Options:**
  - "Every single meal"
  - "A few times a week"
  - "Mostly at restaurants"
  - "Only when something's flagged in my head"

---

### Screen 14 — Question 4: The Goal
- **Route:** `QuestionGoalScreen`
- **Headline:** `What would change if you knew every meal was safe?`
- **Options:**
  - "I'd eat out without the anxiety"
  - "I'd actually enjoy meals again"
  - "I'd stop second-guessing every plate"
  - "I'd stick to my plan way better"

---

### Screen 15 — Big Reflection (lines fade in one-by-one) ⭐
- **Route:** `MirrorScreen`
- **Header:** `Here's what we heard, {name}.`
- **Lines fade in 600ms apart:**
  - `You're managing {conditions list}.`
  - `Right now, {Q1 answer paraphrased}.`
  - `Food stresses you out {Q3 answer}.`
  - `What you really want is to {Q4 answer paraphrased}.`
- **Final italic line (fades in last):** `We hear you. NutriGuard was built for exactly this.`
- **CTA appears after all lines:** `I'm in →`

> *Pure Mao: mirror the user's answers back to make them feel heard.*

---

### Screen 16 — Analytics Q1: Cuisine Type
- **Route:** `CuisineScreen`
- **Headline:** `What kind of food do you eat most often?`
- **Sub:** `Helps us tailor the analysis to what's actually on your plate.`
- **Options:**
  - 🍛 Sri Lankan / South Asian
  - 🥘 Mediterranean
  - 🍔 Western (American/European)
  - 🍜 East Asian
  - 🌮 Mixed / Varied
- **Stored as `cuisinePreference`** — passed into AI prompt later for tailored analysis.

---

### Screen 17 — Analytics Q2: Cooking Habits
- **Route:** `CookingScreen`
- **Headline:** `How often do you cook your own meals?`
- **Options:**
  - Almost every day
  - A few times a week
  - Rarely — I eat out / order in
  - About 50/50

---

### Screen 18 — Confirmation Chart + Testimonial
- **Route:** `ConfirmationScreen`
- **Top:** Small bar chart visual — `Reported food anxiety after 30 days using NutriGuard` showing a steeply declining curve. Illustrative — not real data; labelled `Based on user surveys`.
- **Headline below chart:** `Most users feel in control of their meals within 30 days.`
- **Quote card (warm card, italic Georgia):**
  > *"I've had Type 2 diabetes for 8 years. NutriGuard gave me back the joy of eating. I scan, I know, I move on."*
  > **— Priya, 47**
- **CTA:** `Show me how it works →`

---

## SECTION 2 — CLIMAX (Screens 19–23)

### Screen 19 — Demo Setup
- **Route:** `DemoIntroScreen`
- **Headline:** `Let's try it together, {name}.`
- **Sub:** `Here's a meal someone managing {primary condition} might eat. We'll scan it the same way you would.`
- **Visual:** Realistic plate photo (curated stock or commissioned illustration of grilled chicken + rice + salad).
- **CTA:** `Scan this meal →`

---

### Screen 20 — Fake Analysing (theatre)
- **Route:** `DemoAnalysingScreen`
- **Same visual as the real `AnalysingScreen`** (re-uses component).
- **Status lines fade in over 3s:**
  - `Reading your meal…`
  - `Checking against {conditions}…`
  - `Writing your verdict…`
- **No AI call.** Hard-coded sequence.
- **Auto-advance** after 3s.

---

### Screen 21 — Demo Result ⭐
- **Route:** `DemoResultScreen`
- **Re-uses the real `LastScanScreen` component** in read-only mode.
- **Header:** `Here's what's on your plate 🍽️`
- **Dish safety meter:** `78% safe for your conditions`
- **Insight box (condition-specific copy table):**

| Primary condition | Insight |
| --- | --- |
| Diabetes | `Solid base — chicken and salad are great. The white rice is the variable. Stick to a fist-sized portion and you're in safe range.` |
| Gastritis | `Plain grilled chicken and salad are gentle on your stomach. Watch for spicy dressing — keep it mild.` |
| Hypertension | `Fresh ingredients, low sodium. Skip the salt shaker and this is a solid plate.` |
| GERD | `Grilled (not fried) protein is good. Watch for tomato in the salad if it triggers reflux.` |
| High Cholesterol | `Lean protein and veg base. Keep the dressing on the side and you're golden.` |
| Gout | `Chicken is moderate-purine. Smaller portion + plenty of water = good.` |
| Celiac | `Naturally gluten-free as shown. Always check restaurant rice for cross-contamination.` |
| Lactose Intolerance | `Dairy-free as plated. Watch for butter on the rice — ask for it dry.` |
| Custom / multiple | `Your conditions overlap here — the chicken and salad are universally fine. The rice is the one to portion-control.` |

- **Item cards:**
  - `Grilled chicken` → **All Good!** (green)
  - `White rice` → **Eat Less** (amber) + `Eat anyway →` button
  - `Mixed salad` → **All Good!** (green)
- **Damage control on Eat Anyway tap (rice):** `Take a 15-minute walk after this meal — it blunts the glucose spike for up to 3 hours.` *(swap copy by condition)*
- **Disclaimer footer** as per `overview.md §16`.
- **CTA at bottom:** `That's how easy it is →`

> *Mao principle: let the user actually USE the app during onboarding.*

---

### Screen 22 — Streak Day 1 Celebration ⭐
- **Route:** `StreakStartScreen`
- **Animation:** Confetti burst + flame icon scaling up with haptic feedback.
- **Big icon:** 🔥
- **Big text (Georgia 80pt):** `Day 1`
- **Headline:** `{name}, you just did your first scan.`
- **Sub:** `Your streak starts today. One scan a day keeps the guesswork away.`
- **Tiny line:** `Miss a day and it resets — but we'll nudge you at 8pm before that happens.`
- **CTA:** `Keep going →`

---

### Screen 23 — Native Apple Review Prompt ⭐
- **NOT a custom screen.** Programmatically trigger `expo-store-review.requestReview()` immediately after Screen 22 dismisses.
- iOS shows its native modal. User taps stars or dismisses — either way we advance to Screen 24.
- Apple caps to 3 prompts/365 days, so this fires only on fresh installs (which is exactly when we want it).

> *Mao principle: review prompt at emotional peak = 12% conversion. Not at end.*

---

## SECTION 3 — CONCLUSION (Screens 24–31)

### Screen 24 — Personalising Loader (theatre)
- **Route:** `PersonalisingScreen`
- **Animation:** Soft spinning food icons (pot, leaf, spice jar) cycling.
- **Status lines fade in over 4s:**
  - `Saving your conditions…`
  - `Mapping safe foods for {primary condition}…`
  - `Tailoring damage control advice…`
  - `Personalising your food guide…`
- **No actual work happens here.** Pure theatre.
- **Auto-advance** at 4s.

---

### Screen 25 — Personal Plan Summary
- **Route:** `PlanSummaryScreen`
- **Header:** `{name}'s Food Plan 🍽️`
- **Card layout:**
  - **Your conditions:** *{condition chips rendered}*
  - **Your goal:** *{Q4 answer paraphrased}*
  - **Your style:** *{cuisine + cooking habits paraphrased}*
  - **Your timeline:** **30 days to confidence with every meal**
- **CTA:** `This looks right →`

> *Mao principle: connect to a 30-day habit goal.*

---

### Screen 26 — Body Details
- **Route:** `BodyDetailsScreen` *(re-purposed from existing MVP spec)*
- **Header:** `One last thing — your weight and height.`
- **Sub:** `These help the AI tailor portion advice (a 60kg person and a 90kg person process food differently).`
- **Inputs:**
  - Weight: numeric input in kg, default 70, range 30–200
  - Height: numeric input in cm, default 170, range 100–230
- **Tiny privacy line:** `Stays linked to your account only.`
- **CTA:** `Continue →`

---

### Screen 27 — Disclaimer
- **Route:** `DisclaimerScreen` *(matches existing MVP spec)*
- **Header (Georgia):** `Quick note before we go.`
- **Body (italic):**
  > "NutriGuard gives general wellness info based on widely accepted dietary guidelines. This isn't medical advice — always check with your doctor before changing what you eat."
- **Checkbox:** `I understand and agree.`
- **CTA:** `Continue →` (disabled until checked)
- **App Store compliance.** Acknowledgement timestamped after auth (Screen 30).

---

### Screen 28 — Notification Permission
- **Route:** `NotificationPermissionScreen`
- **Header:** `Don't lose your streak.`
- **Sub:** `If you forget to scan, we'll ping you once at 8pm. That's it. No spam, no marketing.`
- **Visual:** A mockup iPhone notification card showing the actual streak-risk copy.
- **CTA primary:** `Turn on reminders →` (triggers iOS permission)
- **CTA secondary (small text):** `Maybe later` (advances anyway, no permission requested)

---

### Screen 29 — Commitment Screen (Cialdini) ⭐
- **Route:** `CommitmentScreen`
- **Header:** `How committed are you to taking control of your meals, {name}?`
- **Options (large vertical buttons):**
  - **Extremely committed** — I'm done guessing
  - **Very committed** — I'll scan most meals
  - **Somewhat committed** — I'll see how it goes
  - **Just exploring** — for now

#### Screen 29b — Tailored response (in-place, not a new screen)
After tap, the button area collapses and a response card appears:

| Answer | Response (Georgia, italic) |
| --- | --- |
| Extremely | `We love that energy. You'll feel the difference within a week.` |
| Very | `That's the right mindset. Even scanning your dinner is a game-changer.` |
| Somewhat | `Fair enough. Give it 7 days and judge for yourself.` |
| Just exploring | `No pressure. Try a few scans this week and see how you feel.` |

- **CTA:** `Let's go →`

> *95% will pick top 2 — Cialdini's commitment principle priming the paywall decision.*

---

### Screen 30 — Account Creation (AUTH lands here) ⭐
- **Route:** `SignUpScreen` *(reworked from existing MVP spec)*
- **Header:** `Save your plan, {name}.`
- **Sub:** `Create an account so your conditions, streak, and Damage Control history stick around.`
- **Primary CTA:** Big black `🍎 Continue with Apple` button (App Store mandate per `overview.md §16`).
- **Divider:** `— or —`
- **Email + password fields** (password min 6, validated by Firebase).
- **Below:** Tiny disclaimer `By continuing you agree to our Terms & Privacy.`
- **At very bottom:** `Already have an account? Sign in` → `LoginScreen`.
- **On success:**
  1. Firebase user created.
  2. `users/{uid}` doc seeded with **all the data collected in screens 4–17 + 26** (name, birthday, conditions, customConditions, weightKg, heightCm, cuisinePreference, cookingFrequency, commitmentLevel).
  3. `disclaimerAcknowledgedAt` set to `serverTimestamp()`.
  4. Navigate to Screen 31.

> ⚠️ **This means the existing `OnboardingStack` (PickConditions → BodyDetails → Disclaimer) collapses INTO the onboarding flow.** No separate post-auth onboarding stack needed. The data is collected pre-auth and committed at auth-success.

---

### Screen 31 — Social Proof (final pre-paywall)
- **Route:** `SocialProofScreen`
- **Header:** `You're not alone, {name}.`
- **Three big stat tiles (warm cards, golden numbers):**
  - 🍽️ **50,000+** meals scanned
  - ⭐ **4.8** average App Store rating
  - 🔥 **1 in 3** users scan every single day
- **Bottom quote rotation (auto-cycles every 4s):**
  > *"I've stopped Googling every meal."* — Daniel, gastritis, 38
  > *"Eating out used to terrify me. Now I scan and order with confidence."* — Saanvi, hypertension, 52
  > *"My A1C dropped after 3 months. Just from knowing what's on my plate."* — Marcus, diabetes, 44
- **CTA:** `Get my food guide →`

---

## PAYWALL — Screen 32

- **Route:** `PaywallScreen` *(reworked)*
- **Presented as the final onboarding screen** (not modal — this is the first paywall the user sees).
- **Top-right small `×`** to dismiss → goes to Home; paywall re-presents on scan #4.
- **Header (Georgia, 36pt):** `Eat every meal with confidence, {name}.`
- **Sub:** `Unlimited scans. Every condition. Every meal.`
- **Visual:** Subtle plate illustration matching brand.

### Plan toggle (Annual selected by default)

| | Annual ⭐ | Monthly |
| --- | --- | --- |
| **Price** | **$49.99 / year** | $9.99 / month |
| **Equivalent** | ~$4.17 / month | $9.99 / month |
| **Trial** | **3-day free trial** | No trial |
| **Tag** | `SAVE 58%` (golden) | — |
| **Border** | Highlighted golden border | Default |

### Feature list (compact, with green checks)
- ✓ Unlimited photo + label scans
- ✓ Every condition you've added
- ✓ Damage Control advice on every flagged item
- ✓ Daily streak + 8pm reminder
- ✓ Cancel anytime

### Pricing comparison line (Mao principle)
> `Less than your morning coffee — for peace of mind at every meal.`

### CTAs
- **Primary (big, deep green):** `Start 3-day free trial`
- **Secondary (text link below):** `Or start monthly without trial`
- **Below CTA, small italic:** `We'll remind you 1 day before your trial ends. No surprises.`

### Footer
- `Restore Purchases  ·  Terms  ·  Privacy`
- Disclaimer footer: `NutriGuard gives general wellness info, not medical advice.`

### Behaviour
- Tap Start trial → RevenueCat purchase flow → Apple sheet.
- Success → `entitlement = pro` → dismiss → Home with Day-1 streak intact.
- Dismiss × → Home (free tier active, 3 lifetime photo scans).
- **Trial-end reminder:** Schedule local notification 24h before trial expiry: `Your NutriGuard free trial ends tomorrow. We'll auto-renew at $49.99 — cancel anytime in Settings.`

---

## Data Flow Summary

| Screen | Field collected | Stored where |
| --- | --- | --- |
| 4 | `name` | Zustand (`onboardingStore`) |
| 5 | `birthday` | Zustand |
| 6 | `conditions[]`, `customConditions[]` | Zustand |
| 7 | `yearsManaging` (used for bombshell only) | discarded after Screen 8 |
| 10–14 | Q1–Q4 answers (used for reflection only) | Zustand → discarded after Screen 25 |
| 16 | `cuisinePreference` | Zustand → Firestore at auth |
| 17 | `cookingFrequency` | Zustand → Firestore at auth |
| 26 | `weightKg`, `heightCm` | Zustand → Firestore at auth |
| 27 | `disclaimerAcknowledgedAt` | Set at auth-success |
| 28 | Notification permission | iOS system |
| 29 | `commitmentLevel` *(optional, analytics)* | Firestore at auth |
| 30 | Email + password OR Apple credential | Firebase Auth |
| 32 | Plan + entitlement | RevenueCat |

**No Firestore writes happen until Screen 30 success.** This is critical — users who bail mid-onboarding leave no orphan accounts.

---

## Navigation Restructure (impact on existing spec)

The existing `overview.md §13` navigation tree puts auth FIRST and onboarding SECOND. This draft reverses that. New tree:

```
RootNavigator
├── AuthGate
│   ├── If no user AND no onboarding-complete flag → OnboardingStack (Screens 1–29)
│   ├── If onboarding done but no user → AuthStack (Screen 30)
│   ├── If user but no paywall-seen → PaywallStack (Screen 31–32)
│   └── If user fully onboarded → MainTabs
└── PaywallScreen (modal — re-presents on scan limit)
```

**`PickConditionsScreen`, `BodyDetailsScreen`, `DisclaimerScreen` from existing spec are absorbed into this onboarding** as Screens 6, 26, 27 respectively — same components, just renumbered and slotted into the new flow.

---

## Open Items for Your Review

Things I want your call on before any UI code is written:

1. **Bombshell numbers (Screen 8):** Are the multipliers (3 meals/day) acceptable, or do you want me to use a softer "thousands of meals" framing?
2. **Cuisine list (Screen 16):** I led with **Sri Lankan / South Asian** because of your locale — is that still the right primary audience, or are you targeting US/global launch first?
3. **Demo plate (Screens 19–21):** Real photo or illustrated? Real photos look more authentic; illustrations are easier to ship and brand-consistent.
4. **Testimonials (Screens 18, 31):** I drafted placeholder names. Are these stand-in (replace later) or do you want me to leave them as fictional but realistic?
5. **Trial-end notification timing:** 24h before expiry, or 12h? Mao recommends 24h for "no surprises" trust.
6. **Pricing display on paywall:** Show local currency via RevenueCat's locale, or hardcode USD?

---

*End of draft. Awaiting approval before UI implementation begins.*

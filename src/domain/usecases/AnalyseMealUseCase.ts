import { analyseMeal as analyseMealService } from '@/data/services/openai';
import { readScanPhotoBase64 } from '@/data/services/photoStorage';
import type { ConditionId } from '@/domain/entities/Condition';
import type { Scan } from '@/domain/entities/Scan';
import { AppError } from '@/types/global';

export interface AnalyseMealInput {
  photoUri?: string;
  text?: string;
  conditions: ConditionId[];
  customConditions: string[];
  ageYears: number;
  weightKg: number;
}

export const analyseMealUseCase = async (
  input: AnalyseMealInput,
): Promise<Scan> => {
  if (!input.photoUri && !input.text) {
    throw new AppError('UNKNOWN', 'Provide a photo or text to analyse');
  }

  const photoBase64 = input.photoUri
    ? await readScanPhotoBase64(input.photoUri)
    : undefined;

  const result = await analyseMealService({
    photoBase64,
    text: input.text,
    conditions: input.conditions,
    customConditions: input.customConditions,
    ageYears: input.ageYears,
    weightKg: input.weightKg,
  });

  return {
    scanType: result.scanType,
    inputText: input.text ?? null,
    photoLocalUri: input.photoUri ?? null,
    productName: result.productName,
    items: result.items,
    dishSafetyPct: result.dishSafetyPct,
    insight: result.insight,
    damageControlVisited: [],
    createdAt: new Date(),
  };
};

export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export const kgToLb = (kg: number): number => kg / KG_PER_LB;
export const lbToKg = (lb: number): number => lb * KG_PER_LB;

export const cmToIn = (cm: number): number => cm / CM_PER_IN;
export const inToCm = (inches: number): number => inches * CM_PER_IN;

export interface FtIn {
  ft: number;
  in: number;
}

export const cmToFtIn = (cm: number): FtIn => {
  if (cm <= 0) return { ft: 0, in: 0 };
  const totalIn = Math.round(cmToIn(cm));
  const ft = Math.floor(totalIn / 12);
  const inches = totalIn - ft * 12;
  return { ft, in: inches };
};

export const ftInToCm = (ft: number, inches: number): number =>
  Math.round(inToCm(ft * 12 + inches));

export interface DisplayValue {
  text: string;
  unit: string;
}

export const formatWeight = (kg: number, unit: WeightUnit): DisplayValue => {
  if (kg <= 0) return { text: '', unit: unit };
  if (unit === 'kg') return { text: String(Math.round(kg)), unit: 'kg' };
  return { text: String(Math.round(kgToLb(kg))), unit: 'lb' };
};

export const formatHeight = (cm: number, unit: HeightUnit): DisplayValue => {
  if (cm <= 0) return { text: '', unit: unit === 'cm' ? 'cm' : 'ft' };
  if (unit === 'cm') return { text: String(Math.round(cm)), unit: 'cm' };
  const { ft, in: inches } = cmToFtIn(cm);
  return { text: `${ft}′${inches}″`, unit: '' };
};

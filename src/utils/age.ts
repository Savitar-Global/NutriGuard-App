export const AGE_LIMITS = { min: 1, max: 120 } as const;

export const calculateAge = (birthday: Date, now: Date = new Date()): number => {
  let age = now.getFullYear() - birthday.getFullYear();
  const monthDiff = now.getMonth() - birthday.getMonth();
  const dayBeforeBirthday =
    monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthday.getDate());
  if (dayBeforeBirthday) age -= 1;
  return age;
};

export const ageToBirthday = (age: number, current?: Date | null): Date => {
  const now = new Date();
  const ref =
    current && current.getTime() > 0
      ? new Date(current)
      : new Date(now.getFullYear(), 0, 1);
  ref.setFullYear(now.getFullYear() - age);
  return ref;
};

export const hasValidBirthday = (birthday: Date | null | undefined): boolean =>
  !!birthday && birthday.getTime() > 0 && calculateAge(birthday) >= AGE_LIMITS.min;

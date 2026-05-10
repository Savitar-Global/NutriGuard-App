export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 52,

  // Semantic — used for layout consistency across screens
  fieldGap: 11, // vertical gap between stacked form fields
  fieldPaddingX: 12,
  fieldPaddingY: 8,
  screenPaddingX: 24,
  screenPaddingY: 16,
  buttonPaddingY: 14,
  buttonPaddingX: 16,
  hitSlop: 8,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 24,
  pill: 50,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;

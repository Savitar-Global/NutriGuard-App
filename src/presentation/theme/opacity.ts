export const opacity = {
  pressed: 0.85,
  pressedSoft: 0.7,
  pressedSubtle: 0.6,
  disabled: 0.5,
} as const;

export type Opacity = typeof opacity;

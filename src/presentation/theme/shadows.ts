import type { ViewStyle } from 'react-native';

import { colors } from './colors';

const make = (style: ViewStyle): ViewStyle => style;

export const shadows = {
  none: make({}),

  sm: make({
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  }),

  md: make({
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  }),

  lg: make({
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  }),
} as const;

export type Shadows = typeof shadows;

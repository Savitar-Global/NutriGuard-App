import Svg, { Path } from 'react-native-svg';

import { colors } from '@/presentation/theme';

interface PencilIconProps {
  size?: number;
  color?: string;
}

export function PencilIcon({ size = 14, color = colors.primary }: PencilIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2 12h2.5L11.2 5.3l-2.5-2.5L2 9.5V12z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 3l2 2"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

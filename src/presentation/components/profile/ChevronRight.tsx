import Svg, { Path } from 'react-native-svg';

import { colors, sizes } from '@/presentation/theme';

interface ChevronRightProps {
  color?: string;
}

export function ChevronRight({ color = colors.inkMuted }: ChevronRightProps) {
  return (
    <Svg
      width={sizes.chevronWidth}
      height={sizes.chevronHeight}
      viewBox="0 0 7 12"
    >
      <Path
        d="M1 1l5 5-5 5"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

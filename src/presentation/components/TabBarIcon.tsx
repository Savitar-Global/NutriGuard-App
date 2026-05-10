import Svg, { Circle, Path } from 'react-native-svg';

import { sizes } from '@/presentation/theme';

export type TabIconName = 'home' | 'last-scan' | 'profile';

interface TabBarIconProps {
  name: TabIconName;
  color: string;
}

const STROKE_WIDTH = 1.5;

export function TabBarIcon({ name, color }: TabBarIconProps) {
  const size = sizes.tabIcon;

  if (name === 'home') {
    return (
      <Svg width={size} height={(size * 16) / 18} viewBox="0 0 18 16">
        <Path
          d="M9 1L1 7v8h5v-5h6v5h5V7Z"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'last-scan') {
    return (
      <Svg width={size} height={(size * 16) / 18} viewBox="0 0 18 16">
        <Circle
          cx={9}
          cy={8}
          r={6}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Path
          d="M9 5v3l2.5 1.5"
          stroke={color}
          strokeWidth={1.3}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle
        cx={8}
        cy={5.5}
        r={3.5}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      <Path
        d="M1.5 15c0-3.6 2.9-6.5 6.5-6.5S14.5 11.4 14.5 15"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

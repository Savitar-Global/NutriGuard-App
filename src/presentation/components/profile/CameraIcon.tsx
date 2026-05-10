import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/presentation/theme';

interface CameraIconProps {
  size?: number;
  color?: string;
}

export function CameraIcon({
  size = 12,
  color = colors.primaryContrast,
}: CameraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3 5h2.2L6.4 3.6h3.2L10.8 5H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="8" cy="9" r="2.4" stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

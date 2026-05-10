import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'camera'
  | 'gallery'
  | 'keyboard'
  | 'dish'
  | 'tag'
  | 'leaf'
  | 'bulb'
  | 'question'
  | 'check';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color, strokeWidth = 1.6 }: IconProps) {
  switch (name) {
    case 'camera':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 8h3.2L9 5.5h6L16.8 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Circle
            cx={12}
            cy={13.5}
            r={3.5}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Svg>
      );

    case 'gallery':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x={3}
            y={5}
            width={18}
            height={14}
            rx={2}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle cx={9} cy={10} r={1.6} fill={color} />
          <Path
            d="M3 17l5.2-5.2 4 4 3-3L21 17"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'keyboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x={2.5}
            y={6}
            width={19}
            height={12}
            rx={2}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 13.5h.01M9 13.5h.01M18 13.5h.01M8 16.5h8"
            stroke={color}
            strokeWidth={strokeWidth + 0.3}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'dish':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={9}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={12}
            cy={12}
            r={5.5}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Svg>
      );

    case 'tag':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 11.5V4.5A1.5 1.5 0 0 1 4.5 3h7l9 9-7 7-9-9Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Circle cx={7.7} cy={7.7} r={1.4} fill={color} />
        </Svg>
      );

    case 'leaf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 4c0 9-6 16-15 16 0-7 6-13 15-15Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Path
            d="M5 20l8.5-8.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'bulb':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 17h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'question':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={9}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.6-2.5 1.9-2.5 3.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Circle cx={12} cy={17} r={1} fill={color} />
        </Svg>
      );

    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12.5l4 4 10-10"
            stroke={color}
            strokeWidth={strokeWidth + 0.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

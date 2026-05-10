import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type TextStyle } from 'react-native';

interface FadeInLinesProps {
  lines: ReadonlyArray<string>;
  intervalMs?: number;
  startDelayMs?: number;
  textStyle?: TextStyle;
  italicLastLine?: boolean;
  onComplete?: () => void;
}

export function FadeInLines({
  lines,
  intervalMs = 700,
  startDelayMs = 250,
  textStyle,
  italicLastLine = false,
  onComplete,
}: FadeInLinesProps) {
  const opacities = useRef(lines.map(() => new Animated.Value(0))).current;
  const translates = useRef(lines.map(() => new Animated.Value(8))).current;

  useEffect(() => {
    const animations = lines.map((_, i) =>
      Animated.parallel([
        Animated.timing(opacities[i]!, {
          toValue: 1,
          duration: 400,
          delay: startDelayMs + i * intervalMs,
          useNativeDriver: true,
        }),
        Animated.timing(translates[i]!, {
          toValue: 0,
          duration: 400,
          delay: startDelayMs + i * intervalMs,
          useNativeDriver: true,
        }),
      ]),
    );
    Animated.parallel(animations).start(({ finished }) => {
      if (finished) onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  return (
    <View style={styles.wrap}>
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        return (
          <Animated.Text
            key={`${i}-${line}`}
            style={[
              styles.line,
              textStyle,
              isLast && italicLastLine && styles.italic,
              {
                opacity: opacities[i],
                transform: [{ translateY: translates[i]! }],
              },
            ]}
          >
            {line}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  line: { fontSize: 18, lineHeight: 26 },
  italic: { fontStyle: 'italic' },
});

// Re-export Text so consumers can keep imports tidy if needed
export const _MeasurementLine = Text;

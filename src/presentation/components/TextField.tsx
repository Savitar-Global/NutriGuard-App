import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import {
  colors,
  radius,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  secure?: boolean;
}

export function TextField({
  label,
  secure = false,
  ...inputProps
}: TextFieldProps) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          {...inputProps}
          style={styles.input}
          secureTextEntry={hidden}
          placeholderTextColor={colors.inkMuted}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.fieldGap },
  label: { ...typography.inputLabel, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.borderInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.fieldPaddingX,
    minHeight: sizes.inputHeight,
    ...shadows.sm,
  },
  fieldFocused: {
    borderColor: colors.primary,
    borderWidth: sizes.borderInputFocused,
    ...shadows.md,
  },
  input: {
    flex: 1,
    ...typography.inputText,
    paddingVertical: spacing.fieldPaddingY,
  },
  toggle: {
    ...typography.toggleAction,
    paddingLeft: spacing.sm,
  },
});

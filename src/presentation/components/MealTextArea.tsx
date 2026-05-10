import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import {
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface MealTextAreaProps
  extends Omit<TextInputProps, 'style' | 'multiline'> {
  value: string;
  onChangeText: (text: string) => void;
}

export function MealTextArea({
  value,
  onChangeText,
  placeholder,
  ...inputProps
}: MealTextAreaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <TextInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        multiline
        textAlignVertical="top"
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.borderInput,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: sizes.textAreaMinHeight,
  },
  fieldFocused: {
    borderColor: colors.primary,
    borderWidth: sizes.borderInputFocused,
  },
  input: {
    flex: 1,
    ...typography.inputText,
    lineHeight: 18,
    padding: 0,
  },
});

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/presentation/components/BackButton';
import { ExampleChip } from '@/presentation/components/ExampleChip';
import { MealTextArea } from '@/presentation/components/MealTextArea';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import {
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface TypeItInScreenProps {
  onBack: () => void;
  onSubmit: (text: string) => void;
}

const PLACEHOLDER =
  'Grilled chicken with mashed potato, steamed broccoli and a side of white rice...';

const EXAMPLES = [
  'Rice & chicken curry',
  'Idli with sambar',
  'Oats with banana',
];

export function TypeItInScreen({ onBack, onSubmit }: TypeItInScreenProps) {
  const [text, setText] = useState('');

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />

      <SafeAreaView style={styles.drawer} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <BackButton onPress={onBack} variant="circle" label={null} />
          </View>

          <View style={styles.header}>
            <Text style={styles.alwaysFree}>Always free</Text>
            <Text style={styles.h1}>What are{'\n'}you eating?</Text>
            <Text style={styles.lead}>
              Type your meal and we'll check every item against your conditions
              — same result as a photo scan.
            </Text>
          </View>

          <View style={styles.inputWrap}>
            <MealTextArea
              value={text}
              onChangeText={setText}
              placeholder={PLACEHOLDER}
              autoFocus
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.examplesBlock}>
            <Text style={styles.tryLabel}>Try an example</Text>
            <View style={styles.chipsRow}>
              {EXAMPLES.map((example) => (
                <ExampleChip
                  key={example}
                  label={`"${example}"`}
                  onPress={() => setText(example)}
                />
              ))}
            </View>
          </View>
          <View style={styles.spacer} />

          <PrimaryButton
            label="Check my meal →"
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  backdrop: { flex: sizes.drawerFlexBackdrop },
  drawer: {
    flex: sizes.drawerFlexSheet,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  topBar: { marginBottom: spacing.md },
  header: { marginBottom: spacing.md },
  alwaysFree: {
    ...typography.label,
    marginBottom: spacing.xs + 2,
  },
  h1: {
    ...typography.h1,
    marginBottom: spacing.xs + 2,
  },
  lead: typography.bodyMd,
  inputWrap: {
    height: sizes.drawerInputHeight,
    marginTop: spacing.md,
  },
  spacer: { flex: 1 },
  examplesBlock: {
    marginBottom: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  tryLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

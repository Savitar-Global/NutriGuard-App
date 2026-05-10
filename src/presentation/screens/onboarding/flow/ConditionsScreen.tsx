import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CONDITIONS } from '@/config/constants';
import type { ConditionId } from '@/domain/entities/Condition';
import { ConditionChip } from '@/presentation/components/ConditionChip';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

const MAX_CUSTOM_LENGTH = 40;

const sameAsCondition = (input: string, label: string) =>
  input.trim().toLowerCase() === label.trim().toLowerCase();

export function ConditionsScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.answers.name);
  const initialPresets = useOnboardingStore((s) => s.answers.conditions);
  const initialCustoms = useOnboardingStore((s) => s.answers.customConditions);
  const patch = useOnboardingStore((s) => s.patch);

  const [selected, setSelected] = useState<Set<ConditionId>>(
    () => new Set(initialPresets),
  );
  const [customs, setCustoms] = useState<string[]>(initialCustoms);
  const [draft, setDraft] = useState('');

  const trimmedDraft = draft.trim();
  const draftIsDuplicate = useMemo(() => {
    if (!trimmedDraft) return false;
    const lower = trimmedDraft.toLowerCase();
    if (customs.some((c) => c.toLowerCase() === lower)) return true;
    return CONDITIONS.some((c) => sameAsCondition(trimmedDraft, c.label));
  }, [trimmedDraft, customs]);
  const canAddCustom = trimmedDraft.length > 0 && !draftIsDuplicate;

  const totalConditions = selected.size + customs.length;
  const canContinue = totalConditions > 0;

  const togglePreset = (id: ConditionId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustom = () => {
    if (!canAddCustom) return;
    setCustoms((prev) => [...prev, trimmedDraft]);
    setDraft('');
  };

  const removeCustom = (value: string) => {
    setCustoms((prev) => prev.filter((c) => c !== value));
  };

  const onContinue = () => {
    if (!canContinue) return;
    patch({
      conditions: Array.from(selected),
      customConditions: customs,
    });
    goNext();
  };

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="Continue →"
          onPrimary={onContinue}
          primaryDisabled={!canContinue}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          title={name ? `What are you managing,\n${name}?` : 'What are you managing?'}
          subtitle="Pick everything that applies. We’ll check every meal against all of them."
        />

        <View style={styles.chipGrid}>
          {CONDITIONS.map((c) => {
            const isOn = selected.has(c.id);
            return (
              <ConditionChip
                key={c.id}
                label={c.label}
                selected={isOn}
                icon={isOn ? 'check' : 'none'}
                onPress={() => togglePreset(c.id)}
              />
            );
          })}
          {customs.map((c) => (
            <ConditionChip
              key={`custom:${c}`}
              label={c}
              selected
              icon="cross"
              onPress={() => removeCustom(c)}
              accessibilityLabel={`Remove ${c}`}
            />
          ))}
        </View>

        <View style={styles.addRow}>
          <View style={styles.addIcon}>
            <Text style={styles.addIconGlyph}>+</Text>
          </View>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add your own — e.g. Thyroid, IBS, PCOS"
            placeholderTextColor={colors.inkMuted}
            style={styles.addInput}
            maxLength={MAX_CUSTOM_LENGTH}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
          <Pressable
            onPress={addCustom}
            disabled={!canAddCustom}
            hitSlop={spacing.hitSlop}
            style={({ pressed }) => [
              styles.addBtn,
              !canAddCustom && styles.addBtnDisabled,
              pressed && canAddCustom && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add custom condition"
          >
            <Text style={styles.addBtnLabel}>Add</Text>
          </Pressable>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: sizes.borderInputFocused,
    borderColor: colors.inkMuted,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.fieldPaddingX,
    paddingVertical: spacing.fieldPaddingY + 2,
  },
  addIcon: {
    width: sizes.iconSm,
    height: sizes.iconSm,
    borderRadius: radius.full,
    borderWidth: sizes.borderInput,
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconGlyph: {
    ...typography.chipIcon,
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 14,
  },
  addInput: {
    flex: 1,
    ...typography.inputText,
    color: colors.ink,
    paddingVertical: 0,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  addBtnDisabled: { opacity: opacity.disabled },
  pressed: { opacity: opacity.pressed },
  addBtnLabel: {
    ...typography.chipLabel,
    fontWeight: '700',
    color: colors.primaryContrast,
  },
});

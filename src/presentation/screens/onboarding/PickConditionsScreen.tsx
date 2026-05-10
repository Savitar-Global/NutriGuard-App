import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONDITIONS } from '@/config/constants';
import type { ConditionId } from '@/domain/entities/Condition';
import { BackButton } from '@/presentation/components/BackButton';
import { ConditionChip } from '@/presentation/components/ConditionChip';
import { Divider } from '@/presentation/components/Divider';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import {
  BodyStatsCard,
  type BodyStatField,
} from '@/presentation/components/profile/BodyStatsCard';
import {
  EditMeasurementModal,
  type EditField,
} from '@/presentation/components/profile/EditMeasurementModal';
import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';
import { useAuthStore } from '@/stores/authStore';
import { useLocalProfileStore } from '@/stores/localProfileStore';
import { useUserStore } from '@/stores/userStore';
import {
  AGE_LIMITS,
  ageToBirthday,
  calculateAge,
  hasValidBirthday,
} from '@/utils/age';
import type { HeightUnit, WeightUnit } from '@/utils/units';

const MAX_CUSTOM_LENGTH = 40;

const sameAsCondition = (input: string, label: string) =>
  input.trim().toLowerCase() === label.trim().toLowerCase();

interface BodyDraft {
  weightKg: number;
  heightCm: number;
  birthday: Date | null;
}

export function PickConditionsScreen() {
  const navigation = useNavigation();
  const isEditing = navigation.canGoBack();

  const uid = useAuthStore((s) => s.user?.uid);
  const profile = useUserStore((s) => s.profile);
  const isSaving = useUserStore((s) => s.isSaving);
  const error = useUserStore((s) => s.error);
  const saveConditions = useUserStore((s) => s.saveConditions);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const clearError = useUserStore((s) => s.clearError);

  const weightUnit = useLocalProfileStore((s) => s.weightUnit);
  const heightUnit = useLocalProfileStore((s) => s.heightUnit);
  const setWeightUnit = useLocalProfileStore((s) => s.setWeightUnit);
  const setHeightUnit = useLocalProfileStore((s) => s.setHeightUnit);

  const [selected, setSelected] = useState<Set<ConditionId>>(
    () => new Set(profile?.conditions ?? []),
  );
  const [customs, setCustoms] = useState<string[]>(
    () => profile?.customConditions ?? [],
  );
  const [draft, setDraft] = useState('');

  const [body, setBody] = useState<BodyDraft>(() => ({
    weightKg: profile?.weightKg ?? 0,
    heightCm: profile?.heightCm ?? 0,
    birthday: hasValidBirthday(profile?.birthday) ? profile!.birthday : null,
  }));
  const [editField, setEditField] = useState<EditField | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const ageYears = useMemo(
    () => (body.birthday ? calculateAge(body.birthday) : 0),
    [body.birthday],
  );

  const totalConditions = selected.size + customs.length;
  const hasConditions = totalConditions > 0;
  const hasWeight = body.weightKg > 0;
  const hasHeight = body.heightCm > 0;
  const hasAge = ageYears > 0;
  const isComplete = hasConditions && hasWeight && hasHeight && hasAge;

  const trimmedDraft = draft.trim();
  const draftIsDuplicate = useMemo(() => {
    if (!trimmedDraft) return false;
    const lower = trimmedDraft.toLowerCase();
    if (customs.some((c) => c.toLowerCase() === lower)) return true;
    return CONDITIONS.some((c) => sameAsCondition(trimmedDraft, c.label));
  }, [trimmedDraft, customs]);
  const canAddCustom = trimmedDraft.length > 0 && !draftIsDuplicate;

  const togglePreset = (id: ConditionId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (validationError) setValidationError(null);
    if (error) clearError();
  };

  const addCustom = () => {
    if (!canAddCustom) return;
    setCustoms((prev) => [...prev, trimmedDraft]);
    setDraft('');
    if (validationError) setValidationError(null);
    if (error) clearError();
  };

  const removeCustom = (value: string) => {
    setCustoms((prev) => prev.filter((c) => c !== value));
  };

  const promptAge = () => {
    Alert.prompt(
      'Age',
      'Enter your age in years.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (raw?: string) => {
            const parsed = Number((raw ?? '').trim());
            if (
              !Number.isFinite(parsed) ||
              parsed < AGE_LIMITS.min ||
              parsed > AGE_LIMITS.max
            ) {
              Alert.alert(
                'Invalid age',
                `Please enter a value between ${AGE_LIMITS.min} and ${AGE_LIMITS.max}.`,
              );
              return;
            }
            setBody((prev) => ({
              ...prev,
              birthday: ageToBirthday(parsed, prev.birthday),
            }));
            if (validationError) setValidationError(null);
          },
        },
      ],
      'plain-text',
      ageYears > 0 ? String(ageYears) : '',
      'numeric',
    );
  };

  const onEditStat = (field: BodyStatField) => {
    if (field === 'age') {
      promptAge();
      return;
    }
    setEditField(field);
  };

  const submitWeight = (kg: number, unit: WeightUnit) => {
    setWeightUnit(unit);
    setBody((prev) => ({ ...prev, weightKg: kg }));
    if (validationError) setValidationError(null);
  };

  const submitHeight = (cm: number, unit: HeightUnit) => {
    setHeightUnit(unit);
    setBody((prev) => ({ ...prev, heightCm: cm }));
    if (validationError) setValidationError(null);
  };

  const onSubmit = async () => {
    if (!uid || isSaving) return;
    if (!isComplete) {
      setValidationError(missingFieldsMessage(body, ageYears, hasConditions));
      return;
    }
    try {
      await updateProfile(uid, {
        weightKg: body.weightKg,
        heightCm: body.heightCm,
        birthday: body.birthday ?? new Date(0),
      });
      await saveConditions(uid, {
        conditions: Array.from(selected),
        customConditions: customs,
      });
      if (isEditing) {
        navigation.goBack();
      }
      // Onboarding mode: AuthGate re-routes once profile updates.
    } catch {
      // store captured the error for the UI
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isEditing && (
            <View style={styles.backRow}>
              <BackButton onPress={() => navigation.goBack()} label="Back" />
            </View>
          )}

          <View style={styles.headerBlock}>
            <Text style={styles.h1}>
              {isEditing
                ? 'Update your\ndetails'
                : 'Tell us about\nyou'}
            </Text>
            <Text style={styles.lead}>
              Pick your conditions and add your body details. Every scan is
              tailored to this profile.
            </Text>
          </View>

          <SectionHeader title="Conditions" subtitle="Pick everything that applies." />

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
            <View style={styles.addIconWrap}>
              <Text style={styles.addIconGlyph}>+</Text>
            </View>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="e.g. Thyroid, IBS, PCOS…"
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
              accessibilityRole="button"
              accessibilityLabel="Add custom condition"
              style={({ pressed }) => [
                styles.addBtn,
                !canAddCustom && styles.addBtnDisabled,
                pressed && canAddCustom && styles.pressed,
              ]}
            >
              <Text style={styles.addBtnLabel}>+ Add</Text>
            </Pressable>
          </View>

          <Divider />

          <SectionHeader
            title="Body details"
            subtitle="Tap each tile to set your weight, height, and age."
          />

          <BodyStatsCard
            weightKg={body.weightKg}
            heightCm={body.heightCm}
            ageYears={ageYears}
            weightUnit={weightUnit}
            heightUnit={heightUnit}
            onEdit={onEditStat}
            style={styles.bodyCard}
          />

          {validationError ? (
            <Text style={styles.error}>{validationError}</Text>
          ) : error ? (
            <Text style={styles.error}>Couldn’t save — try again.</Text>
          ) : null}
        </ScrollView>

        <View style={styles.cta}>
          <PrimaryButton
            label="Submit"
            onPress={onSubmit}
            loading={isSaving}
            disabled={isSaving || !uid}
          />
        </View>
      </KeyboardAvoidingView>

      {editField && (
        <EditMeasurementModal
          visible
          field={editField}
          initialKg={body.weightKg}
          initialCm={body.heightCm}
          weightUnit={weightUnit}
          heightUnit={heightUnit}
          onSubmitWeight={submitWeight}
          onSubmitHeight={submitHeight}
          onClose={() => setEditField(null)}
        />
      )}
    </SafeAreaView>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

const missingFieldsMessage = (
  body: BodyDraft,
  ageYears: number,
  hasConditions: boolean,
): string => {
  const missing: string[] = [];
  if (!hasConditions) missing.push('at least one condition');
  if (body.weightKg <= 0) missing.push('weight');
  if (body.heightCm <= 0) missing.push('height');
  if (ageYears <= 0) missing.push('age');
  if (missing.length === 1) return `Please add your ${missing[0]}.`;
  const head = missing.slice(0, -1).join(', ');
  return `Please add ${head} and ${missing[missing.length - 1]}.`;
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  backRow: { marginBottom: spacing.md },
  headerBlock: { marginBottom: spacing.lg },
  h1: typography.h1,
  lead: { ...typography.bodyMd, marginTop: spacing.sm },

  sectionHeader: {
    marginBottom: spacing.md,
    gap: spacing.xxs,
  },
  sectionTitle: typography.h3,
  sectionSubtitle: { ...typography.bodySm, color: colors.inkSoft },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  addIconWrap: {
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

  bodyCard: { marginBottom: spacing.lg },

  error: {
    ...typography.errorText,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cta: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    marginBottom: -spacing['3xl'],
  },
});

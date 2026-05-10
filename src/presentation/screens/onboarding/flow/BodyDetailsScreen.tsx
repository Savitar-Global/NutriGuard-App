import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import {
  EmptyInputAccessory,
  EMPTY_INPUT_ACCESSORY_ID,
} from '@/presentation/components/EmptyInputAccessory';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { UnitToggle } from '@/presentation/components/onboarding/UnitToggle';
import { TextField } from '@/presentation/components/TextField';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useLocalProfileStore } from '@/stores/localProfileStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  cmToFtIn,
  ftInToCm,
  kgToLb,
  lbToKg,
  type HeightUnit,
  type WeightUnit,
} from '@/utils/units';

const WEIGHT_LIMITS = {
  kg: { min: 30, max: 250 },
  lb: { min: 66, max: 550 },
} as const;

const HEIGHT_LIMITS = {
  cm: { min: 100, max: 230 },
  ft: { ftMin: 3, ftMax: 8, inMin: 0, inMax: 11 },
} as const;

const WEIGHT_UNITS: ReadonlyArray<{ value: WeightUnit; label: string }> = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
];

const HEIGHT_UNITS: ReadonlyArray<{ value: HeightUnit; label: string }> = [
  { value: 'cm', label: 'cm' },
  { value: 'ft', label: 'ft / in' },
];

export function BodyDetailsScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const stored = useOnboardingStore((s) => s.answers);
  const patch = useOnboardingStore((s) => s.patch);

  const weightUnit = useLocalProfileStore((s) => s.weightUnit);
  const heightUnit = useLocalProfileStore((s) => s.heightUnit);
  const setWeightUnit = useLocalProfileStore((s) => s.setWeightUnit);
  const setHeightUnit = useLocalProfileStore((s) => s.setHeightUnit);

  // Weight input — value displayed in current unit; canonical kg derived on submit.
  const [weightInput, setWeightInput] = useState(() =>
    stored.weightKg
      ? weightUnit === 'kg'
        ? String(Math.round(stored.weightKg))
        : String(Math.round(kgToLb(stored.weightKg)))
      : '',
  );

  // Height inputs — cm uses one field, ft uses two (ft + in).
  const [heightCmInput, setHeightCmInput] = useState(() =>
    stored.heightCm ? String(Math.round(stored.heightCm)) : '',
  );
  const [feetInput, setFeetInput] = useState(() => {
    if (!stored.heightCm) return '';
    const { ft } = cmToFtIn(stored.heightCm);
    return String(ft);
  });
  const [inchesInput, setInchesInput] = useState(() => {
    if (!stored.heightCm) return '';
    const { in: inches } = cmToFtIn(stored.heightCm);
    return String(inches);
  });

  // When the unit toggles change, re-derive the input from the previously stored kg/cm.
  useEffect(() => {
    if (!stored.weightKg) return;
    setWeightInput(
      weightUnit === 'kg'
        ? String(Math.round(stored.weightKg))
        : String(Math.round(kgToLb(stored.weightKg))),
    );
  }, [weightUnit, stored.weightKg]);

  const parsedWeight = Number(weightInput.trim());
  const weightOk =
    Number.isFinite(parsedWeight) &&
    parsedWeight >= WEIGHT_LIMITS[weightUnit].min &&
    parsedWeight <= WEIGHT_LIMITS[weightUnit].max;

  const parsedCm = Number(heightCmInput.trim());
  const cmOk =
    heightUnit === 'cm' &&
    Number.isFinite(parsedCm) &&
    parsedCm >= HEIGHT_LIMITS.cm.min &&
    parsedCm <= HEIGHT_LIMITS.cm.max;

  const parsedFt = Number(feetInput.trim());
  const parsedIn = Number(inchesInput.trim() || '0');
  const ftOk =
    heightUnit === 'ft' &&
    Number.isFinite(parsedFt) &&
    Number.isFinite(parsedIn) &&
    parsedFt >= HEIGHT_LIMITS.ft.ftMin &&
    parsedFt <= HEIGHT_LIMITS.ft.ftMax &&
    parsedIn >= HEIGHT_LIMITS.ft.inMin &&
    parsedIn <= HEIGHT_LIMITS.ft.inMax;

  const heightOk = heightUnit === 'cm' ? cmOk : ftOk;
  const canContinue = weightOk && heightOk;

  const onContinue = () => {
    if (!canContinue) return;
    Keyboard.dismiss();
    const weightKg =
      weightUnit === 'kg'
        ? Math.round(parsedWeight)
        : Math.round(lbToKg(parsedWeight));
    const heightCm =
      heightUnit === 'cm'
        ? Math.round(parsedCm)
        : ftInToCm(parsedFt, parsedIn);
    patch({ weightKg, heightCm });
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
          eyebrow="Almost there"
          title={'One last thing —\nyour weight & height.'}
          subtitle="These help the AI tailor portion advice. A 60 kg person processes food differently than a 90 kg person."
        />

        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Weight</Text>
            <UnitToggle
              options={WEIGHT_UNITS}
              value={weightUnit}
              onChange={setWeightUnit}
              accessibilityLabel="Weight unit"
            />
          </View>
          <TextField
            label={weightUnit === 'kg' ? 'Weight (kg)' : 'Weight (lb)'}
            value={weightInput}
            onChangeText={(v) => setWeightInput(v.replace(/[^0-9.]/g, ''))}
            placeholder={weightUnit === 'kg' ? '70' : '154'}
            keyboardType="decimal-pad"
            maxLength={5}
            inputAccessoryViewID={EMPTY_INPUT_ACCESSORY_ID}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Height</Text>
            <UnitToggle
              options={HEIGHT_UNITS}
              value={heightUnit}
              onChange={setHeightUnit}
              accessibilityLabel="Height unit"
            />
          </View>

          {heightUnit === 'cm' ? (
            <TextField
              label="Height (cm)"
              value={heightCmInput}
              onChangeText={(v) =>
                setHeightCmInput(v.replace(/[^0-9.]/g, ''))
              }
              placeholder="175"
              keyboardType="decimal-pad"
              maxLength={5}
              inputAccessoryViewID={EMPTY_INPUT_ACCESSORY_ID}
            />
          ) : (
            <View style={styles.ftRow}>
              <View style={styles.ftSlot}>
                <TextField
                  label="Feet"
                  value={feetInput}
                  onChangeText={(v) =>
                    setFeetInput(v.replace(/[^0-9]/g, ''))
                  }
                  placeholder="5"
                  keyboardType="number-pad"
                  maxLength={1}
                  inputAccessoryViewID={EMPTY_INPUT_ACCESSORY_ID}
                />
              </View>
              <View style={styles.ftSlot}>
                <TextField
                  label="Inches"
                  value={inchesInput}
                  onChangeText={(v) =>
                    setInchesInput(v.replace(/[^0-9]/g, ''))
                  }
                  placeholder="9"
                  keyboardType="number-pad"
                  maxLength={2}
                  inputAccessoryViewID={EMPTY_INPUT_ACCESSORY_ID}
                />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.privacy}>
          Stored on your account only — never shared, never sold.
        </Text>
      </View>

      <EmptyInputAccessory />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  field: { gap: spacing.xs },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.inkSoft,
  },
  ftRow: { flexDirection: 'row', gap: spacing.md },
  ftSlot: { flex: 1 },
  privacy: {
    ...typography.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
});

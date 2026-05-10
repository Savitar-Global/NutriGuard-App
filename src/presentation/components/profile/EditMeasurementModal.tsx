import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';
import {
  cmToFtIn,
  formatHeight,
  formatWeight,
  ftInToCm,
  kgToLb,
  lbToKg,
  type HeightUnit,
  type WeightUnit,
} from '@/utils/units';

export type EditField = 'weight' | 'height';

interface EditMeasurementModalProps {
  visible: boolean;
  field: EditField;
  initialKg: number;
  initialCm: number;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  onSubmitWeight: (kg: number, unit: WeightUnit) => void;
  onSubmitHeight: (cm: number, unit: HeightUnit) => void;
  onClose: () => void;
}

const WEIGHT_OPTIONS: WeightUnit[] = ['kg', 'lb'];
const HEIGHT_OPTIONS: HeightUnit[] = ['cm', 'ft'];

const WEIGHT_LIMITS: Record<WeightUnit, { min: number; max: number }> = {
  kg: { min: 20, max: 400 },
  lb: { min: 44, max: 880 },
};

const HEIGHT_LIMITS_CM = { min: 60, max: 250 };
const HEIGHT_LIMITS_FT = { ft: { min: 2, max: 8 }, in: { min: 0, max: 11 } };

export function EditMeasurementModal({
  visible,
  field,
  initialKg,
  initialCm,
  weightUnit,
  heightUnit,
  onSubmitWeight,
  onSubmitHeight,
  onClose,
}: EditMeasurementModalProps) {
  const [unit, setUnit] = useState<WeightUnit | HeightUnit>(
    field === 'weight' ? weightUnit : heightUnit,
  );
  const [value, setValue] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    if (field === 'weight') {
      setUnit(weightUnit);
      setValue(formatWeight(initialKg, weightUnit).text);
    } else {
      setUnit(heightUnit);
      if (heightUnit === 'cm') {
        setValue(initialCm > 0 ? String(Math.round(initialCm)) : '');
      } else {
        const { ft, in: inn } = cmToFtIn(initialCm);
        setFeet(ft > 0 ? String(ft) : '');
        setInches(initialCm > 0 ? String(inn) : '');
      }
    }
  }, [visible, field, initialKg, initialCm, weightUnit, heightUnit]);

  const title = field === 'weight' ? 'Weight' : 'Height';
  const options = field === 'weight' ? WEIGHT_OPTIONS : HEIGHT_OPTIONS;

  const switchUnit = (next: WeightUnit | HeightUnit) => {
    if (next === unit) return;
    setError(null);
    if (field === 'weight') {
      const current = Number(value);
      if (Number.isFinite(current) && current > 0) {
        if (unit === 'kg' && next === 'lb') {
          setValue(String(Math.round(kgToLb(current))));
        } else if (unit === 'lb' && next === 'kg') {
          setValue(String(Math.round(lbToKg(current))));
        }
      }
      setUnit(next);
    } else {
      // height
      if (unit === 'cm' && next === 'ft') {
        const cm = Number(value);
        if (Number.isFinite(cm) && cm > 0) {
          const { ft, in: inn } = cmToFtIn(cm);
          setFeet(String(ft));
          setInches(String(inn));
        } else {
          setFeet('');
          setInches('');
        }
      } else if (unit === 'ft' && next === 'cm') {
        const f = Number(feet);
        const i = Number(inches);
        if (Number.isFinite(f) && f > 0) {
          setValue(String(ftInToCm(f, Number.isFinite(i) ? i : 0)));
        } else {
          setValue('');
        }
      }
      setUnit(next);
    }
  };

  const handleSave = () => {
    if (field === 'weight') {
      const u = unit as WeightUnit;
      const parsed = Number(value.trim());
      const limits = WEIGHT_LIMITS[u];
      if (!Number.isFinite(parsed) || parsed < limits.min || parsed > limits.max) {
        setError(`Enter a value between ${limits.min} and ${limits.max} ${u}.`);
        return;
      }
      const kg = u === 'kg' ? parsed : lbToKg(parsed);
      onSubmitWeight(Math.round(kg * 10) / 10, u);
      onClose();
      return;
    }

    const u = unit as HeightUnit;
    if (u === 'cm') {
      const parsed = Number(value.trim());
      if (
        !Number.isFinite(parsed) ||
        parsed < HEIGHT_LIMITS_CM.min ||
        parsed > HEIGHT_LIMITS_CM.max
      ) {
        setError(
          `Enter a value between ${HEIGHT_LIMITS_CM.min} and ${HEIGHT_LIMITS_CM.max} cm.`,
        );
        return;
      }
      onSubmitHeight(Math.round(parsed), u);
      onClose();
      return;
    }

    const f = Number(feet.trim());
    const i = inches.trim() === '' ? 0 : Number(inches.trim());
    if (
      !Number.isFinite(f) ||
      f < HEIGHT_LIMITS_FT.ft.min ||
      f > HEIGHT_LIMITS_FT.ft.max ||
      !Number.isFinite(i) ||
      i < HEIGHT_LIMITS_FT.in.min ||
      i > HEIGHT_LIMITS_FT.in.max
    ) {
      setError('Enter a height like 5 ft 9 in.');
      return;
    }
    onSubmitHeight(ftInToCm(f, i), u);
    onClose();
  };

  const helperHint = useMemo(() => {
    if (field === 'weight') {
      const other = unit === 'kg' ? 'lb' : 'kg';
      const otherValue =
        unit === 'kg'
          ? formatWeight(Number(value) || 0, 'lb').text
          : formatWeight(lbToKg(Number(value) || 0), 'kg').text;
      return otherValue ? `≈ ${otherValue} ${other}` : ' ';
    }
    if (unit === 'cm') {
      const cm = Number(value) || 0;
      if (cm <= 0) return ' ';
      return `≈ ${formatHeight(cm, 'ft').text}`;
    }
    const f = Number(feet) || 0;
    const i = Number(inches) || 0;
    if (f <= 0) return ' ';
    return `≈ ${ftInToCm(f, i)} cm`;
  }, [field, unit, value, feet, inches]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropFill} onPress={onClose} />
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.cardContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {field === 'weight'
                ? 'How much do you weigh?'
                : 'How tall are you?'}
            </Text>

            <UnitToggle
              options={options}
              value={unit}
              onChange={(next) => switchUnit(next as WeightUnit | HeightUnit)}
            />

            <View style={styles.inputArea}>
              {field === 'weight' || (field === 'height' && unit === 'cm') ? (
                <SingleInput
                  value={value}
                  onChange={setValue}
                  unit={unit}
                  onSubmit={handleSave}
                />
              ) : (
                <FtInInput
                  feet={feet}
                  inches={inches}
                  onFeetChange={setFeet}
                  onInchesChange={setInches}
                  onSubmit={handleSave}
                />
              )}
              <Text style={styles.helper} numberOfLines={1}>
                {helperHint}
              </Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.actions}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnGhost,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.btnGhostLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnPrimary,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Save"
              >
                <Text style={styles.btnPrimaryLabel}>Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface UnitToggleProps {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}

function UnitToggle({ options, value, onChange }: UnitToggleProps) {
  return (
    <View style={styles.toggle}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={({ pressed }) => [
              styles.toggleOption,
              active && styles.toggleOptionActive,
              pressed && !active && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Use ${opt}`}
          >
            <Text style={active ? styles.toggleLabelActive : styles.toggleLabel}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface SingleInputProps {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  onSubmit: () => void;
}

function SingleInput({ value, onChange, unit, onSubmit }: SingleInputProps) {
  return (
    <View style={styles.fieldRow}>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={colors.inkMuted}
        style={styles.fieldInput}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <Text style={styles.fieldUnit}>{unit}</Text>
    </View>
  );
}

interface FtInInputProps {
  feet: string;
  inches: string;
  onFeetChange: (v: string) => void;
  onInchesChange: (v: string) => void;
  onSubmit: () => void;
}

function FtInInput({
  feet,
  inches,
  onFeetChange,
  onInchesChange,
  onSubmit,
}: FtInInputProps) {
  return (
    <View style={styles.ftRow}>
      <View style={[styles.fieldRow, styles.ftField]}>
        <TextInput
          value={feet}
          onChangeText={onFeetChange}
          keyboardType="numeric"
          placeholder="5"
          placeholderTextColor={colors.inkMuted}
          style={styles.fieldInput}
          autoFocus
          returnKeyType="next"
        />
        <Text style={styles.fieldUnit}>ft</Text>
      </View>
      <View style={[styles.fieldRow, styles.ftField]}>
        <TextInput
          value={inches}
          onChangeText={onInchesChange}
          keyboardType="numeric"
          placeholder="9"
          placeholderTextColor={colors.inkMuted}
          style={styles.fieldInput}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Text style={styles.fieldUnit}>in</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.md + 2,
    gap: spacing.sm + 2,
  },
  title: typography.h2,
  subtitle: { ...typography.bodySm, color: colors.inkSoft },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: spacing.xxs,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  toggleOptionActive: {
    backgroundColor: colors.primary,
  },
  toggleLabel: {
    ...typography.buttonSm,
    fontSize: 13,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  toggleLabelActive: {
    ...typography.buttonSm,
    fontSize: 13,
    color: colors.primaryContrast,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  inputArea: { gap: spacing.xs },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: sizes.borderInput,
    borderColor: colors.borderInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: sizes.inputHeight,
    gap: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    ...typography.inputText,
    fontSize: 16,
    paddingVertical: 0,
  },
  fieldUnit: {
    ...typography.bodySm,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  ftRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ftField: { flex: 1 },
  helper: {
    ...typography.bodyXs,
    color: colors.inkMuted,
    minHeight: 14,
  },

  error: { ...typography.errorText },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: {
    flex: 1,
    minHeight: sizes.buttonHeightSm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  btnGhost: { backgroundColor: colors.buttonSecondary },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhostLabel: {
    ...typography.buttonSm,
    color: colors.buttonSecondaryFg,
  },
  btnPrimaryLabel: {
    ...typography.buttonSm,
    color: colors.primaryContrast,
    fontWeight: '700',
  },
  pressed: { opacity: opacity.pressed },
});

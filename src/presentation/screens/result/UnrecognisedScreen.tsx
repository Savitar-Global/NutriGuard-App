import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/presentation/components/BackButton';
import { Icon } from '@/presentation/components/Icon';
import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface UnrecognisedScreenProps {
  onBack?: () => void;
  onScanAgain: () => void;
}

const TIPS: readonly string[] = [
  'Hold the camera 30–40cm above the plate',
  'Avoid harsh shadows — daylight works best',
  'For packages, fill the frame with the label',
];

export function UnrecognisedScreen({
  onBack,
  onScanAgain,
}: UnrecognisedScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        {onBack ? (
          <View style={styles.headerRow}>
            <BackButton onPress={onBack} variant="circle" label={null} />
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCircle}>
            <Icon
              name="question"
              size={sizes.unrecognisedHeroIcon}
              color={colors.inkSoft}
            />
          </View>

          <Text style={styles.title}>
            Hmm, we couldn&apos;t{'\n'}make that out
          </Text>
          <Text style={styles.lead}>
            The photo didn&apos;t have enough detail to identify food. Try
            moving closer or finding better light.
          </Text>

          <View style={styles.tipsCard}>
            {TIPS.map((tip) => (
              <Tip key={tip} text={tip} />
            ))}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Pressable
            onPress={onScanAgain}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnLabel}>Try again</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface TipProps {
  text: string;
}

function Tip({ text }: TipProps) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipDot}>
        <Icon name="check" size={sizes.tipDotIcon} color={colors.primaryContrast} />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  root: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  heroCircle: {
    width: sizes.unrecognisedHero,
    height: sizes.unrecognisedHero,
    borderRadius: sizes.unrecognisedHero / 2,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  lead: {
    ...typography.bodyMd,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: sizes.borderInput,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipDot: {
    width: sizes.tipDot,
    height: sizes.tipDot,
    borderRadius: sizes.tipDot / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxs / 2,
  },
  tipText: {
    ...typography.body,
    flex: 1,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: sizes.borderInput,
    borderColor: colors.borderInput,
    borderRadius: radius.pill,
    paddingVertical: spacing.buttonPaddingY,
    alignItems: 'center',
  },
  outlineBtnLabel: {
    ...typography.button,
    color: colors.inkChevron,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.buttonPaddingY,
    alignItems: 'center',
  },
  primaryBtnLabel: {
    ...typography.button,
    color: colors.primaryContrast,
  },
  btnPressed: { opacity: opacity.pressedSoft },
});

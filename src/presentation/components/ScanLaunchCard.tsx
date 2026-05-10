import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ScanActionRow } from '@/presentation/components/ScanActionRow';
import { colors, radius, spacing, typography } from '@/presentation/theme';

interface ScanLaunchCardProps {
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onTypeItIn: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ScanLaunchCard({
  onTakePhoto,
  onPickFromGallery,
  onTypeItIn,
  style,
}: ScanLaunchCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>Scan a meal</Text>
        <Text style={styles.title}>
          Can you eat this?{'\n'}Find out in 10 seconds.
        </Text>
      </View>

      <View style={styles.actions}>
        <ScanActionRow
          icon="camera"
          title="Take a Photo"
          description="Point at your plate — done in seconds"
          onPress={onTakePhoto}
        />
        <ScanActionRow
          icon="gallery"
          title="From Gallery"
          description="Already snapped it? Use that"
          onPress={onPickFromGallery}
        />
        <ScanActionRow
          icon="keyboard"
          title="Type It In"
          description="No camera? Just describe your meal"
          variant="accent"
          badge="ALWAYS FREE"
          onPress={onTypeItIn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg - 2,
  },
  header: {
    marginBottom: spacing.md + 2,
  },
  label: {
    ...typography.label,
    color: colors.onPrimary.label,
    marginBottom: spacing.xs + 2,
  },
  title: {
    ...typography.scanCardTitle,
  },
  actions: {
    flex: 1,
    gap: spacing.sm,
  },
});

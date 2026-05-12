import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeGreeting } from '@/presentation/components/HomeGreeting';
import type { IconName } from '@/presentation/components/Icon';
import { LastScanCard } from '@/presentation/components/LastScanCard';
import { ScanLaunchCard } from '@/presentation/components/ScanLaunchCard';
import { StreakBadge } from '@/presentation/components/StreakBadge';
import { colors, spacing } from '@/presentation/theme';
import { useScanStore } from '@/stores/scanStore';
import { useUserStore } from '@/stores/userStore';

interface HomeScreenProps {
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onTypeItIn: () => void;
  onLastScanTap: () => void;
  isPhotoLocked?: boolean;
}

const lastScanIcon = (scanType: string | undefined): IconName => {
  if (scanType === 'ingredients') return 'tag';
  if (scanType === 'text') return 'leaf';
  return 'dish';
};

const formatRelative = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function HomeScreen({
  onTakePhoto,
  onPickFromGallery,
  onTypeItIn,
  onLastScanTap,
  isPhotoLocked = false,
}: HomeScreenProps) {
  const profile = useUserStore((s) => s.profile);
  const scan = useScanStore((s) => s.current);

  const lastScanTitle =
    scan?.productName ?? scan?.items[0]?.name ?? scan?.inputText ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <HomeGreeting displayName={profile?.displayName ?? null} />
          <StreakBadge count={profile?.streakCount ?? 0} />
        </View>

        <ScanLaunchCard
          style={styles.scanCard}
          onTakePhoto={onTakePhoto}
          onPickFromGallery={onPickFromGallery}
          onTypeItIn={onTypeItIn}
          isPhotoLocked={isPhotoLocked}
        />

        {scan && lastScanTitle ? (
          <LastScanCard
            style={styles.lastScanCard}
            fallbackIcon={lastScanIcon(scan.scanType)}
            timeLabel={`Last scan · ${formatRelative(scan.createdAt)}`}
            title={lastScanTitle}
            verdict={scan.items[0]?.verdict ?? 'all_good'}
            photoUri={scan.scanType === 'text' ? null : scan.photoLocalUri}
            dishSafetyPct={scan.dishSafetyPct}
            itemNames={scan.items.map((it) => it.name)}
            onPress={onLastScanTap}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  scanCard: {
    flex: 1,
    marginBottom: spacing.md,
  },
  lastScanCard: {
    flexShrink: 0,
  },
});

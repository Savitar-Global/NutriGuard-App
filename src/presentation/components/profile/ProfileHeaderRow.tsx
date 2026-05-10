import { Image } from 'expo-image';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { CameraIcon } from '@/presentation/components/profile/CameraIcon';
import { PencilIcon } from '@/presentation/components/profile/PencilIcon';
import { colors, opacity, radius, sizes, spacing, typography } from '@/presentation/theme';

interface ProfileHeaderRowProps {
  displayName: string | null;
  email: string;
  avatarUri: string | null;
  onPickAvatar: () => void;
  onEditName: () => void;
  style?: StyleProp<ViewStyle>;
}

const initialFor = (displayName: string | null, email: string): string => {
  const source = displayName?.trim() || email.trim();
  return source.charAt(0).toUpperCase() || '?';
};

export function ProfileHeaderRow({
  displayName,
  email,
  avatarUri,
  onPickAvatar,
  onEditName,
  style,
}: ProfileHeaderRowProps) {
  const name = displayName?.trim() || email.split('@')[0];

  return (
    <View style={[styles.row, style]}>
      <Pressable
        onPress={onPickAvatar}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={
          avatarUri ? 'Change or remove profile photo' : 'Set a profile photo'
        }
      >
        <View style={styles.avatar}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.initial}>{initialFor(displayName, email)}</Text>
          )}
        </View>
        <View style={styles.cameraBadge} pointerEvents="none">
          <CameraIcon size={12} color={colors.primaryContrast} />
        </View>
      </Pressable>
      <View style={styles.copy}>
        <Pressable
          onPress={onEditName}
          style={({ pressed }) => [styles.nameRow, pressed && styles.pressed]}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Edit name"
        >
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <PencilIcon size={14} color={colors.primary} />
        </Pressable>
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    width: sizes.profileAvatar,
    height: sizes.profileAvatar,
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: sizes.profileCameraBadge,
    height: sizes.profileCameraBadge,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: opacity.pressed },
  initial: typography.avatarInitial,
  copy: { flex: 1, gap: spacing.xxs },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  name: typography.avatarName,
  email: typography.avatarEmail,
});

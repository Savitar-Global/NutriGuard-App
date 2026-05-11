import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BackButton } from '@/presentation/components/BackButton';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import { colors, spacing, typography } from '@/presentation/theme';

interface CameraScreenProps {
  onClose: () => void;
  onCaptured: (photoUri: string) => void | Promise<void>;
}

export function CameraScreen({ onClose, onCaptured }: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return <PermissionGate onClose={onClose} onRequest={requestPermission} canAsk={permission.canAskAgain} />;
  }

  const handleCapture = async () => {
    const camera = cameraRef.current;
    if (!camera || capturing) return;

    setCapturing(true);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const picture = await camera.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      if (picture?.uri) await onCaptured(picture.uri);
    } catch (err) {
      console.error('[CameraScreen] capture failed', err);
      Alert.alert('Camera error', 'Could not take the photo. Please try again.');
    } finally {
      if (mountedRef.current) setCapturing(false);
    }
  };

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        <View style={styles.topBar}>
          <BackButton onPress={onClose} variant="circle" label={null} />
        </View>

        <View style={styles.frame} pointerEvents="none">
          <FrameCorners />
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleCapture}
            disabled={capturing}
            style={({ pressed }) => [
              styles.shutter,
              pressed && !capturing ? styles.shutterPressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </Pressable>
          <Text style={styles.hint}>Point at your meal or label</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

interface PermissionGateProps {
  onClose: () => void;
  onRequest: () => Promise<unknown>;
  canAsk: boolean;
}

function PermissionGate({ onClose, onRequest, canAsk }: PermissionGateProps) {
  const handleAction = () => {
    if (canAsk) {
      void onRequest();
    } else {
      void Linking.openSettings();
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.permissionBody} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <BackButton onPress={onClose} variant="circle" label={null} />
        </View>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Camera access</Text>
          <Text style={styles.permissionText}>
            Nutricare Ai needs your camera to scan meals and food labels.
          </Text>
          <PrimaryButton
            label={canAsk ? 'Allow camera access' : 'Open Settings'}
            onPress={handleAction}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function FrameCorners() {
  const stroke = 'rgba(255,255,255,0.7)';
  return (
    <Svg width={210} height={170} viewBox="0 0 210 170">
      <Path d="M15 5 L5 5 L5 15" stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M195 5 L205 5 L205 15" stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M15 165 L5 165 L5 155" stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M195 165 L205 165 L205 155" stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const SHUTTER_SIZE = 76;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0E0C' },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.lg,
  },
  topBar: { paddingTop: spacing.sm, paddingHorizontal: spacing.xs },
  frame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  shutter: {
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    borderRadius: SHUTTER_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: { opacity: 0.7 },
  shutterInner: {
    width: SHUTTER_SIZE - 16,
    height: SHUTTER_SIZE - 16,
    borderRadius: (SHUTTER_SIZE - 16) / 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  hint: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.75)',
  },
  permissionBody: { flex: 1, paddingHorizontal: spacing.lg },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  permissionTitle: {
    ...typography.h1,
    color: colors.primaryContrast,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});

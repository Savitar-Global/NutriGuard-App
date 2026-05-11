import type { NavigatorScreenParams } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

import { FREE_SCAN_LIMIT } from '@/config/constants';
import { saveScanPhoto } from '@/data/services/photoStorage';
import { ScanStack, type ScanStackParamList } from '@/presentation/navigation/ScanStack';
import { HomeScreen } from '@/presentation/screens/home/HomeScreen';
import { OnboardingPreviewWrapper } from '@/presentation/screens/onboarding/OnboardingPreviewWrapper';
import { PickConditionsScreen } from '@/presentation/screens/onboarding/PickConditionsScreen';
import { UnrecognisedScreen } from '@/presentation/screens/result/UnrecognisedScreen';
import { useUserStore } from '@/stores/userStore';

export type HomeStackParamList = {
  Home: undefined;
  Scan: NavigatorScreenParams<ScanStackParamList> & {
    initialRoute?: 'Camera' | 'TypeItIn';
    photoUri?: string;
  };
  PickConditions: undefined;
  TestUnrecognised: undefined;
  TestOnboarding: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

type HomeProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

function HomeContainer({ navigation }: HomeProps) {
  // Subscribing here (inside a real component) is what makes the gate
  // reactive — when scanStore increments the count, this re-renders and
  // `isPhotoLocked` is recomputed before the user can tap again.
  const profile = useUserStore((s) => s.profile);
  const isPhotoLocked =
    profile?.plan !== 'pro' &&
    (profile?.lifetimePhotoScansUsed ?? 0) >= FREE_SCAN_LIMIT;

  const goToPaywall = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any).navigate('Paywall');
  };

  const goToLastScanTab = () => {
    const tabs = navigation.getParent();
    tabs?.navigate('LastScanTab');
  };

  const openScanModal = (initialRoute: 'Camera' | 'TypeItIn') => {
    // Cast: the inferred nested-param type narrows by `screen`, which TS
    // can't follow through this helper. The shape is correct at runtime.
    navigation.navigate('Scan', {
      initialRoute,
      screen: initialRoute,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  const handleTakePhoto = () => {
    if (isPhotoLocked) {
      goToPaywall();
      return;
    }
    openScanModal('Camera');
  };

  const handleTypeItIn = () => {
    openScanModal('TypeItIn');
  };

  const handlePickFromGallery = async () => {
    if (isPhotoLocked) {
      goToPaywall();
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photos access needed',
        'Allow photo library access to pick a meal image.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => void Linking.openSettings(),
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const sourceUri = result.assets[0].uri;

    try {
      // iPhone gallery photos may be HEIC; OpenAI only accepts JPEG/PNG/GIF/WebP.
      const jpeg = await manipulateAsync(sourceUri, [], {
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      const savedUri = await saveScanPhoto(jpeg.uri);
      navigation.navigate('Scan', {
        initialRoute: 'Camera',
        screen: 'Analysing',
        params: { mode: 'photo', photoUri: savedUri },
      });
    } catch (err) {
      console.error('[HomeStack] failed to save gallery image', err);
      Alert.alert('Could not load that image. Please try a different one.');
    }
  };

  const handleTestAnalysing = () => {
    navigation.navigate('Scan', {
      initialRoute: 'TypeItIn',
      screen: 'Analysing',
      params: { mode: 'text', text: 'Test meal: rice with chicken curry' },
    });
  };

  return (
    <HomeScreen
      onTakePhoto={handleTakePhoto}
      onPickFromGallery={() => void handlePickFromGallery()}
      onTypeItIn={handleTypeItIn}
      onLastScanTap={goToLastScanTab}
      isPhotoLocked={isPhotoLocked}
      onTestPickConditions={() => navigation.navigate('PickConditions')}
      onTestAnalysing={handleTestAnalysing}
      onTestUnrecognised={() => navigation.navigate('TestUnrecognised')}
      onTestOnboarding={() => navigation.navigate('TestOnboarding')}
      onTestPaywall={goToPaywall}
    />
  );
}

export function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeContainer} />

      <Stack.Screen
        name="Scan"
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      >
        {({ navigation, route }) => {
          const dismiss = () => navigation.goBack();
          const onAnalysed = () => {
            navigation.goBack();
            const tabs = navigation.getParent();
            tabs?.navigate('LastScanTab');
          };
          const initialRoute = route.params?.initialRoute ?? 'Camera';
          return (
            <ScanStack
              initialRoute={initialRoute}
              onDismiss={dismiss}
              onAnalysed={onAnalysed}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen
        name="PickConditions"
        component={PickConditionsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TestUnrecognised"
        options={{ animation: 'slide_from_right' }}
      >
        {({ navigation }) => (
          <UnrecognisedScreen
            onBack={() => navigation.goBack()}
            onScanAgain={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="TestOnboarding"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      >
        {({ navigation }) => (
          <OnboardingPreviewWrapper onClose={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

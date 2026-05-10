import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

import { saveScanPhoto } from '@/data/services/photoStorage';
import { ScanStack, type ScanStackParamList } from '@/presentation/navigation/ScanStack';
import { HomeScreen } from '@/presentation/screens/home/HomeScreen';
import { OnboardingPreviewWrapper } from '@/presentation/screens/onboarding/OnboardingPreviewWrapper';
import { PickConditionsScreen } from '@/presentation/screens/onboarding/PickConditionsScreen';
import { UnrecognisedScreen } from '@/presentation/screens/result/UnrecognisedScreen';

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

export function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home">
        {({ navigation }) => {
          const goToLastScanTab = () => {
            const tabs = navigation.getParent();
            tabs?.navigate('LastScanTab');
          };

          const openScanModal = (
            initialRoute: 'Camera' | 'TypeItIn',
            params?: ScanStackParamList[keyof ScanStackParamList],
          ) => {
            navigation.navigate('Scan', {
              initialRoute,
              screen: initialRoute,
              params,
            });
          };

          const handleTakePhoto = () => {
            openScanModal('Camera');
          };

          const handleTypeItIn = () => {
            openScanModal('TypeItIn');
          };

          const handlePickFromGallery = async () => {
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
              onTestPickConditions={() => navigation.navigate('PickConditions')}
              onTestAnalysing={handleTestAnalysing}
              onTestUnrecognised={() => navigation.navigate('TestUnrecognised')}
              onTestOnboarding={() => navigation.navigate('TestOnboarding')}
            />
          );
        }}
      </Stack.Screen>

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

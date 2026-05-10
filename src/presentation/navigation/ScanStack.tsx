import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import { saveScanPhoto } from '@/data/services/photoStorage';
import type { AnalyseMealInput } from '@/domain/usecases/AnalyseMealUseCase';
import { useBuildAnalyseInput } from '@/presentation/hooks/useBuildAnalyseInput';
import { AnalysingScreen, type AnalyseMode } from '@/presentation/screens/scan/AnalysingScreen';
import { CameraScreen } from '@/presentation/screens/scan/CameraScreen';
import { TypeItInScreen } from '@/presentation/screens/scan/TypeItInScreen';

export type ScanStackParamList = {
  Camera: undefined;
  TypeItIn: undefined;
  Analysing: {
    mode: AnalyseMode;
    photoUri?: string;
    text?: string;
  };
};

const Stack = createNativeStackNavigator<ScanStackParamList>();

export interface ScanStackProps {
  initialRoute: 'Camera' | 'TypeItIn';
  onDismiss: () => void;
  onAnalysed: () => void;
}

export function ScanStack({ initialRoute, onDismiss, onAnalysed }: ScanStackProps) {
  const buildInput = useBuildAnalyseInput();

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Camera">
        {({ navigation }) => (
          <CameraScreen
            onClose={onDismiss}
            onCaptured={async (tempUri) => {
              try {
                const savedUri = await saveScanPhoto(tempUri);
                navigation.replace('Analysing', { mode: 'photo', photoUri: savedUri });
              } catch (err) {
                console.error('[ScanStack] failed to save captured photo', err);
                Alert.alert('Could not save the photo. Please try again.');
              }
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="TypeItIn">
        {({ navigation }) => (
          <TypeItInScreen
            onBack={onDismiss}
            onSubmit={(text) =>
              navigation.replace('Analysing', { mode: 'text', text })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Analysing">
        {({ route }) => {
          const { mode, photoUri, text } = route.params;
          const input: AnalyseMealInput | null = buildInput({ photoUri, text });
          if (!input) {
            // Profile not ready — fall back to dismiss.
            queueMicrotask(onDismiss);
            return null;
          }
          return (
            <AnalysingScreen
              mode={mode}
              input={input}
              onSuccess={onAnalysed}
              onCancel={onDismiss}
            />
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

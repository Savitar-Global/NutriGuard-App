import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  configureNotificationHandler,
  scheduleInactivityReminder,
} from '@/data/services/inactivityNotifications';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { SplashScreen } from '@/presentation/screens/splash/SplashScreen';

// Configure once at module load — handler determines how foreground
// notifications display if one happens to fire while the app is open.
configureNotificationHandler();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Reset the inactivity timer on launch. No-op if permission isn't
    // granted, so the call is always safe.
    void scheduleInactivityReminder();

    const onChange = (state: AppStateStatus) => {
      if (state === 'active') void scheduleInactivityReminder();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={showSplash ? 'light' : 'dark'} />
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <RootNavigator />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

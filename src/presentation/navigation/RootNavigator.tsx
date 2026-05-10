import { NavigationContainer } from '@react-navigation/native';

import { AuthGate } from '@/presentation/navigation/AuthGate';

export function RootNavigator() {
  return (
    <NavigationContainer>
      <AuthGate />
    </NavigationContainer>
  );
}

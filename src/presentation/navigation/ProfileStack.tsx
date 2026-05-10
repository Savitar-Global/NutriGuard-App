import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PickConditionsScreen } from '@/presentation/screens/onboarding/PickConditionsScreen';
import { ProfileScreen } from '@/presentation/screens/profile/ProfileScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  PickConditions: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PickConditions" component={PickConditionsScreen} />
    </Stack.Navigator>
  );
}

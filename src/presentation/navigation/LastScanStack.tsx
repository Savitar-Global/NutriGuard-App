import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DamageControlScreen } from '@/presentation/screens/result/DamageControlScreen';
import { LastScanScreen } from '@/presentation/screens/result/LastScanScreen';
import { WhatsInsideScreen } from '@/presentation/screens/result/WhatsInsideScreen';

export type LastScanStackParamList = {
  LastScan: undefined;
  DamageControl: { itemId: string };
  WhatsInside: undefined;
};

const Stack = createNativeStackNavigator<LastScanStackParamList>();

export function LastScanStack() {
  return (
    <Stack.Navigator
      initialRouteName="LastScan"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LastScan">
        {({ navigation }) => (
          <LastScanScreen
            onEatAnyway={(itemId) =>
              navigation.navigate('DamageControl', { itemId })
            }
            onScanAgain={() => {
              const tabs = navigation.getParent();
              tabs?.navigate('HomeTab', {
                screen: 'Scan',
                params: { initialRoute: 'Camera', screen: 'Camera' },
              });
            }}
            onSeeIngredients={() => navigation.navigate('WhatsInside')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DamageControl">
        {({ navigation, route }) => (
          <DamageControlScreen
            startItemId={route.params.itemId}
            onClose={() => navigation.popToTop()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="WhatsInside"
        options={{ animation: 'slide_from_right' }}
      >
        {({ navigation }) => (
          <WhatsInsideScreen
            onBack={() => navigation.goBack()}
            onEatAnyway={(itemId) => {
              navigation.replace('DamageControl', { itemId });
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TabBarIcon,
  type TabIconName,
} from '@/presentation/components/TabBarIcon';
import { HomeStack } from '@/presentation/navigation/HomeStack';
import { LastScanStack } from '@/presentation/navigation/LastScanStack';
import { ProfileStack } from '@/presentation/navigation/ProfileStack';
import { colors, sizes, spacing, typography } from '@/presentation/theme';

export type MainTabsParamList = {
  HomeTab: undefined;
  LastScanTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const makeTabIcon =
  (name: TabIconName) =>
  ({ color }: { color: string }) => <TabBarIcon name={name} color={color} />;

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: typography.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: sizes.tabBarHeight + insets.bottom,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: {
          gap: spacing.xxs,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home', tabBarIcon: makeTabIcon('home') }}
      />
      <Tab.Screen
        name="LastScanTab"
        component={LastScanStack}
        options={{ title: 'Last Scan', tabBarIcon: makeTabIcon('last-scan') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile', tabBarIcon: makeTabIcon('profile') }}
      />
    </Tab.Navigator>
  );
}

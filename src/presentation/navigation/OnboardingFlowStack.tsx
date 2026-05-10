import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { OnboardingFlowParamList } from '@/presentation/navigation/onboardingRoutes';
import { BirthdayScreen } from '@/presentation/screens/onboarding/flow/BirthdayScreen';
import { BodyDetailsScreen } from '@/presentation/screens/onboarding/flow/BodyDetailsScreen';
import { BombshellScreen } from '@/presentation/screens/onboarding/flow/BombshellScreen';
import { BridgeScreen } from '@/presentation/screens/onboarding/flow/BridgeScreen';
import { CommitmentScreen } from '@/presentation/screens/onboarding/flow/CommitmentScreen';
import { ConditionsScreen } from '@/presentation/screens/onboarding/flow/ConditionsScreen';
import { CookingScreen } from '@/presentation/screens/onboarding/flow/CookingScreen';
import { CuisineScreen } from '@/presentation/screens/onboarding/flow/CuisineScreen';
import { DemoAnalysingScreen } from '@/presentation/screens/onboarding/flow/DemoAnalysingScreen';
import { DemoIntroScreen } from '@/presentation/screens/onboarding/flow/DemoIntroScreen';
import { DemoResultScreen } from '@/presentation/screens/onboarding/flow/DemoResultScreen';
import { DisclaimerScreen } from '@/presentation/screens/onboarding/flow/DisclaimerScreen';
import { DurationScreen } from '@/presentation/screens/onboarding/flow/DurationScreen';
import { MirrorScreen } from '@/presentation/screens/onboarding/flow/MirrorScreen';
import { NameScreen } from '@/presentation/screens/onboarding/flow/NameScreen';
import { NotificationsScreen } from '@/presentation/screens/onboarding/flow/NotificationsScreen';
import { LoginScreen } from '@/presentation/screens/auth/LoginScreen';
import { SignUpScreen } from '@/presentation/screens/auth/SignUpScreen';
import { PersonalisingScreen } from '@/presentation/screens/onboarding/flow/PersonalisingScreen';
import { PlanSummaryScreen } from '@/presentation/screens/onboarding/flow/PlanSummaryScreen';
import { ProblemScreen } from '@/presentation/screens/onboarding/flow/ProblemScreen';
import { QuestionAnxietyScreen } from '@/presentation/screens/onboarding/flow/QuestionAnxietyScreen';
import { QuestionGoalScreen } from '@/presentation/screens/onboarding/flow/QuestionGoalScreen';
import { QuestionPainScreen } from '@/presentation/screens/onboarding/flow/QuestionPainScreen';
import { QuestionStrategyScreen } from '@/presentation/screens/onboarding/flow/QuestionStrategyScreen';
import { ReflectStrategyScreen } from '@/presentation/screens/onboarding/flow/ReflectStrategyScreen';
import { SolutionScreen } from '@/presentation/screens/onboarding/flow/SolutionScreen';
import { StreakStartScreen } from '@/presentation/screens/onboarding/flow/StreakStartScreen';
import { WelcomeScreen } from '@/presentation/screens/onboarding/flow/WelcomeScreen';

const Stack = createNativeStackNavigator<OnboardingFlowParamList>();

/**
 * Pre-auth conversion-focused onboarding flow (Welcome → … → Sign Up).
 *
 * Order is canonical in `onboardingRoutes.ts` and mirrored here. Navigation
 * itself is driven by `useOnboardingNav()` which derives `goNext()` from the
 * route list — adding a screen is a 2-line change (route name + Stack.Screen).
 */
export function OnboardingFlowStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      {/* Introduction */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Problem" component={ProblemScreen} />
      <Stack.Screen name="Solution" component={SolutionScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Birthday" component={BirthdayScreen} />
      <Stack.Screen name="Conditions" component={ConditionsScreen} />
      <Stack.Screen name="Duration" component={DurationScreen} />
      <Stack.Screen name="Bombshell" component={BombshellScreen} />
      <Stack.Screen name="Bridge" component={BridgeScreen} />
      <Stack.Screen name="QuestionStrategy" component={QuestionStrategyScreen} />
      <Stack.Screen name="ReflectStrategy" component={ReflectStrategyScreen} />
      <Stack.Screen name="QuestionPain" component={QuestionPainScreen} />
      <Stack.Screen name="QuestionAnxiety" component={QuestionAnxietyScreen} />
      <Stack.Screen name="QuestionGoal" component={QuestionGoalScreen} />
      <Stack.Screen name="Mirror" component={MirrorScreen} />
      <Stack.Screen name="Cuisine" component={CuisineScreen} />
      <Stack.Screen name="Cooking" component={CookingScreen} />

      {/* Climax */}
      <Stack.Screen name="DemoIntro" component={DemoIntroScreen} />
      <Stack.Screen
        name="DemoAnalysing"
        component={DemoAnalysingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="DemoResult" component={DemoResultScreen} />
      <Stack.Screen
        name="StreakStart"
        component={StreakStartScreen}
        options={{ animation: 'fade' }}
      />

      {/* Conclusion */}
      <Stack.Screen
        name="Personalising"
        component={PersonalisingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="PlanSummary" component={PlanSummaryScreen} />
      <Stack.Screen name="BodyDetails" component={BodyDetailsScreen} />
      <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Commitment" component={CommitmentScreen} />

      {/*
       * Auth (final step) — reuses the existing email-and-Apple SignUp/Login
       * screens. The pre-auth answers buffered in `useOnboardingStore` are
       * committed by `AuthGate` once Firebase Auth flips the user from null
       * to non-null, so these screens stay layout-only and don't need to
       * know about the onboarding store.
       */}
      <Stack.Screen
        name="SignUp"
        options={{ gestureEnabled: true, animation: 'slide_from_right' }}
      >
        {({ navigation }) => (
          <SignUpScreen
            onNavigateToLogin={() => navigation.navigate('Login' as never)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Login"
        options={{ gestureEnabled: true, animation: 'slide_from_right' }}
      >
        {({ navigation }) => <LoginScreen onBack={() => navigation.goBack()} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

import {
  useNavigation,
  useRoute,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo } from 'react';

import {
  ONBOARDING_ROUTES,
  PROGRESS_ROUTES,
  type OnboardingFlowParamList,
  type OnboardingRoute,
} from '@/presentation/navigation/onboardingRoutes';

interface OnboardingNav {
  /** 1-based index for display (e.g. step 5 of 27). */
  step: number;
  /** Total steps shown on the progress bar (auth screens excluded). */
  totalSteps: number;
  /** Whether this route should render a progress bar at all. */
  showProgress: boolean;
  /** Push the next screen in `ONBOARDING_ROUTES`. No-op if last. */
  goNext: () => void;
  /** Pop back if possible. */
  goBack: () => void;
  /** Push to a specific route in the flow. */
  goTo: (route: OnboardingRoute) => void;
  /** True when there is a previous screen to go back to. */
  canGoBack: boolean;
}

export function useOnboardingNav(): OnboardingNav {
  const navigation =
    useNavigation<NavigationProp<OnboardingFlowParamList>>();
  const route = useRoute();
  const current = route.name as OnboardingRoute;

  const progressIndex = PROGRESS_ROUTES.indexOf(current);
  const showProgress = progressIndex !== -1;

  const goNext = useCallback(() => {
    const idx = ONBOARDING_ROUTES.indexOf(current);
    const next = ONBOARDING_ROUTES[idx + 1];
    // Cast required because the discriminated-union signature of
    // `navigate` rejects variable route names at compile time.
    if (next) navigation.navigate(next as never);
  }, [current, navigation]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const goTo = useCallback(
    (target: OnboardingRoute) => {
      navigation.navigate(target as never);
    },
    [navigation],
  );

  return useMemo<OnboardingNav>(
    () => ({
      step: progressIndex + 1,
      totalSteps: PROGRESS_ROUTES.length,
      showProgress,
      goNext,
      goBack,
      goTo,
      canGoBack: navigation.canGoBack(),
    }),
    [progressIndex, showProgress, goNext, goBack, goTo, navigation],
  );
}

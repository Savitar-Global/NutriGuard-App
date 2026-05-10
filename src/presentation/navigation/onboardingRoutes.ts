/**
 * Pre-auth onboarding flow — ordered route list.
 *
 * Each screen is a single step in the conversion-focused funnel
 * inspired by Mau Baron's Prayer Lock breakdown:
 * Introduction → Climax → Conclusion → Auth.
 *
 * The `OnboardingFlowStack` registers screens in this exact order;
 * `useOnboardingNav()` derives step number / progress / next-route
 * from the position in this list, so adding/reordering a screen
 * stays a single-file change.
 */
export const ONBOARDING_ROUTES = [
  // Introduction
  'Welcome',
  'Problem',
  'Solution',
  'Name',
  'Birthday',
  'Conditions',
  'Duration',
  'Bombshell',
  'Bridge',
  'QuestionStrategy',
  'ReflectStrategy',
  'QuestionPain',
  'QuestionAnxiety',
  'QuestionGoal',
  'Mirror',
  'Cuisine',
  'Cooking',
  // Climax
  'DemoIntro',
  'DemoAnalysing',
  'DemoResult',
  'StreakStart',
  // Conclusion
  'Personalising',
  'PlanSummary',
  'BodyDetails',
  'Disclaimer',
  'Notifications',
  'Commitment',
  // Auth (final step)
  'SignUp',
  'Login',
] as const;

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[number];

export type OnboardingFlowParamList = Record<OnboardingRoute, undefined>;

/** Routes that count toward the visible progress bar (excludes auth screens). */
export const PROGRESS_ROUTES: ReadonlyArray<OnboardingRoute> =
  ONBOARDING_ROUTES.filter((r) => r !== 'SignUp' && r !== 'Login');

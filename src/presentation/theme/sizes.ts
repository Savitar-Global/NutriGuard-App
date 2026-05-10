export const sizes = {
  // Buttons
  buttonHeight: 50,
  buttonHeightSm: 44,

  // Inputs
  inputHeight: 44,

  // Icons & circular elements
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,
  checkbox: 18,
  backButton: 32,
  logoBox: 30,

  // Borders
  hairline: 1,
  borderInput: 1,
  borderInputFocused: 1.5,
  borderCheckbox: 1.5,

  // Tab bar & nav
  tabBarHeight: 56,
  tabIcon: 22,

  // Home / scan launch
  scanTileIcon: 34,
  scanTileIconRadius: 9,
  lastScanThumb: 40,

  // Misc UI primitives
  circleButton: 28,
  textAreaMinHeight: 80,

  // Profile
  profileAvatar: 48,
  profileCameraBadge: 22,
  addConditionIcon: 28,
  chevronWidth: 8,
  chevronHeight: 14,

  // Bottom-drawer presentation (Type-It-In, etc.)
  drawerFlexBackdrop: 15,
  drawerFlexSheet: 85,
  drawerInputHeight: 200,

  // Result screens
  unrecognisedHero: 88,
  unrecognisedHeroIcon: 44,
  tipDot: 20,
  tipDotIcon: 12,
} as const;

export type Sizes = typeof sizes;

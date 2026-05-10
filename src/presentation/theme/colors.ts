export const colors = {
  // Surfaces
  bg: '#E8E3D8',
  surface: '#F5F1EA',
  card: '#FFFFFF',
  cardAlt: '#FAF8F4',
  cardAmber: '#FDF3DC',
  cardOrange: '#FFF3E0',

  // Ink (text)
  ink: '#2B2117',
  inkSoft: '#6B5E52',
  inkMuted: '#9B8E82',
  inkChevron: '#4B3F33',

  // Borders & dividers
  border: '#E2DBD0',
  borderLight: '#F0EAE0',
  borderInput: '#DDD5C8',
  divider: '#D8D0C6',

  // Brand
  primary: '#3A5239',
  primaryContrast: '#FFFFFF',
  accent: '#C9A870',
  accentDark: '#8B6A2A',
  accentAmber: '#FDF3DC',
  accentBorder: '#E8D9B0',
  accentInk: '#6B4A10',
  accentInkSoft: '#9B7A30',

  // Dashed CTA outline (used by add-condition row)
  borderDashed: '#B8B0A6',

  // Buttons
  buttonSecondary: '#EDE8E0',
  buttonSecondaryFg: '#2B2117',
  buttonDark: '#181210',
  buttonDarkFg: '#FFFFFF',

  // Overlay
  overlayLight: 'rgba(255,255,255,0.85)',
  backdrop: 'rgba(0,0,0,0.4)',

  // Verdict palette
  verdict: {
    allGood: { bg: '#D4EDDA', fg: '#276132' },
    mostlyFine: { bg: '#C8E6C9', fg: '#2E6B34' },
    eatLess: { bg: '#FFF9C4', fg: '#8B5E00' },
    notIdeal: { bg: '#FFE0B2', fg: '#C64A00' },
    skipIt: { bg: '#FFCDD2', fg: '#B71C1C' },
  },

  // Status
  danger: '#C64A00',
  streak: '#B84A00',
  streakBg: '#FFF3E0',
  streakBorder: '#F0D5A0',

  // Surfaces layered on top of the dark primary card (Home scan card)
  onPrimary: {
    text: '#FFFFFF',
    textSoft: 'rgba(255,255,255,0.60)',
    label: 'rgba(255,255,255,0.55)',
    surface: 'rgba(255,255,255,0.14)',
    surfaceElevated: 'rgba(255,255,255,0.18)',
    border: 'rgba(255,255,255,0.20)',
    divider: 'rgba(255,255,255,0.25)',
  },

  // Accent (gold) tinted surfaces — Type-It-In tile, etc.
  accentTint: {
    surface: 'rgba(201,168,112,0.22)',
    surfaceElevated: 'rgba(201,168,112,0.28)',
    border: 'rgba(201,168,112,0.5)',
    textSoft: 'rgba(201,168,112,0.75)',
    chevron: 'rgba(201,168,112,0.6)',
  },

  // Tab bar
  tabActive: '#3A5239',
  tabInactive: '#A09590',
} as const;

export type Colors = typeof colors;

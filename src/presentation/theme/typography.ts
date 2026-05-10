import { Platform, type TextStyle } from 'react-native';

import { colors } from './colors';

const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

const t = <T extends TextStyle>(style: T): T => style;

export const typography = {
  // Display & headings — Georgia serif
  displayLg: t({
    fontFamily: serif,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
  }),
  h1: t({
    fontFamily: serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  }),
  h2: t({
    fontFamily: serif,
    fontSize: 20,
    lineHeight: 24,
    color: colors.ink,
  }),
  h3: t({
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink,
  }),

  // Home greeting "Hi, {name}"
  greeting: t({
    fontFamily: serif,
    fontSize: 22,
    lineHeight: 26,
    color: colors.ink,
  }),
  // Dark scan-launch card title
  scanCardTitle: t({
    fontFamily: serif,
    fontSize: 19,
    lineHeight: 23,
    color: colors.primaryContrast,
  }),

  // Home — scan launch tiles (over dark primary card)
  scanTileTitle: t({
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.primaryContrast,
  }),
  scanTileDesc: t({
    fontSize: 10,
    lineHeight: 13.5,
    color: colors.onPrimary.textSoft,
  }),

  // Home — Type It In tile (gold accent)
  typeItInTitle: t({
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.accent,
  }),
  typeItInDesc: t({
    fontSize: 10,
    lineHeight: 14,
    color: colors.accentTint.textSoft,
  }),

  // Home — last scan card
  lastScanLabel: t({
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
  }),
  lastScanTitle: t({
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.ink,
  }),

  // Tab bar
  tabLabel: t({
    fontSize: 9,
    fontWeight: '500',
  }),

  italic: t({ fontStyle: 'italic' }),

  // Body — system sans
  body: t({ fontSize: 12, lineHeight: 17, color: colors.inkSoft }),
  bodyMd: t({ fontSize: 14, lineHeight: 21, color: colors.inkSoft }),
  bodySm: t({ fontSize: 11, lineHeight: 16, color: colors.inkSoft }),
  bodyXs: t({ fontSize: 10.5, lineHeight: 15, color: colors.inkMuted }),

  // Inputs
  inputText: t({ fontSize: 14, color: colors.ink }),
  inputLabel: t({
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink,
  }),

  // Buttons
  button: t({ fontSize: 15, fontWeight: '600', letterSpacing: -0.2 }),
  buttonSm: t({ fontSize: 14, fontWeight: '500', letterSpacing: -0.2 }),

  // Links & semantic text
  link: t({ fontSize: 13, fontWeight: '600', color: colors.primary }),
  linkInline: t({ fontWeight: '700', color: colors.ink }),

  // Labels (caps utility text)
  label: t({
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  }),

  caption: t({ fontSize: 10, color: colors.inkMuted, letterSpacing: 0.1 }),

  // Status / feedback
  errorText: t({ fontSize: 13, lineHeight: 18, color: colors.danger }),

  // Misc UI
  checkboxLabel: t({ fontSize: 13, lineHeight: 19, color: colors.inkSoft }),
  footerText: t({ fontSize: 13, color: colors.inkMuted }),
  wordmark: t({
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
  }),
  toggleAction: t({
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  }),
  backLabel: t({ fontSize: 13, color: colors.ink, fontWeight: '700' }),
  chevron: t({ fontSize: 16, color: colors.inkChevron }),

  // Chips (selectable pills, e.g. conditions)
  chipLabel: t({ fontSize: 11, fontWeight: '600', lineHeight: 13 }),
  chipIcon: t({ fontSize: 10, fontWeight: '700', lineHeight: 13 }),

  // Profile — avatar row
  avatarInitial: t({
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  }),
  avatarName: t({
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  }),
  avatarEmail: t({
    fontSize: 12,
    color: colors.inkMuted,
  }),

  // Profile — plan card (free + pro)
  planLabel: t({
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  }),
  planHeading: t({
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 22,
  }),
  planSub: t({
    fontSize: 12,
    lineHeight: 16,
  }),
  planCta: t({
    fontSize: 12,
    fontWeight: '600',
  }),

  // Profile — body stats
  statLabel: t({
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  }),
  statValue: t({
    fontFamily: serif,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.ink,
  }),
  statUnit: t({
    fontSize: 13,
    fontWeight: '400',
    color: colors.inkMuted,
  }),

  // Profile — add condition CTA
  addConditionTitle: t({
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  }),
  addConditionSub: t({
    fontSize: 11,
    color: colors.inkMuted,
  }),

  // Profile — header edit link
  editLink: t({
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  }),

  // Profile — settings list row
  settingsRow: t({
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
  }),

  // Iconographic glyphs (tick, plus, etc. rendered as text)
  tick: t({
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.primaryContrast,
  }),
  appleGlyph: t({ fontSize: 17, lineHeight: 20 }),
} as const;

export type Typography = typeof typography;

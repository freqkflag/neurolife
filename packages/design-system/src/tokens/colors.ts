export const mutedDark = {
  background: '#1E2022',
  surface: '#2A2D30',
  surfaceRaised: '#35383C',
  text: '#D4D6D8',
  textMuted: '#9BA1A6',
  accent: '#8B9DAF',
  accentSoft: '#6B7D8F',
  success: '#7A9E7E',
  warning: '#B8A67A',
  danger: '#A67B7B',
  border: '#3D4145',
} as const;

export const softCream = {
  background: '#FDFBF7',
  surface: '#F5F0E8',
  surfaceRaised: '#EDE6DA',
  text: '#3D3A36',
  textMuted: '#6B6560',
  accent: '#7A8B6E',
  accentSoft: '#9AAB8E',
  success: '#6B8F71',
  warning: '#A69060',
  danger: '#9E7070',
  border: '#DDD5C8',
} as const;

export type ThemeColors = typeof mutedDark;

export const themes = {
  mutedDark,
  softCream,
} as const;

export type ThemeName = keyof typeof themes;

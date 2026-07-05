// src/theme/tokens.ts

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const colors = {
  light: {
    background: '#FAFAFA',
    foreground: '#171717',
    card: '#FFFFFF',
    muted: '#F4F4F5',
    mutedForeground: '#71717A',
    primary: '#18181B',
    primaryForeground: '#FFFFFF',
    border: '#E4E4E7',
    destructive: '#DC2626',
  },
  dark: {
    background: '#09090B',
    foreground: '#FAFAFA',
    card: '#18181B',
    muted: '#27272A',
    mutedForeground: '#A1A1AA',
    primary: '#FAFAFA',
    primaryForeground: '#18181B',
    border: '#27272A',
    destructive: '#F87171',
  },
} as const;

import { Platform } from 'react-native';

export const colors = {
  bg: '#0a0a0d',
  surface: '#131318',
  surfaceRaised: '#1a1a22',
  border: '#26262f',
  text: '#e4e4e7',
  textDim: '#8a8a95',
  textFaint: '#55555f',

  accent: '#a78bfa',
  accentStrong: '#8b5cf6',
  accentDim: '#2a2340',

  success: '#4ade80',
  successDim: '#16301f',
  queued: '#f59e0b',
  queuedDim: '#3a2a0d',
  error: '#f87171',
  errorDim: '#3a1a1a',
  offline: '#6b7280',
};

export const stateColor = {
  connecting: colors.textDim,
  idle: colors.textDim,
  running: colors.accent,
  offline: colors.offline,
  error: colors.error,
};

export const fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radii = {
  sm: 6,
  md: 8,
  lg: 10,
  pill: 999,
};

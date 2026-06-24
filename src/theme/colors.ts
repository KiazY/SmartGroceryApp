export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  text: string;
  textMuted: string;
  danger: string;
  disabled: string;
  statusBarStyle: 'light-content' | 'dark-content';
};

export const darkColors: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  surfaceAlt: '#374151',
  border: '#374151',
  primary: '#3B82F6',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  danger: '#EF4444',
  disabled: '#4B5563',
  statusBarStyle: 'light-content',
};

export const lightColors: ThemeColors = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceAlt: '#E5E7EB',
  border: '#E5E7EB',
  primary: '#3B82F6',
  text: '#111827',
  textMuted: '#6B7280',
  danger: '#EF4444',
  disabled: '#D1D5DB',
  statusBarStyle: 'dark-content',
};

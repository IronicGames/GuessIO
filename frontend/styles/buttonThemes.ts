// Button theme variants for consistent styling across the app

export const buttonThemes = {
  primary: {
    color: '#8ecae6', // Light cyan
    textColor: 'black',
    borderColor: '#8ecae6',
    variant: 'filled' as const,
  },
  secondary: {
    color: '#2f3e55', // Dark blue
    textColor: '#e6edf3', // Light grey text
    borderColor: '#8ecae6',
    variant: 'filled' as const,
  },
  outline: {
    color: 'transparent',
    textColor: '#8ecae6',
    borderColor: '#8ecae6',
    variant: 'outline' as const,
  },
} as const;

export type ButtonThemeType = keyof typeof buttonThemes;

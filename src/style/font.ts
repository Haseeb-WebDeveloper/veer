// Aileron font configuration
export const aileron = {
  family: 'Aileron',
  className: 'font-aileron',
  weights: [100, 200, 300, 400, 600, 700, 800, 900] as const,
  weightNames: {
    100: 'Thin',
    200: 'UltraLight',
    300: 'Light',
    400: 'Regular',
    600: 'SemiBold',
    700: 'Bold',
    800: 'Heavy',
    900: 'Black',
  } as const,
  styles: ['normal', 'italic'] as const,
} as const;

// Brimful font configuration
export const brimful = {
  family: 'Brimful',
  className: 'font-brimful',
  weights: [400] as const,
  weightNames: {
    400: 'Regular',
  } as const,
  styles: ['normal', 'italic'] as const,
} as const;

// Font weight type helpers
export type AileronWeight = typeof aileron.weights[number];
export type BrimfulWeight = typeof brimful.weights[number];


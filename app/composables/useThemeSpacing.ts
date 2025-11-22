import { ref, computed } from 'vue';

// Base spacing scale multiplier - adjusts all spacing globally
export type SpacingScale = 'compact' | 'normal' | 'comfortable' | 'spacious' | 'custom';

export const SPACING_SCALES: Record<SpacingScale, number> = {
  compact: 0.75,    // 75% of normal
  normal: 1.0,      // 100% (default)
  comfortable: 1.25, // 125% of normal
  spacious: 1.5,    // 150% of normal
  custom: 1.0,      // Will be overridden by customValue
};

// Base spacing values (in rem) - these are the normal scale
const BASE_SPACING = {
  0: 0,
  0.5: 0.125,  // 2px
  1: 0.25,    // 4px
  1.5: 0.375, // 6px
  2: 0.5,     // 8px
  2.5: 0.625, // 10px
  3: 0.75,    // 12px
  3.5: 0.875, // 14px
  4: 1,       // 16px
  5: 1.25,    // 20px
  6: 1.5,     // 24px
  7: 1.75,    // 28px
  8: 2,       // 32px
  9: 2.25,    // 36px
  10: 2.5,    // 40px
  11: 2.75,   // 44px
  12: 3,      // 48px
  14: 3.5,    // 56px
  16: 4,      // 64px
  20: 5,      // 80px
  24: 6,      // 96px
  28: 7,      // 112px
  32: 8,      // 128px
  36: 9,      // 144px
  40: 10,     // 160px
  44: 11,     // 176px
  48: 12,     // 192px
  52: 13,     // 208px
  56: 14,     // 224px
  60: 15,     // 240px
  64: 16,     // 256px
  72: 18,     // 288px
  80: 20,     // 320px
  96: 24,     // 384px
};

export function useThemeSpacing() {
  const spacingScale = ref<SpacingScale>('normal');
  const customMultiplier = ref<number>(1.0);

  // Get current multiplier
  const multiplier = computed(() => {
    if (spacingScale.value === 'custom') {
      return customMultiplier.value;
    }
    return SPACING_SCALES[spacingScale.value];
  });

  // Initialize from computed styles
  const initializeFromComputed = () => {
    if (import.meta.client) {
      // Try to detect current scale by checking spacing-4 (1rem base)
      const spacing4 = getComputedStyle(document.documentElement)
        .getPropertyValue('--spacing-4')
        .trim();
      
      if (spacing4) {
        const remValue = parseFloat(spacing4.replace('rem', ''));
        if (!isNaN(remValue)) {
          const detectedMultiplier = remValue / BASE_SPACING[4];
          // Find closest matching scale
          const closest = Object.entries(SPACING_SCALES).find(([_, value]) => 
            Math.abs(value - detectedMultiplier) < 0.1
          );
          if (closest) {
            spacingScale.value = closest[0] as SpacingScale;
          } else {
            spacingScale.value = 'custom';
            customMultiplier.value = detectedMultiplier;
          }
        }
      }
    }
  };

  // Get CSS variables object for all spacing values
  const getSpacingCssVars = () => {
    const vars: Record<string, string> = {};
    const mult = multiplier.value;
    
    // Generate all spacing values based on base scale and multiplier
    Object.entries(BASE_SPACING).forEach(([key, baseValue]) => {
      const scaledValue = baseValue * mult;
      vars[`spacing-${key}`] = `${scaledValue}rem`;
    });
    
    // Also set px value for spacing-px
    vars['spacing-px'] = '1px';
    
    return vars;
  };

  return {
    spacingScale,
    customMultiplier,
    multiplier,
    initializeFromComputed,
    getSpacingCssVars,
  };
}


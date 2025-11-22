import { ref } from 'vue';

export function useThemeBorders() {
  // Radius values
  const radius = ref<string>('0.5rem');

  // Initialize from computed styles
  const initializeFromComputed = () => {
    if (import.meta.client) {
      const root = document.documentElement;
      
      // Get radius
      const radiusValue = getComputedStyle(root).getPropertyValue('--radius').trim();
      if (radiusValue) {
        radius.value = radiusValue;
      }
    }
  };

  // Get CSS vars for borders and radius
  const getBorderCssVars = (): Record<string, string> => {
    const vars: Record<string, string> = {};
    
    // Radius - always include main radius
    if (radius.value) {
      vars.radius = radius.value;
    }

    return vars;
  };

  return {
    radius,
    initializeFromComputed,
    getBorderCssVars,
  };
}


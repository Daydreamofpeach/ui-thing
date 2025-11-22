import { ref } from 'vue';
import type { ColorProperty } from './useThemeColors';

// Opacity values for all color properties (0-1 range)
export function useThemeOpacity() {
  const lightOpacity = ref<Record<ColorProperty, number>>({} as Record<ColorProperty, number>);
  const darkOpacity = ref<Record<ColorProperty, number>>({} as Record<ColorProperty, number>);

  // Initialize all opacities to 1 (fully opaque)
  const initializeOpacity = () => {
    if (!import.meta.client) return;
    
    const allProps: ColorProperty[] = [
      'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
      'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
      'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
      'border', 'input', 'ring',
      'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
      'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
      'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
      'surface', 'surface-foreground', 'code', 'code-foreground', 'code-highlight', 'code-number',
      'selection', 'selection-foreground',
    ];

    // Extract opacity from existing color value if it has alpha
    const extractOpacity = (colorValue: string): number => {
      if (!colorValue) return 1;
      const alphaMatch = colorValue.match(/\/\s*([\d.]+)%?\)/);
      if (alphaMatch) {
        const alpha = parseFloat(alphaMatch[1]);
        return alpha > 1 ? alpha / 100 : alpha; // Handle both 0.5 and 50% formats
      }
      return 1; // Default to fully opaque
    };

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    allProps.forEach((prop) => {
      const value = getComputedStyle(root).getPropertyValue(`--${prop}`).trim();
      const opacity = extractOpacity(value);
      
      if (isDark) {
        darkOpacity.value[prop] = opacity;
      } else {
        lightOpacity.value[prop] = opacity;
      }
      
      // Also initialize the other mode with default 1
      if (isDark) {
        lightOpacity.value[prop] = 1;
      } else {
        darkOpacity.value[prop] = 1;
      }
    });
  };

  // Apply opacity to a color value
  const applyOpacity = (colorValue: string, opacity: number): string => {
    // Remove existing opacity if present
    const withoutOpacity = colorValue.replace(/\s*\/\s*[\d.]+%?\)/, ')');
    // Add new opacity
    return `${withoutOpacity} / ${opacity})`;
  };

  return {
    lightOpacity,
    darkOpacity,
    initializeOpacity,
    applyOpacity,
  };
}


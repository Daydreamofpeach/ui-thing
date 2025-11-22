import { ref, computed } from 'vue';

// All color properties from tailwind.css and theme.css
export const ALL_COLOR_PROPERTIES = [
  // Base colors
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  // Chart colors
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  // Sidebar colors
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  // Additional colors
  'surface',
  'surface-foreground',
  'code',
  'code-foreground',
  'code-highlight',
  'code-number',
  'selection',
  'selection-foreground',
] as const;

export type ColorProperty = typeof ALL_COLOR_PROPERTIES[number];

// Check if a string is a valid hex color code
export const isHexColor = (value: string): boolean => {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(value.trim());
};

// Normalize hex color (convert 3-digit to 6-digit)
export const normalizeHex = (hex: string): string => {
  const trimmed = hex.trim();
  if (trimmed.length === 4 && trimmed.startsWith('#')) {
    // Convert #RGB to #RRGGBB
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return trimmed;
};

// Hex to OKLCH conversion (only for color input)
export const hexToOklch = (hex: string): string => {
  // Normalize hex if needed
  const normalizedHex = normalizeHex(hex);
  const r = parseInt(normalizedHex.slice(1, 3), 16) / 255;
  const g = parseInt(normalizedHex.slice(3, 5), 16) / 255;
  const b = parseInt(normalizedHex.slice(5, 7), 16) / 255;
  
  // Convert RGB to Linear RGB
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);
  
  // Convert Linear RGB to OKLab
  const l_ = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
  const m_ = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
  const s_ = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;
  
  const l_cbrt = Math.cbrt(l_);
  const m_cbrt = Math.cbrt(m_);
  const s_cbrt = Math.cbrt(s_);
  
  const L = 0.2104542553 * l_cbrt + 0.7936177850 * m_cbrt - 0.0040720468 * s_cbrt;
  const a = 1.9779984951 * l_cbrt - 2.4285922050 * m_cbrt + 0.4505937099 * s_cbrt;
  const b_ok = 0.0259040371 * l_cbrt + 0.7827717662 * m_cbrt - 0.8086757660 * s_cbrt;
  
  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b_ok * b_ok);
  let H = Math.atan2(b_ok, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(4)})`;
};

// OKLCH to Hex conversion (only for color input display)
export const oklchToHex = (oklch: string): string => {
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return '#000000';
  
  const L = parseFloat(match[1]);
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]) * (Math.PI / 180);
  
  // Convert OKLCH to OKLab
  const a = C * Math.cos(H);
  const b_ok = C * Math.sin(H);
  
  // Convert OKLab to Linear RGB
  const l_cbrt = L + 0.3963377774 * a + 0.2158037573 * b_ok;
  const m_cbrt = L - 0.1055613458 * a - 0.0638541728 * b_ok;
  const s_cbrt = L - 0.0894841775 * a - 1.2914855480 * b_ok;
  
  const l_ = l_cbrt * l_cbrt * l_cbrt;
  const m_ = m_cbrt * m_cbrt * m_cbrt;
  const s_ = s_cbrt * s_cbrt * s_cbrt;
  
  const rLinear = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gLinear = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bLinear = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;
  
  // Convert Linear RGB to RGB
  const fromLinear = (c: number) => {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };
  
  const r = Math.round(fromLinear(rLinear) * 255);
  const g = Math.round(fromLinear(gLinear) * 255);
  const b = Math.round(fromLinear(bLinear) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// HSL to OKLCH conversion (for reading from themes.ts)
export const hslToOklch = (hsl: string): string => {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return 'oklch(0 0 0)';
  
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;
  
  if (isNaN(h) || isNaN(s) || isNaN(l)) return 'oklch(0 0 0)';
  
  // Convert HSL to RGB
  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(1, s));
  const lNorm = Math.max(0, Math.min(1, l));
  
  let r, g, b;
  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }
  
  // Convert RGB to Linear RGB
  const toLinear = (c: number) => {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);
  
  // Convert Linear RGB to OKLab
  const l_ = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
  const m_ = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
  const s_ = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;
  
  const l_cbrt = Math.cbrt(l_);
  const m_cbrt = Math.cbrt(m_);
  const s_cbrt = Math.cbrt(s_);
  
  const L = 0.2104542553 * l_cbrt + 0.7936177850 * m_cbrt - 0.0040720468 * s_cbrt;
  const a = 1.9779984951 * l_cbrt - 2.4285922050 * m_cbrt + 0.4505937099 * s_cbrt;
  const b_ok = 0.0259040371 * l_cbrt + 0.7827717662 * m_cbrt - 0.8086757660 * s_cbrt;
  
  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b_ok * b_ok);
  let H = Math.atan2(b_ok, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(4)})`;
};

export function useThemeColors() {
  // Initialize all color properties with default oklch values for light mode
  const lightColors = ref<Record<ColorProperty, string>>({
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.141 0.005 285.823)',
    card: 'oklch(1 0 0)',
    'card-foreground': 'oklch(0.141 0.005 285.823)',
    popover: 'oklch(1 0 0)',
    'popover-foreground': 'oklch(0.141 0.005 285.823)',
    primary: 'oklch(0.21 0.006 285.885)',
    'primary-foreground': 'oklch(0.985 0 0)',
    secondary: 'oklch(0.967 0.001 286.375)',
    'secondary-foreground': 'oklch(0.21 0.006 285.885)',
    muted: 'oklch(0.967 0.001 286.375)',
    'muted-foreground': 'oklch(0.552 0.016 285.938)',
    accent: 'oklch(0.967 0.001 286.375)',
    'accent-foreground': 'oklch(0.21 0.006 285.885)',
    destructive: 'oklch(0.577 0.245 27.325)',
    'destructive-foreground': 'oklch(0.985 0 0)',
    border: 'oklch(0.92 0.004 286.32)',
    input: 'oklch(0.92 0.004 286.32)',
    ring: 'oklch(0.705 0.015 286.067)',
    'chart-1': 'oklch(0.646 0.222 41.116)',
    'chart-2': 'oklch(0.6 0.118 184.704)',
    'chart-3': 'oklch(0.398 0.07 227.392)',
    'chart-4': 'oklch(0.828 0.189 84.429)',
    'chart-5': 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.985 0 0)',
    'sidebar-foreground': 'oklch(0.141 0.005 285.823)',
    'sidebar-primary': 'oklch(0.21 0.006 285.885)',
    'sidebar-primary-foreground': 'oklch(0.985 0 0)',
    'sidebar-accent': 'oklch(0.967 0.001 286.375)',
    'sidebar-accent-foreground': 'oklch(0.21 0.006 285.885)',
    'sidebar-border': 'oklch(0.92 0.004 286.32)',
    'sidebar-ring': 'oklch(0.705 0.015 286.067)',
    surface: 'oklch(0.98 0 0)',
    'surface-foreground': 'oklch(0.141 0.005 285.823)',
    code: 'oklch(0.98 0 0)',
    'code-foreground': 'oklch(0.141 0.005 285.823)',
    'code-highlight': 'oklch(0.96 0 0)',
    'code-number': 'oklch(0.56 0 0)',
    selection: 'oklch(0.145 0 0)',
    'selection-foreground': 'oklch(1 0 0)',
  });

  // Initialize all color properties with default oklch values for dark mode
  const darkColors = ref<Record<ColorProperty, string>>({
    background: 'oklch(0.141 0.005 285.823)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.21 0.006 285.885)',
    'card-foreground': 'oklch(0.985 0 0)',
    popover: 'oklch(0.21 0.006 285.885)',
    'popover-foreground': 'oklch(0.985 0 0)',
    primary: 'oklch(0.92 0.004 286.32)',
    'primary-foreground': 'oklch(0.21 0.006 285.885)',
    secondary: 'oklch(0.274 0.006 286.033)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.274 0.006 286.033)',
    'muted-foreground': 'oklch(0.705 0.015 286.067)',
    accent: 'oklch(0.274 0.006 286.033)',
    'accent-foreground': 'oklch(0.985 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    'destructive-foreground': 'oklch(0.985 0 0)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.552 0.016 285.938)',
    'chart-1': 'oklch(0.488 0.243 264.376)',
    'chart-2': 'oklch(0.696 0.17 162.48)',
    'chart-3': 'oklch(0.769 0.188 70.08)',
    'chart-4': 'oklch(0.627 0.265 303.9)',
    'chart-5': 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.21 0.006 285.885)',
    'sidebar-foreground': 'oklch(0.985 0 0)',
    'sidebar-primary': 'oklch(0.488 0.243 264.376)',
    'sidebar-primary-foreground': 'oklch(0.985 0 0)',
    'sidebar-accent': 'oklch(0.274 0.006 286.033)',
    'sidebar-accent-foreground': 'oklch(0.985 0 0)',
    'sidebar-border': 'oklch(1 0 0 / 10%)',
    'sidebar-ring': 'oklch(0.552 0.016 285.938)',
    surface: 'oklch(0.2 0 0)',
    'surface-foreground': 'oklch(0.708 0 0)',
    code: 'oklch(0.2 0 0)',
    'code-foreground': 'oklch(0.708 0 0)',
    'code-highlight': 'oklch(0.27 0 0)',
    'code-number': 'oklch(0.72 0 0)',
    selection: 'oklch(0.922 0 0)',
    'selection-foreground': 'oklch(0.205 0 0)',
  });

  // Initialize colors from computed styles
  const initializeFromComputed = () => {
    if (import.meta.client) {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      
      ALL_COLOR_PROPERTIES.forEach((prop) => {
        const value = getComputedStyle(root).getPropertyValue(`--${prop}`).trim();
        if (value) {
          if (isDark) {
            darkColors.value[prop] = value;
          } else {
            lightColors.value[prop] = value;
          }
        }
      });
    }
  };

  // Get CSS vars object for a specific mode
  const getCssVars = (isDark: boolean) => {
    const baseVars: Record<string, string> = {};
    const sourceColors = isDark ? darkColors.value : lightColors.value;
    ALL_COLOR_PROPERTIES.forEach((prop) => {
      baseVars[prop] = sourceColors[prop];
    });
    baseVars.radius = '0.5rem';
    return baseVars;
  };

  // Get current colors based on mode (for backward compatibility)
  const colors = computed(() => {
    if (import.meta.client) {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      return isDark ? darkColors.value : lightColors.value;
    }
    return lightColors.value;
  });

  return {
    lightColors,
    darkColors,
    colors, // Computed for backward compatibility
    initializeFromComputed,
    getCssVars,
  };
}


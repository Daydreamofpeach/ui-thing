<template>
  <div
    v-if="presetsToShow.length > 0"
    class="w-full overflow-hidden mb-8 flex flex-col py-2 -my-2"
    :style="{
      gap: `${rowGapPx}px`,
      maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
    }"
  >
    <MagicMarquee
      v-for="(rowPresets, rowIndex) in presetsByRow"
      :key="`row-${rowIndex}`"
      :pause-on-hover="true"
      :reverse="rowIndex % 2 === 1"
      :repeat="duplicationFactor"
      wrapper-class="[--duration:40s] [--gap:1rem]"
    >
      <div class="flex flex-shrink-0" style="gap: 1rem">
        <div
          v-for="(presetName, index) in rowPresets"
          :key="`${presetName}-${rowIndex}-${index}`"
          class="flex-shrink-0 min-w-[160px] transition-transform duration-200 hover:scale-105 hover:-translate-y-1 hover:z-20"
        >
            <UiButton
              :class="[
                'flex w-full h-full items-center justify-center relative transition-colors duration-200 bg-primary/10 hover:shadow-lg px-4 py-3',
                isSelected(presetName) ? 'ring-2 ring-primary/50 shadow-md' : '',
              ]"
            variant="ghost"
            :style="getButtonStyle(presetName)"
            @click="applyThemePreset(presetName)"
          >
            <div class="flex items-center gap-2.5 text-center">
              <div class="flex gap-1">
                <div
                  class="w-3 h-3 rounded-sm border"
                  :style="{ backgroundColor: getThemeColor(presetName, 'primary') }"
                />
                <div
                  class="w-3 h-3 rounded-sm border"
                  :style="{ backgroundColor: getThemeColor(presetName, 'secondary') }"
                />
                <div
                  class="w-3 h-3 rounded-sm border"
                  :style="{ backgroundColor: getThemeColor(presetName, 'accent') }"
                />
              </div>
              <span class="capitalize px-1 leading-tight">
                {{ presetName.replace(/-/g, ' ') }}
              </span>
            </div>
          </UiButton>
        </div>
      </div>
    </MagicMarquee>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { themes } from '~/utils/themes';
import { useThemeTemplateManagement } from '~/composables/useThemeTemplateManagement';
import MagicMarquee from '~/components/Magic/Marquee.vue';

interface Props {
  presetNames?: string[];
  selectedPreset?: string;
}

const props = withDefaults(defineProps<Props>(), {
  presetNames: () => [],
  selectedPreset: '',
});

const emit = defineEmits<{
  applyTheme: [presetName: string];
}>();

const colorMode = useColorMode();
const currentMode = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'));

// Get config store for theme management
const { theme, setTheme } = useConfigStore();

// All available theme names
const allColors = [
  "matter", "buildit", "lucide", "grove", "cyberpunk", "bubblegum",
  "midnight", "solardark", "zinc", "rose", "blue", "green", "orange",
  "red", "slate", "stone", "gray", "neutral", "yellow", "violet", "brutalism"
];

// Configuration
const numRows = 3;
const duplicationFactor = 4;
const rowGapPx = 16;

// Load custom themes
const { templates: customThemes, loadThemeTemplates } = useThemeTemplateManagement();

onMounted(() => {
  loadThemeTemplates();
});

// Get presets to show (includes custom themes)
const presetsToShow = computed(() => {
  if (props.presetNames && props.presetNames.length > 0) {
    return props.presetNames;
  }
  // Default: show all built-in theme names + custom themes
  const builtInThemes = themes.map((t) => t.name);
  const customThemeNames = customThemes.value.map((t) => t.theme?.name || t.name).filter(Boolean);
  return [...builtInThemes, ...customThemeNames];
});

// Distribute presets across rows
const presetsByRow = computed(() => {
  const rows: string[][] = Array.from({ length: numRows }, () => []);
  presetsToShow.value.forEach((preset, index) => {
    rows[index % numRows].push(preset);
  });
  return rows;
});

// Get theme by name (checks both built-in and custom themes)
const getTheme = (presetName: string) => {
  // First check built-in themes
  const builtInTheme = themes.find((t) => t.name === presetName);
  if (builtInTheme) return builtInTheme;

  // Then check custom themes
  const customTheme = customThemes.value.find(
    (t) => (t.theme?.name || t.name) === presetName
  );
  if (customTheme?.theme) {
    return {
      name: customTheme.theme.name,
      cssVars: customTheme.theme.cssVars,
    };
  }

  return null;
};

// Convert HSL string to RGB for display
const hslToRgb = (hsl: string): string => {
  // HSL format: "h s% l%" (space-separated, s and l have %)
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return '#000000';

  const h = parseFloat(parts[0]);
  if (isNaN(h)) return '#000000';
  
  const s = parseFloat(parts[1].replace('%', ''));
  if (isNaN(s)) return '#000000';
  
  const l = parseFloat(parts[2].replace('%', ''));
  if (isNaN(l)) return '#000000';

  // Normalize values
  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  let r, g, b;

  if (sNorm === 0) {
    r = g = b = lNorm; // achromatic
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

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Get theme color value
const getThemeColor = (presetName: string, colorType: 'primary' | 'secondary' | 'accent'): string => {
  const theme = getTheme(presetName);
  if (!theme) return '#000000';

  const mode = currentMode.value;
  const colorValue = theme.cssVars[mode][colorType];
  return hslToRgb(colorValue);
};

// Get button style
const getButtonStyle = (presetName: string) => {
  const theme = getTheme(presetName);
  if (!theme) return {};

  const mode = currentMode.value;
  const primaryColor = theme.cssVars[mode].primary;
  const foregroundColor = theme.cssVars[mode].foreground;
  const bgColor = hslToRgb(primaryColor);

  // Convert to rgba with opacity
  const rgb = bgColor.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
  const rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`;

  return {
    backgroundColor: rgba,
    color: hslToRgb(foregroundColor),
  };
};

// Check if preset is selected
const isSelected = (presetName: string) => {
  return props.selectedPreset === presetName || theme.value === presetName;
};

// Apply theme preset
const applyThemePreset = (presetName: string) => {
  // Update the theme in the store
  setTheme(presetName as any);
  
  // Apply theme to document (the plugin should handle this, but we'll do it here too for immediate effect)
  if (import.meta.client) {
    document.documentElement.classList.remove(...allColors.map((color) => `theme-${color}`));
    document.documentElement.classList.add(`theme-${presetName}`);
  }
  
  emit('applyTheme', presetName);
};
</script>


<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <UiButton variant="outline" size="sm" @click="copyCode">
          <Icon name="lucide:copy" class="mr-2 size-4" />
          Copy Code
        </UiButton>
        <UiButton variant="outline" size="sm" @click="downloadCode">
          <Icon name="lucide:download" class="mr-2 size-4" />
          Download
        </UiButton>
      </div>
    </div>

    <div class="relative">
      <pre
        class="p-4 rounded-lg border bg-muted overflow-x-auto text-sm font-mono"
      ><code>{{ themeCode }}</code></pre>
      <div
        v-if="copied"
        class="absolute top-4 right-4 text-sm text-primary font-medium"
      >
        Copied!
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { ColorProperty } from '~/composables/useThemeColors';

const props = defineProps<{
  themeName: string;
  themeLabel: string;
  lightColors?: Record<ColorProperty, string>;
  darkColors?: Record<ColorProperty, string>;
  colors?: Record<ColorProperty, string>; // Legacy support
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}>();

const copied = ref(false);

const themeCode = computed(() => {
  // Support both new format (lightColors/darkColors) and legacy format (colors)
  const lightColors = props.lightColors || props.colors || {};
  const darkColors = props.darkColors || props.colors || {};
  
  // Ensure we have valid objects
  if (!lightColors || !darkColors) {
    return '// Theme colors not available';
  }

  const lightColorEntries = Object.entries(lightColors)
    .map(([key, value]) => `      "${key}": "${value}",`)
    .join('\n');
  
  const darkColorEntries = Object.entries(darkColors)
    .map(([key, value]) => `      "${key}": "${value}",`)
    .join('\n');

  return `export const theme = {
  name: "${props.themeName}",
  label: "${props.themeLabel}",
  fonts: {
    heading: "${props.fonts.heading}",
    body: "${props.fonts.body}",
    mono: "${props.fonts.mono}",
  },
  cssVars: {
    light: {
${lightColorEntries}
      radius: "0.5rem",
    },
    dark: {
${darkColorEntries}
      radius: "0.5rem",
    },
  },
};`;
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(themeCode.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const downloadCode = () => {
  const blob = new Blob([themeCode.value], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.themeName}-theme.ts`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>


<template>
  <div class="p-4">
    <div class="grid space-y-1">
      <h1 class="text-base font-semibold text-foreground">Customize</h1>
      <p class="text-xs text-muted-foreground">Pick a style and color for your components.</p>
    </div>
    <div class="space-y-1.5 pt-6">
      <UiLabel for="color" class="text-xs"> Color </UiLabel>
      <div class="grid grid-cols-3 gap-2 py-1.5">
        <UiButton
          v-for="(color, index) in allColors"
          :key="index"
          variant="outline"
          class="h-8 justify-start bg-transparent px-3"
          :class="color === theme ? 'border-2 border-foreground' : ''"
          @click="setTheme(color)"
        >
          <span class="ml-2 text-xs capitalize">
            {{ color }}
          </span>
        </UiButton>
      </div>
      
      <!-- Custom Themes -->
      <div v-if="customThemes.length > 0" class="mt-4 space-y-2">
        <UiLabel class="text-xs text-muted-foreground">Custom Themes</UiLabel>
        <div class="grid grid-cols-1 gap-2">
          <UiButton
            v-for="themeTemplate in customThemes"
            :key="themeTemplate.id"
            variant="outline"
            class="h-auto justify-start bg-transparent px-3 py-2"
            :class="(themeTemplate.theme?.name || themeTemplate.name) === theme ? 'border-2 border-foreground' : ''"
            @click="handleCustomThemeSelect(themeTemplate)"
          >
            <div class="flex items-center gap-2 w-full">
              <div class="flex gap-1 flex-shrink-0">
                <div
                  v-if="themeTemplate.theme?.cssVars?.light"
                  class="w-3 h-3 rounded-sm border"
                  :style="{
                    backgroundColor: hslToRgb(themeTemplate.theme.cssVars.light.primary || '0 0% 0%'),
                  }"
                />
                <div
                  v-if="themeTemplate.theme?.cssVars?.light"
                  class="w-3 h-3 rounded-sm border"
                  :style="{
                    backgroundColor: hslToRgb(themeTemplate.theme.cssVars.light.secondary || '0 0% 0%'),
                  }"
                />
                <div
                  v-if="themeTemplate.theme?.cssVars?.light"
                  class="w-3 h-3 rounded-sm border"
                  :style="{
                    backgroundColor: hslToRgb(themeTemplate.theme.cssVars.light.accent || '0 0% 0%'),
                  }"
                />
              </div>
              <span class="text-xs flex-1 text-left">
                {{ themeTemplate.name }}
              </span>
            </div>
          </UiButton>
        </div>
      </div>
    </div>
    <div class="space-y-1.5 pt-6">
      <UiLabel for="radius" class="text-xs"> Radius </UiLabel>
      <div class="grid grid-cols-5 gap-2 py-1.5">
        <UiButton
          v-for="(r, index) in RADII"
          :key="index"
          variant="outline"
          class="h-8 justify-center px-3"
          :class="r === radius ? 'border-2 border-foreground' : ''"
          @click="setRadius(r)"
        >
          <span class="text-xs">
            {{ r }}
          </span>
        </UiButton>
      </div>
    </div>
    <div class="space-y-1.5 pt-6">
      <UiLabel for="theme" class="text-xs"> Theme </UiLabel>

      <div class="flex space-x-2 py-1.5">
        <UiButton
          class="h-8"
          variant="outline"
          :class="{ 'border-2 border-foreground': !isDark }"
          @click="toggleColorMode"
        >
          <Icon name="lucide:sun" class="mr-2 size-4" />
          <span class="text-xs">Light</span>
        </UiButton>
        <UiButton
          class="h-8"
          variant="outline"
          :class="{ 'border-2 border-foreground': isDark }"
          @click="toggleColorMode"
        >
          <Icon name="lucide:moon" class="mr-2 size-4" />
          <span class="text-xs">Dark</span>
        </UiButton>
      </div>
    </div>

    <!-- Font Selection -->
    <div class="space-y-1.5 pt-6">
      <UiLabel for="heading-font" class="text-xs"> Heading Font </UiLabel>
      <FontSearch
        :selected-font="selectedFonts?.heading || 'Inter'"
        font-type="heading"
        @select="handleHeadingFontSelect"
      />
    </div>

    <div class="space-y-1.5 pt-6">
      <UiLabel for="body-font" class="text-xs"> Body Font </UiLabel>
      <FontSearch
        :selected-font="selectedFonts?.body || 'Inter'"
        font-type="body"
        @select="handleBodyFontSelect"
      />
    </div>

    <div class="space-y-1.5 pt-6">
      <UiLabel for="mono-font" class="text-xs"> Monospace Font </UiLabel>
      <FontSearch
        :selected-font="selectedFonts?.mono || 'JetBrains Mono'"
        font-type="mono"
        @select="handleMonoFontSelect"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useThemeTemplateManagement, type ThemeTemplate } from '~/composables/useThemeTemplateManagement';
  import FontSearch from '~/components/theme/FontSearch.vue';
  import type { FontInfo } from '~/types/fonts';

  defineProps<{
    allColors: Color[];
  }>();

  const { theme, radius, fonts, setRadius, setTheme, setHeadingFont: setHeadingFontStore, setBodyFont: setBodyFontStore, setMonoFont: setMonoFontStore } = useConfigStore();
  
  // Load custom themes
  const { templates: customThemes, loadThemeTemplates } = useThemeTemplateManagement();
  
  onMounted(() => {
    loadThemeTemplates();
  });

  // Convert HSL to RGB for display
  const hslToRgb = (hsl: string): string => {
    const parts = hsl.trim().split(/\s+/);
    if (parts.length < 3) return '#000000';

    const h = parseFloat(parts[0]);
    if (isNaN(h)) return '#000000';
    
    const s = parseFloat(parts[1].replace('%', ''));
    if (isNaN(s)) return '#000000';
    
    const l = parseFloat(parts[2].replace('%', ''));
    if (isNaN(l)) return '#000000';

    const hNorm = (h % 360) / 360;
    const sNorm = Math.max(0, Math.min(100, s)) / 100;
    const lNorm = Math.max(0, Math.min(100, l)) / 100;

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

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  // Handle custom theme selection
  const handleCustomThemeSelect = (themeTemplate: ThemeTemplate) => {
    const themeData = themeTemplate.theme;
    if (!themeData) return;

    // Apply the custom theme name
    const themeName = themeData.name || themeTemplate.name;
    setTheme(themeName as any);

    // Apply fonts if available
    if (themeData.fonts) {
      setHeadingFontStore(themeData.fonts.heading);
      setBodyFontStore(themeData.fonts.body);
      setMonoFontStore(themeData.fonts.mono);
    }

    // Apply CSS variables
    if (import.meta.client && themeData.cssVars) {
      const colorMode = useColorMode();
      const mode = colorMode.value === 'dark' ? 'dark' : 'light';
      const cssVars = themeData.cssVars[mode];
      
      Object.entries(cssVars).forEach(([key, value]) => {
        const cssKey = `--${key.replace(/-/g, '-')}`;
        document.documentElement.style.setProperty(cssKey, value);
      });
    }
  };
  const colorMode = useColorMode();
  const isDark = computed(() => colorMode.value === "dark");
  const toggleColorMode = () => (colorMode.preference = isDark.value ? "light" : "dark");

  // Import RADII from the config file
  const RADII = [0, 0.25, 0.5, 0.625, 0.75, 1];

  // Font selection state
  const selectedFonts = computed(() => {
    if (!fonts.value) {
      return { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' };
    }
    return fonts.value;
  });

  // Font select handlers using FontSearch component
  const handleHeadingFontSelect = (font: FontInfo) => {
    try {
      setHeadingFontStore(font.family);
    } catch (error) {
      console.warn('Could not set heading font:', error);
    }
  };

  const handleBodyFontSelect = (font: FontInfo) => {
    try {
      setBodyFontStore(font.family);
    } catch (error) {
      console.warn('Could not set body font:', error);
    }
  };

  const handleMonoFontSelect = (font: FontInfo) => {
    try {
      setMonoFontStore(font.family);
    } catch (error) {
      console.warn('Could not set mono font:', error);
    }
  };

</script>

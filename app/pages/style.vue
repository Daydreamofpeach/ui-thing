<template>
  <div class="fixed inset-0 z-0 flex flex-col bg-background">
    <!-- Navbar -->
    <div class="flex-shrink-0 w-full border-b">
      <Mainnav />
    </div>

    <!-- Splitter Layout -->
    <div class="flex-1 min-h-0">
      <ClientOnly>
        <UiSplitter class="h-full w-full">
          <!-- Left Panel: Theme Controls -->
          <UiSplitterPanel collapsible :collapsed-size="10" :min-size="20" :default-size="39">
            <div class="h-full flex flex-col overflow-hidden">
              <!-- Header -->
              <div class="flex-shrink-0 border-b p-4 bg-muted/30">
                <div class="flex items-center justify-between mb-3">
                  <h2 class="text-lg font-semibold">Theme Controls</h2>
                  <UiButton 
                    @click="showSaveModal = true" 
                    size="sm"
                    variant="outline"
                  >
                    <Icon name="lucide:save" class="mr-2 size-4" />
                    Save
                  </UiButton>
                </div>
                <p class="text-xs text-muted-foreground">
                  Customize colors and borders in real-time
                </p>
              </div>

              <!-- Scrollable Content -->
              <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
                <!-- Image Color Extractor -->
                <ImageColorExtractor
                  @colors-extracted="handleColorsExtracted"
                  @color-selected="handleColorFromImage"
                  @apply-color="handleColorAppliedFromImage"
                />

                <!-- Theme Selection -->
                <div>
                  <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                    <Icon name="lucide:palette" class="size-4" />
                    Available Themes
                  </h3>
                  <ThemeMarquee
                    :selected-preset="currentTheme"
                    @apply-theme="handleThemeApply"
                  />
                </div>

                <!-- Custom Themes -->
                <div>
                  <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                    <Icon name="lucide:star" class="size-4" />
                    Your Custom Themes
                  </h3>
                  <CustomThemeList
                    :selected-theme-id="currentTheme"
                    @select="handleCustomThemeSelect"
                  />
                </div>

                <!-- Color Customization -->
                <div>
                  <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                    <Icon name="lucide:sliders-horizontal" class="size-4" />
                    Color Customization
                  </h3>
                  <ColorCustomizer
                    :light-colors="themeColors.lightColors.value"
                    :dark-colors="themeColors.darkColors.value"
                    :spacing="{
                      spacingScale: themeSpacing.spacingScale.value,
                      customMultiplier: themeSpacing.customMultiplier.value,
                      multiplier: themeSpacing.multiplier.value,
                    }"
                    :show-spacing="true"
                    @update:color="handleColorUpdate"
                    @update:border="handleBorderUpdate"
                    @update:spacing-scale="handleSpacingScaleUpdate"
                    @update:custom-multiplier="handleCustomMultiplierUpdate"
                  />
                </div>
              </div>
            </div>
          </UiSplitterPanel>
          <UiSplitterHandle with-handle />

          <!-- Right Panel: Vertical Splitter for Examples and Fonts -->
          <UiSplitterPanel :min-size="40" :default-size="61">
            <UiSplitter direction="vertical" class="h-full">
              <!-- Top Panel: Examples -->
              <UiSplitterPanel collapsible :collapsed-size="10" :min-size="30" :default-size="65">
                <div class="h-full flex flex-col overflow-hidden">
                  <!-- Header -->
                  <div class="flex-shrink-0 border-b p-4 bg-muted/30">
                    <h2 class="text-lg font-semibold mb-1">Theme Preview</h2>
                    <p class="text-xs text-muted-foreground">
                      See how your theme looks across different components
                    </p>
                  </div>

                  <!-- Scrollable Examples -->
                  <div class="flex-1 min-h-0 overflow-y-auto p-6 space-y-8">
                    <!-- Style Guide -->
                    <div>
                      <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
                        <Icon name="lucide:eye" class="size-4" />
                        Style Guide
                      </h3>
                      <StyleGuidePreview
                        :colors="themeColors.lightColors.value"
                        :fonts="selectedFonts"
                      />
                    </div>

                    <!-- Component Showcase -->
                    <div>
                      <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
                        <Icon name="lucide:layout-grid" class="size-4" />
                        Component Showcase
                      </h3>
                      <ComponentShowcase />
                    </div>

                    <!-- Chart Examples -->
                    <div>
                      <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
                        <Icon name="lucide:trending-up" class="size-4" />
                        Chart Examples
                      </h3>
                      <ChartExamples />
                    </div>

                    <!-- Code Generation -->
                    <div>
                      <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
                        <Icon name="lucide:code" class="size-4" />
                        Shadcn Theme Configuration
                      </h3>
                      <p class="text-sm text-muted-foreground mb-4">
                        Copy the generated theme configuration for use in your shadcn/ui project.
                      </p>
                      <ThemeCodeGenerator
                        :theme-name="currentTheme"
                        :theme-label="themes.find(t => t.name === currentTheme)?.label || currentTheme"
                        :light-colors="themeColors.lightColors.value"
                        :dark-colors="themeColors.darkColors.value"
                        :fonts="selectedFonts"
                      />
                    </div>
                  </div>
                </div>
              </UiSplitterPanel>
              <UiSplitterHandle with-handle />

              <!-- Bottom Panel: Fonts -->
              <UiSplitterPanel collapsible :collapsed-size="10" :min-size="20" :default-size="35">
                <div class="h-full flex flex-col overflow-hidden">
                  <!-- Header -->
                  <div class="flex-shrink-0 border-b p-4 bg-muted/30">
                    <h2 class="text-lg font-semibold mb-1 flex items-center gap-2">
                      <Icon name="lucide:type" class="size-4" />
                      Font Settings
                    </h2>
                    <p class="text-xs text-muted-foreground">
                      Customize fonts for headings, body text, and monospace code
                    </p>
                  </div>

                  <!-- Scrollable Font Controls -->
                  <div class="flex-1 min-h-0 overflow-y-auto p-4">
                    <FontCustomizer
                      :fonts="selectedFonts"
                      :is-dark="isDark"
                      @update:font="handleFontUpdate"
                      @toggle:mode="toggleColorMode"
                    />
                  </div>
                </div>
              </UiSplitterPanel>
            </UiSplitter>
          </UiSplitterPanel>
        </UiSplitter>
      </ClientOnly>
    </div>
  </div>

  <!-- Save Theme Modal -->
  <ThemeSaveModal
    :open="showSaveModal"
    :theme-data="currentThemeData"
    @close="showSaveModal = false"
    @saved="handleThemeSaved"
  />
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { themes } from '~/utils/themes';
import { getFontFamily } from '~/utils/fonts';
import { SITE_NAME, SITE_KEYWORDS, SITE_URL } from '~/utils/seo';
import ThemeMarquee from '~/components/ThemeMarquee.vue';
import ThemeSaveModal from '~/components/theme/ThemeSaveModal.vue';
import CustomThemeList from '~/components/theme/CustomThemeList.vue';
import ColorCustomizer from '~/components/theme/ColorCustomizer.vue';
import FontCustomizer from '~/components/theme/FontCustomizer.vue';
import StyleGuidePreview from '~/components/theme/StyleGuidePreview.vue';
import ThemeCodeGenerator from '~/components/theme/ThemeCodeGenerator.vue';
import ComponentShowcase from '~/components/theme/ComponentShowcase.vue';
import ChartExamples from '~/components/theme/ChartExamples.vue';
import ImageColorExtractor from '~/components/theme/ImageColorExtractor.vue';
import { useThemeTemplateManagement } from '~/composables/useThemeTemplateManagement';
import { useThemeColors, hslToOklch, hexToOklch, type ColorProperty } from '~/composables/useThemeColors';
import { useThemeBorders } from '~/composables/useThemeBorders';
import { useThemeSpacing } from '~/composables/useThemeSpacing';
import { useGoogleFonts } from '~/composables/useGoogleFonts';
import UiSplitter from '~/components/Ui/Splitter/Splitter.vue';
import UiSplitterPanel from '~/components/Ui/Splitter/Panel.vue';
import UiSplitterHandle from '~/components/Ui/Splitter/Handle.vue';

definePageMeta({ layout: false });

const route = useRoute();
const { theme, setTheme, fonts, setHeadingFont: setHeadingFontStore, setBodyFont: setBodyFontStore, setMonoFont: setMonoFontStore, setRadius: setRadiusStore } = useConfigStore();
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');
const toggleColorMode = () => (colorMode.preference = isDark.value ? 'light' : 'dark');

const currentTheme = computed(() => theme.value || 'zinc');
const selectedFonts = computed(() => {
  if (!fonts.value) {
    return { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' };
  }
  return fonts.value;
});

const themeColors = useThemeColors();
const themeBorders = useThemeBorders();
const themeSpacing = useThemeSpacing();
const { loadFont } = useGoogleFonts();

// Initialize colors from current theme
const initializeColors = () => {
  if (import.meta.client) {
    themeColors.initializeFromComputed();
    themeBorders.initializeFromComputed();
    themeSpacing.initializeFromComputed();
  }
};

// Watch theme changes
watch([currentTheme, isDark], () => {
  initializeColors();
}, { immediate: true });

// Watch custom colors, borders, and spacing and apply in real-time
watch([
  themeColors.lightColors, 
  themeColors.darkColors, 
  themeBorders.radius,
  themeSpacing.spacingScale,
  themeSpacing.customMultiplier,
  themeSpacing.multiplier,
], () => {
  applyCustomTheme();
}, { deep: true });

// Clean up style element on unmount
onUnmounted(() => {
  if (customThemeStyleElement) {
    customThemeStyleElement.remove();
    customThemeStyleElement = null;
  }
});

// Load Google Fonts helper
const legacyFonts = ['Inter', 'IBM Plex Sans', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Helvetica', 'Arial', 'Playfair Display', 'Merriweather', 'Lora', 'Georgia', 'Times New Roman', 'JetBrains Mono', 'Source Code Pro', 'Courier New', 'Fira Code', 'Silkscreen', 'Wallpoet', 'Orbitron', 'Audiowide', 'Press Start 2P'];

// Watch font changes and apply in real-time
watch(selectedFonts, () => {
  if (!legacyFonts.includes(selectedFonts.value.heading)) {
    loadFont(selectedFonts.value.heading, ['400', '500', '600', '700']);
  }
  if (!legacyFonts.includes(selectedFonts.value.body)) {
    loadFont(selectedFonts.value.body, ['400', '500', '600']);
  }
  if (!legacyFonts.includes(selectedFonts.value.mono)) {
    loadFont(selectedFonts.value.mono, ['400', '500', '600', '700']);
  }
  applyCustomTheme();
}, { deep: true });

// Load fonts and active theme on mount
onMounted(() => {
  if (!legacyFonts.includes(selectedFonts.value.heading)) {
    loadFont(selectedFonts.value.heading, ['400', '500', '600', '700']);
  }
  if (!legacyFonts.includes(selectedFonts.value.body)) {
    loadFont(selectedFonts.value.body, ['400', '500', '600']);
  }
  if (!legacyFonts.includes(selectedFonts.value.mono)) {
    loadFont(selectedFonts.value.mono, ['400', '500', '600', '700']);
  }

  // Load and apply saved theme if available
  if (import.meta.client) {
    const activeThemeId = localStorage.getItem('activeThemeId');
    if (activeThemeId) {
      const { getThemeTemplateById } = useThemeTemplateManagement();
      getThemeTemplateById(activeThemeId).then((savedTheme) => {
        if (savedTheme) {
          console.log('🎨 Loading saved theme:', savedTheme.name);
          handleCustomThemeSelect(savedTheme);
        } else {
          // Theme not found, clear the stored ID
          localStorage.removeItem('activeThemeId');
        }
      }).catch((error) => {
        console.error('Failed to load saved theme:', error);
        localStorage.removeItem('activeThemeId');
      });
    }
  }
});

// Save modal state
const showSaveModal = ref(false);
const { loadThemeTemplates, getThemeTemplateById } = useThemeTemplateManagement();

// Current theme data for saving
const currentThemeData = computed(() => {
  return {
    name: `custom-${Date.now()}`,
    label: 'Custom Theme',
    fonts: selectedFonts.value,
    cssVars: {
      light: themeColors.getCssVars(false),
      dark: themeColors.getCssVars(true),
    },
    borders: {
    radius: themeBorders.radius.value,
    },
    spacing: {
      scale: themeSpacing.spacingScale.value,
      customMultiplier: themeSpacing.customMultiplier.value,
    },
  };
});

// Apply custom theme in real-time
let customThemeStyleElement: HTMLStyleElement | null = null;

const applyCustomTheme = () => {
  if (import.meta.client) {
    const themeClass = `theme-${currentTheme.value}`;
    
    if (customThemeStyleElement) {
      customThemeStyleElement.remove();
      customThemeStyleElement = null;
    }
    
    const style = document.createElement('style');
    style.id = 'custom-theme-override';
    
    let css = `.${themeClass} {\n`;
    
    Object.entries(themeColors.lightColors.value).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    
    const borderVars = themeBorders.getBorderCssVars();
    Object.entries(borderVars).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    
    css += '}\n';
    css += `.${themeClass}.dark {\n`;
    
    Object.entries(themeColors.darkColors.value).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    
    Object.entries(borderVars).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    
    css += '}\n';
    css += ':root {\n';
    Object.entries(borderVars).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    
    // Apply spacing variables to :root - these are generated from the base scale multiplier
    // This affects all spacing, padding, margin, and gap utilities globally
    const spacingVars = themeSpacing.getSpacingCssVars();
    Object.entries(spacingVars).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    
    css += '}\n';
    
    style.textContent = css;
    document.head.appendChild(style);
    customThemeStyleElement = style;

    document.documentElement.style.setProperty('--font-heading', getFontFamily(selectedFonts.value.heading));
    document.documentElement.style.setProperty('--font-body', getFontFamily(selectedFonts.value.body));
    document.documentElement.style.setProperty('--font-mono', getFontFamily(selectedFonts.value.mono));
    
    Object.entries(borderVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Apply spacing variables directly to :root for immediate effect
    // These affect all Tailwind spacing utilities (p-*, m-*, gap-*, space-*, etc.)
    Object.entries(spacingVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Apply chart colors to :root so ApexCharts can read them
    // Chart colors need to be on :root, not just in theme class
    const chartColorKeys: ColorProperty[] = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
    const currentMode = isDark.value ? 'dark' : 'light';
    const currentChartColors = currentMode === 'dark' ? themeColors.darkColors.value : themeColors.lightColors.value;
    
    chartColorKeys.forEach((key) => {
      const colorValue = currentChartColors[key];
      if (colorValue) {
        document.documentElement.style.setProperty(`--${key}`, colorValue);
      }
    });
    
    // Update window.Apex.colors dynamically if it exists
    if (typeof window !== 'undefined' && window.Apex) {
      const newChartColors = chartColorKeys.map((key) => {
        const oklchValue = currentChartColors[key];
        return oklchValue ? oklchToHex(oklchValue) : '#93c5fd';
      });
      window.Apex.colors = newChartColors;
    }
  }
};

// Handle color update
const handleColorUpdate = (prop: ColorProperty, value: string, mode: 'light' | 'dark') => {
  if (mode === 'light') {
    themeColors.lightColors.value[prop] = value;
  } else {
    themeColors.darkColors.value[prop] = value;
  }
  applyCustomTheme();
};

// Handle border property update
const handleBorderUpdate = (prop: string, value: string) => {
  (themeBorders as any)[prop].value = value;
  
  if (prop === 'radius' && value) {
    const numericValue = parseFloat(value.replace('rem', '').replace('px', ''));
    if (!isNaN(numericValue)) {
      const remValue = value.includes('px') ? numericValue / 16 : numericValue;
      setRadiusStore(remValue);
    }
  }
  
  applyCustomTheme();
};

// Handle spacing scale update
const handleSpacingScaleUpdate = (scale: string) => {
  themeSpacing.spacingScale.value = scale as any;
  applyCustomTheme();
};

// Handle custom multiplier update
const handleCustomMultiplierUpdate = (multiplier: number) => {
  themeSpacing.customMultiplier.value = multiplier;
  applyCustomTheme();
};

// Handle font update
const handleFontUpdate = (type: 'heading' | 'body' | 'mono', value: string) => {
  if (type === 'heading') setHeadingFontStore(value);
  if (type === 'body') setBodyFontStore(value);
  if (type === 'mono') setMonoFontStore(value);
};

// Handle colors extracted from image
const handleColorsExtracted = (colors: string[]) => {
  console.log('🎨 Colors extracted from image:', colors);
  // Colors are displayed in the ColorPaletteDisplay component
  // User can select individual colors to apply
};

// Handle color selected from image
const handleColorFromImage = (color: string) => {
  console.log('🎨 Color selected from image:', color);
  // This is just for logging - actual application happens via apply-color event
};

// Handle color applied from image (with property selection)
const handleColorAppliedFromImage = (data: { property: string; color: string; modes: { light: boolean; dark: boolean } }) => {
  console.log('🎨 Applying color from image:', data);
  
  const { property, color: oklchColor, modes } = data;
  
  if (modes.light && themeColors.lightColors.value[property as ColorProperty]) {
    themeColors.lightColors.value[property as ColorProperty] = oklchColor;
  }
  
  if (modes.dark && themeColors.darkColors.value[property as ColorProperty]) {
    themeColors.darkColors.value[property as ColorProperty] = oklchColor;
  }
  
  applyCustomTheme();
};

// Handle custom theme selection
const handleCustomThemeSelect = (themeTemplate: any) => {
  const theme = themeTemplate.theme;
  if (!theme) return;

  const getOklch = (value: string) => {
    if (value.startsWith('oklch(')) return value;
    return hslToOklch(value);
  };

  const lightVars = theme.cssVars.light;
  Object.keys(lightVars).forEach((key) => {
    if (key !== 'radius' && themeColors.lightColors.value[key as ColorProperty]) {
      themeColors.lightColors.value[key as ColorProperty] = getOklch(lightVars[key]);
    }
  });

  const darkVars = theme.cssVars.dark || theme.cssVars.light;
  Object.keys(darkVars).forEach((key) => {
    if (key !== 'radius' && themeColors.darkColors.value[key as ColorProperty]) {
      themeColors.darkColors.value[key as ColorProperty] = getOklch(darkVars[key]);
    }
  });

  if (theme.fonts) {
    setHeadingFontStore(theme.fonts.heading);
    setBodyFontStore(theme.fonts.body);
    setMonoFontStore(theme.fonts.mono);
  }

  // Apply borders if available
  if (theme.borders?.radius) {
    themeBorders.radius.value = theme.borders.radius;
    const numericValue = parseFloat(theme.borders.radius.replace('rem', '').replace('px', ''));
    if (!isNaN(numericValue)) {
      const remValue = theme.borders.radius.includes('px') ? numericValue / 16 : numericValue;
      setRadiusStore(remValue);
    }
  }

  // Apply spacing if available
  if (theme.spacing) {
    if (theme.spacing.scale) {
      themeSpacing.spacingScale.value = theme.spacing.scale as any;
    }
    if (theme.spacing.customMultiplier !== undefined) {
      themeSpacing.customMultiplier.value = theme.spacing.customMultiplier;
    }
  }

  // Store active theme ID for persistence
  if (import.meta.client && themeTemplate.id) {
    localStorage.setItem('activeThemeId', themeTemplate.id);
  }

  applyCustomTheme();
};

// Handle theme saved
const handleThemeSaved = (savedTemplate: any) => {
  showSaveModal.value = false;
  
  // Store the saved theme as active
  if (import.meta.client && savedTemplate?.id) {
    localStorage.setItem('activeThemeId', savedTemplate.id);
  }
  
  // Automatically apply the saved theme
  if (savedTemplate) {
    handleCustomThemeSelect(savedTemplate);
  }
  
  loadThemeTemplates();
};

// Theme handlers
const handleThemeApply = (presetName: string) => {
  setTheme(presetName as any);
  // Clear active theme ID when switching to preset
  if (import.meta.client) {
    localStorage.removeItem('activeThemeId');
  }
  initializeColors();
};

// SEO
const title = 'Style Customizer';
const description = 'Customize your theme colors, fonts, and create beautiful designs. Real-time preview with comprehensive component examples.';

useSeoMeta({
  title,
  titleTemplate: `%s | ${SITE_NAME}`,
  description,
  keywords: SITE_KEYWORDS.join(', '),
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
  twitterCard: 'summary_large_image',
  ogUrl: `${SITE_URL}${route.path}`,
});

if (import.meta.server) {
  defineOgImageComponent('Magic', {
    title,
    description,
  });
}
</script>


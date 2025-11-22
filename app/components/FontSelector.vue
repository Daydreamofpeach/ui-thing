<template>
  <div ref="fontSelectorRef" class="relative">
    <!-- Font Selector Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      :title="`Current fonts: ${currentFonts.heading} / ${currentFonts.body} / ${currentFonts.mono}`"
    >
      <Icon name="lucide:type" class="w-4 h-4" />
      <span class="hidden sm:inline">Fonts</span>
      <Icon name="lucide:chevron-down" class="w-4 h-4" />
    </button>

    <!-- Font Selection Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto"
    >
      <div class="p-4 space-y-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Font Selection</h3>
        
        <!-- Heading Font -->
        <div class="space-y-2">
          <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Heading Font</label>
          <FontList
            :selected-font="selectedFonts.heading"
            font-type="heading"
            @select="handleHeadingFontSelect"
          />
        </div>

        <!-- Body Font -->
        <div class="space-y-2">
          <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Body Font</label>
          <FontList
            :selected-font="selectedFonts.body"
            font-type="body"
            @select="handleBodyFontSelect"
          />
        </div>

        <!-- Monospace Font -->
        <div class="space-y-2">
          <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Monospace Font</label>
          <FontList
            :selected-font="selectedFonts.mono"
            font-type="mono"
            @select="handleMonoFontSelect"
          />
        </div>

        <!-- Preview Section -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
          <div class="space-y-2 text-sm">
            <div 
              class="font-bold"
              :style="{ fontFamily: getFontFamily(selectedFonts.heading) }"
            >
              Heading: The quick brown fox jumps over the lazy dog
            </div>
            <div 
              class="font-normal"
              :style="{ fontFamily: getFontFamily(selectedFonts.body) }"
            >
              Body: The quick brown fox jumps over the lazy dog
            </div>
            <div 
              class="font-mono text-xs"
              :style="{ fontFamily: getFontFamily(selectedFonts.mono) }"
            >
              Mono: console.log('Hello World');
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { getFontFamily } from '~/utils/fonts';
import FontList from '~/components/FontList.vue';
import type { FontInfo } from '~/types/fonts';

const { fonts, setHeadingFont, setBodyFont, setMonoFont } = useConfigStore();

// Local state
const isOpen = ref(false);
const fontSelectorRef = ref<HTMLElement>();
const selectedFonts = ref({
  heading: 'Inter',
  body: 'Inter',
  mono: 'JetBrains Mono'
});

// Font update function - shared logic
const updateFont = (type: 'heading' | 'body' | 'mono', fontName: string) => {
  try {
    const fontFamily = getFontFamily(fontName);
    const cssVar = `--font-${type}`;
    
    // Update store
    if (type === 'heading') setHeadingFont(fontName);
    if (type === 'body') setBodyFont(fontName);
    if (type === 'mono') setMonoFont(fontName);
    
    // Apply font to CSS custom properties
    document.documentElement.style.setProperty(cssVar, fontFamily);
    document.body.style.setProperty(cssVar, fontFamily);
    
    // Update local state
    selectedFonts.value[type] = fontName;
  } catch (error) {
    console.warn(`Could not set ${type} font:`, error);
  }
};

// Font select handlers
const handleHeadingFontSelect = (font: FontInfo) => {
  updateFont('heading', font.family);
};

const handleBodyFontSelect = (font: FontInfo) => {
  updateFont('body', font.family);
};

const handleMonoFontSelect = (font: FontInfo) => {
  updateFont('mono', font.family);
};

// Get current fonts from store
const currentFonts = computed(() => {
  return fonts.value || {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono'
  };
});

// Initialize selected fonts from store and apply them
onMounted(() => {
  if (fonts.value) {
    selectedFonts.value = { ...fonts.value };
    // Apply current fonts to CSS custom properties
    updateFont('heading', fonts.value.heading);
    updateFont('body', fonts.value.body);
    updateFont('mono', fonts.value.mono);
  }
});

// Watch for store changes and apply fonts
watch(fonts, (newFonts) => {
  if (newFonts) {
    selectedFonts.value = { ...newFonts };
    // Apply fonts to CSS custom properties when store changes
    updateFont('heading', newFonts.heading);
    updateFont('body', newFonts.body);
    updateFont('mono', newFonts.mono);
  }
}, { immediate: true });

// Close dropdown when clicking outside
onClickOutside(fontSelectorRef, () => {
  isOpen.value = false;
});
</script>

<template>
  <div class="space-y-3">
    <label class="text-sm font-medium">{{ label }}</label>
    
    <!-- Toggle between picker and swatches -->
    <div class="flex gap-2 mb-2">
      <UiButton
        variant="outline"
        size="sm"
        :class="{ 'bg-primary text-primary-foreground': !showSwatches }"
        @click="showSwatches = false"
      >
        <Icon name="lucide:palette" class="size-3 mr-1" />
        Picker
      </UiButton>
      <UiButton
        variant="outline"
        size="sm"
        :class="{ 'bg-primary text-primary-foreground': showSwatches }"
        @click="showSwatches = true"
      >
        <Icon name="lucide:grid" class="size-3 mr-1" />
        Tailwind Colors
      </UiButton>
    </div>

    <!-- Color Picker Mode -->
    <div v-if="!showSwatches" class="grid grid-cols-2 gap-3">
      <!-- Light Mode -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Icon name="lucide:sun" class="size-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Light</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            :value="oklchToHex(lightValue)"
            type="color"
            class="w-10 h-10 rounded border border-border cursor-pointer"
            @input="handleLightColorInput($event)"
          />
          <input
            :value="lightValue"
            type="text"
            class="flex-1 px-2 py-1.5 rounded-md border border-input bg-background text-foreground font-mono text-xs"
            placeholder="oklch(...) or #hex"
            @input="handleLightTextInput($event)"
          />
        </div>
        <!-- Shade Variants (if Tailwind color selected) -->
        <ShadeVariants
          v-if="lightSelectedColor"
          :color-id="lightSelectedColor"
          mode="light"
          @select="handleLightShadeSelect"
        />
      </div>

      <!-- Dark Mode -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Icon name="lucide:moon" class="size-4 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Dark</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            :value="oklchToHex(darkValue)"
            type="color"
            class="w-10 h-10 rounded border border-border cursor-pointer"
            @input="handleDarkColorInput($event)"
          />
          <input
            :value="darkValue"
            type="text"
            class="flex-1 px-2 py-1.5 rounded-md border border-input bg-background text-foreground font-mono text-xs"
            placeholder="oklch(...) or #hex"
            @input="handleDarkTextInput($event)"
          />
        </div>
        <!-- Shade Variants (if Tailwind color selected) -->
        <ShadeVariants
          v-if="darkSelectedColor"
          :color-id="darkSelectedColor"
          mode="dark"
          @select="handleDarkShadeSelect"
        />
      </div>
    </div>

    <!-- Tailwind Swatches Mode -->
    <div v-else class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Icon name="lucide:sun" class="size-4 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">Light</span>
          </div>
          <ColorSwatchSelector
            :label="''"
            :selected-color="lightSelectedColor"
            @update:value="handleLightSwatchSelect"
            @select="handleLightColorIdSelect"
          />
          <!-- Shade Variants (if Tailwind color selected) -->
          <ShadeVariants
            v-if="lightSelectedColor"
            :color-id="lightSelectedColor"
            mode="light"
            @select="handleLightShadeSelect"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Icon name="lucide:moon" class="size-4 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">Dark</span>
          </div>
          <ColorSwatchSelector
            :label="''"
            :selected-color="darkSelectedColor"
            @update:value="handleDarkSwatchSelect"
            @select="handleDarkColorIdSelect"
          />
          <!-- Shade Variants (if Tailwind color selected) -->
          <ShadeVariants
            v-if="darkSelectedColor"
            :color-id="darkSelectedColor"
            mode="dark"
            @select="handleDarkShadeSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { oklchToHex, hexToOklch, isHexColor } from '~/composables/useThemeColors';
import { getColors, type Color } from '~/utils/registry/colors';
import ColorSwatchSelector from './ColorSwatchSelector.vue';
import ShadeVariants from './ShadeVariants.vue';

const props = defineProps<{
  label: string;
  lightValue: string;
  darkValue: string;
}>();

const emit = defineEmits<{
  'update:light': [value: string];
  'update:dark': [value: string];
}>();

const showSwatches = ref(false);
const lightSelectedColor = ref<string>('');
const darkSelectedColor = ref<string>('');

// Find color ID from oklch value by comparing with all colors
const findColorIdFromOklch = (oklch: string): string => {
  const allColors = getColors().flatMap(p => p.colors);
  const hex = oklchToHex(oklch);
  
  // Find matching color by hex
  const match = allColors.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return match?.id || '';
};

// Update selected colors when values change
watch(() => props.lightValue, (val) => {
  if (val) {
    const colorId = findColorIdFromOklch(val);
    // Only update if we found a matching Tailwind color
    if (colorId) {
      lightSelectedColor.value = colorId;
    }
  } else {
    lightSelectedColor.value = '';
  }
}, { immediate: true });

watch(() => props.darkValue, (val) => {
  if (val) {
    const colorId = findColorIdFromOklch(val);
    // Only update if we found a matching Tailwind color
    if (colorId) {
      darkSelectedColor.value = colorId;
    }
  } else {
    darkSelectedColor.value = '';
  }
}, { immediate: true });

const handleLightColorInput = (event: Event) => {
  const hex = (event.target as HTMLInputElement).value;
  const oklch = hexToOklch(hex);
  emit('update:light', oklch);
  // Check if this color matches a Tailwind color
  const colorId = findColorIdFromOklch(oklch);
  lightSelectedColor.value = colorId || '';
};

const handleLightTextInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  // If it's a hex code, convert to OKLCH; otherwise use as-is (assuming OKLCH)
  let oklchValue = value;
  if (isHexColor(value)) {
    oklchValue = hexToOklch(value);
  }
  emit('update:light', oklchValue);
  // Check if this color matches a Tailwind color
  if (oklchValue) {
    const colorId = findColorIdFromOklch(oklchValue);
    lightSelectedColor.value = colorId || '';
  } else {
    lightSelectedColor.value = '';
  }
};

const handleDarkColorInput = (event: Event) => {
  const hex = (event.target as HTMLInputElement).value;
  const oklch = hexToOklch(hex);
  emit('update:dark', oklch);
  // Check if this color matches a Tailwind color
  const colorId = findColorIdFromOklch(oklch);
  darkSelectedColor.value = colorId || '';
};

const handleDarkTextInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  // If it's a hex code, convert to OKLCH; otherwise use as-is (assuming OKLCH)
  let oklchValue = value;
  if (isHexColor(value)) {
    oklchValue = hexToOklch(value);
  }
  emit('update:dark', oklchValue);
  // Check if this color matches a Tailwind color
  if (oklchValue) {
    const colorId = findColorIdFromOklch(oklchValue);
    darkSelectedColor.value = colorId || '';
  } else {
    darkSelectedColor.value = '';
  }
};

const handleLightSwatchSelect = (oklch: string) => {
  emit('update:light', oklch);
  // Update selected color ID so shade variants show
  lightSelectedColor.value = findColorIdFromOklch(oklch);
};

const handleLightColorIdSelect = (colorId: string, oklch: string) => {
  lightSelectedColor.value = colorId;
  emit('update:light', oklch);
};

const handleDarkSwatchSelect = (oklch: string) => {
  emit('update:dark', oklch);
  // Update selected color ID so shade variants show
  darkSelectedColor.value = findColorIdFromOklch(oklch);
};

const handleDarkColorIdSelect = (colorId: string, oklch: string) => {
  darkSelectedColor.value = colorId;
  emit('update:dark', oklch);
};

const handleLightShadeSelect = (oklch: string) => {
  emit('update:light', oklch);
  // Update selected color ID to match the new shade
  lightSelectedColor.value = findColorIdFromOklch(oklch);
};

const handleDarkShadeSelect = (oklch: string) => {
  emit('update:dark', oklch);
  // Update selected color ID to match the new shade
  darkSelectedColor.value = findColorIdFromOklch(oklch);
};
</script>


<template>
  <div class="space-y-2">
    <p class="text-xs text-muted-foreground">Shade Variants</p>
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="shade in shadeVariants"
        :key="shade.id"
        class="relative w-6 h-6 rounded border transition-all hover:scale-110"
        :class="{
          'border-primary ring-1 ring-primary': isSelected(shade.id),
          'border-border': !isSelected(shade.id),
        }"
        :style="{ backgroundColor: shade.hex }"
        :title="shade.id"
        @click="selectShade(shade)"
      >
        <div
          v-if="isSelected(shade.id)"
          class="absolute inset-0 flex items-center justify-center"
        >
          <Icon
            name="lucide:check"
            class="size-2"
            :style="{ color: shade.foreground }"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getColors, type Color } from '~/utils/registry/colors';
import { hexToOklch } from '~/composables/useThemeColors';

const props = defineProps<{
  colorId: string; // Format: "colorName-scale" e.g., "blue-500"
  mode: 'light' | 'dark';
}>();

const emit = defineEmits<{
  'select': [oklch: string];
}>();

// Extract color name from colorId (e.g., "blue-500" -> "blue")
const colorName = computed(() => {
  if (!props.colorId) return '';
  return props.colorId.split('-')[0];
});

// Get all shades for the selected color
const shadeVariants = computed(() => {
  if (!colorName.value) return [];
  
  const allPalettes = getColors();
  const palette = allPalettes.find(p => p.name === colorName.value);
  return palette?.colors || [];
});

const isSelected = (shadeId: string) => {
  return shadeId === props.colorId;
};

const selectShade = (shade: Color) => {
  const oklch = hexToOklch(shade.hex);
  emit('select', oklch);
};
</script>


<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium">{{ label }}</label>
      <UiButton
        v-if="selectedColor"
        variant="ghost"
        size="sm"
        @click="clearSelection"
      >
        <Icon name="lucide:x" class="size-3" />
      </UiButton>
    </div>
    
    <!-- Tailwind Color Palettes -->
    <div class="space-y-4">
      <div
        v-for="palette in colorPalettes"
        :key="palette.name"
        class="space-y-2"
      >
        <div class="flex items-center gap-2">
          <h4 class="text-xs font-medium text-muted-foreground capitalize">
            {{ palette.name }}
          </h4>
          <div
            v-if="selectedColor && selectedColor.startsWith(palette.name)"
            class="text-xs text-primary"
          >
            Selected
          </div>
        </div>
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="color in palette.colors"
            :key="color.id"
            class="relative w-8 h-8 rounded border-2 transition-all hover:scale-110"
            :class="{
              'border-primary ring-2 ring-primary ring-offset-1': selectedColor === color.id,
              'border-border': selectedColor !== color.id,
            }"
            :style="{ backgroundColor: color.hex }"
            :title="`${palette.name}-${color.scale} - ${color.hex}`"
            @click="selectColor(color)"
          >
            <div
              v-if="selectedColor === color.id"
              class="absolute inset-0 flex items-center justify-center"
            >
              <Icon
                name="lucide:check"
                class="size-3"
                :style="{ color: color.foreground }"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getColors, type Color } from '~/utils/registry/colors';
import { hexToOklch } from '~/composables/useThemeColors';

const props = defineProps<{
  label: string;
  selectedColor?: string; // Format: "colorName-scale" e.g., "blue-500"
}>();

const emit = defineEmits<{
  'update:value': [value: string]; // Emits oklch value
  'select': [colorId: string, oklch: string]; // Emits color ID and oklch
}>();

const colorPalettes = getColors();

const selectColor = (color: Color) => {
  // Convert hex to oklch
  const oklch = hexToOklch(color.hex);
  
  // Emit both the color ID and the oklch value
  emit('update:value', oklch);
  emit('select', color.id, oklch);
};

const clearSelection = () => {
  emit('update:value', '');
  emit('select', '', '');
};
</script>


<template>
  <div class="space-y-4">
    <div>
      <h4 class="text-sm font-medium mb-3 flex items-center gap-2">
        <Icon name="lucide:spacing" class="size-4" />
        Global Spacing Scale
      </h4>
      <p class="text-xs text-muted-foreground mb-3">
        Adjust the base spacing scale to affect padding, margin, gap, and spacing for all UI elements.
      </p>
      
      <div class="space-y-3">
        <div>
          <label class="text-xs text-muted-foreground mb-2 block">
            Spacing Scale
          </label>
          <UiSelect
            :model-value="spacingScale"
            @update:model-value="updateScale($event)"
          >
            <UiSelectTrigger class="h-9">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="compact">
                Compact (75%)
              </UiSelectItem>
              <UiSelectItem value="normal">
                Normal (100%)
              </UiSelectItem>
              <UiSelectItem value="comfortable">
                Comfortable (125%)
              </UiSelectItem>
              <UiSelectItem value="spacious">
                Spacious (150%)
              </UiSelectItem>
              <UiSelectItem value="custom">
                Custom
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div v-if="spacingScale === 'custom'">
          <label class="text-xs text-muted-foreground mb-2 block">
            Custom Multiplier ({{ customMultiplier.toFixed(2) }}x)
          </label>
          <UiSlider
            v-model="sliderValue"
            :min="0.5"
            :max="2"
            :step="0.05"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.5x</span>
            <span>2x</span>
          </div>
        </div>

        <div class="p-3 bg-muted/30 rounded-md">
          <div class="text-xs text-muted-foreground mb-2">Preview:</div>
          <div class="space-y-1 text-xs">
            <div>p-4: {{ previewValue(4) }}</div>
            <div>m-2: {{ previewValue(2) }}</div>
            <div>gap-3: {{ previewValue(3) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { SpacingScale } from '~/composables/useThemeSpacing';

const BASE_SPACING: Record<number, number> = {
  4: 1,    // 1rem base
  2: 0.5,  // 0.5rem
  3: 0.75, // 0.75rem
};

const props = defineProps<{
  spacingScale: SpacingScale;
  customMultiplier: number;
  multiplier: number;
}>();

const emit = defineEmits<{
  'update:scale': [scale: SpacingScale];
  'update:customMultiplier': [multiplier: number];
}>();

// Slider uses array format
const sliderValue = ref([props.customMultiplier]);

// Watch slider changes and emit
watch(sliderValue, (newValue) => {
  if (newValue && newValue[0] !== undefined) {
    emit('update:customMultiplier', newValue[0]);
  }
});

// Watch prop changes to update slider
watch(() => props.customMultiplier, (newValue) => {
  if (sliderValue.value[0] !== newValue) {
    sliderValue.value = [newValue];
  }
});

const previewValue = (size: number) => {
  const base = BASE_SPACING[size] || 1;
  const scaled = base * props.multiplier;
  return `${scaled.toFixed(2)}rem`;
};

const updateScale = (scale: SpacingScale) => {
  emit('update:scale', scale);
};
</script>


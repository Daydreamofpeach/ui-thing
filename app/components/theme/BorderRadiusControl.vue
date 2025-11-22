<template>
  <div class="space-y-4">
    <div>
      <h4 class="text-sm font-medium mb-3">Border Radius</h4>
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <label class="text-xs text-muted-foreground w-24">All Sides</label>
          <UiSelect :model-value="radius || ''" @update:model-value="handleRadiusInput">
            <UiSelectTrigger class="flex-1">
              <UiSelectValue placeholder="Select radius" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="option in radiusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  radius?: string;
}>();

const emit = defineEmits<{
  'update:radius': [value: string];
}>();

// Radius options (common Tailwind values)
const radiusOptions = [
  { value: '0', label: '0 (none)' },
  { value: '0.125rem', label: '0.125rem (2px)' },
  { value: '0.25rem', label: '0.25rem (4px)' },
  { value: '0.375rem', label: '0.375rem (6px)' },
  { value: '0.5rem', label: '0.5rem (8px)' },
  { value: '0.625rem', label: '0.625rem (10px)' },
  { value: '0.75rem', label: '0.75rem (12px)' },
  { value: '1rem', label: '1rem (16px)' },
  { value: '1.5rem', label: '1.5rem (24px)' },
  { value: '2rem', label: '2rem (32px)' },
  { value: '9999px', label: '9999px (full)' },
];

const handleRadiusInput = (value: string) => {
  emit('update:radius', value);
};
</script>


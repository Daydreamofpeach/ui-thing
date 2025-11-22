<template>
  <div class="space-y-2">
    <label class="text-sm font-medium">{{ label }}</label>
    <div class="flex items-center gap-3">
      <input
        :value="oklchToHex(value)"
        type="color"
        class="w-12 h-12 rounded border border-border cursor-pointer"
        @input="handleColorInput($event)"
      />
      <input
        :value="value"
        type="text"
        class="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground font-mono text-xs"
        placeholder="oklch(...) or #hex"
        @input="handleTextInput($event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { oklchToHex, hexToOklch, isHexColor } from '~/composables/useThemeColors';

defineProps<{
  label: string;
  value: string;
}>();

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const handleColorInput = (event: Event) => {
  const hex = (event.target as HTMLInputElement).value;
  emit('update:value', hexToOklch(hex));
};

const handleTextInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  // If it's a hex code, convert to OKLCH; otherwise use as-is (assuming OKLCH)
  if (isHexColor(value)) {
    emit('update:value', hexToOklch(value));
  } else {
    emit('update:value', value);
  }
};
</script>


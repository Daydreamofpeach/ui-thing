<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium">{{ label }}</label>
      <span class="text-xs text-muted-foreground">{{ Math.round(opacity * 100) }}%</span>
    </div>
    <div class="flex items-center gap-3">
      <input
        :value="opacity"
        type="range"
        min="0"
        max="1"
        step="0.01"
        class="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
        @input="handleInput($event)"
      />
      <input
        :value="Math.round(opacity * 100)"
        type="number"
        min="0"
        max="100"
        class="w-16 px-2 py-1 rounded-md border border-input bg-background text-foreground text-xs"
        @input="handleNumberInput($event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string;
  opacity: number;
}>();

const emit = defineEmits<{
  'update:opacity': [value: number];
}>();

const handleInput = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value);
  emit('update:opacity', value);
};

const handleNumberInput = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value);
  if (!isNaN(value) && value >= 0 && value <= 100) {
    emit('update:opacity', value / 100);
  }
};
</script>


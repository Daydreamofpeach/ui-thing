<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold mb-4">Fonts</h3>
      <div class="space-y-6">
        <!-- Heading Font -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Heading Font</label>
          <FontSearch
            :selected-font="fonts.heading"
            font-type="heading"
            @select="handleFontSelect('heading', $event)"
          />
        </div>

        <!-- Body Font -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Body Font</label>
          <FontSearch
            :selected-font="fonts.body"
            font-type="body"
            @select="handleFontSelect('body', $event)"
          />
        </div>

        <!-- Monospace Font -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Monospace Font</label>
          <FontSearch
            :selected-font="fonts.mono"
            font-type="mono"
            @select="handleFontSelect('mono', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Theme Mode Toggle -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Theme Mode</label>
      <div class="flex gap-2">
        <UiButton
          variant="outline"
          :class="{ 'border-2 border-foreground': !isDark }"
          @click="toggleColorMode"
        >
          <Icon name="lucide:sun" class="mr-2 size-4" />
          Light
        </UiButton>
        <UiButton
          variant="outline"
          :class="{ 'border-2 border-foreground': isDark }"
          @click="toggleColorMode"
        >
          <Icon name="lucide:moon" class="mr-2 size-4" />
          Dark
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FontInfo } from '~/types/fonts';
import FontSearch from './FontSearch.vue';

const props = defineProps<{
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  isDark: boolean;
}>();

const emit = defineEmits<{
  'update:font': [type: 'heading' | 'body' | 'mono', value: string];
  'toggle:mode': [];
}>();

const handleFontSelect = (type: 'heading' | 'body' | 'mono', font: FontInfo) => {
  emit('update:font', type, font.family);
};

const toggleColorMode = () => {
  emit('toggle:mode');
};
</script>


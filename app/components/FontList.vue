<template>
  <div class="space-y-2">
    <!-- Search Input -->
    <div class="relative">
      <Icon
        name="lucide:search"
        class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
      <UiInput
        v-model="searchQuery"
        placeholder="Search fonts..."
        class="pl-9"
      />
    </div>

    <!-- Font List -->
    <div class="space-y-1 max-h-[300px] overflow-y-auto pr-2">
      <div v-if="isLoading" class="text-center py-8">
        <Icon name="lucide:loader-2" class="size-5 animate-spin text-primary mx-auto mb-2" />
        <p class="text-xs text-muted-foreground">Loading fonts...</p>
      </div>

      <div v-else-if="error" class="text-center py-4">
        <p class="text-xs text-destructive">{{ error }}</p>
      </div>

      <div v-else-if="filteredFonts.length === 0" class="text-center py-4">
        <p class="text-xs text-muted-foreground">No fonts found</p>
      </div>

      <button
        v-else
        v-for="font in filteredFonts"
        :key="font.family"
        class="w-full text-left p-2 rounded-md border cursor-pointer hover:bg-muted transition-colors"
        :class="{ 'border-primary bg-primary/5': selectedFont === font.family }"
        @click="selectFont(font)"
      >
        <div class="flex items-center justify-between">
          <p
            class="text-sm font-medium"
            :style="{ fontFamily: `'${font.family}', ${getCategoryFallback(font.category)}` }"
          >
            {{ font.family }}
          </p>
          <Icon
            v-if="selectedFont === font.family"
            name="lucide:check"
            class="size-4 text-primary flex-shrink-0"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGoogleFonts } from '~/composables/useGoogleFonts';
import type { FontInfo, FilterFontCategory } from '~/types/fonts';

const props = defineProps<{
  selectedFont?: string;
  fontType: 'heading' | 'body' | 'mono';
}>();

const emit = defineEmits<{
  'select': [font: FontInfo];
}>();

const { fonts, isLoading, error, searchFonts, loadFont } = useGoogleFonts();
const searchQuery = ref('');

// Load all fonts at once (use a large limit)
const loadAllFonts = async () => {
  const category: FilterFontCategory = props.fontType === 'mono' ? 'monospace' : 'all';
  // Load a large number of fonts (1000 should cover all Google Fonts)
  await searchFonts({
    query: '',
    category,
    limit: 1000,
    offset: 0,
  });
};

// Filter fonts by search query and sort alphabetically
const filteredFonts = computed(() => {
  let filtered = fonts.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(font =>
      font.family.toLowerCase().includes(query)
    );
  }

  // Sort alphabetically
  return filtered.sort((a, b) => a.family.localeCompare(b.family));
});

const getCategoryFallback = (category: string): string => {
  const fallbacks: Record<string, string> = {
    'sans-serif': 'sans-serif',
    serif: 'serif',
    display: 'sans-serif',
    handwriting: 'cursive',
    monospace: 'monospace',
  };
  return fallbacks[category] || 'sans-serif';
};

const selectFont = (font: FontInfo) => {
  // Load the font
  loadFont(font.family, font.variants);
  
  // Emit selection
  emit('select', font);
};

// Load all fonts on mount
onMounted(() => {
  loadAllFonts();
});

// Reload when font type changes
watch(() => props.fontType, () => {
  loadAllFonts();
});
</script>


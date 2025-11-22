<template>
  <div class="space-y-4">
    <!-- Search and Filter -->
    <div class="space-y-3">
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <UiInput
            v-model="searchQuery"
            placeholder="Search fonts..."
            class="pl-9"
            @input="handleSearch"
          />
        </div>
        <UiSelect v-model="selectedCategory" @update:model-value="handleCategoryChange">
          <UiSelectTrigger class="w-[180px]">
            <UiSelectValue placeholder="Category" />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem value="all">All Categories</UiSelectItem>
            <UiSelectItem value="sans-serif">Sans Serif</UiSelectItem>
            <UiSelectItem value="serif">Serif</UiSelectItem>
            <UiSelectItem value="display">Display</UiSelectItem>
            <UiSelectItem value="handwriting">Handwriting</UiSelectItem>
            <UiSelectItem value="monospace">Monospace</UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
    </div>

    <!-- Font List -->
    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2">
      <div v-if="isLoading && fonts.length === 0" class="text-center py-8">
        <Icon name="lucide:loader-2" class="size-6 animate-spin text-primary mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">Loading fonts...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <div v-else-if="fonts.length === 0" class="text-center py-8">
        <p class="text-sm text-muted-foreground">No fonts found</p>
      </div>

      <div
        v-else
        v-for="font in fonts"
        :key="font.family"
        class="p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors"
        :class="{ 'border-primary bg-primary/5': selectedFont === font.family }"
        @click="selectFont(font)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p
              class="font-medium text-sm"
              :style="{ fontFamily: `'${font.family}', ${getCategoryFallback(font.category)}` }"
            >
              {{ font.family }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <UiBadge variant="outline" class="text-xs">
                {{ font.category }}
              </UiBadge>
              <span v-if="font.variable" class="text-xs text-muted-foreground">Variable</span>
            </div>
          </div>
          <Icon
            v-if="selectedFont === font.family"
            name="lucide:check"
            class="size-4 text-primary"
          />
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !isLoading" class="pt-2">
        <UiButton
          variant="outline"
          class="w-full"
          @click="loadMoreFonts"
        >
          Load More
        </UiButton>
      </div>

      <div v-if="isLoading && fonts.length > 0" class="text-center py-4">
        <Icon name="lucide:loader-2" class="size-4 animate-spin text-primary mx-auto" />
      </div>
    </div>

    <!-- Selected Font Info -->
    <div v-if="selectedFont" class="pt-4 border-t">
      <p class="text-xs text-muted-foreground mb-2">Selected:</p>
      <p
        class="text-lg font-medium"
        :style="{ fontFamily: `'${selectedFont}', sans-serif` }"
      >
        {{ selectedFont }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useGoogleFonts } from '~/composables/useGoogleFonts';
import type { FontInfo, FilterFontCategory } from '~/types/fonts';
import { useDebounceFn } from '@vueuse/core';

const { fonts, isLoading, error, hasMore, searchFonts, loadFont } = useGoogleFonts();

const props = defineProps<{
  selectedFont?: string;
  fontType: 'heading' | 'body' | 'mono';
}>();

const emit = defineEmits<{
  'select': [font: FontInfo];
}>();

const searchQuery = ref('');
const selectedCategory = ref<FilterFontCategory>('all');
const currentQuery = ref('');
const currentCategory = ref<FilterFontCategory>('all');

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

const handleSearch = useDebounceFn(async () => {
  currentQuery.value = searchQuery.value;
  currentCategory.value = selectedCategory.value;
  await searchFonts({
    query: searchQuery.value,
    category: selectedCategory.value,
    limit: 20,
    offset: 0,
  });
}, 300);

const handleCategoryChange = async () => {
  currentQuery.value = searchQuery.value;
  currentCategory.value = selectedCategory.value;
  await searchFonts({
    query: searchQuery.value,
    category: selectedCategory.value,
    limit: 20,
    offset: 0,
  });
};

const selectFont = (font: FontInfo) => {
  // Load the font
  loadFont(font.family, font.variants);
  
  // Emit selection
  emit('select', font);
};

const loadMoreFonts = async () => {
  if (!hasMore.value || isLoading.value) return;

  await searchFonts({
    query: currentQuery.value,
    category: currentCategory.value,
    offset: fonts.value.length,
  });
};

// Initial load
onMounted(async () => {
  // Filter by category based on font type
  const category: FilterFontCategory = props.fontType === 'mono' ? 'monospace' : 'all';
  selectedCategory.value = category;
  
  await searchFonts({
    query: '',
    category,
    limit: 20,
    offset: 0,
  });
});

// Watch for category changes based on font type
watch(() => props.fontType, (newType) => {
  const category: FilterFontCategory = newType === 'mono' ? 'monospace' : 'all';
  selectedCategory.value = category;
  searchFonts({
    query: searchQuery.value,
    category,
    limit: 20,
    offset: 0,
  });
});
</script>


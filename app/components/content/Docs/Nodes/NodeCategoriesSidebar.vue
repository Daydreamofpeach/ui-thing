<template>
  <div class="flex flex-col gap-5">
    <p class="text-sm font-semibold">Node Categories</p>
    <nav class="flex flex-col gap-1">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          activeCategory.value === category.id
            ? 'bg-accent text-accent-foreground font-medium'
            : 'text-muted-foreground'
        ]"
        @click="scrollToCategory(category.id)"
      >
        <Icon 
          :name="category.icon?.replace('i-lucide-', 'lucide:') || category.icon || 'lucide:box'" 
          class="size-4 shrink-0" 
        />
        <span class="truncate">{{ category.name }}</span>
        <UiBadge 
          v-if="getFilteredNodesByCategory(category.id).length > 0" 
          variant="secondary" 
          class="ml-auto shrink-0 text-xs"
        >
          {{ getFilteredNodesByCategory(category.id).length }}
        </UiBadge>
      </button>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useNodeMetadata } from "~/components/canvas/composables/useNodeMetadata";
import { useNodeCategoryState } from "./composables/useNodeCategoryState";

const { getCategories, getNodesByCategory } = useNodeMetadata();
const { activeCategory, setActiveCategory } = useNodeCategoryState();

// Filter out programming and arrows categories
const categories = computed(() => {
  return getCategories().filter(
    cat => cat.id !== 'programming' && cat.id !== 'arrows'
  );
});

// Filter out arrow and programming nodes
const getFilteredNodesByCategory = (categoryId: string) => {
  const nodes = getNodesByCategory(categoryId as any);
  const excludeIds = ['arrowRight', 'arrowLeft', 'arrowUp', 'arrowDown', 'database', 'api', 'server', 'cloud'];
  return nodes.filter(node => !excludeIds.includes(node.id));
};

// Watch for scroll position to update active category
const updateActiveCategory = () => {
  // Find which category content is currently visible
  const categoryContents = categories.value.map(cat => {
    const content = document.querySelector(`[data-category-content="${cat.id}"]`);
    if (!content) return null;
    
    const rect = content.getBoundingClientRect();
    
    return {
      id: cat.id,
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height
    };
  }).filter(Boolean) as Array<{ id: string; top: number; bottom: number; height: number }>;

  if (categoryContents.length === 0) return;

  // Find the content that's most visible
  const viewportHeight = window.innerHeight;
  let mostVisible = categoryContents[0];
  let maxVisibility = 0;

  for (const content of categoryContents) {
    const visibleTop = Math.max(0, content.top);
    const visibleBottom = Math.min(viewportHeight, content.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibility = visibleHeight / Math.max(content.height, 1);

    if (visibility > maxVisibility) {
      maxVisibility = visibility;
      mostVisible = content;
    }
  }

  if (mostVisible && maxVisibility > 0.2) {
    setActiveCategory(mostVisible.id);
  }
};

const scrollToCategory = (categoryId: string) => {
  // Update the active category immediately - this will switch the tabs
  setActiveCategory(categoryId);
  
  // Update URL hash
  if (import.meta.client) {
    window.history.replaceState(null, '', `#${categoryId}`);
    
    // Scroll to top of content area after tab switch
    setTimeout(() => {
      const contentArea = document.querySelector('[data-category-content]')?.closest('.mx-auto');
      if (contentArea) {
        const yOffset = 80;
        const y = (contentArea as HTMLElement).getBoundingClientRect().top + window.pageYOffset - yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 100);
  }
};

onMounted(() => {
  // Set initial active category
  updateActiveCategory();
  
  // Update active category on scroll
  window.addEventListener('scroll', updateActiveCategory, { passive: true });
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveCategory);
  });
});
</script>


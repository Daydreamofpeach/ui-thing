<template>
  <div class="mx-auto w-full max-w-6xl">
    <UiTabs v-model="activeCategory" class="w-full">
      <div class="w-full">
        <UiTabsContent 
          v-for="category in categories" 
          :key="category.id" 
          :value="category.id" 
          class="m-0"
          :data-category-content="category.id"
        >
          <NodeCategoryContent :category="category" :nodes="getFilteredNodesByCategory(category.id)" />
        </UiTabsContent>
      </div>
    </UiTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from "vue";
import { useNodeMetadata } from "~/components/canvas/composables/useNodeMetadata";
import { useNodeCategoryState } from "./composables/useNodeCategoryState";
import UiTabs from "~/components/Ui/Tabs/Tabs.vue";
import UiTabsContent from "~/components/Ui/Tabs/Content.vue";
import NodeCategoryContent from "./NodeCategoryContent.vue";

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

// Initialize active category
if (categories.value.length > 0 && !categories.value.find(c => c.id === activeCategory.value)) {
  setActiveCategory(categories.value[0].id);
}

// Listen for category changes from URL hash or sidebar
watch(() => categories.value, (newCategories) => {
  if (newCategories.length > 0 && !newCategories.find(c => c.id === activeCategory.value)) {
    setActiveCategory(newCategories[0].id);
  }
}, { immediate: true });

// Listen for hash changes
if (import.meta.client) {
  watch(() => window.location.hash, (hash) => {
    if (hash) {
      const categoryId = hash.replace('#', '');
      if (categories.value.find(c => c.id === categoryId)) {
        setActiveCategory(categoryId);
      }
    } else {
      // If no hash, use first category
      if (categories.value.length > 0) {
        setActiveCategory(categories.value[0].id);
      }
    }
  }, { immediate: true });
  
  // Set initial category from hash if present
  onMounted(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && categories.value.find(c => c.id === hash)) {
      setActiveCategory(hash);
    } else if (categories.value.length > 0) {
      setActiveCategory(categories.value[0].id);
    }
  });
}
</script>


import { ref, computed } from "vue";

// Shared state for active node category
const activeCategoryState = ref<string>("shapes");

export function useNodeCategoryState() {
  const activeCategory = computed({
    get: () => activeCategoryState.value,
    set: (value: string) => {
      activeCategoryState.value = value;
    }
  });

  const setActiveCategory = (categoryId: string) => {
    activeCategoryState.value = categoryId;
  };

  return {
    activeCategory,
    setActiveCategory
  };
}


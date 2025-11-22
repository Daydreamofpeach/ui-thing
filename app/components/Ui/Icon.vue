<template>
  <!-- Use lucide-vue-next components when name starts with lucide: or i-lucide: -->
  <component
    v-if="lucideComponent"
    :is="lucideComponent"
    v-bind="iconProps"
    :class="props.class"
    :style="props.style"
  />
  <!-- Fallback to iconify for other icons -->
  <Icon
    v-else
    v-bind="props"
    :icon="normalizedIconName"
  />
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import { Icon } from "@iconify/vue";
  import type { IconProps } from "@iconify/vue";
  import * as LucideIcons from "lucide-vue-next";

  const props = defineProps<
    Omit<IconProps, "icon"> & {
      /**
       * The name of the icon to display.
       * Supports formats: "lucide:icon-name", "i-lucide-icon-name", or other iconify formats
       */
      name: string;
    }
  >();

  // Extract lucide icon name from various formats
  const lucideIconName = computed(() => {
    if (!props.name) return null;
    
    // Handle "lucide:icon-name" format
    if (props.name.startsWith("lucide:")) {
      return props.name.replace("lucide:", "");
    }
    
    // Handle "i-lucide-icon-name" format
    if (props.name.startsWith("i-lucide-")) {
      return props.name.replace("i-lucide-", "");
    }
    
    return null;
  });

  // Get lucide component if it's a lucide icon
  const lucideComponent = computed(() => {
    if (!lucideIconName.value) return null;
    
    // First try: Remove dashes before numbers, then convert to PascalCase
    // e.g., "loader-2" -> "loader2" -> "Loader2"
    let componentName = lucideIconName.value
      .replace(/-(\d)/g, "$1") // Remove dash before numbers
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    
    // Check if the component exists in lucide-vue-next
    let LucideIcon = (LucideIcons as any)[componentName];
    if (LucideIcon) {
      return LucideIcon;
    }
    
    // Second try: Standard kebab-case to PascalCase
    // e.g., "monitor-play" -> "MonitorPlay"
    componentName = lucideIconName.value
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    
    LucideIcon = (LucideIcons as any)[componentName];
    if (LucideIcon) {
      return LucideIcon;
    }
    
    // Third try: Handle edge cases like "git-branch" -> "GitBranch"
    // Some icons might have special handling
    return null;
  });

  // Normalize icon name for iconify (remove i- prefix if present)
  const normalizedIconName = computed(() => {
    if (!props.name) return props.name;
    // If it's a lucide icon but component wasn't found, use iconify format
    if (props.name.startsWith("i-lucide-")) {
      return props.name.replace("i-lucide-", "lucide:");
    }
    return props.name;
  });

  // Pass through icon props (size, color, etc.) to lucide component
  const iconProps = computed(() => {
    const { name, ...rest } = props;
    return rest;
  });
</script>

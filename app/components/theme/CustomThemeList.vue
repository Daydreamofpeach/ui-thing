<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <Icon name="lucide:loader-2" class="size-6 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <p class="text-sm text-destructive">{{ error }}</p>
    </div>

    <div v-else-if="customThemes.length === 0" class="text-center py-8">
      <Icon name="lucide:palette" class="size-12 mx-auto mb-4 text-muted-foreground" />
      <p class="text-sm text-muted-foreground">No custom themes yet</p>
      <p class="text-xs text-muted-foreground mt-1">
        Create and save your first custom theme to see it here
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="themeTemplate in customThemes"
        :key="themeTemplate.id"
        class="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md"
        :class="{
          'ring-2 ring-primary': selectedThemeId === themeTemplate.id,
        }"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-semibold text-sm">{{ themeTemplate.name }}</h3>
            <p v-if="themeTemplate.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
              {{ themeTemplate.description.replace(' THEME', '') }}
            </p>
          </div>
          <UiButton
            v-if="showDelete"
            variant="ghost"
            size="sm"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="handleDelete(themeTemplate.id)"
          >
            <Icon name="lucide:trash-2" class="size-4 text-destructive" />
          </UiButton>
        </div>

        <!-- Theme Preview -->
        <div class="flex gap-1 mb-3">
          <div
            v-if="themeTemplate.theme?.cssVars?.light"
            class="h-8 flex-1 rounded border"
            :style="{
              backgroundColor: hslToRgb(themeTemplate.theme.cssVars.light.primary || '0 0% 0%'),
            }"
          />
          <div
            v-if="themeTemplate.theme?.cssVars?.light"
            class="h-8 flex-1 rounded border"
            :style="{
              backgroundColor: hslToRgb(themeTemplate.theme.cssVars.light.secondary || '0 0% 0%'),
            }"
          />
          <div
            v-if="themeTemplate.theme?.cssVars?.light"
            class="h-8 flex-1 rounded border"
            :style="{
              backgroundColor: hslToRgb(themeTemplate.theme.cssVars.light.accent || '0 0% 0%'),
            }"
          />
        </div>

        <UiButton
          variant="outline"
          size="sm"
          class="w-full"
          @click="handleSelect(themeTemplate)"
        >
          <Icon name="lucide:check" class="mr-2 size-4" />
          Apply Theme
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useThemeTemplateManagement, type ThemeTemplate } from '~/composables/useThemeTemplateManagement';

interface Props {
  selectedThemeId?: string;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selectedThemeId: undefined,
  showDelete: true,
});

const emit = defineEmits<{
  select: [theme: ThemeTemplate];
  delete: [themeId: string];
}>();

const { templates, isLoading, error, deleteThemeTemplate, loadThemeTemplates } = useThemeTemplateManagement();

const customThemes = computed(() => templates.value);

// Load themes on mount
onMounted(async () => {
  await loadThemeTemplates();
});

// Convert HSL to RGB for display
const hslToRgb = (hsl: string): string => {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return '#000000';

  const h = parseFloat(parts[0]);
  if (isNaN(h)) return '#000000';
  
  const s = parseFloat(parts[1].replace('%', ''));
  if (isNaN(s)) return '#000000';
  
  const l = parseFloat(parts[2].replace('%', ''));
  if (isNaN(l)) return '#000000';

  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  let r, g, b;

  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const handleSelect = (theme: ThemeTemplate) => {
  emit('select', theme);
};

const handleDelete = async (themeId: string) => {
  if (confirm('Are you sure you want to delete this theme?')) {
    try {
      await deleteThemeTemplate(themeId);
      emit('delete', themeId);
    } catch (error) {
      console.error('Failed to delete theme:', error);
    }
  }
};

</script>


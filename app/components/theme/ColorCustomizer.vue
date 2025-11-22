<template>
  <div class="space-y-6">
    <!-- Spacing Controls -->
    <div v-if="showSpacing && spacing">
      <h3 class="text-lg font-semibold mb-4">Spacing, Padding & Margin</h3>
      <div class="mb-4">
        <p class="text-sm text-muted-foreground">
          Control global spacing, padding, and margin values for your theme.
        </p>
      </div>
      <SpacingControl
        :spacing-scale="spacing?.spacingScale || 'normal'"
        :custom-multiplier="spacing?.customMultiplier || 1.0"
        :multiplier="spacing?.multiplier || 1.0"
        @update:scale="updateSpacingScale"
        @update:custom-multiplier="updateCustomMultiplier"
      />
    </div>

    <div>
      <h3 class="text-lg font-semibold mb-4">Colors</h3>
      <div class="mb-4">
        <p class="text-sm text-muted-foreground">
          Customize colors for both light and dark modes. Changes apply in real-time.
        </p>
      </div>
      <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        <!-- Base Colors -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Base Colors</h4>
          <ColorInputDual
            v-for="prop in baseColors"
            :key="prop"
            :label="formatLabel(prop)"
            :light-value="lightColors[prop]"
            :dark-value="darkColors[prop]"
            @update:light="updateColor(prop, $event, 'light')"
            @update:dark="updateColor(prop, $event, 'dark')"
          />
        </div>

        <!-- Primary Colors -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Primary Colors</h4>
          <ColorInputDual
            v-for="prop in primaryColors"
            :key="prop"
            :label="formatLabel(prop)"
            :light-value="lightColors[prop]"
            :dark-value="darkColors[prop]"
            @update:light="updateColor(prop, $event, 'light')"
            @update:dark="updateColor(prop, $event, 'dark')"
          />
        </div>

        <!-- Border Color -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Border Color</h4>
          <ColorInputDual
            label="Border"
            :light-value="lightColors.border"
            :dark-value="darkColors.border"
            @update:light="updateColor('border', $event, 'light')"
            @update:dark="updateColor('border', $event, 'dark')"
          />
        </div>

        <!-- Secondary Colors -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Secondary Colors</h4>
          <ColorInputDual
            v-for="prop in secondaryColors"
            :key="prop"
            :label="formatLabel(prop)"
            :light-value="lightColors[prop]"
            :dark-value="darkColors[prop]"
            @update:light="updateColor(prop, $event, 'light')"
            @update:dark="updateColor(prop, $event, 'dark')"
          />
        </div>

        <!-- Chart Colors -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Chart Colors</h4>
          <ColorInputDual
            v-for="prop in chartColors"
            :key="prop"
            :label="formatLabel(prop)"
            :light-value="lightColors[prop]"
            :dark-value="darkColors[prop]"
            @update:light="updateColor(prop, $event, 'light')"
            @update:dark="updateColor(prop, $event, 'dark')"
          />
        </div>

        <!-- Sidebar Colors -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Sidebar Colors</h4>
          <ColorInputDual
            v-for="prop in sidebarColors"
            :key="prop"
            :label="formatLabel(prop)"
            :light-value="lightColors[prop]"
            :dark-value="darkColors[prop]"
            @update:light="updateColor(prop, $event, 'light')"
            @update:dark="updateColor(prop, $event, 'dark')"
          />
        </div>

        <!-- Additional Colors -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground">Additional Colors</h4>
          <ColorInputDual
            v-for="prop in additionalColors"
            :key="prop"
            :label="formatLabel(prop)"
            :light-value="lightColors[prop]"
            :dark-value="darkColors[prop]"
            @update:light="updateColor(prop, $event, 'light')"
            @update:dark="updateColor(prop, $event, 'dark')"
          />
        </div>

      </div>
    </div>

    <!-- Border Radius Controls -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-4">Border Radius</h3>
      <div class="mb-4">
        <p class="text-sm text-muted-foreground">
          Configure border radius for all UI elements in your theme.
        </p>
      </div>
      <BorderRadiusControl
        :radius="borderProps.radius.value"
        @update:radius="updateBorderProp('radius', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type ColorProperty } from '~/composables/useThemeColors';
import { useThemeBorders } from '~/composables/useThemeBorders';
import ColorInputDual from './ColorInputDual.vue';
import BorderRadiusControl from './BorderRadiusControl.vue';
import SpacingControl from './SpacingControl.vue';

const props = defineProps<{
  lightColors: Record<ColorProperty, string>;
  darkColors: Record<ColorProperty, string>;
  spacing?: {
    spacingScale: string;
    customMultiplier: number;
    multiplier: number;
  };
  showSpacing?: boolean;
}>();

const emit = defineEmits<{
  'update:color': [prop: ColorProperty, value: string, mode: 'light' | 'dark'];
  'update:border': [prop: string, value: string];
  'update:spacing-scale': [scale: string];
  'update:custom-multiplier': [multiplier: number];
}>();

const borderProps = useThemeBorders();

// Initialize borders on mount
if (import.meta.client) {
  borderProps.initializeFromComputed();
}

const baseColors: ColorProperty[] = ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground'];
const primaryColors: ColorProperty[] = ['primary', 'primary-foreground'];
const secondaryColors: ColorProperty[] = ['secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'input', 'ring'];
const chartColors: ColorProperty[] = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
const sidebarColors: ColorProperty[] = ['sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'];
const additionalColors: ColorProperty[] = ['surface', 'surface-foreground', 'code', 'code-foreground', 'code-highlight', 'code-number', 'selection', 'selection-foreground'];

const formatLabel = (prop: string): string => {
  return prop
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const updateColor = (prop: ColorProperty, value: string, mode: 'light' | 'dark') => {
  emit('update:color', prop, value, mode);
};

const updateBorderProp = (prop: string, value: string) => {
  (borderProps as any)[prop].value = value;
  emit('update:border', prop, value);
};

const updateSpacingScale = (scale: string) => {
  emit('update:spacing-scale', scale);
};

const updateCustomMultiplier = (multiplier: number) => {
  emit('update:custom-multiplier', multiplier);
};
</script>


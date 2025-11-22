<template>
  <div class="space-y-8">
    <!-- Typography Preview -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Typography</h3>
      <div class="space-y-4 p-6 rounded-lg border bg-card">
        <div>
          <h1
            class="text-4xl font-bold mb-2"
            :style="{ fontFamily: getFontFamily(fonts.heading) }"
          >
            Heading Font
          </h1>
          <p class="text-sm text-muted-foreground">
            Font: {{ fonts.heading }}
          </p>
        </div>
        <div>
          <p
            class="text-base mb-2"
            :style="{ fontFamily: getFontFamily(fonts.body) }"
          >
            This is the body font. It's used for regular text content throughout the
            application. The body font should be highly readable and comfortable for long
            reading sessions.
          </p>
          <p class="text-sm text-muted-foreground">
            Font: {{ fonts.body }}
          </p>
        </div>
        <div>
          <code
            class="text-sm block p-3 rounded bg-muted"
            :style="{ fontFamily: getFontFamily(fonts.mono) }"
          >
            const code = "monospace font";
          </code>
          <p class="text-sm text-muted-foreground mt-2">
            Font: {{ fonts.mono }}
          </p>
        </div>
      </div>
    </div>

    <!-- Component Preview -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Component Preview</h3>
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <div class="flex gap-2 flex-wrap">
          <UiButton variant="default">Primary Button</UiButton>
          <UiButton variant="secondary">Secondary Button</UiButton>
          <UiButton variant="outline">Outline Button</UiButton>
          <UiButton variant="ghost">Ghost Button</UiButton>
        </div>
        <div class="flex gap-2 flex-wrap">
          <UiButton variant="default" size="sm">Small</UiButton>
          <UiButton variant="default" size="default">Default</UiButton>
          <UiButton variant="default" size="lg">Large</UiButton>
        </div>
        <div class="p-4 rounded-md bg-muted">
          <p class="text-sm text-muted-foreground">
            This is a muted background card with text content.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getFontFamily } from '~/utils/fonts';

const props = defineProps<{
  colors: Record<string, string>;
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}>();
</script>


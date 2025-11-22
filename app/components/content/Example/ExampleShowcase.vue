<template>
  <div class="not-prose space-y-8">
    <div v-for="(example, index) in props.examples" :key="index" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ example.title }}</h3>
        <div class="flex items-center gap-2">
          <!-- Responsive view toggles -->
          <div class="flex h-8 items-center rounded-md border p-0.5 shadow-xs">
            <UiToggleGroup
              type="single"
              :default-value="100"
              @update:model-value="(value) => setViewportSize(index, parseInt(value as string))"
            >
              <UiToggleGroupItem v-tippy="'Desktop View'" class="size-6 rounded-sm p-0" value="100">
                <Icon class="size-3.5" name="lucide:monitor" />
              </UiToggleGroupItem>
              <UiToggleGroupItem v-tippy="'Tablet View'" class="size-6 rounded-sm p-0" value="60">
                <Icon class="size-3.5" name="lucide:tablet" />
              </UiToggleGroupItem>
              <UiToggleGroupItem v-tippy="'Mobile View'" value="40" class="size-6 rounded-sm p-0">
                <Icon class="size-3.5" name="lucide:smartphone" />
              </UiToggleGroupItem>
            </UiToggleGroup>
          </div>
          
          <!-- Code view toggle -->
          <UiButton
            v-if="example.code"
            v-tippy="'View Code'"
            class="h-6 rounded-sm"
            size="icon-sm"
            variant="ghost"
            @click="toggleCodeView(index)"
          >
            <Icon :name="example.showCode ? 'lucide:eye-off' : 'lucide:code'" class="size-3.5" />
          </UiButton>
        </div>
      </div>

      <!-- Example Preview -->
      <div class="relative rounded-lg bg-muted border">
        <div 
          class="relative overflow-y-auto rounded-lg border bg-background transition-all"
          :style="{ 
            height: example.iframeHeight || '600px',
            maxWidth: viewportSizes[index] + '%'
          }"
        >
          <!-- The actual example component -->
          <Suspense>
            <template #default>
              <ErrorBoundary>
                <component 
                  :is="example.component" 
                  :class="example.containerClass"
                  :style="example.style"
                />
                <template #error="{ error }">
                  <div class="flex h-full items-center justify-center p-4">
                    <div class="text-center">
                      <Icon name="lucide:alert-circle" class="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p class="text-sm text-destructive mb-1">Failed to load {{ example.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ error?.message || 'Component error' }}</p>
                    </div>
                  </div>
                </template>
              </ErrorBoundary>
            </template>
            <template #fallback>
              <div class="flex h-full items-center justify-center p-4">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p class="text-sm text-muted-foreground">Loading {{ example.title }}...</p>
                </div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>

      <!-- Code Display -->
      <div v-if="example.showCode && example.code" class="rounded-lg border bg-muted p-4">
        <BlockCodeShowcase
          :code="example.code"
          language="vue"
          language-icon="logos:vue"
          :title="example.title"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface ExampleVariant {
  title: string;
  component: any;
  containerClass?: string;
  style?: string;
  iframeHeight?: string;
  code?: string;
  showCode?: boolean;
}

interface Props {
  examples: ExampleVariant[];
}

const props = defineProps<Props>();

// Viewport sizes for responsive preview
const viewportSizes = ref<Record<number, number>>({});

// Initialize viewport sizes
onMounted(() => {
  props.examples.forEach((_, index) => {
    viewportSizes.value[index] = 100;
  });
});

const setViewportSize = (index: number, size: number) => {
  viewportSizes.value[index] = size;
};

const toggleCodeView = (index: number) => {
  if (props.examples[index]) {
    props.examples[index].showCode = !props.examples[index].showCode;
  }
};
</script>

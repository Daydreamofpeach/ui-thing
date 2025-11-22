<template>
  <SplitterResizeHandle v-bind="forwarded" :class="styles({ class: props.class })">
    <slot>
      <!-- Hover toggle above the handle -->
      <div
        v-if="withHandle && withToggle"
        class="pointer-events-auto absolute -top-3 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        :class="togglePositionClass"
      >
        <ChevronToggle
          v-model="internalOpen"
          :orientation="direction"
          :side="side"
          :width-px="16"
          :height-px="10"
          @toggle="onToggle"
        />
      </div>

      <div
        v-if="withHandle"
        class="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"
      >
        <Icon :name="icon" class="h-2.5 w-2.5" />
      </div>
    </slot>
  </SplitterResizeHandle>
</template>

<script lang="ts" setup>
  import { SplitterResizeHandle, useForwardPropsEmits } from "reka-ui";
  import type { SplitterResizeHandleEmits, SplitterResizeHandleProps } from "reka-ui";
  import type { HTMLAttributes } from "vue";
  import ChevronToggle from "./ChevronToggle.vue";

  const props = withDefaults(
    defineProps<
      SplitterResizeHandleProps & {
        direction?: "horizontal" | "vertical";
        /** Custom class(es) to add to parent element */
        class?: HTMLAttributes["class"];
        withHandle?: boolean;
        icon?: string;
        /** Show a chevron toggle button inside handle */
        withToggle?: boolean;
        /** v-model for open state controlled by parent */
        modelValue?: boolean;
        /** Side the toggle controls, used to determine chevron direction */
        side?: "left" | "right" | "top" | "bottom";
      }
    >(),
    {
      direction: "horizontal",
      icon: "lucide:grip-vertical",
      withToggle: false,
      side: "left",
    }
  );

  const emit = defineEmits<
    SplitterResizeHandleEmits & {
      "update:modelValue": [boolean];
      "toggleOpen": [boolean];
    }
  >();

  const forwarded = useForwardPropsEmits(
    reactiveOmit(props, "class", "withHandle", "icon", "withToggle", "modelValue", "side"),
    emit
  );

  const styles = tv({
    base: "group relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:after:-translate-y-1/2 [&[data-orientation=vertical]>div]:rotate-90",
  });

  const internalOpen = computed({
    get: () => !!props.modelValue,
    set: (val: boolean) => {
      emit("update:modelValue", val);
    },
  });

  function onToggle(next: boolean) {
    emit("toggleOpen", next);
  }

  const togglePositionClass = computed(() => {
    // Position the hover toggle centered relative to handle,
    // adjust axis based on orientation
    if (props.direction === "vertical") {
      // vertical orientation -> divider is horizontal; place toggle centered horizontally above
      return "left-1/2 -translate-x-1/2";
    }
    // horizontal orientation -> divider is vertical; place toggle slightly to the correct side
    return "left-1/2 -translate-x-1/2";
  });
</script>

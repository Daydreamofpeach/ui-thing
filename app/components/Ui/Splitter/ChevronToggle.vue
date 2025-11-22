<template>
	<button
		type="button"
		class="inline-flex items-center justify-center rounded-sm border bg-background/70 text-foreground/80 hover:text-foreground hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
		:aria-pressed="isOpen.toString()"
		:title="buttonTitle"
		@click="onClick"
		:style="buttonStyle"
	>
		<Icon
			:name="chevronIcon"
			class="transition-transform duration-300"
			:class="iconTransformClass"
			:style="iconStyle"
		/>
	</button>
	<!-- sizes target: width=16px, height=10px -->
</template>

<script lang="ts" setup>
	import type { CSSProperties } from "vue";

	const props = withDefaults(
		defineProps<{
			modelValue: boolean;
			orientation?: "horizontal" | "vertical";
			/** Which side this toggle controls, informs chevron base direction */
			side?: "left" | "right" | "top" | "bottom";
			/** Explicit size override in px (defaults 16x10) */
			widthPx?: number;
			heightPx?: number;
		}>(),
		{
			orientation: "horizontal",
			side: "left",
			widthPx: 16,
			heightPx: 10
		}
	);

	const emit = defineEmits<{
		(e: "update:modelValue", value: boolean): void;
		(e: "toggle", value: boolean): void;
	}>();

	const isOpen = computed(() => props.modelValue);

	const buttonStyle = computed<CSSProperties>(() => ({
		width: `${props.widthPx}px`,
		height: `${props.heightPx}px`
	}));

	const iconStyle = computed<CSSProperties>(() => ({
		width: "100%",
		height: "100%"
	}));

	const baseIconBySide = computed(() => {
		if (props.orientation === "vertical") {
			// vertical divider => chevrons left/right
			return props.side === "right" ? "lucide:chevron-right" : "lucide:chevron-left";
		}
		// horizontal divider => chevrons up/down
		return props.side === "bottom" ? "lucide:chevron-down" : "lucide:chevron-up";
	});

	const chevronIcon = computed(() => baseIconBySide.value);

	const iconTransformClass = computed(() => {
		// Rotate 180deg when open to indicate close direction
		return isOpen.value ? "rotate-180" : "rotate-0";
	});

	const buttonTitle = computed(() => (isOpen.value ? "Collapse panel" : "Expand panel"));

	function onClick() {
		const next = !isOpen.value;
		emit("update:modelValue", next);
		emit("toggle", next);
	}
</script>




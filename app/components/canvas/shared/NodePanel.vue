<template>
	<div
		class="node-panel"
		:class="panelClass"
		:style="computedStyle"
		@wheel.stop
	>
		<slot />
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	interface Props {
		// Styling
		panelClass?: string
		backgroundColor?: string
		scrollbarColor?: string
		scrollbarTrackColor?: string

		// Custom styles
		customStyle?: Record<string, string>
	}

	const props = withDefaults(defineProps<Props>(), {
		panelClass: "",
		backgroundColor: undefined,
		scrollbarColor: undefined,
		scrollbarTrackColor: undefined,
		customStyle: () => ({})
	});

	const computedStyle = computed(() => ({
		...props.customStyle
	}));
</script>

<style scoped>
.node-panel {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	min-height: 0;
	cursor: default;
	position: relative;
}

/* Custom Scrollbar */
.node-panel::-webkit-scrollbar {
	width: 8px;
}

.node-panel::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
}

.node-panel::-webkit-scrollbar-thumb {
	background: v-bind('scrollbarColor || "rgba(var(--color-primary-rgb), 0.4)"');
	border-radius: 4px;
	border: 2px solid transparent;
	background-clip: padding-box;
}

.node-panel::-webkit-scrollbar-thumb:hover {
	background: v-bind('scrollbarColor || "rgba(var(--color-primary-rgb), 0.6)"');
	background-clip: padding-box;
}
</style>

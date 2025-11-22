<template>
	<div class="node-orbit-overlay" :style="overlayStyle">
		<div class="node-orbit-overlay__inner">
			<NodeOrbit
				:items="items"
				:center-icon="centerIcon"
				:auto-rotate="autoRotate"
				:active-id="activeId"
				:max-items-per-ring="maxItemsPerRing"
				:start-radius="startRadius"
				:radius-step="radiusStep"
				@select="emitSelect"
			>
				<template #center>
					<slot name="center" />
				</template>
			</NodeOrbit>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NodeOrbit from "@canvas/shared/NodeOrbit.vue";

interface OrbitItem {
	id: string
	icon?: string
	label: string
	color?: string
	disabled?: boolean
	tooltip?: string
	badgeGradient?: [string, string]
	haloColor?: string
	iconColor?: string
	payload?: Record<string, any>
}

const props = withDefaults(defineProps<{
	items: OrbitItem[]
	activeId?: string | null
	centerIcon?: string
	autoRotate?: boolean
	size?: number
	startRadius?: number
	radiusStep?: number
	maxItemsPerRing?: number
}>(), {
	items: () => [],
	activeId: null,
	centerIcon: "i-lucide-radar",
	autoRotate: true,
	size: 380,
	startRadius: 180,
	radiusStep: 130,
	maxItemsPerRing: 10
});

const emit = defineEmits<{
	select: [item: OrbitItem]
}>();

const overlayStyle = computed(() => ({
	width: `${props.size}px`,
	height: `${props.size}px`
}));

const emitSelect = (item: OrbitItem) => {
	emit("select", item);
};
</script>

<style scoped>
.node-orbit-overlay {
	position: absolute;
	inset: 50%;
	transform: translate(-50%, -50%);
	pointer-events: none;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
}

.node-orbit-overlay::after {
	display: none;
}

.node-orbit-overlay__inner {
	width: 100%;
	height: 100%;
	pointer-events: none;
	position: relative;
}

.node-orbit-overlay__inner :deep(.node-orbit) {
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.node-orbit-overlay__inner :deep(.node-orbit__item) {
	pointer-events: auto;
}

.node-orbit-overlay__inner :deep(.node-orbit__center) {
	pointer-events: auto;
}

.node-orbit-overlay__inner :deep(.orbit-center-toggle) {
	pointer-events: auto;
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.node-orbit-overlay__inner :deep(.orbit-center-toggle:focus-visible) {
	outline: 2px solid rgba(255, 255, 255, 0.45);
	outline-offset: 4px;
	border-radius: 999px;
}

.node-orbit-overlay__inner :deep(.node-orbit__ring) {
	border-color: rgba(255, 255, 255, 0.08);
	border-style: dashed;
}
</style>

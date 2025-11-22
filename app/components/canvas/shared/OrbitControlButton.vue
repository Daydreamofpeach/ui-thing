<template>
	<div class="orbit-control-button-group">
		<!-- Node Toolbar: Show inline icon button for template creation -->
		<OrbitNodeToolbar @add-template="onAddTemplate" />

		<!-- Close Button: Show only when an orbit node is active -->
		<OrbitNodeActions
			v-if="activeOrbitNodeId"
			:node-id="activeOrbitNodeId"
			:is-open="true"
			item-label="active node"
			@close="onClose"
		/>

		<!-- Visibility Toggle: Show/hide all orbit nodes -->
		<OrbitVisibilityToggle
			v-if="hasOrbitItems"
			:is-expanded="isExpanded"
			:node-count="nodeCount"
			show-label="Show All"
			hide-label="Hide All"
			@show="onShow"
			@hide="onHide"
		/>
	</div>
</template>

<script setup lang="ts">
import OrbitNodeToolbar from './OrbitNodeToolbar.vue';
import OrbitNodeActions from './orbit/OrbitNodeActions.vue';
import OrbitVisibilityToggle from './orbit/OrbitVisibilityToggle.vue';

interface Props {
	activeOrbitNodeId: string | null;
	isExpanded: boolean;
	hasOrbitItems: boolean;
	nodeCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
	nodeCount: 0
});

const emit = defineEmits<{
	close: [];
	toggle: [];
	addTemplate: [];
}>();

const onClose = () => {
	emit('close');
};

const onShow = () => {
	emit('toggle');
};

const onHide = () => {
	emit('toggle');
};

const onAddTemplate = () => {
	emit('addTemplate');
};
</script>

<style scoped>
.orbit-control-button-group {
	display: flex;
	gap: 8px;
	align-items: center;
	justify-content: flex-start;
	flex-wrap: wrap;
	padding: 12px 0;
	border-top: 1px solid rgba(148, 163, 184, 0.15);
	margin-top: 12px;
}

.orbit-control-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 8px 14px;
	border-radius: 6px;
	border: 1px solid rgba(148, 163, 184, 0.3);
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.06));
	color: rgba(255, 255, 255, 0.8);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.orbit-control-btn:hover {
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.12));
	border-color: rgba(59, 130, 246, 0.5);
	color: rgba(255, 255, 255, 0.95);
	box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.orbit-control-btn:active {
	transform: scale(0.98);
}

.orbit-control-btn--close {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.08));
	border-color: rgba(239, 68, 68, 0.3);
	color: rgba(248, 113, 113, 0.9);
}

.orbit-control-btn--close:hover {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(220, 38, 38, 0.14));
	border-color: rgba(239, 68, 68, 0.6);
	box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
}

.orbit-control-btn--toggle {
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.08));
	border-color: rgba(34, 197, 94, 0.3);
	color: rgba(134, 239, 172, 0.9);
}

.orbit-control-btn--toggle:hover {
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(16, 185, 129, 0.14));
	border-color: rgba(34, 197, 94, 0.6);
	box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
}

.btn-label {
	font-size: 12px;
	letter-spacing: 0.3px;
	text-transform: uppercase;
}

@media (max-width: 600px) {
	.orbit-control-button-group {
		flex-direction: column;
		gap: 6px;
	}

	.orbit-control-btn,
	.btn-label {
		width: 100%;
		justify-content: center;
	}
}
</style>


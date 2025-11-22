<template>
	<component
		:is="nodeComponent"
		v-if="nodeComponent"
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		v-bind="nodeSpecificProps"
		@edit="$emit('edit')"
		@delete="$emit('delete')"
		@close="$emit('close')"
		@close-node="$emit('closeNode')"
	/>
	<div v-else class="unknown-node-type">
		<div class="unknown-node-header">
			Unknown Node Type
		</div>
		<div class="unknown-node-body">
			{{ customNodeProps?.type || 'No type' }}
		</div>
		<div class="text-xs mt-2">
			ID: {{ customNodeProps?.id || 'No ID' }}
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Component } from "vue";
	import { computed, onMounted } from "vue";
	import { useNodeComponentRegistry } from "../composables/useNodeComponentRegistry";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		allHandlers?: any
		organizationId?: string
		availableHooks?: any[]
		availableTransports?: any[]
	}

	const props = defineProps<Props>();

	defineEmits<{
		edit: []
		delete: []
		close: []
		closeNode: []
	}>();

	// Get the node component registry
	const { getNodeComponent, getNodeProps } = useNodeComponentRegistry();

	// Dynamically determine which component to render based on node type
	const nodeComponent = computed<Component | null>(() => {
		const nodeType = props.customNodeProps?.type;
		if (!nodeType) {
			console.warn("🔴 DynamicNodeRenderer: No node type in customNodeProps", props.customNodeProps);
			return null;
		}
		const component = getNodeComponent(nodeType);
		if (!component) {
			console.warn(`🔴 DynamicNodeRenderer: No component found for type: ${nodeType}`);
		}
		return component;
	});

	// Get node-specific props (e.g., organizationId for HookNode)
	const nodeSpecificProps = computed(() => {
		const nodeType = props.customNodeProps?.type;
		if (!nodeType) return {};

		const specificProps = getNodeProps(nodeType, props);

		return {
			...specificProps,
			...props.allHandlers // Pass all handlers through
		};
	});

	onMounted(() => {
		console.log(`🎨 DynamicNodeRenderer mounted for: ${props.customNodeProps?.type} (${props.customNodeProps?.id})`);
	});
</script>

<style scoped>
	.unknown-node-type {
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 2px dashed rgba(239, 68, 68, 0.5);
		border-radius: 8px;
		color: #ef4444;
		min-width: 200px;
		min-height: 100px;
	}

	.unknown-node-header {
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.unknown-node-body {
		font-size: 0.875rem;
		opacity: 0.8;
	}
</style>

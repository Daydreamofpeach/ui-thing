<template>
	<div class="node-with-connections" :class="nodeClasses">
		<!-- Node Content Slot -->
		<slot :node="node" :connection-handlers="connectionHandlers" />

		<!-- Enhanced Connection Points -->
		<EnhancedConnectionPoint
			v-for="handle in connectionHandles"
			:key="`${handle.nodeId}-${handle.handleId}`"
			:node-id="handle.nodeId"
			:handle-id="handle.handleId"
			:type="handle.type"
			:position="handle.position"
			:color="handle.color || '#6b7280'"
			:size="12"
			:label="handle.label"
			:show-label="showConnectionLabels"
			:disabled="handle.disabled"
			:connected="isHandleConnected(handle)"
			:hovered="isHandleHovered(handle)"
			:show-type-indicator="true"
			@connection-start="handleConnectionStart"
			@connection-end="handleConnectionEnd"
			@connection-hover="handleConnectionHover"
			@connection-leave="handleConnectionLeave"
		/>

		<!-- Connection Dropdown (if enabled) -->
		<div v-if="showConnectionDropdown" class="connection-dropdown-overlay">
			<ConnectionDropdown
				:node-id="node.id"
				:connections="nodeConnections"
				:available-nodes="availableNodes"
				@create-connection="handleCreateConnection"
				@delete-connection="handleDeleteConnection"
				@update-connection-type="handleUpdateConnectionType"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { ConnectionHandle } from "~/components/canvas/composables/useNodeConnections";
	import { computed, provide } from "vue";
	import EnhancedConnectionPoint from "~/components/canvas/ui/connection/EnhancedConnectionPoint.vue";
	import ConnectionPoint from "./connection/ConnectionPoint.vue";
	import ConnectionDropdown from "./ConnectionDropdown.vue";

	interface Props {
		node: any
		connectionHandles?: ConnectionHandle[]
		showConnectionLabels?: boolean
		disabled?: boolean
		selected?: boolean
		showConnectionDropdown?: boolean
		nodeConnections?: any[]
		availableNodes?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		connectionHandles: () => [],
		showConnectionLabels: false,
		disabled: false,
		selected: false,
		showConnectionDropdown: false,
		nodeConnections: () => [],
		availableNodes: () => []
	});

	const emit = defineEmits<{
		connectionStart: [event: MouseEvent, handle: ConnectionHandle]
		connectionEnd: [event: MouseEvent, handle: ConnectionHandle]
		connectionHover: [event: MouseEvent, handle: ConnectionHandle]
		connectionLeave: [event: MouseEvent, handle: ConnectionHandle]
		createConnection: [connection: { sourceNodeId: string, targetNodeId: string, type: string }]
		deleteConnection: [connectionId: string]
		updateConnectionType: [connectionId: string, type: string]
	}>();

	// Default connection handles if none provided
	const defaultHandles = computed((): ConnectionHandle[] => {
		if (props.connectionHandles.length > 0) return props.connectionHandles;

		// Create default handles based on node type
		const nodeType = props.node.data?.type || props.node.type || "default";

		const handles: ConnectionHandle[] = [
			{
				nodeId: props.node.id,
				handleId: "input-top",
				type: "target" as const,
				position: "top" as const,
				color: getNodeTypeColor(nodeType)
			},
			{
				nodeId: props.node.id,
				handleId: "output-bottom",
				type: "source" as const,
				position: "bottom" as const,
				color: getNodeTypeColor(nodeType)
			},
			{
				nodeId: props.node.id,
				handleId: "input-left",
				type: "target" as const,
				position: "left" as const,
				color: getNodeTypeColor(nodeType)
			},
			{
				nodeId: props.node.id,
				handleId: "output-right",
				type: "source" as const,
				position: "right" as const,
				color: getNodeTypeColor(nodeType)
			}
		];

		return handles;
	});

	const nodeClasses = computed(() => [
		"node-wrapper",
		{
			"node-wrapper--disabled": props.disabled,
			"node-wrapper--selected": props.selected
		}
	]);

	const connectionHandlers = computed(() => ({
		startConnection: handleConnectionStart,
		endConnection: handleConnectionEnd,
		hoverConnection: handleConnectionHover,
		leaveConnection: handleConnectionLeave
	}));

	// Provide connection handlers to child components
	provide("connectionHandlers", connectionHandlers.value);

	const getNodeTypeColor = (nodeType: string): string => {
		const colorMap: Record<string, string> = {
			hook: "#10b981",
			transport: "#3b82f6",
			template: "#8b5cf6",
			connectionLink: "#f59e0b",
			auth: "#ef4444",
			user: "#06b6d4",
			default: "#6b7280"
		};
		return colorMap[nodeType] || colorMap.default || "#6b7280";
	};

	const isHandleConnected = (handle: ConnectionHandle): boolean => {
		// This would need to be implemented based on your connection state
		// For now, return false as a placeholder
		return false;
	};

	const isHandleHovered = (handle: ConnectionHandle): boolean => {
		// This would need to be implemented based on your connection state
		// For now, return false as a placeholder
		return false;
	};

	const handleConnectionStart = (event: MouseEvent, handle: any) => {
		emit("connectionStart", event, handle as ConnectionHandle);
	};

	const handleConnectionEnd = (event: MouseEvent, handle: any) => {
		emit("connectionEnd", event, handle as ConnectionHandle);
	};

	const handleConnectionHover = (event: MouseEvent, handle: any) => {
		emit("connectionHover", event, handle as ConnectionHandle);
	};

	const handleConnectionLeave = (event: MouseEvent, handle: any) => {
		emit("connectionLeave", event, handle as ConnectionHandle);
	};

	const handleCreateConnection = (connection: { sourceNodeId: string, targetNodeId: string, type: string }) => {
		emit("createConnection", connection);
	};

	const handleDeleteConnection = (connectionId: string) => {
		emit("deleteConnection", connectionId);
	};

	const handleUpdateConnectionType = (connectionId: string, type: string) => {
		emit("updateConnectionType", connectionId, type);
	};
</script>

<style scoped>
	.node-with-connections {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.node-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.node-wrapper--disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.node-wrapper--selected {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Ensure connection points are above node content */
	.node-with-connections :deep(.connection-point) {
		z-index: 20;
	}

	.connection-dropdown-overlay {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 30;
		margin-top: 8px;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>


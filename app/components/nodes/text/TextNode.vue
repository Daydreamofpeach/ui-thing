<template>
	<NodeWithConnections
		:node="node"
		:connection-handles="connectionHandles"
		:show-connection-labels="false"
		:show-connection-dropdown="showConnectionDropdown"
		:node-connections="nodeConnections"
		:available-nodes="availableNodes"
		@connection-start="handleConnectionStart"
		@connection-end="handleConnectionEnd"
		@connection-hover="handleConnectionHover"
		@connection-leave="handleConnectionLeave"
		@create-connection="handleCreateConnection"
		@delete-connection="handleDeleteConnection"
		@update-connection-type="handleUpdateConnectionType"
	>
		<template #default="{ node, connectionHandlers }">
			<div
				class="text-node"
				:style="nodeStyle"
				@click="handleNodeClick"
				@dblclick="handleNodeDoubleClick"
			>
				<!-- Text Content -->
				<div class="text-content" :style="textStyle">
					{{ node.data?.text || 'Text' }}
				</div>

				<!-- Selection indicator -->
				<div v-if="isSelected" class="selection-indicator" />

				<!-- Resize handles -->
				<div v-if="isSelected" class="resize-handles">
					<div class="resize-handle resize-handle-nw" @mousedown="startResize('nw', $event)" />
					<div class="resize-handle resize-handle-ne" @mousedown="startResize('ne', $event)" />
					<div class="resize-handle resize-handle-sw" @mousedown="startResize('sw', $event)" />
					<div class="resize-handle resize-handle-se" @mousedown="startResize('se', $event)" />
				</div>
			</div>
		</template>
	</NodeWithConnections>
</template>

<script lang="ts" setup>
	import type { ConnectionHandle } from "~/components/canvas/composables/useNodeConnections";
	import { computed, ref } from "vue";
	import NodeWithConnections from "../NodeWithConnections.vue";

	// Props
	const props = defineProps<{
		id: string
		type: string
		position: { x: number, y: number }
		data: {
			id: string
			type: string
			text?: string
			width?: number
			height?: number
			fontSize?: number
			fontFamily?: string
			fontWeight?: string
			fontStyle?: string
			textAlign?: "left" | "center" | "right"
			color?: string
			backgroundColor?: string
			opacity?: number
		}
		draggable: boolean
		selectable: boolean
		node: any
		showConnectionDropdown?: boolean
		nodeConnections?: any[]
		availableNodes?: any[]
		selected?: boolean
	}>();

	// Emits
	const emit = defineEmits<{
		configure: [nodeId: string]
		delete: [nodeId: string]
		select: [nodeId: string]
		resize: [nodeId: string, width: number, height: number]
		connectionStart: [event: MouseEvent, handle: ConnectionHandle]
		connectionEnd: [event: MouseEvent, handle: ConnectionHandle]
		connectionHover: [event: MouseEvent, handle: ConnectionHandle]
		connectionLeave: [event: MouseEvent, handle: ConnectionHandle]
		createConnection: [connection: { sourceNodeId: string, targetNodeId: string, type: string }]
		deleteConnection: [connectionId: string]
		updateConnectionType: [connectionId: string, type: string]
	}>();

	// State
	const isSelected = ref(false);
	const isResizing = ref(false);
	const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

	// Computed
	const nodeStyle = computed(() => ({
		width: `${props.data.width || 120}px`,
		height: `${props.data.height || 40}px`,
		backgroundColor: props.data.backgroundColor || "transparent",
		opacity: props.data.opacity || 1
	}));

	const textStyle = computed(() => ({
		fontSize: `${props.data.fontSize || 14}px`,
		fontFamily: props.data.fontFamily || "Arial, sans-serif",
		fontWeight: props.data.fontWeight || "normal",
		fontStyle: props.data.fontStyle || "normal",
		textAlign: props.data.textAlign || "center",
		color: props.data.color || "#000000",
		lineHeight: "1.2",
		wordWrap: "break-word",
		overflow: "hidden"
	}));

	// Connection handles for text nodes
	const connectionHandles = computed((): ConnectionHandle[] => [
		{
			nodeId: props.id,
			handleId: "input-top",
			type: "target" as const,
			position: "top" as const,
			color: props.data.color || "#000000",
			label: "Input"
		},
		{
			nodeId: props.id,
			handleId: "output-bottom",
			type: "source" as const,
			position: "bottom" as const,
			color: props.data.color || "#000000",
			label: "Output"
		},
		{
			nodeId: props.id,
			handleId: "input-left",
			type: "target" as const,
			position: "left" as const,
			color: props.data.color || "#000000",
			label: "Input"
		},
		{
			nodeId: props.id,
			handleId: "output-right",
			type: "source" as const,
			position: "right" as const,
			color: props.data.color || "#000000",
			label: "Output"
		}
	]);

	// Event handlers
	const handleNodeClick = () => {
		isSelected.value = true;
		emit("select", props.id);
	};

	const handleNodeDoubleClick = () => {
		emit("configure", props.id);
	};

	const startResize = (direction: string, event: MouseEvent) => {
		event.stopPropagation();
		isResizing.value = true;
		resizeStart.value = {
			x: event.clientX,
			y: event.clientY,
			width: props.data.width || 120,
			height: props.data.height || 40
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing.value) return;

			const deltaX = e.clientX - resizeStart.value.x;
			const deltaY = e.clientY - resizeStart.value.y;

			let newWidth = resizeStart.value.width;
			let newHeight = resizeStart.value.height;

			switch (direction) {
			case "nw":
				newWidth = Math.max(50, resizeStart.value.width - deltaX);
				newHeight = Math.max(20, resizeStart.value.height - deltaY);
				break;
			case "ne":
				newWidth = Math.max(50, resizeStart.value.width + deltaX);
				newHeight = Math.max(20, resizeStart.value.height - deltaY);
				break;
			case "sw":
				newWidth = Math.max(50, resizeStart.value.width - deltaX);
				newHeight = Math.max(20, resizeStart.value.height + deltaY);
				break;
			case "se":
				newWidth = Math.max(50, resizeStart.value.width + deltaX);
				newHeight = Math.max(20, resizeStart.value.height + deltaY);
				break;
			}

			emit("resize", props.id, newWidth, newHeight);
		};

		const handleMouseUp = () => {
			isResizing.value = false;
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	// Connection handlers
	const handleConnectionStart = (event: MouseEvent, handle: ConnectionHandle) => {
		emit("connectionStart", event, handle);
	};

	const handleConnectionEnd = (event: MouseEvent, handle: ConnectionHandle) => {
		emit("connectionEnd", event, handle);
	};

	const handleConnectionHover = (event: MouseEvent, handle: ConnectionHandle) => {
		emit("connectionHover", event, handle);
	};

	const handleConnectionLeave = (event: MouseEvent, handle: ConnectionHandle) => {
		emit("connectionLeave", event, handle);
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
	.text-node {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		user-select: none;
		padding: 4px;
	}

	.text-node:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.text-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		word-wrap: break-word;
		hyphens: auto;
	}

	.selection-indicator {
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		border: 2px solid #3b82f6;
		border-radius: 4px;
		pointer-events: none;
	}

	.resize-handles {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	.resize-handle {
		position: absolute;
		width: 8px;
		height: 8px;
		background: #3b82f6;
		border: 1px solid #ffffff;
		border-radius: 50%;
		pointer-events: all;
		cursor: nw-resize;
	}

	.resize-handle-nw {
		top: -4px;
		left: -4px;
		cursor: nw-resize;
	}

	.resize-handle-ne {
		top: -4px;
		right: -4px;
		cursor: ne-resize;
	}

	.resize-handle-sw {
		bottom: -4px;
		left: -4px;
		cursor: sw-resize;
	}

	.resize-handle-se {
		bottom: -4px;
		right: -4px;
		cursor: se-resize;
	}
</style>


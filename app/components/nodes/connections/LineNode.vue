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
				class="line-node"
				:style="nodeStyle"
				@click="handleNodeClick"
				@dblclick="handleNodeDoubleClick"
			>
				<!-- Line SVG -->
				<svg 
					:width="width" 
					:height="height" 
					viewBox="0 0 100 20" 
					class="line-svg"
				>
					<line
						x1="10"
						y1="10"
						x2="90"
						y2="10"
						:stroke="strokeColor"
						:stroke-width="strokeWidth"
						:stroke-dasharray="strokeDashArray"
					/>
				</svg>
				
				<!-- Line Label -->
				<div v-if="showText" class="line-label">
					{{ node.data?.text || 'Line' }}
				</div>
				
				<!-- Selection indicator -->
				<div v-if="isSelected" class="selection-indicator" />
				
				<!-- Resize handles -->
				<div v-if="isSelected" class="resize-handles">
					<div class="resize-handle resize-handle-start" @mousedown="startResize('start', $event)" />
					<div class="resize-handle resize-handle-end" @mousedown="startResize('end', $event)" />
				</div>
			</div>
		</template>
	</NodeWithConnections>
</template>

<script lang="ts" setup>
	import { computed, ref } from "vue";
	import NodeWithConnections from "../NodeWithConnections.vue";
	import type { ConnectionHandle } from "~/components/canvas/composables/useNodeConnections";

	// Props
	const props = defineProps<{
		id: string;
		type: string;
		position: { x: number; y: number };
		data: {
			id: string;
			type: string;
			text?: string;
			width?: number;
			height?: number;
			strokeColor?: string;
			strokeWidth?: number;
			opacity?: number;
			lineType?: 'solid' | 'dashed' | 'dotted' | 'double';
		};
		draggable: boolean;
		selectable: boolean;
		node: any;
		showConnectionDropdown?: boolean;
		nodeConnections?: any[];
		availableNodes?: any[];
		selected?: boolean;
	}>();

	// Emits
	const emit = defineEmits<{
		configure: [nodeId: string];
		delete: [nodeId: string];
		select: [nodeId: string];
		resize: [nodeId: string, width: number, height: number];
		connectionStart: [event: MouseEvent, handle: ConnectionHandle];
		connectionEnd: [event: MouseEvent, handle: ConnectionHandle];
		connectionHover: [event: MouseEvent, handle: ConnectionHandle];
		connectionLeave: [event: MouseEvent, handle: ConnectionHandle];
		createConnection: [connection: { sourceNodeId: string; targetNodeId: string; type: string }];
		deleteConnection: [connectionId: string];
		updateConnectionType: [connectionId: string, type: string];
	}>();

	// State
	const isSelected = ref(false);
	const isResizing = ref(false);
	const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

	// Computed
	const width = computed(() => props.data.width || 100);
	const height = computed(() => props.data.height || 20);
	const strokeColor = computed(() => props.data.strokeColor || '#000000');
	const strokeWidth = computed(() => props.data.strokeWidth || 2);

	const strokeDashArray = computed(() => {
		switch (props.data.lineType) {
			case 'dashed':
				return '5,5';
			case 'dotted':
				return '2,3';
			case 'double':
				return '0';
			default:
				return '0';
		}
	});

	const nodeStyle = computed(() => ({
		width: `${width.value}px`,
		height: `${height.value}px`,
		opacity: props.data.opacity || 1
	}));

	const showText = computed(() => props.data.text && props.data.text.trim() !== '');

	// Connection handles for line nodes
	const connectionHandles = computed((): ConnectionHandle[] => [
		{
			nodeId: props.id,
			handleId: "input-start",
			type: "target" as const,
			position: "left" as const,
			color: strokeColor.value,
			label: "Start"
		},
		{
			nodeId: props.id,
			handleId: "output-end",
			type: "source" as const,
			position: "right" as const,
			color: strokeColor.value,
			label: "End"
		}
	]);

	// Event handlers
	const handleNodeClick = () => {
		isSelected.value = true;
		emit('select', props.id);
	};

	const handleNodeDoubleClick = () => {
		emit('configure', props.id);
	};

	const startResize = (direction: string, event: MouseEvent) => {
		event.stopPropagation();
		isResizing.value = true;
		resizeStart.value = {
			x: event.clientX,
			y: event.clientY,
			width: width.value,
			height: height.value
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing.value) return;

			const deltaX = e.clientX - resizeStart.value.x;
			const deltaY = e.clientY - resizeStart.value.y;

			let newWidth = resizeStart.value.width;
			let newHeight = resizeStart.value.height;

			if (direction === 'start') {
				newWidth = Math.max(50, resizeStart.value.width - deltaX);
			} else if (direction === 'end') {
				newWidth = Math.max(50, resizeStart.value.width + deltaX);
			}

			emit('resize', props.id, newWidth, newHeight);
		};

		const handleMouseUp = () => {
			isResizing.value = false;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	// Connection handlers
	const handleConnectionStart = (event: MouseEvent, handle: ConnectionHandle) => {
		emit('connectionStart', event, handle);
	};

	const handleConnectionEnd = (event: MouseEvent, handle: ConnectionHandle) => {
		emit('connectionEnd', event, handle);
	};

	const handleConnectionHover = (event: MouseEvent, handle: ConnectionHandle) => {
		emit('connectionHover', event, handle);
	};

	const handleConnectionLeave = (event: MouseEvent, handle: ConnectionHandle) => {
		emit('connectionLeave', event, handle);
	};

	const handleCreateConnection = (connection: { sourceNodeId: string; targetNodeId: string; type: string }) => {
		emit('createConnection', connection);
	};

	const handleDeleteConnection = (connectionId: string) => {
		emit('deleteConnection', connectionId);
	};

	const handleUpdateConnectionType = (connectionId: string, type: string) => {
		emit('updateConnectionType', connectionId, type);
	};
</script>

<style scoped>
	.line-node {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		user-select: none;
	}

	.line-node:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.line-svg {
		width: 100%;
		height: 100%;
	}

	.line-label {
		position: absolute;
		top: -25px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px;
		font-weight: 500;
		color: #000000;
		background: rgba(255, 255, 255, 0.9);
		padding: 2px 6px;
		border-radius: 4px;
		white-space: nowrap;
		pointer-events: none;
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
		cursor: ew-resize;
		top: 50%;
		transform: translateY(-50%);
	}

	.resize-handle-start {
		left: -4px;
		cursor: w-resize;
	}

	.resize-handle-end {
		right: -4px;
		cursor: e-resize;
	}
</style>


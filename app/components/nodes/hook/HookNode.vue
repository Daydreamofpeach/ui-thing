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
			<BaseNodeTemplate
				:custom-node-props="{ 
					id: props.id, 
					data: node.data,
					selected: props.node?.selected 
				}"
				node-class="hook-node"
				v-bind="hookState.theme"
				title="HOOK"
				:status-label="hookState.displayHookType"
				:show-handles="false"
				:show-resizer="false"
				:show-edit-button="false"
				:show-close-button="true"
				:min-width="200"
				:max-width="300"
				@delete="handleDelete"
			>
				<template #header-actions>
					<button
						@click="handleConfigure"
						class="action-button configure-button"
						title="Configure"
					>
						<UIcon name="i-lucide-settings" class="w-3 h-3" />
					</button>
				</template>

				<template #default>
					<div class="hook-node-content">
						<!-- Description -->
						<div v-if="node.data?.description" class="node-description">
							{{ node.data.description }}
						</div>
						
						<!-- Node Info -->
						<NodeInfoGrid>
							<NodeInfoItem
								icon="i-lucide-zap"
								icon-class="text-yellow-500"
								label="Event"
								:value="hookState.displayEventName"
							/>
							
							<NodeInfoItem
								icon="i-lucide-clock"
								icon-class="text-blue-500"
								label="Type"
								:value="hookState.displayHookType"
							/>
						</NodeInfoGrid>

						<!-- Status Indicator -->
						<div class="mt-3">
							<NodeStatusIndicator :status="hookState.status" />
						</div>
					</div>
				</template>
			</BaseNodeTemplate>
		</template>
	</NodeWithConnections>
</template>

<script lang="ts" setup>
	import { computed } from "vue";
	import BaseNodeTemplate from "../../canvas/nodes/templates/BaseNodeTemplate.vue";
	import NodeInfoGrid from "../../canvas/shared/NodeInfoGrid.vue";
	import NodeInfoItem from "../../canvas/shared/NodeInfoItem.vue";
	import NodeStatusIndicator from "../../canvas/shared/NodeStatusIndicator.vue";
	import NodeWithConnections from "../NodeWithConnections.vue";
	import { useHookNodeState } from "./useHookNodeState";
	import type { ConnectionHandle } from "../../canvas/composables/useNodeConnections";

	// Props
	const props = defineProps<{
		id: string;
		type: string;
		position: { x: number; y: number };
		data: {
			id: string;
			type: string;
			name: string;
			description?: string;
			hookType: string;
			eventName: string;
		};
		draggable: boolean;
		selectable: boolean;
		node: any;
		showConnectionDropdown?: boolean;
		nodeConnections?: any[];
		availableNodes?: any[];
	}>();

	// Emits - only for external parent communication
	const emit = defineEmits<{
		configure: [nodeId: string];
		delete: [nodeId: string];
		connectionStart: [event: MouseEvent, handle: ConnectionHandle];
		connectionEnd: [event: MouseEvent, handle: ConnectionHandle];
		connectionHover: [event: MouseEvent, handle: ConnectionHandle];
		connectionLeave: [event: MouseEvent, handle: ConnectionHandle];
		createConnection: [connection: { sourceNodeId: string; targetNodeId: string; type: string }];
		deleteConnection: [connectionId: string];
		updateConnectionType: [connectionId: string, type: string];
	}>();

	// Internal state management
	const nodeData = computed(() => props.node?.data);
	const hookState = useHookNodeState(nodeData);

	// Connection handles for hook nodes
	const connectionHandles = computed((): ConnectionHandle[] => [
		{
			nodeId: props.id,
			handleId: "input-top",
			type: "target",
			position: "top",
			color: "#10b981",
			label: "Input"
		},
		{
			nodeId: props.id,
			handleId: "output-bottom",
			type: "source",
			position: "bottom",
			color: "#10b981",
			label: "Output"
		},
		{
			nodeId: props.id,
			handleId: "input-left",
			type: "target",
			position: "left",
			color: "#10b981",
			label: "Trigger"
		},
		{
			nodeId: props.id,
			handleId: "output-right",
			type: "source",
			position: "right",
			color: "#10b981",
			label: "Result"
		}
	]);

	// Methods
	const handleConfigure = () => {
		emit('configure', props.id);
	};

	const handleDelete = () => {
		emit('delete', props.id);
	};

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
	.hook-node {
		min-width: 200px;
		max-width: 300px;
	}

	.hook-node-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.node-description {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.4;
	}

	.configure-button {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(168, 85, 247, 0.1);
		border: 1px solid rgba(168, 85, 247, 0.3);
		border-radius: 4px;
		color: rgba(168, 85, 247, 0.9);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.configure-button:hover {
		background: rgba(168, 85, 247, 0.2);
		border-color: rgba(168, 85, 247, 0.5);
		color: rgb(168, 85, 247);
		transform: scale(1.1);
	}
</style>


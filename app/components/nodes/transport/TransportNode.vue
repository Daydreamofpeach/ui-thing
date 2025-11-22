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
			<div class="transport-node glassmorphic-panel p-4 min-w-[200px] max-w-[300px]">
				<!-- Node Header -->
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
							<UIcon name="i-lucide-truck" class="w-4 h-4 text-blue-500" />
						</div>
						<div>
							<h3 class="text-sm font-semibold text-white">
								{{ node.data?.name || 'Transport Node' }}
							</h3>
							<p class="text-xs text-white/60">
								{{ node.data?.transportType || 'http' }} transport
							</p>
						</div>
					</div>
					<div class="flex items-center gap-1">
						<button
							class="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
							title="Configure"
							@click="handleConfigure"
						>
							<UIcon name="i-lucide-settings" class="w-3 h-3" />
						</button>
						<button
							class="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
							title="Delete"
							@click="handleDelete"
						>
							<UIcon name="i-lucide-trash-2" class="w-3 h-3" />
						</button>
					</div>
				</div>

				<!-- Node Content -->
				<div class="space-y-2">
					<div v-if="node.data?.description" class="text-xs text-white/70 mb-2">
						{{ node.data.description }}
					</div>

					<div class="space-y-1">
						<div class="flex items-center gap-2 text-xs">
							<UIcon name="i-lucide-globe" class="w-3 h-3 text-blue-500" />
							<span class="text-white/60">Endpoint:</span>
							<span class="text-white font-medium truncate">{{ node.data?.endpoint || 'No endpoint' }}</span>
						</div>

						<div class="flex items-center gap-2 text-xs">
							<UIcon name="i-lucide-activity" class="w-3 h-3 text-purple-500" />
							<span class="text-white/60">Type:</span>
							<span class="text-white font-medium uppercase">{{ node.data?.transportType || 'http' }}</span>
						</div>
					</div>

					<!-- Connection Status -->
					<div class="flex items-center gap-2 mt-3">
						<div
							class="w-2 h-2 rounded-full"
							:class="{
								'bg-gray-500': connectionStatus === 'disconnected',
								'bg-yellow-500 animate-pulse': connectionStatus === 'connecting',
								'bg-green-500': connectionStatus === 'connected',
								'bg-red-500': connectionStatus === 'error'
							}"
						/>
						<span class="text-xs text-white/60 capitalize">{{ connectionStatus }}</span>
					</div>

					<!-- Transport Stats -->
					<div v-if="transportStats" class="mt-3 pt-2 border-t border-white/10">
						<div class="grid grid-cols-2 gap-2 text-xs">
							<div class="text-center">
								<div class="text-white/60">
									Sent
								</div>
								<div class="text-white font-medium">
									{{ transportStats.sent }}
								</div>
							</div>
							<div class="text-center">
								<div class="text-white/60">
									Received
								</div>
								<div class="text-white font-medium">
									{{ transportStats.received }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</NodeWithConnections>
</template>

<script lang="ts" setup>
	import type { ConnectionHandle } from "~/components/canvas/composables/useNodeConnections";
	import { computed, reactive, ref } from "vue";
	import NodeWithConnections from "../NodeWithConnections.vue";

	// Props
	const props = defineProps<{
		id: string
		type: string
		position: { x: number, y: number }
		data: {
			id: string
			type: string
			name: string
			description?: string
			transportType: string
			endpoint: string
		}
		draggable: boolean
		selectable: boolean
		node: any
		showConnectionDropdown?: boolean
		nodeConnections?: any[]
		availableNodes?: any[]
	}>();

	// Emits
	const emit = defineEmits<{
		configure: [nodeId: string]
		delete: [nodeId: string]
		connectionStart: [event: MouseEvent, handle: ConnectionHandle]
		connectionEnd: [event: MouseEvent, handle: ConnectionHandle]
		connectionHover: [event: MouseEvent, handle: ConnectionHandle]
		connectionLeave: [event: MouseEvent, handle: ConnectionHandle]
		createConnection: [connection: { sourceNodeId: string, targetNodeId: string, type: string }]
		deleteConnection: [connectionId: string]
		updateConnectionType: [connectionId: string, type: string]
	}>();

	// State
	const connectionStatus = ref<"disconnected" | "connecting" | "connected" | "error">("disconnected");
	const transportStats = reactive({
		sent: 0,
		received: 0
	});

	// Connection handles for transport nodes
	const connectionHandles = computed((): ConnectionHandle[] => [
		{
			nodeId: props.id,
			handleId: "input-top",
			type: "target",
			position: "top",
			color: "#3b82f6",
			label: "Input"
		},
		{
			nodeId: props.id,
			handleId: "output-bottom",
			type: "source",
			position: "bottom",
			color: "#3b82f6",
			label: "Output"
		},
		{
			nodeId: props.id,
			handleId: "input-left",
			type: "target",
			position: "left",
			color: "#3b82f6",
			label: "Data In"
		},
		{
			nodeId: props.id,
			handleId: "output-right",
			type: "source",
			position: "right",
			color: "#3b82f6",
			label: "Data Out"
		}
	]);

	// Methods
	const handleConfigure = () => {
		emit("configure", props.id);
	};

	const handleDelete = () => {
		emit("delete", props.id);
	};

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

	// Simulate connection status changes
	const simulateConnection = () => {
		connectionStatus.value = "connecting";
		setTimeout(() => {
			connectionStatus.value = "connected";
		}, 2000);
	};

	// Simulate transport stats
	const simulateStats = () => {
		setInterval(() => {
			if (connectionStatus.value === "connected") {
				transportStats.sent += Math.floor(Math.random() * 5);
				transportStats.received += Math.floor(Math.random() * 3);
			}
		}, 3000);
	};

	// Initialize simulation
	simulateConnection();
	simulateStats();
</script>

<style scoped>
	.transport-node {
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 1rem;
		transition: all 0.3s ease;
		position: relative;
	}

	.transport-node:hover {
		background: rgba(var(--color-neutral-rgb), 0.12);
		border-color: rgba(59, 130, 246, 0.3);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.1);
	}

	/* Connection points */
	.transport-node > div:last-child {
		pointer-events: none;
	}

	/* Status animation */
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>


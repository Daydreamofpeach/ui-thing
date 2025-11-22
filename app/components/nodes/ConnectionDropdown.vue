<template>
	<div class="connection-dropdown">
		<!-- Connection Type Selector -->
		<div class="connection-type-selector mb-4">
			<label class="block text-sm font-medium text-white/80 mb-2">
				Connection Type
			</label>
			<select
				v-model="selectedTypeId"
				class="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
			>
				<option
					v-for="type in availableTypes"
					:key="type.id"
					:value="type.id"
				>
					{{ type.name }} - {{ type.description }}
				</option>
			</select>
		</div>

		<!-- Connection List -->
		<div class="connection-list">
			<div class="flex items-center justify-between mb-3">
				<h4 class="text-sm font-medium text-white">
					Connections ({{ connections.length }})
				</h4>
				<button
					@click="showAddConnection = !showAddConnection"
					class="px-2 py-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded hover:bg-primary/30 transition-colors"
				>
					<UIcon name="i-lucide-plus" class="w-3 h-3 mr-1" />
					Add
				</button>
			</div>

			<!-- Add Connection Form -->
			<div v-if="showAddConnection" class="add-connection-form mb-4 p-3 bg-black/10 border border-white/10 rounded-lg">
				<div class="grid grid-cols-2 gap-3 mb-3">
					<div>
						<label class="block text-xs text-white/60 mb-1">From Node</label>
						<select
							v-model="newConnection.sourceNodeId"
							class="w-full px-2 py-1 bg-black/20 border border-white/20 rounded text-white text-xs focus:border-primary focus:outline-none"
						>
							<option value="">Select source</option>
							<option
								v-for="node in availableNodes"
								:key="node.id"
								:value="node.id"
								:disabled="node.id === nodeId"
							>
								{{ node.data?.name || node.id }}
							</option>
						</select>
					</div>
					<div>
						<label class="block text-xs text-white/60 mb-1">To Node</label>
						<select
							v-model="newConnection.targetNodeId"
							class="w-full px-2 py-1 bg-black/20 border border-white/20 rounded text-white text-xs focus:border-primary focus:outline-none"
						>
							<option value="">Select target</option>
							<option
								v-for="node in availableNodes"
								:key="node.id"
								:value="node.id"
								:disabled="node.id === nodeId"
							>
								{{ node.data?.name || node.id }}
							</option>
						</select>
					</div>
				</div>
				<div class="flex gap-2">
					<button
						@click="createConnection"
						:disabled="!canCreateConnection"
						class="px-3 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Create
					</button>
					<button
						@click="cancelAddConnection"
						class="px-3 py-1 text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>

			<!-- Connections List -->
			<div class="space-y-2 max-h-48 overflow-y-auto">
				<div
					v-for="connection in connections"
					:key="connection.id"
					class="connection-item p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div
								class="w-3 h-3 rounded-full"
								:style="{ backgroundColor: getConnectionType(connection.type).color }"
							></div>
							<div class="text-xs">
								<span class="text-white/80">
									{{ getNodeName(connection.source) }} →
								</span>
								<span class="text-white/60">
									{{ getNodeName(connection.target) }}
								</span>
							</div>
						</div>
						<div class="flex items-center gap-1">
							<span class="text-xs text-white/40">
								{{ getConnectionType(connection.type).name }}
							</span>
							<button
								@click="deleteConnection(connection.id)"
								class="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
								title="Delete connection"
							>
								<UIcon name="i-lucide-trash-2" class="w-3 h-3" />
							</button>
						</div>
					</div>
				</div>
				
				<div v-if="connections.length === 0" class="text-center py-4 text-white/40 text-xs">
					No connections found
				</div>
			</div>
		</div>

		<!-- Connection Type Info -->
		<div v-if="selectedType" class="connection-type-info mt-4 p-3 bg-black/10 border border-white/10 rounded-lg">
			<div class="flex items-center gap-2 mb-2">
				<UIcon :name="selectedType.icon" class="w-4 h-4" :style="{ color: selectedType.color }" />
				<span class="text-sm font-medium text-white">{{ selectedType.name }}</span>
			</div>
			<p class="text-xs text-white/60 mb-2">{{ selectedType.description }}</p>
			<div class="text-xs text-white/40">
				<div>From: {{ selectedType.allowedFrom.join(', ') }}</div>
				<div>To: {{ selectedType.allowedTo.join(', ') }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { computed, ref, reactive } from "vue";
	import { useConnectionTypes } from "~/composables/useConnectionTypes";
	import type { ConnectionType } from "~/composables/useConnectionTypes";

	interface Props {
		nodeId: string;
		connections: any[];
		availableNodes: any[];
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		createConnection: [connection: { sourceNodeId: string; targetNodeId: string; type: string }];
		deleteConnection: [connectionId: string];
		updateConnectionType: [connectionId: string, type: string];
	}>();

	const { availableTypes, getConnectionType } = useConnectionTypes();

	const selectedTypeId = ref(availableTypes.value[0]?.id || 'default');
	const showAddConnection = ref(false);

	const newConnection = reactive({
		sourceNodeId: "",
		targetNodeId: "",
		type: selectedTypeId.value
	});

	const selectedType = computed(() => getConnectionType(selectedTypeId.value));

	const canCreateConnection = computed(() => {
		return newConnection.sourceNodeId && 
			   newConnection.targetNodeId && 
			   newConnection.sourceNodeId !== newConnection.targetNodeId;
	});

	const getNodeName = (nodeId: string) => {
		const node = props.availableNodes.find(n => n.id === nodeId);
		return node?.data?.name || nodeId;
	};

	const createConnection = () => {
		if (!canCreateConnection.value) return;

		emit("createConnection", {
			sourceNodeId: newConnection.sourceNodeId,
			targetNodeId: newConnection.targetNodeId,
			type: selectedTypeId.value
		});

		// Reset form
		newConnection.sourceNodeId = "";
		newConnection.targetNodeId = "";
		showAddConnection.value = false;
	};

	const cancelAddConnection = () => {
		newConnection.sourceNodeId = "";
		newConnection.targetNodeId = "";
		showAddConnection.value = false;
	};

	const deleteConnection = (connectionId: string) => {
		emit("deleteConnection", connectionId);
	};
</script>

<style scoped>
	.connection-dropdown {
		background: rgba(var(--color-neutral-rgb), 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.connection-item {
		transition: all 0.2s ease;
	}

	.connection-item:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.add-connection-form {
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

	/* Custom scrollbar */
	.connection-list::-webkit-scrollbar {
		width: 4px;
	}

	.connection-list::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
	}

	.connection-list::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}

	.connection-list::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>


<template>
	<div class="connection-flow-manager" :class="{ active: isActive }">
		<!-- Connection Flow Overlay -->
		<div v-if="isActive" class="connection-overlay" @click="cancelConnection">
			<div class="connection-preview" v-if="connectionPreview" :style="previewStyle" />
		</div>

		<!-- Connection Flow HUD -->
		<div v-if="isActive" class="connection-hud">
			<div class="hud-header">
				<UIcon name="i-lucide-link" class="size-4" />
				<span>Create Connection</span>
			</div>
			<div class="hud-content">
				<div class="connection-info">
					<div class="source-info" v-if="connectionSource">
						<span class="label">From:</span>
						<span class="node-name">{{ getNodeName(connectionSource.nodeId) }}</span>
					</div>
					<div class="arrow-indicator">
						<UIcon name="i-lucide-arrow-right" class="size-4" />
					</div>
					<div class="target-info">
						<span class="label">To:</span>
						<span class="node-name">{{ connectionTarget ? getNodeName(connectionTarget.nodeId) : 'Select target...' }}</span>
					</div>
				</div>
				
				<!-- Connection Type Selection -->
				<div class="connection-type-selection" v-if="availableConnectionTypes.length > 0">
					<span class="type-label">Connection Type:</span>
					<select v-model="selectedConnectionType" class="type-select">
						<option v-for="type in availableConnectionTypes" :key="type.id" :value="type.id">
							{{ type.name }}
						</option>
					</select>
				</div>
			</div>
			
			<div class="hud-actions">
				<button class="hud-btn cancel-btn" @click="cancelConnection">
					<UIcon name="i-lucide-x" class="size-3" />
					Cancel
				</button>
				<button 
					class="hud-btn confirm-btn" 
					:disabled="!canCreateConnection"
					@click="confirmConnection"
				>
					<UIcon name="i-lucide-check" class="size-3" />
					Connect
				</button>
			</div>
		</div>

		<!-- Connection Suggestions -->
		<div v-if="showSuggestions && connectionSuggestions.length > 0" class="connection-suggestions">
			<div class="suggestions-header">
				<UIcon name="i-lucide-lightbulb" class="size-3" />
				<span>Suggested Connections</span>
			</div>
			<div class="suggestions-list">
				<div 
					v-for="suggestion in connectionSuggestions" 
					:key="suggestion.id"
					class="suggestion-item"
					@click="applySuggestion(suggestion)"
				>
					<div class="suggestion-icon">
						<UIcon :name="suggestion.icon || 'i-lucide-link'" class="size-3" />
					</div>
					<div class="suggestion-content">
						<span class="suggestion-name">{{ suggestion.name }}</span>
						<span class="suggestion-description">{{ suggestion.description }}</span>
					</div>
					<button class="suggestion-btn">
						<UIcon name="i-lucide-plus" class="size-2" />
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import UIcon from "~/components/Ui/Icon.vue";

	interface ConnectionHandle {
		nodeId: string;
		handleId: string;
		type: "source" | "target" | "both";
		position: "top" | "bottom" | "left" | "right";
	}

	interface ConnectionType {
		id: string;
		name: string;
		flowType: string;
		style?: Record<string, any>;
	}

	interface ConnectionSuggestion {
		id: string;
		name: string;
		description: string;
		icon?: string;
		sourceNodeId: string;
		targetNodeId: string;
		handleId: string;
		type: ConnectionType;
	}

	interface Props {
		nodes: any[];
		edges: any[];
		connectionTypes?: ConnectionType[];
	}

	const props = withDefaults(defineProps<Props>(), {
		connectionTypes: () => [
			{ id: "default", name: "Default", flowType: "smoothstep" },
			{ id: "straight", name: "Straight", flowType: "straight" },
			{ id: "step", name: "Step", flowType: "step" },
			{ id: "smoothstep", name: "Smooth Step", flowType: "smoothstep" },
			{ id: "simplebezier", name: "Bezier", flowType: "simplebezier" }
		]
	});

	const emit = defineEmits<{
		connectionStart: [sourceHandle: ConnectionHandle];
		connectionEnd: [targetHandle: ConnectionHandle];
		createConnection: [sourceHandle: ConnectionHandle, targetHandle: ConnectionHandle, connectionType?: ConnectionType];
		cancelConnection: [];
	}>();

	const isActive = ref(false);
	const connectionSource = ref<ConnectionHandle | null>(null);
	const connectionTarget = ref<ConnectionHandle | null>(null);
	const selectedConnectionType = ref("default");
	const showSuggestions = ref(false);
	const connectionPreview = ref<{ x: number; y: number } | null>(null);

	const availableConnectionTypes = computed(() => props.connectionTypes);

	const canCreateConnection = computed(() => {
		return connectionSource.value && connectionTarget.value && 
			   connectionSource.value.nodeId !== connectionTarget.value.nodeId;
	});

	const connectionSuggestions = computed((): ConnectionSuggestion[] => {
		if (!connectionSource.value || !props.nodes) return [];
		
		// Generate smart connection suggestions based on node types and existing patterns
		const suggestions: ConnectionSuggestion[] = [];
		
		props.nodes.forEach(targetNode => {
			if (targetNode.id === connectionSource.value?.nodeId) return;
			
			const sourceNode = props.nodes.find(n => n.id === connectionSource.value?.nodeId);
			if (!sourceNode) return;
			
			// Add logic to suggest connections based on node types, positions, etc.
			// This is a simplified version - can be expanded with more sophisticated logic
			const suggestion = {
				id: `suggestion-${sourceNode.id}-${targetNode.id}`,
				name: `${sourceNode.type || 'Node'} → ${targetNode.type || 'Node'}`,
				description: `Connect ${sourceNode.data?.label || sourceNode.id} to ${targetNode.data?.label || targetNode.id}`,
				icon: "i-lucide-link",
				sourceNodeId: sourceNode.id,
				targetNodeId: targetNode.id,
				handleId: "auto",
				type: props.connectionTypes[0]
			};
			
			suggestions.push(suggestion);
		});
		
		return suggestions.slice(0, 3); // Limit to 3 suggestions
	});

	const previewStyle = computed(() => {
		if (!connectionPreview.value || !connectionSource.value) return {};
		
		// Calculate preview line style based on connection source position
		return {
			transform: `translate(${connectionPreview.value.x}px, ${connectionPreview.value.y}px)`
		};
	});

	const getNodeName = (nodeId: string) => {
		const node = props.nodes.find(n => n.id === nodeId);
		return node?.data?.label || node?.type || nodeId;
	};

	const startConnection = (sourceHandle: ConnectionHandle) => {
		isActive.value = true;
		connectionSource.value = sourceHandle;
		connectionTarget.value = null;
		showSuggestions.value = true;
		
		emit("connectionStart", sourceHandle);
	};

	const updateConnectionTarget = (targetHandle: ConnectionHandle) => {
		if (!connectionSource.value) return;
		
		connectionTarget.value = targetHandle;
		showSuggestions.value = false;
	};

	const confirmConnection = () => {
		if (!canCreateConnection.value || !connectionSource.value || !connectionTarget.value) return;
		
		const connectionType = props.connectionTypes.find(t => t.id === selectedConnectionType.value);
		emit("createConnection", connectionSource.value, connectionTarget.value, connectionType);
		finishConnection();
	};

	const cancelConnection = () => {
		finishConnection();
		emit("cancelConnection");
	};

	const applySuggestion = (suggestion: ConnectionSuggestion) => {
		const sourceHandle: ConnectionHandle = {
			nodeId: suggestion.sourceNodeId,
			handleId: "output-right",
			type: "source",
			position: "right"
		};
		
		const targetHandle: ConnectionHandle = {
			nodeId: suggestion.targetNodeId,
			handleId: "input-left",
			type: "target",
			position: "left"
		};
		
		emit("createConnection", sourceHandle, targetHandle, suggestion.type);
		finishConnection();
	};

	const finishConnection = () => {
		isActive.value = false;
		connectionSource.value = null;
		connectionTarget.value = null;
		connectionPreview.value = null;
		showSuggestions.value = false;
	};

	const updatePreview = (x: number, y: number) => {
		connectionPreview.value = { x, y };
	};

	// Expose methods for parent components
	defineExpose({
		startConnection,
		updateConnectionTarget,
		confirmConnection,
		cancelConnection,
		updatePreview
	});
</script>

<style scoped>
	.connection-flow-manager {
		position: relative;
		pointer-events: none;
	}

	.connection-flow-manager.active {
		pointer-events: all;
	}

	.connection-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.1);
		z-index: 1000;
		cursor: crosshair;
	}

	.connection-preview {
		position: absolute;
		width: 2px;
		height: 2px;
		background: rgba(var(--color-primary-rgb), 0.8);
		border-radius: 1px;
		pointer-events: none;
	}

	.connection-hud {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(var(--color-neutral-rgb), 0.15);
		backdrop-filter: blur(24px) saturate(1.8);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 12px;
		padding: 16px 20px;
		min-width: 300px;
		z-index: 1001;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.hud-header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 12px;
	}

	.hud-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
	}

	.connection-info {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
	}

	.source-info,
	.target-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.node-name {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.arrow-indicator {
		color: rgba(var(--color-primary-rgb), 0.8);
	}

	.connection-type-selection {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.type-label {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		white-space: nowrap;
	}

	.type-select {
		flex: 1;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: white;
		font-size: 11px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.type-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
	}

	.hud-actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}

	.hud-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.hud-btn.cancel-btn {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.2);
		color: rgba(239, 68, 68, 0.9);
	}

	.hud-btn.cancel-btn:hover {
		background: rgba(239, 68, 68, 0.15);
		border-color: rgba(239, 68, 68, 0.3);
	}

	.hud-btn.confirm-btn {
		background: rgba(34, 197, 94, 0.1);
		border-color: rgba(34, 197, 94, 0.2);
		color: rgba(34, 197, 94, 0.9);
	}

	.hud-btn.confirm-btn:hover:not(:disabled) {
		background: rgba(34, 197, 94, 0.15);
		border-color: rgba(34, 197, 94, 0.3);
	}

	.hud-btn.confirm-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.connection-suggestions {
		position: fixed;
		top: 120px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(var(--color-neutral-rgb), 0.15);
		backdrop-filter: blur(24px) saturate(1.8);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 12px;
		padding: 12px;
		min-width: 250px;
		max-width: 300px;
		z-index: 1000;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.suggestions-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.suggestions-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.suggestion-item:hover {
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	}

	.suggestion-icon {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.1);
		border-radius: 4px;
		color: rgba(var(--color-primary-rgb), 0.8);
	}

	.suggestion-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.suggestion-name {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.suggestion-description {
		font-size: 9px;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.2;
	}

	.suggestion-btn {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 3px;
		color: rgba(var(--color-primary-rgb), 0.8);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.suggestion-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}
</style>

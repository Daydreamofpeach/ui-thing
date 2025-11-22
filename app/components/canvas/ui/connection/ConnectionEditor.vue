<template>
	<div class="connection-editor">
		<div class="editor-header">
			<div class="header-title-row">
				<UIcon name="i-lucide-link" class="size-4 text-primary" />
				<h4 class="editor-title">Connection Editor</h4>
			</div>
			<button class="close-btn" @click="$emit('close')">
				<UIcon name="i-lucide-x" class="size-3" />
			</button>
		</div>

		<div class="editor-content">
			<!-- Connection Flow -->
			<div class="connection-flow-display">
				<div class="flow-node from-node">
					<UIcon :name="getNodeIcon(fromNode)" class="size-3" />
					<span class="node-label">{{ fromNode?.data?.label || fromNode?.type || 'Unknown' }}</span>
				</div>
				<div class="flow-arrow">
					<UIcon name="i-lucide-arrow-right" class="size-4 text-primary" />
				</div>
				<div class="flow-node to-node">
					<UIcon :name="getNodeIcon(toNode)" class="size-3" />
					<span class="node-label">{{ toNode?.data?.label || toNode?.type || 'Unknown' }}</span>
				</div>
			</div>

			<!-- Connection Details -->
			<div class="detail-section">
				<div class="section-header">
					<UIcon name="i-lucide-info" class="size-3" />
					<span class="section-title">Connection Details</span>
				</div>
				
				<div class="detail-grid">
					<div class="detail-item">
						<span class="detail-label">ID:</span>
						<span class="detail-value">{{ connection.id }}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Type:</span>
						<span class="detail-value">{{ connection.type || 'default' }}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Animated:</span>
						<span class="detail-value">{{ connection.animated ? 'Yes' : 'No' }}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">Color:</span>
						<div class="color-display">
							<div 
								class="color-preview" 
								:style="{ backgroundColor: connection.style?.stroke || '#888' }"
							/>
							<span class="detail-value">{{ connection.style?.stroke || 'Default' }}</span>
						</div>
					</div>
					<div class="detail-item">
						<span class="detail-label">Width:</span>
						<span class="detail-value">{{ connection.style?.strokeWidth || 2 }}px</span>
					</div>
					<div v-if="connection.animationType" class="detail-item">
						<span class="detail-label">Animation:</span>
						<span class="detail-value">{{ connection.animationType }}</span>
					</div>
				</div>
			</div>

			<!-- Chain Status -->
			<div class="chain-status-section">
				<div class="section-header">
					<UIcon name="i-lucide-git-branch" class="size-3" />
					<span class="section-title">Chain Status</span>
				</div>
				
				<div v-if="isInChain" class="status-card in-chain">
					<UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400" />
					<div class="status-info">
						<span class="status-text">Part of Automation Chain</span>
						<span class="status-subtext">Using chain flow styling</span>
					</div>
				</div>
				<div v-else class="status-card not-in-chain">
					<UIcon name="i-lucide-circle" class="size-4 text-gray-400" />
					<div class="status-info">
						<span class="status-text">Independent Connection</span>
						<span class="status-subtext">Not part of any chain</span>
					</div>
				</div>
			</div>

			<!-- Edit Controls -->
			<div class="edit-section">
				<div class="section-header">
					<UIcon name="i-lucide-edit-2" class="size-3" />
					<span class="section-title">Quick Edit</span>
				</div>

				<div class="edit-controls">
					<!-- Color Picker -->
					<div class="control-group">
						<label class="control-label">Color</label>
						<div class="color-input-wrapper">
							<input 
								v-model="editedConnection.color"
								type="color"
								class="color-input"
							/>
							<input 
								v-model="editedConnection.color"
								type="text"
								class="color-text-input"
								placeholder="#8b5cf6"
							/>
						</div>
					</div>

					<!-- Width -->
					<div class="control-group">
						<label class="control-label">Width ({{ editedConnection.strokeWidth }}px)</label>
						<input 
							v-model.number="editedConnection.strokeWidth"
							type="range"
							min="1"
							max="10"
							class="range-input"
						/>
					</div>

					<!-- Type -->
					<div class="control-group">
						<label class="control-label">Connection Type</label>
						<select v-model="editedConnection.type" class="select-input">
							<option value="default">Default</option>
							<option value="straight">Straight</option>
							<option value="step">Step</option>
							<option value="smoothstep">Smooth Step</option>
							<option value="simplebezier">Bezier</option>
						</select>
					</div>

					<!-- Animated -->
					<div class="control-group">
						<label class="control-label checkbox-label">
							<input 
								v-model="editedConnection.animated"
								type="checkbox"
								class="checkbox-input"
							/>
							<span>Animated</span>
						</label>
					</div>

					<!-- Animation Type -->
					<div v-if="editedConnection.animated" class="control-group">
						<label class="control-label">Animation Type</label>
						<select v-model="editedConnection.animationType" class="select-input">
							<option value="flow">Flow</option>
							<option value="pulse">Pulse</option>
							<option value="dash">Dash</option>
							<option value="particle">Particle</option>
							<option value="beam">Beam</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="action-section">
				<button 
					v-if="!isInChain"
					class="action-btn chain-btn"
					@click="addToChain"
				>
					<UIcon name="i-lucide-plus-circle" class="size-3" />
					Add to Automation Chain
				</button>

				<button 
					class="action-btn apply-btn"
					@click="applyChanges"
				>
					<UIcon name="i-lucide-check" class="size-3" />
					Apply Changes
				</button>

				<button 
					class="action-btn delete-btn"
					@click="deleteConnection"
				>
					<UIcon name="i-lucide-trash-2" class="size-3" />
					Delete Connection
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, reactive, ref, watch } from "vue";

	interface Props {
		connection: any;
		nodes: any[];
		chainStyle?: any;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		close: [];
		update: [edgeId: string, updates: any];
		delete: [edgeId: string];
		addToChain: [edgeId: string, chainStyle: any];
		liveUpdate: [edgeId: string, updates: any];
	}>();

	// Find connected nodes
	const fromNode = computed(() => 
		props.nodes.find((n: any) => n.id === props.connection.source)
	);

	const toNode = computed(() => 
		props.nodes.find((n: any) => n.id === props.connection.target)
	);

	// Check if in chain (has chain-style properties)
	const isInChain = computed(() => {
		return props.connection.animationType && 
			props.chainStyle && 
			props.connection.style?.stroke === props.chainStyle.color;
	});

	// Editable connection state
	const editedConnection = reactive({
		color: props.connection.style?.stroke || "#8b5cf6",
		strokeWidth: props.connection.style?.strokeWidth || 2,
		type: props.connection.type || "default",
		animated: props.connection.animated || false,
		animationType: props.connection.animationType || "flow"
	});

	const getNodeIcon = (node: any) => {
		if (!node) return "i-lucide-circle";
		const iconMap: Record<string, string> = {
			templateNode: "i-lucide-layout-template",
			browserNode: "i-lucide-globe",
			formsPanelNode: "i-lucide-file-text",
			transportNode: "i-lucide-send",
			hookNode: "i-lucide-webhook",
			userNode: "i-lucide-user",
			solutionNode: "i-lucide-puzzle"
		};
		return iconMap[node.type] || "i-lucide-circle";
	};

	const applyChanges = () => {
		const updates = {
			type: editedConnection.type,
			animated: editedConnection.animated,
			animationType: editedConnection.animationType,
			style: {
				stroke: editedConnection.color,
				strokeWidth: editedConnection.strokeWidth
			},
			markerEnd: {
				type: "arrowclosed",
				color: editedConnection.color
			}
		};

		emit("update", props.connection.id, updates);
	};

	const deleteConnection = () => {
		if (confirm("Are you sure you want to delete this connection?")) {
			emit("delete", props.connection.id);
		}
	};

	const addToChain = () => {
		if (props.chainStyle) {
			emit("addToChain", props.connection.id, props.chainStyle);
		}
	};

	// Watch for changes and emit live updates
	watch(editedConnection, (newValue) => {
		const updates = {
			type: newValue.type,
			animated: newValue.animated,
			animationType: newValue.animationType,
			style: {
				stroke: newValue.color,
				strokeWidth: newValue.strokeWidth
			},
			markerEnd: {
				type: "arrowclosed",
				color: newValue.color
			}
		};

		emit("liveUpdate", props.connection.id, updates);
	}, { deep: true });
</script>

<style scoped>
	.connection-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(0, 0, 0, 0.2);
	}

	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), transparent);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.header-title-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.editor-title {
		font-size: 14px;
		font-weight: 700;
		color: white;
		margin: 0;
		letter-spacing: 0.3px;
	}

	.close-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.25);
		border-radius: 5px;
		color: rgba(239, 68, 68, 1);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(239, 68, 68, 0.25);
		border-color: rgba(239, 68, 68, 0.4);
		transform: scale(1.05);
	}

	.editor-content {
		flex: 1;
		padding: 16px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.connection-flow-display {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.flow-node {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
	}

	.node-label {
		font-size: 11px;
		font-weight: 600;
		color: white;
	}

	.flow-arrow {
		flex-shrink: 0;
	}

	.detail-section,
	.chain-status-section,
	.edit-section,
	.action-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.section-title {
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 10px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
	}

	.detail-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.detail-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.detail-value {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.color-display {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.color-preview {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.status-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px;
		border-radius: 8px;
		border: 1px solid;
	}

	.status-card.in-chain {
		background: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.3);
	}

	.status-card.not-in-chain {
		background: rgba(107, 114, 128, 0.1);
		border-color: rgba(107, 114, 128, 0.3);
	}

	.status-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.status-text {
		font-size: 12px;
		font-weight: 600;
		color: white;
	}

	.status-subtext {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
	}

	.edit-controls {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.control-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.checkbox-label {
		flex-direction: row;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.color-input-wrapper {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.color-input {
		width: 50px;
		height: 36px;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		cursor: pointer;
		background: transparent;
	}

	.color-text-input,
	.select-input {
		flex: 1;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		color: white;
		font-size: 11px;
		font-weight: 500;
	}

	.range-input {
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.range-input::-webkit-slider-thumb {
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border-radius: 50%;
		cursor: pointer;
	}

	.checkbox-input {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.action-section {
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
	}

	.chain-btn {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.3);
		color: rgba(16, 185, 129, 1);
	}

	.chain-btn:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
	}

	.apply-btn {
		background: rgba(59, 130, 246, 0.15);
		border-color: rgba(59, 130, 246, 0.3);
		color: rgba(59, 130, 246, 1);
	}

	.apply-btn:hover {
		background: rgba(59, 130, 246, 0.25);
		border-color: rgba(59, 130, 246, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
	}

	.delete-btn {
		background: rgba(239, 68, 68, 0.15);
		border-color: rgba(239, 68, 68, 0.3);
		color: rgba(239, 68, 68, 1);
	}

	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.25);
		border-color: rgba(239, 68, 68, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
	}
</style>


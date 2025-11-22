<template>
	<div class="chain-connection-builder">
		<div class="builder-header">
			<UIcon name="i-lucide-workflow" class="size-3 text-primary" />
			<span class="builder-title">Chain Connection Builder</span>
		</div>

		<!-- Start Node -->
		<div class="connection-role-section">
			<div class="role-header">
				<UIcon name="i-lucide-play-circle" class="size-3 text-emerald-400" />
				<span class="role-title">START Node</span>
			</div>
			<select v-model="startNode" class="node-select" @change="updateChainStructure">
				<option value="">Select start node...</option>
				<option v-for="node in availableNodes" :key="node.id" :value="node.id">
					{{ node.data?.label || node.type }}
				</option>
			</select>
			<p v-if="startNode" class="role-description">
				This node begins the automation sequence
			</p>
		</div>

		<!-- Middle Nodes (Flow Through) -->
		<div v-if="middleNodes.length > 0" class="connection-role-section">
			<div class="role-header">
				<UIcon name="i-lucide-git-commit" class="size-3 text-blue-400" />
				<span class="role-title">FLOW THROUGH Nodes</span>
			</div>
			<div class="middle-nodes-list">
				<div
					v-for="(nodeId, index) in middleNodes"
					:key="nodeId"
					class="middle-node-item"
				>
					<div class="node-step-number">{{ index + 2 }}</div>
					<div class="node-info">
						<span class="node-name">{{ getNodeName(nodeId) }}</span>
						<!-- From configuration -->
						<div class="connection-config">
							<label class="config-mini-label">From:</label>
							<select
								v-model="middleNodeConfigs[nodeId].from"
								class="mini-select"
								@change="updateChainStructure"
							>
								<option value="">Auto (previous)</option>
								<option v-for="n in getPossibleSources(nodeId)" :key="n.id" :value="n.id">
									{{ n.data?.label || n.type }}
								</option>
							</select>
						</div>
						<!-- To configuration -->
						<div class="connection-config">
							<label class="config-mini-label">To:</label>
							<select
								v-model="middleNodeConfigs[nodeId].to"
								class="mini-select"
								@change="updateChainStructure"
							>
								<option value="">Auto (next)</option>
								<option v-for="n in getPossibleTargets(nodeId)" :key="n.id" :value="n.id">
									{{ n.data?.label || n.type }}
								</option>
							</select>
						</div>
					</div>
					<button class="remove-node-btn" @click="removeFromChain(nodeId)">
						<UIcon name="i-lucide-x" class="size-2" />
					</button>
				</div>
			</div>
		</div>

		<!-- End Node -->
		<div class="connection-role-section">
			<div class="role-header">
				<UIcon name="i-lucide-flag" class="size-3 text-orange-400" />
				<span class="role-title">END Node</span>
			</div>
			<select v-model="endNode" class="node-select" @change="updateChainStructure">
				<option value="">Select end node...</option>
				<option
					v-for="node in getAvailableEndNodes()"
					:key="node.id"
					:value="node.id"
				>
					{{ node.data?.label || node.type }}
				</option>
			</select>
			<p v-if="endNode" class="role-description">
				This node completes the automation sequence
			</p>
		</div>

		<!-- Add More Nodes -->
		<div v-if="startNode && endNode" class="add-more-section">
			<button class="add-node-btn" @click="showAddNode = !showAddNode">
				<UIcon name="i-lucide-plus-circle" class="size-3" />
				Add Node to Flow
			</button>
			<div v-if="showAddNode" class="add-node-form">
				<select v-model="nodeToAdd" class="node-select">
					<option value="">Select node...</option>
					<option
						v-for="node in getNodesNotInChain()"
						:key="node.id"
						:value="node.id"
					>
						{{ node.data?.label || node.type }}
					</option>
				</select>
				<button
					class="form-btn"
					:disabled="!nodeToAdd"
					@click="addNodeToChain"
				>
					Add
				</button>
			</div>
		</div>

		<!-- Connection Preview -->
		<div v-if="getConnectionPreview().length > 0" class="preview-section">
			<div class="preview-header">
				<UIcon name="i-lucide-eye" class="size-3" />
				<span>Connection Preview</span>
				<span class="preview-count">{{ getConnectionPreview().length }} connection(s)</span>
			</div>
			<div class="preview-list">
				<div
					v-for="(conn, index) in getConnectionPreview()"
					:key="index"
					class="preview-connection"
				>
					<div class="preview-number">{{ index + 1 }}</div>
					<div class="preview-flow">
						<span class="preview-node-name">{{ getNodeName(conn.source) }}</span>
						<UIcon name="i-lucide-arrow-right" class="size-2 text-primary" />
						<span class="preview-node-name">{{ getNodeName(conn.target) }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Apply Button -->
		<button
			v-if="startNode && endNode"
			class="apply-chain-btn"
			:disabled="getConnectionPreview().length === 0"
			@click="applyChainConnections"
		>
			<UIcon name="i-lucide-zap" class="size-3" />
			{{ getApplyButtonText() }}
		</button>
	</div>
</template>

<script setup lang="ts">
	import { computed, reactive, ref, watch } from "vue";

	interface Props {
		nodes: any[];
		edges: any[];
		sequence: string[];
		connectionStyle: any;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		createConnections: [connections: any[]];
		updateConnections: [updates: Array<{ id: string; updates: any }>];
		"update:sequence": [sequence: string[]];
	}>();

	const startNode = ref("");
	const endNode = ref("");
	const middleNodes = ref<string[]>([]);
	const middleNodeConfigs = reactive<Record<string, { from: string; to: string }>>({});
	const showAddNode = ref(false);
	const nodeToAdd = ref("");

	const availableNodes = computed(() =>
		props.nodes.filter((n: any) => n.type !== "viewport")
	);

	const getNodeName = (nodeId: string) => {
		const node = props.nodes.find((n: any) => n.id === nodeId);
		return node?.data?.label || node?.type || nodeId;
	};

	const getAvailableEndNodes = () => {
		return availableNodes.value.filter((n: any) => n.id !== startNode.value);
	};

	const getPossibleSources = (nodeId: string) => {
		const index = middleNodes.value.indexOf(nodeId);
		if (index === 0 && startNode.value) {
			return [props.nodes.find((n: any) => n.id === startNode.value)].filter(Boolean);
		}
		const possibleSources = [startNode.value, ...middleNodes.value.slice(0, index)];
		return props.nodes.filter((n: any) => possibleSources.includes(n.id));
	};

	const getPossibleTargets = (nodeId: string) => {
		const index = middleNodes.value.indexOf(nodeId);
		const possibleTargets = [...middleNodes.value.slice(index + 1), endNode.value];
		return props.nodes.filter((n: any) => possibleTargets.includes(n.id));
	};

	const getNodesNotInChain = () => {
		const chainNodes = [startNode.value, ...middleNodes.value, endNode.value].filter(Boolean);
		return availableNodes.value.filter((n: any) => !chainNodes.includes(n.id));
	};

	const addNodeToChain = () => {
		if (!nodeToAdd.value) return;
		
		middleNodes.value.push(nodeToAdd.value);
		middleNodeConfigs[nodeToAdd.value] = { from: "", to: "" };
		nodeToAdd.value = "";
		showAddNode.value = false;
		updateChainStructure();
	};

	const removeFromChain = (nodeId: string) => {
		const index = middleNodes.value.indexOf(nodeId);
		if (index > -1) {
			middleNodes.value.splice(index, 1);
			delete middleNodeConfigs[nodeId];
			updateChainStructure();
		}
	};

	const updateChainStructure = () => {
		// Update the sequence to match the chain structure
		const newSequence = [startNode.value, ...middleNodes.value, endNode.value].filter(Boolean);
		emit("update:sequence", newSequence);
	};

	const getConnectionPreview = () => {
		const connections: Array<{ source: string; target: string }> = [];
		
		if (!startNode.value) return connections;

		const fullSequence = [startNode.value, ...middleNodes.value, endNode.value].filter(Boolean);

		// Build connections based on configurations
		for (let i = 0; i < fullSequence.length - 1; i++) {
			const currentNode = fullSequence[i];
			let targetNode = fullSequence[i + 1];

			// Check if there's a custom "to" configuration for this node
			if (middleNodeConfigs[currentNode]?.to) {
				targetNode = middleNodeConfigs[currentNode].to;
			}

			// Check if there's a custom "from" configuration for the target
			if (middleNodeConfigs[targetNode]?.from) {
				connections.push({
					source: middleNodeConfigs[targetNode].from,
					target: targetNode
				});
			} else if (targetNode) {
				connections.push({
					source: currentNode,
					target: targetNode
				});
			}
		}

		// Remove duplicates
		const uniqueConnections = connections.filter(
			(conn, index, self) =>
				self.findIndex((c) => c.source === conn.source && c.target === conn.target) === index
		);

		return uniqueConnections;
	};

	const getApplyButtonText = () => {
		const connectionsToCreate = getConnectionPreview();
		let newCount = 0;
		let updateCount = 0;

		connectionsToCreate.forEach((conn) => {
			const existingEdge = props.edges.find(
				(edge: any) => edge.source === conn.source && edge.target === conn.target
			);
			if (existingEdge) {
				updateCount++;
			} else {
				newCount++;
			}
		});

		if (newCount > 0 && updateCount > 0) {
			return `Create ${newCount} & Update ${updateCount} Connection(s)`;
		} else if (newCount > 0) {
			return `Create ${newCount} Connection(s)`;
		} else if (updateCount > 0) {
			return `Update ${updateCount} Connection(s)`;
		}
		return "Apply Chain";
	};

	const applyChainConnections = () => {
		const connectionsToCreate = getConnectionPreview();
		
		// Separate into existing and new connections
		const edgesToUpdate: Array<{ id: string; updates: any }> = [];
		const edgesToCreate: any[] = [];

		connectionsToCreate.forEach((conn) => {
			// Check if connection already exists
			const existingEdge = props.edges.find(
				(edge: any) => edge.source === conn.source && edge.target === conn.target
			);

			const styleData = {
				type: props.connectionStyle.type,
				animated: props.connectionStyle.animated,
				animationType: props.connectionStyle.animationType,
				animationSpeed: props.connectionStyle.animationSpeed,
				style: {
					stroke: props.connectionStyle.color,
					strokeWidth: props.connectionStyle.strokeWidth
				},
				markerEnd: {
					type: "arrowclosed",
					color: props.connectionStyle.color
				}
			};

			if (existingEdge) {
				// Update existing edge
				edgesToUpdate.push({
					id: existingEdge.id,
					updates: styleData
				});
			} else {
				// Create new edge
				edgesToCreate.push({
					id: `edge-${conn.source}-${conn.target}-${Date.now()}`,
					source: conn.source,
					target: conn.target,
					sourceHandle: "right",
					targetHandle: "left",
					...styleData
				});
			}
		});

		emit("createConnections", edgesToCreate);
		emit("updateConnections", edgesToUpdate);
	};

	// Watch sequence prop to initialize
	watch(() => props.sequence, (newSeq) => {
		if (newSeq && newSeq.length >= 2) {
			startNode.value = newSeq[0];
			endNode.value = newSeq[newSeq.length - 1];
			middleNodes.value = newSeq.slice(1, -1);
			
			// Initialize configs for middle nodes
			middleNodes.value.forEach((nodeId) => {
				if (!middleNodeConfigs[nodeId]) {
					middleNodeConfigs[nodeId] = { from: "", to: "" };
				}
			});
		}
	}, { immediate: true });
</script>

<style scoped>
	.chain-connection-builder {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.builder-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 12px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
	}

	.builder-title {
		font-size: 11px;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.connection-role-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
	}

	.role-header {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.role-title {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	.role-description {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
		font-style: italic;
	}

	.node-select {
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		color: white;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.node-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.4);
	}

	.middle-nodes-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.middle-node-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 10px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
	}

	.node-step-number {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(59, 130, 246, 0.2);
		border: 2px solid rgba(59, 130, 246, 0.4);
		border-radius: 50%;
		font-size: 11px;
		font-weight: 800;
		color: rgba(59, 130, 246, 1);
		flex-shrink: 0;
	}

	.node-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.node-name {
		font-size: 12px;
		font-weight: 600;
		color: white;
	}

	.connection-config {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.config-mini-label {
		font-size: 9px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 40px;
	}

	.mini-select {
		flex: 1;
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		color: white;
		font-size: 10px;
		cursor: pointer;
	}

	.remove-node-btn {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.25);
		border-radius: 4px;
		color: rgba(239, 68, 68, 1);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.remove-node-btn:hover {
		background: rgba(239, 68, 68, 0.25);
		border-color: rgba(239, 68, 68, 0.4);
	}

	.add-more-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.add-node-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(var(--color-primary-rgb), 0.12);
		border: 1px dashed rgba(var(--color-primary-rgb), 0.3);
		border-radius: 6px;
		color: var(--color-primary);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-node-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		border-style: solid;
	}

	.add-node-form {
		display: flex;
		gap: 8px;
	}

	.form-btn {
		padding: 6px 14px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 5px;
		color: rgba(16, 185, 129, 1);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.form-btn:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.form-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.preview-section {
		padding: 12px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 8px;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
	}

	.preview-count {
		margin-left: auto;
		padding: 2px 8px;
		background: rgba(var(--color-primary-rgb), 0.2);
		border-radius: 10px;
		color: var(--color-primary);
		font-size: 10px;
	}

	.preview-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.preview-connection {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
	}

	.preview-number {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.2);
		border-radius: 50%;
		font-size: 10px;
		font-weight: 700;
		color: var(--color-primary);
	}

	.preview-flow {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.preview-node-name {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.apply-chain-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 16px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 8px;
		color: rgba(16, 185, 129, 1);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.apply-chain-btn:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
	}

	.apply-chain-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>


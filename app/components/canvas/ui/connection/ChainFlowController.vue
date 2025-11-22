<template>
	<div class="chain-flow-controller">
		<!-- Header -->
		<div class="controller-header">
			<div class="header-content">
				<UIcon name="i-lucide-workflow" class="size-4 text-primary" />
				<h4 class="controller-title">
					Chain Flow Builder
				</h4>
			</div>
			<p class="controller-subtitle">
				Build automation sequences with visual feedback
			</p>
		</div>

		<!-- Phase Tabs -->
		<div class="phase-tabs">
			<button
				class="phase-tab"
				:class="{ active: currentPhase === 'select' }"
				@click="currentPhase = 'select'"
			>
				<UIcon name="i-lucide-mouse-pointer-click" class="size-3" />
				<span>1. Select</span>
			</button>
			<button
				class="phase-tab"
				:class="{ active: currentPhase === 'layout' }"
				:disabled="selectedNodes.length < 2"
				@click="currentPhase = 'layout'"
			>
				<UIcon name="i-lucide-layout" class="size-3" />
				<span>2. Layout</span>
			</button>
			<button
				class="phase-tab"
				:class="{ active: currentPhase === 'connections' }"
				:disabled="selectedNodes.length < 2"
				@click="currentPhase = 'connections'"
			>
				<UIcon name="i-lucide-link" class="size-3" />
				<span>3. Connect</span>
			</button>
		</div>

		<!-- Phase: Node Selection -->
		<div v-if="currentPhase === 'select'" class="phase-content">
			<!-- Existing Chains List -->
			<div class="phase-section">
				<ExistingChainsList
					:nodes="nodes"
					:edges="edges"
					@animate-chain="handleAnimateExistingChain"
					@edit-chain="handleEditExistingChain"
					@delete-chain="handleDeleteExistingChain"
					@merge-chains="handleMergeChains"
				/>
			</div>

			<div class="phase-divider">
				<span class="divider-text">OR CREATE NEW CHAIN</span>
			</div>

			<div class="phase-section">
				<div class="section-title-row">
					<h5 class="section-title">
						Available Nodes
					</h5>
					<div class="selection-actions">
						<button
							v-if="availableNodes.length > 0"
							class="select-all-btn"
							@click="selectAllAvailableNodes"
						>
							<UIcon name="i-lucide-check-square" class="size-3" />
							Select All ({{ availableNodes.length }})
						</button>
						<button
							v-if="selectedNodes.length > 0"
							class="clear-all-btn"
							@click="clearAllSelections"
						>
							<UIcon name="i-lucide-x-square" class="size-3" />
							Clear
						</button>
						<span class="selection-count">{{ selectedNodes.length }} selected</span>
					</div>
				</div>

				<div class="node-grid">
					<div
						v-for="node in availableNodes"
						:key="node.id"
						class="node-card"
						:class="{ selected: selectedNodes.includes(node.id) }"
						@click="toggleNodeSelection(node.id)"
					>
						<div class="node-card-icon">
							<UIcon :name="getNodeIcon(node)" class="size-4" />
						</div>
						<div class="node-card-info">
							<span class="node-card-name">{{ node.data?.label || node.type }}</span>
							<span class="node-card-type">{{ node.type }}</span>
						</div>
						<div v-if="selectedNodes.includes(node.id)" class="selection-badge">
							{{ selectedNodes.indexOf(node.id) + 1 }}
						</div>
					</div>
				</div>

				<button
					v-if="selectedNodes.length >= 2"
					class="phase-next-btn"
					@click="currentPhase = 'layout'"
				>
					Next: Configure Layout
					<UIcon name="i-lucide-arrow-right" class="size-3" />
				</button>
			</div>
		</div>

		<!-- Phase: Layout Configuration -->
		<div v-if="currentPhase === 'layout'" class="phase-content">
			<!-- Node Sequence Manager -->
			<div class="phase-section">
				<NodeSequenceManager
					:sequence="selectedNodes"
					:nodes="nodes"
					@update:sequence="selectedNodes = $event"
				/>
			</div>

			<!-- Layout Configuration -->
			<div class="phase-section">
				<div class="section-title-row">
					<h5 class="section-title">
						Layout Pattern
					</h5>
					<div class="auto-apply-toggle">
						<input
							id="auto-apply"
							v-model="autoApplyLayout"
							type="checkbox"
							class="toggle-checkbox"
						>
						<label for="auto-apply" class="toggle-label">
							<UIcon name="i-lucide-zap" class="size-2" />
							Live Update
						</label>
					</div>
				</div>

				<!-- Layout Hint -->
				<div v-if="layoutConfig.layout === 'current'" class="layout-hint">
					<UIcon name="i-lucide-info" class="size-3 text-emerald-400" />
					<p class="hint-text">
						"Current" preserves your custom node positions. Use spacing sliders to fine-tune distances between nodes.
					</p>
				</div>

				<NodeLayoutConfig v-model="layoutConfig" @update:model-value="onLayoutChange" />
			</div>

			<!-- Visual Preview -->
			<div class="phase-section">
				<ConnectionFlowVisualizer
					:sequence="selectedNodes"
					:nodes="nodes"
					:connection-style="connectionStyle"
					:layout="layoutConfig.layout"
					:spacing="Math.min(layoutConfig.spacing / 3, 80)"
					@animate-on-canvas="handleAnimateOnCanvas"
				/>
			</div>

			<!-- Actions -->
			<div class="phase-actions">
				<button class="action-btn secondary-btn" @click="currentPhase = 'select'">
					<UIcon name="i-lucide-arrow-left" class="size-3" />
					Back
				</button>
				<button class="action-btn primary-btn" @click="applyLayoutToCanvas">
					<UIcon name="i-lucide-wand-2" class="size-3" />
					Apply Layout to Canvas
				</button>
				<button class="action-btn primary-btn" @click="currentPhase = 'connections'">
					Next: Create Connections
					<UIcon name="i-lucide-arrow-right" class="size-3" />
				</button>
			</div>
		</div>

		<!-- Phase: Connection Creation -->
		<div v-if="currentPhase === 'connections'" class="phase-content">
			<!-- Connection Mode Toggle -->
			<div class="mode-toggle-section">
				<button
					class="mode-btn"
					:class="{ active: connectionMode === 'simple' }"
					@click="connectionMode = 'simple'"
				>
					<UIcon name="i-lucide-minus" class="size-3" />
					Simple Chain
				</button>
				<button
					class="mode-btn"
					:class="{ active: connectionMode === 'advanced' }"
					@click="connectionMode = 'advanced'"
				>
					<UIcon name="i-lucide-git-merge" class="size-3" />
					Advanced Flow
				</button>
			</div>

			<!-- Simple Mode: Guided Chain Builder -->
			<template v-if="connectionMode === 'simple'">
				<!-- Connection Style -->
				<div class="phase-section">
					<div class="section-title-row">
						<h5 class="section-title">
							Connection Style
						</h5>
					</div>
					<ConnectionStyleConfig v-model="connectionStyle" />
				</div>

				<!-- Chain Connection Builder -->
				<div class="phase-section">
					<ChainConnectionBuilder
						:nodes="nodes"
						:edges="edges"
						:sequence="selectedNodes"
						:connection-style="connectionStyle"
						@create-connections="handleChainConnections"
						@update-connections="handleUpdateChainConnections"
						@update:sequence="selectedNodes = $event"
					/>
				</div>

				<!-- Flow Preview with Animation -->
				<div class="phase-section">
					<ConnectionFlowVisualizer
						:sequence="selectedNodes"
						:nodes="nodes"
						:connection-style="connectionStyle"
						:layout="layoutConfig.layout"
						:spacing="Math.min(layoutConfig.spacing / 3, 80)"
						@animate-on-canvas="handleAnimateOnCanvas"
					/>
				</div>

				<!-- Actions -->
				<div class="phase-actions">
					<button class="action-btn secondary-btn" @click="currentPhase = 'layout'">
						<UIcon name="i-lucide-arrow-left" class="size-3" />
						Back
					</button>
				</div>
			</template>

			<!-- Advanced Mode: Complex Branching -->
			<template v-else>
				<!-- Connection Style -->
				<div class="phase-section">
					<div class="section-title-row">
						<h5 class="section-title">
							Connection Style
						</h5>
					</div>
					<ConnectionStyleConfig v-model="connectionStyle" />
				</div>

				<!-- Advanced Connection Builder -->
				<div class="phase-section">
					<AdvancedConnectionBuilder
						:nodes="nodes"
						:edges="edges"
						:connection-style="connectionStyle"
						@create-connections="handleAdvancedConnections"
					/>
				</div>

				<!-- Actions -->
				<div class="phase-actions">
					<button class="action-btn secondary-btn" @click="currentPhase = 'layout'">
						<UIcon name="i-lucide-arrow-left" class="size-3" />
						Back
					</button>
				</div>
			</template>
		</div>

		<!-- Quick Actions (Always Visible) -->
		<div v-if="selectedNodes.length >= 2 || chainConnections.length > 0" class="quick-actions">
			<button
				v-if="chainConnections.length > 0"
				class="quick-action-btn"
				@click="updateAllConnectionStyles"
			>
				<UIcon name="i-lucide-paintbrush" class="size-3" />
				Update All Connection Styles
			</button>
			<button
				v-if="chainConnections.length > 0"
				class="quick-action-btn danger"
				@click="clearAllChainConnections"
			>
				<UIcon name="i-lucide-trash-2" class="size-3" />
				Clear All Connections
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useToast } from "#ui/composables/useToast";
	import { computed, ref, watch } from "vue";
	import AdvancedConnectionBuilder from "./AdvancedConnectionBuilder.vue";
	import ChainConnectionBuilder from "./ChainConnectionBuilder.vue";
	import ConnectionFlowVisualizer from "./ConnectionFlowVisualizer.vue";
	import ConnectionStyleConfig from "./ConnectionStyleConfig.vue";
	import ExistingChainsList from "./ExistingChainsList.vue";
	import NodeLayoutConfig from "./NodeLayoutConfig.vue";
	import NodeSequenceManager from "./NodeSequenceManager.vue";

	interface Props {
		nodes: any[]
		edges: any[]
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		updateNodePositions: [positions: Record<string, { x: number, y: number }>]
		updateEdges: [edgeIds: string[], updates: any]
		createEdges: [edges: any[]]
		deleteEdges: [edgeIds: string[]]
		animateChainFlow: [sequence: string[], duration: number, originalColor: string]
		updateDefaultConnectionStyle: [style: any]
	}>();

	const toast = useToast();

	// State
	const currentPhase = ref<"select" | "layout" | "connections">("select");
	const connectionMode = ref<"simple" | "advanced">("simple");
	const selectedNodes = ref<string[]>([]);
	const autoApplyLayout = ref(true);
	const connectionStyle = ref({
		color: "#8b5cf6",
		animationType: "flow",
		animationSpeed: "normal",
		strokeWidth: 3,
		type: "smoothstep",
		animated: true
	});
	const layoutConfig = ref({
		layout: "current",
		spacing: 800,
		verticalSpacing: 600
	});

	// Computed
	const availableNodes = computed(() =>
		props.nodes.filter((node: any) => node.type !== "viewport")
	);

	const chainConnections = computed(() => {
		if (selectedNodes.value.length < 2) return [];
		return props.edges.filter((edge: any) => {
			const sourceInChain = selectedNodes.value.includes(edge.source);
			const targetInChain = selectedNodes.value.includes(edge.target);
			return sourceInChain && targetInChain;
		});
	});

	// Methods
	const getNodeIcon = (node: any) => {
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

	const _getNodeName = (nodeId: string) => {
		const node = props.nodes.find((n: any) => n.id === nodeId);
		return node?.data?.label || node?.type || nodeId;
	};

	const toggleNodeSelection = (nodeId: string) => {
		const index = selectedNodes.value.indexOf(nodeId);
		if (index > -1) {
			selectedNodes.value.splice(index, 1);
		} else {
			selectedNodes.value.push(nodeId);
		}
	};

	const selectAllAvailableNodes = () => {
		// Select all available nodes
		selectedNodes.value = availableNodes.value.map((node: any) => node.id);
		toast.add({
			title: "All Nodes Selected",
			description: `Selected ${selectedNodes.value.length} nodes`,
			color: "success",
			icon: "i-lucide-check-square"
		});
	};

	const clearAllSelections = () => {
		// Clear all selections
		selectedNodes.value = [];
		toast.add({
			title: "Selection Cleared",
			description: "All nodes deselected",
			color: "info",
			icon: "i-lucide-x-square"
		});
	};

	const calculateNodePositions = () => {
		const positions: Record<string, { x: number, y: number }> = {};
		const layout = layoutConfig.value.layout;
		const spacing = layoutConfig.value.spacing;
		const vSpacing = layoutConfig.value.verticalSpacing || spacing;

		const currentNodes = selectedNodes.value.map((id) => props.nodes.find((n: any) => n.id === id)).filter(Boolean);

		// If "current" layout, just keep existing positions
		if (layout === "current") {
			currentNodes.forEach((node: any) => {
				if (node.position) {
					positions[node.id] = { x: node.position.x, y: node.position.y };
				}
			});
			return positions;
		}

		const avgX = currentNodes.reduce((sum: number, n: any) => sum + (n.position?.x || 0), 0) / currentNodes.length || 300;
		const avgY = currentNodes.reduce((sum: number, n: any) => sum + (n.position?.y || 0), 0) / currentNodes.length || 300;

		selectedNodes.value.forEach((nodeId: string, index: number) => {
			let x = 0;
			let y = 0;

			const totalNodes = selectedNodes.value.length;

			switch (layout) {
			case "horizontal": {
				x = avgX - ((totalNodes - 1) * spacing) / 2 + index * spacing;
				y = avgY;
				break;
			}
			case "vertical": {
				x = avgX;
				y = avgY - ((totalNodes - 1) * vSpacing) / 2 + index * vSpacing;
				break;
			}
			case "grid":
			case "grid3": {
				const cols = layout === "grid" ? 2 : 3;
				const row = Math.floor(index / cols);
				const col = index % cols;
				x = avgX - ((cols - 1) * spacing) / 2 + col * spacing;
				y = avgY - ((Math.ceil(totalNodes / cols) - 1) * vSpacing) / 2 + row * vSpacing;
				break;
			}
			case "circle": {
				const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
				const radius = spacing;
				x = avgX + Math.cos(angle) * radius;
				y = avgY + Math.sin(angle) * radius;
				break;
			}
			case "tree": {
				if (index === 0) {
					x = avgX;
					y = avgY - vSpacing;
				} else {
					const level = Math.floor(Math.log2(index + 1));
					const posInLevel = index - (2 ** level - 1);
					const totalInLevel = 2 ** level;
					x = avgX - ((totalInLevel - 1) * spacing) / 2 + posInLevel * spacing;
					y = avgY + level * vSpacing;
				}
				break;
			}
			case "diagonal": {
				x = avgX - ((totalNodes - 1) * spacing) / 2 + index * spacing;
				y = avgY + ((totalNodes - 1) * vSpacing) / 2 - index * vSpacing;
				break;
			}
			case "cascade": {
				x = avgX + index * (spacing * 0.6);
				y = avgY + index * (vSpacing * 0.6);
				break;
			}
			case "grid4": {
				const cols = 4;
				const row = Math.floor(index / cols);
				const col = index % cols;
				x = avgX - ((cols - 1) * spacing) / 2 + col * spacing;
				y = avgY - ((Math.ceil(totalNodes / cols) - 1) * vSpacing) / 2 + row * vSpacing;
				break;
			}
			case "triple-column": {
				const cols = 3;
				const row = Math.floor(index / cols);
				const col = index % cols;
				x = avgX - spacing + col * spacing;
				y = avgY - ((Math.ceil(totalNodes / cols) - 1) * vSpacing) / 2 + row * vSpacing;
				break;
			}
			case "stairs-up": {
				x = avgX - ((totalNodes - 1) * spacing) / 2 + index * spacing;
				y = avgY + ((totalNodes - 1) * vSpacing) / 2 - index * vSpacing;
				break;
			}
			case "stairs-down": {
				x = avgX - ((totalNodes - 1) * spacing) / 2 + index * spacing;
				y = avgY - ((totalNodes - 1) * vSpacing) / 2 + index * vSpacing;
				break;
			}
			case "wave": {
				const amplitude = vSpacing * 0.5;
				const frequency = 0.5;
				x = avgX - ((totalNodes - 1) * spacing) / 2 + index * spacing;
				y = avgY + Math.sin(index * frequency) * amplitude;
				break;
			}
			case "zigzag": {
				x = avgX - ((totalNodes - 1) * spacing) / 2 + index * spacing;
				y = avgY + (index % 2 === 0 ? vSpacing * 0.5 : -vSpacing * 0.5);
				break;
			}
			case "pyramid": {
				const pyramidLevel = Math.floor((Math.sqrt(8 * index + 1) - 1) / 2);
				const posInLevel = index - (pyramidLevel * (pyramidLevel + 1)) / 2;
				const nodesInLevel = pyramidLevel + 1;
				x = avgX - ((nodesInLevel - 1) * spacing) / 2 + posInLevel * spacing;
				y = avgY - ((totalNodes / 3) * vSpacing) / 2 + pyramidLevel * vSpacing;
				break;
			}
			case "double-column": {
				const col = index % 2;
				const row = Math.floor(index / 2);
				x = avgX - spacing / 2 + col * spacing;
				y = avgY - ((Math.ceil(totalNodes / 2) - 1) * vSpacing) / 2 + row * vSpacing;
				break;
			}
			case "arc": {
				const arcAngle = (index / (totalNodes - 1)) * Math.PI;
				const radius = spacing * 0.8;
				x = avgX - radius + Math.cos(Math.PI - arcAngle) * radius;
				y = avgY + Math.sin(Math.PI - arcAngle) * radius;
				break;
			}
			case "binary-tree": {
				if (index === 0) {
					// Root node
					x = avgX;
					y = avgY - vSpacing;
				} else {
					// Binary tree structure: each level has 2^level nodes
					const level = Math.floor(Math.log2(index + 1));
					const posInLevel = index - (2 ** level - 1);
					const nodesInLevel = 2 ** level;
					const levelWidth = (nodesInLevel - 1) * spacing;
					x = avgX - levelWidth / 2 + posInLevel * spacing;
					y = avgY - vSpacing + level * vSpacing;
				}
				break;
			}
			case "layered": {
				// Expanding layers: 1, 2, 3, 4... nodes per layer
				let currentLayer = 0;
				let nodesInPreviousLayers = 0;
				let nodesInCurrentLayer = 1;

				// Find which layer this node is in
				while (nodesInPreviousLayers + nodesInCurrentLayer <= index) {
					nodesInPreviousLayers += nodesInCurrentLayer;
					currentLayer++;
					nodesInCurrentLayer = currentLayer + 1;
				}

				const posInLayer = index - nodesInPreviousLayers;
				const layerWidth = (nodesInCurrentLayer - 1) * (spacing * 0.8);
				x = avgX - layerWidth / 2 + posInLayer * (spacing * 0.8);
				y = avgY - ((totalNodes / 3) * vSpacing) / 2 + currentLayer * vSpacing;
				break;
			}
			case "flow": {
				if (index === 0) {
					x = avgX - spacing;
					y = avgY;
				} else if (index % 2 === 1) {
					x = avgX + (Math.floor(index / 2) * spacing * 0.8);
					y = avgY - vSpacing * 0.5;
				} else {
					x = avgX + (Math.floor(index / 2) * spacing * 0.8);
					y = avgY + vSpacing * 0.5;
				}
				break;
			}
			default: {
				x = avgX + index * spacing;
				y = avgY;
			}
			}

			positions[nodeId] = { x, y };
		});

		return positions;
	};

	const applyLayoutToCanvas = () => {
		const positions = calculateNodePositions();
		emit("updateNodePositions", positions);

		// Save positions immediately after applying layout
		// The parent will trigger autosave
		if (!autoApplyLayout.value) {
			toast.add({
				title: "Layout Applied",
				description: `Arranged ${selectedNodes.value.length} nodes`,
				color: "success",
				icon: "i-lucide-layout"
			});
		}
	};

	// Real-time layout update when configuration changes
	const onLayoutChange = () => {
		if (autoApplyLayout.value && selectedNodes.value.length >= 2) {
			const positions = calculateNodePositions();
			emit("updateNodePositions", positions);
		}
	};

	const _createChainFlow = () => {
		if (selectedNodes.value.length < 2) return;

		const newEdges = [];
		const existingConnections = new Set(
			props.edges
				.filter((e: any) => selectedNodes.value.includes(e.source) && selectedNodes.value.includes(e.target))
				.map((e: any) => `${e.source}-${e.target}`)
		);

		for (let i = 0; i < selectedNodes.value.length - 1; i++) {
			const sourceId = selectedNodes.value[i];
			const targetId = selectedNodes.value[i + 1];
			const connKey = `${sourceId}-${targetId}`;

			if (!existingConnections.has(connKey)) {
				newEdges.push({
					id: `edge-${sourceId}-${targetId}-${Date.now()}-${i}`,
					source: sourceId,
					target: targetId,
					sourceHandle: "right",
					targetHandle: "left",
					type: connectionStyle.value.type,
					animated: connectionStyle.value.animated,
					animationType: connectionStyle.value.animationType,
					animationSpeed: connectionStyle.value.animationSpeed,
					style: {
						stroke: connectionStyle.value.color,
						strokeWidth: connectionStyle.value.strokeWidth
					},
					markerEnd: {
						type: "arrowclosed",
						color: connectionStyle.value.color
					}
				});
			}
		}

		if (newEdges.length > 0) {
			emit("createEdges", newEdges);
			toast.add({
				title: "Chain Flow Created",
				description: `Created ${newEdges.length} connection(s)`,
				color: "success",
				icon: "i-lucide-zap"
			});
		} else {
			toast.add({
				title: "Already Connected",
				description: "All nodes in sequence are already connected",
				color: "info",
				icon: "i-lucide-info"
			});
		}
	};

	const updateAllConnectionStyles = () => {
		if (chainConnections.value.length === 0) return;

		const edgeIds = chainConnections.value.map((edge: any) => edge.id);
		const updates = {
			type: connectionStyle.value.type,
			animated: connectionStyle.value.animated,
			animationType: connectionStyle.value.animationType,
			animationSpeed: connectionStyle.value.animationSpeed,
			style: {
				stroke: connectionStyle.value.color,
				strokeWidth: connectionStyle.value.strokeWidth
			},
			markerEnd: {
				type: "arrowclosed",
				color: connectionStyle.value.color
			}
		};

		emit("updateEdges", edgeIds, updates);

		toast.add({
			title: "Styles Updated",
			description: `Updated ${edgeIds.length} connection(s)`,
			color: "success",
			icon: "i-lucide-paintbrush"
		});
	};

	const clearAllChainConnections = () => {
		if (chainConnections.value.length === 0) return;

		const edgeIds = chainConnections.value.map((edge: any) => edge.id);
		emit("deleteEdges", edgeIds);

		toast.add({
			title: "Connections Cleared",
			description: `Removed ${edgeIds.length} connection(s)`,
			color: "success",
			icon: "i-lucide-trash-2"
		});
	};

	const handleAdvancedConnections = (connections: any[]) => {
		emit("createEdges", connections);
		toast.add({
			title: "Advanced Flow Created",
			description: `Created ${connections.length} connection(s) with branching`,
			color: "success",
			icon: "i-lucide-git-merge"
		});
	};

	const handleAnimateOnCanvas = (sequence: string[], duration: number) => {
		emit("animateChainFlow", sequence, duration, connectionStyle.value.color);
		toast.add({
			title: "Chain Animation Started",
			description: "Watch the flow animation on canvas",
			color: "success",
			icon: "i-lucide-play"
		});
	};

	const handleChainConnections = (connections: any[]) => {
		if (connections.length > 0) {
			emit("createEdges", connections);
			toast.add({
				title: "Chain Created",
				description: `Created ${connections.length} new connection(s)`,
				color: "success",
				icon: "i-lucide-check-circle"
			});
		}
	};

	const handleUpdateChainConnections = (updates: Array<{ id: string, updates: any }>) => {
		if (updates.length > 0) {
			updates.forEach(({ id, updates: edgeUpdates }) => {
				emit("updateEdges", [id], edgeUpdates);
			});
			toast.add({
				title: "Connections Updated",
				description: `Updated ${updates.length} existing connection(s)`,
				color: "success",
				icon: "i-lucide-refresh-cw"
			});
		}
	};

	// Watch for sequence changes and auto-update layout
	watch(selectedNodes, () => {
		if (autoApplyLayout.value && selectedNodes.value.length >= 2 && currentPhase.value === "layout") {
			onLayoutChange();
		}
	}, { deep: true });

	const animateBranchingChain = (chain: any) => {
		// Animate level by level for branching chains
		const { getAnimationSequence } = require("~/utils/chainDetection");
		const sequence = getAnimationSequence(chain);

		console.log("🌳 Animating branching chain with", sequence.length, "levels");

		// Flatten for animation but preserve all nodes
		const allNodeIds = chain.nodes.map((n: any) => n.id);
		emit("animateChainFlow", allNodeIds, 800, chain.color);

		toast.add({
			title: "Animating Branching Flow",
			description: `${chain.depth + 1} levels, ${chain.endNodes.length} end nodes`,
			color: "success",
			icon: "i-lucide-network"
		});
	};

	const handleAnimateExistingChain = (chain: any) => {
		console.log("🎬 Animating existing chain:", chain.name, chain.type);

		// For branching/tree chains, animate level by level
		if (chain.type === "tree" || chain.type === "branching") {
			animateBranchingChain(chain);
		} else {
			// Linear chain - simple sequence
			const nodeIds = chain.nodes.map((n: any) => n.id);
			emit("animateChainFlow", nodeIds, 1000, chain.color);
		}
	};

	const handleEditExistingChain = (chain: any) => {
		console.log("✏️ Editing existing chain:", chain.name);
		// Load chain nodes into selection
		selectedNodes.value = chain.nodes.map((n: any) => n.id);
		// Set connection style from chain
		connectionStyle.value = {
			color: chain.color,
			animationType: chain.animationType,
			animationSpeed: "normal",
			strokeWidth: 3,
			type: "smoothstep",
			animated: true
		};
		// Move to layout phase
		currentPhase.value = "layout";
		toast.add({
			title: "Chain Loaded",
			description: `${chain.name}: ${chain.nodes.length} nodes, ${chain.type} structure`,
			color: "success",
			icon: "i-lucide-check-circle"
		});
	};

	const handleDeleteExistingChain = (chain: any) => {
		// eslint-disable-next-line no-alert
		if (confirm(`Delete "${chain.name}" (${chain.edges.length} connections)?`)) {
			emit("deleteEdges", chain.edges);
			toast.add({
				title: "Chain Deleted",
				description: `Removed ${chain.name}`,
				color: "success",
				icon: "i-lucide-trash-2"
			});
		}
	};

	const handleMergeChains = (chains: any[]) => {
		console.log("🔗 Merging", chains.length, "chains");
		const allNodeIds = new Set<string>();
		chains.forEach((chain) => {
			chain.nodes.forEach((n: any) => allNodeIds.add(n.id));
		});

		selectedNodes.value = Array.from(allNodeIds);
		currentPhase.value = "layout";

		toast.add({
			title: "Chains Merged",
			description: `Merged ${chains.length} chains into unified flow`,
			color: "success",
			icon: "i-lucide-merge"
		});
	};

	// Watch for connection style changes and sync with canvas
	watch(connectionStyle, (newStyle) => {
		emit("updateDefaultConnectionStyle", newStyle);
	}, { deep: true, immediate: true });
</script>

<style scoped>
	.chain-flow-controller {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		height: 100%;
		overflow-y: auto;
	}

	.controller-header {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.controller-title {
		font-size: 14px;
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.controller-subtitle {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
		padding-left: 28px;
	}

	.phase-tabs {
		display: flex;
		gap: 6px;
		padding: 8px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
	}

	.phase-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.5);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.phase-tab:hover:not(:disabled) {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		color: rgba(255, 255, 255, 0.8);
	}

	.phase-tab.active {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
	}

	.phase-tab:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.phase-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.phase-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 14px;
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
	}

	.phase-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px 0;
		position: relative;
	}

	.phase-divider::before,
	.phase-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
	}

	.divider-text {
		padding: 0 16px;
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.5);
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.section-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: 12px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.selection-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.select-all-btn,
	.clear-all-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		font-size: 10px;
		font-weight: 600;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.select-all-btn {
		background: rgba(var(--color-primary-rgb), 0.12);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		color: var(--color-primary);
	}

	.select-all-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		transform: translateY(-1px);
	}

	.clear-all-btn {
		background: rgba(239, 68, 68, 0.12);
		border-color: rgba(239, 68, 68, 0.25);
		color: rgba(239, 68, 68, 1);
	}

	.clear-all-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
		transform: translateY(-1px);
	}

	.selection-count {
		font-size: 11px;
		font-weight: 600;
		color: rgba(var(--color-primary-rgb), 0.9);
		padding: 3px 10px;
		background: rgba(var(--color-primary-rgb), 0.15);
		border-radius: 10px;
	}

	.node-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 8px;
		max-height: 400px;
		overflow-y: auto;
	}

	.node-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.node-card:hover {
		background: rgba(var(--color-primary-rgb), 0.08);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		transform: translateY(-2px);
	}

	.node-card.selected {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
	}

	.node-card-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.15);
		border-radius: 8px;
		color: var(--color-primary);
	}

	.node-card-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		text-align: center;
	}

	.node-card-name {
		font-size: 11px;
		font-weight: 600;
		color: white;
		line-height: 1.2;
	}

	.node-card-type {
		font-size: 9px;
		color: rgba(255, 255, 255, 0.5);
	}

	.selection-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.9);
		border: 2px solid rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		font-size: 11px;
		font-weight: 800;
		color: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.connection-summary {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background: rgba(var(--color-primary-rgb), 0.08);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
	}

	.summary-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.summary-content {
		padding-left: 22px;
	}

	.summary-text {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.5;
		margin: 0;
	}

	.summary-text strong {
		color: var(--color-primary);
		font-weight: 700;
	}

	.phase-actions {
		display: flex;
		gap: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
		flex: 1;
	}

	.secondary-btn {
		background: rgba(107, 114, 128, 0.12);
		border-color: rgba(107, 114, 128, 0.25);
		color: rgba(107, 114, 128, 1);
	}

	.secondary-btn:hover {
		background: rgba(107, 114, 128, 0.2);
		border-color: rgba(107, 114, 128, 0.4);
	}

	.primary-btn {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		color: var(--color-primary);
	}

	.primary-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.25);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
	}

	.success-btn {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.3);
		color: rgba(16, 185, 129, 1);
	}

	.success-btn:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
	}

	.phase-next-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(var(--color-primary-rgb), 0.15);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 8px;
		color: var(--color-primary);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 12px;
	}

	.phase-next-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.25);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.3);
	}

	.quick-actions {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
	}

	.quick-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 14px;
		background: rgba(var(--color-primary-rgb), 0.12);
		border: 1px solid rgba(var(--color-primary-rgb), 0.25);
		border-radius: 6px;
		color: var(--color-primary);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.quick-action-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		transform: translateY(-1px);
	}

	.quick-action-btn.danger {
		background: rgba(239, 68, 68, 0.12);
		border-color: rgba(239, 68, 68, 0.25);
		color: rgba(239, 68, 68, 1);
	}

	.quick-action-btn.danger:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
	}

	.auto-apply-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 12px;
		transition: all 0.2s ease;
	}

	.toggle-checkbox {
		width: 14px;
		height: 14px;
		cursor: pointer;
		accent-color: #10b981;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 9px;
		font-weight: 700;
		color: rgba(16, 185, 129, 1);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		cursor: pointer;
	}

	.mode-toggle-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		padding: 10px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
	}

	.mode-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.6);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mode-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		color: rgba(255, 255, 255, 0.9);
	}

	.mode-btn.active {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
	}

	.layout-hint {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(16, 185, 129, 0.08);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 6px;
	}

	.hint-text {
		flex: 1;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.4;
		margin: 0;
	}
</style>

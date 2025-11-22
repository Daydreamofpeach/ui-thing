<template>
	<div class="existing-chains-list">
		<div class="list-header">
			<div class="header-title-row">
				<UIcon name="i-lucide-list" class="size-3 text-primary" />
				<h5 class="list-title">Existing Chains</h5>
			</div>
			<div class="header-actions">
				<button
					v-if="selectedChains.size > 1"
					class="merge-btn"
					@click="mergeSelectedChains"
				>
					<UIcon name="i-lucide-merge" class="size-2" />
					Merge {{ selectedChains.size }}
				</button>
				<span class="chain-count">{{ detectedChains.length }} chain(s)</span>
			</div>
		</div>

		<div v-if="detectedChains.length === 0" class="empty-chains">
			<UIcon name="i-lucide-circle-dashed" class="size-8 text-white/20" />
			<p class="empty-text">No chains detected</p>
			<p class="empty-subtext">Connect nodes to create automation chains</p>
		</div>

		<div v-else class="chains-container">
			<div
				v-for="(chain, index) in detectedChains"
				:key="index"
				class="chain-card"
				:class="{ selected: selectedChains.has(index) }"
			>
				<div class="chain-header">
					<input
						type="checkbox"
						class="chain-checkbox"
						:checked="selectedChains.has(index)"
						@change="toggleChainSelection(index)"
					/>
					<div class="chain-info">
						<div class="chain-name">
							<UIcon :name="getChainTypeIcon(chain.type)" class="size-3 text-primary" />
							<span>{{ chain.name }}</span>
							<span class="chain-type-badge" :class="`type-${chain.type}`">
								{{ chain.type }}
							</span>
						</div>
						<div class="chain-stats">
							<span class="stat-item">
								<UIcon name="i-lucide-circle" class="size-2" />
								{{ chain.nodes.length }} nodes
							</span>
							<span class="stat-item">
								<UIcon name="i-lucide-link" class="size-2" />
								{{ chain.edges.length }} connections
							</span>
							<span v-if="chain.depth > 0" class="stat-item">
								<UIcon name="i-lucide-layers" class="size-2" />
								{{ chain.depth + 1 }} levels
							</span>
						</div>
					</div>
					<button
						class="animate-chain-btn"
						:class="{ animating: animatingChain === index }"
						@click="animateChain(chain, index)"
					>
						<UIcon :name="animatingChain === index ? 'i-lucide-loader-2' : 'i-lucide-play'" class="size-3" />
					</button>
				</div>

				<!-- Flow Visualization -->
				<div class="chain-flow">
					<div v-if="chain.type === 'linear'" class="linear-flow">
						<div
							v-for="(node, nodeIndex) in chain.nodes"
							:key="node.id"
							class="chain-node"
						>
							<div class="node-chip">
								<UIcon :name="getNodeIcon(node.id)" class="size-2" />
								<span class="node-name">{{ getNodeName(node.id) }}</span>
							</div>
							<UIcon
								v-if="nodeIndex < chain.nodes.length - 1"
								name="i-lucide-arrow-right"
								class="size-2 text-primary/60"
							/>
						</div>
					</div>
					
					<!-- Tree/Branching Flow -->
					<div v-else class="tree-flow">
						<div class="flow-summary">
							<span class="start-count">{{ chain.startNodes.length }} start(s)</span>
							<UIcon name="i-lucide-arrow-right" class="size-2" />
							<span class="middle-count">{{ chain.nodes.length - chain.startNodes.length - chain.endNodes.length }} middle</span>
							<UIcon name="i-lucide-arrow-right" class="size-2" />
							<span class="end-count">{{ chain.endNodes.length }} end(s)</span>
						</div>
						<div class="depth-indicator">
							<UIcon name="i-lucide-layers" class="size-2" />
							<span>{{ chain.depth + 1 }} level tree</span>
						</div>
					</div>
				</div>

				<div class="chain-style-preview">
					<div class="style-indicator">
						<div
							class="color-dot"
							:style="{ backgroundColor: chain.color }"
						/>
						<span class="style-label">{{ chain.animationType || 'default' }}</span>
					</div>
					<div class="chain-actions">
						<button
							class="action-icon-btn"
							title="Edit chain"
							@click="$emit('edit-chain', chain)"
						>
							<UIcon name="i-lucide-edit-2" class="size-2" />
						</button>
						<button
							class="action-icon-btn danger"
							title="Delete chain connections"
							@click="$emit('delete-chain', chain)"
						>
							<UIcon name="i-lucide-trash-2" class="size-2" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";
	import { detectAllChains, mergeChains } from "~/utils/chainDetection";

	interface Props {
		nodes: any[];
		edges: any[];
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		animateChain: [chain: any];
		editChain: [chain: any];
		deleteChain: [chain: any];
		mergeChains: [chains: any[]];
	}>();

	const animatingChain = ref<number | null>(null);
	const selectedChains = ref<Set<number>>(new Set());

	// Detect chains using advanced algorithm
	const detectedChains = computed(() => {
		return detectAllChains(props.nodes, props.edges);
	});

	const toggleChainSelection = (index: number) => {
		if (selectedChains.value.has(index)) {
			selectedChains.value.delete(index);
		} else {
			selectedChains.value.add(index);
		}
		selectedChains.value = new Set(selectedChains.value);
	};

	const mergeSelectedChains = () => {
		const chainsToMerge = Array.from(selectedChains.value).map((index) => detectedChains.value[index]);
		const merged = mergeChains(chainsToMerge);
		emit("mergeChains", chainsToMerge);
		selectedChains.value.clear();
	};

	const getNodeName = (nodeId: string) => {
		const node = props.nodes.find((n: any) => n.id === nodeId);
		return node?.data?.label || node?.type || nodeId;
	};

	const getNodeIcon = (nodeId: string) => {
		const node = props.nodes.find((n: any) => n.id === nodeId);
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

	const getChainTypeIcon = (type: string) => {
		const iconMap: Record<string, string> = {
			linear: "i-lucide-minus",
			branching: "i-lucide-git-branch",
			tree: "i-lucide-network",
			convergent: "i-lucide-git-merge"
		};
		return iconMap[type] || "i-lucide-workflow";
	};

	const animateChain = (chain: any, index: number) => {
		animatingChain.value = index;
		emit("animateChain", chain);
		
		// Reset animation state after duration based on chain complexity
		const duration = 3000 + (chain.depth * 1000); // Longer for deeper chains
		setTimeout(() => {
			animatingChain.value = null;
		}, duration);
	};
</script>

<style scoped>
	.existing-chains-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
	}

	.header-title-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.list-title {
		font-size: 11px;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.chain-count {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		padding: 3px 8px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
	}

	.empty-chains {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		text-align: center;
	}

	.empty-text {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		margin: 12px 0 4px;
	}

	.empty-subtext {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.4);
		margin: 0;
	}

	.chains-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.chain-card {
		padding: 12px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		transition: all 0.2s ease;
		position: relative;
	}

	.chain-card:hover {
		background: rgba(0, 0, 0, 0.35);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		transform: translateX(2px);
	}

	.chain-card.selected {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
	}

	.chain-checkbox {
		width: 16px;
		height: 16px;
		cursor: pointer;
		flex-shrink: 0;
	}

	.merge-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 5px;
		color: rgba(16, 185, 129, 1);
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.merge-btn:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.chain-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.chain-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.chain-name {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 700;
		color: white;
		flex-wrap: wrap;
	}

	.chain-type-badge {
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 8px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid;
	}

	.chain-type-badge.type-linear {
		background: rgba(59, 130, 246, 0.15);
		border-color: rgba(59, 130, 246, 0.3);
		color: rgba(59, 130, 246, 1);
	}

	.chain-type-badge.type-branching {
		background: rgba(234, 179, 8, 0.15);
		border-color: rgba(234, 179, 8, 0.3);
		color: rgba(234, 179, 8, 1);
	}

	.chain-type-badge.type-tree {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.3);
		color: rgba(16, 185, 129, 1);
	}

	.chain-type-badge.type-convergent {
		background: rgba(139, 92, 246, 0.15);
		border-color: rgba(139, 92, 246, 0.3);
		color: rgba(139, 92, 246, 1);
	}

	.chain-stats {
		display: flex;
		gap: 10px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
	}

	.animate-chain-btn {
		width: 34px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 6px;
		color: rgba(16, 185, 129, 1);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.animate-chain-btn:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.animate-chain-btn.animating {
		background: rgba(234, 179, 8, 0.15);
		border-color: rgba(234, 179, 8, 0.3);
		color: rgba(234, 179, 8, 1);
		animation: pulse 1s ease-in-out infinite;
	}

	.chain-flow {
		margin-bottom: 10px;
	}

	.linear-flow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}

	.tree-flow {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
	}

	.flow-summary {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	.start-count {
		color: rgba(16, 185, 129, 1);
	}

	.middle-count {
		color: rgba(59, 130, 246, 1);
	}

	.end-count {
		color: rgba(234, 179, 8, 1);
	}

	.depth-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 9px;
		color: rgba(255, 255, 255, 0.6);
	}

	.chain-node {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.node-chip {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: rgba(var(--color-primary-rgb), 0.12);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		color: white;
	}

	.node-name {
		max-width: 100px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chain-style-preview {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 10px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.style-indicator {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.color-dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.style-label {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: capitalize;
	}

	.chain-actions {
		display: flex;
		gap: 4px;
	}

	.action-icon-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(59, 130, 246, 0.12);
		border: 1px solid rgba(59, 130, 246, 0.25);
		border-radius: 4px;
		color: rgba(59, 130, 246, 1);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-icon-btn:hover {
		background: rgba(59, 130, 246, 0.2);
		border-color: rgba(59, 130, 246, 0.4);
		transform: scale(1.1);
	}

	.action-icon-btn.danger {
		background: rgba(239, 68, 68, 0.12);
		border-color: rgba(239, 68, 68, 0.25);
		color: rgba(239, 68, 68, 1);
	}

	.action-icon-btn.danger:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(0.95);
		}
	}
</style>


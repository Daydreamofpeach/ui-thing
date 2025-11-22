<template>
	<div ref="searchContainerRef" class="canvas-search">
		<div class="canvas-search-container">
			<!-- Search Bar -->
			<div @click="handleSearchBarClick">
				<SearchBar
					v-model="searchQuery"
					placeholder="Search nodes..."
					@focus="openResults"
				/>
			</div>

			<!-- Search Results Dropdown (Show when open and has results) -->
			<div v-if="showResults && (filteredAvailableNodes.length > 0 || filteredCanvasNodes.length > 0)" class="search-results">
				<div class="results-header">
					<span v-if="searchQuery" class="results-count">
						{{ filteredAvailableNodes.length + filteredCanvasNodes.length }} result{{ (filteredAvailableNodes.length + filteredCanvasNodes.length) !== 1 ? 's' : '' }}
					</span>
					<span v-else class="results-count">
						Browse or search nodes
					</span>
					<button class="close-results-button" title="Close" @click="closeResults">
						<UIcon name="i-lucide-x" class="size-3.5" />
					</button>
				</div>

				<!-- Tab Navigation with Cards -->
				<div class="results-tabs">
					<TabGroup
						v-model="activeTab"
						:tabs="searchTabs"
						variant="pills"
					>
						<!-- Available Nodes to Add Section -->
						<div v-if="activeTab === 'available'" class="results-section">
							<div v-if="filteredAvailableNodes.length > 0" class="results-list">
								<button
									v-for="nodeType in filteredAvailableNodes.slice(0, 8)"
									:key="nodeType.type"
									class="result-item available"
									@click="handleAvailableNodeSelect(nodeType)"
								>
									<div class="result-icon" :style="getNodeTypeIconStyle(nodeType.type)">
										<UIcon :name="getNodeTypeIcon(nodeType.type)" class="size-4" />
									</div>
									<div class="result-info">
										<span class="result-label">{{ nodeType.label }}</span>
										<span class="result-type">Click to add to canvas</span>
									</div>
									<UIcon name="i-lucide-plus" class="size-4 text-green-400" />
								</button>
							</div>
							<div v-else class="empty-tab-state">
								<UIcon name="i-lucide-inbox" class="size-5 text-white/20" />
								<span class="text-sm text-white/40">No available nodes match your search</span>
							</div>
							<div v-if="filteredAvailableNodes.length > 8" class="section-footer">
								{{ filteredAvailableNodes.length - 8 }} more available...
							</div>
						</div>

						<!-- On Canvas Nodes Section -->
						<div v-else-if="activeTab === 'existing'" class="results-section">
							<div v-if="filteredCanvasNodes.length > 0" class="results-list">
								<button
									v-for="node in filteredCanvasNodes.slice(0, 8)"
									:key="node.id"
									class="result-item on-canvas"
									@click="handleCanvasNodeSelect(node)"
								>
									<div class="result-icon" :style="getNodeIconStyle(node)">
										<UIcon :name="getNodeIcon(node)" class="size-4" />
									</div>
									<div class="result-info">
										<span class="result-label">{{ node.data?.label || node.data?.name || node.type }}</span>
										<span class="result-type">{{ getNodeTypeLabel(node.type) }}</span>
									</div>
									<UIcon name="i-lucide-arrow-right" class="size-4 text-blue-400" />
								</button>
							</div>
							<div v-else class="empty-tab-state">
								<UIcon name="i-lucide-inbox" class="size-5 text-white/20" />
								<span class="text-sm text-white/40">No canvas nodes match your search</span>
							</div>
							<div v-if="filteredCanvasNodes.length > 8" class="section-footer">
								{{ filteredCanvasNodes.length - 8 }} more on canvas...
							</div>
						</div>
					</TabGroup>
				</div>
			</div>

			<!-- No Results (only when open, searching and nothing matches) -->
			<div v-else-if="showResults && searchQuery && filteredAvailableNodes.length === 0 && filteredCanvasNodes.length === 0" class="no-results">
				<UIcon name="i-lucide-search-x" class="size-6 text-white/30" />
				<span class="no-results-text">No matching nodes found</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import SearchBar from "~/components/ui/SearchBar.vue";
	import TabGroup from "~/components/ui/TabGroup.vue";
	import { computed, onMounted, onUnmounted, ref, watch } from "vue";

	interface Props {
		nodes: any[]
		onNodeSelect?: (node: any) => void
		onNodeAdd?: (nodeType: string) => void
		availableNodeTypes?: Array<{ type: string, label: string }>
	}

	const props = withDefaults(defineProps<Props>(), {
		onNodeSelect: undefined,
		onNodeAdd: undefined,
		availableNodeTypes: () => []
	});

	// Search state
	const searchQuery = ref("");
	const activeTab = ref<"available" | "existing">("available");
	const showResults = ref(false);
	const searchContainerRef = ref<HTMLElement | null>(null);

	// Get node type label (must be defined before computed properties that use it)
	const getNodeTypeLabel = (type: string): string => {
		const labelMap: Record<string, string> = {
			projectNode: "Project",
			setupProjectNode: "Integration Setup",
			projectEnvironmentNode: "Project Environment",
			userManagementNode: "User Management",
			taskNode: "Task",
			integrationConnectionNode: "Integration",
			integrationDetailNode: "Integration Details",
			userNode: "User",
			orbitCardNode: "Task Orbit",
			solutionNode: "Solution",
			githubNode: "GitHub",
			rectangle: "Note",
			circle: "Circle",
			diamond: "Diamond",
			triangle: "Triangle",
			hexagon: "Hexagon"
		};
		return labelMap[type] || type;
	};

	// Filter available node types
	const filteredAvailableNodes = computed(() => {
		if (!Array.isArray(props.availableNodeTypes) || props.availableNodeTypes.length === 0) return [];

		// Show all if no search query
		if (!searchQuery.value.trim()) {
			return props.availableNodeTypes;
		}

		// Filter by search query
		const query = searchQuery.value.toLowerCase();
		return props.availableNodeTypes.filter((nodeType) => {
			return nodeType.label.toLowerCase().includes(query)
				|| nodeType.type.toLowerCase().includes(query);
		});
	});

	// Filter canvas nodes based on search query
	const filteredCanvasNodes = computed(() => {
		if (!Array.isArray(props.nodes) || props.nodes.length === 0) return [];

		// Show all if no search query
		if (!searchQuery.value.trim()) {
			console.log("🔍 [CanvasSearch] Showing all", props.nodes.length, "canvas nodes");
			return props.nodes;
		}

		// Filter by search query
		const query = searchQuery.value.toLowerCase();
		console.log("🔍 [CanvasSearch] Filtering", props.nodes.length, "nodes with query:", query);

		return props.nodes.filter((node) => {
			// Search in label
			const label = (node.data?.label || "").toLowerCase();
			if (label.includes(query)) return true;

			// Search in name
			const name = (node.data?.name || node.data?.projectName || node.data?.taskName || "").toLowerCase();
			if (name.includes(query)) return true;

			// Search in type
			const type = getNodeTypeLabel(node.type).toLowerCase();
			if (type.includes(query)) return true;

			// Search in description
			const description = (node.data?.description || "").toLowerCase();
			if (description.includes(query)) return true;

			return false;
		});
	});

	// Search tabs configuration (uses filtered computed properties)
	const searchTabs = computed(() => [
		{
			id: "available",
			value: "available",
			label: "Add New",
			icon: "i-lucide-plus-circle",
			badge: filteredAvailableNodes.value.length
		},
		{
			id: "existing",
			value: "existing",
			label: "On Canvas",
			icon: "i-lucide-layers",
			badge: filteredCanvasNodes.value.length
		}
	]);

	// Auto-switch to tab with results
	watch([filteredAvailableNodes, filteredCanvasNodes], ([available, existing]) => {
		if (searchQuery.value) {
			if (available.length > 0 && existing.length === 0) {
				activeTab.value = "available";
			} else if (existing.length > 0 && available.length === 0) {
				activeTab.value = "existing";
			}
		}
	});

	// Debug nodes prop
	watch(() => props.nodes, (newNodes) => {
		console.log("🔍 [CanvasSearch] Nodes updated:", newNodes?.length || 0);
	}, { immediate: true });

	// Open/close results
	const openResults = () => {
		showResults.value = true;
	};

	const closeResults = () => {
		showResults.value = false;
		searchQuery.value = ""; // Clear search when closing
	};

	const handleSearchBarClick = () => {
		openResults();
	};

	// Handle available node selection (add to canvas)
	const handleAvailableNodeSelect = (nodeType: { type: string, label: string }) => {
		console.log("➕ Adding node type from search:", nodeType);

		if (props.onNodeAdd) {
			props.onNodeAdd(nodeType.type);
		}

		// Close results after adding
		closeResults();
	};

	// Handle canvas node selection (navigate to node)
	const handleCanvasNodeSelect = (node: any) => {
		console.log("🎯 Navigating to node from search:", node);

		if (props.onNodeSelect) {
			props.onNodeSelect(node);
		}

		// Close results after navigation
		closeResults();
	};

	// Click outside to close
	const handleClickOutside = (event: MouseEvent) => {
		if (searchContainerRef.value && !searchContainerRef.value.contains(event.target as Node)) {
			closeResults();
		}
	};

	// Setup click outside listener
	onMounted(() => {
		document.addEventListener("click", handleClickOutside);
	});

	onUnmounted(() => {
		document.removeEventListener("click", handleClickOutside);
	});

	// Get node type icon
	const getNodeTypeIcon = (type: string): string => {
		const iconMap: Record<string, string> = {
			projectNode: "i-lucide-folder-kanban",
			setupProjectNode: "i-lucide-settings",
			projectEnvironmentNode: "i-lucide-git-branch",
			userManagementNode: "i-lucide-user-circle",
			taskNode: "i-lucide-check-square",
			integrationConnectionNode: "i-lucide-plug-zap",
			integrationDetailNode: "i-lucide-plug",
			userNode: "i-lucide-user",
			orbitCardNode: "i-lucide-orbit",
			solutionNode: "i-lucide-puzzle",
			githubNode: "i-lucide-github",
			rectangle: "i-lucide-square",
			circle: "i-lucide-circle",
			diamond: "i-lucide-diamond",
			triangle: "i-lucide-triangle",
			hexagon: "i-lucide-hexagon"
		};
		return iconMap[type] || "i-lucide-box";
	};

	// Get node type icon style
	const getNodeTypeIconStyle = (type: string) => {
		const colorMap: Record<string, string> = {
			projectNode: "#f59e0b",
			setupProjectNode: "#10b981",
			projectEnvironmentNode: "#ef4444",
			userManagementNode: "#9333ea",
			taskNode: "#6366f1",
			integrationConnectionNode: "#a855f7",
			integrationDetailNode: "#a855f7",
			userNode: "#3b82f6",
			orbitCardNode: "#10b981",
			solutionNode: "#14b8a6",
			githubNode: "#6366f1"
		};
		const color = colorMap[type] || "#6b7280";

		return {
			backgroundColor: `${color}20`,
			borderColor: `${color}40`,
			color
		};
	};

	// Get node icon
	const getNodeIcon = (node: any): string => {
		const iconMap: Record<string, string> = {
			projectNode: "i-lucide-folder-kanban",
			setupProjectNode: "i-lucide-settings",
			projectEnvironmentNode: "i-lucide-git-branch",
			userManagementNode: "i-lucide-user-circle",
			taskNode: "i-lucide-check-square",
			integrationConnectionNode: "i-lucide-plug-zap",
			integrationDetailNode: "i-lucide-plug",
			userNode: "i-lucide-user",
			orbitCardNode: "i-lucide-orbit",
			solutionNode: "i-lucide-puzzle",
			githubNode: "i-lucide-github",
			rectangle: "i-lucide-square",
			circle: "i-lucide-circle",
			diamond: "i-lucide-diamond",
			triangle: "i-lucide-triangle",
			hexagon: "i-lucide-hexagon"
		};
		return iconMap[node.type] || "i-lucide-box";
	};

	// Get node icon style
	const getNodeIconStyle = (node: any) => {
		const colorMap: Record<string, string> = {
			projectNode: "#f59e0b",
			setupProjectNode: "#10b981",
			projectEnvironmentNode: "#ef4444",
			userManagementNode: "#9333ea",
			taskNode: "#6366f1",
			integrationConnectionNode: "#a855f7",
			integrationDetailNode: "#a855f7",
			userNode: "#3b82f6",
			orbitCardNode: "#10b981",
			solutionNode: "#14b8a6",
			githubNode: "#6366f1"
		};
		const color = colorMap[node.type] || "#6b7280";

		return {
			backgroundColor: `${color}20`,
			borderColor: `${color}40`,
			color
		};
	};
</script>

<style scoped>
.canvas-search {
	position: relative;
	width: 100%;
	max-width: 32rem;
}

.canvas-search-container {
	position: relative;
}

.search-results {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: 0.5rem;
	background: rgba(0, 0, 0, 0.95);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 0.75rem;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	max-height: 24rem;
	overflow: hidden;
	z-index: 50;
}

.results-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.625rem 1rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.results-tabs {
	width: 100%;
}

.results-tabs :deep(.tab-group) {
	width: 100%;
}

.results-tabs :deep(.tab-navigation) {
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.375rem;
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.2);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.results-tabs :deep(.tab-button) {
	font-size: 0.6875rem;
	padding: 0.5rem 0.625rem;
	width: 100%;
	justify-content: center;
	min-height: auto;
	height: auto;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.results-tabs :deep(.tab-icon) {
	width: 0.875rem;
	height: 0.875rem;
	flex-shrink: 0;
}

.results-tabs :deep(.tab-label) {
	flex-shrink: 0;
}

.results-tabs :deep(.tab-badge) {
	font-size: 0.625rem;
	padding: 0.0625rem 0.375rem;
	min-width: 1.25rem;
	height: 1.125rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.results-tabs :deep(.tab-content) {
	width: 100%;
	padding: 0;
	background: transparent;
}

.results-count {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.6);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.close-results-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 0.375rem;
	color: rgba(255, 255, 255, 0.6);
	cursor: pointer;
	transition: all 0.2s ease;
}

.close-results-button:hover {
	background: rgba(255, 255, 255, 0.15);
	color: rgba(255, 255, 255, 0.9);
}

.results-section {
	padding: 0.5rem;
}

.results-list {
	max-height: 14rem;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.section-footer {
	padding: 0.5rem 1rem;
	text-align: center;
	font-size: 0.6875rem;
	color: rgba(255, 255, 255, 0.4);
	font-style: italic;
}

.empty-tab-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 2rem 1rem;
	min-height: 8rem;
}

/* Custom scrollbar */
.results-list::-webkit-scrollbar {
	width: 6px;
}

.results-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
}

.results-list::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}

.results-list::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.3);
}

.result-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	width: 100%;
	padding: 0.875rem 1rem;
	background: transparent;
	border: none;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	color: rgba(255, 255, 255, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
}

.result-item:last-child {
	border-bottom: none;
}

.result-item.available:hover {
	background: rgba(34, 197, 94, 0.15);
	border-left: 3px solid #22c55e;
}

.result-item.on-canvas:hover {
	background: rgba(59, 130, 246, 0.15);
	border-left: 3px solid #3b82f6;
}

.result-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.25rem;
	height: 2.25rem;
	border-radius: 0.5rem;
	border: 1px solid;
	flex-shrink: 0;
}

.result-info {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	flex: 1;
	min-width: 0;
	text-align: left;
}

.result-label {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.result-type {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.results-footer {
	padding: 0.75rem 1rem;
	text-align: center;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.no-results {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: 0.5rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	padding: 2rem 1rem;
	background: rgba(0, 0, 0, 0.95);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 0.75rem;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	z-index: 50;
}

.no-results-text {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.5);
}

.search-help {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: rgba(0, 0, 0, 0.85);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.75rem;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	z-index: 50;
	opacity: 0;
	animation: fadeIn 0.3s ease-out 0.5s forwards;
}

.help-text {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.6);
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(5px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>

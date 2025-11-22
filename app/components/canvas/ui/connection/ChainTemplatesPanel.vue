<template>
	<div class="chain-templates-panel">
		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<UIcon name="i-lucide-git-branch" class="header-icon" />
				<div class="header-text">
					<h4 class="panel-title">
						Chain Templates
					</h4>
					<p class="panel-subtitle">
						Reusable node chains
					</p>
				</div>
			</div>
			<button class="create-btn" title="Create New Chain" @click="openCreationProcess">
				<UIcon name="i-lucide-plus" class="size-4" />
			</button>
		</div>

		<!-- Search and Filter -->
		<div class="controls-section">
			<div class="search-wrapper">
				<UIcon name="i-lucide-search" class="search-icon" />
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search chains..."
					class="search-input"
				>
				<button
					v-if="searchQuery"
					class="clear-search"
					@click="searchQuery = ''"
				>
					<UIcon name="i-lucide-x" class="size-3" />
				</button>
			</div>

			<div class="filter-section">
				<select v-model="selectedCategory" class="category-filter">
					<option value="all">
						All Categories ({{ chainTemplates.length }})
					</option>
					<option
						v-for="category in availableCategories"
						:key="category"
						:value="category"
					>
						{{ category }} ({{ getTemplatesByCategory(category).length }})
					</option>
				</select>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="isLoading" class="loading-state">
			<UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-primary/60" />
			<span class="loading-text">Loading chain templates...</span>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="error-state">
			<UIcon name="i-lucide-alert-circle" class="size-6 text-red-400" />
			<span class="error-text">{{ error }}</span>
			<button class="retry-btn" @click="loadChainTemplates">
				<UIcon name="i-lucide-refresh-cw" class="size-3" />
				Retry
			</button>
		</div>

		<!-- Empty State -->
		<div v-else-if="filteredTemplates.length === 0" class="empty-state">
			<div class="empty-icon">
				<UIcon name="i-lucide-git-branch" class="size-12 text-white/20" />
			</div>
			<div class="empty-content">
				<h5 class="empty-title">
					{{ searchQuery || selectedCategory !== 'all' ? 'No matching chains' : 'No chain templates' }}
				</h5>
				<p class="empty-description">
					{{ searchQuery || selectedCategory !== 'all'
						? 'Try adjusting your search or filter criteria'
						: 'Create your first chain template to get started'
					}}
				</p>
				<button v-if="!searchQuery && selectedCategory === 'all'" class="create-first-btn" @click="openCreationProcess">
					<UIcon name="i-lucide-plus" class="size-4" />
					Create First Chain
				</button>
			</div>
		</div>

		<!-- Templates List -->
		<div v-else class="templates-list">
			<div
				v-for="template in filteredTemplates"
				:key="template.id"
				class="template-item"
				:class="{ expanded: expandedTemplates.has(template.id!) }"
			>
				<!-- Template Header -->
				<div class="template-header" @click="toggleExpand(template.id!)">
					<div class="template-info">
						<div class="template-icon" :class="`category-${template.category}`">
							<UIcon name="getChainCategoryIcon(template.category)" class="size-3" />
						</div>
						<div class="template-details">
							<h6 class="template-name">
								{{ template.name }}
							</h6>
							<p class="template-meta">
								{{ template.nodes.length }} nodes • {{ template.category }}
							</p>
						</div>
					</div>
					<div class="template-actions">
						<button
							class="action-btn apply-btn-large"
							title="Apply connections to current nodes on canvas"
							@click.stop="applyTemplate(template)"
						>
							<UIcon name="i-lucide-check-circle" class="size-3" />
							<span>Apply</span>
						</button>
						<button
							class="action-btn expand-btn"
							:class="{ rotated: expandedTemplates.has(template.id!) }"
						>
							<UIcon name="i-lucide-chevron-down" class="size-3" />
						</button>
					</div>
				</div>

				<!-- Expanded Content -->
				<div v-if="expandedTemplates.has(template.id!)" class="template-expanded">
					<div class="template-description">
						<p>{{ template.description || 'No description provided.' }}</p>
					</div>

					<div class="template-preview">
						<div class="preview-header">
							<span class="preview-label">Chain Flow:</span>
						</div>
						<div class="flow-preview">
							<div
								v-for="(node, index) in template.nodes.slice(0, 5)"
								:key="node.id"
								class="flow-node"
							>
								<div class="flow-node-content">
									<UIcon :name="getNodeIcon(node.type)" class="size-2" />
									<span class="flow-node-name">{{ node.data?.label || node.type }}</span>
								</div>
								<div v-if="index < template.nodes.slice(0, 5).length - 1" class="flow-connector">
									<UIcon name="i-lucide-arrow-right" class="size-2" />
								</div>
							</div>
							<div v-if="template.nodes.length > 5" class="flow-more">
								<span>+{{ template.nodes.length - 5 }} more</span>
							</div>
						</div>
					</div>

					<div class="template-stats">
						<div class="stat-item">
							<UIcon name="i-lucide-circle" class="size-2" />
							<span>{{ template.nodes.length }} nodes</span>
						</div>
						<div class="stat-item">
							<UIcon name="i-lucide-link" class="size-2" />
							<span>{{ template.connections.length }} connections</span>
						</div>
						<div class="stat-item">
							<UIcon name="i-lucide-clock" class="size-2" />
							<span>{{ formatDate(template.createdAt) }}</span>
						</div>
					</div>

					<div class="template-bottom-actions">
						<button class="bottom-action-btn edit-btn" @click="editTemplate(template)">
							<UIcon name="i-lucide-edit" class="size-3" />
							Edit
						</button>
						<button class="bottom-action-btn duplicate-btn" @click="duplicateTemplate(template)">
							<UIcon name="i-lucide-copy" class="size-3" />
							Duplicate
						</button>
						<button class="bottom-action-btn delete-btn" @click="deleteTemplate(template)">
							<UIcon name="i-lucide-trash-2" class="size-3" />
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Chain Creation Process -->
		<ChainCreationProcess
			:is-active="showCreationProcess"
			:nodes="availableNodes"
			:edges="availableEdges"
			@save-chain="handleSaveChain"
			@cancel="showCreationProcess = false"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { ChainTemplate } from "../../composables/useChainTemplates";
	import { useToast } from "#ui/composables/useToast";
	import { computed, ref, watch } from "vue";
	import { useChainTemplates } from "../../composables/useChainTemplates";
	import ChainCreationProcess from "./ChainCreationProcess.vue";

	interface Props {
		organizationId?: string
		projectId?: string
		nodes?: any[]
		edges?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		nodes: () => [],
		edges: () => []
	});

	const emit = defineEmits<{
		applyTemplate: [template: ChainTemplate]
		addNodes: [nodes: any[]]
		addEdges: [edges: any[]]
		updateNodePositions: [positions: Record<string, { x: number, y: number }>]
	}>();

	const {
		chainTemplates,
		isLoading,
		error,
		loadChainTemplates,
		saveChainTemplate,
		updateChainTemplate,
		deleteChainTemplate,
		applyChainTemplate,
		getTemplatesByCategory,
		searchTemplates,
		availableCategories
	} = useChainTemplates(props.organizationId, props.projectId);

	const searchQuery = ref("");
	const selectedCategory = ref("all");
	const expandedTemplates = ref(new Set<string>());
	const showCreationProcess = ref(false);

	const availableNodes = computed(() => props.nodes || []);
	const availableEdges = computed(() => props.edges || []);

	const filteredTemplates = computed(() => {
		let filtered = searchQuery.value
			? searchTemplates.value(searchQuery.value)
			: chainTemplates.value;

		if (selectedCategory.value !== "all") {
			filtered = getTemplatesByCategory.value(selectedCategory.value);
		}

		return filtered;
	});

	const getChainCategoryIcon = (category: string) => {
		const iconMap: Record<string, string> = {
			automation: "i-lucide-zap",
			"form-processing": "i-lucide-file-text",
			"data-flow": "i-lucide-git-branch",
			"api-integration": "i-lucide-globe",
			custom: "i-lucide-layout"
		};
		return iconMap[category] || "i-lucide-git-branch";
	};

	const getNodeIcon = (nodeType?: string) => {
		const iconMap: Record<string, string> = {
			templateNode: "i-lucide-layout-template",
			browserNode: "i-lucide-globe",
			formsPanelNode: "i-lucide-file-text",
			transportNode: "i-lucide-send",
			hookNode: "i-lucide-webhook",
			viewportNode: "i-lucide-monitor"
		};
		return iconMap[nodeType || ""] || "i-lucide-circle";
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
		});
	};

	const toggleExpand = (templateId: string) => {
		if (expandedTemplates.value.has(templateId)) {
			expandedTemplates.value.delete(templateId);
		} else {
			expandedTemplates.value.add(templateId);
		}
		// Force reactivity update
		expandedTemplates.value = new Set(expandedTemplates.value);
	};

	const openCreationProcess = () => {
		showCreationProcess.value = true;
	};

	const handleSaveChain = async (chainData: any) => {
		try {
			await saveChainTemplate(chainData);
			showCreationProcess.value = false;

			// Show success toast
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Chain Template Created",
				description: `"${chainData.name}" has been saved successfully`,
				color: "success",
				icon: "i-lucide-check-circle"
			});
		} catch (err) {
			console.error("Failed to save chain template:", err);
		}
	};

	const applyTemplate = (template: ChainTemplate) => {
		try {
			console.log("🔗 Applying chain template:", template.name);
			console.log("📊 Template data:", {
				nodes: template.nodes?.length || 0,
				connections: template.connections?.length || 0,
				category: template.category,
				layoutConfig: template.layoutConfig,
				connectionStyle: template.connectionStyle
			});

			// Get the nodes from the template
			const templateNodeIds = template.nodes?.map((n: any) => n.id) || [];

			// Get the connections from the template
			const connections = template.connections || [];

			if (connections.length === 0) {
				console.warn("⚠️ No connections in template");
				useToast().add({
					title: "No Connections",
					description: "This template doesn't have any connections to apply",
					color: "warning",
					icon: "i-lucide-alert-circle"
				});
				return;
			}

			console.log("🔗 Template node IDs:", templateNodeIds);
			console.log("🔗 Applying", connections.length, "connections");
			console.log("🔗 Connection details:", connections);

			// Check if the nodes exist on canvas
			const missingNodes = templateNodeIds.filter(
				(nodeId: string) => !availableNodes.value.some((n: any) => n.id === nodeId)
			);

			if (missingNodes.length > 0) {
				console.warn("⚠️ Some nodes from template not found on canvas:", missingNodes);
				useToast().add({
					title: "Partial Apply",
					description: `${missingNodes.length} node(s) from template not found on canvas. Connections may not work.`,
					color: "warning",
					icon: "i-lucide-alert-triangle"
				});
			}

			// Apply node positions if layout config exists
			if (template.layoutConfig && template.nodes) {
				const positionUpdates = calculateNodePositions(template.nodes, template.layoutConfig);
				emit("updateNodePositions", positionUpdates);
			}

			// Emit events to add connections
			emit("applyTemplate", template);
			emit("addEdges", connections);

			// Show success feedback
			useToast().add({
				title: "Template Applied",
				description: `Applied ${connections.length} connection(s) from "${template.name}"`,
				color: "success",
				icon: "i-lucide-check-circle"
			});
		} catch (err) {
			console.error("❌ Failed to apply template:", err);
			useToast().add({
				title: "Apply Failed",
				description: "Failed to apply chain template. Check console for details.",
				color: "error",
				icon: "i-lucide-x-circle"
			});
		}
	};

	// Calculate node positions based on layout configuration
	const calculateNodePositions = (nodes: any[], layoutConfig: any) => {
		const positions: Record<string, { x: number, y: number }> = {};
		const layout = layoutConfig.layout || "horizontal";
		const spacing = layoutConfig.spacing || 200;

		nodes.forEach((node: any, index: number) => {
			let x = 0;
			let y = 0;

			switch (layout) {
			case "horizontal":
				x = index * spacing;
				y = 0;
				break;
			case "vertical":
				x = 0;
				y = index * spacing;
				break;
			case "grid":
				const cols = Math.ceil(Math.sqrt(nodes.length));
				x = (index % cols) * spacing;
				y = Math.floor(index / cols) * spacing;
				break;
			case "circle":
				const angle = (index / nodes.length) * 2 * Math.PI;
				const radius = spacing;
				x = Math.cos(angle) * radius;
				y = Math.sin(angle) * radius;
				break;
			case "tree":
				// Simple tree layout: root at top, children below
				if (index === 0) {
					x = 0;
					y = 0;
				} else {
					x = ((index - 1) % 2 === 0 ? -1 : 1) * spacing / 2;
					y = Math.floor((index - 1) / 2 + 1) * spacing;
				}
				break;
			default:
				x = index * spacing;
				y = 0;
			}

			positions[node.id] = { x, y };
		});

		return positions;
	};

	const editTemplate = (template: ChainTemplate) => {
		// TODO: Implement template editing
		console.log("Edit template:", template);
	};

	const duplicateTemplate = async (template: ChainTemplate) => {
		try {
			const duplicatedTemplate = {
				...template,
				name: `${template.name} (Copy)`,
				description: `Copy of ${template.description}`
			};
			delete (duplicatedTemplate as any).id;
			delete (duplicatedTemplate as any).createdAt;

			await saveChainTemplate(duplicatedTemplate);
		} catch (err) {
			console.error("Failed to duplicate template:", err);
		}
	};

	const deleteTemplate = async (template: ChainTemplate) => {
		if (!template.id) return;

		try {
			await deleteChainTemplate(template.id);

			// Show success toast
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Chain Template Deleted",
				description: `"${template.name}" has been removed`,
				color: "success",
				icon: "i-lucide-trash-2"
			});
		} catch (err) {
			console.error("Failed to delete template:", err);
		}
	};

	// Load templates on mount
	watch(() => props.organizationId, (newOrgId) => {
		if (newOrgId) {
			loadChainTemplates();
		}
	}, { immediate: true });
</script>

<style scoped>
	.chain-templates-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(var(--color-neutral-rgb), 0.08);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(var(--color-primary-rgb), 0.05);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.header-icon {
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.panel-title {
		font-size: 14px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		letter-spacing: 0.3px;
	}

	.panel-subtitle {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.create-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 8px;
		color: rgba(var(--color-primary-rgb), 0.8);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.create-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		color: rgba(var(--color-primary-rgb), 1);
		transform: scale(1.05);
	}

	.controls-section {
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		color: rgba(255, 255, 255, 0.4);
		pointer-events: none;
		z-index: 1;
	}

	.search-input {
		width: 100%;
		padding: 8px 10px 8px 32px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: white;
		font-size: 12px;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.clear-search {
		position: absolute;
		right: 8px;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 3px;
		color: rgba(239, 68, 68, 0.8);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clear-search:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.3);
	}

	.category-filter {
		width: 100%;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: white;
		font-size: 11px;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.category-filter:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
	}

	.loading-state,
	.error-state,
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		text-align: center;
		gap: 12px;
	}

	.loading-text,
	.error-text {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	.error-text {
		color: rgba(239, 68, 68, 0.8);
	}

	.retry-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
		color: rgba(var(--color-primary-rgb), 0.8);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.retry-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.empty-icon {
		opacity: 0.3;
	}

	.empty-title {
		font-size: 14px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 4px 0;
	}

	.empty-description {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 0 16px 0;
		line-height: 1.4;
	}

	.create-first-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 8px;
		color: rgba(var(--color-primary-rgb), 0.8);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.create-first-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.templates-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.template-item {
		background: rgba(var(--color-neutral-rgb), 0.06);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.template-item:hover {
		background: rgba(var(--color-neutral-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.15);
	}

	.template-item.expanded {
		border-color: rgba(var(--color-primary-rgb), 0.2);
		background: rgba(var(--color-neutral-rgb), 0.1);
	}

	.template-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.template-header:hover {
		background: rgba(var(--color-primary-rgb), 0.03);
	}

	.template-info {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
	}

	.template-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
	}

	.template-icon.category-automation {
		background: rgba(234, 179, 8, 0.1);
		color: rgba(234, 179, 8, 0.8);
	}

	.template-icon.category-form-processing {
		background: rgba(34, 197, 94, 0.1);
		color: rgba(34, 197, 94, 0.8);
	}

	.template-icon.category-data-flow {
		background: rgba(59, 130, 246, 0.1);
		color: rgba(59, 130, 246, 0.8);
	}

	.template-icon.category-api-integration {
		background: rgba(99, 102, 241, 0.1);
		color: rgba(99, 102, 241, 0.8);
	}

	.template-icon.category-custom {
		background: rgba(107, 114, 128, 0.1);
		color: rgba(107, 114, 128, 0.8);
	}

	.template-details {
		flex: 1;
		min-width: 0;
	}

	.template-name {
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 2px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.template-meta {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.5);
		margin: 0;
	}

	.template-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.action-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.action-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		color: rgba(var(--color-primary-rgb), 0.8);
	}

	.apply-btn:hover {
		background: rgba(34, 197, 94, 0.1);
		border-color: rgba(34, 197, 94, 0.2);
		color: rgba(34, 197, 94, 0.8);
	}

	.apply-btn-large {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		background: rgba(34, 197, 94, 0.12);
		border: 1px solid rgba(34, 197, 94, 0.25);
		border-radius: 6px;
		color: rgba(34, 197, 94, 1);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1);
	}

	.apply-btn-large:hover {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.4);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
	}

	.apply-btn-large:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(34, 197, 94, 0.15);
	}

	.expand-btn {
		transition: transform 0.3s ease;
	}

	.expand-btn.rotated {
		transform: rotate(180deg);
	}

	.template-expanded {
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(0, 0, 0, 0.1);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.template-description p {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.4;
	}

	.flow-preview {
		display: flex;
		align-items: center;
		gap: 6px;
		overflow-x: auto;
		padding: 8px 0;
	}

	.flow-node {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.flow-node-content {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.15);
		border-radius: 4px;
		color: rgba(var(--color-primary-rgb), 0.8);
		font-size: 9px;
		font-weight: 500;
	}

	.flow-node-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 60px;
	}

	.flow-connector {
		color: rgba(255, 255, 255, 0.3);
	}

	.flow-more {
		font-size: 9px;
		color: rgba(255, 255, 255, 0.5);
		font-style: italic;
	}

	.template-stats {
		display: flex;
		gap: 12px;
		padding: 8px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
	}

	.template-bottom-actions {
		display: flex;
		gap: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.bottom-action-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: 1px solid transparent;
	}

	.edit-btn {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.2);
		color: rgba(59, 130, 246, 0.8);
	}

	.edit-btn:hover {
		background: rgba(59, 130, 246, 0.15);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.duplicate-btn {
		background: rgba(168, 85, 247, 0.1);
		border-color: rgba(168, 85, 247, 0.2);
		color: rgba(168, 85, 247, 0.8);
	}

	.duplicate-btn:hover {
		background: rgba(168, 85, 247, 0.15);
		border-color: rgba(168, 85, 247, 0.3);
	}

	.delete-btn {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.2);
		color: rgba(239, 68, 68, 0.8);
	}

	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.15);
		border-color: rgba(239, 68, 68, 0.3);
	}
</style>

<template>
	<div class="connections-panel h-full w-full flex flex-col">
		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<h3 class="panel-title">
					<UIcon name="i-lucide-link" class="size-5" />
					Connections
				</h3>
				<p class="panel-subtitle">
					Manage node connections and data flow
				</p>
			</div>
			<div class="header-actions">
				<button
					class="panel-switch-btn"
					title="Back to components"
					@click="$emit('switchToComponents')"
				>
					<UIcon name="i-lucide-arrow-left" class="size-4" />
				</button>
			</div>
		</div>

		<!-- Search Bar -->
		<div class="search-section">
			<div class="search-input-wrapper">
				<UIcon name="i-lucide-search" class="search-icon" />
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search connections..."
					class="search-input"
				>
				<button
					v-if="searchQuery"
					class="clear-search-button"
					@click="searchQuery = ''"
				>
					<UIcon name="i-lucide-x" class="size-3" />
				</button>
			</div>
		</div>

		<!-- Filter Section -->
		<div class="filter-section">
			<div class="filter-label">
				Filter by type:
			</div>
			<div class="type-filter-buttons">
				<button
					class="type-filter-btn"
					:class="{ active: selectedFilter === 'all' }"
					@click="selectedFilter = 'all'"
				>
					All ({{ allEdges.length }})
				</button>
				<button
					v-for="type in connectionTypes"
					:key="type"
					class="type-filter-btn"
					:class="{ active: selectedFilter === type }"
					@click="selectedFilter = type"
				>
					{{ type }} ({{ getConnectionsByType(type).length }})
				</button>
			</div>
		</div>

		<!-- Connection Flow Management Section -->
		<div class="connection-flow-section">
			<div class="flow-header">
				<UIcon name="i-lucide-settings" class="size-4 text-primary" />
				<span class="flow-title">Connection Settings</span>
			</div>
			
			<div class="flow-settings">
				<!-- Default Connection Type -->
				<div class="setting-group">
					<label class="setting-label">Default Connection Type</label>
					<select v-model="defaultConnectionType" class="setting-select">
						<option value="smoothstep">Smooth Step</option>
						<option value="straight">Straight</option>
						<option value="step">Step</option>
						<option value="simplebezier">Bezier</option>
					</select>
				</div>

				<!-- Connection Flow Options -->
				<div class="setting-group">
					<div class="flow-options">
						<button 
							class="flow-option-btn"
							:class="{ active: showConnectionSuggestions }"
							@click="showConnectionSuggestions = !showConnectionSuggestions"
						>
							<UIcon name="i-lucide-lightbulb" class="size-4" />
							Smart Suggestions
						</button>
						<button 
							class="flow-option-btn"
							:class="{ active: autoConnectEnabled }"
							@click="autoConnectEnabled = !autoConnectEnabled"
						>
							<UIcon name="i-lucide-zap" class="size-4" />
							Auto Connect
						</button>
					</div>
				</div>

				<!-- Chain Creation Quick Access -->
				<div class="setting-group">
					<button class="chain-creation-btn" @click="startChainCreation">
						<UIcon name="i-lucide-git-branch" class="size-4" />
						Start Chain Template
					</button>
				</div>
			</div>
		</div>

		<!-- Content Area -->
		<div class="panel-content">
			<!-- Loading State -->
			<div v-if="isLoading" class="loading-state">
				<UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary/60" />
				<p class="text-sm text-white/60 mt-3">
					Loading connections...
				</p>
			</div>

			<!-- Empty State -->
			<div v-else-if="filteredConnections.length === 0" class="empty-state">
				<UIcon name="i-lucide-link" class="size-12 text-white/20 mb-3" />
				<p class="text-sm text-white/50">
					{{ searchQuery ? 'No connections match your search' : 'No connections found' }}
				</p>
				<p v-if="!searchQuery" class="text-xs text-white/40 mt-2">
					Add nodes to the canvas to create connections
				</p>
			</div>

			<!-- Connections List -->
			<div v-else class="connections-list">
				<div
					v-for="connection in filteredConnections"
					:key="connection.id"
					class="connection-item"
					:class="{
						expanded: isExpanded(connection.id),
						editing: editingConnection === connection.id
					}"
				>
					<!-- Connection Header -->
					<div class="connection-header" @click="toggleExpanded(connection.id)">
						<div class="connection-info">
							<div class="connection-icon">
								<UIcon :name="getConnectionIcon(connection)" class="size-4" />
							</div>
							<div class="connection-details">
								<div class="connection-title">
									{{ getConnectionTitle(connection) }}
								</div>
								<div class="connection-subtitle">
									{{ getConnectionSubtitle(connection) }}
								</div>
							</div>
						</div>
						<div class="connection-status">
							<span class="status-badge" :class="getConnectionStatusClass(connection)">
								{{ getConnectionType(connection) }}
							</span>
							<UIcon
								:name="isExpanded(connection.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
								class="size-4 text-white/40"
							/>
						</div>
					</div>

					<!-- Connection Details (Expanded) -->
					<div v-if="isExpanded(connection.id)" class="connection-details-panel">
						<!-- Edit Mode -->
						<div v-if="editingConnection === connection.id" class="connection-edit-form">
							<!-- Connection Label -->
							<ConnectionPropertyField
								v-model="editForm.label"
								label="Connection Label"
								placeholder="Connection label (optional)"
								description="Optional label to display on the connection"
							/>

							<!-- Connection Type and Curvature -->
							<ConnectionTypeSelector
								v-model="editForm.type"
								v-model:curvature="editForm.curvature"
								:show-advanced="true"
							/>

							<!-- Animation Settings -->
							<ConnectionAnimationToggle
								v-model="editForm.animated"
								v-model:animation-speed="editForm.animationSpeed"
								v-model:animation-type="editForm.animationType"
							/>

							<!-- Color Settings -->
							<ConnectionColorPicker
								v-model="editForm.strokeColor"
							/>

							<!-- Width Settings -->
							<ConnectionWidthSlider
								v-model="editForm.strokeWidth"
							/>

							<div class="edit-actions">
								<button class="action-btn save-btn" @click="saveConnection(connection)">
									<UIcon name="i-lucide-save" class="size-3" />
									Save
								</button>
								<button class="action-btn cancel-btn" @click="cancelEdit">
									<UIcon name="i-lucide-x" class="size-3" />
									Cancel
								</button>
							</div>
						</div>

						<!-- View Mode -->
						<div v-else class="connection-info-panel">
							<div class="info-row">
								<span class="info-label">Source Node</span>
								<span class="info-value">{{ getSourceNodeName(connection) }}</span>
							</div>
							<div class="info-row">
								<span class="info-label">Target Node</span>
								<span class="info-value">{{ getTargetNodeName(connection) }}</span>
							</div>
							<div class="info-row">
								<span class="info-label">Type</span>
								<span class="info-value">{{ connection.type || 'default' }}</span>
							</div>
							<div class="info-row">
								<span class="info-label">Animated</span>
								<span class="info-value" :class="connection.animated ? 'text-emerald-400' : 'text-red-400'">
									{{ connection.animated ? 'Yes' : 'No' }}
								</span>
							</div>
							<div v-if="connection.label" class="info-row">
								<span class="info-label">Label</span>
								<span class="info-value">{{ connection.label }}</span>
							</div>
							<div class="info-row">
								<span class="info-label">ID</span>
								<span class="info-value text-xs font-mono">{{ connection.id }}</span>
							</div>

							<div class="connection-actions">
								<button class="action-btn edit-btn" @click="startEditing(connection)">
									<UIcon name="i-lucide-edit-2" class="size-3" />
									Edit
								</button>
								<button class="action-btn delete-btn" @click="deleteConnection(connection)">
									<UIcon name="i-lucide-trash-2" class="size-3" />
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Add New Connection Button -->
			<div class="add-connection-section">
				<button
					class="add-connection-btn"
					@click="showAddConnectionForm = true"
				>
					<UIcon name="i-lucide-plus" class="size-4" />
					Add New Connection
				</button>
			</div>

			<!-- Add Connection Form -->
			<div v-if="showAddConnectionForm" class="add-connection-form">
				<div class="form-header">
					<h4 class="form-title">Create New Connection</h4>
					<button
						class="form-close"
						@click="showAddConnectionForm = false; resetAddForm()"
					>
						<UIcon name="i-lucide-x" class="size-4" />
					</button>
				</div>
				<div class="form-content">
					<!-- Source and Target Node Selection -->
					<div class="form-field">
						<label class="form-label">Source Node</label>
						<select v-model="addForm.sourceId" class="form-select" @change="validateConnection">
							<option value="">Select source node...</option>
							<option
								v-for="node in availableNodes"
								:key="node.id"
								:value="node.id"
							>
								{{ node.data?.label || node.id }}
							</option>
						</select>
					</div>
					<div class="form-field">
						<label class="form-label">Target Node</label>
						<select v-model="addForm.targetId" class="form-select" @change="validateConnection">
							<option value="">Select target node...</option>
							<option
								v-for="node in availableNodes"
								:key="node.id"
								:value="node.id"
								:disabled="node.id === addForm.sourceId"
							>
								{{ node.data?.label || node.id }}
							</option>
						</select>
					</div>

					<!-- Connection Label -->
					<ConnectionPropertyField
						v-model="addForm.label"
						label="Connection Label"
						placeholder="Connection label (optional)"
						description="Optional label to display on the connection"
					/>

					<!-- Connection Type and Curvature -->
					<ConnectionTypeSelector
						v-model="addForm.type"
						v-model:curvature="addForm.curvature"
						:show-advanced="true"
					/>

					<!-- Animation Settings -->
					<ConnectionAnimationToggle
						v-model="addForm.animated"
						v-model:animation-speed="addForm.animationSpeed"
						v-model:animation-type="addForm.animationType"
					/>

					<!-- Color Settings -->
					<ConnectionColorPicker
						v-model="addForm.strokeColor"
					/>

					<!-- Width Settings -->
					<ConnectionWidthSlider
						v-model="addForm.strokeWidth"
					/>

					<div class="form-actions">
						<button
							class="form-btn cancel-btn"
							@click="showAddConnectionForm = false; resetAddForm()"
						>
							Cancel
						</button>
						<button
							class="form-btn save-btn"
							:disabled="!canCreateConnection"
							@click="createConnection"
						>
							Create Connection
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete Confirmation Modal -->
		<Teleport to="body">
			<div v-if="deleteConfirmation" class="fixed inset-0 z-[9999] flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cancelDelete" />

				<!-- Modal Content -->
				<div class="relative w-full max-w-md mx-4">
					<div class="glassmorphic-panel p-6 border border-red-500/20 rounded-xl">
						<!-- Modal Header -->
						<div class="flex items-center gap-3 mb-4">
							<UIcon name="i-lucide-alert-triangle" class="size-6 text-red-400" />
							<h3 class="text-lg font-semibold text-white">
								Delete Connection?
							</h3>
						</div>

						<!-- Modal Body -->
						<p class="text-white/70 mb-6">
							Are you sure you want to delete the connection between "<span class="font-medium text-white">{{ getSourceNodeName(deleteConfirmation) }}</span>" and "<span class="font-medium text-white">{{ getTargetNodeName(deleteConfirmation) }}</span>"? This action cannot be undone.
						</p>

						<!-- Modal Actions -->
						<div class="flex items-center justify-end gap-3">
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-neutral-500/30 text-white/80 hover:text-white"
								@click="cancelDelete"
							>
								Cancel
							</button>
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-400/40"
								@click="confirmDelete"
							>
								<UIcon name="i-lucide-trash-2" class="size-4 mr-2" />
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";
	import ConnectionAnimationToggle from "../ui/ConnectionAnimationToggle.vue";
	import ConnectionColorPicker from "../ui/ConnectionColorPicker.vue";
	import ConnectionPropertyField from "../ui/ConnectionPropertyField.vue";
	import ConnectionTypeSelector from "../ui/ConnectionTypeSelector.vue";
	import ConnectionWidthSlider from "../ui/ConnectionWidthSlider.vue";
	import "./NodeCanvasRightPanel.css"; // Reuse existing styles

	// Props
	const props = defineProps<{
		nodes: any[]
		edges: any[]
	}>();

	// Emits
	const emit = defineEmits<{
		updateEdge: [edgeId: string, edgeData: any]
		deleteEdge: [edgeId: string]
		createEdge: [edgeData: any]
		switchToComponents: []
		startChainCreation: []
	}>();

	// State
	const isLoading = ref(false);
	const searchQuery = ref("");
	const selectedFilter = ref<string>("all");
	const expandedConnections = ref<Set<string>>(new Set());
	const editingConnection = ref<string | null>(null);
	const editForm = ref<any>({});
	const showAddConnectionForm = ref(false);
	const addForm = ref({
		sourceId: "",
		targetId: "",
		type: "smoothstep",
		label: "",
		animated: true,
		animationSpeed: "normal" as "slow" | "normal" | "fast",
		animationType: "flow" as "flow" | "pulse" | "wave" | "dash" | "glow" | "bounce" | "particle" | "beam" | "light" | "laser",
		strokeColor: "#8b5cf6",
		strokeWidth: 2,
		curvature: 0.5
	});
	const deleteConfirmation = ref<any>(null);

	// Connection Flow Management State
	const defaultConnectionType = ref("smoothstep");
	const showConnectionSuggestions = ref(true);
	const autoConnectEnabled = ref(false);

	// Computed
	const allEdges = computed(() => props.edges || []);

	const availableNodes = computed(() => {
		return props.nodes || [];
	});

	// Helper functions
	const getNodeById = (nodeId: string) => {
		return availableNodes.value.find((node: any) => node.id === nodeId);
	};

	const connectionExists = (sourceId: string, targetId: string) => {
		return allEdges.value.some((edge: any) =>
			edge.source === sourceId && edge.target === targetId
		);
	};

	const connectionTypes = computed(() => {
		const types = new Set<string>();
		allEdges.value.forEach((edge: any) => {
			if (edge.type) {
				types.add(edge.type);
			}
		});
		return Array.from(types).sort();
	});

	const filteredConnections = computed(() => {
		let filtered = allEdges.value;

		// Filter by type
		if (selectedFilter.value !== "all") {
			filtered = filtered.filter((edge: any) => edge.type === selectedFilter.value);
		}

		// Filter by search query
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter((edge: any) => {
				const sourceNode = getNodeById(edge.source);
				const targetNode = getNodeById(edge.target);
				return (
					edge.id?.toLowerCase().includes(query)
					|| edge.label?.toLowerCase().includes(query)
					|| sourceNode?.data?.label?.toLowerCase().includes(query)
					|| targetNode?.data?.label?.toLowerCase().includes(query)
					|| edge.source?.toLowerCase().includes(query)
					|| edge.target?.toLowerCase().includes(query)
				);
			});
		}

		return filtered;
	});

	const canCreateConnection = computed(() => {
		return addForm.value.sourceId
			&& addForm.value.targetId
			&& addForm.value.sourceId !== addForm.value.targetId
			&& !connectionExists(addForm.value.sourceId, addForm.value.targetId);
	});

	// Methods

	const getConnectionsByType = (type: string) => {
		if (type === "all") return allEdges.value;
		return allEdges.value.filter((edge: any) => edge.type === type);
	};

	const getConnectionIcon = (_connection: any) => {
		return "i-lucide-arrow-right";
	};

	const getConnectionTitle = (connection: any) => {
		const sourceNode = getNodeById(connection.source);
		const targetNode = getNodeById(connection.target);
		const sourceName = sourceNode?.data?.label || connection.source;
		const targetName = targetNode?.data?.label || connection.target;
		return `${sourceName} → ${targetName}`;
	};

	const getConnectionSubtitle = (connection: any) => {
		return connection.label || connection.id;
	};

	const getConnectionType = (connection: any) => {
		return connection.type || "default";
	};

	const getConnectionStatusClass = (connection: any) => {
		const baseClass = "status-badge";
		if (connection.animated) return `${baseClass} animated`;
		return baseClass;
	};

	const getSourceNodeName = (connection: any) => {
		const sourceNode = getNodeById(connection.source);
		return sourceNode?.data?.label || connection.source;
	};

	const getTargetNodeName = (connection: any) => {
		const targetNode = getNodeById(connection.target);
		return targetNode?.data?.label || connection.target;
	};

	const toggleExpanded = (connectionId: string) => {
		if (expandedConnections.value.has(connectionId)) {
			expandedConnections.value.delete(connectionId);
		} else {
			expandedConnections.value.add(connectionId);
		}
		// Force reactivity update
		expandedConnections.value = new Set(expandedConnections.value);
	};

	const isExpanded = (connectionId: string) => {
		return expandedConnections.value.has(connectionId);
	};

	const startEditing = (connection: any) => {
		editingConnection.value = connection.id;
		editForm.value = {
			label: connection.label || "",
			type: connection.type || "smoothstep",
			animated: connection.animated || false,
			animationSpeed: connection.animationSpeed || "normal",
			animationType: connection.animationType || "flow",
			strokeColor: connection.style?.stroke || "#8b5cf6",
			strokeWidth: connection.style?.strokeWidth || 2,
			curvature: connection.curvature || 0.5
		};
	};

	const cancelEdit = () => {
		editingConnection.value = null;
		editForm.value = {};
	};

	const saveConnection = (connection: any) => {
		const updatedData = {
			// Direct edge properties - always set label (even if empty) so it can be properly updated
			label: editForm.value.label || "",
			type: editForm.value.type,
			animated: editForm.value.animated,
			animationSpeed: editForm.value.animationSpeed,
			animationType: editForm.value.animationType,
			curvature: editForm.value.curvature,
			// Style object with proper merging
			style: {
				...connection.style,
				stroke: editForm.value.strokeColor,
				strokeWidth: editForm.value.strokeWidth
			},
			// Marker end updates
			markerEnd: {
				...connection.markerEnd,
				color: editForm.value.strokeColor
			}
		};

		console.log("🔗 ConnectionsPanel: Saving connection update:", connection.id, updatedData);
		console.log("🔗 ConnectionsPanel: Edit form data:", editForm.value);
		emit("updateEdge", connection.id, updatedData);
		cancelEdit();
	};

	const deleteConnection = (connection: any) => {
		deleteConfirmation.value = connection;
	};

	const confirmDelete = () => {
		if (deleteConfirmation.value) {
			emit("deleteEdge", deleteConfirmation.value.id);
			deleteConfirmation.value = null;
		}
	};

	const cancelDelete = () => {
		deleteConfirmation.value = null;
	};

	const validateConnection = () => {
		// Additional validation logic can be added here
	};

	const resetAddForm = () => {
		addForm.value = {
			sourceId: "",
			targetId: "",
			type: "smoothstep",
			label: "",
			animated: true,
			animationSpeed: "normal" as "slow" | "normal" | "fast",
			animationType: "flow" as "flow" | "pulse" | "wave" | "dash" | "glow" | "bounce" | "particle" | "beam" | "light" | "laser",
			strokeColor: "#8b5cf6",
			strokeWidth: 2,
			curvature: 0.5
		};
	};

	const createConnection = () => {
		if (!canCreateConnection.value) return;

		const newEdge = {
			id: `edge_${addForm.value.sourceId}_${addForm.value.targetId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			source: addForm.value.sourceId,
			target: addForm.value.targetId,
			sourceHandle: "right", // Default source handle ID (output)
			targetHandle: "left", // Default target handle ID (input)
			type: addForm.value.type,
			animated: addForm.value.animated,
			animationSpeed: addForm.value.animationSpeed,
			animationType: addForm.value.animationType,
			curvature: addForm.value.curvature,
			// Only add label if it has content
			...(addForm.value.label && addForm.value.label.trim() && { label: addForm.value.label.trim() }),
			style: {
				stroke: addForm.value.strokeColor,
				strokeWidth: addForm.value.strokeWidth
			},
			markerEnd: {
				type: "arrowclosed",
				color: addForm.value.strokeColor
			}
		};

		console.log("➕ ConnectionsPanel: Creating new edge:", newEdge);
		emit("createEdge", newEdge);
		showAddConnectionForm.value = false;
		resetAddForm();
	};

	// Connection Flow Management Handlers
	const startChainCreation = () => {
		console.log("🔗 Starting chain template creation from ConnectionsPanel");
		emit("startChainCreation");
	};
</script>

<style scoped>
	.connections-panel {
		background: linear-gradient(
			135deg,
			rgba(var(--color-neutral-rgb), 0.08) 0%,
			rgba(var(--color-neutral-rgb), 0.12) 100%
		);
		backdrop-filter: blur(24px) saturate(1.8);
		border-left: 1px solid rgba(var(--color-primary-rgb), 0.2);
	}

	.connections-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px;
	}

	.connection-item {
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.connection-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.02), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.connection-item:hover {
		background: rgba(var(--color-neutral-rgb), 0.12);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		transform: translateX(2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.connection-item:hover::before {
		opacity: 1;
	}

	.connection-item.expanded {
		border-color: rgba(var(--color-primary-rgb), 0.25);
		background: rgba(var(--color-neutral-rgb), 0.12);
		box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.1);
	}

	.connection-item.editing {
		border-color: rgba(34, 197, 94, 0.4);
		background: rgba(34, 197, 94, 0.05);
		box-shadow: 0 4px 16px rgba(34, 197, 94, 0.15);
	}

	.connection-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px;
		cursor: pointer;
	}

	.connection-info {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}

	.connection-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.connection-details {
		flex: 1;
		min-width: 0;
	}

	.connection-title {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.connection-subtitle {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.5);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.connection-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-badge {
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: rgba(var(--color-primary-rgb), 0.12);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		color: rgba(var(--color-primary-rgb), 1);
	}

	.status-badge.animated {
		background: rgba(34, 197, 94, 0.12);
		border-color: rgba(34, 197, 94, 0.25);
		color: rgba(34, 197, 94, 1);
	}

	.connection-details-panel {
		background: rgba(0, 0, 0, 0.15);
		border-top: 1px solid rgba(255, 255, 255, 0.04);
		animation: slideDownDetails 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.connection-details-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(var(--color-primary-rgb), 0.5), transparent);
		animation: slideGlow 0.8s ease-out;
	}

	.connection-edit-form {
		animation: fadeInForm 0.3s ease-out 0.1s both;
	}

	.connection-edit-form,
	.connection-info-panel {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
		padding: 4px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.45);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		flex-shrink: 0;
		min-width: 80px;
	}

	.info-value {
		font-size: 11px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.85);
		text-align: right;
		word-break: break-word;
		flex: 1;
	}

	.connection-actions {
		display: flex;
		gap: 6px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.edit-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.edit-field label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.edit-input {
		padding: 6px 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 5px;
		color: white;
		font-size: 11px;
	}

	.edit-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}

	.checkbox-input {
		width: 14px;
		height: 14px;
	}

	.checkbox-text {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.8);
	}

	.color-input {
		width: 40px;
		height: 32px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.edit-actions {
		display: flex;
		gap: 6px;
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.add-connection-section {
		padding: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.add-connection-btn {
		width: 100%;
		padding: 10px;
		background: rgba(var(--color-primary-rgb), 0.08);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
		color: var(--color-primary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}

	.add-connection-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.12);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.add-connection-form {
		background: rgba(0, 0, 0, 0.2);
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		padding: 12px;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.form-title {
		font-size: 12px;
		font-weight: 700;
		color: white;
	}

	.form-close {
		padding: 4px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 4px;
		color: rgba(239, 68, 68, 0.9);
		cursor: pointer;
	}

	.form-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.form-field label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 4px;
	}

	.form-input {
		padding: 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 5px;
		color: white;
		font-size: 11px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.08);
	}

	.form-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-select {
		padding: 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 5px;
		color: white;
		font-size: 11px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		appearance: none;
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
		background-position: right 8px center;
		background-repeat: no-repeat;
		background-size: 16px;
		padding-right: 32px;
	}

	.form-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background-color: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.08);
	}

	.form-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-select option {
		background: rgba(30, 41, 59, 0.95);
		color: white;
		padding: 8px;
	}

	.form-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.form-btn {
		flex: 1;
		padding: 8px 12px;
		border-radius: 5px;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.form-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cancel-btn {
		background: rgba(107, 114, 128, 0.1);
		border: 1px solid rgba(107, 114, 128, 0.2);
		color: rgba(107, 114, 128, 0.9);
	}

	.save-btn {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		color: rgba(34, 197, 94, 0.9);
	}

	.action-btn {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 9px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.edit-btn {
		background: rgba(34, 197, 94, 0.08);
		border: 1px solid rgba(34, 197, 94, 0.2);
		color: rgba(34, 197, 94, 0.9);
	}

	.delete-btn {
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.2);
		color: rgba(239, 68, 68, 0.9);
	}

	@keyframes slideDownDetails {
		from {
			opacity: 0;
			max-height: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			max-height: 500px;
			transform: translateY(0);
		}
	}

	@keyframes slideGlow {
		0% {
			left: -100%;
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			left: 100%;
			opacity: 0;
		}
	}

	@keyframes fadeInForm {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulseGlow {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.3);
		}
		50% {
			box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
		}
	}

	/* Connection Flow Management Styles */
	.connection-flow-section {
		margin: 12px;
		padding: 16px;
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.15);
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.connection-flow-section:hover {
		background: rgba(var(--color-neutral-rgb), 0.12);
		border-color: rgba(var(--color-primary-rgb), 0.25);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.flow-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.flow-title {
		font-size: 13px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 0.3px;
	}

	.flow-settings {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.setting-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.setting-label {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.setting-select {
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: white;
		font-size: 12px;
		font-weight: 500;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.setting-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
	}

	.setting-select option {
		background: rgba(0, 0, 0, 0.9);
		color: white;
	}

	.flow-options {
		display: flex;
		gap: 8px;
	}

	.flow-option-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.flow-option-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		color: rgba(255, 255, 255, 0.9);
	}

	.flow-option-btn.active {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		color: var(--color-primary);
		box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
	}

	.chain-creation-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 8px;
		color: var(--color-primary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
	}

	.chain-creation-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
	}
</style>

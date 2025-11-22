<template>
	<div v-if="isOpen" class="node-configuration-panel">
		<!-- Backdrop -->
		<div 
			class="panel-backdrop" 
			@click.stop="handleBackdropClick"
			@mousedown.stop
		/>

		<!-- Panel Container -->
		<div class="panel-container" @click.stop @mousedown.stop>
			<!-- Panel Header -->
			<div class="panel-header">
				<div class="header-left">
					<UIcon :name="getNodeIcon(currentNodeType)" class="w-6 h-6 text-primary" />
					<div class="header-info">
						<h2 class="panel-title">{{ panelTitle }}</h2>
						<p class="panel-subtitle">{{ getPanelSubtitle() }}</p>
					</div>
				</div>
				<div class="header-actions">
					<button
						v-if="isEditMode"
						class="header-action-btn delete-btn"
						@click.stop="handleDelete"
						@mousedown.stop
						title="Delete node"
					>
						<UIcon name="i-lucide-trash-2" class="w-5 h-5" />
					</button>
					<button
						class="header-action-btn close-btn"
						@click.stop="handleClose"
						@mousedown.stop
						title="Close panel"
					>
						<UIcon name="i-lucide-x" class="w-6 h-6" />
					</button>
				</div>
			</div>

			<!-- Panel Content - Node Renderer -->
			<div class="panel-content">
				<div class="node-configuration-wrapper">
					<!-- Node Renderer with VueFlow context -->
					<ConfigPanelNodeWrapper
						v-if="currentNodeType && getNodeComponent(currentNodeType)"
						:key="`config-wrapper-${currentNodeType}`"
						:node-props="nodePropsForRenderer"
					>
						<template #default="{ nodeProps: wrappedNodeProps }">
							<component
								:is="getNodeComponent(currentNodeType)"
								:key="`config-node-${currentNodeType}`"
								:custom-node-props="wrappedNodeProps"
								:update-node-data="updateLocalNodeData"
								:all-handlers="allHandlers"
								:organization-id="organizationId"
								:organisation-id="organizationId"
								:available-hooks="availableHooks"
								:available-transports="availableTransports"
								:canvas-nodes="canvasNodes"
								:canvas-edges="canvasEdges"
								:canvas-viewport="canvasViewport"
								:get-status-class="getStatusClass"
								:open-template-creation-modal="handleOpenTemplateModal"
								:trigger-template-chain="handleTriggerTemplateChain"
								:get-command-category="getCommandCategory"
								:open-command-selector="handleOpenCommandSelector"
								:test-command="handleTestCommand"
								:get-event-category="getEventCategory"
								:open-event-selector="handleOpenEventSelector"
								:test-event="handleTestEvent"
								@close="handleNodeClose"
								@close-node="handleNodeClose"
							/>
						</template>
					</ConfigPanelNodeWrapper>
					
					<!-- Placeholder for unknown node types -->
					<div v-else class="unknown-node-placeholder">
						<UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-orange-400 mb-4" />
						<h3 class="text-lg font-semibold text-white/90 mb-2">Unknown Node Type</h3>
						<p class="text-sm text-white/60">Cannot render node type: {{ currentNodeType }}</p>
						<p class="text-xs text-white/40 mt-2">Component: {{ getNodeComponent(currentNodeType) }}</p>
					</div>
				</div>
			</div>

			<!-- Panel Footer - Actions -->
			<div class="panel-footer">
				<div class="footer-left">
					<div class="footer-info">
						<UIcon name="i-lucide-info" class="w-4 h-4 text-white/40" />
						<span class="text-xs text-white/60">
							{{ isEditMode ? 'Changes will be applied to the canvas node' : 'Node will be added to canvas after configuration' }}
						</span>
					</div>
					<div class="keyboard-shortcuts">
						<span class="shortcut-hint">
							<kbd>Esc</kbd> to close
						</span>
						<span class="shortcut-hint">
							<kbd>{{ isMac ? 'Cmd' : 'Ctrl' }}</kbd> + <kbd>S</kbd> to save
						</span>
					</div>
				</div>
				<div class="footer-actions">
					<button
						class="footer-btn cancel-btn"
						@click.stop="handleClose"
						@mousedown.stop
					>
						<UIcon name="i-lucide-x" class="w-4 h-4" />
						<span>Cancel</span>
					</button>
					<button
						class="footer-btn primary-btn"
						@click.stop="handleAddOrUpdate"
						@mousedown.stop
					>
						<UIcon :name="isEditMode ? 'i-lucide-save' : 'i-lucide-plus-circle'" class="w-4 h-4" />
						<span>{{ isEditMode ? 'Save Changes' : 'Add to Canvas' }}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, watch, ref, onMounted, onBeforeUnmount } from "vue";
	import { useNodeComponentRegistry } from "../composables/useNodeComponentRegistry";
	import { useNodeMetadata } from "../composables/useNodeMetadata";
	import ConfigPanelNodeWrapper from "./ConfigPanelNodeWrapper.vue";

	interface Props {
		isOpen: boolean;
		nodeType: string | null;
		nodeData: any;
		nodeId: string | null;
		mode: "create" | "edit";
		organizationId?: string;
		availableHooks?: any[];
		availableTransports?: any[];
		allHandlers?: any;
		canvasNodes?: any[];
		canvasEdges?: any[];
		canvasViewport?: any;
	}

	const props = withDefaults(defineProps<Props>(), {
		organizationId: undefined,
		availableHooks: () => [],
		availableTransports: () => [],
		allHandlers: () => ({}),
		canvasNodes: () => [],
		canvasEdges: () => [],
		canvasViewport: () => ({ x: 0, y: 0, zoom: 1 })
	});

	const emit = defineEmits<{
		close: [];
		addNode: [nodeType: string, nodeData: any];
		updateNode: [nodeId: string, nodeData: any];
		deleteNode: [nodeId: string];
	}>();

	// Get node component registry
	const { getNodeComponent: getRegisteredNodeComponent } = useNodeComponentRegistry();
	const { getNodeMetadata } = useNodeMetadata();

	// Local node data that can be edited
	const localNodeData = ref<any>({});

	// Track if user has made changes
	const hasChanges = ref(false);

	// Watch for prop changes to update local data
	watch(() => props.nodeData, (newData) => {
		if (newData) {
			localNodeData.value = { ...newData };
			hasChanges.value = false; // Reset changes flag when data changes
		}
	}, { immediate: true, deep: true });

	// Watch for panel open state
	watch(() => props.isOpen, (isOpen) => {
		console.log("═══════════════════════════════════════");
		console.log("👀 PANEL OPEN STATE CHANGED");
		console.log("  Is open:", isOpen);
		console.log("  Node type:", currentNodeType.value);
		console.log("  Has component:", !!getNodeComponent(currentNodeType.value));
		console.log("  Node data:", localNodeData.value);
		console.log("  Node props:", nodePropsForRenderer.value);
		console.log("═══════════════════════════════════════");
		
		if (!isOpen) {
			// Reset state when panel closes
			hasChanges.value = false;
		}
	});

	// Computed properties
	const currentNodeType = computed(() => props.nodeType);
	const isEditMode = computed(() => props.mode === "edit");

	const isMac = computed(() => {
		return typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
	});

	const panelTitle = computed(() => {
		const mode = isEditMode.value ? "Edit" : "Configure";
		const metadata = getNodeMetadata(currentNodeType.value || "");
		const nodeName = metadata?.name || currentNodeType.value || "Node";
		return `${mode} ${nodeName}`;
	});

	// Create node props object for renderer
	const nodePropsForRenderer = computed(() => ({
		id: props.nodeId || "temp-config-node",
		type: (currentNodeType.value || "unknown") as string,
		data: localNodeData.value,
		position: { x: 0, y: 0 }, // Not used in config panel
		selected: false, // Never show as selected in config panel
		draggable: false, // Not draggable in config panel
		selectable: false
	}));

	/**
	 * Get node component for rendering
	 */
	const getNodeComponent = (nodeType: string | null) => {
		if (!nodeType) {
			console.log("⚠️ getNodeComponent: No nodeType provided");
			return null;
		}
		
		const component = getRegisteredNodeComponent(nodeType);
		console.log("═══════════════════════════════════════");
		console.log("🔍 GET NODE COMPONENT");
		console.log("  Requested type:", nodeType);
		console.log("  Component found:", !!component);
		console.log("  Component name:", component?.name || component?.toString());
		console.log("═══════════════════════════════════════");
		
		return component;
	};

	/**
	 * Get node icon from metadata
	 */
	const getNodeIcon = (nodeType: string | null) => {
		if (!nodeType) return "i-lucide-box";
		const metadata = getNodeMetadata(nodeType);
		return metadata?.icon || "i-lucide-box";
	};

	/**
	 * Get panel subtitle based on mode and node type
	 */
	const getPanelSubtitle = () => {
		const metadata = getNodeMetadata(currentNodeType.value || "");
		if (isEditMode.value) {
			return metadata?.description || "Edit node configuration";
		}
		return metadata?.description || "Configure node before adding to canvas";
	};

	/**
	 * Update local node data (called by node components)
	 */
	const updateLocalNodeData = (nodeId: string, key: string, value: any) => {
		console.log("🔧 Updating local node data:", key, value);
		localNodeData.value[key] = value;
		hasChanges.value = true;
	};

	/**
	 * Handle keyboard shortcuts
	 */
	const handleKeyDown = (event: KeyboardEvent) => {
		console.log("⌨️ NodeConfigPanel key pressed:", event.key, "Panel open:", props.isOpen);
		
		if (!props.isOpen) return;

		// Only handle if we're the top-most modal (check z-index or document.activeElement)
		const panelElement = document.querySelector(".node-configuration-panel");
		if (!panelElement || !panelElement.contains(document.activeElement)) {
			console.log("  ℹ️ Ignoring - not focused on our panel");
			return;
		}

		// Escape key - force close panel (no confirmation)
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			console.log("🔑 Escape pressed - force closing NodeConfigPanel");
			hasChanges.value = false; // Reset changes flag
			emit("close"); // Direct close without confirmation
			return;
		}

		// Cmd/Ctrl + S - save/add
		if ((event.metaKey || event.ctrlKey) && event.key === "s") {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			console.log("🔑 Cmd/Ctrl+S pressed - saving");
			handleAddOrUpdate();
			return;
		}

		// Cmd/Ctrl + Enter - quick save
		if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			console.log("🔑 Cmd/Ctrl+Enter pressed - quick save");
			handleAddOrUpdate();
			return;
		}
	};

	/**
	 * Handle backdrop click (close panel)
	 */
	const handleBackdropClick = () => {
		console.log("═══════════════════════════════════════");
		console.log("🖱️ BACKDROP CLICKED");
		console.log("  Closing panel immediately");
		console.log("═══════════════════════════════════════");
		
		// Force close without confirmation on backdrop click
		hasChanges.value = false;
		emit("close");
		
		console.log("✅ Close event emitted from backdrop");
	};

	/**
	 * Handle close button
	 */
	const handleClose = () => {
		console.log("═══════════════════════════════════════");
		console.log("❌ CLOSE HANDLER CALLED");
		console.log("  Has changes:", hasChanges.value);
		console.log("  Is edit mode:", isEditMode.value);
		console.log("═══════════════════════════════════════");
		
		// No confirmation - just close immediately
		hasChanges.value = false;
		emit("close");
		
		console.log("✅ Close event emitted");
	};

	/**
	 * Handle node close event (from NodeController close button)
	 */
	const handleNodeClose = () => {
		console.log("═══════════════════════════════════════");
		console.log("🚪 NODE CLOSE EVENT RECEIVED");
		console.log("  Node Type:", currentNodeType.value);
		console.log("  Node ID:", props.nodeId);
		console.log("═══════════════════════════════════════");
		
		// Close the configuration panel
		handleClose();
	};

	/**
	 * Handle add to canvas or update node
	 */
	const handleAddOrUpdate = () => {
		if (isEditMode.value && props.nodeId) {
			console.log("💾 Saving changes to node:", props.nodeId);
			emit("updateNode", props.nodeId, localNodeData.value);
		} else if (currentNodeType.value) {
			console.log("➕ Adding new node to canvas:", currentNodeType.value);
			emit("addNode", currentNodeType.value, localNodeData.value);
		}
		
		// Reset changes and close immediately
		hasChanges.value = false;
		emit("close");
	};

	/**
	 * Handle delete node
	 */
	const handleDelete = () => {
		if (props.nodeId && isEditMode.value) {
			const confirmed = confirm("Are you sure you want to delete this node? This action cannot be undone.");
			if (!confirmed) return;
			
			console.log("🗑️ Deleting node:", props.nodeId);
			emit("deleteNode", props.nodeId);
			
			// Reset and close immediately
			hasChanges.value = false;
			emit("close");
		}
	};

	/**
	 * Helper functions for node components
	 */
	const getStatusClass = (status?: string): string => {
		switch (status) {
			case "active": return "text-green-400";
			case "configured": return "text-green-400";
			case "error": return "text-red-400";
			case "inactive":
			default: return "text-gray-400";
		}
	};

	const handleOpenTemplateModal = (nodeId: string) => {
		console.log("═══════════════════════════════════════");
		console.log("📝 OPEN TEMPLATE MODAL CALLED");
		console.log("  Node ID:", nodeId);
		console.log("  Has allHandlers:", !!props.allHandlers);
		console.log("  Has openTemplateCreationModal:", !!props.allHandlers?.openTemplateCreationModal);
		console.log("═══════════════════════════════════════");
		
		if (props.allHandlers?.openTemplateCreationModal) {
			console.log("✅ Calling openTemplateCreationModal from allHandlers");
			props.allHandlers.openTemplateCreationModal(nodeId);
		} else {
			console.error("❌ openTemplateCreationModal not found in allHandlers");
			console.log("  Available handlers:", Object.keys(props.allHandlers || {}));
		}
	};

	const handleTriggerTemplateChain = (nodeId: string) => {
		console.log("⚡ Trigger template chain:", nodeId);
		if (props.allHandlers?.triggerTemplateNodeChain) {
			props.allHandlers.triggerTemplateNodeChain(nodeId);
		}
	};

	const getCommandCategory = (commandName?: string): string => {
		if (!commandName) return "None";
		if (commandName.includes("Get-")) return "PowerShell";
		if (commandName.includes("npm")) return "Package Manager";
		return "Miscellaneous";
	};

	const handleOpenCommandSelector = (nodeId: string) => {
		console.log("💻 Open command selector:", nodeId);
		if (props.allHandlers?.openCommandSelector) {
			props.allHandlers.openCommandSelector(nodeId);
		}
	};

	const handleTestCommand = (nodeId: string) => {
		console.log("🧪 Test command:", nodeId);
	};

	const getEventCategory = (eventName?: string): string => {
		if (!eventName) return "None";
		if (eventName.startsWith("github:")) return "GitHub";
		if (eventName.startsWith("on")) return "User Events";
		return "Miscellaneous";
	};

	const handleOpenEventSelector = (nodeId: string) => {
		console.log("⚡ Open event selector:", nodeId);
		if (props.allHandlers?.openEventSelector) {
			props.allHandlers.openEventSelector(nodeId);
		}
	};

	const handleTestEvent = (nodeId: string) => {
		console.log("🧪 Test event:", nodeId);
	};

	/**
	 * Lifecycle: Setup keyboard listeners
	 */
	onMounted(() => {
		window.addEventListener("keydown", handleKeyDown);
		console.log("⌨️ NodeConfigurationPanel: Keyboard shortcuts enabled");
	});

	/**
	 * Lifecycle: Cleanup keyboard listeners
	 */
	onBeforeUnmount(() => {
		window.removeEventListener("keydown", handleKeyDown);
		console.log("🧹 NodeConfigurationPanel: Keyboard shortcuts removed");
	});
</script>

<style scoped>
.node-configuration-panel {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: fadeIn 0.2s ease-out;
	pointer-events: none; /* Allow clicks through to backdrop */
}

.node-configuration-panel > * {
	pointer-events: auto; /* Enable clicks on children */
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.panel-backdrop {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.75);
	backdrop-filter: blur(8px);
	animation: backdropFade 0.2s ease-out;
	pointer-events: auto;
	cursor: pointer;
}

@keyframes backdropFade {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.panel-container {
	position: relative;
	width: 90vw;
	max-width: 1400px;
	height: 85vh;
	max-height: 900px;
	background: rgba(0, 0, 0, 0.98);
	border: 2px solid rgba(255, 255, 255, 0.1);
	border-radius: 16px;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.4);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	pointer-events: auto;
	cursor: default;
}

.panel-container * {
	pointer-events: auto;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(40px) scale(0.96);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

/* Panel Header */
.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px;
	background: rgba(0, 0, 0, 0.6);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	flex-shrink: 0;
	pointer-events: auto;
}

.panel-header * {
	pointer-events: auto;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.header-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.panel-title {
	font-size: 1.5rem;
	font-weight: 700;
	color: white;
	margin: 0;
	letter-spacing: -0.02em;
}

.panel-subtitle {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.6);
	margin: 0;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.header-action-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.2s ease;
	pointer-events: auto;
	z-index: 10;
}

.header-action-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.2);
	color: white;
	transform: scale(1.05);
}

.header-action-btn.delete-btn:hover {
	background: rgba(239, 68, 68, 0.15);
	border-color: rgba(239, 68, 68, 0.3);
	color: rgba(239, 68, 68, 1);
}

.header-action-btn.close-btn:hover {
	background: rgba(255, 255, 255, 0.15);
	border-color: rgba(255, 255, 255, 0.3);
}

/* Panel Content */
.panel-content {
	flex: 1;
	overflow: auto;
	padding: 24px;
	background: rgba(0, 0, 0, 0.3);
	min-height: 0;
	pointer-events: auto; /* Ensure content is interactive */
}

.panel-content::-webkit-scrollbar {
	width: 12px;
}

.panel-content::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 6px;
}

.panel-content::-webkit-scrollbar-thumb {
	background: rgba(var(--color-primary-rgb), 0.4);
	border-radius: 6px;
	border: 2px solid rgba(0, 0, 0, 0.3);
}

.panel-content::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-primary-rgb), 0.6);
}

.node-configuration-wrapper {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	min-height: 100%;
	padding: 20px;
	pointer-events: auto; /* Enable all interactions */
	width: 100%;
}

/* Make nodes non-draggable and centered in config panel */
.node-configuration-wrapper :deep(.enhanced-node),
.node-configuration-wrapper :deep(.shape-node),
.node-configuration-wrapper :deep(.browser-node),
.node-configuration-wrapper :deep(.b-folder-setup-node),
.node-configuration-wrapper :deep([class*="-node"]) {
	cursor: default !important;
	transform: none !important;
	position: static !important;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
	pointer-events: auto !important; /* Ensure nodes are fully interactive */
}

/* Ensure all child elements are interactive */
.node-configuration-wrapper :deep(*) {
	pointer-events: auto !important;
}

/* Force all interactive elements to be clickable */
.node-configuration-wrapper :deep(button),
.node-configuration-wrapper :deep(input),
.node-configuration-wrapper :deep(select),
.node-configuration-wrapper :deep(textarea),
.node-configuration-wrapper :deep(a),
.node-configuration-wrapper :deep([role="button"]),
.node-configuration-wrapper :deep(.mode-button),
.node-configuration-wrapper :deep(.hook-item),
.node-configuration-wrapper :deep(.action-button) {
	pointer-events: auto !important;
	cursor: pointer !important;
	position: relative !important;
	z-index: 1 !important;
}

.node-configuration-wrapper :deep(input),
.node-configuration-wrapper :deep(textarea) {
	cursor: text !important;
}

/* Hide connection handles in config panel */
.node-configuration-wrapper :deep(.connection-handle) {
	display: none !important;
}

/* Hide node resizer in config panel */
.node-configuration-wrapper :deep(.vue-flow__resize-control) {
	display: none !important;
}

/* Ensure scrollable areas within nodes work */
.node-configuration-wrapper :deep(.hooks-list),
.node-configuration-wrapper :deep(.node-content-scrollable),
.node-configuration-wrapper :deep([class*="-list"]) {
	overflow-y: auto !important;
	overflow-x: hidden !important;
	pointer-events: auto !important;
}

/* Ensure dropdown menus and modals within nodes work */
.node-configuration-wrapper :deep(.dropdown),
.node-configuration-wrapper :deep(.modal),
.node-configuration-wrapper :deep([class*="modal"]),
.node-configuration-wrapper :deep([class*="dropdown"]) {
	pointer-events: auto !important;
	z-index: 100 !important;
}

.unknown-node-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80px 40px;
	text-align: center;
}

/* Panel Footer */
.panel-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: rgba(0, 0, 0, 0.3);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	flex-shrink: 0;
	pointer-events: auto;
}

.panel-footer * {
	pointer-events: auto;
}

.footer-left {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.footer-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.keyboard-shortcuts {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-left: 28px; /* Align with info icon */
}

.shortcut-hint {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.4);
}

.shortcut-hint kbd {
	padding: 2px 6px;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 4px;
	font-family: monospace;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.7);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.footer-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.footer-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 10px 20px;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
	pointer-events: auto;
	position: relative;
	z-index: 10;
}

.footer-btn.cancel-btn {
	background: rgba(107, 114, 128, 0.15);
	border-color: rgba(107, 114, 128, 0.3);
	color: rgba(255, 255, 255, 0.8);
}

.footer-btn.cancel-btn:hover {
	background: rgba(107, 114, 128, 0.25);
	border-color: rgba(107, 114, 128, 0.5);
	color: white;
	transform: translateY(-1px);
}

.footer-btn.primary-btn {
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.3), rgba(var(--color-primary-rgb), 0.2));
	border-color: rgba(var(--color-primary-rgb), 0.5);
	color: white;
	box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.footer-btn.primary-btn:hover {
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.4), rgba(var(--color-primary-rgb), 0.3));
	border-color: var(--color-primary);
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.3);
}

.footer-btn:active {
	transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 1200px) {
	.panel-container {
		width: 95vw;
		height: 90vh;
	}
}

@media (max-height: 700px) {
	.panel-container {
		height: 95vh;
	}

	.panel-header {
		padding: 16px 20px;
	}

	.panel-content {
		padding: 16px;
	}
}
</style>


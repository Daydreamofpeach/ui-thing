/**
 * Organization Store - Multi-Tenant Canvas Management
 *
 * Top-level store that manages:
 * - Master canvas (full organization state)
 * - Multiple views (filtered versions)
 * - View permissions and access control
 * - View switching and filtering
 *
 * @phase Phase 4 - Multi-Tenancy
 * @created October 28, 2025
 */

import type { CanvasState } from "../core/types";
import type { OrganizationContext } from "./types";
import { computed } from "vue";
import { useCanvasStateStore } from "../core/useCanvasStateStore";
import { useEdgeStore } from "../core/useEdgeStore";
import { useNodeStore } from "../core/useNodeStore";
import { useViewStore } from "./useViewStore";

/**
 * Create organization store instance
 */
export function useOrganizationStore(
	organizationId: string,
	userId: string,
	organizationName?: string
) {
	console.log("🏢 Initializing Organization Store");
	console.log("  Organization:", organizationId);
	console.log("  User:", userId);

	// ============================================================================
	// CONTEXT
	// ============================================================================

	const context: OrganizationContext = {
		organizationId,
		organizationName,
		ownerId: userId,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};

	// ============================================================================
	// SUB-STORES
	// ============================================================================

	/** Master canvas store (full unfiltered state) */
	const masterStore = useCanvasStateStore();

	/** View store (manages filtered views) */
	const viewStore = useViewStore(organizationId, userId);

	/** Node store (enhanced operations) */
	const nodeStore = useNodeStore();

	/** Edge store (enhanced operations) */
	const edgeStore = useEdgeStore();

	// Initialize master view
	const masterView = viewStore.initializeWithMaster();

	// ============================================================================
	// COMPUTED - ACTIVE CANVAS
	// ============================================================================

	/**
	 * Current canvas (filtered by active view)
	 * This is what should be rendered in the UI
	 */
	const currentCanvas = computed((): CanvasState => {
		// Get master state as CanvasState (with Maps)
		const masterState: CanvasState = {
			nodes: new Map(masterStore.nodes.value.map((n: any) => [n.id, n])),
			edges: new Map(masterStore.edges.value.map((e: any) => [e.id, e])),
			positions: new Map(masterStore.nodes.value.map((n: any) => [n.id, n.position])),
			viewport: masterStore.viewport.value,
			organizationId,
			viewId: viewStore.activeViewId.value || undefined,
			name: masterStore.canvasName.value
		};

		// If no active view, show master
		if (!viewStore.activeView.value) {
			return masterState;
		}

		// Apply view filters
		return viewStore.getFilteredCanvas(masterState);
	});

	/**
	 * Current nodes (filtered by view)
	 */
	const currentNodes = computed(() => {
		return Array.from(currentCanvas.value.nodes.values()).map((node) => ({
			...node,
			position: currentCanvas.value.positions.get(node.id) || { x: 0, y: 0 }
		}));
	});

	/**
	 * Current edges (filtered by view)
	 */
	const currentEdges = computed(() => {
		return Array.from(currentCanvas.value.edges.values());
	});

	// ============================================================================
	// VIEW MANAGEMENT
	// ============================================================================

	/**
	 * Create a new view
	 */
	const createNewView = (name: string, description?: string) => {
		console.log("🏢 Org Store: Creating new view:", name);
		return viewStore.createView(name, description, false);
	};

	/**
	 * Switch to a different view
	 */
	const switchToView = (viewId: string | null): boolean => {
		console.log("🏢 Org Store: Switching to view:", viewId || "master");
		return viewStore.setActiveView(viewId);
	};

	/**
	 * Switch to master view
	 */
	const switchToMaster = (): boolean => {
		console.log("🏢 Org Store: Switching to master view");
		return viewStore.setActiveView(masterView.id);
	};

	/**
	 * Update current view's visibility
	 */
	const updateViewVisibility = (
		visibleNodeIds?: string[],
		hiddenNodeIds?: string[]
	): boolean => {
		if (!viewStore.activeView.value) {
			console.warn("⚠️ No active view to update");
			return false;
		}

		return viewStore.updateView(viewStore.activeView.value.id, {
			visibleNodeIds,
			hiddenNodeIds
		});
	};

	/**
	 * Save current viewport to view
	 */
	const saveViewportToView = (): boolean => {
		if (!viewStore.activeView.value) {
			console.warn("⚠️ No active view to update");
			return false;
		}

		const currentViewport = masterStore.viewport.value;

		return viewStore.updateView(viewStore.activeView.value.id, {
			viewportOverride: {
				x: currentViewport.x,
				y: currentViewport.y,
				zoom: currentViewport.zoom
			}
		});
	};

	// ============================================================================
	// MASTER CANVAS OPERATIONS
	// ============================================================================

	/**
	 * Add node to master canvas
	 * (Will be visible in views based on their filters)
	 */
	const addNodeToMaster = (node: any, position: any) => {
		console.log("🏢 Org Store: Adding node to master canvas");
		nodeStore.addNode(node, position);

		// Sync to master store
		masterStore.addNode(node, position);
	};

	/**
	 * Update node in master canvas
	 */
	const updateNodeInMaster = (nodeId: string, updates: any) => {
		console.log("🏢 Org Store: Updating node in master canvas:", nodeId);
		nodeStore.updateNodeData(nodeId, updates);

		// Sync to master store
		Object.keys(updates).forEach((key) => {
			masterStore.updateNodeData(nodeId, key, updates[key]);
		});
	};

	/**
	 * Remove node from master canvas
	 */
	const removeNodeFromMaster = (nodeId: string) => {
		console.log("🏢 Org Store: Removing node from master canvas:", nodeId);
		nodeStore.removeNode(nodeId);
		masterStore.removeNode(nodeId);
	};

	/**
	 * Add edge to master canvas
	 */
	const addEdgeToMaster = (edge: any) => {
		console.log("🏢 Org Store: Adding edge to master canvas");
		edgeStore.addEdge(edge);
		masterStore.addEdge(edge);
	};

	// ============================================================================
	// EXPORT / IMPORT
	// ============================================================================

	/**
	 * Export organization state (master + all views)
	 */
	const exportOrganizationState = () => {
		return {
			context,
			masterCanvas: masterStore.exportState(),
			views: Array.from(viewStore.views.value),
			exportedAt: Date.now(),
			version: "1.0.0"
		};
	};

	/**
	 * Import organization state
	 */
	const importOrganizationState = (state: ReturnType<typeof exportOrganizationState>) => {
		console.log("🏢 Org Store: Importing organization state");

		// Load master canvas
		masterStore.loadCanvasState(state.masterCanvas);

		// Load views
		viewStore.loadViews(state.views);

		console.log("✅ Organization state imported");
	};

	// ============================================================================
	// STATISTICS
	// ============================================================================

	/**
	 * Get organization statistics
	 */
	const getStats = () => {
		return {
			organizationId,
			masterNodes: masterStore.nodes.value.length,
			masterEdges: masterStore.edges.value.length,
			currentNodes: currentNodes.value.length,
			currentEdges: currentEdges.value.length,
			totalViews: viewStore.views.value.length,
			activeViewId: viewStore.activeViewId.value,
			viewStats: viewStore.getStats()
		};
	};

	// ============================================================================
	// RETURN PUBLIC API
	// ============================================================================
	return {
		// Context
		context,

		// Master canvas access
		masterStore,
		masterView,

		// Current filtered canvas (what UI should render)
		currentCanvas,
		currentNodes,
		currentEdges,

		// View management
		viewStore,
		createNewView,
		switchToView,
		switchToMaster,
		updateViewVisibility,
		saveViewportToView,

		// Master canvas operations
		addNodeToMaster,
		updateNodeInMaster,
		removeNodeFromMaster,
		addEdgeToMaster,

		// Export/Import
		exportOrganizationState,
		importOrganizationState,

		// Statistics
		getStats
	};
}

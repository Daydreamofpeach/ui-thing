/**
 * View Store - Canvas View Management
 *
 * Manages multiple views of the same master canvas.
 * Each view can have:
 * - Different node visibility
 * - Different viewport
 * - Different permissions
 *
 * @phase Phase 4 - Multi-Tenancy
 * @created October 28, 2025
 */

import type { CanvasState } from "../core/types";
import type { CanvasView } from "./types";
import { computed, ref } from "vue";
import { checkViewAccess, createDefaultPermissions } from "./useViewPermissions";

/**
 * Create view store for an organization
 */
export function useViewStore(organizationId: string, userId: string) {
	console.log("👁️ Initializing View Store");
	console.log("  Organization:", organizationId);
	console.log("  User:", userId);

	// ============================================================================
	// PRIVATE STATE
	// ============================================================================

	/** All views for this organization */
	const _views = ref(new Map<string, CanvasView>());

	/** Currently active view ID */
	const _activeViewId = ref<string | null>(null);

	/** User's group IDs (for permission checks) */
	const _userGroupIds = ref<string[]>([]);

	// ============================================================================
	// COMPUTED
	// ============================================================================

	/**
	 * All views as array
	 */
	const views = computed(() => Array.from(_views.value.values()));

	/**
	 * Active view
	 */
	const activeView = computed(() => {
		if (!_activeViewId.value) return null;
		return _views.value.get(_activeViewId.value) || null;
	});

	/**
	 * Master view (always exists)
	 */
	const masterView = computed(() => {
		return views.value.find((v) => v.isMaster) || null;
	});

	/**
	 * Views accessible to current user
	 */
	const accessibleViews = computed(() => {
		return views.value.filter((view) => {
			const access = checkViewAccess(view, userId, _userGroupIds.value);
			return access.canView;
		});
	});

	/**
	 * Views owned by current user
	 */
	const ownedViews = computed(() => {
		return views.value.filter((view) => view.permissions.ownerId === userId);
	});

	// ============================================================================
	// GETTERS
	// ============================================================================

	/**
	 * Get view by ID
	 */
	const getView = (viewId: string): CanvasView | undefined => {
		return _views.value.get(viewId);
	};

	/**
	 * Check if user can access view
	 */
	const canAccessView = (viewId: string): boolean => {
		const view = _views.value.get(viewId);
		if (!view) return false;

		const access = checkViewAccess(view, userId, _userGroupIds.value);
		return access.canView;
	};

	/**
	 * Get access level for view
	 */
	const getAccessLevel = (viewId: string) => {
		const view = _views.value.get(viewId);
		if (!view) return null;

		return checkViewAccess(view, userId, _userGroupIds.value);
	};

	// ============================================================================
	// MUTATIONS - View CRUD
	// ============================================================================

	/**
	 * Create a new view
	 */
	const createView = (
		name: string,
		description?: string,
		isMaster: boolean = false
	): CanvasView => {
		console.log("👁️ Creating new view:", name);

		const viewId = `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const newView: CanvasView = {
			id: viewId,
			name,
			description,
			organizationId,
			isMaster,
			permissions: createDefaultPermissions(userId),
			createdBy: userId,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		_views.value.set(viewId, newView);

		console.log("✅ View created:", viewId);
		return newView;
	};

	/**
	 * Update view metadata
	 */
	const updateView = (
		viewId: string,
		updates: Partial<Pick<CanvasView, "name" | "description" | "visibleNodeIds" | "hiddenNodeIds" | "viewportOverride">>
	): boolean => {
		const view = _views.value.get(viewId);
		if (!view) {
			console.warn("⚠️ View not found:", viewId);
			return false;
		}

		// Check permissions
		const access = checkViewAccess(view, userId, _userGroupIds.value);
		if (!access.canEdit) {
			console.warn("⚠️ User cannot edit this view");
			return false;
		}

		console.log("👁️ Updating view:", viewId);

		_views.value.set(viewId, {
			...view,
			...updates,
			updatedAt: Date.now()
		});

		console.log("✅ View updated");
		return true;
	};

	/**
	 * Delete a view
	 */
	const deleteView = (viewId: string): boolean => {
		const view = _views.value.get(viewId);
		if (!view) {
			console.warn("⚠️ View not found:", viewId);
			return false;
		}

		// Cannot delete master view
		if (view.isMaster) {
			console.error("❌ Cannot delete master view");
			return false;
		}

		// Check permissions
		const access = checkViewAccess(view, userId, _userGroupIds.value);
		if (!access.canDelete) {
			console.warn("⚠️ User cannot delete this view");
			return false;
		}

		console.log("👁️ Deleting view:", viewId);

		const deleted = _views.value.delete(viewId);

		if (deleted) {
			// Clear active view if it was deleted
			if (_activeViewId.value === viewId) {
				_activeViewId.value = masterView.value?.id || null;
			}

			console.log("✅ View deleted");
		}

		return deleted;
	};

	// ============================================================================
	// VIEW ACTIVATION
	// ============================================================================

	/**
	 * Set active view
	 */
	const setActiveView = (viewId: string | null): boolean => {
		if (viewId === null) {
			console.log("👁️ Clearing active view");
			_activeViewId.value = null;
			return true;
		}

		const view = _views.value.get(viewId);
		if (!view) {
			console.warn("⚠️ View not found:", viewId);
			return false;
		}

		// Check permissions
		if (!canAccessView(viewId)) {
			console.warn("⚠️ User cannot access this view");
			return false;
		}

		console.log("👁️ Setting active view:", view.name);
		_activeViewId.value = viewId;

		// Update last accessed timestamp
		_views.value.set(viewId, {
			...view,
			lastAccessedAt: Date.now()
		});

		return true;
	};

	// ============================================================================
	// VIEW FILTERING
	// ============================================================================

	/**
	 * Apply view filters to canvas state
	 * Returns a filtered version of the canvas
	 */
	const applyViewFilters = (
		canvasState: CanvasState,
		view: CanvasView
	): CanvasState => {
		console.log("🔍 Applying view filters:", view.name);

		// Start with all nodes
		let filteredNodes = new Map(canvasState.nodes);

		// Apply visible nodes filter
		if (view.visibleNodeIds && view.visibleNodeIds.length > 0) {
			filteredNodes = new Map(
				Array.from(filteredNodes.entries()).filter(([nodeId]) =>
					view.visibleNodeIds!.includes(nodeId)
				)
			);
		}

		// Apply hidden nodes filter
		if (view.hiddenNodeIds && view.hiddenNodeIds.length > 0) {
			filteredNodes = new Map(
				Array.from(filteredNodes.entries()).filter(([nodeId]) =>
					!view.hiddenNodeIds!.includes(nodeId)
				)
			);
		}

		// Filter edges (only show edges between visible nodes)
		const visibleNodeIds = new Set(filteredNodes.keys());
		const filteredEdges = new Map(
			Array.from(canvasState.edges.entries()).filter(([, edge]) =>
				visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
			)
		);

		// Filter positions (only for visible nodes)
		const filteredPositions = new Map(
			Array.from(canvasState.positions.entries()).filter(([nodeId]) =>
				visibleNodeIds.has(nodeId)
			)
		);

		// Apply viewport override if set
		const viewport = view.viewportOverride || canvasState.viewport;

		console.log("✅ View filters applied");
		console.log("  Nodes:", filteredNodes.size, "/", canvasState.nodes.size);
		console.log("  Edges:", filteredEdges.size, "/", canvasState.edges.size);

		return {
			...canvasState,
			nodes: filteredNodes,
			edges: filteredEdges,
			positions: filteredPositions,
			viewport,
			viewId: view.id
		};
	};

	/**
	 * Get filtered canvas for active view
	 */
	const getFilteredCanvas = (masterCanvas: CanvasState): CanvasState => {
		if (!activeView.value) {
			console.log("ℹ️ No active view, returning master canvas");
			return masterCanvas;
		}

		return applyViewFilters(masterCanvas, activeView.value);
	};

	// ============================================================================
	// VIEW FORKING
	// ============================================================================

	/**
	 * Fork a view (create a copy)
	 */
	const forkView = (
		sourceViewId: string,
		newName: string
	): CanvasView | null => {
		const sourceView = _views.value.get(sourceViewId);
		if (!sourceView) {
			console.warn("⚠️ Source view not found:", sourceViewId);
			return null;
		}

		// Check fork permission
		const access = checkViewAccess(sourceView, userId, _userGroupIds.value);
		if (!access.canFork) {
			console.warn("⚠️ User cannot fork this view");
			return null;
		}

		console.log("🍴 Forking view:", sourceView.name, "→", newName);

		const forkedView: CanvasView = {
			...sourceView,
			id: `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name: newName,
			description: `Forked from: ${sourceView.name}`,
			parentViewId: sourceViewId,
			isMaster: false,
			permissions: createDefaultPermissions(userId),
			createdBy: userId,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		_views.value.set(forkedView.id, forkedView);

		console.log("✅ View forked:", forkedView.id);
		return forkedView;
	};

	// ============================================================================
	// BULK OPERATIONS
	// ============================================================================

	/**
	 * Load views from storage
	 */
	const loadViews = (views: CanvasView[]) => {
		console.log("👁️ Loading views:", views.length);

		_views.value.clear();
		views.forEach((view) => {
			_views.value.set(view.id, view);
		});

		console.log("✅ Views loaded");
	};

	/**
	 * Clear all views
	 */
	const clearAll = () => {
		console.log("👁️ Clearing all views");
		_views.value.clear();
		_activeViewId.value = null;
	};

	/**
	 * Initialize with master view
	 */
	const initializeWithMaster = (): CanvasView => {
		console.log("👁️ Initializing with master view");

		const master = createView("Master Canvas", "Organization master canvas", true);
		_activeViewId.value = master.id;

		console.log("✅ Master view initialized");
		return master;
	};

	// ============================================================================
	// USER GROUP MANAGEMENT
	// ============================================================================

	/**
	 * Set user's group memberships
	 */
	const setUserGroups = (groupIds: string[]) => {
		console.log("👥 Setting user groups:", groupIds);
		_userGroupIds.value = groupIds;
	};

	// ============================================================================
	// STATISTICS
	// ============================================================================

	/**
	 * Get view statistics
	 */
	const getStats = () => {
		return {
			totalViews: _views.value.size,
			accessibleViews: accessibleViews.value.length,
			ownedViews: ownedViews.value.length,
			activeViewId: _activeViewId.value,
			masterViewId: masterView.value?.id || null
		};
	};

	// ============================================================================
	// RETURN PUBLIC API
	// ============================================================================
	return {
		// State (read-only)
		views,
		activeView,
		masterView,
		accessibleViews,
		ownedViews,
		activeViewId: computed(() => _activeViewId.value),

		// Getters
		getView,
		canAccessView,
		getAccessLevel,

		// View CRUD
		createView,
		updateView,
		deleteView,

		// View activation
		setActiveView,

		// Filtering
		applyViewFilters,
		getFilteredCanvas,

		// Forking
		forkView,

		// Bulk operations
		loadViews,
		clearAll,
		initializeWithMaster,

		// User groups
		setUserGroups,

		// Statistics
		getStats
	};
}

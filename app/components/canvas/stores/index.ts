/**
 * Canvas Stores - Public API
 *
 * This file exports all store modules and types for use throughout the application.
 * Import stores from here to ensure consistent usage.
 *
 * @example
 * ```typescript
 * import { useCanvasStateStore } from '~/components/canvas/stores'
 *
 * const store = useCanvasStateStore()
 * store.addNode({ id: 'node-1', type: 'rectangle', data: {} }, { x: 100, y: 100 })
 * ```
 *
 * @phase Phase 1 - Foundation
 * @created October 28, 2025
 */

// ============================================================================
// TYPES
// ============================================================================
export type {
	CanvasState,
	EdgeState,
	NodeState,
	Position,
	StoreMutation,
	ViewportState,
	VueFlowNode
} from "./core/types";

export { useCanvasStatePersistence } from "./core/useCanvasStatePersistence";
// ============================================================================
// CORE STORES
// ============================================================================
export {
	createIsolatedCanvasStore,
	resetGlobalStore,
	useCanvasStateStore
} from "./core/useCanvasStateStore";
export { useEdgeStore } from "./core/useEdgeStore";
export { useNodeStore } from "./core/useNodeStore";
// Phase 2: Position Management
export { usePositionStore } from "./core/usePositionStore";

// Phase 3 & 4: Persistence and Multi-Tenancy
export type * from "./organization/types";
export { useOrganizationStore } from "./organization/useOrganizationStore";
export * from "./organization/useViewPermissions";
export { useViewStore } from "./organization/useViewStore";
export type * from "./persistence/types";
export { useAutoSave, watchCanvasForChanges } from "./persistence/useAutoSave";
export { useLocalStorageFallback } from "./persistence/useLocalStorageFallback";
export { deserializeCanvasState, generateStorageKey, serializeCanvasState, useStorageAdapter } from "./persistence/useStorageAdapter";
export { useTauriPersistence } from "./persistence/useTauriPersistence";

// Phase 5: API Sync
// export { useSyncQueue } from './sync/useSyncQueue'
// export { useOptimisticUpdates } from './sync/useOptimisticUpdates'
// export { useApiSync } from './sync/useApiSync'

// Phase 6: Permissions
// export { usePermissionStore } from './organization/usePermissionStore'
// export { useViewAccessControl } from './organization/useViewAccessControl'

// Phase 7: Migration
// export { useLegacyAdapter } from '../migration/useLegacyAdapter'

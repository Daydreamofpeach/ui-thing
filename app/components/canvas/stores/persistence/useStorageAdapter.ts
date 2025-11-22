/**
 * Unified Storage Adapter
 *
 * Automatically selects the best storage backend:
 * - Tauri store (preferred when available)
 * - localStorage (fallback for web)
 *
 * Provides a consistent interface regardless of backend.
 *
 * @phase Phase 3 - Persistence
 * @created October 28, 2025
 */

import type { CanvasState, EdgeState, NodeState, Position } from "../core/types";
import type { SerializableCanvasState, StorageAdapter } from "./types";
import { useLocalStorageFallback } from "./useLocalStorageFallback";
import { useTauriPersistence } from "./useTauriPersistence";

let activeAdapter: StorageAdapter | null = null;
let adapterType: "tauri" | "localStorage" | null = null;

/**
 * Get or initialize the storage adapter
 */
export async function useStorageAdapter(): Promise<StorageAdapter> {
	// Return cached adapter if already initialized
	if (activeAdapter) {
		return activeAdapter;
	}

	console.log("🔍 Detecting available storage backend...");

	// Try Tauri first (preferred)
	const tauriAdapter = useTauriPersistence();
	const tauriAvailable = await tauriAdapter.isAvailable();

	if (tauriAvailable) {
		console.log("✅ Using Tauri Store (native storage)");
		activeAdapter = tauriAdapter;
		adapterType = "tauri";
		return activeAdapter;
	}

	// Fallback to localStorage
	const localStorageAdapter = useLocalStorageFallback();
	const localStorageAvailable = await localStorageAdapter.isAvailable();

	if (localStorageAvailable) {
		console.log("✅ Using LocalStorage (web fallback)");
		activeAdapter = localStorageAdapter;
		adapterType = "localStorage";
		return activeAdapter;
	}

	// No storage available - throw error
	throw new Error("No storage backend available (Tauri and localStorage both failed)");
}

/**
 * Get current adapter type
 */
export function getAdapterType(): "tauri" | "localStorage" | null {
	return adapterType;
}

/**
 * Reset adapter (for testing)
 */
export function resetAdapter(): void {
	console.log("🔄 Resetting storage adapter");
	activeAdapter = null;
	adapterType = null;
}

/**
 * Convert CanvasState (Maps) to SerializableCanvasState (Arrays)
 */
export function serializeCanvasState(state: CanvasState): SerializableCanvasState {
	return {
		nodes: Array.from(state.nodes.entries()).map(([id, node]) => ({
			id,
			data: node
		})),
		edges: Array.from(state.edges.entries()).map(([id, edge]) => ({
			id,
			data: edge
		})),
		positions: Array.from(state.positions.entries()).map(([nodeId, pos]) => ({
			nodeId,
			x: pos.x,
			y: pos.y
		})),
		viewport: state.viewport,
		organizationId: state.organizationId,
		viewId: state.viewId,
		name: state.name,
		timestamp: Date.now()
	};
}

/**
 * Convert SerializableCanvasState (Arrays) back to CanvasState (Maps)
 */
export function deserializeCanvasState(serialized: SerializableCanvasState): CanvasState {
	const nodes = new Map<string, NodeState>();
	serialized.nodes.forEach(({ id, data }) => {
		nodes.set(id, data as NodeState);
	});

	const edges = new Map<string, EdgeState>();
	serialized.edges.forEach(({ id, data }) => {
		edges.set(id, data as EdgeState);
	});

	const positions = new Map<string, Position>();
	serialized.positions.forEach(({ nodeId, x, y }) => {
		positions.set(nodeId, { x, y });
	});

	return {
		nodes,
		edges,
		positions,
		viewport: serialized.viewport,
		organizationId: serialized.organizationId,
		viewId: serialized.viewId,
		name: serialized.name
	};
}

/**
 * Generate storage key from organization and view
 */
export function generateStorageKey(organizationId: string, viewId?: string): string {
	if (viewId) {
		return `canvas-${organizationId}-view-${viewId}`;
	}
	return `canvas-${organizationId}-master`;
}


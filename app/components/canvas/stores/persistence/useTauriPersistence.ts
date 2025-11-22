/**
 * Tauri Persistence Adapter
 *
 * Uses Tauri's native store plugin for persistent storage.
 * This is the preferred storage method when running as a Tauri app.
 *
 * @phase Phase 3 - Persistence
 * @created October 28, 2025
 */

import type { SerializableCanvasState, StorageAdapter } from "./types";

// @ts-ignore - Tauri store plugin
const Store = (window as any).__TAURI__?.store;

/**
 * Create Tauri-based storage adapter
 */
export function useTauriPersistence(): StorageAdapter {
	console.log("💾 Initializing Tauri Persistence Adapter");

	/**
	 * Check if Tauri store is available
	 */
	const isAvailable = async (): Promise<boolean> => {
		try {
			if (!Store) {
				console.warn("⚠️ Tauri store not available");
				return false;
			}

			// Try to create a test store to verify it works
			const testStore = new Store("buildit-canvas-test.dat");
			await testStore.set("test", "ok");
			const testValue = await testStore.get("test");

			const available = testValue === "ok";
			console.log("✅ Tauri store available:", available);
			return available;
		} catch (error) {
			console.error("❌ Tauri store check failed:", error);
			return false;
		}
	};

	/**
	 * Get store instance for organization
	 */
	const getStoreInstance = (organizationId: string) => {
		if (!Store) {
			throw new Error("Tauri store not available");
		}

		// Each organization gets its own store file
		const storeFileName = `buildit-canvas-${organizationId}.dat`;
		return new Store(storeFileName);
	};

	/**
	 * Generate storage key
	 */
	const generateKey = (organizationId: string, viewId?: string): string => {
		if (viewId) {
			return `canvas-${organizationId}-view-${viewId}`;
		}
		return `canvas-${organizationId}-master`;
	};

	/**
	 * Save canvas state to Tauri store
	 */
	const save = async (key: string, state: SerializableCanvasState): Promise<boolean> => {
		try {
			console.log("💾 Tauri: Saving canvas state:", key);
			console.log("  Nodes:", state.nodes.length);
			console.log("  Edges:", state.edges.length);
			console.log("  Positions:", state.positions.length);

			const storeInstance = getStoreInstance(state.organizationId);

			// Save state with metadata
			const dataToSave = {
				...state,
				savedAt: Date.now(),
				version: "1.0.0" // For future migration compatibility
			};

			await storeInstance.set(key, dataToSave);

			console.log("✅ Tauri: Canvas state saved successfully");
			return true;
		} catch (error) {
			console.error("❌ Tauri: Failed to save canvas state:", error);
			return false;
		}
	};

	/**
	 * Load canvas state from Tauri store
	 */
	const load = async (key: string): Promise<SerializableCanvasState | null> => {
		try {
			console.log("💾 Tauri: Loading canvas state:", key);

			// Extract organization ID from key
			const orgIdMatch = key.match(/canvas-([^-]+)/);
			if (!orgIdMatch) {
				console.error("❌ Tauri: Invalid key format:", key);
				return null;
			}

			const organizationId = orgIdMatch[1];
			const storeInstance = getStoreInstance(organizationId);

			const data = await storeInstance.get(key);

			if (!data) {
				console.log("ℹ️ Tauri: No saved state found for key:", key);
				return null;
			}

			console.log("✅ Tauri: Canvas state loaded successfully");
			console.log("  Nodes:", data.nodes?.length || 0);
			console.log("  Edges:", data.edges?.length || 0);

			return data as SerializableCanvasState;
		} catch (error) {
			console.error("❌ Tauri: Failed to load canvas state:", error);
			return null;
		}
	};

	/**
	 * Delete canvas state from Tauri store
	 */
	const deleteState = async (key: string): Promise<boolean> => {
		try {
			console.log("💾 Tauri: Deleting canvas state:", key);

			const orgIdMatch = key.match(/canvas-([^-]+)/);
			if (!orgIdMatch) {
				console.error("❌ Tauri: Invalid key format:", key);
				return false;
			}

			const organizationId = orgIdMatch[1];
			const storeInstance = getStoreInstance(organizationId);

			await storeInstance.delete(key);

			console.log("✅ Tauri: Canvas state deleted");
			return true;
		} catch (error) {
			console.error("❌ Tauri: Failed to delete canvas state:", error);
			return false;
		}
	};

	/**
	 * List all saved canvases for an organization
	 */
	const listKeys = async (organizationId?: string): Promise<string[]> => {
		try {
			if (!organizationId) {
				console.warn("⚠️ Tauri: Organization ID required to list keys");
				return [];
			}

			console.log("💾 Tauri: Listing canvas keys for org:", organizationId);

			const storeInstance = getStoreInstance(organizationId);
			const allKeys = await storeInstance.keys();

			// Filter keys that match canvas pattern
			const canvasKeys = allKeys.filter((key: string) =>
				key.startsWith("canvas-") && key.includes(organizationId)
			);

			console.log("✅ Tauri: Found", canvasKeys.length, "saved canvases");
			return canvasKeys;
		} catch (error) {
			console.error("❌ Tauri: Failed to list keys:", error);
			return [];
		}
	};

	return {
		save,
		load,
		delete: deleteState,
		listKeys,
		isAvailable
	};
}


/**
 * LocalStorage Fallback Adapter
 *
 * Uses browser's localStorage as fallback when Tauri store is not available.
 * Works in web/browser environments.
 *
 * @phase Phase 3 - Persistence
 * @created October 28, 2025
 */

import type { SerializableCanvasState, StorageAdapter } from "./types";

/**
 * Create localStorage-based storage adapter
 */
export function useLocalStorageFallback(): StorageAdapter {
	console.log("💾 Initializing LocalStorage Fallback Adapter");

	const STORAGE_PREFIX = "buildit-canvas";

	/**
	 * Check if localStorage is available
	 */
	const isAvailable = async (): Promise<boolean> => {
		try {
			if (typeof window === "undefined" || !window.localStorage) {
				return false;
			}

			// Test localStorage
			const testKey = `${STORAGE_PREFIX}-test`;
			window.localStorage.setItem(testKey, "ok");
			const testValue = window.localStorage.getItem(testKey);
			window.localStorage.removeItem(testKey);

			const available = testValue === "ok";
			console.log("✅ LocalStorage available:", available);
			return available;
		} catch (error) {
			console.error("❌ LocalStorage check failed:", error);
			return false;
		}
	};

	/**
	 * Generate full storage key
	 */
	const getFullKey = (key: string): string => {
		return `${STORAGE_PREFIX}-${key}`;
	};

	/**
	 * Save canvas state to localStorage
	 */
	const save = async (key: string, state: SerializableCanvasState): Promise<boolean> => {
		try {
			console.log("💾 LocalStorage: Saving canvas state:", key);
			console.log("  Nodes:", state.nodes.length);
			console.log("  Edges:", state.edges.length);

			const fullKey = getFullKey(key);

			// Save state with metadata
			const dataToSave = {
				...state,
				savedAt: Date.now(),
				version: "1.0.0"
			};

			const serialized = JSON.stringify(dataToSave);

			// Check size (localStorage has ~5-10MB limit)
			const sizeKB = new Blob([serialized]).size / 1024;
			if (sizeKB > 5000) {
				console.warn(`⚠️ LocalStorage: Large state size: ${sizeKB.toFixed(2)} KB`);
			}

			window.localStorage.setItem(fullKey, serialized);

			console.log("✅ LocalStorage: Canvas state saved successfully");
			console.log(`  Size: ${sizeKB.toFixed(2)} KB`);
			return true;
		} catch (error) {
			console.error("❌ LocalStorage: Failed to save canvas state:", error);

			// Handle quota exceeded error
			if (error instanceof DOMException && error.name === "QuotaExceededError") {
				console.error("❌ LocalStorage quota exceeded - consider cleanup");
			}

			return false;
		}
	};

	/**
	 * Load canvas state from localStorage
	 */
	const load = async (key: string): Promise<SerializableCanvasState | null> => {
		try {
			console.log("💾 LocalStorage: Loading canvas state:", key);

			const fullKey = getFullKey(key);
			const serialized = window.localStorage.getItem(fullKey);

			if (!serialized) {
				console.log("ℹ️ LocalStorage: No saved state found for key:", key);
				return null;
			}

			const data = JSON.parse(serialized);

			console.log("✅ LocalStorage: Canvas state loaded successfully");
			console.log("  Nodes:", data.nodes?.length || 0);
			console.log("  Edges:", data.edges?.length || 0);

			return data as SerializableCanvasState;
		} catch (error) {
			console.error("❌ LocalStorage: Failed to load canvas state:", error);
			return null;
		}
	};

	/**
	 * Delete canvas state from localStorage
	 */
	const deleteState = async (key: string): Promise<boolean> => {
		try {
			console.log("💾 LocalStorage: Deleting canvas state:", key);

			const fullKey = getFullKey(key);
			window.localStorage.removeItem(fullKey);

			console.log("✅ LocalStorage: Canvas state deleted");
			return true;
		} catch (error) {
			console.error("❌ LocalStorage: Failed to delete canvas state:", error);
			return false;
		}
	};

	/**
	 * List all saved canvas keys for an organization
	 */
	const listKeys = async (organizationId?: string): Promise<string[]> => {
		try {
			console.log("💾 LocalStorage: Listing canvas keys for org:", organizationId);

			const allKeys: string[] = [];

			// Iterate through all localStorage keys
			for (let i = 0; i < window.localStorage.length; i++) {
				const key = window.localStorage.key(i);
				if (key && key.startsWith(STORAGE_PREFIX)) {
					// Remove prefix for return value
					const shortKey = key.replace(`${STORAGE_PREFIX}-`, "");

					// Filter by organization if provided
					if (!organizationId || shortKey.includes(organizationId)) {
						allKeys.push(shortKey);
					}
				}
			}

			console.log("✅ LocalStorage: Found", allKeys.length, "saved canvases");
			return allKeys;
		} catch (error) {
			console.error("❌ LocalStorage: Failed to list keys:", error);
			return [];
		}
	};

	/**
	 * Clear old/unused canvases to free up space
	 */
	const cleanup = async (maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> => {
		try {
			console.log("🧹 LocalStorage: Cleaning up old canvases");

			const now = Date.now();
			let removed = 0;

			for (let i = window.localStorage.length - 1; i >= 0; i--) {
				const key = window.localStorage.key(i);
				if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

				try {
					const serialized = window.localStorage.getItem(key);
					if (!serialized) continue;

					const data = JSON.parse(serialized);
					const age = now - (data.savedAt || data.timestamp || 0);

					if (age > maxAgeMs) {
						window.localStorage.removeItem(key);
						removed++;
						console.log("  Removed old canvas:", key);
					}
				} catch (parseError) {
					// Invalid JSON - remove it
					window.localStorage.removeItem(key);
					removed++;
					console.log("  Removed corrupted canvas:", key);
				}
			}

			console.log(`✅ LocalStorage: Cleanup complete, removed ${removed} canvases`);
			return removed;
		} catch (error) {
			console.error("❌ LocalStorage: Cleanup failed:", error);
			return 0;
		}
	};

	return {
		save,
		load,
		delete: deleteState,
		listKeys,
		isAvailable,
		cleanup
	} as StorageAdapter & { cleanup: (maxAgeMs?: number) => Promise<number> };
}


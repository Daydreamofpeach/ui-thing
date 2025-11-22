/**
 * Auto-Save Composable
 *
 * Handles automatic saving of canvas state with debouncing.
 * Prevents excessive writes while ensuring changes are persisted.
 *
 * @phase Phase 3 - Persistence
 * @created October 28, 2025
 */

import { ref, watch } from "vue";
import type { CanvasState } from "../core/types";
import type { AutoSaveConfig, PersistenceStatus } from "./types";
import { generateStorageKey, serializeCanvasState, useStorageAdapter } from "./useStorageAdapter";

/**
 * Create auto-save manager
 */
export function useAutoSave(
	getCanvasState: () => CanvasState,
	config: Partial<AutoSaveConfig> = {}
) {
	console.log("💾 Initializing Auto-Save Manager");

	// Merge with defaults
	const autoSaveConfig: AutoSaveConfig = {
		enabled: true,
		debounceMs: 1000, // 1 second default
		immediate: false,
		...config
	};

	// Persistence status
	const status = ref<PersistenceStatus>({
		lastSave: null,
		isSaving: false,
		lastSaveSuccess: true,
		lastError: null,
		saveCount: 0
	});

	// Debounce timer
	let saveTimer: NodeJS.Timeout | null = null;

	// Storage adapter (lazy-loaded)
	let storageAdapter: Awaited<ReturnType<typeof useStorageAdapter>> | null = null;

	/**
	 * Initialize storage adapter
	 */
	const initializeAdapter = async () => {
		if (storageAdapter) return storageAdapter;

		try {
			storageAdapter = await useStorageAdapter();
			console.log("✅ Auto-Save: Storage adapter initialized");
			return storageAdapter;
		} catch (error) {
			console.error("❌ Auto-Save: Failed to initialize storage:", error);
			throw error;
		}
	};

	/**
	 * Perform the actual save operation
	 */
	const performSave = async (): Promise<boolean> => {
		try {
			console.log("💾 Auto-Save: Starting save...");

			status.value.isSaving = true;
			status.value.lastError = null;

			// Get current canvas state
			const canvasState = getCanvasState();

			// Ensure we have an organization ID
			if (!canvasState.organizationId) {
				throw new Error("Organization ID required for persistence");
			}

			// Initialize adapter if needed
			const adapter = await initializeAdapter();

			// Generate storage key
			const storageKey = generateStorageKey(
				canvasState.organizationId,
				canvasState.viewId
			);

			// Serialize state
			const serialized = serializeCanvasState(canvasState);

			// Save to storage
			const success = await adapter.save(storageKey, serialized);

			if (success) {
				status.value.lastSave = Date.now();
				status.value.lastSaveSuccess = true;
				status.value.saveCount++;

				console.log("✅ Auto-Save: Save successful");
				console.log(`  Total saves this session: ${status.value.saveCount}`);

				// Call success callback
				autoSaveConfig.onSaveSuccess?.(status.value.lastSave);
			} else {
				throw new Error("Save operation returned false");
			}

			return success;
		} catch (error) {
			console.error("❌ Auto-Save: Save failed:", error);

			status.value.lastSaveSuccess = false;
			status.value.lastError = error instanceof Error ? error.message : String(error);

			// Call error callback
			autoSaveConfig.onSaveError?.(error instanceof Error ? error : new Error(String(error)));

			return false;
		} finally {
			status.value.isSaving = false;
		}
	};

	/**
	 * Trigger a save (with debounce)
	 */
	const triggerSave = () => {
		if (!autoSaveConfig.enabled) {
			console.log("ℹ️ Auto-Save: Skipped (disabled)");
			return;
		}

		// Clear existing timer
		if (saveTimer) {
			clearTimeout(saveTimer);
		}

		if (autoSaveConfig.immediate) {
			// Save immediately
			console.log("💾 Auto-Save: Immediate save triggered");
			performSave();
		} else {
			// Debounced save
			console.log(`💾 Auto-Save: Scheduled (${autoSaveConfig.debounceMs}ms debounce)`);
			saveTimer = setTimeout(() => {
				performSave();
			}, autoSaveConfig.debounceMs);
		}
	};

	/**
	 * Force immediate save (bypass debounce)
	 */
	const forceSave = async (): Promise<boolean> => {
		console.log("💾 Auto-Save: Force save triggered");

		// Clear any pending debounced save
		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}

		return await performSave();
	};

	/**
	 * Load saved state
	 */
	const loadSavedState = async (
		organizationId: string,
		viewId?: string
	): Promise<SerializableCanvasState | null> => {
		try {
			console.log("💾 Auto-Save: Loading saved state");
			console.log("  Organization:", organizationId);
			console.log("  View:", viewId || "master");

			const adapter = await initializeAdapter();
			const storageKey = generateStorageKey(organizationId, viewId);

			const state = await adapter.load(storageKey);

			if (state) {
				console.log("✅ Auto-Save: State loaded successfully");
				console.log("  Nodes:", state.nodes.length);
				console.log("  Edges:", state.edges.length);
			} else {
				console.log("ℹ️ Auto-Save: No saved state found");
			}

			return state;
		} catch (error) {
			console.error("❌ Auto-Save: Failed to load state:", error);
			return null;
		}
	};

	/**
	 * Delete saved state
	 */
	const deleteSavedState = async (
		organizationId: string,
		viewId?: string
	): Promise<boolean> => {
		try {
			console.log("💾 Auto-Save: Deleting saved state");

			const adapter = await initializeAdapter();
			const storageKey = generateStorageKey(organizationId, viewId);

			const success = await adapter.delete(storageKey);

			if (success) {
				console.log("✅ Auto-Save: State deleted successfully");
			}

			return success;
		} catch (error) {
			console.error("❌ Auto-Save: Failed to delete state:", error);
			return false;
		}
	};

	/**
	 * List all saved canvases for organization
	 */
	const listSavedCanvases = async (organizationId: string): Promise<string[]> => {
		try {
			console.log("💾 Auto-Save: Listing saved canvases");

			const adapter = await initializeAdapter();
			const keys = await adapter.listKeys(organizationId);

			console.log("✅ Auto-Save: Found", keys.length, "saved canvases");
			return keys;
		} catch (error) {
			console.error("❌ Auto-Save: Failed to list canvases:", error);
			return [];
		}
	};

	/**
	 * Enable auto-save
	 */
	const enable = () => {
		console.log("✅ Auto-Save: Enabled");
		autoSaveConfig.enabled = true;
	};

	/**
	 * Disable auto-save
	 */
	const disable = () => {
		console.log("⏸️ Auto-Save: Disabled");
		autoSaveConfig.enabled = false;

		// Clear pending saves
		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}
	};

	/**
	 * Update auto-save config
	 */
	const updateConfig = (newConfig: Partial<AutoSaveConfig>) => {
		console.log("🔧 Auto-Save: Updating config:", newConfig);
		Object.assign(autoSaveConfig, newConfig);
	};

	/**
	 * Get time since last save
	 */
	const getTimeSinceLastSave = (): number | null => {
		if (!status.value.lastSave) return null;
		return Date.now() - status.value.lastSave;
	};

	/**
	 * Check if save is needed (based on time)
	 */
	const needsSave = (maxAgeMs: number = 5000): boolean => {
		const timeSince = getTimeSinceLastSave();
		if (timeSince === null) return true;
		return timeSince > maxAgeMs;
	};

	/**
	 * Cleanup on destroy
	 */
	const cleanup = () => {
		console.log("🧹 Auto-Save: Cleaning up");

		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}
	};

	return {
		// Status
		status,
		getTimeSinceLastSave,
		needsSave,

		// Save operations
		triggerSave,
		forceSave,
		performSave,

		// Load operations
		loadSavedState,
		deleteSavedState,
		listSavedCanvases,

		// Config
		enable,
		disable,
		updateConfig,

		// Lifecycle
		cleanup,

		// Utilities
		initializeAdapter,
		getAdapterType: () => adapterType
	};
}

/**
 * Watch canvas state and auto-save on changes
 *
 * @example
 * ```typescript
 * const nodeStore = useNodeStore()
 * const autoSave = useAutoSave(() => exportCanvasState())
 *
 * // Watch nodes and trigger save
 * watchCanvasForChanges(
 *   () => nodeStore.nodes.value,
 *   autoSave.triggerSave
 * )
 * ```
 */
export function watchCanvasForChanges(
	getter: () => any,
	onChangeFn: () => void
) {
	return watch(
		getter,
		() => {
			console.log("📊 Canvas changed, triggering auto-save");
			onChangeFn();
		},
		{ deep: true }
	);
}


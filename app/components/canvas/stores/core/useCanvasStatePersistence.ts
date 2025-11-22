/**
 * Canvas State Store with Persistence
 *
 * Enhanced version of useCanvasStateStore that includes:
 * - Auto-save with debouncing
 * - Load from persistence on init
 * - Manual save/load operations
 *
 * This is the RECOMMENDED way to use the canvas store in production.
 *
 * @phase Phase 3 - Persistence Integration
 * @created October 28, 2025
 */

import type { AutoSaveConfig } from "../persistence/types";
import { watch } from "vue";
import { useAutoSave } from "../persistence/useAutoSave";
import { deserializeCanvasState, serializeCanvasState } from "../persistence/useStorageAdapter";
import { useCanvasStateStore } from "./useCanvasStateStore";

/**
 * Create persisted canvas state store
 */
export function useCanvasStatePersistence(
	organizationId: string,
	viewId?: string,
	autoSaveConfig?: Partial<AutoSaveConfig>
) {
	console.log("🏪💾 Creating Persisted Canvas State Store");
	console.log("  Organization:", organizationId);
	console.log("  View:", viewId || "master");

	// Get base store
	const baseStore = useCanvasStateStore();

	// Set organization ID
	baseStore.setOrganizationId(organizationId);
	if (viewId) {
		baseStore.setViewId(viewId);
	}

	// Initialize auto-save
	const autoSave = useAutoSave(
		() => baseStore.exportState(),
		{
			...autoSaveConfig,
			onSaveSuccess: (timestamp) => {
				console.log("✅ Canvas auto-saved at:", new Date(timestamp).toLocaleTimeString());
				autoSaveConfig?.onSaveSuccess?.(timestamp);
			},
			onSaveError: (error) => {
				console.error("❌ Canvas auto-save failed:", error);
				autoSaveConfig?.onSaveError?.(error);
			}
		}
	);

	// Watch for changes and trigger auto-save
	watch(
		() => [baseStore.nodes.value, baseStore.edges.value, baseStore.viewport.value],
		() => {
			if (autoSaveConfig?.enabled !== false) {
				console.log("📊 Canvas state changed, triggering auto-save...");
				autoSave.triggerSave();
			}
		},
		{ deep: true }
	);

	/**
	 * Load saved state from storage
	 */
	const loadFromStorage = async (): Promise<boolean> => {
		try {
			console.log("💾 Loading canvas from storage...");

			const savedState = await autoSave.loadSavedState(organizationId, viewId);

			if (!savedState) {
				console.log("ℹ️ No saved state found, starting fresh");
				return false;
			}

			// Deserialize and load into store
			const canvasState = deserializeCanvasState(savedState);
			baseStore.loadCanvasState({
				nodes: Array.from(canvasState.nodes.values()),
				edges: Array.from(canvasState.edges.values()),
				positions: canvasState.positions,
				viewport: canvasState.viewport,
				name: canvasState.name,
				organizationId: canvasState.organizationId,
				viewId: canvasState.viewId
			});

			console.log("✅ Canvas state restored from storage");
			return true;
		} catch (error) {
			console.error("❌ Failed to load from storage:", error);
			return false;
		}
	};

	/**
	 * Save immediately (bypass auto-save debounce)
	 */
	const saveNow = async (): Promise<boolean> => {
		console.log("💾 Manual save triggered");
		return await autoSave.forceSave();
	};

	/**
	 * Export state for backup/download
	 */
	const exportForBackup = () => {
		const state = baseStore.exportState();
		const serialized = serializeCanvasState(state);

		return {
			...serialized,
			exportedAt: Date.now(),
			exportVersion: "1.0.0"
		};
	};

	/**
	 * Import state from backup
	 */
	const importFromBackup = (backup: ReturnType<typeof exportForBackup>) => {
		console.log("📥 Importing canvas from backup");

		const canvasState = deserializeCanvasState(backup);
		baseStore.loadCanvasState({
			nodes: Array.from(canvasState.nodes.values()),
			edges: Array.from(canvasState.edges.values()),
			positions: canvasState.positions,
			viewport: canvasState.viewport,
			name: canvasState.name,
			organizationId: canvasState.organizationId,
			viewId: canvasState.viewId
		});

		console.log("✅ Canvas imported from backup");

		// Trigger immediate save
		saveNow();
	};

	return {
		// Spread all base store methods
		...baseStore,

		// Persistence methods
		loadFromStorage,
		saveNow,
		exportForBackup,
		importFromBackup,

		// Auto-save control
		enableAutoSave: autoSave.enable,
		disableAutoSave: autoSave.disable,
		updateAutoSaveConfig: autoSave.updateConfig,

		// Persistence status
		persistenceStatus: autoSave.status,
		getTimeSinceLastSave: autoSave.getTimeSinceLastSave,
		needsSave: autoSave.needsSave,

		// List saved canvases
		listSavedCanvases: () => autoSave.listSavedCanvases(organizationId),

		// Delete this canvas
		deleteFromStorage: () => autoSave.deleteSavedState(organizationId, viewId),

		// Cleanup
		cleanup: autoSave.cleanup
	};
}

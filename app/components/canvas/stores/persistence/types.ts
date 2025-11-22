/**
 * Persistence Types - Storage Interfaces
 *
 * Defines interfaces for storage adapters (Tauri, localStorage, etc.)
 * This allows swapping storage backends without changing store code.
 *
 * @phase Phase 3 - Persistence
 * @created October 28, 2025
 */

import type { CanvasState } from "../core/types";

/**
 * Serializable Canvas State - Ready for JSON storage
 * Maps are converted to arrays for serialization
 */
export interface SerializableCanvasState {
	nodes: Array<{ id: string, data: any }>
	edges: Array<{ id: string, data: any }>
	positions: Array<{ nodeId: string, x: number, y: number }>
	viewport: { x: number, y: number, zoom: number }
	organizationId: string
	viewId?: string
	name: string
	timestamp: number
}

/**
 * Storage Adapter Interface
 * All storage backends (Tauri, localStorage) must implement this
 */
export interface StorageAdapter {
	/**
	 * Save canvas state
	 * @param key - Storage key (e.g., "canvas-{organizationId}-{viewId}")
	 * @param state - Canvas state to save
	 * @returns Success status
	 */
	save(key: string, state: SerializableCanvasState): Promise<boolean>

	/**
	 * Load canvas state
	 * @param key - Storage key
	 * @returns Loaded state or null if not found
	 */
	load(key: string): Promise<SerializableCanvasState | null>

	/**
	 * Delete canvas state
	 * @param key - Storage key
	 * @returns Success status
	 */
	delete(key: string): Promise<boolean>

	/**
	 * List all saved canvas keys for an organization
	 * @param organizationId - Organization ID to filter by
	 * @returns Array of storage keys
	 */
	listKeys(organizationId?: string): Promise<string[]>

	/**
	 * Check if storage is available
	 * @returns True if storage backend is working
	 */
	isAvailable(): Promise<boolean>
}

/**
 * Auto-Save Configuration
 */
export interface AutoSaveConfig {
	/** Enable auto-save */
	enabled: boolean

	/** Debounce delay in milliseconds (default: 1000ms) */
	debounceMs: number

	/** Save on every change (no debounce) */
	immediate: boolean

	/** Callback when save succeeds */
	onSaveSuccess?: (timestamp: number) => void

	/** Callback when save fails */
	onSaveError?: (error: Error) => void
}

/**
 * Persistence Status
 */
export interface PersistenceStatus {
	/** Last save timestamp */
	lastSave: number | null

	/** Currently saving */
	isSaving: boolean

	/** Last save was successful */
	lastSaveSuccess: boolean

	/** Last error message */
	lastError: string | null

	/** Total saves this session */
	saveCount: number
}


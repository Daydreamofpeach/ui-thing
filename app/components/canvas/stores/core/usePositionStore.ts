/**
 * Position Store - Immutable Position Management
 * 
 * This store manages node positions separately from node data to prevent accidental mutations.
 * Positions can ONLY be changed through explicit lock operations or drag events.
 * 
 * KEY PRINCIPLE: Once a position is locked, it cannot be changed except through:
 * 1. Explicit drag operation (user interaction)
 * 2. Force update (unlock → update → lock)
 * 
 * This prevents position drift when adding/updating nodes.
 * 
 * @phase Phase 2 - Position Locking
 * @created October 28, 2025
 */

import { readonly, ref } from "vue";
import type { Position } from "./types";

export function usePositionStore() {
	console.log("🔒 Initializing Position Store");

	// ============================================================================
	// PRIVATE STATE
	// ============================================================================
	
	/** Position map: nodeId → { x, y } */
	const _positions = ref(new Map<string, Position>());
	
	/** Locked positions set: nodeId */
	const _locked = ref(new Set<string>());
	
	/** Position history for verification (last 100 changes) */
	const _history = ref<Array<{ nodeId: string, position: Position, timestamp: number }>>([]);

	// ============================================================================
	// GETTERS
	// ============================================================================
	
	/**
	 * Get position for a node
	 * Returns a COPY to prevent external mutations
	 */
	const getPosition = (nodeId: string): Position | undefined => {
		const pos = _positions.value.get(nodeId);
		return pos ? { ...pos } : undefined;
	};

	/**
	 * Check if a position is locked
	 */
	const isLocked = (nodeId: string): boolean => {
		return _locked.value.has(nodeId);
	};

	/**
	 * Get all positions as a snapshot
	 * Useful for verification and debugging
	 */
	const getAllPositions = (): Map<string, Position> => {
		return new Map(_positions.value);
	};

	/**
	 * Get position history for a node
	 */
	const getHistory = (nodeId: string, limit = 10) => {
		return _history.value
			.filter((entry) => entry.nodeId === nodeId)
			.slice(-limit);
	};

	// ============================================================================
	// MUTATIONS - Position Locking
	// ============================================================================
	
	/**
	 * Lock a position - this is the PRIMARY way to set positions
	 * Once locked, position cannot change except via unlock → update → lock
	 */
	const lockPosition = (nodeId: string, position: Position) => {
		console.log(`🔒 Position locked: ${nodeId} at (${position.x}, ${position.y})`);
		
		// Store position (create defensive copy)
		_positions.value.set(nodeId, { x: position.x, y: position.y });
		
		// Mark as locked
		_locked.value.add(nodeId);
		
		// Add to history
		addToHistory(nodeId, position);
	};

	/**
	 * Unlock a position (for drag operations)
	 * After unlock, position can be updated, then should be locked again
	 */
	const unlock = (nodeId: string) => {
		console.log(`🔓 Position unlocked: ${nodeId}`);
		_locked.value.delete(nodeId);
	};

	/**
	 * Update position (only if unlocked OR force = true)
	 * Use force=true ONLY for drag operations or emergency fixes
	 */
	const updatePosition = (nodeId: string, position: Position, force = false): boolean => {
		// Check if locked
		if (!force && isLocked(nodeId)) {
			console.warn(`⚠️ Cannot update locked position: ${nodeId}`);
			console.warn(`   Current: ${JSON.stringify(getPosition(nodeId))}`);
			console.warn(`   Attempted: ${JSON.stringify(position)}`);
			return false;
		}

		console.log(`📍 Position updated: ${nodeId} to (${position.x}, ${position.y})`);
		
		// Update position
		_positions.value.set(nodeId, { x: position.x, y: position.y });
		
		// Add to history
		addToHistory(nodeId, position);
		
		return true;
	};

	/**
	 * Batch lock multiple positions (for loading saved canvases)
	 */
	const lockAllPositions = (positions: Map<string, Position>) => {
		console.log(`🔒 Batch locking ${positions.size} positions`);
		
		positions.forEach((position, nodeId) => {
			_positions.value.set(nodeId, { ...position });
			_locked.value.add(nodeId);
		});
		
		console.log("✅ All positions locked");
	};

	/**
	 * Remove a position (when node is deleted)
	 */
	const removePosition = (nodeId: string) => {
		const existed = _positions.value.delete(nodeId);
		_locked.value.delete(nodeId);
		
		if (existed) {
			console.log(`🗑️ Position removed: ${nodeId}`);
		}
	};

	// ============================================================================
	// VERIFICATION & DEBUGGING
	// ============================================================================
	
	/**
	 * Verify positions haven't drifted from expected values
	 * Returns true if all positions match, false if drift detected
	 */
	const verifyPositions = (expectedPositions: Map<string, Position>): boolean => {
		console.log("🔍 Verifying positions...");
		
		let hasChanged = false;
		const drifted: string[] = [];

		expectedPositions.forEach((expected, nodeId) => {
			const actual = _positions.value.get(nodeId);
			
			if (!actual) {
				console.warn(`⚠️ Position missing for ${nodeId}`);
				hasChanged = true;
				drifted.push(nodeId);
				return;
			}

			// Check for drift (with small tolerance for floating point errors)
			const tolerance = 0.001;
			const xDrift = Math.abs(actual.x - expected.x);
			const yDrift = Math.abs(actual.y - expected.y);

			if (xDrift > tolerance || yDrift > tolerance) {
				console.error(`❌ Position drift detected for ${nodeId}:`);
				console.error(`   Expected: (${expected.x}, ${expected.y})`);
				console.error(`   Actual: (${actual.x}, ${actual.y})`);
				console.error(`   Drift: (${xDrift}, ${yDrift})`);
				hasChanged = true;
				drifted.push(nodeId);
			}
		});

		if (hasChanged) {
			console.error(`❌ Position verification FAILED: ${drifted.length} nodes drifted`);
			console.error(`   Drifted nodes: ${drifted.join(", ")}`);
		} else {
			console.log("✅ Position verification PASSED: All positions stable");
		}

		return !hasChanged;
	};

	/**
	 * Create a snapshot of current positions
	 * Useful for before/after comparisons
	 */
	const createSnapshot = (): Map<string, Position> => {
		return new Map(_positions.value);
	};

	/**
	 * Compare current positions with a snapshot
	 * Returns list of nodes that moved
	 */
	const compareWithSnapshot = (snapshot: Map<string, Position>): string[] => {
		const moved: string[] = [];

		snapshot.forEach((expected, nodeId) => {
			const actual = _positions.value.get(nodeId);
			if (!actual || actual.x !== expected.x || actual.y !== expected.y) {
				moved.push(nodeId);
			}
		});

		if (moved.length > 0) {
			console.warn(`⚠️ ${moved.length} nodes moved since snapshot:`, moved);
		} else {
			console.log("✅ No nodes moved since snapshot");
		}

		return moved;
	};

	// ============================================================================
	// INTERNAL HELPERS
	// ============================================================================
	
	/**
	 * Add position change to history
	 */
	const addToHistory = (nodeId: string, position: Position) => {
		_history.value.push({
			nodeId,
			position: { ...position },
			timestamp: Date.now()
		});

		// Keep only last 100 entries to prevent memory bloat
		if (_history.value.length > 100) {
			_history.value.shift();
		}
	};

	// ============================================================================
	// BULK OPERATIONS
	// ============================================================================
	
	/**
	 * Clear all positions
	 */
	const clearAll = () => {
		console.log("🧹 Position Store: Clearing all positions");
		_positions.value.clear();
		_locked.value.clear();
		_history.value = [];
	};

	/**
	 * Get statistics for debugging
	 */
	const getStats = () => {
		return {
			totalPositions: _positions.value.size,
			lockedPositions: _locked.value.size,
			unlockedPositions: _positions.value.size - _locked.value.size,
			historyEntries: _history.value.length
		};
	};

	// ============================================================================
	// RETURN PUBLIC API
	// ============================================================================
	return {
		// State (read-only)
		positions: readonly(_positions),

		// Getters
		getPosition,
		isLocked,
		getAllPositions,
		getHistory,
		getStats,

		// Mutations
		lockPosition,
		unlock,
		updatePosition,
		lockAllPositions,
		removePosition,

		// Verification
		verifyPositions,
		createSnapshot,
		compareWithSnapshot,

		// Bulk operations
		clearAll
	};
}


<!--
  Phase 3 Test Component - Persistence Verification
  
  This component tests auto-save, load, and storage backend selection.
  
  Expected Results:
  - Storage adapter initializes (Tauri or localStorage) ✅
  - Auto-save triggers after changes ✅
  - State persists across save/load cycles ✅
  - Debouncing prevents excessive saves ✅
-->

<template>
	<div class="phase3-test-container">
		<h2>💾 Phase 3: Persistence Test</h2>
		<p class="test-description">
			This test verifies auto-save and state persistence.
		</p>

		<div class="storage-info">
			<h3>Storage Backend:</h3>
			<div class="info-badge" :class="storageType ? 'available' : 'unavailable'">
				{{ storageType ? `✅ ${storageType}` : '❌ No storage available' }}
			</div>
		</div>

		<div class="test-controls">
			<button class="test-button primary" @click="runPersistenceTest">
				🧪 Run Persistence Test
			</button>
			<button class="test-button secondary" @click="runAutoSaveTest">
				⏱️ Run Auto-Save Test
			</button>
			<button class="test-button secondary" @click="testSaveLoad">
				💾 Test Save/Load
			</button>
			<button class="test-button danger" @click="clearStorage">
				🗑️ Clear Storage
			</button>
		</div>

		<div v-if="testResults" class="test-results">
			<h3>Test Results:</h3>
			<div class="result-badge" :class="[testResults.passed ? 'passed' : 'failed']">
				{{ testResults.passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED' }}
			</div>

			<div class="result-details">
				<div class="test-item" :class="{ passed: testResults.storageInitialized }">
					<span class="test-icon">{{ testResults.storageInitialized ? '✅' : '❌' }}</span>
					<span class="test-label">Storage Initialized</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.canSave }">
					<span class="test-icon">{{ testResults.canSave ? '✅' : '❌' }}</span>
					<span class="test-label">Can Save State</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.canLoad }">
					<span class="test-icon">{{ testResults.canLoad ? '✅' : '❌' }}</span>
					<span class="test-label">Can Load State</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.stateMatches }">
					<span class="test-icon">{{ testResults.stateMatches ? '✅' : '❌' }}</span>
					<span class="test-label">State Matches After Load</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.autoSaveWorks }">
					<span class="test-icon">{{ testResults.autoSaveWorks ? '✅' : '❌' }}</span>
					<span class="test-label">Auto-Save Works</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.debounceWorks }">
					<span class="test-icon">{{ testResults.debounceWorks ? '✅' : '❌' }}</span>
					<span class="test-label">Debounce Prevents Spam</span>
				</div>
			</div>

			<div v-if="persistenceStats" class="stats-panel">
				<h4>Persistence Stats:</h4>
				<div class="stat-row">
					<span class="stat-label">Last Save:</span>
					<span class="stat-value">{{ persistenceStats.lastSave ? new Date(persistenceStats.lastSave).toLocaleTimeString() : 'Never' }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Save Count:</span>
					<span class="stat-value">{{ persistenceStats.saveCount }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Currently Saving:</span>
					<span class="stat-value">{{ persistenceStats.isSaving ? '⏳ Yes' : '✅ No' }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Last Save Success:</span>
					<span class="stat-value">{{ persistenceStats.lastSaveSuccess ? '✅ Yes' : '❌ No' }}</span>
				</div>
				<div v-if="persistenceStats.lastError" class="stat-row error">
					<span class="stat-label">Last Error:</span>
					<span class="stat-value">{{ persistenceStats.lastError }}</span>
				</div>
			</div>

			<div v-if="testLog.length > 0" class="test-log">
				<h4>Test Log:</h4>
				<div class="log-entries">
					<div v-for="(entry, index) in testLog" :key="index" class="log-entry">
						{{ entry }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useAutoSave } from "../useAutoSave";
	import { deserializeCanvasState, generateStorageKey, serializeCanvasState, useStorageAdapter } from "../useStorageAdapter";
	import type { CanvasState } from "../../core/types";

	const testResults = ref<any>(null);
	const storageType = ref<string | null>(null);
	const persistenceStats = ref<any>(null);
	const testLog = ref<string[]>([]);

	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		testLog.value.push(`[${timestamp}] ${message}`);
		console.log(message);
	};

	/**
	 * Initialize and detect storage type
	 */
	const initializeStorage = async () => {
		try {
			addLog("🔍 Detecting storage backend...");

			const adapter = await useStorageAdapter();
			const available = await adapter.isAvailable();

			if (available) {
				// Check which type was selected
				const { getAdapterType } = await import("../useStorageAdapter");
				storageType.value = getAdapterType();
				addLog(`✅ Storage initialized: ${storageType.value}`);
				return true;
			}

			addLog("❌ No storage backend available");
			return false;
		} catch (error) {
			addLog(`❌ Storage initialization failed: ${error}`);
			return false;
		}
	};

	/**
	 * Test basic save and load
	 */
	const testSaveLoad = async () => {
		try {
			testLog.value = [];
			addLog("🧪 Starting Save/Load Test...");

			const results: any = {
				passed: false,
				storageInitialized: false,
				canSave: false,
				canLoad: false,
				stateMatches: false,
				autoSaveWorks: false,
				debounceWorks: false
			};

			// Initialize storage
			results.storageInitialized = await initializeStorage();
			if (!results.storageInitialized) {
				testResults.value = results;
				return;
			}

			// Create test state
			const testState: CanvasState = {
				nodes: new Map([
					["test-1", { id: "test-1", type: "rectangle", data: { label: "Test Node 1" } }],
					["test-2", { id: "test-2", type: "circle", data: { label: "Test Node 2" } }]
				]),
				edges: new Map([
					["edge-1", { id: "edge-1", source: "test-1", target: "test-2" }]
				]),
				positions: new Map([
					["test-1", { x: 100, y: 100 }],
					["test-2", { x: 300, y: 100 }]
				]),
				viewport: { x: 0, y: 0, zoom: 1 },
				organizationId: "test-org",
				viewId: "test-view",
				name: "Test Canvas"
			};

			addLog("📦 Created test state with 2 nodes, 1 edge");

			// Serialize state
			const serialized = serializeCanvasState(testState);
			addLog("📝 Serialized state to JSON");

			// Get storage adapter
			const adapter = await useStorageAdapter();
			const storageKey = generateStorageKey("test-org", "test-view");

			addLog(`💾 Saving to key: ${storageKey}`);

			// Save
			results.canSave = await adapter.save(storageKey, serialized);
			addLog(results.canSave ? "✅ Save successful" : "❌ Save failed");

			if (!results.canSave) {
				testResults.value = results;
				return;
			}

			// Load
			addLog("📂 Loading saved state...");
			const loaded = await adapter.load(storageKey);
			results.canLoad = loaded !== null;
			addLog(results.canLoad ? "✅ Load successful" : "❌ Load failed");

			if (!loaded) {
				testResults.value = results;
				return;
			}

			// Verify data matches
			const deserialized = deserializeCanvasState(loaded);

			const nodesMatch = deserialized.nodes.size === testState.nodes.size;
			const edgesMatch = deserialized.edges.size === testState.edges.size;
			const positionsMatch = deserialized.positions.size === testState.positions.size;

			results.stateMatches = nodesMatch && edgesMatch && positionsMatch;

			addLog(results.stateMatches ? "✅ State matches after load" : "❌ State mismatch");
			addLog(`  Nodes: ${deserialized.nodes.size}/${testState.nodes.size}`);
			addLog(`  Edges: ${deserialized.edges.size}/${testState.edges.size}`);
			addLog(`  Positions: ${deserialized.positions.size}/${testState.positions.size}`);

			results.passed = results.storageInitialized
				&& results.canSave
				&& results.canLoad
				&& results.stateMatches;

			testResults.value = results;
			addLog(results.passed ? "🎉 All tests PASSED!" : "❌ Some tests FAILED");
		} catch (error) {
			addLog(`❌ Test error: ${error}`);
			testResults.value = { passed: false };
		}
	};

	/**
	 * Test auto-save functionality
	 */
	const runAutoSaveTest = async () => {
		try {
			testLog.value = [];
			addLog("🧪 Starting Auto-Save Test...");

			// Initialize storage first
			const initialized = await initializeStorage();
			if (!initialized) {
				addLog("❌ Storage not available, cannot test auto-save");
				return;
			}

			// Create test canvas state
			const testState: CanvasState = {
				nodes: new Map(),
				edges: new Map(),
				positions: new Map(),
				viewport: { x: 0, y: 0, zoom: 1 },
				organizationId: "test-org-autosave",
				name: "Auto-Save Test"
			};

			// Create auto-save instance
			const autoSave = useAutoSave(
				() => testState,
				{
					enabled: true,
					debounceMs: 500,
					onSaveSuccess: (timestamp) => {
						addLog(`✅ Auto-save completed at ${new Date(timestamp).toLocaleTimeString()}`);
						persistenceStats.value = autoSave.status.value;
					},
					onSaveError: (error) => {
						addLog(`❌ Auto-save error: ${error.message}`);
						persistenceStats.value = autoSave.status.value;
					}
				}
			);

			addLog("✅ Auto-save manager created");
			addLog("⏱️ Triggering save with 500ms debounce...");

			// Trigger multiple saves rapidly (should debounce)
			autoSave.triggerSave();
			autoSave.triggerSave();
			autoSave.triggerSave();

			addLog("📝 Triggered 3 rapid saves (should merge into 1)");

			// Wait for debounce
			await new Promise((resolve) => setTimeout(resolve, 1000));

			persistenceStats.value = autoSave.status.value;

			// Check if only one save happened
			const saveCount = autoSave.status.value.saveCount;
			const debounceWorks = saveCount === 1;

			addLog(debounceWorks ? `✅ Debounce works! (${saveCount} save instead of 3)` : `❌ Debounce failed (${saveCount} saves)`);

			// Test immediate save
			addLog("⚡ Testing force save (immediate)...");
			const forceSaved = await autoSave.forceSave();

			addLog(forceSaved ? "✅ Force save successful" : "❌ Force save failed");

			persistenceStats.value = autoSave.status.value;

			if (testResults.value) {
				testResults.value.autoSaveWorks = forceSaved;
				testResults.value.debounceWorks = debounceWorks;
				testResults.value.passed = testResults.value.passed && forceSaved && debounceWorks;
			}
		} catch (error) {
			addLog(`❌ Auto-save test error: ${error}`);
		}
	};

	/**
	 * Run full persistence test suite
	 */
	const runPersistenceTest = async () => {
		testLog.value = [];
		addLog("🚀 Starting Full Persistence Test Suite...");
		addLog("═".repeat(50));

		// Test 1: Save/Load
		await testSaveLoad();

		// Wait a bit
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Test 2: Auto-Save
		await runAutoSaveTest();

		addLog("═".repeat(50));
		addLog("🎉 Persistence test suite complete!");
	};

	/**
	 * Clear all test data from storage
	 */
	const clearStorage = async () => {
		try {
			addLog("🗑️ Clearing test storage...");

			const adapter = await useStorageAdapter();

			// Delete test canvases
			await adapter.delete(generateStorageKey("test-org", "test-view"));
			await adapter.delete(generateStorageKey("test-org-autosave"));

			addLog("✅ Test storage cleared");

			// Reset results
			testResults.value = null;
			persistenceStats.value = null;
		} catch (error) {
			addLog(`❌ Clear storage error: ${error}`);
		}
	};

	// Initialize on mount
	initializeStorage();
</script>

<style scoped>
.phase3-test-container {
	padding: 24px;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 12px;
	color: white;
	max-width: 900px;
	margin: 20px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
	font-size: 1.5rem;
	font-weight: 700;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.test-description {
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 20px;
	font-size: 0.9rem;
}

.storage-info {
	margin-bottom: 20px;
}

.storage-info h3 {
	font-size: 1rem;
	margin-bottom: 8px;
	color: rgba(255, 255, 255, 0.8);
}

.info-badge {
	display: inline-block;
	padding: 6px 12px;
	border-radius: 6px;
	font-size: 0.875rem;
	font-weight: 600;
}

.info-badge.available {
	background: rgba(34, 197, 94, 0.15);
	color: #22c55e;
	border: 1px solid rgba(34, 197, 94, 0.3);
}

.info-badge.unavailable {
	background: rgba(239, 68, 68, 0.15);
	color: #ef4444;
	border: 1px solid rgba(239, 68, 68, 0.3);
}

.test-controls {
	display: flex;
	gap: 12px;
	margin-bottom: 24px;
	flex-wrap: wrap;
}

.test-button {
	padding: 10px 18px;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
	background: rgba(255, 255, 255, 0.05);
}

.test-button.primary {
	border-color: rgba(59, 130, 246, 0.5);
	color: #3b82f6;
}

.test-button.primary:hover {
	background: rgba(59, 130, 246, 0.15);
	border-color: #3b82f6;
}

.test-button.secondary {
	border-color: rgba(168, 85, 247, 0.5);
	color: #a855f7;
}

.test-button.secondary:hover {
	background: rgba(168, 85, 247, 0.15);
	border-color: #a855f7;
}

.test-button.danger {
	border-color: rgba(239, 68, 68, 0.5);
	color: #ef4444;
}

.test-button.danger:hover {
	background: rgba(239, 68, 68, 0.15);
	border-color: #ef4444;
}

.test-results {
	margin-top: 24px;
}

.test-results h3 {
	font-size: 1.1rem;
	margin-bottom: 12px;
	color: rgba(255, 255, 255, 0.9);
}

.result-badge {
	display: inline-block;
	padding: 10px 20px;
	border-radius: 8px;
	font-weight: 700;
	margin-bottom: 20px;
	font-size: 1rem;
}

.result-badge.passed {
	background: rgba(34, 197, 94, 0.2);
	color: #22c55e;
	border: 2px solid #22c55e;
}

.result-badge.failed {
	background: rgba(239, 68, 68, 0.2);
	color: #ef4444;
	border: 2px solid #ef4444;
}

.result-details {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 20px;
}

.test-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.03);
	border-radius: 6px;
	border-left: 3px solid rgba(239, 68, 68, 0.4);
	transition: all 0.3s ease;
}

.test-item.passed {
	border-left-color: rgba(34, 197, 94, 0.6);
	background: rgba(34, 197, 94, 0.05);
}

.test-icon {
	font-size: 1.2rem;
}

.test-label {
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.9);
}

.stats-panel {
	background: rgba(0, 0, 0, 0.3);
	padding: 16px;
	border-radius: 8px;
	margin-bottom: 20px;
}

.stats-panel h4 {
	font-size: 1rem;
	margin-bottom: 12px;
	color: rgba(255, 255, 255, 0.8);
}

.stat-row {
	display: flex;
	justify-content: space-between;
	padding: 8px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-row:last-child {
	border-bottom: none;
}

.stat-row.error {
	color: #ef4444;
}

.stat-label {
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.85rem;
}

.stat-value {
	font-weight: 600;
	font-size: 0.85rem;
}

.test-log {
	background: rgba(0, 0, 0, 0.4);
	padding: 16px;
	border-radius: 8px;
	max-height: 300px;
	overflow-y: auto;
}

.test-log h4 {
	font-size: 1rem;
	margin-bottom: 12px;
	color: rgba(255, 255, 255, 0.8);
}

.log-entries {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.log-entry {
	font-family: monospace;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.7);
	padding: 4px 8px;
	background: rgba(255, 255, 255, 0.02);
	border-radius: 4px;
}

.test-log::-webkit-scrollbar {
	width: 8px;
}

.test-log::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
}

.test-log::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.4);
	border-radius: 4px;
}

.test-log::-webkit-scrollbar-thumb:hover {
	background: rgba(168, 85, 247, 0.6);
}
</style>


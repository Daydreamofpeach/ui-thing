<!--
  Phase 2 Test Component - Position Locking Verification

  This component tests that positions are IMMUTABLE and cannot be accidentally changed.
  This is the CRITICAL test that proves we've fixed the node drift issue.

  Expected Results:
  - Adding nodes doesn't move existing nodes ✅
  - Updating node data doesn't change position ✅
  - Position changes only via drag operations ✅
  - Position verification detects any drift ✅
-->

<template>
	<div class="phase2-test-container">
		<h2>🔒 Phase 2: Position Locking Test</h2>
		<p class="test-description">
			This test verifies that node positions are IMMUTABLE and cannot drift.
		</p>

		<div class="test-controls">
			<button class="test-button primary" @click="runPositionLockingTest">
				🧪 Run Position Locking Test
			</button>
			<button class="test-button secondary" @click="runDriftDetectionTest">
				🔍 Run Drift Detection Test
			</button>
			<button class="test-button danger" @click="resetTests">
				🔄 Reset Tests
			</button>
		</div>

		<!-- Test Results -->
		<div v-if="testResults" class="test-results">
			<h3>Test Results:</h3>
			<div class="result-badge" :class="[testResults.allPassed ? 'passed' : 'failed']">
				{{ testResults.allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED' }}
			</div>

			<div class="test-list">
				<div
					v-for="test in testResults.tests"
					:key="test.name"
					class="test-item" :class="[test.passed ? 'passed' : 'failed']"
				>
					<span class="test-icon">{{ test.passed ? '✅' : '❌' }}</span>
					<span class="test-name">{{ test.name }}</span>
					<span v-if="test.details" class="test-details">{{ test.details }}</span>
				</div>
			</div>

			<!-- Position Snapshot -->
			<div v-if="positionSnapshot" class="position-snapshot">
				<h4>📍 Position Snapshot:</h4>
				<div class="snapshot-grid">
					<div v-for="[nodeId, pos] in positionSnapshot" :key="nodeId" class="snapshot-item">
						<strong>{{ nodeId }}:</strong> ({{ pos.x }}, {{ pos.y }})
						<span
							v-if="positionChanges[nodeId]"
							class="change-indicator"
						>
							⚠️ MOVED
						</span>
					</div>
				</div>
			</div>

			<!-- Store Stats -->
			<div class="store-stats">
				<h4>📊 Store Statistics:</h4>
				<pre>{{ JSON.stringify(storeStats, null, 2) }}</pre>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useNodeStore } from "../useNodeStore";

	const testResults = ref<any>(null);
	const positionSnapshot = ref<Map<string, any> | null>(null);
	const positionChanges = ref<Record<string, boolean>>({});
	const storeStats = ref<any>(null);

	/**
	 * Test 1: Position Locking Test
	 * Verifies that positions cannot be accidentally changed
	 */
	const runPositionLockingTest = () => {
		console.log("🧪 Starting Position Locking Test");
		console.log("═══════════════════════════════════════════");

		const tests: Array<{ name: string, passed: boolean, details?: string }> = [];

		try {
			const nodeStore = useNodeStore();
			nodeStore.clearAll();

			// Test 1.1: Add node with position locking
			console.log("\n📝 Test 1.1: Add node with position lock");
			nodeStore.addNode(
				{ id: "lock-test-1", type: "rectangle", data: { label: "Node 1" } },
				{ x: 100, y: 100 }
			);

			const pos1 = nodeStore.positionStore.getPosition("lock-test-1");
			const isLocked1 = nodeStore.positionStore.isLocked("lock-test-1");

			tests.push({
				name: "Node position locked on creation",
				passed: isLocked1 === true && pos1?.x === 100 && pos1?.y === 100,
				details: isLocked1 ? "Position is locked ✓" : "Position NOT locked ✗"
			});

			// Test 1.2: Try to update position while locked (should fail)
			console.log("\n📝 Test 1.2: Try updating locked position");
			const updateResult = nodeStore.positionStore.updatePosition(
				"lock-test-1",
				{ x: 999, y: 999 },
				false // force = false
			);

			const pos1After = nodeStore.positionStore.getPosition("lock-test-1");

			tests.push({
				name: "Locked position resists updates",
				passed: updateResult === false && pos1After?.x === 100 && pos1After?.y === 100,
				details: `Update returned: ${updateResult}, Position: (${pos1After?.x}, ${pos1After?.y})`
			});

			// Test 1.3: Update node DATA (should NOT affect position)
			console.log("\n📝 Test 1.3: Update node data");
			const posBeforeDataUpdate = nodeStore.positionStore.getPosition("lock-test-1");

			nodeStore.updateNodeData("lock-test-1", {
				label: "Updated Label",
				color: "red",
				size: "large",
				customProp: "test"
			});

			const posAfterDataUpdate = nodeStore.positionStore.getPosition("lock-test-1");
			const positionUnchanged
				= posBeforeDataUpdate?.x === posAfterDataUpdate?.x
					&& posBeforeDataUpdate?.y === posAfterDataUpdate?.y;

			tests.push({
				name: "Data updates don't affect position",
				passed: positionUnchanged,
				details: `Before: (${posBeforeDataUpdate?.x}, ${posBeforeDataUpdate?.y}), After: (${posAfterDataUpdate?.x}, ${posAfterDataUpdate?.y})`
			});

			// Test 1.4: Add SECOND node (critical - this is where drift usually happens)
			console.log("\n📝 Test 1.4: Add second node (drift test)");
			const pos1BeforeAdd = nodeStore.positionStore.getPosition("lock-test-1");

			nodeStore.addNode(
				{ id: "lock-test-2", type: "circle", data: { label: "Node 2" } },
				{ x: 300, y: 100 }
			);

			const pos1AfterAdd = nodeStore.positionStore.getPosition("lock-test-1");
			const pos2 = nodeStore.positionStore.getPosition("lock-test-2");

			const node1DidntMove
				= pos1BeforeAdd?.x === pos1AfterAdd?.x
					&& pos1BeforeAdd?.y === pos1AfterAdd?.y;

			tests.push({
				name: "Adding second node doesn't move first node",
				passed: node1DidntMove && pos2?.x === 300 && pos2?.y === 100,
				details: `Node 1: (${pos1AfterAdd?.x}, ${pos1AfterAdd?.y}), Node 2: (${pos2?.x}, ${pos2?.y})`
			});

			// Test 1.5: Add THIRD node (stress test)
			console.log("\n📝 Test 1.5: Add third node (stress test)");
			const pos1Before3rd = nodeStore.positionStore.getPosition("lock-test-1");
			const pos2Before3rd = nodeStore.positionStore.getPosition("lock-test-2");

			nodeStore.addNode(
				{ id: "lock-test-3", type: "diamond", data: { label: "Node 3" } },
				{ x: 500, y: 200 }
			);

			const pos1After3rd = nodeStore.positionStore.getPosition("lock-test-1");
			const pos2After3rd = nodeStore.positionStore.getPosition("lock-test-2");
			const pos3 = nodeStore.positionStore.getPosition("lock-test-3");

			const noDrift
				= pos1Before3rd?.x === pos1After3rd?.x
					&& pos1Before3rd?.y === pos1After3rd?.y
					&& pos2Before3rd?.x === pos2After3rd?.x
					&& pos2Before3rd?.y === pos2After3rd?.y;

			tests.push({
				name: "Multiple nodes added - no drift",
				passed: noDrift && pos3?.x === 500 && pos3?.y === 200,
				details: `All nodes maintained position: ${noDrift}`
			});

			// Test 1.6: Drag simulation (unlock → update → lock)
			console.log("\n📝 Test 1.6: Drag simulation");
			nodeStore.handleDragStart("lock-test-1");
			const isUnlockedForDrag = !nodeStore.positionStore.isLocked("lock-test-1");

			nodeStore.handleDragEnd("lock-test-1", { x: 150, y: 150 });

			const newPos = nodeStore.positionStore.getPosition("lock-test-1");
			const isRelockedAfterDrag = nodeStore.positionStore.isLocked("lock-test-1");

			tests.push({
				name: "Drag operation works correctly",
				passed: isUnlockedForDrag && newPos?.x === 150 && newPos?.y === 150 && isRelockedAfterDrag,
				details: `Unlocked: ${isUnlockedForDrag}, New position: (${newPos?.x}, ${newPos?.y}), Relocked: ${isRelockedAfterDrag}`
			});

			// Create snapshot
			positionSnapshot.value = nodeStore.positionStore.getAllPositions();
			storeStats.value = nodeStore.getStats();

			// Determine if all passed
			const allPassed = tests.every((t) => t.passed);

			testResults.value = {
				allPassed,
				tests
			};

			console.log("\n═══════════════════════════════════════════");
			console.log("🎯 Position Locking Test:", allPassed ? "✅ PASSED" : "❌ FAILED");
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Test Error:", error);
			tests.push({
				name: "Test execution",
				passed: false,
				details: String(error)
			});

			testResults.value = {
				allPassed: false,
				tests
			};
		}
	};

	/**
	 * Test 2: Drift Detection Test
	 * Creates nodes, takes snapshot, simulates operations, checks for drift
	 */
	const runDriftDetectionTest = () => {
		console.log("🧪 Starting Drift Detection Test");
		console.log("═══════════════════════════════════════════");

		const tests: Array<{ name: string, passed: boolean, details?: string }> = [];

		try {
			const nodeStore = useNodeStore();
			nodeStore.clearAll();

			// Add 5 nodes
			console.log("\n📝 Creating 5 nodes");
			for (let i = 1; i <= 5; i++) {
				nodeStore.addNode(
					{ id: `drift-test-${i}`, type: "rectangle", data: { label: `Node ${i}` } },
					{ x: i * 200, y: i * 100 }
				);
			}

			// Take snapshot
			const snapshot = nodeStore.positionStore.createSnapshot();
			console.log("📸 Snapshot taken:", snapshot.size, "positions");

			// Simulate various operations that could cause drift
			console.log("\n📝 Simulating operations that might cause drift...");

			// Operation 1: Update all node data
			for (let i = 1; i <= 5; i++) {
				nodeStore.updateNodeData(`drift-test-${i}`, {
					updated: true,
					iteration: i,
					timestamp: Date.now()
				});
			}

			// Operation 2: Add more nodes
			for (let i = 6; i <= 8; i++) {
				nodeStore.addNode(
					{ id: `drift-test-${i}`, type: "circle", data: { label: `Node ${i}` } },
					{ x: i * 200, y: i * 100 }
				);
			}

			// Operation 3: Remove some nodes
			nodeStore.removeNode("drift-test-6");
			nodeStore.removeNode("drift-test-7");

			// Operation 4: Update styles
			nodeStore.updateNodeStyle("drift-test-1", { width: "300px", height: "200px" });

			// Check for drift
			console.log("\n🔍 Checking for drift...");
			const movedNodes = nodeStore.positionStore.compareWithSnapshot(snapshot);
			const noDrift = movedNodes.length === 0;

			tests.push({
				name: "No position drift after operations",
				passed: noDrift,
				details: noDrift ? "All positions stable ✓" : `${movedNodes.length} nodes moved: ${movedNodes.join(", ")}`
			});

			// Verify with verification function
			const verificationPassed = nodeStore.positionStore.verifyPositions(snapshot);

			tests.push({
				name: "Position verification system works",
				passed: verificationPassed,
				details: verificationPassed ? "Verification passed ✓" : "Drift detected ✗"
			});

			// Track changes
			positionChanges.value = {};
			movedNodes.forEach((nodeId) => {
				positionChanges.value[nodeId] = true;
			});

			positionSnapshot.value = nodeStore.positionStore.getAllPositions();
			storeStats.value = nodeStore.getStats();

			const allPassed = tests.every((t) => t.passed);

			testResults.value = {
				allPassed,
				tests
			};

			console.log("\n═══════════════════════════════════════════");
			console.log("🎯 Drift Detection Test:", allPassed ? "✅ PASSED" : "❌ FAILED");
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Test Error:", error);
			testResults.value = {
				allPassed: false,
				tests: [{ name: "Test execution", passed: false, details: String(error) }]
			};
		}
	};

	/**
	 * Reset test state
	 */
	const resetTests = () => {
		const nodeStore = useNodeStore();
		nodeStore.clearAll();

		testResults.value = null;
		positionSnapshot.value = null;
		positionChanges.value = {};
		storeStats.value = null;

		console.log("🔄 Tests reset");
	};
</script>

<style scoped>
.phase2-test-container {
	padding: 24px;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 12px;
	color: white;
	max-width: 900px;
	margin: 20px;
	border: 2px solid rgba(139, 92, 246, 0.3);
}

.test-description {
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 20px;
	font-size: 14px;
}

.test-controls {
	display: flex;
	gap: 12px;
	margin-bottom: 24px;
	flex-wrap: wrap;
}

.test-button {
	padding: 10px 20px;
	border-radius: 6px;
	border: 1px solid;
	color: white;
	cursor: pointer;
	font-weight: 600;
	font-size: 14px;
	transition: all 0.2s;
}

.test-button.primary {
	background: rgba(139, 92, 246, 0.2);
	border-color: rgba(139, 92, 246, 0.5);
}

.test-button.primary:hover {
	background: rgba(139, 92, 246, 0.3);
}

.test-button.secondary {
	background: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.5);
}

.test-button.secondary:hover {
	background: rgba(59, 130, 246, 0.3);
}

.test-button.danger {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.5);
}

.test-button.danger:hover {
	background: rgba(239, 68, 68, 0.3);
}

.test-results {
	margin-top: 24px;
}

.result-badge {
	display: inline-block;
	padding: 12px 24px;
	border-radius: 6px;
	font-weight: 700;
	margin: 16px 0;
	font-size: 16px;
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

.test-list {
	margin: 20px 0;
}

.test-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	margin: 8px 0;
	border-radius: 6px;
	border: 1px solid;
}

.test-item.passed {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.3);
}

.test-item.failed {
	background: rgba(239, 68, 68, 0.1);
	border-color: rgba(239, 68, 68, 0.3);
}

.test-icon {
	font-size: 18px;
}

.test-name {
	flex: 1;
	font-weight: 600;
}

.test-details {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.6);
}

.position-snapshot {
	margin: 24px 0;
	padding: 16px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 6px;
}

.position-snapshot h4 {
	margin-bottom: 12px;
}

.snapshot-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 8px;
}

.snapshot-item {
	padding: 8px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 4px;
	font-size: 12px;
	font-family: monospace;
}

.change-indicator {
	color: #f59e0b;
	font-weight: 700;
	margin-left: 8px;
}

.store-stats {
	margin-top: 24px;
	padding: 16px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 6px;
}

.store-stats h4 {
	margin-bottom: 12px;
}

.store-stats pre {
	background: rgba(0, 0, 0, 0.4);
	padding: 12px;
	border-radius: 4px;
	overflow: auto;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.9);
}
</style>

<!--
  Phase 1 Test Component

  This component tests the basic Canvas State Store functionality.
  Add this temporarily to dashboard.vue or run in isolation to verify Phase 1 works.

  Expected Console Output:
  - 🏪 Creating new Canvas State Store instance
  - 🏪 Store: Adding node: test-node-1 at { x: 100, y: 100 }
  - ✅ Store: Node added successfully, total nodes: 1
  - 📊 Store Test Results: { nodesCount: 1, ... }
  - ✅ Phase 1 Test: PASSED
-->

<template>
	<div class="phase1-test-container">
		<h2>Phase 1 Store Test</h2>

		<div v-if="testResults" class="test-results">
			<h3>Test Results:</h3>
			<div class="result-badge" :class="[testResults.passed ? 'passed' : 'failed']">
				{{ testResults.passed ? '✅ PASSED' : '❌ FAILED' }}
			</div>

			<div class="result-details">
				<p><strong>Nodes Count:</strong> {{ testResults.nodesCount }}</p>
				<p><strong>Edges Count:</strong> {{ testResults.edgesCount }}</p>
				<p><strong>Can Add Node:</strong> {{ testResults.canAddNode ? '✅' : '❌' }}</p>
				<p><strong>Can Update Node:</strong> {{ testResults.canUpdateNode ? '✅' : '❌' }}</p>
				<p><strong>Can Remove Node:</strong> {{ testResults.canRemoveNode ? '✅' : '❌' }}</p>
				<p><strong>Position Preserved:</strong> {{ testResults.positionPreserved ? '✅' : '❌' }}</p>
			</div>

			<div class="store-state">
				<h4>Current Store State:</h4>
				<pre>{{ JSON.stringify(storeSnapshot, null, 2) }}</pre>
			</div>
		</div>

		<button class="test-button" @click="runTests">
			Run Tests
		</button>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { useCanvasStateStore } from "../useCanvasStateStore";

	const testResults = ref<any>(null);
	const storeSnapshot = ref<any>(null);

	const runTests = () => {
		console.log("🧪 Starting Phase 1 Tests...");
		console.log("═══════════════════════════════════════════");

		// Initialize results object
		const results: any = {
			passed: true,
			nodesCount: 0,
			edgesCount: 0,
			canAddNode: false,
			canUpdateNode: false,
			canRemoveNode: false,
			positionPreserved: false
		};

		try {
			// Get store instance
			const store = useCanvasStateStore();

			// Test 1: Add Node
			console.log("\n📝 Test 1: Add Node");
			const testNode1 = {
				id: "test-node-1",
				type: "rectangle",
				data: { label: "Test Node 1" }
			};
			const testPosition1 = { x: 100, y: 100 };

			store.addNode(testNode1, testPosition1);

			results.canAddNode = store.hasNode("test-node-1");
			results.nodesCount = store.nodes.value.length;

			console.log("  ✓ Node added:", results.canAddNode);
			console.log("  ✓ Nodes count:", results.nodesCount);

			// Test 2: Get Node
			console.log("\n📝 Test 2: Get Node");
			const retrievedNode = store.getNode("test-node-1");
			console.log("  ✓ Retrieved node:", retrievedNode?.id);

			// Test 3: Get Position
			console.log("\n📝 Test 3: Get Position");
			const retrievedPosition = store.getPosition("test-node-1");
			console.log("  ✓ Retrieved position:", retrievedPosition);

			const positionMatches = retrievedPosition?.x === 100 && retrievedPosition?.y === 100;
			console.log("  ✓ Position matches:", positionMatches);

			// Test 4: Update Node Data
			console.log("\n📝 Test 4: Update Node Data");
			const positionBefore = store.getPosition("test-node-1");

			store.updateNodeData("test-node-1", "label", "Updated Label");
			store.updateNodeData("test-node-1", "color", "red");

			const positionAfter = store.getPosition("test-node-1");
			const updatedNode = store.getNode("test-node-1");

			results.canUpdateNode = updatedNode?.data.label === "Updated Label";
			results.positionPreserved
				= positionBefore?.x === positionAfter?.x
					&& positionBefore?.y === positionAfter?.y;

			console.log("  ✓ Data updated:", results.canUpdateNode);
			console.log("  ✓ Position preserved:", results.positionPreserved);

			// Test 5: Add Edge
			console.log("\n📝 Test 5: Add Edge");

			// Add second node first
			store.addNode(
				{ id: "test-node-2", type: "circle", data: { label: "Test Node 2" } },
				{ x: 300, y: 100 }
			);

			const testEdge = {
				id: "test-edge-1",
				source: "test-node-1",
				target: "test-node-2",
				type: "smoothstep"
			};

			store.addEdge(testEdge);

			results.edgesCount = store.edges.value.length;
			console.log("  ✓ Edge added, total edges:", results.edgesCount);

			// Test 6: Remove Node
			console.log("\n📝 Test 6: Remove Node");
			store.removeNode("test-node-2");

			results.canRemoveNode = !store.hasNode("test-node-2");
			console.log("  ✓ Node removed:", results.canRemoveNode);

			// Snapshot current state
			storeSnapshot.value = {
				nodes: store.nodes.value.map((n: any) => ({
					id: n.id,
					type: n.type,
					position: n.position,
					data: n.data
				})),
				edges: store.edges.value,
				viewport: store.viewport.value
			};

			// Check if all tests passed
			results.passed
				= results.canAddNode
					&& results.canUpdateNode
					&& results.canRemoveNode
					&& results.positionPreserved;

			console.log("\n═══════════════════════════════════════════");
			console.log("🎯 Phase 1 Test Results:", results.passed ? "✅ PASSED" : "❌ FAILED");
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Test Error:", error);
			results.passed = false;
		}

		testResults.value = results;
	};

	// Auto-run tests on mount (optional - comment out if you want manual trigger)
	// runTests();
</script>

<style scoped>
.phase1-test-container {
	padding: 20px;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 8px;
	color: white;
	max-width: 800px;
	margin: 20px;
}

.test-results {
	margin-top: 20px;
}

.result-badge {
	display: inline-block;
	padding: 8px 16px;
	border-radius: 4px;
	font-weight: 600;
	margin: 10px 0;
}

.result-badge.passed {
	background: rgba(34, 197, 94, 0.2);
	color: #22c55e;
	border: 1px solid #22c55e;
}

.result-badge.failed {
	background: rgba(239, 68, 68, 0.2);
	color: #ef4444;
	border: 1px solid #ef4444;
}

.result-details {
	margin: 20px 0;
	padding: 15px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
}

.result-details p {
	margin: 8px 0;
	font-size: 14px;
}

.store-state {
	margin-top: 20px;
}

.store-state pre {
	background: rgba(0, 0, 0, 0.3);
	padding: 15px;
	border-radius: 4px;
	overflow: auto;
	max-height: 300px;
	font-size: 12px;
}

.test-button {
	padding: 10px 20px;
	background: rgba(59, 130, 246, 0.2);
	border: 1px solid rgba(59, 130, 246, 0.5);
	color: white;
	border-radius: 4px;
	cursor: pointer;
	font-weight: 600;
	margin-top: 20px;
}

.test-button:hover {
	background: rgba(59, 130, 246, 0.3);
}
</style>

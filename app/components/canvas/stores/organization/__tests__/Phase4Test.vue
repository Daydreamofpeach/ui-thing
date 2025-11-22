<!--
  Phase 4 Test Component - Multi-Tenancy Verification

  This component tests organization-scoped state and view management.

  Expected Results:
  - Organization store initializes with master view ✅
  - Can create multiple views ✅
  - Views filter nodes correctly ✅
  - Permissions work correctly ✅
  - View switching works ✅
-->

<template>
	<div class="phase4-test-container">
		<h2>🏢 Phase 4: Multi-Tenancy Test</h2>
		<p class="test-description">
			This test verifies organization-scoped canvases and view management.
		</p>

		<div class="test-controls">
			<button class="test-button primary" @click="runMultiTenancyTest">
				🧪 Run Multi-Tenancy Test
			</button>
			<button class="test-button secondary" @click="runViewFilteringTest">
				🔍 Run View Filtering Test
			</button>
			<button class="test-button secondary" @click="runPermissionsTest">
				🔒 Run Permissions Test
			</button>
		</div>

		<div v-if="testResults" class="test-results">
			<h3>Test Results:</h3>
			<div class="result-badge" :class="[testResults.passed ? 'passed' : 'failed']">
				{{ testResults.passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED' }}
			</div>

			<div class="result-details">
				<div class="test-item" :class="{ passed: testResults.orgInitialized }">
					<span class="test-icon">{{ testResults.orgInitialized ? '✅' : '❌' }}</span>
					<span class="test-label">Organization Store Initialized</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.masterViewExists }">
					<span class="test-icon">{{ testResults.masterViewExists ? '✅' : '❌' }}</span>
					<span class="test-label">Master View Exists</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.canCreateViews }">
					<span class="test-icon">{{ testResults.canCreateViews ? '✅' : '❌' }}</span>
					<span class="test-label">Can Create Views</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.viewFilteringWorks }">
					<span class="test-icon">{{ testResults.viewFilteringWorks ? '✅' : '❌' }}</span>
					<span class="test-label">View Filtering Works</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.viewSwitchingWorks }">
					<span class="test-icon">{{ testResults.viewSwitchingWorks ? '✅' : '❌' }}</span>
					<span class="test-label">View Switching Works</span>
				</div>
				<div class="test-item" :class="{ passed: testResults.permissionsWork }">
					<span class="test-icon">{{ testResults.permissionsWork ? '✅' : '❌' }}</span>
					<span class="test-label">Permissions System Works</span>
				</div>
			</div>

			<div v-if="orgStats" class="stats-panel">
				<h4>Organization Stats:</h4>
				<div class="stat-row">
					<span class="stat-label">Organization ID:</span>
					<span class="stat-value">{{ orgStats.organizationId }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Master Nodes:</span>
					<span class="stat-value">{{ orgStats.masterNodes }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Current View Nodes:</span>
					<span class="stat-value">{{ orgStats.currentNodes }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Total Views:</span>
					<span class="stat-value">{{ orgStats.totalViews }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Active View:</span>
					<span class="stat-value">{{ orgStats.activeViewId || 'None' }}</span>
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
	import { useOrganizationStore } from "../useOrganizationStore";
	import { checkViewAccess, grantUserAccess, promoteToAdmin, togglePublicAccess } from "../useViewPermissions";

	const testResults = ref<any>(null);
	const orgStats = ref<any>(null);
	const testLog = ref<string[]>([]);

	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		testLog.value.push(`[${timestamp}] ${message}`);
		console.log(message);
	};

	/**
	 * Run multi-tenancy test
	 */
	const runMultiTenancyTest = () => {
		testLog.value = [];
		addLog("🧪 Starting Multi-Tenancy Test...");
		addLog("═".repeat(50));

		const results: any = {
			passed: false,
			orgInitialized: false,
			masterViewExists: false,
			canCreateViews: false,
			viewFilteringWorks: false,
			viewSwitchingWorks: false,
			permissionsWork: false
		};

		try {
			// Test 1: Initialize organization store
			addLog("📝 Test 1: Initialize Organization Store");
			const orgStore = useOrganizationStore("test-org-456", "user-123", "Test Organization");

			results.orgInitialized = !!orgStore;
			addLog(results.orgInitialized ? "✅ Organization store initialized" : "❌ Failed to initialize");

			// Test 2: Check master view
			addLog("\n📝 Test 2: Verify Master View");
			results.masterViewExists = orgStore.masterView && orgStore.masterView.isMaster;
			addLog(results.masterViewExists ? `✅ Master view exists: ${orgStore.masterView.name}` : "❌ Master view missing");

			// Test 3: Add nodes to master
			addLog("\n📝 Test 3: Add Nodes to Master Canvas");
			orgStore.addNodeToMaster(
				{ id: "node-A", type: "rectangle", data: { label: "Node A" } },
				{ x: 100, y: 100 }
			);
			orgStore.addNodeToMaster(
				{ id: "node-B", type: "circle", data: { label: "Node B" } },
				{ x: 300, y: 100 }
			);
			orgStore.addNodeToMaster(
				{ id: "node-C", type: "diamond", data: { label: "Node C" } },
				{ x: 500, y: 100 }
			);

			const masterNodeCount = orgStore.masterStore.nodes.value.length;
			addLog(`✅ Added 3 nodes to master canvas (total: ${masterNodeCount})`);

			// Test 4: Create filtered view
			addLog("\n📝 Test 4: Create Filtered View");
			const filteredView = orgStore.createNewView("Test View", "Shows only Node A and B");
			results.canCreateViews = !!filteredView;
			addLog(results.canCreateViews ? `✅ View created: ${filteredView.name}` : "❌ Failed to create view");

			// Test 5: Set view filters
			addLog("\n📝 Test 5: Apply View Filters");
			const filterSuccess = orgStore.viewStore.updateView(filteredView.id, {
				visibleNodeIds: ["node-A", "node-B"]
			});
			addLog(filterSuccess ? "✅ View filters applied (only A and B visible)" : "❌ Failed to apply filters");

			// Test 6: Switch to filtered view
			addLog("\n📝 Test 6: Switch to Filtered View");
			const switchSuccess = orgStore.switchToView(filteredView.id);
			results.viewSwitchingWorks = switchSuccess;
			addLog(switchSuccess ? "✅ Switched to filtered view" : "❌ Failed to switch views");

			// Test 7: Verify filtering
			addLog("\n📝 Test 7: Verify Node Filtering");
			const currentNodeCount = orgStore.currentNodes.value.length;
			results.viewFilteringWorks = currentNodeCount === 2;
			addLog(results.viewFilteringWorks
				? `✅ Filtering works! (${currentNodeCount} nodes shown out of ${masterNodeCount})`
				: `❌ Filtering failed (expected 2, got ${currentNodeCount})`);

			// Update stats
			orgStats.value = orgStore.getStats();

			// Check overall pass
			results.passed = results.orgInitialized
				&& results.masterViewExists
				&& results.canCreateViews
				&& results.viewFilteringWorks
				&& results.viewSwitchingWorks;

			testResults.value = results;

			addLog("\n═".repeat(50));
			addLog(results.passed ? "🎉 Multi-Tenancy Test PASSED!" : "❌ Multi-Tenancy Test FAILED");
		} catch (error) {
			addLog(`❌ Test error: ${error}`);
			testResults.value = { passed: false };
		}
	};

	/**
	 * Test view filtering in detail
	 */
	const runViewFilteringTest = () => {
		testLog.value = [];
		addLog("🧪 Starting View Filtering Test...");

		try {
			const orgStore = useOrganizationStore("test-org-filter", "user-filter", "Filter Test Org");

			// Add nodes
			for (let i = 1; i <= 10; i++) {
				orgStore.addNodeToMaster(
					{ id: `node-${i}`, type: "rectangle", data: { label: `Node ${i}` } },
					{ x: i * 100, y: 100 }
				);
			}

			addLog(`✅ Added 10 nodes to master canvas`);

			// Create view showing only odd-numbered nodes
			const oddView = orgStore.createNewView("Odd Nodes View");
			orgStore.viewStore.updateView(oddView.id, {
				visibleNodeIds: ["node-1", "node-3", "node-5", "node-7", "node-9"]
			});

			addLog(`✅ Created 'Odd Nodes View' (5 nodes)`);

			// Switch to odd view
			orgStore.switchToView(oddView.id);
			const oddCount = orgStore.currentNodes.value.length;

			addLog(oddCount === 5
				? `✅ Odd view shows 5 nodes (correct!)`
				: `❌ Odd view shows ${oddCount} nodes (expected 5)`);

			// Create view hiding specific nodes
			const hiddenView = orgStore.createNewView("Hidden Nodes View");
			orgStore.viewStore.updateView(hiddenView.id, {
				hiddenNodeIds: ["node-2", "node-4", "node-6", "node-8"]
			});

			addLog(`✅ Created 'Hidden Nodes View' (hides 4 nodes)`);

			// Switch to hidden view
			orgStore.switchToView(hiddenView.id);
			const visibleCount = orgStore.currentNodes.value.length;

			addLog(visibleCount === 6
				? `✅ Hidden view shows 6 nodes (10 - 4 = 6, correct!)`
				: `❌ Hidden view shows ${visibleCount} nodes (expected 6)`);

			// Switch back to master
			orgStore.switchToMaster();
			const masterCount = orgStore.currentNodes.value.length;

			addLog(masterCount === 10
				? `✅ Master view shows all 10 nodes`
				: `❌ Master view shows ${masterCount} nodes (expected 10)`);

			if (testResults.value) {
				testResults.value.viewFilteringWorks = oddCount === 5 && visibleCount === 6 && masterCount === 10;
			}

			orgStats.value = orgStore.getStats();
		} catch (error) {
			addLog(`❌ Filtering test error: ${error}`);
		}
	};

	/**
	 * Test permissions system
	 */
	const runPermissionsTest = () => {
		testLog.value = [];
		addLog("🧪 Starting Permissions Test...");

		try {
			// User 1 creates a view
			const user1Id = "user-owner";
			const user2Id = "user-guest";
			const user3Id = "user-admin";

			const orgStore = useOrganizationStore("test-org-permissions", user1Id, "Permissions Test Org");

			addLog(`✅ User 1 (${user1Id}) creates organization`);

			// Create a private view
			const privateView = orgStore.createNewView("Private View", "Only owner can access");

			addLog(`✅ Created private view: ${privateView.name}`);

			// Test 1: Owner can access
			const ownerAccess = checkViewAccess(privateView, user1Id, []);
			const ownerCanView = ownerAccess.canView && ownerAccess.canEdit && ownerAccess.canDelete;

			addLog(ownerCanView
				? `✅ Owner has full access (view, edit, delete)`
				: `❌ Owner access check failed`);

			// Test 2: Non-owner cannot access
			const guestAccess = checkViewAccess(privateView, user2Id, []);
			const guestCannotView = !guestAccess.canView;

			addLog(guestCannotView
				? `✅ Guest user cannot access private view (correct!)`
				: `❌ Guest user has access (should be blocked)`);

			// Test 3: Grant access to guest
			addLog(`\n📝 Granting access to guest user...`);
			privateView.permissions = grantUserAccess(privateView.permissions, user2Id);

			const guestAccessAfter = checkViewAccess(privateView, user2Id, []);
			const guestCanViewNow = guestAccessAfter.canView;

			addLog(guestCanViewNow
				? `✅ Guest can now view (access granted)`
				: `❌ Guest still cannot view (grant failed)`);

			// Test 4: Promote user to admin
			addLog(`\n📝 Promoting user to admin...`);
			privateView.permissions = promoteToAdmin(privateView.permissions, user3Id);

			const adminAccess = checkViewAccess(privateView, user3Id, []);
			const adminCanEdit = adminAccess.canView && adminAccess.canEdit;

			addLog(adminCanEdit
				? `✅ Admin can view and edit`
				: `❌ Admin promotion failed`);

			// Test 5: Make view public
			addLog(`\n📝 Making view public...`);
			privateView.permissions = togglePublicAccess(privateView.permissions);

			const randomUserAccess = checkViewAccess(privateView, "random-user-999", []);
			const publicWorks = randomUserAccess.canView;

			addLog(publicWorks
				? `✅ Public access works (any user can view)`
				: `❌ Public access failed`);

			// Check overall pass
			const permissionsPassed = ownerCanView && guestCannotView && guestCanViewNow && adminCanEdit && publicWorks;

			if (testResults.value) {
				testResults.value.permissionsWork = permissionsPassed;
				testResults.value.passed = testResults.value.passed && permissionsPassed;
			} else {
				testResults.value = {
					passed: permissionsPassed,
					permissionsWork: permissionsPassed
				};
			}

			addLog(permissionsPassed ? "🎉 Permissions Test PASSED!" : "❌ Permissions Test FAILED");
		} catch (error) {
			addLog(`❌ Permissions test error: ${error}`);
		}
	};
</script>

<style scoped>
.phase4-test-container {
	padding: 20px;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 8px;
	color: white;
	max-width: 800px;
	margin: 20px;
}

h2 {
	font-size: 1.3rem;
	font-weight: 700;
	margin-bottom: 8px;
}

.test-description {
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 16px;
	font-size: 0.9rem;
}

.test-controls {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
	flex-wrap: wrap;
}

.test-button {
	padding: 8px 16px;
	border-radius: 6px;
	font-size: 0.85rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
}

.test-button.primary {
	background: rgba(59, 130, 246, 0.15);
	border-color: rgba(59, 130, 246, 0.5);
	color: #3b82f6;
}

.test-button.primary:hover {
	background: rgba(59, 130, 246, 0.25);
}

.test-button.secondary {
	background: rgba(168, 85, 247, 0.15);
	border-color: rgba(168, 85, 247, 0.5);
	color: #a855f7;
}

.test-button.secondary:hover {
	background: rgba(168, 85, 247, 0.25);
}

.test-results {
	margin-top: 20px;
}

.result-badge {
	display: inline-block;
	padding: 8px 16px;
	border-radius: 6px;
	font-weight: 700;
	margin: 10px 0;
	font-size: 0.95rem;
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
	gap: 6px;
	margin: 16px 0;
}

.test-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 14px;
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
	font-size: 1.1rem;
}

.test-label {
	font-size: 0.85rem;
	color: rgba(255, 255, 255, 0.9);
}

.stats-panel {
	background: rgba(0, 0, 0, 0.3);
	padding: 14px;
	border-radius: 6px;
	margin: 16px 0;
}

.stats-panel h4 {
	font-size: 0.95rem;
	margin-bottom: 10px;
	color: rgba(255, 255, 255, 0.8);
}

.stat-row {
	display: flex;
	justify-content: space-between;
	padding: 6px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	font-size: 0.8rem;
}

.stat-row:last-child {
	border-bottom: none;
}

.stat-label {
	color: rgba(255, 255, 255, 0.6);
}

.stat-value {
	font-weight: 600;
}

.test-log {
	background: rgba(0, 0, 0, 0.4);
	padding: 12px;
	border-radius: 6px;
	max-height: 250px;
	overflow-y: auto;
}

.test-log h4 {
	font-size: 0.95rem;
	margin-bottom: 10px;
	color: rgba(255, 255, 255, 0.8);
}

.log-entries {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.log-entry {
	font-family: monospace;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.7);
	padding: 3px 6px;
	background: rgba(255, 255, 255, 0.02);
	border-radius: 3px;
}

.test-log::-webkit-scrollbar {
	width: 6px;
}

.test-log::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
}

.test-log::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.4);
	border-radius: 3px;
}
</style>


<template>
	<div class="user-management-panel h-full w-full flex flex-col">
		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<h3 class="panel-title">
					<UIcon name="i-lucide-users" class="size-5" />
					User Management
				</h3>
				<p class="panel-subtitle">
					Manage organization users
				</p>
			</div>
			<div class="header-actions">
				<button
					class="panel-switch-btn"
					title="Back to components panel"
					@click="handleSwitchToOriginalPanel"
				>
					<UIcon name="i-lucide-arrow-left" class="size-4" />
				</button>
			</div>
		</div>

		<!-- Search Bar -->
		<div class="search-section">
			<div class="search-input-wrapper">
				<UIcon name="i-lucide-search" class="search-icon" />
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search users..."
					class="search-input"
				>
				<button
					v-if="searchQuery"
					class="clear-search-button"
					@click="searchQuery = ''"
				>
					<UIcon name="i-lucide-x" class="size-3" />
				</button>
			</div>
		</div>

		<!-- Content Area -->
		<div class="panel-content">
			<!-- Loading State -->
			<div v-if="isLoadingMembers" class="loading-state">
				<UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary/60" />
				<p class="text-sm text-white/60 mt-3">
					Loading users...
				</p>
			</div>

			<!-- Error State -->
			<div v-else-if="membersError" class="error-state">
				<UIcon name="i-lucide-alert-circle" class="size-8 text-red-400 mb-3" />
				<p class="text-sm text-red-400 mb-4">
					{{ membersError }}
				</p>
				<button
					class="glassmorphic-button px-4 py-2 text-sm text-primary border border-primary/30 hover:border-primary/50 transition-all duration-200"
					@click="loadUsers"
				>
					<UIcon name="i-lucide-refresh-cw" class="size-4 mr-2" />
					Try Again
				</button>
			</div>

			<!-- Users List -->
			<div v-else-if="filteredUsers.length > 0" class="users-list">
				<div v-for="user in filteredUsers" :key="user.id" class="user-item">
					<div class="user-info">
						<div class="user-avatar">
							{{ getUserInitials(user) }}
						</div>
						<div class="user-details">
							<div class="user-name">
								{{ user.name || 'Unnamed User' }}
							</div>
							<div class="user-email">
								{{ user.email || 'No email' }}
							</div>
							<div class="user-role">
								{{ getMemberRole(user) }}
							</div>
						</div>
					</div>
					<div class="user-actions">
						<button
							class="add-node-btn"
							:title="`Add ${user.name || 'User'} node to canvas`"
							@click="addUserNodeToCanvas(user)"
						>
							<UIcon name="i-lucide-plus" class="size-4" />
							Add Node
						</button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="empty-state">
				<UIcon name="i-lucide-users" class="size-12 text-white/20 mb-3" />
				<p class="text-sm text-white/50 mb-2">
					{{ searchQuery ? 'No users match your search' : 'No users found' }}
				</p>
				<p v-if="!searchQuery" class="text-xs text-white/40">
					Users will appear here when they are added to the organization
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { useOrganizationMembers } from "~/composables/useOrganizationMembers";

	// Props
	const props = defineProps<{
		organizationId?: string
		projectId?: string
	}>();

	// Emits
	const emit = defineEmits<{
		addComponentNode: [componentType: string, componentData: any]
		switchToOriginalPanel: []
	}>();

	// Use organization members composable
	const orgIdRef = ref(props.organizationId);
	watch(() => props.organizationId, (newId) => {
		orgIdRef.value = newId;
	});
	const {
		members,
		isLoadingMembers,
		membersError,
		fetchMembers,
		getMemberRole
	} = useOrganizationMembers(orgIdRef);

	// Local state
	const searchQuery = ref("");

	// Computed
	const filteredUsers = computed(() => {
		if (!searchQuery.value) return members.value;
		const query = searchQuery.value.toLowerCase();
		return members.value.filter((user: any) =>
			(user.name?.toLowerCase().includes(query))
			|| (user.email?.toLowerCase().includes(query))
			|| (getMemberRole(user)?.toLowerCase().includes(query))
		);
	});

	// Methods
	const loadUsers = async () => {
		if (!props.organizationId) {
			console.warn("⚠️ UserManagementPanel: No organization ID provided");
			return;
		}

		try {
			console.log("🔧 UserManagementPanel: Loading users for organization:", props.organizationId);
			await fetchMembers(props.organizationId);
			console.log(`✅ UserManagementPanel: Loaded ${members.value.length} users`);
		} catch (err: any) {
			console.error("❌ UserManagementPanel: Error loading users:", err);
		}
	};

	const getUserInitials = (user: any) => {
		if (user.name) {
			const names = user.name.split(" ");
			return names.map((n: string) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
		}
		return user.email ? user.email.charAt(0).toUpperCase() : "U";
	};

	const addUserNodeToCanvas = (user: any) => {
		console.log("🔧 UserManagementPanel: Adding user node to canvas:", user);

		// Create a proper UserFlowNode structure for getUser type
		const nodeId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const userNodeData = {
			id: nodeId,
			type: "userNode",
			name: `${user.name || "User"} Node`,
			description: `Get user data for ${user.name || user.email}`,
			position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
			fields: [
				{
					id: "userId",
					name: "User ID",
					type: "string",
					value: user.id,
					required: true,
					description: "Unique user identifier"
				}
			],
			connections: [],
			status: "idle",
			// Include the user data for reference
			userData: user,
			// This is the data that will be passed to the actual UserNode component
			data: {
				id: user.id,
				name: user.name || "Unnamed User",
				email: user.email,
				role: getMemberRole(user),
				nodeType: "userNode",
				userData: user,
				fields: [
					{
						id: "userId",
						name: "User ID",
						type: "string",
						value: user.id,
						required: true,
						description: "Unique user identifier"
					}
				],
				status: "idle",
				lastResult: null,
				lastError: null
			}
		};

		emit("addComponentNode", "user", userNodeData);
	};

	const handleSwitchToOriginalPanel = () => {
		console.log("🔄 UserManagementPanel: Switching back to original panel");
		emit("switchToOriginalPanel");
	};

	// Watch for organization changes
	watch(() => props.organizationId, (newOrgId) => {
		if (newOrgId) {
			loadUsers();
		}
	});

	// Load users on mount
	onMounted(() => {
		console.log("🎬 UserManagementPanel mounted with props:", {
			organizationId: props.organizationId
		});
		if (props.organizationId) {
			loadUsers();
		}
	});
</script>

<style scoped>
	.user-management-panel {
		background: rgba(var(--color-neutral-rgb), 0.05);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.1);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid rgba(var(--color-neutral-rgb), 0.1);
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.panel-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.panel-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-switch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		color: var(--color-primary);
		transition: all 0.2s;
		cursor: pointer;
	}

	.panel-switch-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.search-section {
		padding: 1rem;
		border-bottom: 1px solid rgba(var(--color-neutral-rgb), 0.1);
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		background: rgba(var(--color-neutral-rgb), 0.08);
		border-radius: 0.5rem;
		border: 1px solid rgba(var(--color-neutral-rgb), 0.12);
		transition: all 0.2s;
	}

	.search-input-wrapper:focus-within {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		color: var(--color-text-secondary);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 0.75rem 0.75rem 2.5rem;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.search-input::placeholder {
		color: var(--color-text-secondary);
	}

	.clear-search-button {
		position: absolute;
		right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: rgba(var(--color-neutral-rgb), 0.1);
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-search-button:hover {
		background: rgba(var(--color-neutral-rgb), 0.2);
		color: var(--color-text);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
	}

	.users-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.user-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(var(--color-neutral-rgb), 0.08);
		border-radius: 0.75rem;
		border: 1px solid rgba(var(--color-neutral-rgb), 0.12);
		transition: all 0.2s;
	}

	.user-item:hover {
		background: rgba(var(--color-primary-rgb), 0.08);
		border-color: rgba(var(--color-primary-rgb), 0.2);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.user-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: rgba(var(--color-primary-rgb), 0.2);
		color: var(--color-primary);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.user-email {
		color: var(--color-text-secondary);
		font-size: 0.75rem;
	}

	.user-role {
		color: var(--color-text-secondary);
		font-size: 0.75rem;
	}

	.user-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.add-node-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 0.5rem;
		color: var(--color-primary);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-node-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		transform: translateY(-1px);
	}

	.glassmorphic-button {
		background: rgba(var(--color-neutral-rgb), 0.10);
		backdrop-filter: blur(18px) saturate(1.3);
		border: 1.5px solid rgba(var(--color-neutral-rgb), 0.13);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.glassmorphic-button:hover:not(:disabled) {
		background: rgba(var(--color-primary-rgb), 0.15);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
	}
</style>


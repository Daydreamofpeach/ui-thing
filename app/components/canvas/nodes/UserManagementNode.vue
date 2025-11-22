<template>
	<div class="user-management-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<UIcon name="i-lucide-user-circle" class="size-8" :style="{ color: themeColor }" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			title="USER MANAGEMENT"
			:title-color="themeColor"
			:theme-color="themeColor"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete user management node"
			@close="handleClose"
		/>

		<!-- User Selection/Configuration -->
		<NodePanel
			v-if="!customNodeProps.data?.selectedUserId"
			panel-class="user-config-container"
			:scrollbar-color="scrollbarColor"
		>
			<!-- Mode Selection -->
			<ModeSelector
				v-model="userMode"
				:active-color="activeColorRGB"
			/>

			<!-- Select Existing User -->
			<RecordSelector
				v-if="userMode === 'select'"
				:records="availableUsers"
				:is-loading="isLoadingUsers"
				:selected-id="selectedUserId"
				record-type-singular="user"
				record-type-plural="users"
				header-title="Available Users"
				header-icon="i-lucide-users"
				item-icon="i-lucide-user"
				icon-class="text-purple-400"
				:theme-color="activeColorRGB"
				:show-meta="true"
				@select="selectUser"
				@attach="attachSelectedUser"
			>
				<template #item="{ record: user, isSelected }">
					<div class="user-record-item" :class="{ selected: isSelected }" :style="getUserItemStyle(user)">
						<div class="user-record-header">
							<div class="user-avatar" :style="getUserAvatarStyle(user)">
								<UIcon name="i-lucide-user" class="size-4" />
							</div>
							<span class="user-name">{{ getUserDisplayName(user) }}</span>
							<UIcon
								v-if="isSelected"
								name="i-lucide-check-circle"
								class="size-4 text-green-400 ml-auto"
							/>
						</div>
						<div v-if="user.email" class="user-email">
							{{ user.email }}
						</div>
						<div class="user-meta">
							<span class="user-role-badge" :style="getUserRoleBadgeStyle(user)">
								{{ getUserRole(user) }}
							</span>
							<!-- Slot for custom user groups -->
							<slot name="user-group-badge" :user="user">
								<!-- Custom user groups can be added here -->
							</slot>
						</div>
					</div>
				</template>
				<template #empty-state>
					<UIcon name="i-lucide-users" class="w-8 h-8 text-white/30" />
					<p class="text-sm text-white/50">
						No users available
					</p>
					<p class="text-xs text-white/40">
						Switch to "Create New" to add a user
					</p>
				</template>
			</RecordSelector>

			<!-- Create New User Form -->
			<UserForm
				v-else-if="userMode === 'create'"
				mode="create"
				:user-data="{
					name: customNodeProps.data?.userName,
					email: customNodeProps.data?.email,
					role: customNodeProps.data?.role || 'member'
				}"
				:is-loading="isCreating"
				@update-field="(key: string, value: any) => updateNodeData(customNodeProps.id, `user${key.charAt(0).toUpperCase() + key.slice(1)}`, value)"
				@submit="createUserFromNode"
			/>
		</NodePanel>

		<!-- User Status Display (User Selected) -->
		<NodePanel
			v-else
			panel-class="user-status-display"
			:scrollbar-color="scrollbarColor"
		>
			<UserDetails
				:user="selectedUserData"
				:theme-color="themeColor"
				@change-user="changeUserSelection"
			/>
		</NodePanel>
	</div>
</template>

<script lang="ts" setup>
	import UserDetails from "@canvas/nodes/shared/UserDetails.vue";
	import UserForm from "@canvas/nodes/shared/UserForm.vue";
	import ModeSelector from "@canvas/shared/ModeSelector.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import RecordSelector from "@canvas/shared/RecordSelector.vue";
	import { buttClient } from "@utils/buttClient";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref, watch } from "vue";
	import "./styles/nodeContainer.css";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		organisationId?: string
		createChildUserNode?: (parentNodeId: string, userData: any) => void
		userSelected?: (userData: any, nodeId: string) => void
	}

	const props = withDefaults(defineProps<Props>(), {
		organisationId: "",
		createChildUserNode: undefined,
		userSelected: undefined
	});

	const emit = defineEmits<{
		closeNode: [nodeId: string]
	}>();

	// User selection state
	const userMode = ref<"select" | "create">("select");
	const selectedUserId = ref<string | null>(null);
	const availableUsers = ref<any[]>([]);
	const isLoadingUsers = ref(false);
	const isCreating = ref(false);
	const selectedUserData = computed(() => {
		if (!props.customNodeProps.data?.selectedUserId) return null;

		const baseUser = availableUsers.value.find((u) => u.id === props.customNodeProps.data.selectedUserId);
		if (!baseUser) return null;

		// Merge with tasks and projects from node data
		return {
			...baseUser,
			assignedTasks: props.customNodeProps.data?.assignedTasks || [],
			assignedProjects: props.customNodeProps.data?.assignedProjects || []
		};
	});

	// Helper function to convert hex to RGB
	const hexToRgb = (hex: string): string => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return "139, 92, 246"; // Default purple RGB
		const r = Number.parseInt(result[1] || "8b", 16);
		const g = Number.parseInt(result[2] || "5c", 16);
		const b = Number.parseInt(result[3] || "f6", 16);
		return `${r}, ${g}, ${b}`;
	};

	// Theme colors based on role
	const roleColors: Record<string, string> = {
		admin: "#10b981", // Green
		owner: "#10b981", // Green
		member: "#3b82f6", // Blue
		developer: "#8b5cf6", // Purple
		guest: "#f59e0b" // Amber
	};

	// Get role color for a user
	const getUserRoleColor = (user: any) => {
		const role = (user.role || "member").toLowerCase();
		return roleColors[role] || roleColors.member;
	};

	// Default theme color
	const themeColor = computed(() => {
		if (selectedUserData.value) {
			return getUserRoleColor(selectedUserData.value);
		}
		return "#8b5cf6"; // Purple default
	});

	const activeColorRGB = computed(() => {
		const color = themeColor.value || "#8b5cf6";
		// Convert hex to RGB (remove # if present)
		const hex = color.replace("#", "");
		const r = Number.parseInt(hex.substring(0, 2), 16);
		const g = Number.parseInt(hex.substring(2, 4), 16);
		const b = Number.parseInt(hex.substring(4, 6), 16);
		return `${r}, ${g}, ${b}`;
	});

	const scrollbarColor = computed(() => `rgba(${activeColorRGB.value}, 0.4)`);

	// Fetch organization users
	const fetchOrganizationUsers = async () => {
		if (!props.organisationId) {
			console.warn("⚠️ UserManagementNode: No organisation ID provided");
			return;
		}

		isLoadingUsers.value = true;
		try {
			console.log("🔧 UserManagementNode: Fetching users for organization:", props.organisationId);

			const org = await buttClient.findByIdOrganisation(props.organisationId);
			console.log("🏢 Organization data:", org);

			// Determine who the organization owner is (PROVEN METHOD from OrganizationDashboardPanel)
			const orgOwnerEmail = (org as any)?.creator || (org as any)?.createdBy || (org as any)?.ownerEmail;
			const orgOwnerId = (org as any)?.creatorId || (org as any)?.ownerId;
			console.log("👑 Organization owner:", { email: orgOwnerEmail, id: orgOwnerId });

			const memberIds = org?.owners || [];
			availableUsers.value = [];

			// Convert member IDs to user objects
			if (Array.isArray(memberIds)) {
				for (const id of memberIds) {
					try {
						const user = await (buttClient as any).getUserUser?.(id) || {
							id,
							email: `user-${id}@example.com`,
							name: `User ${id}`
						};

						// Determine role: Owner if matches org creator, otherwise Member (PROVEN METHOD)
						const isOwner = (orgOwnerEmail && user.email === orgOwnerEmail)
							|| (orgOwnerId && id === orgOwnerId)
							|| (memberIds.length === 1);

						console.log(`  User ${user.email}: isOwner=${isOwner}`);

						availableUsers.value.push({
							id,
							email: user.email,
							name: user.name,
							role: isOwner ? "owner" : "member",
							isOwner
						});
					} catch (userError) {
						console.warn("⚠️ UserManagementNode: Failed to fetch user:", id, userError);
					}
				}
			}

			console.log(`✅ UserManagementNode: Loaded ${availableUsers.value.length} users`);
			console.log("  Users:", availableUsers.value);
		} catch (err: any) {
			console.error("❌ UserManagementNode: Error fetching users:", err);
		} finally {
			isLoadingUsers.value = false;
		}
	};

	// User display helpers
	const getUserDisplayName = (user: any) => {
		return user.name || user.email || "Unnamed User";
	};

	const getUserRole = (user: any) => {
		return (user.role || "member").toUpperCase();
	};

	const getUserItemStyle = (user: any) => {
		const color = getUserRoleColor(user) || "#8b5cf6";
		const rgb = hexToRgb(color);
		return {
			borderColor: `rgba(${rgb}, 0.2)`,
			backgroundColor: `rgba(${rgb}, 0.05)`
		};
	};

	const getUserAvatarStyle = (user: any) => {
		const color = getUserRoleColor(user) || "#8b5cf6";
		const rgb = hexToRgb(color);
		return {
			backgroundColor: `rgba(${rgb}, 0.2)`,
			borderColor: `rgba(${rgb}, 0.4)`,
			color
		};
	};

	const getUserRoleBadgeStyle = (user: any) => {
		const color = getUserRoleColor(user) || "#8b5cf6";
		const rgb = hexToRgb(color);
		return {
			backgroundColor: `rgba(${rgb}, 0.2)`,
			borderColor: `rgba(${rgb}, 0.3)`,
			color
		};
	};

	// Select a user
	const selectUser = (user: any) => {
		selectedUserId.value = user.id;
		console.log("👤 Selected user:", getUserDisplayName(user));
	};

	// Attach selected user to node
	const attachSelectedUser = async (selectedUser: any) => {
		if (!selectedUser) return;

		console.log("═══════════════════════════════════════════");
		console.log("👤 ATTACHING SELECTED USER TO NODE");
		console.log("  Selected user:", selectedUser);
		console.log("  User ID:", selectedUser.id);
		console.log("  User Name:", getUserDisplayName(selectedUser));
		console.log("  User Role:", getUserRole(selectedUser));
		console.log("═══════════════════════════════════════════");

		// Get organization owner information (PROVEN METHOD from OrganizationDashboardPanel)
		const org = await buttClient.findByIdOrganisation(props.organisationId);
		const orgOwnerEmail = (org as any)?.creator || (org as any)?.createdBy || (org as any)?.ownerEmail;
		const orgOwnerId = (org as any)?.creatorId || (org as any)?.ownerId;

		// Determine if this user is the owner (PROVEN METHOD)
		const isUserOwner = (orgOwnerEmail && selectedUser.email === orgOwnerEmail)
			|| (orgOwnerId && selectedUser.id === orgOwnerId)
			|| selectedUser.isOwner === true;

		console.log("🔐 Is user owner?", {
			isUserOwner,
			userEmail: selectedUser.email,
			orgOwnerEmail,
			userId: selectedUser.id,
			orgOwnerId
		});

		// Update node data IMMEDIATELY
		props.updateNodeData(props.customNodeProps.id, "selectedUserId", selectedUser.id);
		props.updateNodeData(props.customNodeProps.id, "userName", getUserDisplayName(selectedUser));
		props.updateNodeData(props.customNodeProps.id, "email", selectedUser.email);
		props.updateNodeData(props.customNodeProps.id, "role", isUserOwner ? "owner" : (selectedUser.role || "member"));
		props.updateNodeData(props.customNodeProps.id, "status", "configured");
		props.updateNodeData(props.customNodeProps.id, "organizationId", props.organisationId);
		props.updateNodeData(props.customNodeProps.id, "organizationOwnerEmail", orgOwnerEmail);
		props.updateNodeData(props.customNodeProps.id, "organizationOwnerId", orgOwnerId);
		props.updateNodeData(props.customNodeProps.id, "userData", {
			...selectedUser,
			isOwner: isUserOwner
		});
		props.updateNodeData(props.customNodeProps.id, "isOwner", isUserOwner);
		props.updateNodeData(props.customNodeProps.id, "isAdmin", isUserOwner); // Owners are admins

		// Initialize with empty arrays
		props.updateNodeData(props.customNodeProps.id, "assignedTasks", []);
		props.updateNodeData(props.customNodeProps.id, "assignedProjects", []);

		// Fetch user's assigned tasks and projects in background
		let orgProjects: any[] = [];
		try {
			console.log("📋 Fetching tasks assigned to user:", selectedUser.id);

			// Get all projects for this organization (proven working method)
			const allProjects = await buttClient.findAllProject();
			orgProjects = allProjects.filter((p: any) => p.organisationId === props.organisationId);
			console.log("  Found", orgProjects.length, "projects in organization");

			// Fetch tasks for each project (proven working method)
			const allTasksPromises = orgProjects.map((p: any) =>
				buttClient.getTasksByProjectId(p.id).catch((err: any) => {
					console.warn(`  Failed to fetch tasks for project ${p.id}:`, err);
					return [];
				})
			);
			const allTasksArrays = await Promise.all(allTasksPromises);
			const allTasks = allTasksArrays.flat();
			console.log("  Total tasks loaded:", allTasks.length);

			// Create project map for attaching names
			const projectMap = new Map(orgProjects.map((p: any) => [p.id, p]));

			// Filter tasks assigned to this user
			const userTasks = allTasks
				.filter((task: any) => {
					const desc = task.description || "";
					return desc.includes(`[ASSIGNED:${selectedUser.id}|`) || desc.includes(`[ASSIGNED:${selectedUser.id}]`);
				})
				.map((task: any) => {
					const project = projectMap.get(task.projectId);
					return {
						...task,
						projectName: project?.name || "Unknown Project"
					};
				});

			console.log(`✅ Found ${userTasks.length} tasks assigned to user`);

			// Get unique projects from tasks
			const userProjectIds = new Set(userTasks.map((t: any) => t.projectId).filter(Boolean));
			const userProjects = Array.from(userProjectIds).map((projectId) => {
				const project = projectMap.get(projectId);
				const projectTasks = userTasks.filter((t: any) => t.projectId === projectId);
				return {
					id: projectId,
					name: project?.name || "Unknown Project",
					description: project?.description,
					taskCount: projectTasks.length
				};
			});

			console.log(`✅ User is part of ${userProjects.length} projects`);

			// Update node data with fetched tasks and projects
			props.updateNodeData(props.customNodeProps.id, "assignedTasks", userTasks);
			props.updateNodeData(props.customNodeProps.id, "assignedProjects", userProjects);

			// Also store all organization projects for admin/owner users
			props.updateNodeData(props.customNodeProps.id, "allOrganizationProjects", orgProjects);
		} catch (error) {
			console.error("❌ Failed to fetch user tasks/projects:", error);
		}

		// Emit user selected event
		const userDataToEmit = {
			id: selectedUser.id,
			name: getUserDisplayName(selectedUser),
			email: selectedUser.email,
			role: isUserOwner ? "owner" : (selectedUser.role || "member"),
			isOwner: isUserOwner,
			isAdmin: isUserOwner,
			allOrganizationProjects: orgProjects,
			organizationId: props.organisationId,
			organizationOwnerEmail: orgOwnerEmail,
			organizationOwnerId: orgOwnerId
		};

		// Call user selected handler if provided
		if (props.userSelected) {
			console.log("📤 Calling userSelected handler:", userDataToEmit);
			props.userSelected(userDataToEmit, props.customNodeProps.id);
		}

		// Create child node connected to this user
		if (props.createChildUserNode) {
			console.log("👶 Creating child user node for selected user");
			console.log("  Is User Owner:", isUserOwner);
			console.log("  All Org Projects:", orgProjects.length);
			props.createChildUserNode(props.customNodeProps.id, userDataToEmit);
		}

		console.log("✅ User attached successfully!");
		console.log("═══════════════════════════════════════════");
	};

	// Create user from node data
	const createUserFromNode = async () => {
		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔧 CREATING NEW USER FROM NODE DATA");
			console.log("  Node data:", props.customNodeProps.data);
			console.log("  Organisation ID:", props.organisationId);
			console.log("═══════════════════════════════════════════");

			// TODO: Implement actual user creation via API
			// For now, just update node data
			const newUserId = `user-${Date.now()}`;
			props.updateNodeData(props.customNodeProps.id, "selectedUserId", newUserId);
			props.updateNodeData(props.customNodeProps.id, "status", "configured");

			console.log("✅ User created (placeholder)");
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to create user in node:", error);
		}
	};

	// Change user selection (allows user to select a different user)
	const changeUserSelection = () => {
		console.log("🔄 Changing user selection - clearing selectedUserId");
		props.updateNodeData(props.customNodeProps.id, "selectedUserId", null);
		// Switch back to select mode
		userMode.value = "select";
	};

	// Handle close button click
	const handleClose = () => {
		emit("closeNode", props.customNodeProps.id);
	};

	// Watch for organisationId changes
	watch(() => props.organisationId, (newOrgId) => {
		if (newOrgId) {
			fetchOrganizationUsers();
		}
	});

	// Load users on mount
	onMounted(() => {
		console.log("🎬 UserManagementNode mounted with props:", {
			organisationId: props.organisationId,
			nodeId: props.customNodeProps?.id
		});
		if (props.organisationId) {
			fetchOrganizationUsers();
		}
	});
</script>

<style scoped>
/* User management node specific styles */
.user-management-node-container {
	width: 600px;
	height: 650px;
	min-width: 600px;
	min-height: 650px;
	max-height: 650px;
	border: 2px solid #8b5cf6;
}

/* Connection Handles */
.connection-handle {
	width: 0.75rem;
	height: 0.75rem;
	border: 2px solid rgba(139, 92, 246, 0.6);
	background-color: rgba(139, 92, 246, 0.2);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	border-color: rgba(139, 92, 246, 1);
	background-color: rgba(139, 92, 246, 0.4);
}

/* User Record Item Styles */
.user-record-item {
	padding: 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	width: 100%;
	position: relative;
}

.user-record-item:hover {
	background: rgba(255, 255, 255, 0.08);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.user-record-item.selected {
	background: rgba(139, 92, 246, 0.15);
	border-color: rgba(139, 92, 246, 0.5);
	box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.user-record-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.5rem;
}

.user-avatar {
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid;
	transition: all 0.2s ease;
}

.user-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
}

.user-email {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 0.5rem;
}

.user-meta {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
	align-items: center;
}

.user-role-badge {
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	border: 1px solid;
}
</style>

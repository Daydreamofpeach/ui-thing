<template>
	<div class="task-details">
		<!-- Task Info Card -->
		<div class="task-info-card">
			<div class="task-header">
				<div class="task-icon" :style="iconStyle">
					<UIcon name="i-lucide-check-square" class="size-6" />
				</div>
				<div class="task-info">
					<h3 class="task-name-large">
						{{ task.name || task.title || "Unnamed Task" }}
					</h3>
					<p v-if="task.description" class="task-description-large">
						{{ task.description }}
					</p>
				</div>
			</div>

			<!-- Status & Priority -->
			<div class="status-section">
				<span class="status-badge" :style="statusBadgeStyle">
					{{ getTaskStatus(task) }}
				</span>
				<span v-if="task.priority" class="priority-badge" :style="priorityBadgeStyle">
					{{ getTaskPriority(task) }}
				</span>
			</div>

			<!-- Task Stats -->
			<div class="task-stats">
				<div class="stat-item">
					<UIcon name="i-lucide-users" class="size-4" />
					<span class="stat-value">{{ task.assignedUsers?.length || 0 }}</span>
					<span class="stat-label">Assigned</span>
				</div>
			</div>
		</div>

		<!-- Assigned Users Section -->
		<div v-if="task" class="users-section">
			<div class="section-header">
				<UIcon name="i-lucide-users" class="size-4 text-primary" />
				<span class="section-title">Assigned Users</span>
				<span v-if="task.assignedUsers && task.assignedUsers.length > 0" class="count-badge">
					{{ task.assignedUsers.length }}
				</span>
			</div>

			<!-- Assigned Users List -->
			<div v-if="task.assignedUsers && task.assignedUsers.length > 0" class="users-list assigned">
				<div
					v-for="user in task.assignedUsers"
					:key="user.id"
					class="user-item"
					:style="getUserItemStyle(user)"
				>
					<div class="user-item-header">
						<div class="user-avatar" :style="getUserAvatarStyle(user)">
							<UIcon name="i-lucide-user" class="size-4" />
						</div>
						<div class="user-info">
							<span class="user-name">{{ getUserDisplayName(user) }}</span>
							<span v-if="user.email" class="user-email">{{ user.email }}</span>
						</div>
					</div>
					<button
						class="unassign-button"
						title="Unassign user"
						@click="handleUserUnassign(user.id)"
					>
						<UIcon name="i-lucide-x" class="size-3.5" />
					</button>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else class="empty-state">
				<UIcon name="i-lucide-user-x" class="size-8 text-white/20" />
				<p class="text-sm text-white/50">
					No users assigned yet
				</p>
			</div>

			<!-- Available Users to Assign -->
			<div v-if="availableUsers && availableUsers.length > 0" class="assign-section">
				<div class="section-subtitle">
					<UIcon name="i-lucide-user-plus" class="size-3.5" />
					Assign More Users
				</div>
				<div class="users-list available">
					<button
						v-for="user in unassignedUsers"
						:key="user.id"
						class="user-item assignable"
						:style="getUserItemStyle(user)"
						@click="handleUserAssign(user.id)"
					>
						<div class="user-item-header">
							<div class="user-avatar" :style="getUserAvatarStyle(user)">
								<UIcon name="i-lucide-user" class="size-4" />
							</div>
							<div class="user-info">
								<span class="user-name">{{ getUserDisplayName(user) }}</span>
								<span v-if="user.email" class="user-email">{{ user.email }}</span>
							</div>
						</div>
						<div class="assign-icon">
							<UIcon name="i-lucide-plus-circle" class="size-4" />
						</div>
					</button>
				</div>
			</div>
		</div>

		<!-- Subtasks Section -->
		<div class="subtasks-section">
			<div class="section-header">
				<UIcon name="i-lucide-list-tree" class="size-4 text-primary" />
				<span class="section-title">Subtasks</span>
				<span v-if="props.subtasks.length > 0" class="count-badge">
					{{ props.subtasks.length }}
				</span>
			</div>

			<!-- Subtasks List -->
			<div v-if="props.subtasks.length > 0" class="subtasks-list">
				<button
					v-for="subtask in props.subtasks"
					:key="subtask.id"
					class="subtask-item"
					@click="emit('subtaskClick', subtask)"
				>
					<div class="subtask-icon">
						<UIcon name="i-lucide-corner-down-right" class="size-4 text-indigo-400" />
					</div>
					<div class="subtask-info">
						<span class="subtask-name">{{ subtask.name }}</span>
						<span class="subtask-status" :style="getSubtaskStatusStyle(subtask)">
							{{ subtask.status || subtask.jiraStatus }}
						</span>
					</div>
				</button>
			</div>

			<!-- Empty state -->
			<div v-else class="empty-state small">
				<p class="text-xs text-white/40">
					No subtasks yet
				</p>
			</div>

			<!-- Add Subtask Button -->
			<button class="add-subtask-button" @click="emit('addSubtask')">
				<UIcon name="i-lucide-plus-circle" class="size-4" />
				<span>Add Subtask</span>
			</button>
		</div>

		<!-- Show in Orbit Button -->
		<button class="orbit-button" @click="emit('showInOrbit')">
			<UIcon name="i-lucide-orbit" class="size-5" />
			<span>View in Task Orbit</span>
		</button>

		<!-- Actions -->
		<div class="task-actions">
			<button
				class="action-button secondary"
				@click="handleChangeTask"
			>
				<UIcon name="i-lucide-refresh-cw" class="size-4" />
				Change Task
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	interface Props {
		task: any | null
		themeColor: string
		availableUsers?: any[]
		subtasks?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		availableUsers: () => [],
		subtasks: () => []
	});

	const emit = defineEmits<{
		changeTask: []
		userAssign: [userId: string]
		userUnassign: [userId: string]
		addSubtask: []
		subtaskClick: [subtask: any]
		showInOrbit: []
	}>();

	// Safety check
	if (!props.task) {
		console.error("❌ TaskDetails: Received null task prop!");
		console.log("  Available props:", props);
	}

	// Status and priority colors
	const statusColors: Record<string, string> = {
		"To Do": "#6366f1",
		"In Progress": "#3b82f6",
		"In Review": "#f59e0b",
		Done: "#10b981",
		Blocked: "#ef4444",
		Cancelled: "#6b7280"
	};

	const priorityColors: Record<string, string> = {
		low: "#10b981",
		medium: "#f59e0b",
		high: "#f97316",
		urgent: "#ef4444"
	};

	const roleColors: Record<string, string> = {
		owner: "#9333ea",
		admin: "#ef4444",
		manager: "#22c55e",
		member: "#3b82f6"
	};

	// Computed styles
	const iconStyle = computed(() => ({
		backgroundColor: `${props.themeColor}30`,
		borderColor: `${props.themeColor}60`,
		color: props.themeColor
	}));

	const statusBadgeStyle = computed(() => {
		const color = getTaskStatusColor(props.task);
		return {
			backgroundColor: `${color}30`,
			borderColor: `${color}60`,
			color
		};
	});

	const priorityBadgeStyle = computed(() => {
		const color = getTaskPriorityColor(props.task);
		return {
			backgroundColor: `${color}30`,
			borderColor: `${color}60`,
			color
		};
	});

	// Filter out already assigned users
	const unassignedUsers = computed(() => {
		const assignedIds = new Set((props.task.assignedUsers || []).map((u: any) => u.id));
		return props.availableUsers.filter((user) => !assignedIds.has(user.id));
	});

	// Helper functions
	function getTaskStatus(task: any): string {
		return task.status || "To Do";
	}

	function getTaskPriority(task: any): string {
		const priority = task.priority || "medium";
		return priority.charAt(0).toUpperCase() + priority.slice(1);
	}

	function getTaskStatusColor(task: any): string {
		const status = getTaskStatus(task);
		return statusColors[status] || "#6366f1";
	}

	function getTaskPriorityColor(task: any): string {
		const priority = (task.priority || "medium").toLowerCase();
		return priorityColors[priority] || "#f59e0b";
	}

	function getUserDisplayName(user: any): string {
		return user.name || user.firstName || user.email?.split("@")[0] || "Unknown User";
	}

	function getUserRole(user: any): string {
		const roleData = user.role;
		const role = typeof roleData === "string" ? roleData : roleData?.name || "member";
		return role.charAt(0).toUpperCase() + role.slice(1);
	}

	function getUserRoleColor(user: any): string {
		const role = (getUserRole(user) || "member").toLowerCase();
		return roleColors[role] || "#3b82f6";
	}

	function getUserItemStyle(user: any) {
		const color = getUserRoleColor(user);
		return {
			borderColor: `${color}40`,
			backgroundColor: `${color}10`
		};
	}

	function getUserAvatarStyle(user: any) {
		const color = getUserRoleColor(user);
		return {
			backgroundColor: `${color}20`,
			borderColor: `${color}40`,
			color
		};
	}

	function handleChangeTask() {
		emit("changeTask");
	}

	function handleUserAssign(userId: string) {
		emit("userAssign", userId);
	}

	function handleUserUnassign(userId: string) {
		emit("userUnassign", userId);
	}

	function getSubtaskStatusStyle(subtask: any) {
		const subtaskStatusColors: Record<string, string> = {
			"To Do": "#6b7280",
			"In Progress": "#3b82f6",
			Done: "#10b981",
			Blocked: "#ef4444"
		};
		const status = subtask.status || subtask.jiraStatus || "To Do";
		const color = subtaskStatusColors[status] || "#6b7280";

		return {
			backgroundColor: `${color}30`,
			borderColor: `${color}60`,
			color
		};
	}
</script>

<style scoped>
.task-details {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.task-info-card {
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.75rem;
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.task-header {
	display: flex;
	gap: 1rem;
}

.task-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	border-radius: 0.75rem;
	border: 1px solid;
	flex-shrink: 0;
}

.task-info {
	flex: 1;
	min-width: 0;
}

.task-name-large {
	font-size: 1.125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	margin: 0 0 0.5rem 0;
	word-wrap: break-word;
}

.task-description-large {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.5;
	margin: 0;
}

.status-section {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.status-badge,
.priority-badge {
	padding: 0.375rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
	border: 1px solid;
	letter-spacing: 0.05em;
}

.task-stats {
	display: flex;
	gap: 1rem;
	padding-top: 0.75rem;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.875rem;
}

.stat-value {
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.stat-label {
	font-size: 0.75rem;
}

/* Users Section */
.users-section {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(99, 102, 241, 0.2);
	border-radius: 0.75rem;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}

.section-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
}

.section-subtitle {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	margin-top: 0.5rem;
	margin-bottom: 0.5rem;
}

.count-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 1.5rem;
	height: 1.5rem;
	padding: 0 0.375rem;
	background: rgba(99, 102, 241, 0.2);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.75rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(99, 102, 241, 0.9);
}

.users-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	max-height: 12rem;
	overflow-y: auto;
}

.users-list.available {
	max-height: 8rem;
}

/* Custom scrollbar */
.users-list::-webkit-scrollbar {
	width: 6px;
}

.users-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.users-list::-webkit-scrollbar-thumb {
	background: rgba(99, 102, 241, 0.4);
	border-radius: 3px;
}

.users-list::-webkit-scrollbar-thumb:hover {
	background: rgba(99, 102, 241, 0.6);
}

.user-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid;
	border-radius: 0.5rem;
	transition: all 0.2s ease;
}

.user-item.assignable {
	cursor: pointer;
}

.user-item.assignable:hover {
	transform: translateX(4px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-item-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex: 1;
	min-width: 0;
}

.user-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: 0.5rem;
	border: 1px solid;
	flex-shrink: 0;
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	min-width: 0;
	flex: 1;
}

.user-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-email {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.unassign-button,
.assign-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.75rem;
	height: 1.75rem;
	border-radius: 0.375rem;
	border: 1px solid rgba(239, 68, 68, 0.4);
	background: rgba(239, 68, 68, 0.2);
	color: rgba(239, 68, 68, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.unassign-button:hover {
	background: rgba(239, 68, 68, 0.4);
	border-color: rgba(239, 68, 68, 0.6);
}

.assign-icon {
	border-color: rgba(99, 102, 241, 0.4);
	background: rgba(99, 102, 241, 0.2);
	color: rgba(99, 102, 241, 0.9);
	pointer-events: none;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 2rem 1rem;
	text-align: center;
}

.assign-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding-top: 0.75rem;
	border-top: 1px solid rgba(99, 102, 241, 0.1);
}

/* Actions */
.task-actions {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.action-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	flex: 1;
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
}

.action-button.secondary {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.2);
	color: rgba(255, 255, 255, 0.9);
}

.action-button.secondary:hover {
	background: rgba(255, 255, 255, 0.15);
	border-color: rgba(255, 255, 255, 0.3);
	transform: translateY(-1px);
}

/* Subtasks Section */
.subtasks-section {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(99, 102, 241, 0.2);
	border-radius: 0.75rem;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.subtasks-list {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	max-height: 10rem;
	overflow-y: auto;
}

.subtasks-list::-webkit-scrollbar {
	width: 6px;
}

.subtasks-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.subtasks-list::-webkit-scrollbar-thumb {
	background: rgba(99, 102, 241, 0.4);
	border-radius: 3px;
}

.subtasks-list::-webkit-scrollbar-thumb:hover {
	background: rgba(99, 102, 241, 0.6);
}

.subtask-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.625rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.5rem;
	transition: all 0.2s ease;
	cursor: pointer;
	width: 100%;
	text-align: left;
}

.subtask-item:hover {
	transform: translateX(4px);
	background: rgba(99, 102, 241, 0.1);
	border-color: rgba(99, 102, 241, 0.5);
	box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.subtask-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.75rem;
	height: 1.75rem;
	flex-shrink: 0;
}

.subtask-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
	min-width: 0;
}

.subtask-name {
	font-size: 0.8125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.subtask-status {
	font-size: 0.6875rem;
	font-weight: 600;
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	border: 1px solid;
	display: inline-block;
	align-self: flex-start;
}

.add-subtask-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.625rem;
	background: rgba(99, 102, 241, 0.1);
	border: 1px dashed rgba(99, 102, 241, 0.4);
	border-radius: 0.5rem;
	color: rgba(99, 102, 241, 0.9);
	font-size: 0.8125rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 100%;
}

.add-subtask-button:hover {
	background: rgba(99, 102, 241, 0.2);
	border-color: rgba(99, 102, 241, 0.6);
	transform: translateY(-1px);
}

.empty-state.small {
	padding: 1rem;
}

/* Orbit Button */
.orbit-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 1rem;
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
	border: 1px solid rgba(16, 185, 129, 0.4);
	border-radius: 0.75rem;
	color: rgba(16, 185, 129, 0.95);
	font-size: 0.9375rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	width: 100%;
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.orbit-button:hover {
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15));
	border-color: rgba(16, 185, 129, 0.6);
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
}
</style>

<template>
	<!-- Copied from client/app/components/nodes/user/AdminUserNode.vue -->
	<div class="admin-user-node">
		<div class="node-header admin-header">
			<div class="node-icon admin-icon">
				<img v-if="userIcon" :src="userIcon" :alt="userName" class="user-avatar-img">
				<div v-else class="user-avatar-fallback">
					{{ getUserInitials() }}
				</div>
			</div>
			<div class="node-title-section">
				<h3 class="node-title">
					{{ userName }}
				</h3>
				<p class="node-subtitle admin-badge">
					👑 {{ userRole }}
				</p>
			</div>
		</div>
		<div class="user-node-container">
			<div class="user-info-section">
				<div class="user-info-grid">
					<div class="info-item">
						<span class="info-label">Email</span>
						<span class="info-value">{{ userEmail || 'No email' }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Role</span>
						<span class="info-value role-badge admin-role-badge">{{ userRole }}</span>
					</div>
					<div v-if="userStatus" class="info-item">
						<span class="info-label">Status</span>
						<span class="info-value status-badge" :class="getStatusClass()">{{ userStatus }}</span>
					</div>
				</div>
			</div>
			<div class="user-stats-section">
				<div class="stats-grid">
					<div class="stat-item">
						<UIcon name="i-lucide-list-checks" class="size-5 text-green-400" />
						<div class="stat-info">
							<span class="stat-value">{{ assignedTasks.length }}</span>
							<span class="stat-label">Assigned Tasks</span>
						</div>
					</div>
					<div class="stat-item">
						<UIcon name="i-lucide-folder-kanban" class="size-5 text-green-400" />
						<div class="stat-info">
							<span class="stat-value">{{ allOrgProjects.length }}</span>
							<span class="stat-label">Organization Projects</span>
						</div>
					</div>
				</div>
			</div>
			<div v-if="allOrgProjects.length > 0" class="user-projects-section">
				<div class="section-title admin-section-title">
					<UIcon name="i-lucide-crown" class="size-4 text-green-400" />
					All Organization Projects
					<span class="count-badge admin-count-badge">{{ filteredProjects.length }} / {{ allOrgProjects.length }}</span>
				</div>
				<div class="project-search">
					<div class="search-input-wrapper">
						<UIcon name="i-lucide-search" class="search-icon" />
						<input v-model="projectSearchQuery" type="text" placeholder="Search projects..." class="search-input">
						<button v-if="projectSearchQuery" class="clear-search" @click="projectSearchQuery = ''">
							<UIcon name="i-lucide-x" class="size-3.5" />
						</button>
					</div>
				</div>
				<div class="projects-list">
					<div v-for="project in filteredProjects" :key="project.id" class="project-group admin-project-group">
						<div class="project-header">
							<div class="project-icon">
								<UIcon name="i-lucide-folder-kanban" class="size-4" />
							</div>
							<div class="project-info">
								<span class="project-name">{{ project.name }}</span>
								<span class="project-task-count">{{ project.tasks.length }} task{{ project.tasks.length !== 1 ? 's' : '' }}</span>
							</div>
						</div>
						<div v-if="project.tasks.length > 0" class="project-tasks">
							<div v-for="task in project.tasks" :key="task.id" class="task-item" :style="getTaskItemStyle(task)">
								<div class="task-icon" :style="getTaskIconStyle(task)">
									<UIcon name="i-lucide-check-square" class="size-4" />
								</div>
								<div class="task-info">
									<span class="task-name">{{ task.name || task.title || "Unnamed Task" }}</span>
									<span v-if="task.description" class="task-description">{{ getCleanDescription(task.description) }}</span>
								</div>
								<span class="task-status-badge" :style="getTaskStatusBadgeStyle(task)">
									{{ getTaskStatus(task) }}
								</span>
							</div>
						</div>
						<div v-else class="no-tasks-message">No tasks in this project yet</div>
					</div>
				</div>
			</div>
			<div v-if="allOrgProjects.length === 0" class="empty-state">
				<UIcon name="i-lucide-inbox" class="size-12 text-white/20" />
				<p class="text-sm text-white/50">No projects in this organization yet</p>
			</div>
		</div>
		<div class="node-controls">
			<div class="node-actions">
				<button class="config-button" title="Configure Node" @click="configureNode">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</button>
				<button class="delete-button" title="Delete Node" @click="deleteNode">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";

	interface Props {
		customNodeProps?: any
		data?: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{ configure: [nodeId: string]; delete: [nodeId: string]; refreshUser: [userId: string]; }>();

	// Base data
	const nodeData = computed(() => props.customNodeProps?.data || props.data || {});
	const userData = computed(() => nodeData.value.userData || {});

	// Search/filter state
	const projectSearchQuery = ref("");

	// Tasks and projects
	const assignedTasks = computed(() => nodeData.value.assignedTasks || []);
	const allOrgProjects = computed(() => {
		const projects = nodeData.value.allOrganizationProjects || [];
		const projectMap = new Map<string, any>();
		projects.forEach((project: any) => {
			projectMap.set(project.id, {
				id: project.id,
				name: project.name,
				description: project.description,
				tasks: []
			});
		});
		assignedTasks.value.forEach((task: any) => {
			const projectId = task.projectId;
			if (projectId && projectMap.has(projectId)) {
				projectMap.get(projectId).tasks.push(task);
			}
		});
		return Array.from(projectMap.values());
	});

	const filteredProjects = computed(() => {
		if (!projectSearchQuery.value.trim()) return allOrgProjects.value;
		const q = projectSearchQuery.value.toLowerCase();
		return allOrgProjects.value.filter((project: any) =>
			project.name.toLowerCase().includes(q)
			|| (project.description && project.description.toLowerCase().includes(q))
		);
	});

	// User info
	const userName = computed(() => userData.value?.name || (userData.value as any)?.firstName || userData.value?.email || "Admin User");
	const userEmail = computed(() => userData.value?.email || "");
	const userRole = computed(() => "Admin / Owner");
	const userIcon = computed(() => (userData.value as any)?.avatar || (userData.value as any)?.profileImage || null);
	const userStatus = computed(() => (userData.value as any)?.status || (userData.value?.isActive ? "active" : "inactive"));

	const getUserInitials = () => {
		const name = userName.value;
		if (name && name !== "Admin User") {
			const words = name.split(" ").filter((w) => w.length > 0);
			if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
			return words[0][0].toUpperCase();
		}
		const email = userEmail.value;
		if (email) return email[0].toUpperCase();
		return "A";
	};

	const getStatusClass = () => {
		const status = userStatus.value;
		return {
			"status-active": status === "active",
			"status-inactive": status === "inactive" || status === "suspended",
			"status-pending": status === "pending"
		};
	};

	// Events
	const configureNode = () => {
		emit("configure", (props.customNodeProps?.id || nodeData.value.id) as string);
	};
	const deleteNode = () => {
		emit("delete", (props.customNodeProps?.id || nodeData.value.id) as string);
	};

	// Task display helpers
	const taskStatusColors: Record<string, string> = {
		"To Do": "#10b981",
		"In Progress": "#3b82f6",
		"In Review": "#f59e0b",
		Done: "#10b981",
		Blocked: "#ef4444",
		Cancelled: "#6b7280"
	};

	const getTaskStatus = (task: any) => task.status || "To Do";

	const getTaskItemStyle = (task: any) => {
		const status = getTaskStatus(task);
		const color = taskStatusColors[status] || taskStatusColors["To Do"];
		return { borderLeft: `3px solid ${color}` };
	};

	const getTaskIconStyle = (task: any) => {
		const status = getTaskStatus(task);
		const color = taskStatusColors[status] || taskStatusColors["To Do"];
		return { background: `${color}20`, border: `1px solid ${color}40`, color: `${color}EE` };
	};

	const getTaskStatusBadgeStyle = (task: any) => {
		const status = getTaskStatus(task);
		const color = taskStatusColors[status] || taskStatusColors["To Do"];
		return { background: `${color}20`, border: `1px solid ${color}40`, color: `${color}EE` };
	};

	const getCleanDescription = (description: string) => {
		if (!description) return "";
		return description
			.replace(/\[ASSIGNED:[^\]]+\]/g, "")
			.replace(/\[ParentTask:[^\]]+\]/g, "")
			.trim();
	};
</script>

<style scoped>
	/* Styles copied from client */
	.admin-user-node { position: relative; width: 100%; min-width: 450px; max-width: 600px; background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(16, 185, 129, 0.1) 100%); border: 2px solid rgba(16, 185, 129, 0.5); border-radius: 1rem; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3); overflow: hidden; }
	.admin-header { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%); border-bottom: 2px solid rgba(16, 185, 129, 0.3); }
	.admin-icon { border: 2px solid rgba(16, 185, 129, 0.5); background: rgba(16, 185, 129, 0.2); }
	.admin-badge { color: rgba(16, 185, 129, 0.95) !important; font-weight: 600; }
	.admin-role-badge { background: rgba(16, 185, 129, 0.2) !important; border-color: rgba(16, 185, 129, 0.4) !important; color: rgba(16, 185, 129, 0.95) !important; }
	.admin-section-title { color: rgba(16, 185, 129, 0.95); }
	.admin-count-badge { background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.3); color: rgba(16, 185, 129, 0.95); }
	.admin-project-group { border-left: 3px solid rgba(16, 185, 129, 0.4); }
	/* Remaining detailed styles preserved in client code */
</style>


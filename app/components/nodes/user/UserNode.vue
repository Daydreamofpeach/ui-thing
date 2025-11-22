<template>
	<!-- copied from client/app/components/nodes/user/UserNode.vue -->
	<!-- Full content preserved to mirror client behavior -->
	<div class="user-node-container node-container">
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<img v-if="userIcon && !imageError" :src="userIcon" :alt="userName" class="user-avatar-img" crossorigin="anonymous" @error="handleImageError" @load="handleImageLoad">
			<div v-else class="user-avatar-fallback" :style="{ color: themeColor }">
				{{ getUserInitials() }}
			</div>
		</div>
		<UserTaskOrbit :tasks="assignedTasks" :user-name="userName" :user-icon="userIcon" :theme-color="themeColor" :is-active="showOrbit" @close="handleOrbitClose" />
		<NodeHeader :title="userName" :theme-color="themeColor" @close="handleClose">
			<template #icon>
				<UIcon name="i-lucide-user-circle" class="size-5" />
			</template>
			<template #subtitle>
				<span class="node-subtitle">User Profile</span>
			</template>
		</NodeHeader>
		<NodePanel panel-class="user-info-panel" :scrollbar-color="scrollbarColor">
			<div class="user-info-section">
				<div class="user-info-grid">
					<div class="info-item">
						<span class="info-label">Email</span>
						<span class="info-value">{{ userEmail || 'No email' }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Role</span>
						<span class="info-value role-badge" :class="getRoleClass()">{{ userRole }}</span>
					</div>
					<div v-if="userStatus" class="info-item">
						<span class="info-label">Status</span>
						<span class="info-value status-badge" :class="getStatusClass()">{{ userStatus }}</span>
					</div>
				</div>
				<button v-if="assignedTasks && assignedTasks.length > 0" class="orbit-toggle-button" :class="{ active: showOrbit }" @click="toggleOrbit">
					<UIcon name="i-lucide-orbit" class="size-4" />
					<span>{{ showOrbit ? 'Hide' : 'Show' }} Task Orbit</span>
					<div class="task-count-badge">
						{{ assignedTasks.length }}
					</div>
				</button>
			</div>
			<div v-if="hasAdditionalInfo" class="user-details-section">
				<div class="section-title">
					<UIcon name="i-lucide-info" class="size-4" />
					Details
				</div>
				<div class="details-grid">
					<div v-if="userPhone" class="detail-item">
						<span class="detail-label">Phone</span>
						<span class="detail-value">{{ userPhone }}</span>
					</div>
					<div v-if="userDepartment" class="detail-item">
						<span class="detail-label">Department</span>
						<span class="detail-value">{{ userDepartment }}</span>
					</div>
					<div v-if="userLocation" class="detail-item">
						<span class="detail-label">Location</span>
						<span class="detail-value">{{ userLocation }}</span>
					</div>
				</div>
			</div>
			<div v-if="assignedTasks && assignedTasks.length > 0" class="user-stats-section">
				<div class="stats-grid">
					<div class="stat-item">
						<UIcon name="i-lucide-list-checks" class="size-5 text-indigo-400" />
						<div class="stat-info">
							<span class="stat-value">{{ assignedTasks.length }}</span>
							<span class="stat-label">Tasks</span>
						</div>
					</div>
					<div class="stat-item">
						<UIcon name="i-lucide-folder-kanban" class="size-5 text-blue-400" />
						<div class="stat-info">
							<span class="stat-value">{{ userProjects.length }}</span>
							<span class="stat-label">Projects</span>
						</div>
					</div>
				</div>
			</div>
			<div v-if="userProjects.length > 0" class="user-projects-section">
				<div class="section-title">
					<UIcon name="i-lucide-folder-open" class="size-4" />
					Active Projects
					<span class="count-badge">{{ filteredProjects.length }} / {{ userProjects.length }}</span>
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
					<div v-for="project in filteredProjects" :key="project.id" class="project-group">
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
					</div>
				</div>
			</div>
			<div v-if="!assignedTasks || assignedTasks.length === 0" class="empty-state">
				<UIcon name="i-lucide-inbox" class="size-12 text-white/20" />
				<p class="text-sm text-white/50">
					No tasks assigned yet
				</p>
			</div>
			<div class="add-to-project-section">
				<button class="section-toggle-button" :class="{ active: showAddToProject }" @click="showAddToProject = !showAddToProject">
					<UIcon name="i-lucide-plus-circle" class="size-4" />
					<span>Add to Project</span>
					<UIcon :name="showAddToProject ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4 ml-auto" />
				</button>
				<div v-if="showAddToProject" class="project-assignment-panel">
					<div v-if="isLoadingAvailableProjects" class="loading-state">
						<UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
						<span>Loading projects...</span>
					</div>
					<div v-else-if="availableProjects.length === 0" class="no-projects-state">
						<UIcon name="i-lucide-check-circle-2" class="size-5" />
						<span>User is assigned to all projects</span>
					</div>
					<div v-else class="available-projects-list">
						<div v-for="project in availableProjects" :key="project.id" class="available-project-item" @click="handleAssignToProject(project)">
							<div class="project-icon">
								<UIcon name="i-lucide-folder-plus" class="size-4" />
							</div>
							<div class="project-info">
								<span class="project-name">{{ project.name }}</span>
								<span v-if="project.description" class="project-description">
									{{ project.description }}
								</span>
							</div>
							<button class="assign-button">
								<UIcon name="i-lucide-plus" class="size-3.5" />
								<span>Add</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
	import UserTaskOrbit from "@canvas/nodes/shared/UserTaskOrbit.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import { buttClient } from "@utils/buttClient";
	import { Handle, Position, useVueFlow } from "@vue-flow/core";
	import { computed, nextTick, ref, watch } from "vue";

	interface Props {
		customNodeProps?: any
		data?: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
		showTaskOrbit?: boolean
	}

	const props = withDefaults(defineProps<Props>(), { showTaskOrbit: false });
	const emit = defineEmits<{ configure: [nodeId: string]; delete: [nodeId: string]; refreshUser: [userId: string]; closeNode: [nodeId: string]; }>();
	const { removeNodes } = useVueFlow();
	const nodeData = computed(() => props.customNodeProps?.data || props.data || {});
	const showOrbit = ref(false);
	watch([() => props.showTaskOrbit, () => nodeData.value.showTaskOrbit], ([propValue, dataValue]) => {
		showOrbit.value = propValue || dataValue || false;
	}, { immediate: true });
	const userData = computed(() => nodeData.value.userData || {});
	const isOrganizationOwner = computed(() => {
		const user = userData.value;
		const orgOwnerEmail = nodeData.value.organizationOwnerEmail;
		const orgOwnerId = nodeData.value.organizationOwnerId;
		const isOwnerByEmail = orgOwnerEmail && user.email && user.email.toLowerCase() === orgOwnerEmail.toLowerCase();
		const isOwnerById = orgOwnerId && user.id && String(user.id) === String(orgOwnerId);
		return isOwnerByEmail || isOwnerById;
	});
	const isAdmin = computed(() => {
		const role = userData.value?.role;
		const roleString = typeof role === "string" ? role : role?.name || "";
		return roleString.toLowerCase() === "admin" || roleString.toLowerCase() === "owner" || isOrganizationOwner.value;
	});
	const themeColor = computed(() => {
		const themeColorFromData = nodeData.value.themeColor;
		if (themeColorFromData) return themeColorFromData;
		const role = userData.value?.role;
		const roleString = typeof role === "string" ? role : role?.name || "";
		if (isOrganizationOwner.value) return "#9333ea";
		if (roleString.toLowerCase() === "admin") return "#ef4444";
		if (roleString.toLowerCase() === "manager") return "#10b981";
		return "#3b82f6";
	});
	const scrollbarColor = computed(() => themeColor.value);
	const projectSearchQuery = ref("");
	const showAddToProject = ref(false);
	const isLoadingAvailableProjects = ref(false);
	const allOrganizationProjects = ref<any[]>([]);
	const assignedTasks = computed(() => nodeData.value.assignedTasks || []);
	const userProjects = computed(() => {
		const tasks = assignedTasks.value;
		if (isAdmin.value && allOrganizationProjects.value.length > 0) {
			const projectMap = new Map<string, any>();
			allOrganizationProjects.value.forEach((project: any) => {
				projectMap.set(project.id, { id: project.id, name: project.name, tasks: [] });
			});
			tasks.forEach((task: any) => {
				const projectId = task.projectId;
				if (projectId && projectMap.has(projectId)) {
					projectMap.get(projectId).tasks.push(task);
				}
			});
			return Array.from(projectMap.values());
		}
		if (!tasks || tasks.length === 0) return [];
		const projectMap = new Map<string, any>();
		tasks.forEach((task: any) => {
			const projectId = task.projectId;
			if (!projectId) return;
			if (!projectMap.has(projectId)) {
				projectMap.set(projectId, { id: projectId, name: task.projectName || `Project ${projectId}`, tasks: [] });
			}
			projectMap.get(projectId).tasks.push(task);
		});
		return Array.from(projectMap.values());
	});
	const filteredProjects = computed(() => {
		if (!projectSearchQuery.value.trim()) return userProjects.value;
		const query = projectSearchQuery.value.toLowerCase();
		return userProjects.value.filter((project: any) => project.name.toLowerCase().includes(query));
	});
	const availableProjects = computed(() => {
		const assignedProjectIds = new Set(userProjects.value.map((p: any) => p.id));
		return allOrganizationProjects.value.filter((project: any) => !assignedProjectIds.has(project.id));
	});
	const userName = computed(() => userData.value?.name || (userData.value as any)?.firstName || userData.value?.email || "Unknown User");
	const userEmail = computed(() => userData.value?.email || "");
	const userRole = computed(() => {
		const roleData = userData.value?.role;
		let role = typeof roleData === "string" ? roleData : roleData?.name || "member";
		if (isOrganizationOwner.value) role = "Owner";
		return role.charAt(0).toUpperCase() + role.slice(1);
	});
	const userStatus = computed(() => (userData.value as any)?.status || (userData.value?.isActive ? "active" : "inactive"));
	const userIcon = ref<string | null>(null);
	const imageError = ref(false);
	const handleImageError = (_event: Event) => { imageError.value = true; userIcon.value = null; };
	const handleImageLoad = (_event: Event) => { imageError.value = false; };
	const loadUserIcon = async () => {
		imageError.value = false;
		const iconFromData = userData.value?.icon || (userData.value as any)?.avatar || (userData.value as any)?.profilePicture;
		if (iconFromData) { userIcon.value = iconFromData; await nextTick(); return; }
		const userId = userData.value?.id;
		if (userId) {
			try {
				const response = await buttClient.getUserIcon(userId);
				if (response?.icon) {
					userIcon.value = response.icon;
					await nextTick();
				}
			} catch {}
		}
	};
	watch(() => userData.value?.id, (newId) => { if (newId) loadUserIcon(); }, { immediate: true });
	const hasAdditionalInfo = computed(() => !!((userData.value as any)?.phone || (userData.value as any)?.department || (userData.value as any)?.location));
	const userPhone = computed(() => (userData.value as any)?.phone);
	const userDepartment = computed(() => (userData.value as any)?.department);
	const userLocation = computed(() => (userData.value as any)?.location);
	const getUserInitials = () => {
		const name = userName.value;
		if (name && name !== "Unknown User") {
			const words = name.split(" ");
			if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
			return words[0][0].toUpperCase();
		}
		const email = userEmail.value;
		if (email) return email[0].toUpperCase();
		return "U";
	};
	const getRoleClass = () => {
		const roleData = userData.value?.role;
		const role = typeof roleData === "string" ? roleData : roleData?.name || "member";
		return {
			"role-owner": role === "owner" || isOrganizationOwner.value,
			"role-admin": role === "admin" || isAdmin.value,
			"role-manager": role === "manager",
			"role-member": (role === "member" || !role) && !isAdmin.value && !isOrganizationOwner.value
		};
	};
	const getStatusClass = () => {
		const status = userStatus.value;
		return {
			"status-active": status === "active",
			"status-inactive": status === "inactive" || status === "suspended",
			"status-pending": status === "pending"
		};
	};
	const fetchAvailableProjects = async () => {
		isLoadingAvailableProjects.value = true;
		try {
			const organizationId = nodeData.value.organizationId;
			if (!organizationId) return;
			const allProjects = await buttClient.findAllProject();
			const orgProjects = allProjects.filter((p: any) => String(p.organisationId) === String(organizationId));
			allOrganizationProjects.value = orgProjects;
		} catch {
		} finally {
			isLoadingAvailableProjects.value = false;
		}
	};
	const handleAssignToProject = async (project: any) => {
		try {
			const user = userData.value;
			const userId = user.id || nodeData.value.userId;
			const userName = user.name || user.firstName || user.email || "User";
			await buttClient.createTask({ name: `${userName} - Project Access`, description: `[ASSIGNED:${userId}|${userName}] Access granted for ${project.name}`, status: "To Do", projectId: project.id, priority: "Low" });
			if (props.updateNodeData) emit("refreshUser", userId);
			showAddToProject.value = false;
		} catch {}
	};
	watch(() => nodeData.value.allOrganizationProjects, (projects) => {
		if (projects && Array.isArray(projects)) allOrganizationProjects.value = projects;
	}, { immediate: true });
	watch(showAddToProject, async (isOpen) => { if (isOpen && allOrganizationProjects.value.length === 0) await fetchAvailableProjects(); });
	const handleClose = () => { if (props.customNodeProps?.id) removeNodes([props.customNodeProps.id]); };
	const toggleOrbit = () => { showOrbit.value = !showOrbit.value; if (props.updateNodeData && props.customNodeProps?.id) { props.updateNodeData(props.customNodeProps.id, "showTaskOrbit", showOrbit.value); } };
	const handleOrbitClose = () => { showOrbit.value = false; if (props.updateNodeData && props.customNodeProps?.id) { props.updateNodeData(props.customNodeProps.id, "showTaskOrbit", false); } };
	const taskStatusColors: Record<string, string> = { "To Do": "#6366f1", "In Progress": "#3b82f6", "In Review": "#f59e0b", Done: "#10b981", Blocked: "#ef4444", Cancelled: "#6b7280" };
	const getTaskStatus = (task: any): string => task.jiraStatus || task.status || "To Do";
	const getTaskStatusColor = (task: any): string => taskStatusColors[getTaskStatus(task)] || "#6366f1";
	const getTaskItemStyle = (task: any) => ({ borderColor: `${getTaskStatusColor(task)}40`, backgroundColor: `${getTaskStatusColor(task)}10` });
	const getTaskIconStyle = (task: any) => ({ backgroundColor: `${getTaskStatusColor(task)}20`, borderColor: `${getTaskStatusColor(task)}40`, color: getTaskStatusColor(task) });
	const getTaskStatusBadgeStyle = (task: any) => ({ backgroundColor: `${getTaskStatusColor(task)}30`, borderColor: `${getTaskStatusColor(task)}60`, color: getTaskStatusColor(task) });
	const getCleanDescription = (description: string): string => (description || "").replace(/\\[ASSIGNED:[^\\]]+\\]\\s*/g, "").replace(/\\[PROJECT:[^\\]]+\\]\\s*/g, "").replace(/\\[ORG:[^\\]]+\\]\\s*/g, "").replace(/\\[SOLUTION:[^\\]]+\\]\\s*/g, "").trim() || "No description";
</script>

<style scoped>
	/* Styles copied from client (trimmed to essentials to preserve appearance) */
	.user-node-container { width: 550px; height: 700px; min-width: 550px; min-height: 600px; max-height: 700px; position: relative; overflow: visible !important; }
	.connection-handle { width: 0.75rem; height: 0.75rem; border: 2px solid; border-color: inherit; background-color: rgba(var(--handle-color, 59, 130, 246), 0.2); border-radius: 50%; transition: all 0.2s ease; }
	.user-node-container .node-icon-wrapper .user-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
	.user-node-container .node-icon-wrapper .user-avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: rgba(255, 255, 255, 0.95); background: rgba(0, 0, 0, 0.7); text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); letter-spacing: 0.05em; }
	.node-subtitle { font-size: 0.875rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; }
	.user-info-panel { padding: 1rem; }
	.orbit-toggle-button { width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; margin-top: 1rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; color: rgba(16, 185, 129, 0.9); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
	.task-count-badge { display: flex; align-items: center; justify-content: center; min-width: 1.5rem; height: 1.5rem; padding: 0 0.5rem; background: rgba(16, 185, 129, 0.3); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 0.75rem; font-size: 0.6875rem; font-weight: 700; color: rgba(255, 255, 255, 0.95); margin-left: auto; }
	/* Remaining style rules preserved in client for full fidelity */
</style>


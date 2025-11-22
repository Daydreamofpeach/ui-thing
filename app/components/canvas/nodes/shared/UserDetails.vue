<template>
	<div class="user-details">
		<!-- User Info Card -->
		<div class="user-info-card">
			<div class="user-header">
				<div class="user-avatar-large" :style="avatarStyle">
					<UIcon name="i-lucide-user" class="size-6" />
				</div>
				<div class="user-info">
					<h3 class="user-name-large">{{ user.name || user.email || "Unnamed User" }}</h3>
					<p v-if="user.email" class="user-email-large">{{ user.email }}</p>
				</div>
			</div>

			<!-- Role Badge -->
			<div class="role-section">
				<span class="role-badge" :style="roleBadgeStyle">
					{{ getUserRole(user) }}
				</span>
			</div>

			<!-- User Stats -->
			<div class="user-stats">
				<div class="stat-item">
					<UIcon name="i-lucide-briefcase" class="size-4" />
					<span class="stat-value">{{ user.assignedProjects?.length || 0 }}</span>
					<span class="stat-label">Projects</span>
				</div>
				<div class="stat-item">
					<UIcon name="i-lucide-check-circle" class="size-4" />
					<span class="stat-value">{{ user.assignedTasks?.length || 0 }}</span>
					<span class="stat-label">Tasks</span>
				</div>
			</div>
		</div>

		<!-- Projects & Tasks Section -->
		<div v-if="userProjects.length > 0" class="user-projects-section">
			<div class="section-header">
				<UIcon name="i-lucide-folder-open" class="size-4 text-primary" />
				<span class="section-title">Active Projects</span>
			</div>
			<div class="projects-list">
				<div
					v-for="project in userProjects"
					:key="project.id"
					class="project-group"
				>
					<!-- Project Header -->
					<div class="project-header">
						<div class="project-icon">
							<UIcon name="i-lucide-folder-kanban" class="size-4" />
						</div>
						<div class="project-info">
							<span class="project-name">{{ project.name }}</span>
							<span class="project-task-count">{{ project.taskCount }} task{{ project.taskCount !== 1 ? 's' : '' }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-if="(!user.assignedTasks || user.assignedTasks.length === 0) && (!user.assignedProjects || user.assignedProjects.length === 0)" class="empty-state">
			<UIcon name="i-lucide-inbox" class="size-12 text-white/20" />
			<p class="text-sm text-white/50">
				No tasks or projects assigned yet
			</p>
		</div>

		<!-- Actions -->
		<div class="user-actions">
			<button
				class="action-button secondary"
				@click="handleChangeUser"
			>
				<UIcon name="i-lucide-refresh-cw" class="size-4" />
				Change User
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	interface Props {
		user: any
		themeColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		themeColor: "#8b5cf6"
	});

	const emit = defineEmits<{
		"change-user": []
	}>();

	// Role colors
	const roleColors: Record<string, string> = {
		admin: "#10b981",
		owner: "#10b981",
		member: "#3b82f6",
		developer: "#8b5cf6",
		guest: "#f59e0b"
	};

	const getUserRole = (user: any) => {
		return (user.role || "member").toUpperCase();
	};

	const getUserRoleColor = (user: any) => {
		const role = (user.role || "member").toLowerCase();
		return roleColors[role] || roleColors.member;
	};

	const hexToRgb = (hex: string): string => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return "139, 92, 246";
		const r = parseInt(result[1] || "8b", 16);
		const g = parseInt(result[2] || "5c", 16);
		const b = parseInt(result[3] || "f6", 16);
		return `${r}, ${g}, ${b}`;
	};

	const avatarStyle = computed(() => {
		const color = getUserRoleColor(props.user) || "#8b5cf6";
		return {
			backgroundColor: `rgba(${hexToRgb(color)}, 0.2)`,
			borderColor: `rgba(${hexToRgb(color)}, 0.4)`,
			color
		};
	});

	const roleBadgeStyle = computed(() => {
		const color = getUserRoleColor(props.user) || "#8b5cf6";
		return {
			backgroundColor: `rgba(${hexToRgb(color)}, 0.2)`,
			borderColor: `rgba(${hexToRgb(color)}, 0.3)`,
			color
		};
	});

	const handleChangeUser = () => {
		emit("change-user");
	};

	// Compute user projects from assignedProjects
	const userProjects = computed(() => {
		return props.user.assignedProjects || [];
	});
</script>

<style scoped>
	.user-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.user-info-card {
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
	}

	.user-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.user-avatar-large {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid;
	}

	.user-info {
		flex: 1;
	}

	.user-name-large {
		font-size: 1.125rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.user-email-large {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		margin: 0.25rem 0 0 0;
	}

	.role-section {
		margin-bottom: 1rem;
	}

	.role-badge {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid;
		display: inline-block;
	}

	.user-stats {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: 0.625rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.user-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.action-button.secondary {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
	}

	.action-button.secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	/* Projects Section */
	.user-projects-section {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.2);
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		flex: 1;
	}

	.projects-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 20rem;
		overflow-y: auto;
	}

	.projects-list::-webkit-scrollbar {
		width: 6px;
	}

	.projects-list::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.projects-list::-webkit-scrollbar-thumb {
		background: rgba(139, 92, 246, 0.4);
		border-radius: 3px;
	}

	.projects-list::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 92, 246, 0.6);
	}

	.project-group {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.project-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem;
		background: rgba(139, 92, 246, 0.1);
	}

	.project-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: rgba(139, 92, 246, 0.2);
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: 0.375rem;
		color: rgba(139, 92, 246, 0.9);
		flex-shrink: 0;
	}

	.project-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.project-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.project-task-count {
		font-size: 0.6875rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
		gap: 0.75rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
	}
</style>

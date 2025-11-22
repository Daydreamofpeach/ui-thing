<template>
	<div class="task-panel h-full w-full flex flex-col">
		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<h3 class="panel-title">
					<UIcon name="i-lucide-check-square" class="size-5" />
					Task Management
				</h3>
				<p class="panel-subtitle">
					Manage project tasks
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
					placeholder="Search tasks..."
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
			<div v-if="isLoading" class="loading-state">
				<UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary/60" />
				<p class="text-sm text-white/60 mt-3">
					Loading tasks...
				</p>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="error-state">
				<UIcon name="i-lucide-alert-circle" class="size-8 text-red-400 mb-3" />
				<p class="text-sm text-red-400 mb-4">
					{{ error }}
				</p>
				<button
					class="glassmorphic-button px-4 py-2 text-sm text-primary border border-primary/30 hover:border-primary/50 transition-all duration-200"
					@click="loadTasks"
				>
					<UIcon name="i-lucide-refresh-cw" class="size-4 mr-2" />
					Try Again
				</button>
			</div>

			<!-- Tasks List -->
			<div v-else-if="filteredTasks.length > 0" class="tasks-list">
				<div v-for="task in filteredTasks" :key="task.id" class="task-item">
					<div class="task-info">
						<div class="task-preview">
							<div class="task-title">
								{{ task.name || task.title || 'Untitled Task' }}
							</div>
							<div class="task-description">
								{{ task.description || 'No description' }}
							</div>
							<div class="task-meta">
								<span class="task-status" :class="getTaskStatusClass(task.jiraStatus || task.status)">
									{{ task.jiraStatus || task.status || 'To Do' }}
								</span>
								<span v-if="task.butt" class="task-priority" :class="getTaskPriorityClass(task.butt)">
									{{ task.butt }}
								</span>
							</div>
						</div>
					</div>
					<div class="task-actions">
						<button
							class="add-node-btn"
							:title="`Add ${task.name || task.title || 'Task'} node to canvas`"
							@click="addTaskNodeToCanvas(task)"
						>
							<UIcon name="i-lucide-plus" class="size-4" />
							Add Node
						</button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="empty-state">
				<UIcon name="i-lucide-check-square" class="size-12 text-white/20 mb-3" />
				<p class="text-sm text-white/50 mb-2">
					{{ searchQuery ? 'No tasks match your search' : 'No tasks found' }}
				</p>
				<p v-if="!searchQuery" class="text-xs text-white/40">
					Tasks will appear here when they are created for the project
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { buttClient } from "~/utils/buttClient";

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

	// State
	const tasks = ref<any[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const searchQuery = ref("");

	// Computed
	const filteredTasks = computed(() => {
		if (!searchQuery.value) return tasks.value;
		const query = searchQuery.value.toLowerCase();
		return tasks.value.filter((task: any) =>
			(task.name?.toLowerCase().includes(query)) ||
			(task.title?.toLowerCase().includes(query)) ||
			(task.description?.toLowerCase().includes(query)) ||
			(task.jiraStatus?.toLowerCase().includes(query)) ||
			(task.status?.toLowerCase().includes(query))
		);
	});

	// Methods
	const loadTasks = async () => {
		if (!props.projectId) {
			console.warn("⚠️ TaskPanel: No project ID provided");
			tasks.value = [];
			return;
		}

		isLoading.value = true;
		error.value = null;

		try {
			console.log("🔧 TaskPanel: Loading tasks for project:", props.projectId);

			// Use the proper API method to fetch tasks by project ID
			const tasksData = await buttClient.getTasksByProjectId(props.projectId);
			const allTasks = Array.isArray(tasksData) ? tasksData : [];
			
			console.log(`✅ TaskPanel: Loaded ${allTasks.length} total tasks`);
			
			// Separate main tasks and subtasks
			const mainTasks: any[] = [];
			const subtasksMap = new Map<string, any[]>();
			
			allTasks.forEach((task: any) => {
				// Check if this is a subtask (has [ParentTask:id] in description)
				const parentMatch = task.description?.match(/\[ParentTask:([^\]]+)\]/);
				
				if (parentMatch) {
					// This is a subtask
					const parentId = parentMatch[1];
					if (!subtasksMap.has(parentId)) {
						subtasksMap.set(parentId, []);
					}
					subtasksMap.get(parentId)!.push(task);
				} else {
					// This is a main task
					mainTasks.push(task);
				}
			});
			
			// Attach subtasks to their parent tasks
			tasks.value = mainTasks.map((task: any) => ({
				...task,
				subtasks: subtasksMap.get(task.id) || []
			}));
			
			console.log(`✅ TaskPanel: ${tasks.value.length} main tasks with subtasks`);
			
			// Debug: Log task structure to understand the data
			if (tasks.value.length > 0) {
				console.log("🔍 First task structure:", tasks.value[0]);
				if (tasks.value[0].subtasks?.length > 0) {
					console.log("🔍 First subtask:", tasks.value[0].subtasks[0]);
				}
			}
		} catch (err: any) {
			console.error("❌ TaskPanel: Error loading tasks:", err);
			error.value = err.message || "Failed to load tasks";
			tasks.value = [];
		} finally {
			isLoading.value = false;
		}
	};


	const getTaskStatusClass = (status: string) => {
		const statusLower = (status || "").toLowerCase();
		return {
			"status-pending": statusLower === "pending" || statusLower === "to do",
			"status-in-progress": statusLower === "in-progress" || statusLower === "in_progress" || statusLower === "in progress",
			"status-completed": statusLower === "completed" || statusLower === "done",
			"status-cancelled": statusLower === "cancelled" || statusLower === "canceled"
		};
	};

	const getTaskPriorityClass = (priority: string) => {
		const priorityLower = (priority || "").toLowerCase();
		return {
			"priority-high": priorityLower === "high" || priorityLower === "critical",
			"priority-medium": priorityLower === "medium" || priorityLower === "normal",
			"priority-low": priorityLower === "low"
		};
	};

	const addTaskNodeToCanvas = (task: any) => {
		console.log("🔧 TaskPanel: Adding task node to canvas:", task);

		// Create a proper task node structure for OrbitCardNode type
		const nodeId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const taskNodeData = {
			id: nodeId,
			type: "orbitCardNode",
			name: `${task.name || task.title || "Task"} Node`,
			description: task.description || `Task: ${task.name || task.title}`,
			position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
			fields: [
				{
					id: "taskId",
					name: "Task ID",
					type: "string",
					value: task.id,
					required: true,
					description: "Unique task identifier"
				}
			],
			connections: [],
			status: "idle",
			// Include the task data for reference
			taskData: task,
			// This is the data that will be passed to the actual OrbitCardNode component
			data: {
				id: task.id,
				name: task.name || task.title || "Untitled Task",
				description: task.description || "",
				status: task.jiraStatus || task.status || "To Do",
				priority: task.butt || task.priority || "medium",
				nodeType: "orbitCardNode",
				taskData: task,
				orbitTimelineData: [task], // OrbitCardNode expects timeline data
				fields: [
					{
						id: "taskId",
						name: "Task ID", 
						type: "string",
						value: task.id,
						required: true,
						description: "Unique task identifier"
					}
				],
				lastResult: null,
				lastError: null
			}
		};

		emit("addComponentNode", "task", taskNodeData);
	};

	const handleSwitchToOriginalPanel = () => {
		console.log("🔄 TaskPanel: Switching back to original panel");
		emit("switchToOriginalPanel");
	};

	// Watch for organization/project changes
	watch(() => [props.organizationId, props.projectId], ([newOrgId, newProjectId]) => {
		if (newOrgId || newProjectId) {
			loadTasks();
		}
	});

	// Load tasks on mount
	onMounted(() => {
		console.log("🎬 TaskPanel mounted with props:", {
			organizationId: props.organizationId,
			projectId: props.projectId
		});
		if (props.organizationId || props.projectId) {
			loadTasks();
		}
	});
</script>

<style scoped>
	.task-panel {
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
		flex: 1;
	}

	.panel-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.panel-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0.25rem 0 0 0;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.panel-switch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: rgba(var(--color-neutral-rgb), 0.1);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.2);
		border-radius: 0.375rem;
		color: var(--color-text-secondary);
		transition: all 0.2s;
		cursor: pointer;
	}

	.panel-switch-btn:hover {
		background: rgba(var(--color-neutral-rgb), 0.15);
		border-color: rgba(var(--color-neutral-rgb), 0.3);
		color: var(--color-text);
	}

	.search-section {
		padding: 1rem;
		border-bottom: 1px solid rgba(var(--color-neutral-rgb), 0.1);
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
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
		background: rgba(var(--color-neutral-rgb), 0.1);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.2);
		border-radius: 0.5rem;
		color: var(--color-text);
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
		background: rgba(var(--color-neutral-rgb), 0.15);
	}

	.clear-search-button {
		position: absolute;
		right: 0.75rem;
		padding: 0.25rem;
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: color 0.2s;
	}

	.clear-search-button:hover {
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
		height: 100%;
		text-align: center;
		padding: 2rem;
	}

	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.task-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(var(--color-neutral-rgb), 0.05);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.1);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.task-item:hover {
		background: rgba(var(--color-neutral-rgb), 0.1);
		border-color: rgba(var(--color-neutral-rgb), 0.2);
	}

	.task-info {
		flex: 1;
	}

	.task-preview {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.task-title {
		font-weight: 600;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.task-description {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.task-meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.task-status,
	.task-priority {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.task-status {
		background: rgba(var(--color-neutral-rgb), 0.2);
		color: var(--color-text-secondary);
	}

	.status-pending {
		background: rgba(251, 191, 36, 0.2);
		color: rgb(251, 191, 36);
	}

	.status-in-progress {
		background: rgba(59, 130, 246, 0.2);
		color: rgb(59, 130, 246);
	}

	.status-completed {
		background: rgba(34, 197, 94, 0.2);
		color: rgb(34, 197, 94);
	}

	.status-cancelled {
		background: rgba(239, 68, 68, 0.2);
		color: rgb(239, 68, 68);
	}

	.task-priority {
		background: rgba(var(--color-neutral-rgb), 0.2);
		color: var(--color-text-secondary);
	}

	.priority-high {
		background: rgba(239, 68, 68, 0.2);
		color: rgb(239, 68, 68);
	}

	.priority-medium {
		background: rgba(251, 191, 36, 0.2);
		color: rgb(251, 191, 36);
	}

	.priority-low {
		background: rgba(34, 197, 94, 0.2);
		color: rgb(34, 197, 94);
	}

	.task-actions {
		margin-left: 1rem;
	}

	.add-node-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-node-btn:hover {
		background: var(--color-primary-hover);
		transform: translateY(-1px);
	}

	.glassmorphic-button {
		background: rgba(var(--color-neutral-rgb), 0.1);
		backdrop-filter: blur(12px);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.glassmorphic-button:hover {
		background: rgba(var(--color-neutral-rgb), 0.15);
	}
</style>


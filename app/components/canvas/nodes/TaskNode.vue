<template>
	<div class="task-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<UIcon name="i-lucide-list-checks" class="size-8" :style="{ color: themeColor }" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			title="TASK MANAGEMENT"
			:title-color="themeColor"
			:theme-color="themeColor"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete task node"
			@close="handleClose"
		/>

		<!-- Task Selection/Configuration -->
		<NodePanel
			v-if="!customNodeProps.data?.configured"
			panel-class="task-config-container"
			:scrollbar-color="scrollbarColor"
		>
			<!-- Mode Selection -->
			<ModeSelector
				v-model="taskMode"
				:active-color="activeColorRGB"
			/>

			<!-- Select Existing Task -->
			<RecordSelector
				v-if="taskMode === 'select'"
				:records="availableTasks"
				:is-loading="isLoadingTasks"
				:selected-id="selectedTaskId"
				record-type-singular="task"
				record-type-plural="tasks"
				header-title="Available Tasks"
				header-icon="i-lucide-list-checks"
				item-icon="i-lucide-check-square"
				icon-class="text-purple-400"
				:theme-color="activeColorRGB"
				:show-meta="true"
				@select="selectTask"
				@attach="attachSelectedTask"
			>
				<template #item="{ record: task, isSelected }">
					<div class="task-record-item" :class="{ selected: isSelected }" :style="getTaskItemStyle(task)">
						<div class="task-record-header">
							<div class="task-icon" :style="getTaskIconStyle(task)">
								<UIcon name="i-lucide-check-square" class="size-4" />
							</div>
							<span class="task-name">{{ getTaskDisplayName(task) }}</span>
							<UIcon
								v-if="isSelected"
								name="i-lucide-check-circle"
								class="size-4 text-green-400 ml-auto"
							/>
						</div>
						<div v-if="task.description" class="task-description">
							{{ task.description }}
						</div>
						<div class="task-meta">
							<span class="task-status-badge" :style="getTaskStatusBadgeStyle(task)">
								{{ getTaskStatus(task) }}
							</span>
							<span v-if="task.priority" class="task-priority-badge" :style="getTaskPriorityBadgeStyle(task)">
								{{ getTaskPriority(task) }}
							</span>
						</div>
					</div>
				</template>
				<template #empty-state>
					<UIcon name="i-lucide-list-checks" class="w-8 h-8 text-white/30" />
					<p class="text-sm text-white/50">
						No tasks available
					</p>
					<p class="text-xs text-white/40">
						Switch to "Create New" to add a task
					</p>
				</template>
			</RecordSelector>

		<!-- Create New Task Form -->
		<TaskForm
			v-else-if="taskMode === 'create'"
			mode="create"
			:task-data="{
				name: customNodeProps.data?.taskName,
				description: customNodeProps.data?.taskDescription
			}"
			:is-loading="isCreating"
			:available-users="availableUsers"
			@updateField="handleTaskFieldUpdate"
			@submit="createTaskFromNode"
		/>
		</NodePanel>

		<!-- Task Details View -->
		<NodePanel
			v-else-if="customNodeProps.data?.configured && selectedTaskData"
			panel-class="task-details-panel"
			:scrollbar-color="scrollbarColor"
		>
			<TaskDetails
				:task="selectedTaskData"
				:theme-color="themeColor"
				:available-users="availableUsers"
				:subtasks="subtasks"
				@change-task="changeTaskSelection"
				@user-assign="handleUserAssign"
				@user-unassign="handleUserUnassign"
				@add-subtask="handleAddSubtask"
				@subtask-click="handleSubtaskClick"
				@show-in-orbit="handleShowInOrbit"
			/>
		</NodePanel>

		<!-- Loading State (when configured but data not ready) -->
		<NodePanel
			v-else-if="customNodeProps.data?.configured && !selectedTaskData"
			panel-class="task-loading-panel"
			:scrollbar-color="scrollbarColor"
		>
			<div class="loading-state">
				<UIcon name="i-lucide-loader-2" class="size-8 text-white/40 mb-3 animate-spin" />
				<p class="text-sm text-white/60">
					Loading task details...
				</p>
			</div>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
	import { useToast } from "#imports";
	import ModeSelector from "@canvas/shared/ModeSelector.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import RecordSelector from "@canvas/shared/RecordSelector.vue";
	import { buttClient } from "@utils/buttClient";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref } from "vue";
	import TaskDetails from "./shared/TaskDetails.vue";
	import TaskForm from "./shared/TaskForm.vue";
	import "./styles/nodeContainer.css";

	interface Props {
		customNodeProps: any
		organisationId: string
		projectId?: string
		updateNodeData: (nodeId: string, key: string, value: any) => void
		createChildUserNode?: (parentNodeId: string, userData: any) => void
		createChildTaskNode?: (parentNodeId: string, taskData: any) => void
		taskSelected?: (taskData: any, nodeId: string) => void
		showTaskInOrbit?: (taskData: any, nodeId: string) => void
	}

	const props = withDefaults(defineProps<Props>(), {
		projectId: undefined,
		createChildUserNode: undefined,
		createChildTaskNode: undefined,
		taskSelected: undefined,
		showTaskInOrbit: undefined
	});

	const emit = defineEmits(["closeNode", "showInOrbit"]);

	// State
	const taskMode = ref<"select" | "create">("select");
	const availableTasks = ref<any[]>([]);
	const availableUsers = ref<any[]>([]);
	const subtasks = ref<any[]>([]);
	const isLoadingTasks = ref(false);
	const isLoadingSubtasks = ref(false);
	const isCreating = ref(false);
	const selectedTaskId = ref<string | null>(null);

	// Computed - Theme colors based on task status
	const statusColors: Record<string, string> = {
		"To Do": "#6366f1", // indigo
		"In Progress": "#3b82f6", // blue
		"In Review": "#f59e0b", // amber
		Done: "#10b981", // green
		Blocked: "#ef4444", // red
		Cancelled: "#6b7280" // gray
	};

	const priorityColors: Record<string, string> = {
		low: "#10b981", // green
		medium: "#f59e0b", // amber
		high: "#f97316", // orange
		urgent: "#ef4444" // red
	};

	const customNodeProps = computed(() => props.customNodeProps || {});

	const themeColor = computed(() => {
		const status = customNodeProps.value.data?.status || "To Do";
		return statusColors[status] || "#6366f1";
	});

	const activeColorRGB = computed(() => {
		return hexToRgb(themeColor.value) || "99, 102, 241"; // indigo fallback
	});

	const scrollbarColor = computed(() => themeColor.value);

	const selectedTaskData = computed(() => {
		console.log("🔍 TaskNode: Computing selectedTaskData");
		console.log("  Has selectedTaskId:", !!customNodeProps.value.data?.selectedTaskId);
		console.log("  Is configured:", customNodeProps.value.data?.configured);
		console.log("  Available tasks count:", availableTasks.value.length);
		console.log("  Node data:", {
			taskName: customNodeProps.value.data?.taskName,
			taskDescription: customNodeProps.value.data?.taskDescription,
			description: customNodeProps.value.data?.description
		});

		// If task is pre-configured (from clicking an existing task), use the data directly
		if (customNodeProps.value.data?.configured && customNodeProps.value.data?.selectedTaskId) {
			console.log("📋 TaskNode: Using pre-configured task data from node");
			const taskData = {
				id: customNodeProps.value.data.selectedTaskId,
				name: customNodeProps.value.data.taskName,
				title: customNodeProps.value.data.taskName,
				description: customNodeProps.value.data.taskDescription || customNodeProps.value.data.description || "",
				status: customNodeProps.value.data.status,
				jiraStatus: customNodeProps.value.data.status,
				priority: customNodeProps.value.data.priority,
				projectId: customNodeProps.value.data.projectId,
				assignedUsers: customNodeProps.value.data.assignedUsers || []
			};
			console.log("✅ TaskNode: Returning pre-configured task:", taskData);
			return taskData;
		}

		// Otherwise, find the task in the availableTasks array
		const baseTask = availableTasks.value.find((t) => t.id === customNodeProps.value.data?.selectedTaskId);
		if (!baseTask) {
			console.warn("⚠️ TaskNode: No task found with ID:", customNodeProps.value.data?.selectedTaskId);
			console.log("  Available task IDs:", availableTasks.value.map((t) => t.id));
			return null;
		}

		console.log("📋 TaskNode: Using task from availableTasks");
		const taskData = {
			...baseTask,
			assignedUsers: customNodeProps.value.data?.assignedUsers || baseTask.assignedUsers || []
		};
		console.log("✅ TaskNode: Returning task from list:", taskData);
		return taskData;
	});

	// Helper to convert hex to RGB
	function hexToRgb(hex: string): string | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? `${Number.parseInt(result[1] || "99", 16)}, ${Number.parseInt(result[2] || "102", 16)}, ${Number.parseInt(result[3] || "241", 16)}`
			: null;
	}

	// Fetch available tasks
	async function fetchOrganizationTasks() {
		console.log("🎯 TaskNode: fetchOrganizationTasks called");
		console.log("  Project ID:", props.projectId);
		console.log("  Organization ID:", props.organisationId);
		console.log("  Custom node data projectId:", customNodeProps.value.data?.projectId);

		isLoadingTasks.value = true;
		try {
			// Prefer projectId from props, then from customNodeProps
			const targetProjectId = props.projectId || customNodeProps.value.data?.projectId;

			// If we have a specific project ID, fetch tasks for that project
			if (targetProjectId) {
				console.log("📡 Fetching tasks for project:", targetProjectId);
				const result = await buttClient.getTasksByProjectId(targetProjectId);
				availableTasks.value = Array.isArray(result) ? result : [];
				console.log("✅ Tasks loaded:", availableTasks.value.length, "tasks");
			} else if (props.organisationId) {
				// Otherwise fetch all tasks for the organization
				console.log("📡 Fetching all organization projects to get tasks");
				const projectsResponse = await buttClient.findAllProject();
				const orgProjects = projectsResponse.filter((p: any) => p.organisationId === props.organisationId);
				console.log("  Found", orgProjects.length, "projects in organization");

				// Fetch tasks for each project
				const allTasksPromises = orgProjects.map((p: any) =>
					buttClient.getTasksByProjectId(p.id).catch(() => [])
				);
				const allTasksArrays = await Promise.all(allTasksPromises);
				availableTasks.value = allTasksArrays.flat();
				console.log("✅ Total tasks loaded:", availableTasks.value.length);
			} else {
				console.warn("⚠️ No project ID or organization ID provided");
				availableTasks.value = [];
			}
		} catch (error) {
			console.error("❌ Failed to fetch tasks:", error);
			availableTasks.value = [];
		} finally {
			isLoadingTasks.value = false;
		}
	}

	// Fetch available users for assignment (project-specific users)
	async function fetchProjectUsers() {
		try {
			console.log("👥 TaskNode: Fetching project users");
			const targetProjectId = props.projectId || customNodeProps.value.data?.projectId;

			if (!targetProjectId) {
				console.warn("⚠️ TaskNode: No project ID available, fetching organization users instead");
				// Fallback to organization users
				const org = await buttClient.findByIdOrganisation(props.organisationId);
				if (org.members && org.members.length > 0) {
					const userPromises = org.members.map((member: any) =>
						buttClient.getUserUser(member.userId)
					);
					const users = await Promise.all(userPromises);
					availableUsers.value = users.filter(Boolean);
				}
				return;
			}

			// Fetch organization members (these are the project's potential assignees)
			const org = await buttClient.findByIdOrganisation(props.organisationId);
			const memberIds = org?.owners || [];

			console.log("  Found", memberIds.length, "members in organization");

			// Get user details for each member
			const projectUsers: any[] = [];
			if (Array.isArray(memberIds)) {
				for (const id of memberIds) {
					try {
						const user = await buttClient.getUserUser(id);
						projectUsers.push({
							id,
							email: user.email,
							name: user.name,
							role: user.role || "member"
						});
					} catch (userError) {
						console.warn("⚠️ Failed to fetch user:", id, userError);
					}
				}
			}

			availableUsers.value = projectUsers;
			console.log("✅ TaskNode: Loaded", projectUsers.length, "project users");
		} catch (error) {
			console.error("❌ Failed to fetch project users:", error);
			availableUsers.value = [];
		}
	}

	// Display helpers
	function getTaskDisplayName(task: any): string {
		return task.name || task.title || "Unnamed Task";
	}

	function getTaskStatus(task: any): string {
		return task.status || "To Do";
	}

	function getTaskPriority(task: any): string {
		return task.priority || "medium";
	}

	function getTaskStatusColor(task: any): string {
		const status = getTaskStatus(task);
		return statusColors[status] || "#6366f1";
	}

	function getTaskPriorityColor(task: any): string {
		const priority = getTaskPriority(task);
		return priorityColors[priority] || "#f59e0b";
	}

	// Styling helpers
	function getTaskItemStyle(task: any) {
		const color = getTaskStatusColor(task);
		return {
			borderColor: `${color}40`,
			backgroundColor: `${color}10`
		};
	}

	function getTaskIconStyle(task: any) {
		const color = getTaskStatusColor(task);
		return {
			backgroundColor: `${color}20`,
			borderColor: `${color}40`,
			color
		};
	}

	function getTaskStatusBadgeStyle(task: any) {
		const color = getTaskStatusColor(task);
		return {
			backgroundColor: `${color}30`,
			borderColor: `${color}60`,
			color
		};
	}

	function getTaskPriorityBadgeStyle(task: any) {
		const color = getTaskPriorityColor(task);
		return {
			backgroundColor: `${color}30`,
			borderColor: `${color}60`,
			color
		};
	}

	// Task selection and attachment
	function selectTask(taskId: string) {
		selectedTaskId.value = taskId;
	}

	async function attachSelectedTask() {
		if (!selectedTaskId.value) {
			console.warn("⚠️ attachSelectedTask: No task ID selected");
			return;
		}

		const task = availableTasks.value.find((t) => t.id === selectedTaskId.value);
		if (!task) {
			console.warn("⚠️ attachSelectedTask: Task not found:", selectedTaskId.value);
			return;
		}

		console.log("📎 Attaching selected task:", task.name);

		// Immediately update node data with basic task info
		props.updateNodeData(customNodeProps.value.id, "selectedTaskId", task.id);
		props.updateNodeData(customNodeProps.value.id, "taskName", task.name || task.title);
		props.updateNodeData(customNodeProps.value.id, "taskDescription", task.description || "");
		props.updateNodeData(customNodeProps.value.id, "status", task.jiraStatus || task.status || "To Do");
		props.updateNodeData(customNodeProps.value.id, "priority", task.priority || "medium");
		props.updateNodeData(customNodeProps.value.id, "configured", true);

		console.log("✅ Task attached and configured:", {
			id: task.id,
			name: task.name,
			configured: true
		});

		// Initialize assignedUsers as empty array
		props.updateNodeData(customNodeProps.value.id, "assignedUsers", []);

		// Fetch subtasks for this task
		await fetchSubtasks(task.id);

		// Emit task selection event
		if (props.taskSelected) {
			props.taskSelected({
				...task,
				assignedUsers: []
			}, customNodeProps.value.id);
		}

		// Fetch assigned users in background
		try {
			// TODO: Implement task user assignment API
			// For now, we'll use an empty array
			const assignedUsers: any[] = [];

			props.updateNodeData(customNodeProps.value.id, "assignedUsers", assignedUsers);
		} catch (error) {
			console.error("Failed to fetch task assignments:", error);
		}
	}

	function changeTaskSelection() {
		// Reset to selection mode
		taskMode.value = "select";
		selectedTaskId.value = null;
		props.updateNodeData(customNodeProps.value.id, "selectedTaskId", null);
		props.updateNodeData(customNodeProps.value.id, "configured", false);
	}

	// Handle task field updates from the form
	function handleTaskFieldUpdate(key: string, value: any) {
		console.log("📝 TaskNode: Updating field", key, "to:", value);
		console.log("  Current node data before update:", {
			taskName: customNodeProps.value.data?.taskName,
			taskDescription: customNodeProps.value.data?.taskDescription
		});
		
		// Map form field names to node data field names
		const fieldMap: Record<string, string> = {
			name: "taskName",
			description: "taskDescription"
		};
		const nodeDataKey = fieldMap[key] || key;
		props.updateNodeData(customNodeProps.value.id, nodeDataKey, value);
		
		console.log("  Node data after update:", {
			taskName: customNodeProps.value.data?.taskName,
			taskDescription: customNodeProps.value.data?.taskDescription
		});
	}

	async function createTaskFromNode() {
		isCreating.value = true;
		try {
			const nodeData = customNodeProps.value.data;

			console.log("═══════════════════════════════════════════");
			console.log("🔧 CREATING TASK - FULL NODE DATA:");
			console.log("  Full nodeData:", JSON.stringify(nodeData, null, 2));
			console.log("  taskName:", nodeData?.taskName);
			console.log("  taskDescription:", nodeData?.taskDescription);
			console.log("═══════════════════════════════════════════");

			// Get project ID
			const targetProjectId = props.projectId || nodeData?.projectId;
			if (!targetProjectId) {
				throw new Error("Project ID is required to create a task");
			}

			// Get organization details to get the butt
			console.log("🔍 TaskNode: Getting organization details...");
			const organizations = await buttClient.findAllOrganisation();
			const organization: any = organizations.find((org: any) => org.id === props.organisationId);

			if (!organization || !organization.butt) {
				throw new Error("Organization details not found or missing butt");
			}

		console.log("✅ TaskNode: Organization found:", organization.name);

		// Get task name and description from node data
		const taskName = nodeData?.taskName?.trim() || (nodeData?.isSubtask ? "New Subtask" : "New Task");
		let taskDescription = nodeData?.taskDescription?.trim() || "";

		console.log("📝 TaskNode: Task details from form:", {
			taskName,
			taskDescription: taskDescription || "(empty)",
			hasName: !!nodeData?.taskName,
			hasDescription: !!nodeData?.taskDescription
		});

		// Build description with parent task metadata if this is a subtask
		if (nodeData?.parentTaskId) {
			const parentMetadata = `[ParentTask:${nodeData.parentTaskId}]`;
			taskDescription = `${parentMetadata} ${taskDescription}`.trim();
			console.log("📎 TaskNode: Creating subtask linked to parent:", nodeData.parentTaskId);
		}

		// Create task data following the TaskManagementPanel pattern
		const taskData = {
			name: taskName,
			description: taskDescription,
				jiraStatus: nodeData?.status || "To Do", // Use jiraStatus as the status field
				projectId: targetProjectId,
				organisationId: props.organisationId,
				butt: organization.butt as string,
				owners: [],
				subscribers: [],
				creator: "canvas",
				history: [],
				deletedAt: undefined,
				createdAt: new Date().toISOString()
			};

		console.log("📝 TaskNode: Creating task with data:", taskData);
		const createdTask = await buttClient.createTask(taskData);
		console.log("✅ TaskNode: Task created successfully:", createdTask);

		// Update node data with the created task details
		props.updateNodeData(customNodeProps.value.id, "selectedTaskId", createdTask.id);
		props.updateNodeData(customNodeProps.value.id, "taskName", createdTask.name);
		props.updateNodeData(customNodeProps.value.id, "taskDescription", createdTask.description || "");
		props.updateNodeData(customNodeProps.value.id, "status", createdTask.jiraStatus || "To Do");
		props.updateNodeData(customNodeProps.value.id, "configured", true);

			// Switch to select mode and select the newly created task
			selectedTaskId.value = createdTask.id || null;
			availableTasks.value.unshift(createdTask);

			// Attach the created task
			await attachSelectedTask();

			// Show success message
			useToast().add({
				title: "Task created",
				description: `"${createdTask.name}" has been created successfully`,
				color: "success"
			});
		} catch (error: any) {
			console.error("❌ TaskNode: Failed to create task:", error);
			useToast().add({
				title: "Error",
				description: `Failed to create task: ${error?.message || "Unknown error"}`,
				color: "error"
			});
		} finally {
			isCreating.value = false;
		}
	}

	async function handleUserAssign(userId: string) {
		console.log("═══════════════════════════════════════════");
		console.log("👤 ASSIGNING USER TO TASK");
		console.log("  User ID:", userId);
		console.log("  Task ID:", customNodeProps.value.data?.selectedTaskId);
		console.log("═══════════════════════════════════════════");

		const user = availableUsers.value.find((u) => u.id === userId);
		if (!user) {
			console.error("❌ User not found:", userId);
			return;
		}

		try {
			const taskId = customNodeProps.value.data?.selectedTaskId;
			if (!taskId) {
				console.error("❌ No task ID found");
				return;
			}

			// Get current task description (try both field names for compatibility)
			const currentDescription = customNodeProps.value.data?.taskDescription || customNodeProps.value.data?.description || "";

			// Remove existing ASSIGNED metadata
			const cleanDescription = currentDescription
				.replace(/\[ASSIGNED:[^\]]+\]\s*/g, "")
				.trim();

			// Build new description with assigned user metadata
			const userName = user.name || user.email || "Unknown";
			const newDescription = `[ASSIGNED:${userId}|${userName}] ${cleanDescription}`.trim();

			console.log("📝 Updating task with new description:", newDescription);

			// Update task via API
			await buttClient.updateTask(taskId, {
				description: newDescription
			});

			console.log("✅ Task updated successfully");

			// Update node data directly (bypass updateNodeData to avoid race condition)
			const currentAssigned = customNodeProps.value.data?.assignedUsers || [];
			if (!currentAssigned.find((u: any) => u.id === userId)) {
				const updatedAssignedUsers = [...currentAssigned, user];

			// Update the data directly on the customNodeProps
			console.log("📝 Updating node data with new assigned user (direct update)");
			if (customNodeProps.value.data) {
				customNodeProps.value.data.assignedUsers = updatedAssignedUsers;
				customNodeProps.value.data.taskDescription = newDescription;
				console.log("✅ Node data updated directly");
			}
			}

			// Create a child UserNode connected to this TaskNode
			if (props.createChildUserNode) {
				console.log("👶 Creating child user node");
				props.createChildUserNode(customNodeProps.value.id, user);
			}

			// Show success message
			useToast().add({
				title: "User Assigned",
				description: `${userName} has been assigned to this task`,
				color: "success"
			});
		} catch (error: any) {
			console.error("❌ Failed to assign user:", error);
			useToast().add({
				title: "Error",
				description: `Failed to assign user: ${error?.message || "Unknown error"}`,
				color: "error"
			});
		}
	}

	async function handleUserUnassign(userId: string) {
		console.log("═══════════════════════════════════════════");
		console.log("👤 UNASSIGNING USER FROM TASK");
		console.log("  User ID:", userId);
		console.log("  Task ID:", customNodeProps.value.data?.selectedTaskId);
		console.log("═══════════════════════════════════════════");

		try {
			const taskId = customNodeProps.value.data?.selectedTaskId;
			if (!taskId) {
				console.error("❌ No task ID found");
				return;
			}

			// Get current task description (try both field names for compatibility)
			const currentDescription = customNodeProps.value.data?.taskDescription || customNodeProps.value.data?.description || "";

			// Remove the specific user's ASSIGNED metadata
			const userAssignPattern = new RegExp(`\\[ASSIGNED:${userId}\\|[^\\]]+\\]\\s*`, "g");
			const newDescription = currentDescription.replace(userAssignPattern, "").trim();

			console.log("📝 Updating task to remove user assignment");

			// Update task via API
			await buttClient.updateTask(taskId, {
				description: newDescription
			});

			console.log("✅ Task updated successfully");

			// Update node data directly (bypass updateNodeData to avoid race condition)
			const currentAssigned = customNodeProps.value.data?.assignedUsers || [];
			const updated = currentAssigned.filter((u: any) => u.id !== userId);

			// Update the data directly on the customNodeProps
			console.log("📝 Updating node data to remove assigned user (direct update)");
			if (customNodeProps.value.data) {
				customNodeProps.value.data.assignedUsers = updated;
				customNodeProps.value.data.taskDescription = newDescription;
				console.log("✅ Node data updated directly");
			}

			const user = currentAssigned.find((u: any) => u.id === userId);
			const userName = user?.name || user?.email || "User";

			// Show success message
			useToast().add({
				title: "User Unassigned",
				description: `${userName} has been removed from this task`,
				color: "success"
			});
		} catch (error: any) {
			console.error("❌ Failed to unassign user:", error);
			useToast().add({
				title: "Error",
				description: `Failed to unassign user: ${error?.message || "Unknown error"}`,
				color: "error"
			});
		}
	}

	function handleClose() {
		emit("closeNode", customNodeProps.value.id);
	}

	// Fetch subtasks for the selected task
	async function fetchSubtasks(parentTaskId: string) {
		if (!parentTaskId) return;

		isLoadingSubtasks.value = true;
		try {
			console.log("🔍 Fetching subtasks for parent task:", parentTaskId);

			// Fetch all tasks - handle 500 errors gracefully
			let allTasks: any[] = [];
			try {
				allTasks = await buttClient.findAllTask();
			} catch (fetchError: any) {
				console.warn("⚠️ Could not fetch all tasks (API error), checking available tasks only:", fetchError.message);
				// Use only the tasks we already have loaded
				allTasks = availableTasks.value;
			}

			// Filter subtasks by checking for [ParentTask:parentTaskId] in description
			const foundSubtasks = Array.isArray(allTasks) ? allTasks.filter((task: any) => {
				const desc = task.description || "";
				return desc.includes(`[ParentTask:${parentTaskId}]`);
			}) : [];

			subtasks.value = foundSubtasks;
			console.log("✅ Found", foundSubtasks.length, "subtasks");
		} catch (error) {
			console.error("❌ Failed to fetch subtasks:", error);
			subtasks.value = [];
		} finally {
			isLoadingSubtasks.value = false;
		}
	}

	// Handle add subtask
	async function handleAddSubtask() {
		console.log("➕ Add subtask clicked");

		const parentTask = selectedTaskData.value;
		if (!parentTask || !props.createChildTaskNode) {
			console.warn("⚠️ Cannot create subtask - missing parent task or handler");
			return;
		}

		// Create a new task node with parent context
		const subtaskContext = {
			projectId: parentTask.projectId,
			projectName: customNodeProps.value.data?.projectName,
			organisationId: props.organisationId,
			parentTaskId: parentTask.id,
			parentTaskName: parentTask.name || parentTask.title,
			isSubtask: true,
			configured: false // Not configured yet, will be created
		};

		props.createChildTaskNode(customNodeProps.value.id, subtaskContext);
	}

	// Handle subtask click
	function handleSubtaskClick(subtask: any) {
		console.log("📋 Subtask clicked:", subtask);

		if (props.createChildTaskNode) {
			const subtaskContext = {
				projectId: subtask.projectId,
				organisationId: props.organisationId,
				selectedTaskId: subtask.id,
				taskName: subtask.name || subtask.title,
				description: subtask.description,
				status: subtask.jiraStatus || subtask.status,
				priority: subtask.priority,
				parentTaskId: selectedTaskData.value?.id,
				configured: true
			};
			props.createChildTaskNode(customNodeProps.value.id, subtaskContext);
		}
	}

	// Handle show in orbit
	function handleShowInOrbit() {
		console.log("🌀 Show in orbit clicked for task:", selectedTaskData.value);

		if (props.showTaskInOrbit) {
			const orbitTaskData = {
				...selectedTaskData.value,
				taskId: selectedTaskData.value?.id,
				taskName: selectedTaskData.value?.name || selectedTaskData.value?.title,
				organisationId: props.organisationId,
				projectId: props.projectId || selectedTaskData.value?.projectId
			};
			props.showTaskInOrbit(orbitTaskData, customNodeProps.value.id);
		} else {
			console.warn("⚠️ No showTaskInOrbit handler provided");
		}
	}

	// Lifecycle
	onMounted(() => {
		console.log("🎬 TaskNode mounted");
		console.log("  Custom node props:", customNodeProps.value);
		console.log("  Selected task ID:", customNodeProps.value.data?.selectedTaskId);
		console.log("  Configured:", customNodeProps.value.data?.configured);
		console.log("  Organisation ID:", props.organisationId);
		console.log("  Project ID:", props.projectId);

		fetchOrganizationTasks();
		fetchProjectUsers();

		// Restore selected task if present
		if (customNodeProps.value.data?.selectedTaskId) {
			selectedTaskId.value = customNodeProps.value.data.selectedTaskId;
			console.log("✅ Restored selected task ID:", selectedTaskId.value);

			// Fetch subtasks for this task
			fetchSubtasks(customNodeProps.value.data.selectedTaskId);
		}
	});
</script>

<style scoped>
/* Task-specific styling */
.task-record-item {
	padding: 0.875rem;
	border-radius: 0.5rem;
	border: 1px solid;
	transition: all 0.2s ease;
	cursor: pointer;
}

.task-record-item:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-record-item.selected {
	border-width: 2px;
	box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.task-record-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.5rem;
}

.task-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: 0.375rem;
	border: 1px solid;
}

.task-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
}

.task-description {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 0.5rem;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.task-meta {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

	.task-status-badge,
	.task-priority-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		border: 1px solid;
		letter-spacing: 0.05em;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
	}
</style>

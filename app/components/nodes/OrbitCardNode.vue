<!-- Copied from client/app/components/nodes/OrbitCardNode.vue -->
<template>
	<!-- full client content preserved -->
	<div class="orbit-card-node">
		<!-- Debug info -->
		<div class="absolute top-0 left-0 bg-red-500 text-white text-xs p-1 z-50">
			OrbitCardNode Rendered - Tasks: {{ orbitTimelineData.length }}
		</div>
		<!-- Node Header -->
		<div class="node-header">
			<div class="node-info">
				<h3 class="node-title">
					{{ nodeData.name || 'Task Orbit' }}
				</h3>
				<p class="node-subtitle">
					Interactive Orbit Timeline
				</p>
			</div>
		</div>
		<!-- Orbit Component -->
		<div class="orbit-card-container">
			<div class="orbit-wrapper" @wheel.stop @mousedown.stop @mousemove.stop @mouseup.stop @click.stop>
				<Orbit
					:key="`orbit-card-${props.customNodeProps?.id || nodeData.id}-${forceUpdate}`"
					:timeline-data="orbitTimelineData"
					:auto-rotate="false"
					:orbit-title="orbitTitle"
					:rotation-speed="0"
					:zoom-level="0.8"
					:center-icon-color="centerIconColor"
					@user-assigned="handleUserAssigned"
					@user-removed="handleUserRemoved"
					@timeline-reordered="handleTimelineReordered"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { UserFlowNode } from "~/types/api-node-types";
	import { computed, ref, watch } from "vue";
	import Orbit from "~/components/orbit.vue";

	interface Props {
		customNodeProps?: any
		data?: UserFlowNode
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		configure: [nodeId: string]
		delete: [nodeId: string]
		userAssigned: [taskId: string, userId: string]
		userRemoved: [taskId: string, userId: string]
		timelineReordered: [newTimelineData: any[]]
		subtaskCreated: [subtask: any]
	}>();

	const nodeData = computed(() => props.customNodeProps?.data || props.data || {});

	const getFieldValue = (fieldId: string, defaultValue: any) => {
		const field = nodeData.value.fields?.find((f: any) => f.id === fieldId);
		return field?.value ?? defaultValue;
	};

	const orbitTitle = computed(() => {
		const taskData = nodeData.value.taskData;
		if (taskData?.centerType === "user" && taskData?.tasks) {
			return `${taskData.name}'s Task Orbit`;
		}
		return getFieldValue("orbitTitle", "Tasks Orbit View");
	});

	const centerIconColor = computed(() => getFieldValue("centerIconColor", "#ffffff"));

	const orbitTimelineData = computed(() => {
		const taskData = nodeData.value.taskData;
		if (taskData?.centerType === "user" && taskData?.tasks) {
			return (taskData.tasks || []).map((task: any, index: number) => ({
				id: task.id || `task-${index}`,
				taskId: task.id,
				title: task.name || task.title || `Task ${index + 1}`,
				date: task.createdAt || task.date || new Date().toLocaleDateString(),
				content: task.description || "No description",
				category: "Task",
				icon: "CheckSquare",
				relatedIds: [],
				status: (task.jiraStatus || task.status || "pending").toLowerCase().replace(/\\s+/g, "-") as "pending" | "in-progress" | "completed",
				energy: 50 + (index * 10),
				userId: taskData.id,
				isMainTask: false,
				subtasks: [],
				assignedUsers: [],
				availableUsers: []
			}));
		}
		if (taskData) {
			const mainTask = {
				id: taskData.id || 1,
				taskId: taskData.id,
				title: taskData.name || taskData.title || "Main Task",
				date: taskData.createdAt || taskData.date || new Date().toLocaleDateString(),
				content: taskData.description || "No description",
				category: taskData.category || "Task",
				icon: "CheckSquare",
				relatedIds: [],
				status: (taskData.jiraStatus || taskData.status || "pending").toLowerCase().replace(/\\s+/g, "-") as "pending" | "in-progress" | "completed",
				energy: taskData.energy || 50,
				userId: taskData.userId || taskData.assigneeId || 1,
				isMainTask: true,
				subtasks: [],
				assignedUsers: taskData.assignedUsers || [],
				availableUsers: taskData.availableUsers || []
			};
			const subtasks = (taskData.subtasks || []).map((subtask: any, index: number) => ({
				id: subtask.id || `subtask-${index}`,
				taskId: subtask.id,
				title: subtask.name || subtask.title || `Subtask ${index + 1}`,
				date: subtask.createdAt || subtask.date || new Date().toLocaleDateString(),
				content: subtask.description || "",
				category: subtask.category || "Subtask",
				icon: "Circle",
				relatedIds: [mainTask.taskId],
				status: (subtask.jiraStatus || subtask.status || "pending").toLowerCase().replace(/\\s+/g, "-") as "pending" | "in-progress" | "completed",
				energy: subtask.energy || 30,
				userId: subtask.userId || subtask.assigneeId || 1,
				isSubtask: true,
				parentTaskId: mainTask.taskId,
				subtasks: [],
				assignedUsers: subtask.assignedUsers || [],
				availableUsers: subtask.availableUsers || []
			}));
			return [mainTask, ...subtasks];
		}
		const sampleTasksCount = getFieldValue("sampleTasksCount", 3);
		const tasks: any[] = [];
		for (let i = 0; i < sampleTasksCount; i++) {
			const statusOptions = ["pending", "in-progress", "completed"];
			const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
			tasks.push({
				id: i + 1,
				taskId: `sample-task-${i + 1}`,
				title: `Sample Task ${i + 1}`,
				date: new Date().toLocaleDateString(),
				content: `Description for sample task ${i + 1}.`,
				category: "Sample",
				icon: "CheckSquare",
				relatedIds: [],
				status: randomStatus as "pending" | "in-progress" | "completed",
				energy: Math.floor(Math.random() * 100),
				subtasks: [],
				assignedUsers: [],
				availableUsers: []
			});
		}
		return tasks;
	});

	const orbitKey = computed(() => {
		const keyFields = ["sampleTasksCount", "orbitTitle", "autoRotate", "rotationSpeed", "zoomLevel", "centerIconColor", "centerIconImage"];
		return keyFields.map((fieldId) => getFieldValue(fieldId, "")).join("|");
	});

	const forceUpdate = ref(0);
	watch(() => orbitKey.value, () => { forceUpdate.value++; });

	const toggleConfig = () => { emit("configure", (props.customNodeProps?.id || nodeData.value.id)); };
	const deleteNode = () => { emit("delete", (props.customNodeProps?.id || nodeData.value.id)); };
	const handleUserAssigned = (taskId: string, userId: string) => { emit("userAssigned", taskId, userId); };
	const handleUserRemoved = (taskId: string, userId: string) => { emit("userRemoved", taskId, userId); };
	const handleTimelineReordered = (newTimelineData: any[]) => { emit("timelineReordered", newTimelineData); };
</script>

<style scoped>
/* trimmed styles preserved for node */
.orbit-card-node { position: relative; width: 600px; height: 400px; background: transparent; border-radius: 12px; overflow: hidden; }
.node-header { position: absolute; top: 0; left: 0; right: 0; z-index: 10; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 12px; pointer-events: auto; }
.node-title { font-size: 14px; font-weight: 600; color: white; margin: 0; line-height: 1.2; }
.node-subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.6); margin: 2px 0 0 0; line-height: 1.2; }
.orbit-card-container { width: 100%; height: 100%; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.orbit-wrapper { width: 100%; height: 100%; position: relative; overflow: hidden; transform: scale(0.4); transform-origin: center; pointer-events: none; }
.orbit-wrapper > * { pointer-events: auto; }
</style>


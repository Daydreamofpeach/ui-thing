<template>
	<div
		class="user-task-orbit-overlay"
		:class="{ active: isActive }"
	>
		<!-- Close button -->
		<button class="orbit-close-button" @click="handleClose">
			<UIcon name="i-lucide-x" class="size-4" />
		</button>

		<!-- Orbit Visualization - Cards are clickable but not draggable -->
		<div
			class="orbit-container"
			@wheel.stop.prevent
			@mousedown="handleMouseDown"
			@mousemove.stop.prevent
			@mouseup.stop
			@dragstart.prevent
			@drag.prevent
		>
			<Orbit
				:timeline-data="orbitTimelineData"
				:auto-rotate="false"
				orbit-title=""
				:rotation-speed="0"
				:zoom-level="0.6"
				center-icon-color="transparent"
				@user-assigned="handleUserAssigned"
				@user-removed="handleUserRemoved"
				@timeline-reordered="handleTimelineReordered"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, watch } from "vue";
	import Orbit from "~/components/orbit.vue";

	interface Props {
		tasks: any[]
		userName: string
		userIcon?: string | null
		themeColor: string
		isActive: boolean
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		close: []
		userAssigned: [taskId: string, userId: string]
		userRemoved: [taskId: string, userId: string]
		timelineReordered: [newTimelineData: any[]]
	}>();

	// Debug: Log when component mounts
	onMounted(() => {
		console.log("🚀 UserTaskOrbit MOUNTED", {
			isActive: props.isActive,
			tasks: props.tasks,
			userName: props.userName
		});
	});

	// Debug: Watch isActive changes
	watch(() => props.isActive, (newVal, oldVal) => {
		console.log("🌀 UserTaskOrbit isActive changed:", { from: oldVal, to: newVal });
	});

	// Convert tasks to orbit timeline data
	const orbitTimelineData = computed(() => {
		console.log("🌌 UserTaskOrbit: Converting", props.tasks.length, "tasks to orbit data");

		return props.tasks.map((task: any, index: number) => ({
			id: task.id || `task-${index}`,
			taskId: task.id,
			title: task.name || task.title || `Task ${index + 1}`,
			date: task.createdAt || task.date || new Date().toLocaleDateString(),
			content: task.description || "No description",
			category: "Task",
			icon: "CheckSquare",
			relatedIds: [],
			status: (task.jiraStatus || task.status || "pending").toLowerCase().replace(/\s+/g, "-") as "pending" | "in-progress" | "completed",
			energy: 50 + (index * 10),
			userId: task.userId || task.assigneeId,
			isMainTask: false,
			subtasks: [],
			assignedUsers: task.assignedUsers || [],
			availableUsers: task.availableUsers || []
		}));
	});

	// Handlers
	const handleClose = () => {
		console.log("🌀 Closing user task orbit");
		emit("close");
	};

	// Prevent dragging the orbit view but allow clicks on cards
	const handleMouseDown = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		const isCard = target.closest(".orbit-card");

		// Only stop propagation if NOT clicking on a card
		// This allows card clicks to reach the Orbit component's handlers
		if (!isCard) {
			e.stopPropagation();
			e.preventDefault();
		}
		// If clicking on a card, let the event through so toggleItem works
	};

	const handleUserAssigned = (taskId: string, userId: string) => {
		emit("userAssigned", taskId, userId);
	};

	const handleUserRemoved = (taskId: string, userId: string) => {
		emit("userRemoved", taskId, userId);
	};

	const handleTimelineReordered = (newTimelineData: any[]) => {
		emit("timelineReordered", newTimelineData);
	};
</script>

<style scoped>
.user-task-orbit-overlay {
	position: absolute;
	top: -200px; /* Position higher to center orbit on avatar */
	left: 50%;
	transform: translateX(-50%);
	width: 400px;
	height: 400px;
	pointer-events: auto; /* Allow pointer events through */
	opacity: 0;
	transition: opacity 0.3s ease;
	z-index: 1000;
	user-select: none;
	-webkit-user-drag: none;
}

.user-task-orbit-overlay.active {
	opacity: 1;
}

/* Close button - simple, positioned in top right of overlay */
.orbit-close-button {
	position: absolute;
	top: 10px;
	right: 10px;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	color: rgba(255, 255, 255, 0.9);
	cursor: pointer;
	pointer-events: auto !important;
	z-index: 1001;
	transition: all 0.2s ease;
}

.orbit-close-button:hover {
	background: rgba(239, 68, 68, 0.8);
	border-color: rgba(239, 68, 68, 0.8);
	color: white;
	transform: scale(1.1);
}

.orbit-container {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	-webkit-user-drag: none;
}

/* Allow all pointer events through - only prevent dragging */
.orbit-container :deep(*) {
	-webkit-user-drag: none !important;
}

/* Make sure orbit cards are clickable */
.orbit-container :deep(.orbit-card) {
	cursor: pointer !important;
}

/* Make sure buttons and interactive elements in cards work */
.orbit-container :deep(.orbit-card button),
.orbit-container :deep(.orbit-card input),
.orbit-container :deep(.orbit-card textarea),
.orbit-container :deep(.orbit-card select) {
	pointer-events: auto !important;
	cursor: pointer !important;
}

/* Make orbit center transparent/invisible - positioned over avatar */
.orbit-container :deep(.orbit-center) {
	opacity: 0 !important;
	background: transparent !important;
	pointer-events: none !important; /* Don't block clicks */
	width: 60px !important;
	height: 60px !important;
}

.orbit-container :deep(.orbit-center *) {
	pointer-events: none !important; /* All center children shouldn't block clicks */
}

.orbit-container :deep(.orbit-center-icon) {
	opacity: 0 !important;
}

.orbit-container :deep(.orbit-center-label) {
	opacity: 0 !important;
}

.orbit-container :deep(.orbit-center-image) {
	opacity: 0 !important;
}

.orbit-container :deep(.orbit-title) {
	opacity: 0 !important;
	display: none !important;
}

/* Remove grey background from orbit nodes */
.orbit-container :deep(.absolute.w-8.h-8.rounded-full),
.orbit-container :deep(.orbit-node-icon),
.orbit-container :deep([class*="rounded-full"][class*="bg-"]) {
	background: transparent !important;
}

/* Hide user icons inside orbit nodes */
.orbit-container :deep(.orbit-node-icon),
.orbit-container :deep(.absolute.w-8.h-8.rounded-full),
.orbit-container :deep(.absolute.w-8.h-8.rounded-full *),
.orbit-container :deep([class*="orbit"] svg),
.orbit-container :deep([class*="orbit"] img) {
	opacity: 0 !important;
	display: none !important;
}

/* Style orbit cards - smaller and consistent */
.orbit-container :deep(.orbit-card) {
	background: transparent !important;
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.25);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	max-width: 120px !important;
	min-width: 100px !important;
	font-size: 0.75rem !important;
	padding: 0.5rem !important;
}

.orbit-container :deep(.orbit-card:hover) {
	border-color: rgba(255, 255, 255, 0.4);
	transform: scale(1.1);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
	z-index: 10;
}

.orbit-container :deep(.orbit-card-title) {
	font-size: 0.7rem !important;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.orbit-container :deep(.orbit-card-content) {
	font-size: 0.65rem !important;
	max-height: 2.5em;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

/* Allow clicks through SVG and orbit background elements, but prevent dragging */
.orbit-container :deep(svg) {
	pointer-events: none !important; /* SVG paths shouldn't block clicks */
	-webkit-user-drag: none !important;
}

.orbit-container :deep(.orbit-path) {
	pointer-events: none !important; /* Orbit paths shouldn't block clicks */
}

.orbit-container :deep(.orbit-line) {
	pointer-events: none !important; /* Connection lines shouldn't block clicks */
}

/* Ensure the main orbit wrapper allows events */
.orbit-container :deep(.w-full.h-screen) {
	pointer-events: auto !important; /* Main orbit container should accept events */
}

/* Hide the Orbit component's built-in controls card */
.orbit-container :deep(.absolute.top-4.right-4) {
	display: none !important;
}

/* Hide the orbit title display */
.orbit-container :deep(.absolute.top-8) {
	display: none !important;
}
</style>

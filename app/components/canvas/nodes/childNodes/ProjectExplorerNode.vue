<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		node-class="project-explorer-node"
		:min-width="600"
		:min-height="500"
		:show-default-header="true"
		:show-close-button="false"
		:collapsible="false"
		:default-collapsed="false"
		:theme-color="themeColor"
		icon="lucide:folder-tree"
		:title="customNodeProps.data?.label || 'PROJECT EXPLORER'"
		:status-label="projectPath ? 'Loaded' : 'Waiting'"
		:status-color="projectPath ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'"
	>
		<template #header-actions>
			<UiBadge :variant="projectPath ? 'default' : 'outline'" size="sm">
				<div class="w-2 h-2 rounded-full mr-1.5" :class="projectPath ? 'bg-success' : 'bg-muted'" />
				{{ projectPath ? 'Loaded' : 'Waiting' }}
			</UiBadge>
		</template>

		<NodePanel class="p-4">
			<!-- File Tree - Simple and Direct -->
			<div v-if="projectPath" class="file-tree-wrapper">
				<FileTree
					:project-path="projectPath"
					@fileSelected="handleFileSelected"
					@fileOpened="handleFileOpened"
					@error="handleError"
					@watchToggled="handleWatchToggled"
				/>
			</div>

			<!-- No Path Message -->
			<div v-else class="flex flex-col items-center justify-center p-8 text-center">
				<Icon name="lucide:folder-x" class="w-8 h-8 text-muted-foreground/30 mb-2" />
				<p class="text-sm text-muted-foreground">Waiting for folder selection...</p>
				<p class="text-xs text-muted-foreground/60 mt-1">Select a folder in the previous node</p>
			</div>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import BaseNodeTemplate from "../templates/BaseNodeTemplate.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import { computed, ref, watch } from "vue";
	import FileTree from "~/components/Automate/shared/FileTree.vue";

	interface Props {
		customNodeProps: any
		isOscarPreview?: boolean // Flag to indicate Oscar preview mode
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const props = withDefaults(defineProps<Props>(), {
		isOscarPreview: false
	});

	const emit = defineEmits<{
		fileSelected: [file: any]
		fileOpened: [file: any, content: string]
		error: [error: string]
		watchToggled: [watchId: string, isNowWatching: boolean]
	}>();

	// Theme color using primary from theme
	const themeColor = computed(() => "var(--color-primary)");

	// Simple reactive state - just the project path
	const projectPath = ref<string | null>(null);

	// Initialize from props
	console.log("ProjectExplorerNode: INITIALIZING");
	console.log("ProjectExplorerNode: props.customNodeProps:", props.customNodeProps);
	console.log("ProjectExplorerNode: props.customNodeProps?.data:", props.customNodeProps?.data);
	console.log("ProjectExplorerNode: props.customNodeProps?.data?.projectPath:", props.customNodeProps?.data?.projectPath);
	console.log("ProjectExplorerNode: props.customNodeProps?.data?.selectedFolderPath:", props.customNodeProps?.data?.selectedFolderPath);

	if (props.customNodeProps?.data?.projectPath) {
		projectPath.value = props.customNodeProps.data.projectPath;
		console.log("✅ ProjectExplorerNode: Initialized with projectPath:", projectPath.value);
	} else if (props.customNodeProps?.data?.selectedFolderPath) {
		projectPath.value = props.customNodeProps.data.selectedFolderPath;
		console.log("✅ ProjectExplorerNode: Initialized with selectedFolderPath:", projectPath.value);
	} else {
		console.log("❌ ProjectExplorerNode: NO PATH FOUND IN PROPS");
	}

	// Watch for prop changes - SIMPLE approach
	watch(() => props.customNodeProps?.data?.projectPath, (newPath) => {
		console.log("ProjectExplorerNode: Path changed to:", newPath);
		if (newPath && newPath !== projectPath.value) {
			projectPath.value = newPath;
			console.log("ProjectExplorerNode: Updated projectPath to:", projectPath.value);
		}
	}, { immediate: true });

	// Also watch selectedFolderPath as backup
	watch(() => props.customNodeProps?.data?.selectedFolderPath, (newPath) => {
		console.log("ProjectExplorerNode: selectedFolderPath changed to:", newPath);
		if (newPath && !projectPath.value) {
			projectPath.value = newPath;
			console.log("ProjectExplorerNode: Set projectPath from selectedFolderPath:", projectPath.value);
		}
	}, { immediate: true });

	// Event handlers
	const handleFileSelected = (file: any) => {
		console.log("ProjectExplorerNode: File selected:", file);
		emit("fileSelected", file);
	};

	const handleFileOpened = (file: any, content: string) => {
		console.log("🔷 ProjectExplorerNode: File opened:", file);
		console.log("🔷 ProjectExplorerNode: File path:", file.path);
		console.log("🔷 ProjectExplorerNode: Content length:", content?.length);
		console.log("🔷 ProjectExplorerNode: Emitting file-opened event to parent (CanvasPanel)");
		emit("fileOpened", file, content);
	};

	const handleError = (error: string) => {
		console.error("ProjectExplorerNode: Error:", error);
		emit("error", error);
	};

	const handleWatchToggled = (watchId: string, isNowWatching: boolean) => {
		console.log("👁️ ProjectExplorerNode: Watch toggled:", { watchId, isNowWatching });
		emit("watchToggled", watchId, isNowWatching);
	};
</script>

<style scoped>
/* Project Explorer Node Styles */
.project-explorer-node {
	position: relative;
	overflow: visible !important;
}

/* Ensure icon wrapper is visible and not cut off */
.project-explorer-node :deep(.node-icon-wrapper) {
	overflow: visible !important;
	z-index: 20 !important;
}

/* Ensure parent container allows overflow */
.project-explorer-node :deep(.base-node-template) {
	overflow: visible !important;
}

/* Override FileTree's max-height to allow it to fill the space */
.project-explorer-node :deep(.file-tree-container) {
	max-height: none !important;
	height: 100% !important;
}
</style>

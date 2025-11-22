<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-target"
		title="INTENT SELECTION"
		:theme-color="themeColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:min-width="400"
		:min-height="600"
		:default-collapsed="false"
		node-class="intent-selection-node"
	>
		<template #header-actions>
			<div class="flex items-center gap-2">
				<div class="w-2 h-2 rounded-full" :class="isConfigured ? 'bg-success' : 'bg-muted'" />
				<UiBadge
					:variant="isConfigured ? 'default' : 'outline'"
					size="sm"
					:class="isConfigured ? 'bg-success/20 text-success border-success/30' : ''"
				>
					{{ isConfigured ? 'Intent Selected' : 'Not Selected' }}
				</UiBadge>
			</div>
		</template>

		<!-- Node Content -->
		<template #default>
		<NodePanel class="p-6 space-y-6">
			<!-- Folder Browser Section -->
			<FolderBrowserSection
				v-if="showFolderBrowser || showGitCloneBrowser"
				:title="showGitCloneBrowser ? 'Configure Git Clone' : 'Select Repository Folder'"
				:description="showGitCloneBrowser ? 'Choose where to clone the Git repository' : 'Choose a folder containing your existing project'"
				:show-git-info="showGitCloneBrowser"
				:linked-repository="linkedRepository"
				:is-loading="isLoading"
				:selected-folder-path="selectedFolderPath"
				:folder-analysis="folderAnalysis"
				:project-type="selectedProjectType"
				@back="goBackToProjectTypeSelection"
				@browse="browseForFolder"
			/>

			<!-- Project Type Selection -->
			<div v-else class="project-type-selector space-y-6">
				<!-- Header -->
				<div class="content-header">
					<h2 class="text-2xl font-bold text-foreground mb-2">
						Choose Project Type
					</h2>
					<p class="text-muted-foreground">
						Select how you want to start your project
					</p>
				</div>

				<!-- Project Type Cards -->
				<div class="grid grid-cols-1 gap-4">
					<ProjectTypeCard
						type="existing"
						title="Open Existing"
						description="Select and analyze an existing project repository"
						icon="i-lucide-folder-open"
						type-label="Repository"
						estimated-time="1-2 min"
						button-label="Browse Folder"
						:is-selected="selectedProjectType === 'existing'"
						@click="handleOpenExisting"
					/>

					<ProjectTypeCard
						type="new"
						title="Create New"
						description="Start a new project from scratch with guided setup"
						icon="i-lucide-plus-circle"
						type-label="New Project"
						estimated-time="5-10 min"
						button-label="Start Creating"
						:is-selected="selectedProjectType === 'new'"
						@click="handleCreateNew"
					/>

					<ProjectTypeCard
						type="git"
						title="Clone from Git"
						description="Clone a Git repository and set up the project"
						icon="i-lucide-git-branch"
						type-label="Git Repository"
						estimated-time="3-8 min"
						button-label="Clone Repository"
						:is-selected="selectedProjectType === 'git'"
						@click="handleCloneFromGit"
					/>
				</div>
			</div>

			<!-- Action Buttons -->
			<div v-if="isConfigured" class="node-actions mt-6 flex gap-2 justify-end">
				<UiButton
					variant="default"
					size="sm"
					@click="proceedToNext"
				>
					<Icon name="lucide:arrow-right" class="w-4 h-4" />
					Continue
				</UiButton>
				<UiButton
					v-if="selectedProjectType"
					variant="outline"
					size="sm"
					@click="resetSelection"
				>
					<Icon name="lucide:refresh-cw" class="w-4 h-4" />
					Reset
				</UiButton>
			</div>
		</NodePanel>
		</template>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import BaseNodeTemplate from "@canvas/nodes/templates/BaseNodeTemplate.vue";
	import NodePanel from "~/components/canvas/shared/NodePanel.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import ProjectTypeCard from "./IntentSelection/ProjectTypeCard.vue";
	import FolderBrowserSection from "./IntentSelection/FolderBrowserSection.vue";
	import { buttClient } from "@utils/buttClient";
	import { useInjectCanvasState } from "@canvas/composables/useCanvasState";

	interface Props {
		customNodeProps: any;
		updateNodeData?: (nodeId: string, key: string, value: any) => void;
		handleProceedToNext?: (data: any) => void;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		intentSelected: [intent: any];
		proceedToNext: [intent: any];
		nodeUpdated: [nodeId: string, data: any];
	}>();

	const canvasState = useInjectCanvasState();

	// Theme color using primary from theme
	const themeColor = computed(() => "var(--color-primary)");

	// State
	const selectedProjectType = ref<string | null>(props.customNodeProps?.data?.selectedProjectType || null);
	const showFolderBrowser = ref(false);
	const showGitCloneBrowser = ref(false);
	const selectedFolderPath = ref<string | null>(props.customNodeProps?.data?.selectedFolderPath || null);
	const folderAnalysis = ref<any>(props.customNodeProps?.data?.folderAnalysis || null);
	const isLoading = ref(false);
	const linkedRepository = ref<any>(props.customNodeProps?.data?.linkedRepository || null);

	// Computed
	const isConfigured = computed(() => {
		const needsFolderSelection = selectedProjectType.value === "existing" || selectedProjectType.value === "git";
		const configured = !!selectedProjectType.value && (!needsFolderSelection || !!selectedFolderPath.value);
		return configured;
	});

	// Event handlers
	const handleOpenExisting = () => {
		selectedProjectType.value = "existing";
		showFolderBrowser.value = true;
		emit("intentSelected", { type: "existing", label: "Open Existing" });

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "selectedProjectType", "existing");
		}
	};

	const handleCreateNew = () => {
		selectedProjectType.value = "new";
		emit("intentSelected", { type: "new", label: "Create New" });

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "selectedProjectType", "new");
		}
	};

	const handleCloneFromGit = () => {
		selectedProjectType.value = "git";
		showGitCloneBrowser.value = true;
		emit("intentSelected", { type: "git", label: "Clone from Git" });

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "selectedProjectType", "git");
		}
	};

	const handleFolderSelected = (path: string, analysis: any) => {
		selectedFolderPath.value = path;
		folderAnalysis.value = analysis;

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "selectedFolderPath", path);
			props.updateNodeData(props.customNodeProps.id, "folderAnalysis", analysis);
		}
	};

	const proceedToNext = () => {
		if (selectedProjectType.value) {
			const proceedData = {
				type: selectedProjectType.value,
				folderPath: selectedFolderPath.value,
				linkedRepository: linkedRepository.value,
				folderAnalysis: folderAnalysis.value,
				parentNodeId: props.customNodeProps.id,
				templateNodeId: props.customNodeProps.data?.parentNodeId || null
			};

			if (props.handleProceedToNext && typeof props.handleProceedToNext === "function") {
				props.handleProceedToNext(proceedData);
			} else {
				emit("proceedToNext", proceedData);
			}
		}
	};

	const resetSelection = () => {
		selectedProjectType.value = null;
		showFolderBrowser.value = false;
		showGitCloneBrowser.value = false;
		selectedFolderPath.value = null;
		folderAnalysis.value = null;

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "selectedProjectType", null);
			props.updateNodeData(props.customNodeProps.id, "selectedFolderPath", null);
			props.updateNodeData(props.customNodeProps.id, "folderAnalysis", null);
		}
	};

	const goBackToProjectTypeSelection = () => {
		showFolderBrowser.value = false;
		showGitCloneBrowser.value = false;
		selectedProjectType.value = null;
	};

	const browseForFolder = async () => {
		isLoading.value = true;
		try {
			const { open } = await import("@tauri-apps/plugin-dialog");
			const dialogTitle = showGitCloneBrowser.value ? "Select Clone Destination" : "Select Project Folder";
			const selected = await open({
				directory: true,
				multiple: false,
				title: dialogTitle
			});

			if (selected) {
				selectedFolderPath.value = selected as string;

				if (selectedProjectType.value === "existing") {
					folderAnalysis.value = {
						frontend: { name: "React" },
						backend: { name: "Node.js" },
						database: { name: "PostgreSQL" }
					};
				} else {
					folderAnalysis.value = null;
				}

				handleFolderSelected(selected as string, folderAnalysis.value);
			}
		} catch (error) {
			console.error("Error browsing for folder:", error);
		} finally {
			isLoading.value = false;
		}
	};

	// Load linked repository from project on mount
	onMounted(async () => {
		try {
			const projectId = 
				props.customNodeProps?.data?.projectId
				|| props.customNodeProps?.data?.selectedProjectId
				|| canvasState?.getProjectContext()?.projectId;

			if (projectId && !linkedRepository.value) {
				const allProjects = await buttClient.findAllProject();
				const project = Array.isArray(allProjects)
					? allProjects.find((p: any) => String(p.id) === String(projectId))
					: null;

				if (project?.integrations) {
					const gitIntegration = project.integrations.find((int: any) => 
						int.type === "github" || int.type === "git" || int.type === "gitHub"
					);

					if (gitIntegration?.data?.repository) {
						linkedRepository.value = {
							url: gitIntegration.data.repository.url || gitIntegration.data.repository,
							name: gitIntegration.data.repository.name || gitIntegration.data.repository
						};

						if (props.updateNodeData) {
							props.updateNodeData(props.customNodeProps.id, "linkedRepository", linkedRepository.value);
						}
					}
				}
			}
		} catch (error) {
			console.error("❌ Error loading linked repository:", error);
		}
	});
</script>

<style scoped>
	/* Intent Selection Node Styles */
	.intent-selection-node {
		position: relative;
		overflow: visible !important;
	}

	/* Ensure icon wrapper is visible and not cut off */
	.intent-selection-node :deep(.node-icon-wrapper) {
		overflow: visible !important;
		z-index: 20 !important;
	}

	/* Ensure parent container allows overflow */
	.intent-selection-node :deep(.base-node-template) {
		overflow: visible !important;
	}
</style>

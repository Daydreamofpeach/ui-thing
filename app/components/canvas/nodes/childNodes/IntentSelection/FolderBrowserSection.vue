<template>
	<div class="folder-browser-section space-y-4">
		<!-- Header with Back Button -->
		<div class="flex items-center gap-3">
			<UiButton
				variant="ghost"
				size="sm"
				@click="$emit('back')"
			>
				<Icon name="lucide:arrow-left" class="w-4 h-4" />
			</UiButton>
			<div>
				<h4 class="text-lg font-semibold text-foreground">
					{{ title }}
				</h4>
				<p class="text-sm text-muted-foreground">
					{{ description }}
				</p>
			</div>
		</div>

		<!-- Git Repository Info (for Git Clone) -->
		<UiCard v-if="showGitInfo && linkedRepository" class="border-primary/20 bg-primary/5">
			<UiCardContent class="p-4">
				<div class="flex items-start gap-3">
					<Icon name="i-lucide-git-branch" class="w-5 h-5 text-primary mt-1 flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<div class="text-sm font-medium text-primary mb-1">
							Git Repository Linked
						</div>
						<div class="text-xs text-muted-foreground font-mono break-all">
							{{ linkedRepository.url }}
						</div>
					</div>
				</div>
			</UiCardContent>
		</UiCard>

		<!-- Folder Browser Section -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
						<Icon name="i-lucide-folder-open" class="w-5 h-5 text-primary" />
						Select Repository Folder
					</h3>
					<p class="text-sm text-muted-foreground mt-1">
						Choose a folder containing your existing project
					</p>
				</div>
				<UiButton
					variant="outline"
					:disabled="isLoading"
					@click="$emit('browse')"
				>
					<Icon 
						:name="isLoading ? 'i-lucide-loader-2' : 'i-lucide-folder-plus'" 
						class="w-4 h-4"
						:class="{ 'animate-spin': isLoading }"
					/>
					{{ isLoading ? 'Browsing...' : 'Browse Folder' }}
				</UiButton>
			</div>

			<!-- Selected Folder Display -->
			<UiCard v-if="selectedFolderPath" class="border-success/20 bg-success/5">
				<UiCardContent class="p-4">
					<div class="flex items-center gap-3 mb-2">
						<Icon name="i-lucide-check-circle" class="w-5 h-5 text-success flex-shrink-0" />
						<span class="font-medium text-success">
							{{ folderSelectedLabel }}
						</span>
					</div>
					<div class="text-sm text-muted-foreground font-mono break-all">
						{{ selectedFolderPath }}
					</div>

					<!-- Project Analysis -->
					<ProjectAnalysisDisplay
						v-if="folderAnalysis && projectType === 'existing'"
						:analysis="folderAnalysis"
						class="mt-3"
					/>
				</UiCardContent>
			</UiCard>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import ProjectAnalysisDisplay from "./ProjectAnalysisDisplay.vue";

	interface Props {
		title: string;
		description: string;
		showGitInfo?: boolean;
		linkedRepository?: {
			url: string;
			name?: string;
		} | null;
		isLoading?: boolean;
		selectedFolderPath?: string | null;
		folderAnalysis?: any;
		projectType?: string | null;
	}

	withDefaults(defineProps<Props>(), {
		showGitInfo: false,
		linkedRepository: null,
		isLoading: false,
		selectedFolderPath: null,
		folderAnalysis: null,
		projectType: null,
	});

	const emit = defineEmits<{
		back: [];
		browse: [];
	}>();

	const folderSelectedLabel = computed(() => {
		return props.projectType === "git" ? "Destination Selected" : "Folder Selected";
	});
</script>

<style scoped>
	.folder-browser-section {
		max-height: 500px;
		overflow-y: auto;
	}
</style>


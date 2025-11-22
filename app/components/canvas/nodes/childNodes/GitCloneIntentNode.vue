<template>
	<div class="git-clone-intent-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper" style="border-color: #f97316;">
			<Icon name="lucide:git-branch" class="w-6 h-6 text-orange-400" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			title="GIT CLONE INTENT"
			title-color="#f97316"
			theme-color="#f97316"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="false"
		>
			<template #actions>
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 rounded-full" :class="isConfigured ? 'bg-green-500' : 'bg-gray-500'" />
					<span class="text-xs" :class="isConfigured ? 'text-green-400' : 'text-gray-400'">
						{{ isConfigured ? 'Configured' : 'Pending' }}
					</span>
				</div>
			</template>
		</NodeHeader>

		<!-- Node Content Panel -->
		<NodePanel
			panel-class="git-clone-content-panel"
			scrollbar-color="rgba(249, 115, 22, 0.4)"
		>
			<div class="space-y-6">
				<!-- Repository Section -->
				<div class="repository-section">
					<h3 class="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
						<Icon name="i-lucide-git-branch" class="w-4 h-4 text-orange-400" />
						Git Repository
					</h3>

					<!-- Linked Repository Display -->
					<div v-if="linkedRepository" class="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
						<div class="flex items-start justify-between gap-3 mb-2">
							<div class="flex items-center gap-2">
								<Icon name="i-lucide-check-circle" class="w-5 h-5 text-green-400" />
								<div>
									<p class="font-medium text-green-400">
										Repository Linked
									</p>
									<p class="text-xs text-white/60 mt-1">
										{{ linkedRepository.url }}
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- No Repository Linked -->
					<div v-else class="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
						<div class="flex items-center gap-2 mb-2">
							<Icon name="i-lucide-alert-circle" class="w-5 h-5 text-orange-400" />
							<p class="text-sm font-medium text-orange-400">
								No Repository Linked
							</p>
						</div>
						<p class="text-xs text-white/60">
							Please link a Git repository to your project before cloning.
						</p>
					</div>
				</div>

				<!-- Clone Destination Section -->
				<div class="destination-section">
					<h3 class="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
						<Icon name="i-lucide-folder" class="w-4 h-4 text-blue-400" />
						Clone Destination
					</h3>

					<div v-if="selectedCloneDir" class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-3">
						<p class="text-xs text-white/60 mb-1">
							Destination Folder:
						</p>
						<p class="text-sm font-mono text-blue-400 break-all">
							{{ selectedCloneDir }}
						</p>
					</div>

					<button
						class="w-full px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
						:disabled="isSelectingFolder"
						@click="selectCloneDestination"
					>
						<Icon :name="isSelectingFolder ? 'i-lucide-loader-2' : 'i-lucide-folder-open'" :class="{ 'animate-spin': isSelectingFolder }" class="w-4 h-4" />
						{{ isSelectingFolder ? 'Selecting...' : 'Select Clone Destination' }}
					</button>
				</div>

				<!-- Summary -->
				<div v-if="linkedRepository && selectedCloneDir" class="summary-section p-4 rounded-lg bg-white/5 border border-white/10">
					<p class="text-xs text-white/60 mb-2">
						Ready to proceed:
					</p>
					<ul class="space-y-1 text-xs text-white/70">
						<li>✓ Repository: {{ linkedRepository.url.split('/').pop() }}</li>
						<li>✓ Destination: {{ selectedCloneDir }}</li>
					</ul>
				</div>

				<!-- Action Button -->
				<button
					v-if="linkedRepository && selectedCloneDir"
					class="w-full px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
					@click="proceedToClone"
				>
					<Icon name="i-lucide-arrow-right" class="w-4 h-4" />
					Proceed to Clone
				</button>
			</div>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import Icon from "@components/ui/Icon.vue";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref } from "vue";

	interface Props {
		customNodeProps: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
		linkedRepository?: { url: string, name: string }
		onProceed?: (data: { repository: any, destination: string }) => void
	}

	const props = defineProps<Props>();

	// State
	const selectedCloneDir = ref("");
	const isSelectingFolder = ref(false);
	const linkedRepository = ref(props.linkedRepository || null);

	// Computed
	const isConfigured = computed(() => !!(linkedRepository.value && selectedCloneDir.value));

	// Methods
	const selectCloneDestination = async () => {
		try {
			isSelectingFolder.value = true;

			// Dynamically import Tauri dialog
			let dialogOpen: any;
			try {
				const dialogModule = await import("@tauri-apps/plugin-dialog");
				dialogOpen = dialogModule.open;
			} catch {
				console.error("Tauri dialog not available");
				return;
			}

			if (!dialogOpen) {
				console.error("Dialog open function not available");
				return;
			}

			const selected = await dialogOpen({ directory: true });
			if (selected) {
				selectedCloneDir.value = selected as string;
				if (props.updateNodeData) {
					props.updateNodeData(props.customNodeProps.id, "selectedCloneDir", selectedCloneDir.value);
				}
			}
		} catch (error) {
			console.error("Error selecting folder:", error);
		} finally {
			isSelectingFolder.value = false;
		}
	};

	const proceedToClone = () => {
		if (props.onProceed && linkedRepository.value && selectedCloneDir.value) {
			props.onProceed({
				repository: linkedRepository.value,
				destination: selectedCloneDir.value
			});
		}
	};

	// Load saved data on mount
	onMounted(() => {
		const nodeData = props.customNodeProps?.data || {};
		if (nodeData.selectedCloneDir) {
			selectedCloneDir.value = nodeData.selectedCloneDir;
		}
		// Check if there's linked repository data passed in
		if (props.linkedRepository) {
			linkedRepository.value = props.linkedRepository;
		}
	});
</script>

<style scoped>
.git-clone-intent-node-container {
	background: linear-gradient(135deg, rgba(124, 45, 18, 0.9), rgba(194, 65, 12, 0.95));
	border: 2px solid rgba(251, 191, 36, 0.35);
}

.git-clone-content-panel {
	padding: 16px;
	color: white;
}

.node-icon-wrapper {
	width: 44px;
	height: 44px;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid;
	margin-bottom: 12px;
	margin-top: -58px;
	margin-left: 12px;
	background: linear-gradient(135deg, rgba(124, 45, 18, 0.6), rgba(194, 65, 12, 0.8));
	box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
</style>

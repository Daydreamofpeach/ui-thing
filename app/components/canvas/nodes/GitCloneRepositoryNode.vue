<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-git-branch"
		title="GIT CLONE REPOSITORY"
		:title-color="themeColor"
		:theme-color="themeColor"
		:status-label="statusLabel"
		:status-color="statusColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:background-color="backgroundColor"
		:border-color="borderColor"
		:min-width="500"
		:min-height="400"
		:default-collapsed="false"
		node-class="git-clone-node"
		@close="handleClose"
	>
		<div class="git-clone-content-wrapper">
			<!-- Header Section -->
			<div class="git-clone-header mb-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="neural-icon">
						<UIcon name="i-lucide-git-branch" class="text-xl text-pink-400" />
					</div>
					<div>
						<h3 class="font-semibold text-white">Clone Repository</h3>
						<p class="text-xs text-white/60">Configure and clone your Git repository</p>
					</div>
				</div>
			</div>

			<!-- Linked Repository Display -->
			<div v-if="linkedRepository" class="mb-4">
				<div class="glassmorphic-panel p-4 rounded-lg border border-pink-500/20 bg-pink-500/5">
					<div class="flex items-start gap-3">
						<UIcon name="i-lucide-git-branch" class="w-5 h-5 text-pink-400 mt-1" />
						<div class="flex-1">
							<div class="text-sm font-medium text-pink-400 mb-1">
								Repository Linked
							</div>
							<div class="text-xs text-white/70 font-mono break-all">
								{{ linkedRepository.url }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Repository URL Input -->
			<div class="space-y-4">
				<!-- Git URL Input -->
				<div class="form-field">
					<label class="block text-sm font-medium text-white/80 mb-2">Repository URL</label>
					<input
						v-model="gitUrl"
						type="text"
						placeholder="https://github.com/username/repo.git"
						class="glassmorphic-input w-full px-3 py-2 rounded-lg text-sm"
						:class="{ 'border-pink-500/50': gitUrl, 'border-gray-600': !gitUrl }"
					>
				</div>

				<!-- Clone Directory Input -->
				<div class="form-field">
					<label class="block text-sm font-medium text-white/80 mb-2">Clone Directory</label>
					<div class="flex gap-2 items-center">
						<input
							v-model="cloneDir"
							type="text"
							placeholder="Select destination folder..."
							readonly
							class="glassmorphic-input flex-1 px-3 py-2 rounded-lg text-sm"
						>
						<button
							class="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-sm font-medium transition-colors"
							@click="selectCloneDir"
						>
							<UIcon name="i-lucide-folder-open" class="w-4 h-4" />
						</button>
					</div>
				</div>

				<!-- Clone Button -->
				<button
					class="w-full px-4 py-2 bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					:disabled="!gitUrl || isCloning"
					@click="cloneRepository"
				>
					<UIcon :name="isCloning ? 'i-lucide-loader-2' : 'i-lucide-download-cloud'" :class="{ 'animate-spin': isCloning }" class="w-4 h-4" />
					{{ isCloning ? 'Cloning...' : 'Clone Repository' }}
				</button>

				<!-- Output Section -->
				<div v-if="outputMessage" class="mt-4 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
					<p class="text-xs font-mono text-green-400 whitespace-pre-wrap max-h-32 overflow-y-auto">{{ outputMessage }}</p>
				</div>

				<!-- Cloned Repositories List -->
				<div v-if="clonedRepositories.length > 0" class="mt-6 space-y-3">
					<h4 class="text-sm font-semibold text-white/80">Cloned Repositories</h4>
					<div class="space-y-2 max-h-40 overflow-y-auto">
						<div
							v-for="repo in clonedRepositories"
							:key="repo.path"
							class="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/30 transition-colors"
						>
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-white/80 truncate">{{ repo.name }}</p>
									<p class="text-xs text-white/50 truncate">{{ repo.path }}</p>
								</div>
								<button
									class="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
									@click="deleteRepository(repo)"
									title="Delete repository"
								>
									<UIcon name="i-lucide-trash-2" class="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Link to Orbit Button (visible when repo is cloned) -->
				<button
					v-if="clonedRepositories.length > 0 && canLinkToOrbit"
					class="w-full mt-4 px-4 py-2 bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
					@click="linkTemplateChainToOrbit"
				>
					<UIcon name="i-lucide-link-2" class="w-4 h-4" />
					Link to Project Orbit
				</button>
			</div>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
import { useTauriShellCommand } from "#imports";
import { useNodeOrbitLinking } from "../composables/useNodeOrbitLinking";

interface Props {
	customNodeProps: any;
	updateNodeData?: (nodeId: string, key: string, value: any) => void;
	createOrbitNode?: (data: any) => string;
	createChildNode?: (parentId: string, data: any) => string;
	addEdge?: (source: string, target: string) => void;
}

const props = defineProps<Props>();

// Interface for Repository type
interface Repository {
	name: string;
	url: string;
	path: string;
	packageManager?: string;
}

// Use the generic orbit linking composable
const { linkToOrbit, isLinking, linkError } = useNodeOrbitLinking();

// Refs
const gitUrl = ref("");
const cloneDir = ref("");
const isCloning = ref(false);
const outputMessage = ref("");
const clonedRepositories = ref<Array<{ name: string; url: string; path: string }>>([]);
const linkedRepository = ref<any>(null);

// Computed
const themeColor = "#ec4899"; // Pink
const statusLabel = computed(() => {
	if (clonedRepositories.value.length > 0) return "Ready";
	return "Pending";
});
const statusColor = computed(() => (clonedRepositories.value.length > 0 ? "#22c55e" : "#ec4899"));
const backgroundColor = "transparent";
const borderColor = "rgba(236, 72, 153, 0.5)";

const canLinkToOrbit = computed(() => {
	// Check if parent node can be a project node
	return true;
});

// Methods
const selectCloneDir = async () => {
	try {
		// Use Tauri dialog if available
		const dialogModule = await import("@tauri-apps/plugin-dialog");
		const selected = await dialogModule.open({ directory: true });
		if (selected) cloneDir.value = selected as string;
	} catch {
		// Fallback: show default Documents folder
		cloneDir.value = "~/Documents";
	}
};

const cloneRepository = async () => {
	if (!gitUrl.value) {
		outputMessage.value = "Please enter a repository URL";
		return;
	}

	isCloning.value = true;
	outputMessage.value = "Initializing git clone...\n";

	try {
		const commandName = "exec-pwsh";
		let targetDir = cloneDir.value;

		// If no directory selected, use Documents
		if (!targetDir) {
			const getDocPathResponse = await useTauriShellCommand.create(commandName, [
				"-Command",
				"[Environment]::GetFolderPath('MyDocuments')"
			]).execute();

			if (getDocPathResponse.code === 0) {
				targetDir = getDocPathResponse.stdout.trim();
			} else {
				outputMessage.value = "Error: Could not determine Documents folder.";
				isCloning.value = false;
				return;
			}
		}

		const repoName = gitUrl.value.split("/").pop()?.replace(".git", "") || "repo";
		
		outputMessage.value += `Repository: ${repoName}\n`;
		outputMessage.value += `URL: ${gitUrl.value}\n`;
		outputMessage.value += `Destination: ${targetDir}\\${repoName}\n`;
		outputMessage.value += `\nCloning repository...\n`;

		// Execute git clone command
		const response = await useTauriShellCommand.create(commandName, [
			"-Command",
			`cd "${targetDir}"; git clone ${gitUrl.value} 2>&1`
		]).execute();

		if (response.stdout) {
			outputMessage.value += response.stdout;
		}

		if (response.stderr) {
			outputMessage.value += `\n--- stderr ---\n${response.stderr}`;
		}

		if (response.code === 0) {
			outputMessage.value += "\n\n✓ Repository cloned successfully!";

			const newRepo: Repository = {
				name: repoName,
				url: gitUrl.value,
				path: `${targetDir}\\${repoName}`
			};

			clonedRepositories.value.push(newRepo);

			// Update node data - use try-catch to handle potential issues
			if (props.updateNodeData) {
				try {
					props.updateNodeData(props.customNodeProps.id, "clonedRepositories", clonedRepositories.value);
				} catch (err) {
					console.warn("⚠️ Could not update clonedRepositories:", err);
				}
				
				try {
					props.updateNodeData(props.customNodeProps.id, "lastClonedUrl", gitUrl.value);
				} catch (err) {
					console.warn("⚠️ Could not update lastClonedUrl:", err);
				}
			}

			gitUrl.value = "";
		} else {
			outputMessage.value += `\n\n✗ Clone operation failed with exit code: ${response.code}`;
		}
	} catch (error) {
		outputMessage.value += `\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`;
	} finally {
		isCloning.value = false;
	}
};

const deleteRepository = (repo: any) => {
	const index = clonedRepositories.value.findIndex((r) => r.path === repo.path);
	if (index > -1) {
		clonedRepositories.value.splice(index, 1);
		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "clonedRepositories", clonedRepositories.value);
		}
	}
};

const linkTemplateChainToOrbit = async () => {
	try {
		console.log("🔗 Linking Git Clone repositories to orbit...");

		const handlers = {
			createOrbitNode: props.createOrbitNode,
			createChildNode: props.createChildNode,
			addEdge: props.addEdge
		};

		if (!handlers.createOrbitNode) {
			throw new Error("createOrbitNode handler not provided");
		}

		const result = await linkToOrbit(
			{
				items: clonedRepositories.value,
				sourceNodeId: props.customNodeProps.id,
				sourceNodeType: "gitCloneRepositoryNode",
				sourceData: {
					gitUrl: gitUrl.value,
					cloneDir: cloneDir.value
				}
			},
			handlers,
			"orbitCardNode",
			"taskNode"
		);

		outputMessage.value += `\n\n✅ Successfully linked ${result.itemCount} repositories to orbit!\n`;
		console.log("✅ Orbit linking completed:", result);
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		outputMessage.value += `\n\n❌ Error linking to orbit: ${errorMsg}\n`;
		console.error("❌ Orbit linking failed:", error);
	}
};

const handleClose = () => {
	// Handle node close
	console.log("GitCloneRepositoryNode closed");
};

// Load saved data on mount
onMounted(() => {
	const nodeData = props.customNodeProps?.data || {};
	if (nodeData.clonedRepositories) {
		clonedRepositories.value = nodeData.clonedRepositories;
	}
	if (nodeData.lastClonedUrl) {
		gitUrl.value = nodeData.lastClonedUrl;
	}
	if (nodeData.cloneDir) {
		cloneDir.value = nodeData.cloneDir;
	}
	if (nodeData.linkedRepository) {
		linkedRepository.value = nodeData.linkedRepository;
		// Pre-populate gitUrl with the linked repository
		if (!gitUrl.value && linkedRepository.value.url) {
			gitUrl.value = linkedRepository.value.url;
		}
	}
	if (nodeData.selectedCloneDir) {
		cloneDir.value = nodeData.selectedCloneDir;
	}
});
</script>

<style scoped>
.git-clone-node {
	background: transparent;
	border: 2px solid rgba(236, 72, 153, 0.5);
}

.git-clone-content-wrapper {
	padding: 16px;
	color: white;
}

.git-clone-header {
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding-bottom: 16px;
}

.neural-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.1));
	border: 1px solid rgba(236, 72, 153, 0.3);
	border-radius: 0.75rem;
}

.form-field {
	display: flex;
	flex-direction: column;
}

.form-field label {
	margin-bottom: 0.5rem;
}

.glassmorphic-input {
	background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
	backdrop-filter: blur(10px);
	border: 2px solid rgba(71, 85, 105, 0.4);
	color: white;
	transition: all 0.3s ease;
}

.glassmorphic-input:focus {
	outline: none;
	border-color: rgba(236, 72, 153, 0.6);
	box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
}

.glassmorphic-input::placeholder {
	color: rgba(156, 163, 175, 0.7);
}
</style>


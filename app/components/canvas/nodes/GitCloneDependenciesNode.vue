<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-package"
		title="GIT DEPENDENCIES"
		:title-color="themeColor"
		:theme-color="themeColor"
		:status-label="statusLabel"
		:status-color="statusColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:background-color="backgroundColor"
		:border-color="borderColor"
		:min-width="420"
		:min-height="300"
		:default-collapsed="false"
		node-class="git-dependencies-node"
		@close="handleClose"
	>
		<div class="git-dependencies-content">
			<!-- Header -->
			<div class="header-section mb-6">
				<div class="flex items-center gap-3 mb-3">
					<div class="neural-icon">
						<UIcon name="i-lucide-package" class="text-xl text-green-400" />
					</div>
					<div>
						<h3 class="font-semibold text-white">Package Manager</h3>
						<p class="text-xs text-white/60">Select and install dependencies</p>
					</div>
				</div>
			</div>

			<!-- Package Manager Selection -->
			<div class="space-y-4">
				<div v-if="availablePackageManagers.length > 0">
					<h4 class="text-sm font-semibold text-white/80 mb-3">Available Package Managers</h4>
					<div class="space-y-2">
						<div
							v-for="manager in availablePackageManagers"
							:key="manager.name"
							class="p-3 rounded-lg border-2 cursor-pointer transition-all"
							:class="selectedPackageManager === manager.name
								? 'bg-green-500/15 border-green-500/50'
								: 'bg-white/5 border-white/10 hover:border-white/20'"
							@click="selectPackageManager(manager.name)"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<UIcon :name="getPackageManagerIcon(manager.name)" class="w-5 h-5" />
									<div>
										<p class="text-sm font-medium text-white">{{ manager.name.toUpperCase() }}</p>
										<p v-if="!manager.installed" class="text-xs text-orange-400">Not installed</p>
										<p v-else class="text-xs text-white/50">v{{ manager.version }}</p>
									</div>
								</div>
								<div v-if="selectedPackageManager === manager.name" class="text-green-400">
									<UIcon name="i-lucide-check-circle" class="w-5 h-5" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Install Dependencies Button -->
				<button
					class="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					:disabled="!selectedPackageManager || isInstallingDependencies"
					@click="installDependencies"
				>
					<UIcon :name="isInstallingDependencies ? 'i-lucide-loader-2' : 'i-lucide-download'" :class="{ 'animate-spin': isInstallingDependencies }" class="w-4 h-4" />
					{{ isInstallingDependencies ? 'Installing...' : 'Install Dependencies' }}
				</button>

				<!-- Installation Output -->
				<div v-if="installationOutput" class="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
					<p class="text-xs font-mono text-green-400 whitespace-pre-wrap max-h-32 overflow-y-auto">{{ installationOutput }}</p>
				</div>

				<!-- Installation Status -->
				<div v-if="installationStatus" class="p-3 rounded-lg" :class="{
					'bg-green-500/10 border border-green-500/20': installationStatus === 'success',
					'bg-red-500/10 border border-red-500/20': installationStatus === 'failed',
					'bg-blue-500/10 border border-blue-500/20': installationStatus === 'in-progress'
				}">
					<div class="flex items-center gap-2">
						<UIcon :name="installationStatus === 'success' ? 'i-lucide-check-circle' : installationStatus === 'failed' ? 'i-lucide-alert-circle' : 'i-lucide-loader-2'" :class="{
							'text-green-400': installationStatus === 'success',
							'text-red-400': installationStatus === 'failed',
							'text-blue-400 animate-spin': installationStatus === 'in-progress'
						}" class="w-4 h-4" />
						<span class="text-sm font-medium" :class="{
							'text-green-400': installationStatus === 'success',
							'text-red-400': installationStatus === 'failed',
							'text-blue-400': installationStatus === 'in-progress'
						}">
							{{ installationStatus === 'success' ? 'Dependencies installed successfully' : installationStatus === 'failed' ? 'Installation failed' : 'Installing dependencies...' }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";

interface PackageManager {
	name: string;
	version: string;
	installed: boolean;
}

interface Props {
	customNodeProps: any;
	updateNodeData?: (nodeId: string, key: string, value: any) => void;
}

const props = defineProps<Props>();

// Refs
const selectedPackageManager = ref("");
const availablePackageManagers = ref<PackageManager[]>([
	{ name: "npm", version: "10.0.0", installed: true },
	{ name: "yarn", version: "3.6.0", installed: false },
	{ name: "pnpm", version: "8.0.0", installed: true },
	{ name: "bun", version: "1.0.0", installed: false }
]);
const isInstallingDependencies = ref(false);
const installationOutput = ref("");
const installationStatus = ref<"idle" | "in-progress" | "success" | "failed">("idle");

// Computed
const themeColor = "#16a34a";
const statusLabel = computed(() => {
	if (installationStatus.value === "success") return "Complete";
	if (installationStatus.value === "in-progress") return "Installing";
	return "Ready";
});
const statusColor = computed(() => {
	if (installationStatus.value === "success") return "#22c55e";
	if (installationStatus.value === "in-progress") return "#eab308";
	return "#f97316";
});
const backgroundColor = "linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(5, 150, 105, 0.95))";
const borderColor = "rgba(52, 211, 153, 0.35)";

// Methods
const getPackageManagerIcon = (name: string): string => {
	const iconMap: Record<string, string> = {
		npm: "i-simple-icons-npm",
		yarn: "i-simple-icons-yarn",
		pnpm: "i-simple-icons-pnpm",
		bun: "i-simple-icons-bun"
	};
	return iconMap[name] || "i-lucide-package";
};

const selectPackageManager = (name: string) => {
	selectedPackageManager.value = name;
};

const installDependencies = async () => {
	if (!selectedPackageManager.value) return;

	isInstallingDependencies.value = true;
	installationStatus.value = "in-progress";
	installationOutput.value = `Running ${selectedPackageManager.value} install...\n`;

	try {
		// Simulate installation
		await new Promise((resolve) => setTimeout(resolve, 2000));

		installationOutput.value += `✓ Dependencies installed successfully!\n\nInstalled ${selectedPackageManager.value}@latest\nTotal packages: 45\nTotal time: 2.3s\n`;
		installationStatus.value = "success";

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "installedPackageManager", selectedPackageManager.value);
			props.updateNodeData(props.customNodeProps.id, "installationStatus", "success");
		}
	} catch (error) {
		installationOutput.value += `✗ Installation failed: ${error instanceof Error ? error.message : "Unknown error"}`;
		installationStatus.value = "failed";
	} finally {
		isInstallingDependencies.value = false;
	}
};

const handleClose = () => {
	console.log("GitCloneDependenciesNode closed");
};

onMounted(() => {
	const nodeData = props.customNodeProps?.data || {};
	if (nodeData.installedPackageManager) {
		selectedPackageManager.value = nodeData.installedPackageManager;
	}
	if (nodeData.installationStatus) {
		installationStatus.value = nodeData.installationStatus;
	}
});
</script>

<style scoped>
.git-dependencies-node {
	background: linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(5, 150, 105, 0.95));
	border: 2px solid rgba(52, 211, 153, 0.35);
}

.git-dependencies-content {
	padding: 16px;
	color: white;
}

.header-section {
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding-bottom: 16px;
}

.neural-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1));
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 0.75rem;
}
</style>


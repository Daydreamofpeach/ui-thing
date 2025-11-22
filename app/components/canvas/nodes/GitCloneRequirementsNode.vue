<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-list-checks"
		title="GIT REQUIREMENTS"
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
		node-class="git-requirements-node"
		@close="handleClose"
	>
		<div class="git-requirements-content">
			<!-- Header -->
			<div class="header-section mb-6">
				<div class="flex items-center gap-3 mb-3">
					<div class="neural-icon">
						<UIcon name="i-lucide-list-checks" class="text-xl text-blue-400" />
					</div>
					<div>
						<h3 class="font-semibold text-white">Repository Analysis</h3>
						<p class="text-xs text-white/60">Detect project requirements and dependencies</p>
					</div>
				</div>
			</div>

			<!-- Repository Display -->
			<div v-if="selectedRepository" class="space-y-4">
				<!-- Repo Info -->
				<div class="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
					<p class="text-sm font-medium text-blue-400 mb-1">Repository</p>
					<p class="text-xs text-white/70">{{ selectedRepository.name }}</p>
					<p class="text-xs text-white/50 font-mono">{{ selectedRepository.path }}</p>
				</div>

				<!-- Analysis Results -->
				<div v-if="analysisResults" class="space-y-3">
					<h4 class="text-sm font-semibold text-white/80">Project Structure</h4>

					<!-- Frontend -->
					<div v-if="analysisResults.frontend" class="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
						<div class="flex items-center gap-2 mb-1">
							<UIcon name="i-lucide-layout" class="w-4 h-4 text-cyan-400" />
							<span class="text-sm font-medium text-cyan-400">Frontend</span>
						</div>
						<p class="text-xs text-white/70 ml-6">{{ analysisResults.frontend.name }}</p>
					</div>

					<!-- Backend -->
					<div v-if="analysisResults.backend" class="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
						<div class="flex items-center gap-2 mb-1">
							<UIcon name="i-lucide-server" class="w-4 h-4 text-green-400" />
							<span class="text-sm font-medium text-green-400">Backend</span>
						</div>
						<p class="text-xs text-white/70 ml-6">{{ analysisResults.backend.name }}</p>
					</div>

					<!-- Database -->
					<div v-if="analysisResults.database" class="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
						<div class="flex items-center gap-2 mb-1">
							<UIcon name="i-lucide-database" class="w-4 h-4 text-purple-400" />
							<span class="text-sm font-medium text-purple-400">Database</span>
						</div>
						<p class="text-xs text-white/70 ml-6">{{ analysisResults.database.name }}</p>
					</div>

					<!-- Requirements List -->
					<div v-if="analysisResults.requirements && analysisResults.requirements.length > 0" class="mt-4">
						<h4 class="text-sm font-semibold text-white/80 mb-2">Dependencies</h4>
						<div class="space-y-1 max-h-32 overflow-y-auto">
							<div v-for="req in analysisResults.requirements" :key="req.name" class="text-xs text-white/60">
								<span class="inline-flex items-center gap-1">
									<span v-if="req.installed" class="w-1.5 h-1.5 rounded-full bg-green-400" />
									<span v-else class="w-1.5 h-1.5 rounded-full bg-orange-400" />
									{{ req.name }} <span class="text-white/40">({{ req.type }})</span>
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- No Analysis State -->
				<div v-else class="p-4 rounded-lg bg-gray-900/50 border border-gray-700 text-center">
					<UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin mx-auto mb-2 text-white/50" />
					<p class="text-sm text-white/60">Analyzing repository structure...</p>
				</div>

				<!-- Analyze Button -->
				<button
					class="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
					:disabled="isAnalyzing"
					@click="analyzeRepository"
				>
					<UIcon :name="isAnalyzing ? 'i-lucide-loader-2' : 'i-lucide-search'" :class="{ 'animate-spin': isAnalyzing }" class="w-4 h-4" />
					{{ isAnalyzing ? 'Analyzing...' : 'Analyze Repository' }}
				</button>
			</div>

			<!-- No Repository Selected -->
			<div v-else class="p-6 rounded-lg bg-gray-900/50 border border-dashed border-gray-600 text-center">
				<UIcon name="i-lucide-inbox" class="w-8 h-8 mx-auto mb-2 text-white/30" />
				<p class="text-sm text-white/60">No repository selected</p>
				<p class="text-xs text-white/40 mt-1">Select a repository from the Git Clone node</p>
			</div>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";

interface Props {
	customNodeProps: any;
	updateNodeData?: (nodeId: string, key: string, value: any) => void;
	selectedRepository?: { name: string; path: string; url: string };
}

const props = defineProps<Props>();

// Refs
const isAnalyzing = ref(false);
const analysisResults = ref<any>(null);
const selectedRepository = ref(props.selectedRepository || null);

// Computed
const themeColor = "#3b82f6";
const statusLabel = computed(() => (analysisResults.value ? "Analyzed" : "Pending"));
const statusColor = computed(() => (analysisResults.value ? "#22c55e" : "#f97316"));
const backgroundColor = "linear-gradient(135deg, rgba(15, 55, 109, 0.9), rgba(30, 58, 138, 0.95))";
const borderColor = "rgba(59, 130, 246, 0.35)";

// Methods
const analyzeRepository = async () => {
	if (!selectedRepository.value) return;

	isAnalyzing.value = true;

	try {
		// Simulate repository analysis
		await new Promise((resolve) => setTimeout(resolve, 1000));

		analysisResults.value = {
			frontend: { name: "React / Next.js" },
			backend: { name: "Node.js / Express" },
			database: { name: "PostgreSQL" },
			requirements: [
				{ name: "Node.js", type: "runtime", installed: true },
				{ name: "npm", type: "package-manager", installed: true },
				{ name: "Git", type: "version-control", installed: true },
				{ name: "Docker", type: "containers", installed: false }
			]
		};

		if (props.updateNodeData) {
			props.updateNodeData(props.customNodeProps.id, "analysisResults", analysisResults.value);
		}
	} catch (error) {
		console.error("Error analyzing repository:", error);
	} finally {
		isAnalyzing.value = false;
	}
};

const handleClose = () => {
	console.log("GitCloneRequirementsNode closed");
};

onMounted(() => {
	const nodeData = props.customNodeProps?.data || {};
	if (nodeData.analysisResults) {
		analysisResults.value = nodeData.analysisResults;
	}
});
</script>

<style scoped>
.git-requirements-node {
	background: linear-gradient(135deg, rgba(15, 55, 109, 0.9), rgba(30, 58, 138, 0.95));
	border: 2px solid rgba(59, 130, 246, 0.35);
}

.git-requirements-content {
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
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.1));
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 0.75rem;
}
</style>


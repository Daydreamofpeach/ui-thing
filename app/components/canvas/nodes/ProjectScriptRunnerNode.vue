<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		:show-default-header="true"
		:collapsible="false"
		:default-collapsed="false"
		:min-width="600"
		:min-height="700"
		:max-width="Infinity"
		:max-height="Infinity"
		node-class="project-script-runner-node"
		:theme-color="themeColor"
		icon="i-lucide-terminal"
		:title="customNodeProps.data?.label || 'Project Script Runner'"
		:status-label="getStatusText(customNodeProps.data?.status)"
		:status-color="getStatusColorValue(customNodeProps.data?.status)"
		:show-resizer="true"
		:show-handles="true"
		:show-edit-button="false"
		:show-close-button="true"
	>
		<template #header-actions>
			<UiBadge :variant="getStatusBadgeVariant(customNodeProps.data?.status)" size="sm">
				<div class="w-2 h-2 rounded-full mr-1.5" :class="getStatusColor(customNodeProps.data?.status)" />
				{{ getStatusText(customNodeProps.data?.status) }}
			</UiBadge>
		</template>

		<NodePanel class="p-4 space-y-4">
			<!-- Project Path Input -->
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<Icon name="lucide:folder" class="w-4 h-4 text-primary" />
					<span class="text-sm font-medium text-foreground">Project Path</span>
				</div>
				<div class="flex gap-2">
					<UiInput
						:model-value="customNodeProps.data?.projectPath || ''"
						placeholder="Enter project path..."
						disabled
						class="flex-1"
						@update:model-value="handleProjectPathInput"
					/>
					<UiButton
						variant="outline"
						size="icon"
						:disabled="!customNodeProps.data?.projectPath || isDetecting"
						@click="detectScripts"
					>
						<Icon :name="isDetecting ? 'lucide:loader-2' : 'lucide:search'" class="w-4 h-4" :class="{ 'animate-spin': isDetecting }" />
					</UiButton>
				</div>
			</div>

			<!-- Package Manager Info -->
			<div v-if="detectedScripts" class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
				<UiBadge :variant="getManagerBadgeVariant(detectedScripts.packageManager)" size="sm">
					{{ detectedScripts.packageManager?.toUpperCase() }}
				</UiBadge>
				<span class="text-xs text-muted-foreground">{{ detectedScripts.scripts.length }} scripts</span>
			</div>

			<!-- Scripts Tree - Grouped by Config File -->
			<div v-if="enhancedScripts && enhancedScripts.configFiles.length > 0" class="border border-border rounded-lg overflow-hidden bg-card">
				<div class="flex items-center justify-between p-3 border-b border-border bg-muted/30">
					<div class="flex items-center gap-2">
						<Icon name="lucide:file-code-2" class="w-4 h-4 text-primary" />
						<span class="text-sm font-medium text-foreground">Script Configuration Files</span>
					</div>
					<div class="flex items-center gap-2">
						<UiButton
							variant="ghost"
							size="sm"
							:title="allScriptFilesExpanded ? 'Collapse all' : 'Expand all'"
							@click="toggleAllScriptFiles"
						>
							<Icon :name="allScriptFilesExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-3 h-3" />
							<span class="text-xs">{{ allScriptFilesExpanded ? 'Collapse' : 'Expand' }}</span>
						</UiButton>
						<span class="text-xs text-muted-foreground">{{ totalEnhancedScripts }} total scripts</span>
					</div>
				</div>
				<NodePanel class="p-2 max-h-[600px]">
					<ScriptFileGroup
						v-for="configFile in enhancedScripts.configFiles"
						:key="configFile.path"
						:file-name="configFile.fileName"
						:file-type="configFile.type"
						:scripts="configFile.scripts"
						:default-expanded="true"
						@edit-script="handleEditScript"
						@run-script="handleRunScript"
					/>
				</NodePanel>
			</div>

			<!-- Legacy Scripts List (fallback if enhanced detection not available) -->
			<div v-else-if="detectedScripts && detectedScripts.scripts.length > 0" class="border border-border rounded-lg overflow-hidden bg-card">
				<div class="p-3 border-b border-border bg-muted/30">
					<span class="text-sm font-medium text-foreground">Available Scripts ({{ totalScripts }})</span>
				</div>
				<NodePanel class="p-2 max-h-[400px]">
					<!-- Group scripts by folder -->
					<div
						v-for="(folderScripts, folder) in scriptsByFolder"
						:key="folder"
						class="folder-group"
					>
						<div class="flex items-center gap-2 p-2 bg-muted/30 rounded border border-border mb-2">
							<Icon name="lucide:folder" class="w-3 h-3 text-primary" />
							<span class="text-xs font-medium text-foreground">{{ folder }}</span>
							<span class="text-xs text-muted-foreground">({{ folderScripts.length }} scripts)</span>
						</div>
						<div class="folder-scripts">
							<div
								v-for="script in folderScripts"
								:key="`${folder}-${script.name}`"
								class="script-item-wrapper"
							>
								<!-- Script Header -->
								<div class="flex items-center justify-between p-3 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" @click="toggleScriptExpansion(script.name)">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<Icon
												:name="expandedScripts.has(script.name) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
												class="w-3 h-3 text-muted-foreground transition-transform cursor-pointer"
											/>
											<span class="text-sm">{{ getCategoryIcon(script.category) }}</span>
											<span class="font-medium text-sm text-foreground">{{ script.name }}</span>
											<UiBadge variant="outline" size="sm">
												{{ script.category }}
											</UiBadge>
											<!-- OS indicator -->
											<UiBadge v-if="userOS && scriptOSVersions[script.name]?.[userOS]" variant="secondary" size="sm">
												<Icon
													:name="userOS === 'windows' ? 'lucide:monitor' : userOS === 'linux' ? 'lucide:terminal' : 'lucide:apple'"
													class="w-3 h-3"
												/>
												{{ userOS.toUpperCase() }}
											</UiBadge>
										</div>
										<div class="text-xs text-muted-foreground truncate font-mono">
											{{ script.command }}
										</div>
									</div>
									<div class="flex items-center gap-2">
										<UiButton
											variant="ghost"
											size="icon-sm"
											title="Open script editor"
											@click.stop="openScriptEditor(script)"
										>
											<Icon name="lucide:pencil" class="w-3 h-3" />
										</UiButton>
										<UiButton
											variant="default"
											size="sm"
											:disabled="runningScripts.has(script.name)"
											@click.stop="runScript(script)"
										>
											<Icon
												:name="runningScripts.has(script.name) ? 'lucide:loader-2' : 'lucide:play'"
												class="w-3 h-3"
												:class="{ 'animate-spin': runningScripts.has(script.name) }"
											/>
											{{ runningScripts.has(script.name) ? 'Running' : 'Run' }}
										</UiButton>
									</div>
								</div>

								<!-- Collapsible OS-specific editing -->
								<div v-if="expandedScripts.has(script.name)" class="mt-2 space-y-2 p-3 bg-muted/20 rounded-lg border border-border">
									<!-- Windows -->
									<div class="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
										<div class="flex items-center gap-2">
											<Icon name="lucide:monitor" class="w-4 h-4 text-primary" />
											<span class="text-sm font-medium text-foreground">Windows</span>
										</div>
										<div class="flex gap-2">
											<UiInput
												:model-value="getScriptOSCommand(script.name, 'windows')"
												placeholder="Enter Windows command..."
												class="flex-1 font-mono text-xs"
												@update:model-value="setScriptOSCommand(script.name, 'windows', $event)"
											/>
											<UiButton
												variant="default"
												size="icon-sm"
												:disabled="runningScripts.has(`${script.name}-windows`)"
												@click="runScript({ ...script, command: getScriptOSCommand(script.name, 'windows') })"
											>
												<Icon name="lucide:play" class="w-3 h-3" />
											</UiButton>
										</div>
									</div>

									<!-- Linux -->
									<div class="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
										<div class="flex items-center gap-2">
											<Icon name="lucide:terminal" class="w-4 h-4 text-primary" />
											<span class="text-sm font-medium text-foreground">Linux</span>
										</div>
										<div class="flex gap-2">
											<UiInput
												:model-value="getScriptOSCommand(script.name, 'linux')"
												placeholder="Enter Linux command..."
												class="flex-1 font-mono text-xs"
												@update:model-value="setScriptOSCommand(script.name, 'linux', $event)"
											/>
											<UiButton
												variant="default"
												size="icon-sm"
												:disabled="runningScripts.has(`${script.name}-linux`)"
												@click="runScript({ ...script, command: getScriptOSCommand(script.name, 'linux') })"
											>
												<Icon name="lucide:play" class="w-3 h-3" />
											</UiButton>
										</div>
									</div>

									<!-- Mac -->
									<div class="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
										<div class="flex items-center gap-2">
											<Icon name="lucide:apple" class="w-4 h-4 text-primary" />
											<span class="text-sm font-medium text-foreground">Mac</span>
										</div>
										<div class="flex gap-2">
											<UiInput
												:model-value="getScriptOSCommand(script.name, 'mac')"
												placeholder="Enter Mac command..."
												class="flex-1 font-mono text-xs"
												@update:model-value="setScriptOSCommand(script.name, 'mac', $event)"
											/>
											<UiButton
												variant="default"
												size="icon-sm"
												:disabled="runningScripts.has(`${script.name}-mac`)"
												@click="runScript({ ...script, command: getScriptOSCommand(script.name, 'mac') })"
											>
												<Icon name="lucide:play" class="w-3 h-3" />
											</UiButton>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</NodePanel>
			</div>

			<!-- No Scripts Message -->
			<div v-else-if="!isDetecting && customNodeProps.data?.projectPath" class="flex flex-col items-center justify-center p-8 text-center">
				<Icon name="lucide:file-x" class="w-6 h-6 mb-2 text-muted-foreground opacity-50" />
				<p class="text-xs text-muted-foreground">
					No scripts found
				</p>
			</div>

			<!-- Custom Command Input -->
			<div v-if="customNodeProps.data?.projectPath" class="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
				<div class="flex items-center gap-2">
					<Icon name="lucide:command" class="w-4 h-4 text-primary" />
					<span class="text-sm font-medium text-foreground">Custom Command</span>
				</div>
				<div class="flex gap-2">
					<UiInput
						v-model="customCommand"
						placeholder="npm run dev, yarn build, etc."
						class="flex-1"
					/>
					<UiButton
						variant="default"
						size="icon"
						:disabled="!customCommand || isRunningCustom"
						@click="runCustomCommand"
					>
						<Icon :name="isRunningCustom ? 'lucide:loader-2' : 'lucide:play'" class="w-4 h-4" :class="{ 'animate-spin': isRunningCustom }" />
					</UiButton>
				</div>
			</div>

			<!-- Loading State -->
			<div v-if="isDetecting" class="flex items-center justify-center gap-2 p-8">
				<Icon name="lucide:loader-2" class="w-4 h-4 animate-spin text-primary" />
				<span class="text-sm text-muted-foreground">Detecting scripts...</span>
			</div>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import type { PackageScript } from "../composables/useProjectScriptRunner";
	import { computed, onMounted, ref, watch } from "vue";
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import ScriptFileGroup from "~/components/canvas/nodes/shared/ScriptFileGroup.vue";
	import NodePanel from "~/components/canvas/shared/NodePanel.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import { useEnhancedScriptDetection } from "../composables/useEnhancedScriptDetection";
	import { useProjectScriptRunner } from "../composables/useProjectScriptRunner";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		openScriptEditor: [script: any, sourceNodeId: string, sourcePosition: { x: number, y: number }]
	}>();

	// Use the shared logic
	const {
		isDetecting,
		isRunningCustom,
		customCommand,
		detectedScripts,
		runningScripts,
		scriptSource: _scriptSource,
		userOS,
		hasScripts: _hasScripts,
		totalScripts,
		sortedScripts: _sortedScripts,
		getCategoryIcon,
		detectScripts: detectScriptsLogic,
		runScript: runScriptLogic,
		runCustomCommand: runCustomCommandLogic,
		resetState
	} = useProjectScriptRunner();

	// Enhanced script detection (includes config files)
	const { detectAllScripts } = useEnhancedScriptDetection();
	const enhancedScripts = ref<any>(null);
	const expandedFileGroups = ref<Set<string>>(new Set());
	const allScriptFilesExpanded = ref(false);

	// State for OS-specific script editing
	const expandedScripts = ref<Set<string>>(new Set());
	const scriptOSVersions = ref<Record<string, Record<string, string>>>({});

	// Initialize OS-specific commands from detected scripts
	watch(detectedScripts, (newScripts) => {
		if (newScripts && newScripts.scripts) {
			for (const script of newScripts.scripts) {
				if (!scriptOSVersions.value[script.name]) {
					scriptOSVersions.value[script.name] = {
						windows: script.command,
						linux: script.command,
						mac: script.command
					};
				}
			}
		}
	}, { deep: true });

	// Toggle script expansion
	const toggleScriptExpansion = (scriptName: string) => {
		if (expandedScripts.value.has(scriptName)) {
			expandedScripts.value.delete(scriptName);
		} else {
			expandedScripts.value.add(scriptName);
		}
	};

	// Get OS-specific command
	const getScriptOSCommand = (scriptName: string, os: string) => {
		return scriptOSVersions.value[scriptName]?.[os] || "";
	};

	// Set OS-specific command
	const setScriptOSCommand = (scriptName: string, os: string, command: string) => {
		if (!scriptOSVersions.value[scriptName]) {
			scriptOSVersions.value[scriptName] = {
				windows: "",
				linux: "",
				mac: ""
			};
		}
		scriptOSVersions.value[scriptName][os] = command;

		// Update node data with OS-specific scripts for B Folder Setup node
		props.updateNodeData(props.customNodeProps.id, "scriptOSVersions", scriptOSVersions.value);
	};

	// Computed properties for enhanced scripts
	const totalEnhancedScripts = computed(() => {
		return enhancedScripts.value?.allScripts?.length || 0;
	});

	// Toggle all script file groups
	const toggleAllScriptFiles = () => {
		if (allScriptFilesExpanded.value) {
			expandedFileGroups.value.clear();
			allScriptFilesExpanded.value = false;
		} else {
			enhancedScripts.value?.configFiles?.forEach((cf: any) => {
				expandedFileGroups.value.add(cf.path);
			});
			allScriptFilesExpanded.value = true;
		}
	};

	// Handle edit script from ScriptFileGroup
	const handleEditScript = (script: any) => {
		console.log("📝 Edit script from tree:", script);

		const scriptData = {
			name: script.name,
			command: script.command,
			description: script.description || "",
			order: script.order || 0,
			projectPath: props.customNodeProps.data?.projectPath || "",
			sourceFile: script.sourceFile || "package.json",
			// OS-specific commands
			windowsCommand: scriptOSVersions.value[script.name]?.windows || script.command,
			linuxCommand: scriptOSVersions.value[script.name]?.linux || script.command,
			macCommand: scriptOSVersions.value[script.name]?.mac || script.command
		};

		emit("openScriptEditor", scriptData, props.customNodeProps.id, props.customNodeProps.position || { x: 0, y: 0 });
	};

	// Handle run script from ScriptFileGroup
	const handleRunScript = async (script: any) => {
		console.log("▶️ Run script from tree:", script);
		await runScriptLogic(script);
	};

	// Detect scripts - DEFINE FIRST before watch
	const detectScripts = async () => {
		const path = props.customNodeProps.data?.projectPath;

		if (path) {
			props.updateNodeData(props.customNodeProps.id, "status", "detecting");
			try {
				// Run both legacy and enhanced detection
				await detectScriptsLogic(path);

				// Run enhanced detection for config files
				const enhanced = await detectAllScripts(path);
				if (enhanced) {
					enhancedScripts.value = enhanced;
					console.log("✅ Enhanced script detection complete:", enhanced);
				}

				props.updateNodeData(props.customNodeProps.id, "status", "ready");

				// Update node data for propagation to BFolderSetupNode
				props.updateNodeData(props.customNodeProps.id, "detectedScripts", detectedScripts.value);
				props.updateNodeData(props.customNodeProps.id, "scriptOSVersions", scriptOSVersions.value);
				props.updateNodeData(props.customNodeProps.id, "enhancedScripts", enhancedScripts.value);
			} catch (error) {
				console.error("Script detection failed:", error);
				props.updateNodeData(props.customNodeProps.id, "status", "error");
			}
		}
	};

	// Open script editor - emit event to parent
	const openScriptEditor = (script: any) => {
		console.log("📝 Opening script editor for:", script.name);

		const scriptData = {
			name: script.name,
			command: script.command,
			description: script.description || "",
			order: script.order || 0,
			projectPath: props.customNodeProps.data?.projectPath || "",
			// OS-specific commands
			windowsCommand: scriptOSVersions.value[script.name]?.windows || script.command,
			linuxCommand: scriptOSVersions.value[script.name]?.linux || script.command,
			macCommand: scriptOSVersions.value[script.name]?.mac || script.command
		};

		emit("openScriptEditor", scriptData, props.customNodeProps.id, props.customNodeProps.position || { x: 0, y: 0 });
	};

	// Handle project path input
	const handleProjectPathInput = (value: string) => {
		props.updateNodeData(props.customNodeProps.id, "projectPath", value);
	};

	// Watch for project path changes and auto-detect scripts
	watch(() => props.customNodeProps.data?.projectPath, (newPath) => {
		console.log("🔧 ProjectScriptRunnerNode: projectPath changed:", newPath);
		if (newPath) {
			console.log("🚀 ProjectScriptRunnerNode: Auto-detecting scripts for:", newPath);
			// Auto-detect scripts immediately when path is provided
			detectScripts();
		} else {
			console.log("🔄 ProjectScriptRunnerNode: No path, resetting state");
			resetState();
		}
	}, { immediate: true });

	// Group scripts by folder
	const scriptsByFolder = computed(() => {
		if (!detectedScripts.value?.scripts) return {};

		const grouped: Record<string, typeof detectedScripts.value.scripts> = {};

		for (const script of detectedScripts.value.scripts) {
			const folder = script.folder || "root";
			if (!grouped[folder]) {
				grouped[folder] = [];
			}
			grouped[folder].push(script);
		}

		return grouped;
	});

	onMounted(() => {
		console.log("🟢🟢🟢 ProjectScriptRunnerNode: MOUNTED");
		console.log("🟢 Props on mount:", props.customNodeProps);
		console.log("🟢 Project path on mount:", props.customNodeProps?.data?.projectPath);
		console.log("🟢 Visible:", props.customNodeProps?.data?.visible);
		console.log("🟢 Processes run:", props.customNodeProps?.data?.processesRun);
		console.log("🟢 Should run processes:", props.customNodeProps?.data?.shouldRunProcesses);

		if (props.updateNodeData && props.customNodeProps?.id) {
			if (!props.customNodeProps.data?.width) {
				props.updateNodeData(props.customNodeProps.id, "width", 600);
			}
			if (!props.customNodeProps.data?.height) {
				props.updateNodeData(props.customNodeProps.id, "height", 900);
			}
		}
	});

	// Watch for shouldRunProcesses flag (set when node becomes visible)
	watch(() => props.customNodeProps.data?.shouldRunProcesses, async (shouldRun) => {
		if (shouldRun && !props.customNodeProps.data?.processesRun) {
			console.log("🚀 ProjectScriptRunnerNode: Running processes (triggered by visibility)");
			await detectScripts();
			props.updateNodeData(props.customNodeProps.id, "processesRun", true);
			props.updateNodeData(props.customNodeProps.id, "shouldRunProcesses", false);
		}
	});

	// Handle node expansion - run processes only when expanded for the first time
	const _handleExpanded = async () => {
		console.log("📂 ProjectScriptRunnerNode: Expanded");

		// Only run processes if they haven't been run yet
		if (!props.customNodeProps.data?.processesRun && props.customNodeProps.data?.projectPath) {
			console.log("🔄 Running script detection for first time...");
			await detectScripts();
			props.updateNodeData(props.customNodeProps.id, "processesRun", true);
		} else {
			console.log("ℹ️ Processes already run, skipping");
		}
	};

	// Run script
	const runScript = async (script: PackageScript) => {
		await runScriptLogic(script);
		props.updateNodeData(props.customNodeProps.id, "status", "running");

		// Update status after a delay
		setTimeout(() => {
			props.updateNodeData(props.customNodeProps.id, "status", "ready");
		}, 3000);
	};

	// Run custom command
	const runCustomCommand = async () => {
		await runCustomCommandLogic();
		props.updateNodeData(props.customNodeProps.id, "status", "running");

		// Update status after a delay
		setTimeout(() => {
			props.updateNodeData(props.customNodeProps.id, "status", "ready");
		}, 3000);
	};

	// Status helper functions
	const getStatusColor = (status: string) => {
		switch (status) {
		case "detecting": return "bg-yellow-500";
		case "running": return "bg-blue-500";
		case "ready": return "bg-green-500";
		case "error": return "bg-red-500";
		default: return "bg-muted";
		}
	};

	const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
		case "detecting": return "secondary";
		case "running": return "default";
		case "ready": return "default";
		case "error": return "destructive";
		default: return "outline";
		}
	};

	const getStatusColorValue = (status: string): string => {
		switch (status) {
		case "detecting": return "hsl(var(--warning))";
		case "running": return "hsl(var(--primary))";
		case "ready": return "hsl(var(--success))";
		case "error": return "hsl(var(--destructive))";
		default: return "hsl(var(--muted-foreground))";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
		case "detecting": return "Detecting";
		case "running": return "Running";
		case "ready": return "Ready";
		case "error": return "Error";
		default: return "Inactive";
		}
	};

	const getManagerBadgeVariant = (manager: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (manager?.toLowerCase()) {
		case "npm": return "default";
		case "yarn": return "secondary";
		case "pnpm": return "outline";
		default: return "secondary";
		}
	};

	const themeColor = "var(--color-primary)";
</script>

<style scoped>
/* Project Script Runner Node Styles */
.project-script-runner-node {
	position: relative;
	overflow: visible !important;
}

/* Ensure icon wrapper is visible and not cut off */
.project-script-runner-node :deep(.node-icon-wrapper) {
	overflow: visible !important;
	z-index: 20 !important;
}

/* Ensure parent container allows overflow */
.project-script-runner-node :deep(.base-node-template) {
	overflow: visible !important;
}

/* Responsive Design */
@media (max-width: 768px) {
	.project-script-runner-node {
		min-width: 300px;
		min-height: 250px;
	}
}
</style>

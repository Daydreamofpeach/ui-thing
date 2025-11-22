<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		node-class="b-folder-setup-node"
		:min-width="600"
		:min-height="1200"
		:show-default-header="true"
		:show-resizer="true"
		:show-size-indicator="true"
		:collapsible="false"
		:default-collapsed="false"
		:theme-color="themeColor"
		icon="i-lucide-folder-cog"
		:title="customNodeProps.data?.label || 'B Folder Setup'"
		:status-label="getStatusText(setupStatus)"
		:status-color="getStatusColorValue(setupStatus)"
	>
		<template #header-actions>
			<UiBadge :variant="getStatusBadgeVariant(setupStatus)" size="sm">
				<div class="w-2 h-2 rounded-full mr-1.5" :class="getStatusColor(setupStatus)" />
				{{ getStatusText(setupStatus) }}
			</UiBadge>
		</template>

		<NodePanel class="p-4 space-y-4">
			<!-- Environment Detection Section -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Icon name="lucide:cpu" class="w-4 h-4 text-primary" />
					<span class="text-sm font-medium text-foreground">
						Detected Environment
						<UiBadge v-if="Object.keys(detectedEnvironment).length > 0" variant="default" size="sm" class="ml-2">
							{{ Object.keys(detectedEnvironment).length }} tools
						</UiBadge>
					</span>
				</div>
				<div v-if="Object.keys(detectedEnvironment).length > 0" class="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
					<div v-for="(detected, key) in detectedEnvironment" :key="key" class="flex items-center justify-between p-2 bg-card rounded border border-border">
						<span class="text-sm font-medium text-foreground uppercase">{{ key }}:</span>
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground font-mono">{{ detected.version || 'Not detected' }}</span>
							<Icon
								:name="detected.installed ? 'lucide:check-circle' : 'lucide:x-circle'"
								:class="detected.installed ? 'text-success' : 'text-destructive'"
								class="w-3 h-3"
							/>
						</div>
					</div>
				</div>
				<div v-else class="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
					<Icon name="lucide:info" class="w-4 h-4 text-warning" />
					<span class="text-xs text-warning">Run Full Setup to detect environment</span>
				</div>
			</div>

			<!-- Detected Scripts Section -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Icon name="lucide:terminal" class="w-4 h-4 text-primary" />
					<span class="text-sm font-medium text-foreground">Detected Scripts ({{ detectedScripts.length }})</span>
				</div>
				<div v-if="detectedScripts.length > 0" class="space-y-2 max-h-[500px] overflow-y-auto">
					<div v-for="(script, index) in detectedScripts" :key="index" class="flex items-start gap-2 p-3 bg-card rounded-lg border border-border">
						<div class="flex-1 space-y-2">
							<UiInput
								v-model="script.name"
								placeholder="Script name"
								class="font-medium"
							/>
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Icon name="lucide:monitor" class="w-3 h-3 text-primary" />
									<UiInput
										v-model="script.windowsCommand"
										placeholder="Windows command"
										class="flex-1 font-mono text-xs"
									/>
								</div>
								<div class="flex items-center gap-2">
									<Icon name="lucide:terminal" class="w-3 h-3 text-success" />
									<UiInput
										v-model="script.linuxCommand"
										placeholder="Linux command"
										class="flex-1 font-mono text-xs"
									/>
								</div>
								<div class="flex items-center gap-2">
									<Icon name="lucide:apple" class="w-3 h-3 text-primary" />
									<UiInput
										v-model="script.macCommand"
										placeholder="Mac command"
										class="flex-1 font-mono text-xs"
									/>
								</div>
							</div>
						</div>
						<UiButton
							variant="destructive"
							size="icon-sm"
							@click="removeScript(index)"
						>
							<Icon name="lucide:x" class="w-3 h-3" />
						</UiButton>
					</div>
					<UiButton
						variant="outline"
						size="sm"
						class="w-full"
						@click="addNewScript"
					>
						<Icon name="lucide:plus" class="w-3 h-3" />
						<span>Add Script</span>
					</UiButton>
				</div>
				<div v-else class="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
					<Icon name="lucide:info" class="w-4 h-4 text-warning" />
					<span class="text-xs text-warning">No scripts loaded yet. Scripts will auto-load from Script Runner node.</span>
				</div>
			</div>

			<!-- B Folder Status -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Icon name="lucide:folder" class="w-4 h-4 text-primary" />
					<span class="text-sm font-medium text-foreground">B Folder Status</span>
				</div>
				<div class="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
					<div class="flex items-center justify-between p-2 bg-card rounded border border-border">
						<span class="text-sm font-medium text-foreground">b.json:</span>
						<UiBadge :variant="bFolderExists ? 'default' : 'outline'" size="sm">
							{{ bFolderExists ? '✓ Created' : 'Not created' }}
						</UiBadge>
					</div>
					<div class="flex items-center justify-between p-2 bg-card rounded border border-border">
						<span class="text-sm font-medium text-foreground">bl.json:</span>
						<UiBadge :variant="blFolderExists ? 'default' : 'outline'" size="sm">
							{{ blFolderExists ? '✓ Created' : 'Not created' }}
						</UiBadge>
					</div>
					<div class="flex items-center justify-between p-2 bg-card rounded border border-border">
						<span class="text-sm font-medium text-foreground">Scripts Loaded:</span>
						<UiBadge :variant="detectedScripts.length > 0 ? 'default' : 'outline'" size="sm">
							{{ detectedScripts.length }}
						</UiBadge>
					</div>
					<div v-if="bFolderExists" class="flex items-center justify-between p-2 bg-card rounded border border-border">
						<span class="text-sm font-medium text-foreground">In b.json:</span>
						<UiBadge variant="default" size="sm">
							{{ customNodeProps.data?.scriptCount || detectedScripts.length }} scripts (verified)
						</UiBadge>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex flex-col gap-2">
				<UiButton
					variant="default"
					size="sm"
					:disabled="isProcessing || !customNodeProps.data?.projectPath"
					@click="runFullSetup"
					class="w-full"
				>
					<Icon :name="isProcessing ? 'lucide:loader-2' : 'lucide:play'" class="w-4 h-4" :class="{ 'animate-spin': isProcessing }" />
					<span>{{ isProcessing ? 'Setting up...' : 'Run Full Setup' }}</span>
				</UiButton>

				<UiButton
					v-if="bFolderExists && blFolderExists && setupStatus === 'complete'"
					variant="default"
					size="sm"
					@click="emitCreateSaveNode"
					class="w-full"
				>
					<Icon name="lucide:save" class="w-4 h-4" />
					<span>Save as Template</span>
				</UiButton>

				<UiButton
					variant="outline"
					size="sm"
					:disabled="!bFolderExists"
					@click="viewBJsonFiles"
					class="w-full"
				>
					<Icon name="lucide:eye" class="w-4 h-4" />
					<span>View B Folder Files</span>
				</UiButton>
			</div>

			<!-- Process Log -->
			<div v-if="processLog.length > 0" class="border border-border rounded-lg overflow-hidden bg-card">
				<div class="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
					<Icon name="lucide:terminal" class="w-3 h-3 text-muted-foreground" />
					<span class="text-xs font-medium text-muted-foreground">Process Log</span>
				</div>
				<div class="p-3 space-y-1 max-h-[200px] overflow-y-auto font-mono text-xs">
					<div v-for="(log, index) in processLog" :key="index" class="flex items-start gap-2" :class="getLogTextColor(log.type)">
						<span>{{ log.icon }}</span>
						<span>{{ log.message }}</span>
					</div>
				</div>
			</div>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import { useToast } from "#imports";
	import { computed, onMounted, ref, watch } from "vue";
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import NodePanel from "~/components/canvas/shared/NodePanel.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import { useSetupData } from "../composables/useSetupData";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		canvasNodes?: any[]
		canvasEdges?: any[]
		canvasViewport?: any
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		"create-save-template-node": []
	}>();
const themeColor = "var(--color-primary)";

	console.log("🔧 BFolderSetupNode: COMPONENT MOUNTING");

	// Script type with OS-specific commands
	interface ScriptWithOSCommands {
		name: string
		command: string
		category?: string
		windowsCommand?: string
		linuxCommand?: string
		macCommand?: string
	}

	// State
	const setupStatus = ref<"idle" | "detecting" | "detecting-environment" | "creating" | "complete" | "error">("idle");
	const isProcessing = ref(false);
	const detectedEnvironment = ref<Record<string, { version: string, installed: boolean }>>({});
	const detectedScripts = ref<ScriptWithOSCommands[]>([]);
	const bFolderExists = ref(false);
	const blFolderExists = ref(false);
	const processLog = ref<Array<{ type: string, icon: string, message: string }>>([]);

	// Use setup data with full environment detection
	const {
		setupData,
		nodeVersion,
		rustVersion,
		phpVersion,
		dotnetVersion,
		pythonVersion,
		javaVersion,
		chocolateyVersion,
		packageManagers,
		osInfo,
		ideInfo,
		envVars,
		initializeSetupData,
		detectNode,
		detectRust,
		detectPhp,
		detectDotNet,
		detectPython,
		detectJava,
		detectChocolatey,
		detectPackageManagers,
		detectIDEInfo,
		refreshEnvVars,
		getOSInfo
	} = useSetupData();

	const toast = useToast();

	// Add log entry
	const addLog = (type: "info" | "success" | "error", message: string) => {
		const icons = {
			info: "ℹ️",
			success: "✅",
			error: "❌"
		};
		processLog.value.push({
			type,
			icon: icons[type],
			message
		});
	};

	// Script management functions
	const addNewScript = () => {
		detectedScripts.value.push({
			name: "",
			command: "",
			category: "custom"
		});
	};

	const removeScript = (index: number) => {
		detectedScripts.value.splice(index, 1);
	};

	// Load scripts from connected ProjectScriptRunnerNode
	const loadScriptsFromRunner = () => {
		const scriptsData = props.customNodeProps.data?.detectedScripts;
		const scriptOSVersions = props.customNodeProps.data?.scriptOSVersions;

		// Handle both array and object with scripts property
		let scriptsArray = null;
		if (Array.isArray(scriptsData)) {
			scriptsArray = scriptsData;
		} else if (scriptsData && typeof scriptsData === "object" && Array.isArray(scriptsData.scripts)) {
			scriptsArray = scriptsData.scripts;
		}

		if (scriptsArray && scriptsArray.length > 0) {
			addLog("info", `Loading ${scriptsArray.length} scripts`);

			// Detect current OS to set default
			const currentOS = osInfo.value?.platform?.toLowerCase() || "windows";
			const osKey = currentOS === "macos" || currentOS === "darwin" ? "mac" : currentOS;

			detectedScripts.value = scriptsArray.map((s: any) => {
				const osVersions = scriptOSVersions?.[s.name] || {};
				const defaultCommand = osVersions[osKey] || s.command || "";

				return {
					name: s.name || "",
					command: defaultCommand,
					category: s.category || "custom",
					description: s.description || "",
					order: s.order || 0,
					windowsCommand: osVersions.windows || s.command || "",
					linuxCommand: osVersions.linux || s.command || "",
					macCommand: osVersions.mac || s.command || ""
				};
			});

			addLog("success", `Loaded ${detectedScripts.value.length} scripts`);
		}
	};

	// Watch for shouldRunProcesses flag (set when node becomes visible)
	watch(() => props.customNodeProps.data?.shouldRunProcesses, async (shouldRun) => {
		if (shouldRun && !props.customNodeProps.data?.processesRun) {
			console.log("🚀 BFolderSetupNode: Running processes (triggered by visibility)");
			await runFullSetup();
			props.updateNodeData(props.customNodeProps.id, "processesRun", true);
			props.updateNodeData(props.customNodeProps.id, "shouldRunProcesses", false);
		}
	});

	// Handle node expansion - run setup only when expanded for the first time
	const handleExpanded = async () => {
		console.log("📂 BFolderSetupNode: Expanded");

		// Only run setup if processes haven't been run yet
		if (!props.customNodeProps.data?.processesRun && props.customNodeProps.data?.projectPath) {
			console.log("🔄 Running B folder setup for first time...");
			await runFullSetup();
			props.updateNodeData(props.customNodeProps.id, "processesRun", true);
		} else {
			console.log("ℹ️ Setup already run or no project path, skipping");
		}
	};

	// Watch for script data changes (only if visible)
	watch(() => props.customNodeProps.data?.detectedScripts, (newScripts) => {
		// Skip if not visible
		if (!props.customNodeProps.data?.visible) {
			console.log("ℹ️ BFolderSetupNode hidden, skipping script update");
			return;
		}

		if (newScripts) {
			if (Array.isArray(newScripts) || (typeof newScripts === "object" && Array.isArray(newScripts.scripts))) {
				const scriptCount = Array.isArray(newScripts) ? newScripts.length : newScripts.scripts?.length || 0;
				addLog("success", `Received ${scriptCount} scripts`);
				loadScriptsFromRunner();
			}
		}
	}, { deep: true, immediate: false });

	// Watch for scriptOSVersions changes to update scripts (only if visible)
	watch(() => props.customNodeProps.data?.scriptOSVersions, (newVersions) => {
		// Skip if not visible
		if (!props.customNodeProps.data?.visible) {
			console.log("ℹ️ BFolderSetupNode hidden, skipping version update");
			return;
		}

		if (newVersions) {
			loadScriptsFromRunner();
		}
	}, { deep: true, immediate: false });

	// Watch for environment updates to ensure UI refreshes
	watch(detectedEnvironment, () => {}, { deep: true });

	// Watch for scripts being loaded and auto-trigger environment detection
	watch(() => detectedScripts.value.length, (newCount, oldCount) => {
		// If scripts were just loaded and we don't have environment yet, run detection
		if (newCount > 0 && oldCount === 0 && Object.keys(detectedEnvironment.value).length === 0) {
			addLog("info", "Auto-detecting environment...");

			setTimeout(async () => {
				await detectEnvironmentFromFiles();
				await updateBJsonFiles();
			}, 1000);
		}
	});

	// Run full environment detection like automate page
	const detectEnvironmentFromFiles = async () => {
		addLog("info", "Running full environment detection...");

		try {
			// Run all environment checks in parallel (same as automate page)
			addLog("info", "Detecting OS information...");
			await getOSInfo();
			addLog("success", `OS detected: ${osInfo.value.platform} ${osInfo.value.version} (${osInfo.value.arch})`);

			addLog("info", "Detecting installed tools...");
			await Promise.all([
				detectNode(),
				detectPython(),
				detectRust(),
				detectPhp(),
				detectDotNet(),
				detectJava(),
				detectChocolatey(),
				detectPackageManagers(),
				detectIDEInfo(),
				refreshEnvVars()
			]);

			// Build detected environment summary
			detectedEnvironment.value = {};
			if (nodeVersion.value) {
				detectedEnvironment.value.node = { version: nodeVersion.value, installed: true };
				addLog("success", `Node.js: ${nodeVersion.value}`);
			}
			if (pythonVersion.value && pythonVersion.value !== "Not installed") {
				detectedEnvironment.value.python = { version: pythonVersion.value, installed: true };
				addLog("success", `Python: ${pythonVersion.value}`);
			}
			if (rustVersion.value) {
				detectedEnvironment.value.rust = { version: rustVersion.value, installed: true };
				addLog("success", `Rust: ${rustVersion.value}`);
			}
			if (phpVersion.value) {
				detectedEnvironment.value.php = { version: phpVersion.value, installed: true };
				addLog("success", `PHP: ${phpVersion.value}`);
			}
			if (dotnetVersion.value) {
				detectedEnvironment.value.dotnet = { version: dotnetVersion.value, installed: true };
				addLog("success", `.NET: ${dotnetVersion.value}`);
			}
			if (javaVersion.value && javaVersion.value !== "Not installed") {
				detectedEnvironment.value.java = { version: javaVersion.value, installed: true };
				addLog("success", `Java: ${javaVersion.value}`);
			}
			if (chocolateyVersion.value) {
				detectedEnvironment.value.chocolatey = { version: chocolateyVersion.value, installed: true };
				addLog("success", `Chocolatey: ${chocolateyVersion.value}`);
			}

			// Add package managers
			if (packageManagers.value && packageManagers.value.length > 0) {
				const installedPMs = packageManagers.value.filter((pm) => pm.installed);
				installedPMs.forEach((pm) => {
					detectedEnvironment.value[pm.name] = { version: pm.version, installed: true };
					addLog("success", `${pm.name}: ${pm.version}`);
				});
			}

			addLog("success", `Found ${Object.keys(detectedEnvironment.value).length} tools`);
			props.updateNodeData(props.customNodeProps.id, "detectedEnvironment", { ...detectedEnvironment.value });
		} catch (error) {
			addLog("error", `Environment detection failed: ${error}`);
			console.error("❌ Environment detection error:", error);
		}
	};

	// Create B folder structure
	const createBFolder = async () => {
		addLog("info", "Creating B folder structure...");

		const projectPath = props.customNodeProps.data?.projectPath;
		if (!projectPath) return false;

		try {
			const { writeTextFile } = await import("@tauri-apps/plugin-fs");
			const { useTauriShellCommand } = await import("#imports");

			const normalizedPath = projectPath.replace(/\//g, "\\");
			const bFolderPath = `${normalizedPath}\\b`;

			// Create b folder
			await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (-not (Test-Path "${bFolderPath}")) { New-Item -Path "${bFolderPath}" -ItemType Directory | Out-Null }`
			]).execute();

			addLog("success", "B folder created");

			console.log("🔧🔧🔧 BFolderSetupNode: createBFolder - Preparing b.json data");
			console.log("🔧 detectedScripts.value:", detectedScripts.value);
			console.log("🔧 detectedScripts.value.length:", detectedScripts.value.length);
			console.log("🔧 props.canvasNodes:", props.canvasNodes);
			console.log("🔧 props.canvasNodes?.length:", props.canvasNodes?.length);
			console.log("🔧 props.canvasEdges?.length:", props.canvasEdges?.length);

			// Create b.json structure with OS-specific scripts
			const osType = setupData.value?.osInfo?.platform?.toLowerCase() || "windows";

			// Create OS-specific script actions
			const windowsActions = detectedScripts.value.map((script: any) => ({
				name: script.name,
				command: script.windowsCommand || script.command,
				category: script.category || "custom"
			}));

			const linuxActions = detectedScripts.value.map((script: any) => ({
				name: script.name,
				command: script.linuxCommand || script.command,
				category: script.category || "custom"
			}));

			const macActions = detectedScripts.value.map((script: any) => ({
				name: script.name,
				command: script.macCommand || script.command,
				category: script.category || "custom"
			}));

			console.log("🔧 windowsActions count:", windowsActions.length);
			console.log("🔧 linuxActions count:", linuxActions.length);
			console.log("🔧 macActions count:", macActions.length);

			// Serialize canvas nodes (clean VueFlow internals) - from props, NOT node data
			// DEDUPLICATE: Keep only one node per type (the last one)
			const nodesMap = new Map<string, any>();
			(props.canvasNodes || []).forEach((node: any) => {
				nodesMap.set(node.type, node);
			});

			const deduplicatedCanvasNodes = Array.from(nodesMap.values());

			console.log(`🔧 Canvas nodes: ${props.canvasNodes?.length || 0} total → ${deduplicatedCanvasNodes.length} after deduplication`);
			if ((props.canvasNodes?.length || 0) !== deduplicatedCanvasNodes.length) {
				const duplicateCount = (props.canvasNodes?.length || 0) - deduplicatedCanvasNodes.length;
				console.warn(`⚠️ Found ${duplicateCount} duplicate node(s) on canvas - keeping only one of each type`);
			}

			const serializedNodes = deduplicatedCanvasNodes.map((node: any) => ({
				id: node.id,
				type: node.type,
				position: { x: Number(node.position?.x || 0), y: Number(node.position?.y || 0) },
				data: node.data || {},
				style: node.style || {},
				selected: node.selected || false,
				draggable: node.draggable !== false,
				selectable: node.selectable !== false
			}));

			const serializedEdges = (props.canvasEdges || []).map((edge: any) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				type: edge.type || "default",
				animated: edge.animated || false,
				style: edge.style || {}
			}));

			const bJson: any = {
				version: "v1",
				setup: {
					name: "Setup >",
					all: {
						scripts: detectedScripts.value.map((script: any) => ({
							name: script.name,
							command: script.command,
							category: script.category || "custom",
							description: script.description || "",
							order: script.order || 0
						}))
					},
					windows: {
						actions: windowsActions
					},
					linux: {
						actions: linuxActions
					},
					mac: {
						actions: macActions
					}
				},
				nodeCanvas: {
					timestamp: new Date().toISOString(),
					canvas: "node-workflow",
					nodes: serializedNodes,
					edges: serializedEdges,
					viewport: props.canvasViewport || { x: 0, y: 0, zoom: 1 }
				}
			};

			await writeTextFile(`${bFolderPath}\\b.json`, JSON.stringify(bJson, null, 2));
			addLog("success", `b.json created with ${detectedScripts.value.length} scripts (OS-specific) + canvas data`);
			bFolderExists.value = true;

			// Create bl.json (buildit lock file) - EXACT structure from automate page
			const blJson = {
				version: "v1",
				os: osInfo.value || { platform: "Unknown", version: "Unknown", arch: "Unknown", locale: "en-US" },
				environment: envVars.value || {},
				personalPaths: {
					home: envVars.value?.USERPROFILE || envVars.value?.HOME || "~",
					documents: `${envVars.value?.USERPROFILE || "~"}\\Documents`,
					desktop: `${envVars.value?.USERPROFILE || "~"}\\Desktop`,
					downloads: `${envVars.value?.USERPROFILE || "~"}\\Downloads`
				},
				detectedTools: {
					node: nodeVersion.value || "",
					python: pythonVersion.value || "",
					rust: rustVersion.value || "",
					php: phpVersion.value || "",
					dotnet: dotnetVersion.value || "",
					java: javaVersion.value || "",
					chocolatey: chocolateyVersion.value || "",
					packageManagers: packageManagers.value || [],
					ides: ideInfo.value?.filter((ide: any) => ide.status === "installed").map((ide: any) => ({
						name: ide.name,
						version: ide.version || ""
					})) || []
				},
				createdAt: new Date().toISOString(),
				lastUpdated: new Date().toISOString()
			};

			await writeTextFile(`${bFolderPath}\\bl.json`, JSON.stringify(blJson, null, 2));
			addLog("success", "bl.json created with full environment data");
			blFolderExists.value = true;

			return true;
		} catch (error) {
			addLog("error", `B folder creation failed: ${error}`);
			return false;
		}
	};

	// Run full setup process
	const runFullSetup = async () => {
		isProcessing.value = true;
		setupStatus.value = "detecting";
		processLog.value = [];

		try {
			// Load scripts
			loadScriptsFromRunner();
			await new Promise((resolve) => setTimeout(resolve, 100));

			if (detectedScripts.value.length === 0) {
				addLog("info", "No scripts found");
			}

			// Detect environment
			setupStatus.value = "detecting-environment";
			addLog("info", "Detecting environment...");
			await detectEnvironmentFromFiles();
			addLog("success", `Found ${Object.keys(detectedEnvironment.value).length} tools`);

			// Create B folder
			setupStatus.value = "creating";
			const success = await createBFolder();

			if (success) {
				setupStatus.value = "complete";
				props.updateNodeData(props.customNodeProps.id, "bFolderPath", `${props.customNodeProps.data?.projectPath}\\b`);
				props.updateNodeData(props.customNodeProps.id, "status", "complete");
				props.updateNodeData(props.customNodeProps.id, "scripts", detectedScripts.value);
				props.updateNodeData(props.customNodeProps.id, "hasBJson", true);
				props.updateNodeData(props.customNodeProps.id, "hasBlJson", true);

				await readAndVerifyBJson();

				// Silent success - no toast (reduces notification spam)
				console.log(`✅ B folder created with ${detectedScripts.value.length} scripts`);
			} else {
				setupStatus.value = "error";
			}
		} catch (error) {
			setupStatus.value = "error";
			addLog("error", `Setup failed: ${error}`);
		} finally {
			isProcessing.value = false;
		}
	};

	// View B folder files
	// Read and verify b.json to sync script count with actual file
	const readAndVerifyBJson = async () => {
		try {
			const { readTextFile } = await import("@tauri-apps/plugin-fs");
			const projectPath = props.customNodeProps.data?.projectPath;
			if (!projectPath) return false;

			const bFolderPath = `${projectPath}\\b`;
			const bJsonContent = await readTextFile(`${bFolderPath}\\b.json`);
			const bJson = JSON.parse(bJsonContent);

			if (bJson.setup?.all?.scripts) {
				const fileScripts = bJson.setup.all.scripts;
				props.updateNodeData(props.customNodeProps.id, "scriptCount", fileScripts.length);
				addLog("success", `Verified: ${fileScripts.length} scripts`);
			}

			const blJsonContent = await readTextFile(`${bFolderPath}\\bl.json`);
			const blJson = JSON.parse(blJsonContent);

			if (blJson.detectedTools) {
				const toolCount = Object.keys(blJson.detectedTools).length;
				props.updateNodeData(props.customNodeProps.id, "environmentToolCount", toolCount);
				addLog("success", `Verified: ${toolCount} tools`);
			}

			return true;
		} catch (error) {
			addLog("error", `Verification failed: ${error}`);
			return false;
		}
	};

	// Emit event to create SaveTemplateNode
	const emitCreateSaveNode = () => {
		addLog("info", "Creating Save Template node...");
		emit("create-save-template-node");

		toast.add({
			title: "Save Template Node",
			description: "SaveTemplate node will appear to the right",
			color: "success"
		});
	};

	const viewBJsonFiles = async () => {
		try {
			const { readTextFile } = await import("@tauri-apps/plugin-fs");
			const projectPath = props.customNodeProps.data?.projectPath;
			if (!projectPath) throw new Error("Project path not found");

			const bFolderPath = `${projectPath}\\b`;
			const bJsonContent = await readTextFile(`${bFolderPath}\\b.json`);
			const blJsonContent = await readTextFile(`${bFolderPath}\\bl.json`);

			console.log("📄 b.json:", JSON.parse(bJsonContent));
			console.log("📄 bl.json:", JSON.parse(blJsonContent));

			toast.add({
				title: "Files Opened",
				description: "Check console for file contents",
				color: "success"
			});
		} catch (error: any) {
			addLog("error", `Failed to read files: ${error?.message || error}`);
		}
	};

	// Update b.json and bl.json when scripts change
	const updateBJsonFiles = async () => {
		if (!bFolderExists.value || !props.customNodeProps.data?.projectPath) {
			return;
		}

		try {
			const { writeTextFile } = await import("@tauri-apps/plugin-fs");
			const projectPath = props.customNodeProps.data.projectPath;
			const normalizedPath = projectPath.replace(/\//g, "\\");
			const bFolderPath = `${normalizedPath}\\b`;

			// Update b.json with modified scripts
			const osType = osInfo.value?.platform?.toLowerCase() || "windows";

			const windowsActions = detectedScripts.value.map((script: any) => ({
				name: script.name,
				command: script.windowsCommand || script.command,
				category: script.category || "custom"
			}));

			const linuxActions = detectedScripts.value.map((script: any) => ({
				name: script.name,
				command: script.linuxCommand || script.command,
				category: script.category || "custom"
			}));

			const macActions = detectedScripts.value.map((script: any) => ({
				name: script.name,
				command: script.macCommand || script.command,
				category: script.category || "custom"
			}));

			// Serialize canvas nodes (clean VueFlow internals) - from props, NOT node data
			const serializedNodes = (props.canvasNodes || []).map((node: any) => ({
				id: node.id,
				type: node.type,
				position: { x: Number(node.position?.x || 0), y: Number(node.position?.y || 0) },
				data: node.data || {},
				style: node.style || {},
				selected: node.selected || false,
				draggable: node.draggable !== false,
				selectable: node.selectable !== false
			}));

			const serializedEdges = (props.canvasEdges || []).map((edge: any) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				type: edge.type || "default",
				animated: edge.animated || false,
				style: edge.style || {}
			}));

			console.log("═══════════════════════════════════════════");
			console.log("📄 BFolderSetupNode: Creating b.json");
			console.log("📋 Detected scripts:", detectedScripts.value.length);
			console.log("📋 Scripts with metadata:", detectedScripts.value.map((s: any) => ({
				name: s.name,
				description: s.description,
				order: s.order
			})));
			console.log("═══════════════════════════════════════════");

			const bJson: any = {
				version: "v1",
				setup: {
					name: "Setup >",
					all: {
						scripts: detectedScripts.value.map((script: any) => {
							const mappedScript = {
								name: script.name,
								command: script.command,
								category: script.category || "custom",
								description: script.description || "",
								order: script.order || 0
							};
							console.log(`   📝 Mapping script "${script.name}":`, mappedScript);
							return mappedScript;
						})
					},
					windows: { actions: windowsActions },
					linux: { actions: linuxActions },
					mac: { actions: macActions }
				},
				nodeCanvas: {
					timestamp: new Date().toISOString(),
					canvas: "node-workflow",
					nodes: serializedNodes,
					edges: serializedEdges,
					viewport: props.canvasViewport || { x: 0, y: 0, zoom: 1 }
				}
			};

			console.log("✅ Writing b.json to:", `${bFolderPath}\\b.json`);
			await writeTextFile(`${bFolderPath}\\b.json`, JSON.stringify(bJson, null, 2));

			// Update bl.json timestamp
			const blJson = {
				version: "v1",
				os: osInfo.value || { platform: "Unknown", version: "Unknown", arch: "Unknown", locale: "en-US" },
				environment: envVars.value || {},
				personalPaths: {
					home: envVars.value?.USERPROFILE || envVars.value?.HOME || "~",
					documents: `${envVars.value?.USERPROFILE || "~"}\\Documents`,
					desktop: `${envVars.value?.USERPROFILE || "~"}\\Desktop`,
					downloads: `${envVars.value?.USERPROFILE || "~"}\\Downloads`
				},
				detectedTools: {
					node: nodeVersion.value || "",
					python: pythonVersion.value || "",
					rust: rustVersion.value || "",
					php: phpVersion.value || "",
					dotnet: dotnetVersion.value || "",
					java: javaVersion.value || "",
					chocolatey: chocolateyVersion.value || "",
					packageManagers: packageManagers.value || [],
					ides: ideInfo.value?.filter((ide: any) => ide.status === "installed").map((ide: any) => ({
						name: ide.name,
						version: ide.version || ""
					})) || []
				},
				createdAt: new Date().toISOString(),
				lastUpdated: new Date().toISOString()
			};

			await writeTextFile(`${bFolderPath}\\bl.json`, JSON.stringify(blJson, null, 2));
		} catch (error) {
			console.error("❌ BFolderSetupNode: updateBJsonFiles failed:", error);
			addLog("error", `Failed to update JSON files: ${error}`);
		}
	};

	// Debounced script update
	let scriptUpdateTimeout: NodeJS.Timeout | null = null;
	watch(detectedScripts, (newScripts, oldScripts) => {
		console.log("🔄 BFolderSetupNode: detectedScripts watcher for updates triggered");
		console.log("🔄 New scripts count:", newScripts.length);
		console.log("🔄 Old scripts count:", oldScripts?.length);
		console.log("🔄 bFolderExists:", bFolderExists.value);

		if (bFolderExists.value && newScripts.length > 0) {
			// Debounce updates to prevent excessive writes
			if (scriptUpdateTimeout) clearTimeout(scriptUpdateTimeout);
			scriptUpdateTimeout = setTimeout(() => {
				console.log("🔄 Triggering b.json update due to script changes (debounced)");
				updateBJsonFiles();
			}, 1000); // 1 second debounce
		}
	}, { deep: true });

	// Watch for project path changes - but don't auto-run, wait for user
	watch(() => props.customNodeProps.data?.projectPath, (newPath) => {
		if (newPath) {
			console.log("🔧 BFolderSetupNode: Project path changed:", newPath);
			console.log("🔧 Current setup status:", setupStatus.value);
			console.log("🔧 Scripts loaded:", detectedScripts.value.length);
			// Don't auto-run - let user click "Run Full Setup" when ready
		}
	}, { immediate: true });

	// DISABLED: Auto-update on canvas changes causes position resets
	// b.json should only update when user explicitly saves via SaveTemplateNode
	// Debounced canvas update
	// let canvasUpdateTimeout: NodeJS.Timeout | null = null;
	// watch(() => [props.canvasNodes, props.canvasEdges, props.canvasViewport], (newData) => {
	// 	console.log("🔧 BFolderSetupNode: Canvas props changed");
	// 	console.log("🔧 Nodes:", newData?.[0]?.length);
	// 	console.log("🔧 Edges:", newData?.[1]?.length);

	// 	if (bFolderExists.value && newData?.[0]?.length > 0) {
	// 		// Debounce updates to prevent excessive writes
	// 		if (canvasUpdateTimeout) clearTimeout(canvasUpdateTimeout);
	// 		canvasUpdateTimeout = setTimeout(() => {
	// 			console.log("🔧 BFolderSetupNode: Updating b.json with new canvas data (debounced)");
	// 			updateBJsonFiles();
	// 		}, 2000); // 2 second debounce
	// 	}
	// }, { deep: true });

	// Status helpers
	const getStatusColor = (status: string) => {
		switch (status) {
		case "detecting": return "bg-warning";
		case "detecting-environment": return "bg-primary";
		case "creating": return "bg-primary";
		case "complete": return "bg-success";
		case "error": return "bg-destructive";
		default: return "bg-muted";
		}
	};

	const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
		case "detecting": return "secondary";
		case "detecting-environment": return "default";
		case "creating": return "default";
		case "complete": return "default";
		case "error": return "destructive";
		default: return "outline";
		}
	};

	const getStatusColorValue = (status: string): string => {
		switch (status) {
		case "detecting": return "hsl(var(--warning))";
		case "detecting-environment": return "hsl(var(--primary))";
		case "creating": return "hsl(var(--primary))";
		case "complete": return "hsl(var(--success))";
		case "error": return "hsl(var(--destructive))";
		default: return "hsl(var(--muted-foreground))";
		}
	};

	const getLogTextColor = (type: string) => {
		switch (type) {
		case "info": return "text-primary";
		case "success": return "text-success";
		case "error": return "text-destructive";
		default: return "text-foreground";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
		case "detecting": return "Detecting Scripts";
		case "detecting-environment": return "Detecting Environment";
		case "creating": return "Creating Files";
		case "complete": return "Complete";
		case "error": return "Error";
		default: return "Idle";
		}
	};

	onMounted(async () => {
		// Load environment from saved node data if available
		if (props.customNodeProps.data?.detectedEnvironment) {
			detectedEnvironment.value = { ...props.customNodeProps.data.detectedEnvironment };
		}

		// Load scripts if available
		if (props.customNodeProps.data?.detectedScripts) {
			loadScriptsFromRunner();
		}

		// If b.json exists, verify
		if (props.customNodeProps.data?.bFolderPath) {
			bFolderExists.value = true;
			blFolderExists.value = true;
			await readAndVerifyBJson();
		}

		// Auto-detect environment if scripts but no environment
		if (detectedScripts.value.length > 0 && Object.keys(detectedEnvironment.value).length === 0) {
			setTimeout(() => {
				detectEnvironmentFromFiles();
			}, 500);
		}
	});
</script>

<style scoped>
/* B Folder Setup Node Styles */
.b-folder-setup-node {
	position: relative;
	overflow: visible !important;
}

/* Ensure icon wrapper is visible and not cut off */
.b-folder-setup-node :deep(.node-icon-wrapper) {
	overflow: visible !important;
	z-index: 20 !important;
}

/* Ensure parent container allows overflow */
.b-folder-setup-node :deep(.base-node-template) {
	overflow: visible !important;
}

.node-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(255, 255, 255, 0.05);
	flex-shrink: 0;
}

/* Scrollable Content Wrapper */
.node-content-scrollable {
	flex: 1;
	overflow-y: scroll !important;
	overflow-x: hidden;
	padding: 0.75rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	min-height: 0;
	max-height: 100%;
}

.node-content-scrollable::-webkit-scrollbar {
	width: 10px;
}

.node-content-scrollable::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 5px;
	margin: 4px 0;
}

.node-content-scrollable::-webkit-scrollbar-thumb {
	background: rgba(var(--color-primary-rgb), 0.5);
	border-radius: 5px;
	border: 2px solid rgba(0, 0, 0, 0.3);
}

.node-content-scrollable::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-primary-rgb), 0.7);
}

.section {
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding-bottom: 0.75rem;
	flex-shrink: 0;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.75rem;
}

.detected-env {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.env-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 0.375rem;
}

.env-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	text-transform: uppercase;
	min-width: 80px;
}

.env-value {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
}

.b-folder-status {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.status-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
}

.status-label {
	color: rgba(255, 255, 255, 0.6);
	min-width: 60px;
}

.actions-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.action-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	font-weight: 500;
	transition: all 0.2s ease;
	cursor: pointer;
}

.action-button.refresh {
	background: rgba(59, 130, 246, 0.2);
	border: 1px solid rgba(59, 130, 246, 0.3);
	color: rgb(59, 130, 246);
}

.action-button.refresh:hover:not(:disabled) {
	background: rgba(59, 130, 246, 0.3);
}

.action-button.primary {
	background: rgba(var(--color-primary-rgb), 0.2);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
}

.action-button.primary:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.3);
}

.action-button.success {
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: #22c55e;
}

.action-button.success:hover:not(:disabled) {
	background: rgba(34, 197, 94, 0.3);
}

.action-button.secondary {
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: rgb(34, 197, 94);
}

.action-button.secondary:hover:not(:disabled) {
	background: rgba(34, 197, 94, 0.3);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.process-log {
	display: flex;
	flex-direction: column;
	min-height: 150px;
	max-height: 300px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(0, 0, 0, 0.2);
	border-radius: 0.5rem;
	overflow: hidden;
}

.log-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	flex-shrink: 0;
}

.log-content {
	flex: 1;
	overflow-y: auto;
	padding: 0.5rem 0.75rem;
	font-family: monospace;
	font-size: 0.75rem;
}

.log-content::-webkit-scrollbar {
	width: 6px;
}

.log-content::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb {
	background: rgba(34, 197, 94, 0.4);
	border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb:hover {
	background: rgba(34, 197, 94, 0.6);
}

.log-entry {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	padding: 0.25rem 0;
	color: rgba(255, 255, 255, 0.8);
}

.log-icon {
	flex-shrink: 0;
}

.log-message {
	flex: 1;
}

.log-info {
	color: rgba(59, 130, 246, 0.9);
}

.log-success {
	color: rgba(34, 197, 94, 0.9);
}

.log-error {
	color: rgba(239, 68, 68, 0.9);
}

.scripts-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	max-height: 500px;
	overflow-y: auto;
	overflow-x: hidden;
	padding-right: 0.5rem;
}

.scripts-list::-webkit-scrollbar {
	width: 6px;
}

.scripts-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.scripts-list::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.4);
	border-radius: 3px;
}

.scripts-list::-webkit-scrollbar-thumb:hover {
	background: rgba(168, 85, 247, 0.6);
}

.script-edit-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.375rem;
}

.script-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.script-commands {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.os-variant {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.script-name-input,
.script-command-input {
	width: 100%;
	padding: 0.375rem 0.5rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.25rem;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.75rem;
}

.script-name-input {
	font-weight: 500;
}

.script-command-input {
	font-family: monospace;
}

.script-command-input.windows {
	border-left: 2px solid rgba(59, 130, 246, 0.5);
}

.script-command-input.linux {
	border-left: 2px solid rgba(34, 197, 94, 0.5);
}

.script-command-input.mac {
	border-left: 2px solid rgba(139, 92, 246, 0.5);
}

.script-name-input:focus,
.script-command-input:focus {
	outline: none;
	border-color: rgba(var(--color-primary-rgb), 0.5);
	background: rgba(0, 0, 0, 0.4);
}

.no-scripts-message,
.no-env-message {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 1rem;
	background: rgba(251, 146, 60, 0.1);
	border: 1px solid rgba(251, 146, 60, 0.2);
	border-radius: 0.375rem;
}

.remove-script-button {
	padding: 0.25rem;
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 0.25rem;
	color: rgb(239, 68, 68);
	cursor: pointer;
	transition: all 0.2s ease;
}

.remove-script-button:hover {
	background: rgba(239, 68, 68, 0.3);
}

.add-script-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.5rem;
	background: rgba(139, 92, 246, 0.2);
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 0.375rem;
	color: rgb(167, 139, 250);
	font-size: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.add-script-button:hover {
	background: rgba(139, 92, 246, 0.3);
}

.connection-handle {
	width: 8px;
	height: 8px;
	background: var(--color-primary);
	border: 2px solid white;
	border-radius: 50%;
	opacity: 0.8;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	opacity: 1;
	transform: scale(1.2);
}
</style>

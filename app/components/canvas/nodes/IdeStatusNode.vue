<template>
	<div class="ide-status-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<UIcon name="i-lucide-code-2" class="size-8" :style="{ color: themeColor }" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			title="IDE STATUS CHECK"
			:title-color="themeColor"
			:theme-color="themeColor"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete IDE status node"
			@close="handleClose"
		/>

		<!-- IDE Status Panel -->
		<NodePanel
			panel-class="ide-status-container"
			:scrollbar-color="scrollbarColor"
		>
			<!-- Header Actions -->
			<div class="status-header">
				<div class="status-header-title">
					<UIcon name="i-lucide-monitor-check" class="w-5 h-5" :style="{ color: themeColor }" />
					<span :style="{ color: themeColor }">Development Environment</span>
				</div>
				<button
					class="refresh-button"
					:style="refreshButtonStyle"
					:disabled="isChecking"
					@click="checkAll"
				>
					<UIcon 
						name="i-lucide-refresh-cw" 
						class="w-4 h-4"
						:class="{ 'animate-spin': isChecking }"
					/>
					<span>{{ isChecking ? 'Checking...' : 'Refresh All' }}</span>
				</button>
			</div>

			<!-- IDEs Section (Collapsible) -->
			<CollapsibleSection
				title="Code Editors & IDEs"
				icon="i-lucide-code-2"
				:default-open="true"
			>
				<IdeList
					:theme-color="themeColor"
					:show-connect-button="false"
					:show-open-button="true"
					:show-summary="true"
					:auto-check="false"
					ref="ideListRef"
					@open="openIDE"
					@install="installIDE"
				/>
			</CollapsibleSection>

			<!-- Developer Tools Section (Collapsible) -->
			<CollapsibleSection
				title="Developer Tools"
				icon="i-lucide-wrench"
				:default-open="true"
			>
				<DeveloperToolsList
					:theme-color="themeColor"
					:show-summary="true"
					:auto-check="false"
					ref="devToolsListRef"
					@connect="handleToolConnect"
					@install="installTool"
				/>
			</CollapsibleSection>

			<!-- Info Box -->
			<div class="info-box" :style="infoBoxStyle">
				<UIcon name="i-lucide-info" class="w-4 h-4" :style="{ color: themeColor }" />
				<p class="info-text">
					To connect an IDE to a project, open a <strong>Project Node</strong> and go to the <strong>IDEs tab</strong>.
				</p>
			</div>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import CollapsibleSection from "~/components/ui/CollapsibleSection.vue";
import IdeList from "./shared/IdeList.vue";
import DeveloperToolsList from "./shared/DeveloperToolsList.vue";
import { useTauriShellCommand } from "#imports";

	interface Props {
		customNodeProps: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	type IDEStatus = "checking" | "installed" | "not-installed";

	interface IDE {
		name: string
		status: IDEStatus
		version?: string
		checkCommand: string
		versionCommand: string
		openCommand?: string
		downloadUrl?: string
	}

	// Theme colors
	const themeColor = computed(() => "rgba(139, 92, 246, 1)"); // Purple theme
	const activeColorRGB = computed(() => "139, 92, 246");
	const scrollbarColor = computed(() => `rgba(${activeColorRGB.value}, 0.6)`);

	const { removeNodes } = useVueFlow();

	const isChecking = ref(false);
	const ideListRef = ref<any>(null);
	const devToolsListRef = ref<any>(null);

	// Old IDE state (kept for compatibility but will be removed)
	const ides = ref<IDE[]>([
		{
			name: "VS Code",
			status: "checking",
			checkCommand: "if (Get-Command code -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "code --version 2>&1 | Select-Object -First 1",
			openCommand: "code",
			downloadUrl: "https://code.visualstudio.com/download"
		},
		{
			name: "Cursor",
			status: "checking",
			checkCommand: "if (Get-Command cursor -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "cursor --version 2>&1 | Select-Object -First 1",
			openCommand: "cursor",
			downloadUrl: "https://www.cursor.so/"
		},
		{
			name: "Visual Studio",
			status: "checking",
			checkCommand: "if (Test-Path 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe') { 'found' } else { '' }",
			versionCommand: "(Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1).Directory.Parent.Parent.Name",
			openCommand: "start devenv",
			downloadUrl: "https://visualstudio.microsoft.com/downloads/"
		},
		{
			name: "IntelliJ IDEA",
			status: "checking",
			checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\IntelliJ*') { 'found' } else { '' }",
			versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\IntelliJ*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
			downloadUrl: "https://www.jetbrains.com/idea/download/"
		},
		{
			name: "PyCharm",
			status: "checking",
			checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\PyCharm*') { 'found' } else { '' }",
			versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\PyCharm*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
			downloadUrl: "https://www.jetbrains.com/pycharm/download/"
		},
		{
			name: "WebStorm",
			status: "checking",
			checkCommand: "if (Test-Path 'C:\\Program Files\\JetBrains\\WebStorm*') { 'found' } else { '' }",
			versionCommand: "(Get-ChildItem 'C:\\Program Files\\JetBrains\\WebStorm*' -ErrorAction SilentlyContinue | Select-Object -First 1).Name",
			downloadUrl: "https://www.jetbrains.com/webstorm/download/"
		},
		{
			name: "Sublime Text",
			status: "checking",
			checkCommand: "if (Get-Command subl -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') { 'found' } else { '' }",
			versionCommand: "if (Test-Path 'C:\\Program Files\\Sublime Text\\sublime_text.exe') { 'Sublime Text' } else { 'Unknown' }",
			openCommand: "& 'C:\\Program Files\\Sublime Text\\sublime_text.exe'",
			downloadUrl: "https://www.sublimetext.com/download"
		},
		{
			name: "Notepad++",
			status: "checking",
			checkCommand: "if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') { 'found' } elseif (Test-Path 'C:\\Program Files (x86)\\Notepad++\\notepad++.exe') { 'found' } else { '' }",
			versionCommand: "if (Test-Path 'C:\\Program Files\\Notepad++\\notepad++.exe') { 'Notepad++' } else { 'Notepad++' }",
			openCommand: "start notepad++",
			downloadUrl: "https://notepad-plus-plus.org/downloads/"
		}
	]);

	// Computed stats
	const installedCount = computed(() => ides.value.filter(ide => ide.status === "installed").length);
	const notInstalledCount = computed(() => ides.value.filter(ide => ide.status === "not-installed").length);

	// Style helpers
	const refreshButtonStyle = computed(() => ({
		color: themeColor.value,
		borderColor: `${themeColor.value}40`,
		backgroundColor: `${themeColor.value}10`
	}));

	const infoBoxStyle = computed(() => ({
		borderColor: `${themeColor.value}40`,
		backgroundColor: `${themeColor.value}10`
	}));

	const getCardClass = (ide: IDE) => {
		return {
			"checking": ide.status === "checking",
			"installed": ide.status === "installed",
			"not-installed": ide.status === "not-installed"
		};
	};

	const getCardStyle = (ide: IDE) => {
		let borderColor = "rgba(100, 116, 139, 0.3)";
		if (ide.status === "installed") borderColor = "rgba(34, 197, 94, 0.5)";
		if (ide.status === "not-installed") borderColor = "rgba(239, 68, 68, 0.5)";
		if (ide.status === "checking") borderColor = "rgba(139, 92, 246, 0.3)";

		return { borderColor };
	};

	const getStatusIcon = (ide: IDE) => {
		if (ide.status === "checking") return "i-lucide-loader-2";
		if (ide.status === "installed") return "i-lucide-check-circle-2";
		return "i-lucide-x-circle";
	};

	const getIconClass = (ide: IDE) => {
		return {
			"animate-spin text-purple-400": ide.status === "checking",
			"text-green-400": ide.status === "installed",
			"text-red-400": ide.status === "not-installed"
		};
	};

	const getStatusLabel = (ide: IDE) => {
		if (ide.status === "checking") return "Checking...";
		if (ide.status === "installed") return "Installed";
		return "Not Found";
	};

	const getStatusBadgeStyle = (ide: IDE) => {
		let bg = "rgba(139, 92, 246, 0.2)";
		let color = "rgba(196, 181, 253, 1)";

		if (ide.status === "installed") {
			bg = "rgba(34, 197, 94, 0.2)";
			color = "rgba(134, 239, 172, 1)";
		} else if (ide.status === "not-installed") {
			bg = "rgba(239, 68, 68, 0.2)";
			color = "rgba(252, 165, 165, 1)";
		}

		return { backgroundColor: bg, color };
	};

	// Check IDE status
	const checkIDEStatus = async (ide: IDE): Promise<{ status: IDEStatus, version?: string }> => {
		try {
			console.log(`🔍 Checking ${ide.name}...`);
			
			// Use the same pattern as idePanel.vue
			const checkResponse = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				ide.checkCommand
			]).execute();

			console.log(`📊 ${ide.name} check result:`, {
				code: checkResponse.code,
				stdout: checkResponse.stdout,
				stderr: checkResponse.stderr
			});

			// Check if the command found the IDE (stdout contains "found")
			const found = checkResponse.code === 0 && (checkResponse.stdout || "").toLowerCase().includes("found");
			
			if (found) {
				const versionResponse = await useTauriShellCommand.create("exec-pwsh", [
					"-Command",
					ide.versionCommand
				]).execute();
				const version = (versionResponse.stdout || "").trim().split("\n")[0] || "Installed";
				console.log(`✅ ${ide.name} found - Version: ${version}`);
				return {
					status: "installed",
					version
				};
			}
			
			console.log(`❌ ${ide.name} not found`);
			return { status: "not-installed" };
		} catch (error) {
			console.error(`❌ Error checking ${ide.name}:`, error);
			return { status: "not-installed" };
		}
	};

	const checkAllIDEs = async () => {
		isChecking.value = true;

		// Reset all statuses
		for (const ide of ides.value) {
			ide.status = "checking";
		}

		// Check each IDE
		for (const ide of ides.value) {
			const result = await checkIDEStatus(ide);
			ide.status = result.status;
			ide.version = result.version;
		}

		isChecking.value = false;
	};

	// Check all (IDEs + Developer Tools)
	const checkAll = async () => {
		isChecking.value = true;

		try {
			console.log("🔄 Checking all development environment tools...");
			
			// Check IDEs
			if (ideListRef.value) {
				console.log("  🔍 Checking IDEs...");
				await ideListRef.value.checkAllIDEs();
			}

			// Check Developer Tools
			if (devToolsListRef.value) {
				console.log("  🔍 Checking developer tools...");
				await devToolsListRef.value.checkAllTools();
			}

			console.log("✅ All checks complete");
		} catch (error) {
			console.error("❌ Error checking environment:", error);
		} finally {
			isChecking.value = false;
		}
	};

	const openIDE = async (ide: IDE) => {
		if (!ide.openCommand) {
			console.error("No openCommand for IDE:", ide);
			return;
		}

		try {
			console.log(`🚀 Opening ${ide.name} with command:`, ide.openCommand);
			
			// Try opener plugin first (more reliable for opening applications) - PROVEN METHOD
			try {
				const { openPath } = await import("@tauri-apps/plugin-opener");

				// For VS Code, try to open with the executable path
				if (ide.name === "VS Code") {
					const vscodePaths = [
						"C:/Users/%USERNAME%/AppData/Local/Programs/Microsoft VS Code/Code.exe",
						"C:/Program Files/Microsoft VS Code/Code.exe",
						"C:/Program Files (x86)/Microsoft VS Code/Code.exe"
					];

					const username = window.navigator.userAgent.includes("Windows") ? await getWindowsUsername() : "";

					for (const path of vscodePaths) {
						try {
							const expandedPath = path.replace("%USERNAME%", username);
							await openPath(expandedPath);
							console.log(`✅ ${ide.name} opened successfully`);
							return;
						} catch (pathError) {
							continue;
						}
					}
				}

				// For Cursor, try common paths
				if (ide.name === "Cursor") {
					const cursorPaths = [
						"C:/Users/%USERNAME%/AppData/Local/Programs/Cursor/Cursor.exe",
						"C:/Program Files/Cursor/Cursor.exe",
						"C:/Program Files (x86)/Cursor/Cursor.exe"
					];

					const username = window.navigator.userAgent.includes("Windows") ? await getWindowsUsername() : "";

					for (const path of cursorPaths) {
						try {
							const expandedPath = path.replace("%USERNAME%", username);
							await openPath(expandedPath);
							console.log(`✅ ${ide.name} opened successfully`);
							return;
						} catch (pathError) {
							continue;
						}
					}
				}

				// Fallback: try to open with the command
				await openPath(ide.openCommand);
				console.log(`✅ ${ide.name} opened successfully`);
			} catch (openerError) {
				console.warn("Opener plugin failed, trying shell command:", openerError);
				// Fallback to shell command
				await useTauriShellCommand.create("exec-pwsh", ["-Command", ide.openCommand]).execute();
				console.log(`✅ ${ide.name} opened successfully (via shell)`);
			}
		} catch (error) {
			console.error(`❌ Failed to open ${ide.name}:`, error);
		}
	};

	const installIDE = (ide: IDE) => {
		if (ide.downloadUrl) {
			window.open(ide.downloadUrl, "_blank");
		}
	};

	const handleClose = () => {
		removeNodes([props.customNodeProps.id]);
	};

	const handleToolConnect = (tool: any) => {
		console.log("🔗 Tool connect clicked:", tool.name);
		console.log("ℹ️ Note: Developer tool connections require a Project Node.");
		console.log("   Open a Project Node and go to the IDEs tab to connect this tool to a project.");
	};

	const installTool = (tool: any) => {
		console.log("📥 Installing developer tool:", tool.name);
		if (tool.downloadUrl) {
			window.open(tool.downloadUrl, "_blank");
		}
	};

	let cachedWindowsUsername: string | null = null;
	const getWindowsUsername = async (): Promise<string> => {
		if (cachedWindowsUsername) {
			return cachedWindowsUsername;
		}

		try {
			const response = await useTauriShellCommand.create("exec-pwsh", ["-Command", "$env:USERNAME"]).execute();
			const username = (response.stdout || "").trim();
			if (username) {
				cachedWindowsUsername = username;
			}
			return username;
		} catch (error) {
			console.warn("Unable to resolve Windows username via PowerShell:", error);
			return "";
		}
	};

	onMounted(() => {
		// Trigger initial check for all tools
		checkAll();
	});
</script>

<style scoped>
.ide-status-node-container {
	width: 800px;
	min-height: 600px;
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
	border: 2px solid rgba(139, 92, 246, 0.3);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	display: flex;
	flex-direction: column;
	position: relative;
	backdrop-filter: blur(10px);
}

.node-icon-wrapper {
	position: absolute;
	top: -20px;
	left: 50%;
	transform: translateX(-50%);
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(17, 24, 39, 1), rgba(31, 41, 55, 1));
	border: 3px solid;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.connection-handle {
	width: 12px;
	height: 12px;
	background: rgba(139, 92, 246, 0.8);
	border: 2px solid rgba(196, 181, 253, 1);
	border-radius: 50%;
}

.connection-handle:hover {
	background: rgba(139, 92, 246, 1);
	transform: scale(1.3);
}

/* Status Header */
.status-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem;
	border-bottom: 1px solid rgba(139, 92, 246, 0.2);
	margin-bottom: 1rem;
}

.status-header-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9375rem;
	font-weight: 600;
	letter-spacing: 0.05em;
	text-transform: uppercase;
}

.info-box {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1rem;
	border: 1px solid;
	border-radius: 0.75rem;
	margin-top: 1rem;
}

.info-text {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.8);
	line-height: 1.5;
	margin: 0;
}

.info-text strong {
	color: rgba(255, 255, 255, 0.95);
	font-weight: 600;
}

.refresh-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border: 1px solid;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.refresh-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* IDE Cards Grid */
.ide-cards-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
	padding: 0 1rem 1rem;
}

.ide-card {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;
	background: rgba(31, 41, 55, 0.5);
	border: 2px solid;
	border-radius: 0.75rem;
	transition: all 0.2s ease;
}

.ide-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ide-card.installed {
	background: rgba(34, 197, 94, 0.05);
}

.ide-card.not-installed {
	background: rgba(239, 68, 68, 0.05);
}

.ide-card-icon {
	display: flex;
	align-items: center;
	justify-content: center;
}

.ide-card-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.ide-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.ide-name {
	font-size: 1rem;
	font-weight: 600;
	color: white;
}

.status-badge {
	padding: 0.25rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.75rem;
	font-weight: 600;
	white-space: nowrap;
}

.ide-version {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
}

.ide-card-actions {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.action-btn {
	flex: 1;
	min-width: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
}

.open-btn {
	background: rgba(34, 197, 94, 0.2);
	color: rgba(134, 239, 172, 1);
	border: 1px solid rgba(34, 197, 94, 0.4);
}

.open-btn:hover {
	background: rgba(34, 197, 94, 0.3);
	transform: translateY(-1px);
}

.install-btn {
	background: rgba(251, 146, 60, 0.2);
	color: rgba(253, 186, 116, 1);
	border: 1px solid rgba(251, 146, 60, 0.4);
}

.install-btn:hover {
	background: rgba(251, 146, 60, 0.3);
	transform: translateY(-1px);
}

/* Status Summary */
.status-summary {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rem;
	padding: 1rem;
	margin: 1rem;
	border: 1px solid;
	border-radius: 0.75rem;
	background: rgba(139, 92, 246, 0.05);
}

.summary-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(229, 231, 235, 1);
}

/* Info Box */
.info-box {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1rem;
	margin: 1rem;
	border: 1px solid;
	border-radius: 0.75rem;
}

.info-text {
	font-size: 0.875rem;
	color: rgba(229, 231, 235, 0.9);
	margin: 0;
	line-height: 1.5;
}

.info-text strong {
	font-weight: 600;
	color: rgba(255, 255, 255, 1);
}

.animate-spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>


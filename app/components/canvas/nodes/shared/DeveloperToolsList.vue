<template>
	<div class="dev-tools-container">
		<!-- Developer Tools Grid -->
		<div class="dev-tools-grid">
			<div
				v-for="tool in tools"
				:key="tool.name"
				class="tool-card"
				:class="getCardClass(tool)"
				:style="getCardStyle(tool)"
			>
				<!-- Status Icon -->
				<div class="tool-card-icon">
					<UIcon
						:name="getStatusIcon(tool)"
						:class="getIconClass(tool)"
						class="w-6 h-6"
					/>
				</div>

				<!-- Tool Info -->
				<div class="tool-card-content">
					<div class="tool-card-header">
						<span class="tool-name">{{ tool.name }}</span>
						<div
							class="status-badge"
							:style="getStatusBadgeStyle(tool)"
						>
							{{ getStatusLabel(tool) }}
						</div>
					</div>
					<div v-if="tool.version" class="tool-version">
						{{ tool.version }}
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="tool-card-actions">
					<button
						v-if="tool.status === 'installed'"
						class="action-btn link-btn"
						@click="handleConnect(tool)"
					>
						<UIcon name="i-lucide-link" class="w-4 h-4" />
						<span>Link</span>
					</button>
				<button
					v-else-if="tool.status === 'not-installed' && tool.downloadUrl"
					class="action-btn install-btn"
					:disabled="installingTool === tool.name"
					@click="handleInstall(tool)"
				>
					<UIcon 
						:name="installingTool === tool.name ? 'i-lucide-loader-2' : 'i-lucide-download'" 
						class="w-4 h-4"
						:class="{ 'animate-spin': installingTool === tool.name }"
					/>
					<span>{{ installingTool === tool.name ? 'Installing...' : 'Get' }}</span>
				</button>
				</div>
			</div>
		</div>

		<!-- Summary Stats -->
		<div v-if="showSummary" class="status-summary" :style="{ borderColor: `${themeColor}40` }">
			<div class="summary-item">
				<UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-400" />
				<span>{{ installedCount }} Installed</span>
			</div>
			<div class="summary-item">
				<UIcon name="i-lucide-x-circle" class="w-4 h-4 text-red-400" />
				<span>{{ notInstalledCount }} Not Found</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { useTemplateInstaller } from "@canvas/composables/useTemplateInstaller";

	interface Props {
		themeColor?: string
		showSummary?: boolean
		autoCheck?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		themeColor: "#8b5cf6",
		showSummary: true,
		autoCheck: true
	});

	const emit = defineEmits<{
		connect: [tool: any]
		install: [tool: any]
	}>();

	const { installFromTemplate } = useTemplateInstaller();
	const installingTool = ref<string | null>(null);

	type ToolStatus = "checking" | "installed" | "not-installed";

	interface DeveloperTool {
		name: string
		status: ToolStatus
		version?: string
		checkCommand: string
		versionCommand: string
		category: "vcs" | "package-manager" | "git-hooks" | "aws" | "dev-tools"
		downloadUrl?: string
	}

	const isChecking = ref(false);

	const tools = ref<DeveloperTool[]>([
		// Version Control
		{
			name: "Git",
			status: "checking",
			category: "vcs",
			checkCommand: "if (Get-Command git -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (git --version 2>$null); if ($version) { $version.Replace('git version ', '') } else { 'Installed' }",
			downloadUrl: "https://git-scm.com/downloads"
		},
		// Package Managers
		{
			name: "npm",
			status: "checking",
			category: "package-manager",
			checkCommand: "if (Get-Command npm -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (npm --version 2>$null); if ($version) { $version } else { 'Installed' }",
			downloadUrl: "https://nodejs.org/"
		},
		{
			name: "Bun",
			status: "checking",
			category: "package-manager",
			checkCommand: "if (Get-Command bun -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (bun --version 2>$null); if ($version) { $version } else { 'Installed' }",
			downloadUrl: "https://bun.sh/"
		},
		{
			name: "pnpm",
			status: "checking",
			category: "package-manager",
			checkCommand: "if (Get-Command pnpm -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (pnpm --version 2>$null); if ($version) { $version } else { 'Installed' }",
			downloadUrl: "https://pnpm.io/installation"
		},
		// Git Hooks
		{
			name: "Husky",
			status: "checking",
			category: "git-hooks",
			checkCommand: "if (Get-Command husky -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path '.husky') { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (husky --version 2>$null); if (!$version -and (Test-Path '.husky')) { $version = 'Installed (local)' }; if ($version) { $version } else { 'Installed' }",
			downloadUrl: "https://typicode.github.io/husky/"
		},
		// AWS Tools
		{
			name: "AWS Amplify CLI",
			status: "checking",
			category: "aws",
			checkCommand: "if (Get-Command amplify -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (amplify --version 2>$null); if ($version) { $version } else { 'Installed' }",
			downloadUrl: "https://docs.amplify.aws/cli/start/install/"
		},
		{
			name: "AWS CLI",
			status: "checking",
			category: "aws",
			checkCommand: "if (Get-Command aws -ErrorAction SilentlyContinue) { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (aws --version 2>$null); if ($version) { $version.Replace('aws-cli/', '') } else { 'Installed' }",
			downloadUrl: "https://aws.amazon.com/cli/"
		},
		// Development Tools
		{
			name: "ESLint",
			status: "checking",
			category: "dev-tools",
			checkCommand: "if (Get-Command eslint -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'node_modules/.bin/eslint') { 'found' } elseif (Test-Path 'node_modules/.bin/eslint.cmd') { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (eslint --version 2>$null); if (!$version -and (Test-Path 'node_modules/.bin/eslint')) { $version = 'Installed (local)' }; if ($version) { $version.Replace('v', '') } else { 'Installed' }",
			downloadUrl: "https://eslint.org/docs/latest/use/getting-started"
		},
		{
			name: "TypeScript",
			status: "checking",
			category: "dev-tools",
			checkCommand: "if (Get-Command tsc -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'node_modules/.bin/tsc') { 'found' } elseif (Test-Path 'node_modules/.bin/tsc.cmd') { 'found' } else { '' }",
			versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $version = (tsc --version 2>$null); if (!$version -and (Test-Path 'node_modules/.bin/tsc')) { $version = 'Installed (local)' }; if ($version) { $version.Replace('Version ', '') } else { 'Installed' }",
			downloadUrl: "https://www.typescriptlang.org/download"
		}
	]);

	// Computed stats
	const installedCount = computed(() => tools.value.filter(tool => tool.status === "installed").length);
	const notInstalledCount = computed(() => tools.value.filter(tool => tool.status === "not-installed").length);

	// Style helpers
	const getCardClass = (tool: DeveloperTool) => {
		return {
			"checking": tool.status === "checking",
			"installed": tool.status === "installed",
			"not-installed": tool.status === "not-installed"
		};
	};

	const getCardStyle = (tool: DeveloperTool) => {
		let borderColor = "rgba(100, 116, 139, 0.3)";
		if (tool.status === "installed") borderColor = "rgba(34, 197, 94, 0.5)";
		if (tool.status === "not-installed") borderColor = "rgba(239, 68, 68, 0.5)";
		if (tool.status === "checking") borderColor = "rgba(139, 92, 246, 0.3)";

		return { borderColor };
	};

	const getStatusIcon = (tool: DeveloperTool) => {
		if (tool.status === "checking") return "i-lucide-loader-2";
		if (tool.status === "installed") return "i-lucide-check-circle-2";
		return "i-lucide-x-circle";
	};

	const getIconClass = (tool: DeveloperTool) => {
		return {
			"animate-spin text-purple-400": tool.status === "checking",
			"text-green-400": tool.status === "installed",
			"text-red-400": tool.status === "not-installed"
		};
	};

	const getStatusLabel = (tool: DeveloperTool) => {
		if (tool.status === "checking") return "Checking...";
		if (tool.status === "installed") return "Installed";
		return "Not Found";
	};

	const getStatusBadgeStyle = (tool: DeveloperTool) => {
		let bg = "rgba(139, 92, 246, 0.2)";
		let color = "rgba(196, 181, 253, 1)";

		if (tool.status === "installed") {
			bg = "rgba(34, 197, 94, 0.2)";
			color = "rgba(134, 239, 172, 1)";
		} else if (tool.status === "not-installed") {
			bg = "rgba(239, 68, 68, 0.2)";
			color = "rgba(252, 165, 165, 1)";
		}

		return { backgroundColor: bg, color };
	};

	// Check tool status
	const checkToolStatus = async (tool: DeveloperTool): Promise<{ status: ToolStatus, version?: string }> => {
		try {
			const { useTauriShellCommand } = await import("#imports");
			const checkResponse = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				tool.checkCommand
			]).execute();

			const found = checkResponse.code === 0 && checkResponse.stdout.trim().toLowerCase().includes("found");
			
			if (found) {
				try {
					const versionResponse = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						tool.versionCommand
					]).execute();
					
					let version = versionResponse.stdout.trim();
					
					// Clean version string
					version = version.replace(/\x1B\[[0-9;]*m/g, ""); // Remove ANSI codes
					version = version.split('\n')[0].trim(); // Get first line only
					
					return {
						status: "installed",
						version: version || "Installed"
					};
				} catch (versionError) {
					return {
						status: "installed",
						version: "Installed"
					};
				}
			}
			
			return { status: "not-installed" };
		} catch (error) {
			console.error(`Error checking ${tool.name}:`, error);
			return { status: "not-installed" };
		}
	};

	const checkAllTools = async () => {
		isChecking.value = true;

		for (const tool of tools.value) {
			tool.status = "checking";
		}

		for (const tool of tools.value) {
			const result = await checkToolStatus(tool);
			tool.status = result.status;
			tool.version = result.version;
		}

		isChecking.value = false;
	};

	const handleConnect = (tool: DeveloperTool) => {
		console.log("🔗 Connect clicked for tool:", tool.name);
		emit("connect", tool);
	};

	const handleInstall = async (tool: DeveloperTool) => {
		console.log("═══════════════════════════════════════════");
		console.log("📥 INSTALLING DEVELOPER TOOL FROM TEMPLATE");
		console.log("  Tool Name:", tool.name);
		console.log("═══════════════════════════════════════════");

		installingTool.value = tool.name;

		try {
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();

			const result = await installFromTemplate(tool.name, {
				currentOS: "windows",
				currentVersion: "11"
			});

			console.log("📊 Installation result:", result);

			if (result.status === "success") {
				toast.add({
					title: "Installation Complete",
					description: `${tool.name} has been installed successfully`,
					color: "green"
				});
				
				// Re-check tool status after installation
				setTimeout(async () => {
					const checkResult = await checkToolStatus(tool);
					tool.status = checkResult.status;
					tool.version = checkResult.version;
				}, 2000);
			} else if (result.status === "skipped") {
				toast.add({
					title: "Already Installed",
					description: result.message,
					color: "blue"
				});
			} else {
				toast.add({
					title: "Installation Failed",
					description: result.message,
					color: "red",
					timeout: 5000
				});
				
				// If template search failed and we have a download URL, offer manual download
				if (result.message.includes('Unable to find') && tool.downloadUrl) {
					console.log("💡 Offering manual download fallback");
					setTimeout(() => {
						toast.add({
							title: "Manual Installation Available",
							description: `Click "Get" again or visit the website to download ${tool.name} manually`,
							color: "blue",
							timeout: 8000
						});
					}, 1000);
				}
			}
		} catch (error) {
			console.error("❌ Installation error:", error);
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Installation Error",
				description: `Failed to install ${tool.name}. Please try downloading manually.`,
				color: "red",
				timeout: 5000
			});
			
			// Open download URL as fallback
			if (tool.downloadUrl) {
				console.log("🌐 Opening download URL as fallback:", tool.downloadUrl);
				window.open(tool.downloadUrl, "_blank");
			}
		} finally {
			installingTool.value = null;
			console.log("═══════════════════════════════════════════");
		}
	};

	onMounted(() => {
		if (props.autoCheck) {
			checkAllTools();
		}
	});

	defineExpose({
		checkAllTools
	});
</script>

<style scoped>
.dev-tools-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.dev-tools-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 0.75rem;
}

.tool-card {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;
	background: rgba(31, 41, 55, 0.5);
	border: 2px solid;
	border-radius: 0.75rem;
	transition: all 0.2s ease;
}

.tool-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tool-card.installed {
	background: rgba(34, 197, 94, 0.05);
}

.tool-card.not-installed {
	background: rgba(239, 68, 68, 0.05);
}

.tool-card-icon {
	display: flex;
	align-items: center;
	justify-content: center;
}

.tool-card-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.tool-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.tool-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: white;
}

.status-badge {
	padding: 0.25rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.7rem;
	font-weight: 600;
	white-space: nowrap;
}

.tool-version {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
}

.tool-card-actions {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.action-btn {
	flex: 1;
	min-width: 70px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.375rem;
	padding: 0.5rem 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
}

.link-btn {
	background: rgba(59, 130, 246, 0.2);
	color: rgba(147, 197, 253, 1);
	border: 1px solid rgba(59, 130, 246, 0.4);
}

.link-btn:hover {
	background: rgba(59, 130, 246, 0.3);
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

.status-summary {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rem;
	padding: 0.75rem;
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


<template>
  <div></div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

interface Props {
  node: {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    color?: string;
  };
}

const emit = defineEmits<{
  code: [code: string];
  documentation: [doc: string];
  files: [files: FileStructure[]];
}>();

interface FileStructure {
  title: string;
  icon?: string;
  openIcon?: string;
  path?: string;
  content?: string;
  children?: FileStructure[];
}

const props = defineProps<Props>();

onMounted(() => {
  const minimalDoc = "Python version checker node using BaseNodeTemplate, LanguageStatusCard component and useLanguageDetection composable. Automatically detects Python via python, python3, or py (Python Launcher) commands. Includes installation support via PowerShell scripts.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-snake"
		:title="_props.customNodeProps.data?.label || 'PYTHON CHECK'"
		:title-color="themeColor"
		:theme-color="themeColor"
		:status-label="statusLabel"
		:status-color="statusColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:background-color="undefined"
		:border-color="borderColor"
		:min-width="350"
		:min-height="280"
		:default-collapsed="false"
		:node-class="pythonCheckNodeClass"
		@close="handleClose"
	>
		<!-- Node Content -->
		<div class="node-content-wrapper">
			<LanguageStatusCard
				:config="pythonConfig"
				:auto-check="true"
				:show-install-guide="false"
				@language-detected="handleLanguageDetected"
				@language-installed="handleLanguageInstalled"
				@language-error="handleLanguageError"
			/>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import LanguageStatusCard from "~/components/canvas/shared/LanguageStatusCard.vue";
	import { languageConfigs, useLanguageDetection } from "../composables/useLanguageDetection";

	interface Props {
		customNodeProps: {
			id: string
			data: {
				label?: string
				pythonInstalled?: boolean
				pythonVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectPython",
		"installPython",
		"pythonError",
		"close"
	]);

	// Use the Python configuration from the language configs
	const pythonConfig = languageConfigs.python;

	// Get status from the language detection
	const { status } = useLanguageDetection(pythonConfig);

	// Theme colors based on status
	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#fbbf24";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(251, 191, 36, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return \`Installed (\${status.value.version})\`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#ef4444";
	});

	const pythonCheckNodeClass = computed(() => {
		return \`python-check-node \${status.value.installed ? 'python-found' : ''}\`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	// Event handlers for language actions
	const handleLanguageDetected = (data: any) => {
		emit("detectPython", data);
	};

	const handleLanguageInstalled = (data: any) => {
		emit("installPython", data);
	};

	const handleLanguageError = (data: any) => {
		emit("pythonError", data);
	};
<\/script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

/* Animated border when Python is found */
.python-check-node.python-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: pythonPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes pythonPulse {
	0% {
		border-color: rgba(34, 197, 94, 0.8);
		box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
	}
	50% {
		border-color: rgba(34, 197, 94, 1);
		box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
	}
	100% {
		border-color: rgba(34, 197, 94, 0.8);
		box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
	}
}
</style>`;

  const languageStatusCardCode = `// See NodeCheckNodeCode.vue for LanguageStatusCard.vue code`;
  
  // Updated useLanguageDetection with improved Python detection and Command-based installation
  const useLanguageDetectionCode = `import { ref } from "vue";
import { useToast } from "~/components/Ui/composables/useToast";

export interface LanguageConfig {
	name: string
	command: string
	versionPattern: RegExp
	cacheKey: string
	installGuide: {
		title: string
		description: string
		url: string
		script: string
	}
}

export interface LanguageStatus {
	name: string
	installed: boolean
	version?: string
	error?: string
	loading: boolean
}

export function useLanguageDetection(config: LanguageConfig) {
	const toast = useToast();
	const status = ref<LanguageStatus>({
		name: config.name,
		installed: false,
		loading: false
	});

	const detectLanguage = async (forceRefresh = false) => {
		status.value.loading = true;

		try {
			// Check cache first unless force refresh
			if (!forceRefresh) {
				const cached = localStorage.getItem(config.cacheKey);
				if (cached) {
					status.value.version = cached;
					status.value.installed = cached !== "Not installed";
					return { installed: status.value.installed, version: status.value.version };
				}
			}

			const { useTauriShellCommand } = await import("#imports");

			// Try the primary command first
			let resp = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				\`try { \${config.command} --version 2>&1 } catch { $null }\`
			]).execute();

			let version = (resp.stdout || "").trim();

			// For Python, try multiple commands if the first one fails
			if ((!version || resp.code !== 0) && config.name === "Python") {
				// Try python3
				resp = await useTauriShellCommand.create("exec-pwsh", [
					"-Command",
					\`try { python3 --version 2>&1 } catch { $null }\`
				]).execute();
				version = (resp.stdout || "").trim();

				// Try py (Python Launcher on Windows)
				if (!version || resp.code !== 0) {
					resp = await useTauriShellCommand.create("exec-pwsh", [
						"-Command",
						\`try { py --version 2>&1 } catch { $null }\`
					]).execute();
					version = (resp.stdout || "").trim();
				}
			}

			// For Node.js, try nodejs as fallback
			if ((!version || resp.code !== 0) && config.name === "Node.js") {
				resp = await useTauriShellCommand.create("exec-pwsh", [
					"-Command",
					\`try { nodejs --version 2>&1 } catch { $null }\`
				]).execute();
				version = (resp.stdout || "").trim();
			}

			if (version && resp.code === 0) {
				// Extract version using the provided pattern
				const versionMatch = version.match(config.versionPattern);
				const cleanVersion = versionMatch ? versionMatch[1] || version : version;

				status.value.version = cleanVersion;
				status.value.installed = true;
				status.value.error = undefined;

				// Cache the result
				localStorage.setItem(config.cacheKey, cleanVersion);
			} else {
				status.value.version = "Not installed";
				status.value.installed = false;
				status.value.error = undefined;

				// Clear cache
				localStorage.removeItem(config.cacheKey);
			}

			return {
				installed: status.value.installed,
				version: status.value.version,
				error: status.value.error
			};
		} catch (error: any) {
			status.value.version = "Not installed";
			status.value.installed = false;
			status.value.error = \`Failed to detect \${config.name}: \${error.message}\`;

			// Clear cache
			localStorage.removeItem(config.cacheKey);

			toast.add({
				title: \`\${config.name} Detection Failed\`,
				description: error.message || \`Failed to detect \${config.name}\`,
				color: "error"
			});

			throw error;
		} finally {
			status.value.loading = false;
		}
	};

	const installLanguage = async () => {
		try {
			toast.add({
				title: \`Installing \${config.name}\`,
				description: \`Opening PowerShell with \${config.name} installation commands. Follow the prompts in the terminal.\`,
				color: "info"
			});

			const { writeTextFile } = await import("@tauri-apps/plugin-fs");
			const { join } = await import("@tauri-apps/api/path");
			const { useTauriOsTempDir } = await import("#imports");
			const { Command } = await import("@tauri-apps/plugin-shell");

			const tempDir = await useTauriOsTempDir();
			const scriptPath = await join(tempDir, \`install-\${config.name.toLowerCase().replace(/\\s+/g, '-')}.ps1\`);
			await writeTextFile(scriptPath, config.installGuide.script);

			// Execute PowerShell with the script in a new window
			const command = Command.create("powershell", [
				"-NoExit",
				"-ExecutionPolicy", "Bypass",
				"-File", scriptPath
			]);

			await command.spawn();

			return { success: true };
		} catch (error: any) {
			toast.add({
				title: "Installation Failed",
				description: \`Failed to open installation window. Please install \${config.name} manually from \${config.installGuide.url}\`,
				color: "error"
			});

			throw error;
		}
	};

	const openInstallationGuide = () => {
		window.open(config.installGuide.url, "_blank");
	};

	// Auto-check on initialization
	const initializeLanguage = async () => {
		if (!status.value.installed) {
			await detectLanguage();
		}
	};

	return {
		// State
		status,

		// Actions
		detectLanguage,
		installLanguage,
		openInstallationGuide,
		initializeLanguage,

		// Config
		config
	};
}

// Pre-configured language configs (see full file for all configs)
export const languageConfigs = {
	python: {
		name: "Python",
		command: "python",
		versionPattern: /Python (\\d+\\.\\d+\\.\\d+)/,
		cacheKey: "buildit_python_version",
		installGuide: {
			title: "Python Installation Guide",
			description: "Install Python via Chocolatey package manager",
			url: "https://www.python.org/downloads/",
			script: "# Python Installation Script (see full file for complete script)"
		}
	}
	// ... other language configs
};`;

  const files: FileStructure[] = [
    {
      title: "components",
      openIcon: "vscode-icons:default-folder-opened",
      icon: "vscode-icons:default-folder",
      children: [
        {
          title: "canvas",
          openIcon: "vscode-icons:default-folder-opened",
          icon: "vscode-icons:default-folder",
          children: [
            {
              title: "nodes",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "PythonCheckNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/PythonCheckNode.vue",
                  content: mainCode
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "LanguageStatusCard.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/shared/LanguageStatusCard.vue",
                      content: languageStatusCardCode
                    }
                  ]
                }
              ]
            },
            {
              title: "composables",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "useLanguageDetection.ts",
                  icon: "vscode-icons:file-type-typescript-official",
                  path: "components/canvas/composables/useLanguageDetection.ts",
                  content: useLanguageDetectionCode
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  emit("code", mainCode);
  emit("files", files);
});
</script>

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

interface FileStructure {
  title: string;
  icon?: string;
  openIcon?: string;
  path?: string;
  content?: string;
  children?: FileStructure[];
}

const emit = defineEmits<{
  code: [code: string];
  documentation: [doc: string];
  files: [files: FileStructure[]];
}>();

const props = defineProps<Props>();

onMounted(() => {
  const minimalDoc = "Node.js version checker node using LanguageStatusCard component and useLanguageDetection composable for reliable detection and installation support.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-hexagon"
		:title="_props.customNodeProps.data?.label || 'NODE.JS CHECK'"
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
		:node-class="nodeCheckNodeClass"
		@close="handleClose"
	>
		<!-- Node Content -->
		<div class="node-content-wrapper">
			<LanguageStatusCard
				:config="nodeConfig"
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
				nodeInstalled?: boolean
				nodeVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectNode",
		"installNode",
		"nodeError",
		"close"
	]);

	// Use the Node.js configuration from the language configs
	const nodeConfig = languageConfigs.node;

	// Get status from the language detection
	const { status } = useLanguageDetection(nodeConfig);

	// Theme colors based on status
	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#22c55e";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(34, 197, 94, 0.3)";
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

	const nodeCheckNodeClass = computed(() => {
		return \`node-check-node \${status.value.installed ? 'node-found' : ''}\`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	// Event handlers for language actions
	const handleLanguageDetected = (data: any) => {
		emit("detectNode", data);
	};

	const handleLanguageInstalled = (data: any) => {
		emit("installNode", data);
	};

	const handleLanguageError = (data: any) => {
		emit("nodeError", data);
	};
<\/script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

/* Animated border when Node.js is found */
.node-check-node.node-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: nodePulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes nodePulse {
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

  const languageDetectionCode = `import { useToast } from "#imports";
import { ref } from "vue";

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

			const resp = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				\`\${config.command} --version\`
			]).execute();

			const version = (resp.stdout || "").trim();

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

			useToast().add({
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
			useToast().add({
				title: \`Installing \${config.name}\`,
				description: \`Opening PowerShell with \${config.name} installation commands. Follow the prompts in the terminal.\`,
				color: "info"
			});

			const { openPath } = await import("@tauri-apps/plugin-opener");
			const { writeTextFile } = await import("@tauri-apps/plugin-fs");
			const { join } = await import("@tauri-apps/api/path");
			const { useTauriOsTempDir } = await import("#imports");

			const tempDir = await useTauriOsTempDir();
			const scriptPath = await join(tempDir, \`install-\${config.name.toLowerCase()}.ps1\`);
			await writeTextFile(scriptPath, config.installGuide.script);

			// Open PowerShell with the script
			await openPath(scriptPath, "powershell");

			return { success: true };
		} catch (error: any) {
			useToast().add({
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

// Pre-configured language configs
export const languageConfigs = {
	node: {
		name: "Node.js",
		command: "node",
		versionPattern: /v?(\\d+\\.\\d+\\.\\d+)/,
		cacheKey: "buildit_node_version",
		installGuide: {
			title: "Node.js Installation Guide",
			description: "Install Node.js via Chocolatey package manager",
			url: "https://nodejs.org/en/download/",
			script: "# Node.js Installation Script (see useLanguageDetection.ts for full script)"
		}
	}
};`;

  const languageStatusCardCode = `<template>
	<div class="language-status-card p-3 border border-white/10 rounded-lg bg-black/20">
		<div class="flex items-center gap-3">
			<div v-if="status.installed" class="flex items-center gap-2 text-green-400">
				<Icon name="i-heroicons-check-circle" class="w-5 h-5" />
				<span class="font-medium">{{ status.name }} {{ status.version }}</span>
			</div>
			<div v-else class="flex items-center gap-2 text-orange-400">
				<Icon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
				<span class="font-medium">{{ status.name }} Not Installed</span>
			</div>
			<div class="ml-auto flex gap-2">
				<button
					v-if="!status.installed"
					class="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm border border-orange-500/30 disabled:opacity-50 transition-all duration-200 hover:scale-105"
					:disabled="status.loading"
					@click="handleInstallClick"
				>
					<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
					{{ status.loading ? 'Installing...' : 'Install' }}
				</button>
				<button
					v-if="!status.installed"
					class="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm border border-blue-500/30 transition-all duration-200 hover:scale-105"
					@click="handleGuideClick"
				>
					<Icon name="i-lucide-external-link" class="w-4 h-4 inline mr-1" />
					Guide
				</button>
				<button
					class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 disabled:opacity-50 transition-all duration-200 hover:scale-105"
					:disabled="status.loading"
					@click="handleCheckClick"
				>
					<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
					{{ status.loading ? 'Checking...' : 'Recheck' }}
				</button>
			</div>
		</div>

		<!-- Error Message -->
		<div v-if="status.error" class="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-xs">
			{{ status.error }}
		</div>

		<!-- Installation Guide -->
		<div v-if="!status.installed && showInstallGuide" class="installation-guide mt-3">
			<div class="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
				<div class="flex items-center justify-between mb-2">
					<h4 class="font-medium text-orange-300 text-sm">
						{{ config.installGuide.title }}
					</h4>
					<button
						class="text-orange-400 hover:text-orange-300 transition-colors"
						@click="showInstallGuide = false"
					>
						<Icon name="i-lucide-x" class="w-4 h-4" />
					</button>
				</div>
				<p class="text-orange-200 text-xs mb-3">
					{{ config.installGuide.description }}
				</p>
				<div class="space-y-2">
					<button
						class="w-full px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-xs border border-orange-500/30 transition-all duration-200 hover:scale-105"
						@click="handleInstallClick"
					>
						<Icon name="i-lucide-terminal" class="w-4 h-4 inline mr-1" />
						Run Installation Script
					</button>
					<button
						class="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs border border-blue-500/30 transition-all duration-200 hover:scale-105"
						@click="handleGuideClick"
					>
						<Icon name="i-lucide-external-link" class="w-4 h-4 inline mr-1" />
						Visit Official Guide
					</button>
				</div>
			</div>
		</div>

		<!-- Show Guide Button -->
		<div v-if="!status.installed && !showInstallGuide" class="mt-3">
			<button
				class="w-full px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm border border-orange-500/20 transition-all duration-200 hover:scale-105"
				@click="showInstallGuide = true"
			>
				<Icon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
				Show Installation Guide
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { LanguageConfig } from "../composables/useLanguageDetection";
	import { ref, watch } from "vue";
	import { useLanguageDetection } from "../composables/useLanguageDetection";

	interface Props {
		config: LanguageConfig
		autoCheck?: boolean
		showInstallGuide?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		autoCheck: true,
		showInstallGuide: false
	});

	const emit = defineEmits([
		"language-detected",
		"language-installed",
		"language-error"
	]);

	const showInstallGuide = ref(props.showInstallGuide);

	const {
		status,
		detectLanguage,
		installLanguage,
		openInstallationGuide,
		initializeLanguage
	} = useLanguageDetection(props.config);

	const handleCheckClick = async () => {
		try {
			const result = await detectLanguage(true);
			emit("language-detected", result);
		} catch (error) {
			emit("language-error", error);
		}
	};

	const handleInstallClick = async () => {
		try {
			await installLanguage();
			emit("language-installed", { language: props.config.name });
		} catch (error) {
			emit("language-error", error);
		}
	};

	const handleGuideClick = () => {
		openInstallationGuide();
	};

	// Auto-check on mount
	if (props.autoCheck) {
		initializeLanguage();
	}

	// Watch for status changes and emit events
	watch(status, (newStatus) => {
		if (newStatus.installed) {
			emit("language-detected", { installed: newStatus.installed, version: newStatus.version });
		}
	}, { deep: true });
<\/script>

<style scoped>
/* Add any specific styles for LanguageStatusCard here if needed */
<\/style>`;

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
                  title: "NodeCheckNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/NodeCheckNode.vue",
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
                  content: languageDetectionCode
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

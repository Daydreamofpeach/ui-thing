<template>
	<div class="template-exec" @wheel.stop>
		<!-- Always Expanded Content -->
		<div class="section-content">
			<!-- Loading State -->
			<div v-if="isLoading" class="loading-state">
				<UIcon name="i-lucide-loader-2" class="w-4 h-4 animate-spin text-primary/60" />
				<span class="text-xs text-white/60">Loading scripts...</span>
			</div>

			<!-- Error State -->
			<div v-else-if="loadError" class="error-state">
				<UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-400" />
				<span class="text-xs text-red-400">{{ loadError }}</span>
			</div>

			<!-- Scripts List -->
			<div v-else-if="scripts.length > 0" class="scripts-wrapper">
				<div 
					class="scripts-list-container" 
					@wheel.stop
				>
					<ScriptExecutor
						v-for="script in scripts"
						:key="script.name"
						:script="script"
						:project-path="projectPath"
						@browser-requested="(url, scriptName) => emit('create-browser-node', url, configuredNodeId, scriptName)"
					/>
				</div>
				<div v-if="scripts.length > 7" class="scroll-indicator">
					<UIcon name="i-lucide-chevrons-down" class="w-3 h-3 animate-bounce text-green-400/60" />
					<span class="text-xs text-white/50">Scroll for more</span>
				</div>
			</div>

			<!-- No Scripts State -->
			<div v-else class="empty-state">
				<UIcon name="i-lucide-inbox" class="w-4 h-4 text-white/40" />
				<span class="text-xs text-white/60">No scripts configured</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from "vue";
	import { useToast } from "#ui/composables/useToast";
	import ScriptExecutor from "~/components/canvas/nodes/ScriptExecutor.vue";

	interface Script {
		name: string;
		command: string;
		category?: string;
	}

	interface Props {
		projectPath: string;
		templateId: string;
		configuredNodeId: string;
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		'create-browser-node': [url: string, sourceNodeId: string, scriptName: string]
	}>();
	const toast = useToast();

	// State
	const isExpanded = ref(true); // Always expanded for main feature
	const isLoading = ref(false);
	const loadError = ref<string | null>(null);
	const scripts = ref<Script[]>([]);

	const scriptCount = computed(() => scripts.value.length);

	// Check if script is a dev script (kept for backward compatibility)
	const isDevScript = (scriptName: string) => {
		return scriptName.toLowerCase().includes('dev') || 
		       scriptName.toLowerCase().includes('serve') ||
		       scriptName.toLowerCase().includes('start');
	};

	// Load scripts from b.json
	const loadScripts = async () => {
		isLoading.value = true;
		loadError.value = null;

		try {
			const { useTauriShellCommand } = await import("#imports");
			const normalizedPath = props.projectPath.replace(/\//g, "\\");
			const bJsonPath = `${normalizedPath}\\b\\b.json`;

			console.log("📜 TemplateExec: Loading scripts from:", bJsonPath);

			// Read b.json using PowerShell
			const result = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`if (Test-Path "${bJsonPath}") { Get-Content "${bJsonPath}" | Out-String } else { "" }`
			]).execute();

			const content = (result.stdout || "").trim();
			if (!content) {
				loadError.value = "b.json not found";
				console.warn("⚠️ TemplateExec: b.json not found");
				return;
			}

			const bJson = JSON.parse(content);
			console.log("✅ TemplateExec: Loaded b.json:", bJson);

			// Extract scripts from b.json
			const loadedScripts: Script[] = [];

			// Get scripts from setup.all (detected scripts)
			if (bJson.setup?.all?.scripts) {
				loadedScripts.push(...bJson.setup.all.scripts);
			}

			// Get OS-specific actions (use current OS)
			const osType = await detectCurrentOS();
			console.log("🖥️ TemplateExec: Current OS:", osType);

			if (bJson.setup?.[osType]?.actions) {
				const osActions = bJson.setup[osType].actions;
				osActions.forEach((action: any) => {
					// Check if this script isn't already in the list
					if (!loadedScripts.find(s => s.name === action.name)) {
						loadedScripts.push({
							name: action.name,
							command: action.command,
							category: action.category || "custom"
						});
					}
				});
			}

			scripts.value = loadedScripts;
			console.log(`✅ TemplateExec: Loaded ${scripts.value.length} scripts`);
			// Port detection is now handled by individual ScriptExecutor components
		} catch (error) {
			console.error("❌ TemplateExec: Error loading scripts:", error);
			loadError.value = error instanceof Error ? error.message : "Failed to load scripts";
		} finally {
			isLoading.value = false;
		}
	};

	// Detect current OS
	const detectCurrentOS = async (): Promise<'windows' | 'linux' | 'mac'> => {
		try {
			const { useTauriShellCommand } = await import("#imports");
			const result = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				"$PSVersionTable.Platform"
			]).execute();

			const platform = (result.stdout || "").trim().toLowerCase();
			
			if (platform.includes("win")) return "windows";
			if (platform.includes("unix") || platform.includes("linux")) return "linux";
			if (platform.includes("mac") || platform.includes("darwin")) return "mac";
			
			return "windows"; // Default
		} catch {
			return "windows"; // Default fallback
		}
	};

	// Open localhost in browser node (called from ScriptExecutor via browser-requested event)
	const openInBrowser = (script: Script) => {
		// This function kept for backward compatibility but ScriptExecutor emits browser-requested
		// which is already handled in the template
		console.log(`🌐 TemplateExec: Browser requested for ${script.name}`);
	};

	// Auto-load scripts on mount if already expanded
	onMounted(() => {
		if (isExpanded.value) {
			loadScripts();
		}
	});
</script>

<style scoped>
.template-exec {
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	overflow: visible;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	width: 100%;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	cursor: pointer;
	transition: all 0.2s;
	background: rgba(0, 0, 0, 0.1);
}

.section-header:hover {
	background: rgba(var(--color-primary-rgb), 0.1);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 6px;
}

.section-content {
	padding: 12px;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	flex-direction: column;
	animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.loading-state,
.error-state,
.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 20px;
	text-align: center;
}

.scripts-wrapper {
	display: flex;
	flex-direction: column;
	gap: 8px;
	position: relative;
}

.scripts-list-container {
	display: flex;
	flex-direction: column;
	gap: 6px;
	max-height: 600px;
	min-height: 200px;
	overflow-y: auto;
	overflow-x: hidden;
	padding-right: 6px;
	position: relative;
	cursor: default;
	user-select: none;
}

.scripts-list-container > * {
	flex-shrink: 0;
}

.scroll-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 6px;
	background: rgba(34, 197, 94, 0.05);
	border: 1px dashed rgba(34, 197, 94, 0.3);
	border-radius: 4px;
	margin-top: 4px;
}

.script-item {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	transition: all 0.2s;
}

.script-item:hover {
	background: rgba(0, 0, 0, 0.4);
	border-color: rgba(34, 197, 94, 0.3);
}

.script-item.running {
	border-color: rgba(34, 197, 94, 0.5);
	background: rgba(34, 197, 94, 0.05);
}

.script-item.dev-script {
	border-left: 3px solid rgba(99, 102, 241, 0.5);
	background: rgba(99, 102, 241, 0.03);
}

/* Script executor styles are now in ScriptExecutor.vue component */

.script-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.script-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: white;
	display: flex;
	align-items: center;
	gap: 6px;
}

.dev-badge {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 2px 6px;
	background: rgba(99, 102, 241, 0.2);
	border: 1px solid rgba(99, 102, 241, 0.4);
	border-radius: 8px;
	font-size: 0.625rem;
	font-weight: 700;
	color: rgb(99, 102, 241);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.script-command {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.5);
	font-family: monospace;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-top: 4px;
}

.port-input-section {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 8px;
	padding: 6px 8px;
	background: rgba(99, 102, 241, 0.05);
	border: 1px solid rgba(99, 102, 241, 0.2);
	border-radius: 4px;
}

.port-label {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.7);
	font-weight: 500;
	flex-shrink: 0;
}

.port-input {
	width: 70px;
	padding: 4px 8px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 4px;
	color: rgb(99, 102, 241);
	font-size: 0.75rem;
	font-weight: 700;
	font-family: monospace;
	text-align: center;
}

.port-input:focus {
	outline: none;
	border-color: rgb(99, 102, 241);
	box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.action-buttons {
	display: flex;
	flex-direction: column;
	gap: 6px;
	flex-shrink: 0;
}

.run-button,
.browser-button {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
	flex-shrink: 0;
}

.run-button {
	background: rgba(34, 197, 94, 0.15);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: #22c55e;
}

.run-button:hover:not(:disabled) {
	background: rgba(34, 197, 94, 0.25);
	border-color: rgba(34, 197, 94, 0.5);
	transform: scale(1.1);
}

.run-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.browser-button {
	background: rgba(99, 102, 241, 0.15);
	border: 1px solid rgba(99, 102, 241, 0.3);
	color: rgb(99, 102, 241);
}

.browser-button:hover:not(:disabled) {
	background: rgba(99, 102, 241, 0.25);
	border-color: rgba(99, 102, 241, 0.5);
	transform: scale(1.1);
}

.browser-button:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

/* Scrollbar - Always visible */
.scripts-list-container {
	scrollbar-width: thin;
	scrollbar-color: rgba(34, 197, 94, 0.5) rgba(0, 0, 0, 0.4);
}

.scripts-list-container::-webkit-scrollbar {
	width: 8px;
	background: transparent;
}

.scripts-list-container::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.4);
	border-radius: 4px;
	margin: 4px 0;
	border: 1px solid rgba(255, 255, 255, 0.05);
}

.scripts-list-container::-webkit-scrollbar-thumb {
	background: rgba(34, 197, 94, 0.5);
	border-radius: 4px;
	border: 2px solid rgba(34, 197, 94, 0.3);
	min-height: 40px;
}

.scripts-list-container::-webkit-scrollbar-thumb:hover {
	background: rgba(34, 197, 94, 0.7);
	border-color: rgba(34, 197, 94, 0.5);
}

.scripts-list-container::-webkit-scrollbar-thumb:active {
	background: rgba(34, 197, 94, 0.9);
}

/* Animations */
@keyframes pulse {
	0%, 100% {
		opacity: 1;
		box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
	}
	50% {
		opacity: 0.8;
		box-shadow: 0 6px 20px rgba(234, 179, 8, 0.5);
	}
}
</style>


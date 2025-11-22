<template>
	<div class="script-executor">
		<div class="script-header">
			<div class="script-name-section">
				<span class="script-name">{{ script.name }}</span>
				<span v-if="isDevScript" class="dev-badge">
					<UIcon name="i-lucide-globe" class="w-2 h-2" />
					Dev
				</span>
				<span v-else-if="isBuildScript" class="build-badge">
					<UIcon name="i-lucide-package" class="w-2 h-2" />
					Build
				</span>
			</div>
			<!-- Port Input for Dev Scripts -->
			<div v-if="isDevScript" class="port-input-inline" @click.stop>
				<UIcon name="i-lucide-network" class="w-3 h-3 text-cyan-400" />
				<input
					v-model="localPort"
					type="number"
					min="1"
					max="65535"
					class="port-input-compact"
					placeholder="3000"
					@mousedown.stop
					@focus.stop
				>
			</div>
		</div>

		<div class="action-buttons">
			<!-- Run Button -->
			<button
				v-if="!isRunning"
				class="run-button-main"
				:disabled="disabled"
				@click.stop="handleRun"
				@mousedown.stop
			>
				<UIcon name="i-lucide-play" class="w-4 h-4" />
				<span class="button-text">Run</span>
			</button>

			<!-- Stop Button (appears when running) -->
			<button
				v-else
				class="stop-button-main"
				@click.stop="handleStop"
				@mousedown.stop
			>
				<UIcon name="i-lucide-square" class="w-4 h-4" />
				<span class="button-text">Stop</span>
				<span class="runtime-badge">{{ runtime }}s</span>
			</button>

			<!-- Browser Button (for dev scripts) -->
			<button
				v-if="isDevScript"
				class="browser-button"
				:disabled="!localPort"
				title="Open in Browser Node"
				@click.stop="handleOpenBrowser"
				@mousedown.stop
			>
				<UIcon name="i-lucide-external-link" class="w-3 h-3" />
				<span class="text-xs">Browser</span>
			</button>

		</div>
	</div>
</template>

<script setup lang="ts">
	import type { BuildOutput } from "../composables/useBuildOutputDetection";
	import { useTauriShellCommand } from "#imports";
	import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import { useBuildOutputDetection } from "../composables/useBuildOutputDetection";
	import { useProcessManager } from "../composables/useProcessManager";

	interface Script {
		name: string
		command: string
		category?: string
	}

	interface Props {
		script: Script
		projectPath: string
		disabled?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		disabled: false
	});

	const emit = defineEmits<{
		running: [scriptName: string]
		stopped: [scriptName: string]
		"browser-requested": [url: string, scriptName: string]
		"build-output-detected": [buildOutput: BuildOutput, scriptName: string]
	}>();

	const processManager = useProcessManager();
	const { isBuildScript: detectBuildScript, scanBuildOutput } = useBuildOutputDetection();

	const localPort = ref<number>(3000);
	const currentProcessId = ref<string | null>(null);
	const runtime = ref(0);
	let runtimeInterval: NodeJS.Timeout | null = null;

	// Build output state

	const isDevScript = computed(() => {
		const name = props.script.name.toLowerCase();
		return name.includes("dev") || name.includes("serve") || name.includes("start");
	});

	const isBuildScript = computed(() => {
		return detectBuildScript(props.script.name, props.script.command);
	});

	const isRunning = computed(() => {
		return processManager.isScriptRunning(props.script.name);
	});

	// Extract port from script command
	const extractPortFromScript = () => {
		const command = props.script.command;

		// Check for explicit port flag
		const portMatch = command.match(/(?:--port|--PORT|--p|-p)\s+(\d+)/);
		if (portMatch && portMatch[1]) return Number.parseInt(portMatch[1], 10);

		// Check for localhost in command
		const localhostMatch = command.match(/localhost:(\d+)/);
		if (localhostMatch && localhostMatch[1]) return Number.parseInt(localhostMatch[1], 10);

		// Framework defaults
		if (command.includes("nuxt")) return 3000;
		if (command.includes("next")) return 3000;
		if (command.includes("vite")) return 5173;
		if (command.includes("vue-cli")) return 8080;
		if (command.includes("react-scripts")) return 3000;
		if (command.includes("ng serve")) return 4200;
		if (command.includes("gatsby")) return 8000;
		if (command.includes("webpack")) return 8080;

		return 3000; // Default
	};

	// Initialize port
	onMounted(() => {
		if (isDevScript.value) {
			localPort.value = extractPortFromScript();
		}
	});

	// Update runtime counter
	watch(isRunning, (running) => {
		if (running) {
			runtime.value = 0;
			runtimeInterval = setInterval(() => {
				runtime.value++;
			}, 1000);
		} else {
			if (runtimeInterval) {
				clearInterval(runtimeInterval);
				runtimeInterval = null;
			}
			runtime.value = 0;
		}
	});

	// Handle run script
	const handleRun = async () => {
		try {
			console.log(`▶️ Running script: ${props.script.name}`);
			console.log(`   Command: ${props.script.command}`);
			console.log(`   Project path: ${props.projectPath}`);

			emit("running", props.script.name);

			// Normalize path for Windows
			const normalizedPath = props.projectPath.replace(/\//g, "\\");

			// Escape command for PowerShell - use Start-Process to open EXTERNAL window
			const escapedCommand = props.script.command.replace(/"/g, "\"\"");
			const ps = `Start-Process powershell -WorkingDirectory '${normalizedPath.replace(/'/g, "''")}' -WindowStyle Normal -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-NoExit","-Command","${escapedCommand}"`;

			console.log(`🔧 PowerShell command: ${ps}`);

			// Execute to spawn external PowerShell window
			const execPwsh = useTauriShellCommand.create("exec-pwsh", ["-Command", ps]);
			await execPwsh.execute();

			console.log(`✅ External PowerShell window opened for ${props.script.name}`);

			// For external windows, we create a mock "child" to track in our manager
			// We can't actually kill it, but we can track that it was started
			const mockChild = {
				pid: Date.now(), // Use timestamp as pseudo-PID
				kill: async () => {
					console.log(`ℹ️ Note: External PowerShell windows must be closed manually`);
					console.log(`   The window for "${props.script.name}" was opened externally`);
					return Promise.resolve();
				}
			} as any;

			// Register with process manager (for tracking purposes)
			const processId = processManager.registerProcess(
				props.script.name,
				props.script.command,
				mockChild
			);

			currentProcessId.value = processId;

			console.log(`✅ Script ${props.script.name} is running in external PowerShell window`);
		} catch (error) {
			console.error(`❌ Error running script ${props.script.name}:`, error);
			emit("stopped", props.script.name);
		}
	};

	// Handle stop script
	const handleStop = async () => {
		if (currentProcessId.value) {
			console.log(`🛑 Marking script as stopped: ${props.script.name}`);
			console.log(`ℹ️ Note: External PowerShell window must be closed manually`);

			const stopped = await processManager.stopProcess(currentProcessId.value);
			if (stopped) {
				currentProcessId.value = null;
				emit("stopped", props.script.name);

				// If this was a build script, scan for build output after delay
				if (isBuildScript.value) {
					console.log("🔍 Build script stopped, scanning for output...");
					setTimeout(() => scanForBuildOutput(), 2000);
				}

				// Show info toast about manual close
				const { useToast } = await import("#ui/composables/useToast");
				const toast = useToast();
				toast.add({
					title: "Process Marked as Stopped",
					description: `Please close the PowerShell window for "${props.script.name}" manually`,
					color: "warning"
				});
			}
		}
	};

	// Scan for build output after build completes
	const scanForBuildOutput = async () => {
		if (!isBuildScript.value) return;

		console.log("🔍 Scanning for build output:", props.projectPath);

		try {
			const output = await scanBuildOutput(props.projectPath, props.script.command);

			if (output) {
				emit("build-output-detected", output, props.script.name);
				console.log("✅ Build output detected:", output);
				console.log("📊 Build output details:", {
					type: output.type,
					files: output.files,
					outputPath: output.outputPath
				});
			} else {
				console.warn("⚠️ No build output found");
			}
		} catch (error) {
			console.error("❌ Error scanning build output:", error);
		}
	};

	// Handle open browser
	const handleOpenBrowser = () => {
		const url = `http://localhost:${localPort.value}`;
		console.log(`🌐 Browser requested: ${url} for ${props.script.name}`);
		emit("browser-requested", url, props.script.name);
	};

	// Cleanup on unmount
	onBeforeUnmount(() => {
		if (currentProcessId.value) {
			console.log(`🧹 ScriptExecutor unmounting, stopping process: ${props.script.name}`);
			processManager.stopProcess(currentProcessId.value);
		}
	});
</script>

<style scoped>
.script-executor {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 10px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	transition: all 0.2s;
}

.script-executor:hover {
	background: rgba(0, 0, 0, 0.4);
	border-color: rgba(255, 255, 255, 0.15);
}

.script-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
}

.script-name-section {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
	min-width: 0;
}

.script-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: white;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.dev-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 2px 6px;
	background: rgba(99, 102, 241, 0.2);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 10px;
	font-size: 0.65rem;
	font-weight: 700;
	color: rgba(99, 102, 241, 1);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	white-space: nowrap;
}

.build-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 2px 6px;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 10px;
	font-size: 0.65rem;
	font-weight: 700;
	color: rgba(168, 85, 247, 1);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	white-space: nowrap;
}

.port-input-inline {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 8px;
	background: rgba(6, 182, 212, 0.1);
	border: 1px solid rgba(6, 182, 212, 0.3);
	border-radius: 6px;
	flex-shrink: 0;
}

.port-input-compact {
	width: 60px;
	padding: 3px 6px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(6, 182, 212, 0.3);
	border-radius: 4px;
	color: white;
	font-size: 0.75rem;
	font-family: monospace;
	text-align: center;
}

.port-input-compact:focus {
	outline: none;
	border-color: rgba(6, 182, 212, 0.6);
	box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
}

.action-buttons {
	display: flex;
	gap: 8px;
	flex-shrink: 0;
}

.run-button-main {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 10px 24px;
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.15));
	border: 2px solid rgba(34, 197, 94, 0.5);
	border-radius: 8px;
	color: rgba(34, 197, 94, 1);
	font-size: 0.875rem;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
	flex: 1;
}

.run-button-main:hover:not(:disabled) {
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.35), rgba(34, 197, 94, 0.25));
	border-color: rgba(34, 197, 94, 0.7);
	transform: translateY(-2px);
	box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
}

.run-button-main:active:not(:disabled) {
	transform: translateY(0);
}

.run-button-main:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.stop-button-main {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 10px 24px;
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.15));
	border: 2px solid rgba(239, 68, 68, 0.5);
	border-radius: 8px;
	color: rgba(239, 68, 68, 1);
	font-size: 0.875rem;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
	animation: pulse-red 1.5s infinite;
	flex: 1;
}

.stop-button-main:hover {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(239, 68, 68, 0.25));
	border-color: rgba(239, 68, 68, 0.7);
	transform: translateY(-2px);
	box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
}

.stop-button-main:active {
	transform: translateY(0);
}

.button-text {
	font-weight: 700;
	letter-spacing: 0.5px;
}

.runtime-badge {
	padding: 2px 6px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 8px;
	font-size: 0.7rem;
	font-family: monospace;
	color: rgba(239, 68, 68, 1);
}

.browser-button {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 14px;
	background: rgba(99, 102, 241, 0.15);
	border: 2px solid rgba(99, 102, 241, 0.4);
	border-radius: 8px;
	color: rgba(99, 102, 241, 1);
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}

.browser-button:hover:not(:disabled) {
	background: rgba(99, 102, 241, 0.25);
	border-color: rgba(99, 102, 241, 0.6);
	transform: translateY(-2px);
}

.browser-button:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

@keyframes pulse-red {
	0%, 100% {
		opacity: 1;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
	}
	50% {
		opacity: 0.85;
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
	}
}

</style>

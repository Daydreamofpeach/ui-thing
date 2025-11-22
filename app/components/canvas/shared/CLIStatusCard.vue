<template>
	<div class="cli-status-card">
		<div class="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-black/20">
			<div v-if="cliInstalled" class="flex items-center gap-2 text-green-400">
				<Icon name="i-heroicons-check-circle" class="w-5 h-5" />
				<span class="font-medium">Installed{{ cliVersion ? ` v${cliVersion}` : '' }}</span>
			</div>
			<div v-else class="flex items-center gap-2 text-orange-400">
				<Icon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
				<span class="font-medium">Not installed</span>
			</div>
			<div class="ml-auto flex gap-2">
				<button
					class="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm border border-primary/30 disabled:opacity-50 transition-all duration-200 hover:scale-105"
					:disabled="cliInstalling"
					@click="handleInstall"
				>
					<Icon name="i-lucide-download" class="w-4 h-4 inline mr-1" />
					{{ cliInstalling ? 'Installing...' : 'Install/Update' }}
				</button>
				<button
					class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm border border-white/20 disabled:opacity-50 transition-all duration-200 hover:scale-105"
					:disabled="cliChecking"
					@click="handleCheck"
				>
					<Icon name="i-lucide-refresh-cw" class="w-4 h-4 inline mr-1" />
					{{ cliChecking ? 'Checking...' : 'Recheck' }}
				</button>
			</div>
		</div>

		<!-- CLI Output -->
		<div v-if="cliOutput" class="cli-output mt-3">
			<div class="bg-black/30 text-green-400 p-3 rounded text-xs max-h-32 overflow-y-auto font-mono whitespace-pre-wrap border border-white/10">
				{{ cliOutput }}
			</div>
		</div>

		<!-- CLI Commands Preview -->
		<div v-if="cliInstalled && showCommands" class="cli-commands mt-3">
			<h4 class="font-medium text-white/80 mb-2 text-sm">
				Available Commands
			</h4>
			<div class="space-y-2">
				<div class="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs">
					<span class="text-white/70">Create Project</span>
					<code class="text-primary font-mono">buildit create</code>
				</div>
				<div class="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs">
					<span class="text-white/70">Setup Project</span>
					<code class="text-primary font-mono">buildit setup</code>
				</div>
				<div class="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs">
					<span class="text-white/70">Install Dependencies</span>
					<code class="text-primary font-mono">buildit install</code>
				</div>
				<div class="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs">
					<span class="text-white/70">Run Dev Server</span>
					<code class="text-primary font-mono">buildit dev</code>
				</div>
			</div>
		</div>

		<!-- Installation Instructions -->
		<div v-if="!cliInstalled && showInstallInfo" class="installation-info mt-3">
			<h4 class="font-medium text-white/80 mb-2 text-sm">
				Installation
			</h4>
			<div class="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
				<p class="text-orange-300 text-xs mb-2">
					The Buildit CLI will be installed globally using npm:
				</p>
				<code class="text-orange-200 font-mono text-xs bg-black/30 p-2 rounded block">
					npm install -g buildit-cli
				</code>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	// Auto-check on mount if enabled
	import { onMounted } from "vue";

	import { useBuilditCLI } from "../composables/useBuilditCLI";

	interface Props {
		showCommands?: boolean
		showInstallInfo?: boolean
		autoCheck?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		showCommands: true,
		showInstallInfo: true,
		autoCheck: true
	});

	const emit = defineEmits<{
		cliInstalled: [data: { success: boolean, output: string }]
		cliChecked: [data: { installed: boolean, version: string, output: string }]
		cliError: [data: { success: boolean, error: string, output: string }]
	}>();

	const {
		cliInstalled,
		cliVersion,
		cliChecking,
		cliInstalling,
		cliOutput,
		checkBuilditCli,
		installBuilditCli,
		initializeCLI
	} = useBuilditCLI();

	const handleCheck = async () => {
		try {
			const result = await checkBuilditCli();
			emit("cliChecked", result);
		} catch (error: any) {
			emit("cliError", {
				success: false,
				error: error.message,
				output: cliOutput.value
			});
		}
	};

	const handleInstall = async () => {
		try {
			const result = await installBuilditCli();
			emit("cliInstalled", result);
		} catch (error: any) {
			emit("cliError", {
				success: false,
				error: error.message,
				output: cliOutput.value
			});
		}
	};
	onMounted(() => {
		if (props.autoCheck && !cliInstalled.value) {
			initializeCLI();
		}
	});
</script>

<style scoped>
.cli-status-card {
	width: 100%;
}

.cli-output::-webkit-scrollbar {
	width: 6px;
}

.cli-output::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 3px;
}

.cli-output::-webkit-scrollbar-thumb {
	background: rgba(59, 130, 246, 0.5);
	border-radius: 3px;
}

.cli-output::-webkit-scrollbar-thumb:hover {
	background: rgba(59, 130, 246, 0.7);
}

/* Button hover effects */
button:hover:not(:disabled) {
	transform: translateY(-1px);
}

button:active:not(:disabled) {
	transform: translateY(0);
}
</style>

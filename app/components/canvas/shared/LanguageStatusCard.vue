<template>
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
</script>

<style scoped>
/* Add any specific styles for LanguageStatusCard here if needed */
</style>

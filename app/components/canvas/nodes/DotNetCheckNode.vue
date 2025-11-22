<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/languages/dotnet.svg"
		:title="_props.customNodeProps.data?.label || '.NET CHECK'"
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
		:node-class="dotnetCheckNodeClass"
		@close="handleClose"
	>
		<!-- Node Content -->
		<div class="node-content-wrapper">
			<LanguageStatusCard
				:config="dotnetConfig"
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
				dotnetInstalled?: boolean
				dotnetVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectDotnet",
		"installDotnet",
		"dotnetError",
		"close"
	]);

	// Use the .NET configuration from the language configs
	const dotnetConfig = languageConfigs.dotnet;

	// Get status from the language detection
	const { status } = useLanguageDetection(dotnetConfig);

	// Theme colors based on status
	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#512BD4";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(81, 43, 212, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return `Installed (${status.value.version})`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#512BD4";
	});

	const dotnetCheckNodeClass = computed(() => {
		return `dotnet-check-node ${status.value.installed ? 'dotnet-found' : ''}`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	// Event handlers for language actions
	const handleLanguageDetected = (data: any) => {
		emit("detectDotnet", data);
	};

	const handleLanguageInstalled = (data: any) => {
		emit("installDotnet", data);
	};

	const handleLanguageError = (data: any) => {
		emit("dotnetError", data);
	};
</script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

/* Animated border when .NET is found */
.dotnet-check-node.dotnet-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: dotnetPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes dotnetPulse {
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
</style>

<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/languages/rust.svg"
		:title="_props.customNodeProps.data?.label || 'RUST CHECK'"
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
		:node-class="rustCheckNodeClass"
		@close="handleClose"
	>
		<!-- Node Content -->
		<div class="node-content-wrapper">
			<LanguageStatusCard
				:config="rustConfig"
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
				rustInstalled?: boolean
				rustVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectRust",
		"installRust",
		"rustError",
		"close"
	]);

	// Use the Rust configuration from the language configs
	const rustConfig = languageConfigs.rust;

	// Get status from the language detection
	const { status } = useLanguageDetection(rustConfig);

	// Theme colors based on status
	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#CE412B";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(206, 65, 43, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return `Installed (${status.value.version})`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#CE412B";
	});

	const rustCheckNodeClass = computed(() => {
		return `rust-check-node ${status.value.installed ? 'rust-found' : ''}`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	// Event handlers for language actions
	const handleLanguageDetected = (data: any) => {
		emit("detectRust", data);
	};

	const handleLanguageInstalled = (data: any) => {
		emit("installRust", data);
	};

	const handleLanguageError = (data: any) => {
		emit("rustError", data);
	};
</script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

/* Animated border when Rust is found */
.rust-check-node.rust-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: rustPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes rustPulse {
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

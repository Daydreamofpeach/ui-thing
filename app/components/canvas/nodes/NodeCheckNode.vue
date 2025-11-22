<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/languages/nodejs.svg"
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
		return "#339933";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(51, 153, 51, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return `Installed (${status.value.version})`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#339933";
	});

	const nodeCheckNodeClass = computed(() => {
		return `node-check-node ${status.value.installed ? 'node-found' : ''}`;
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
</script>

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
</style>

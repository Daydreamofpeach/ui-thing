<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/apps/vscode.svg"
		:title="_props.customNodeProps.data?.label || 'VS CODE CHECK'"
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
		:node-class="vscodeCheckNodeClass"
		@close="handleClose"
	>
		<!-- Node Content -->
		<div class="node-content-wrapper">
			<AppStatusCard
				:config="vscodeConfig"
				:auto-check="true"
				:show-install-guide="false"
				@app-detected="handleAppDetected"
				@app-installed="handleAppInstalled"
				@app-error="handleAppError"
			/>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import AppStatusCard from "~/components/canvas/shared/AppStatusCard.vue";
	import { appConfigs, useAppDetection } from "../composables/useAppDetection";

	interface Props {
		customNodeProps: {
			id: string
			data: {
				label?: string
				vscodeInstalled?: boolean
				vscodeVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectVscode",
		"installVscode",
		"vscodeError",
		"close"
	]);

	// Use the VS Code configuration from the app configs
	const vscodeConfig = appConfigs.vscode;

	// Get status from the app detection
	const { status } = useAppDetection(vscodeConfig);

	// Theme colors based on status
	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#007ACC";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(0, 122, 204, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return `Installed (${status.value.version})`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#007ACC";
	});

	const vscodeCheckNodeClass = computed(() => {
		return `vscode-check-node ${status.value.installed ? 'vscode-found' : ''}`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	// Event handlers for app actions
	const handleAppDetected = (data: any) => {
		emit("detectVscode", data);
	};

	const handleAppInstalled = (data: any) => {
		emit("installVscode", data);
	};

	const handleAppError = (data: any) => {
		emit("vscodeError", data);
	};
</script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

/* Animated border when VS Code is found */
.vscode-check-node.vscode-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: vscodePulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes vscodePulse {
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


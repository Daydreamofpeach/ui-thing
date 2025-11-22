<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/apps/intellij.svg"
		:title="_props.customNodeProps.data?.label || 'INTELLIJ CHECK'"
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
		:node-class="intellijCheckNodeClass"
		@close="handleClose"
	>
		<div class="node-content-wrapper">
			<AppStatusCard
				:config="intellijConfig"
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
				intellijInstalled?: boolean
				intellijVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectIntellij",
		"installIntellij",
		"intellijError",
		"close"
	]);

	const intellijConfig = appConfigs.intellij;
	const { status } = useAppDetection(intellijConfig);

	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#A97BFF";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(169, 123, 255, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return `Installed (${status.value.version})`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#A97BFF";
	});

	const intellijCheckNodeClass = computed(() => {
		return `intellij-check-node ${status.value.installed ? 'intellij-found' : ''}`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	const handleAppDetected = (data: any) => {
		emit("detectIntellij", data);
	};

	const handleAppInstalled = (data: any) => {
		emit("installIntellij", data);
	};

	const handleAppError = (data: any) => {
		emit("intellijError", data);
	};
</script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

.intellij-check-node.intellij-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: intellijPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes intellijPulse {
	0%, 100% {
		border-color: rgba(34, 197, 94, 0.8);
		box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
	}
	50% {
		border-color: rgba(34, 197, 94, 1);
		box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
	}
}
</style>


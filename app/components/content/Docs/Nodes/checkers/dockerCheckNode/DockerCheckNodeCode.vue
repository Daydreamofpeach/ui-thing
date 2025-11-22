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
  const minimalDoc = "Docker checker node using AppStatusCard component and useAppDetection composable for reliable detection and installation support.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/apps/docker.svg"
		:title="_props.customNodeProps.data?.label || 'DOCKER CHECK'"
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
		:node-class="dockerCheckNodeClass"
		@close="handleClose"
	>
		<div class="node-content-wrapper">
			<AppStatusCard
				:config="dockerConfig"
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
				dockerInstalled?: boolean
				dockerVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectDocker",
		"installDocker",
		"dockerError",
		"close"
	]);

	const dockerConfig = appConfigs.docker;
	const { status } = useAppDetection(dockerConfig);

	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#2496ED";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(36, 150, 237, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return \`Installed (\${status.value.version})\`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#2496ED";
	});

	const dockerCheckNodeClass = computed(() => {
		return \`docker-check-node \${status.value.installed ? 'docker-found' : ''}\`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	const handleAppDetected = (data: any) => {
		emit("detectDocker", data);
	};

	const handleAppInstalled = (data: any) => {
		emit("installDocker", data);
	};

	const handleAppError = (data: any) => {
		emit("dockerError", data);
	};
<\/script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

.docker-check-node.docker-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: dockerPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes dockerPulse {
	0%, 100% {
		border-color: rgba(34, 197, 94, 0.8);
		box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
	}
	50% {
		border-color: rgba(34, 197, 94, 1);
		box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
	}
}
</style>`;

  const files: FileStructure[] = [
    {
      title: "DockerCheckNode.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/nodes/DockerCheckNode.vue",
      content: mainCode
    },
    {
      title: "AppStatusCard.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/shared/AppStatusCard.vue",
      content: "// See AppStatusCard component implementation"
    },
    {
      title: "useAppDetection.ts",
      icon: "vscode-icons:file-type-typescript-official",
      path: "components/canvas/composables/useAppDetection.ts",
      content: "// See useAppDetection composable implementation"
    }
  ];

  emit("code", mainCode);
  emit("files", files);
});
</script>


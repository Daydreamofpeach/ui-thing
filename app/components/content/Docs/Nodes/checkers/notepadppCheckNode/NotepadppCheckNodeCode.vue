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
  const minimalDoc = "Notepad++ checker node using AppStatusCard component and useAppDetection composable for reliable detection and installation support.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon-image="/icons/apps/notepadpp.svg"
		:title="_props.customNodeProps.data?.label || 'NOTEPAD++ CHECK'"
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
		:node-class="notepadppCheckNodeClass"
		@close="handleClose"
	>
		<div class="node-content-wrapper">
			<AppStatusCard
				:config="notepadppConfig"
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
				notepadppInstalled?: boolean
				notepadppVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectNotepadpp",
		"installNotepadpp",
		"notepadppError",
		"close"
	]);

	const notepadppConfig = appConfigs.notepadpp;
	const { status } = useAppDetection(notepadppConfig);

	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#90E59A";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(144, 229, 154, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return \`Installed (\${status.value.version})\`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#90E59A";
	});

	const notepadppCheckNodeClass = computed(() => {
		return \`notepadpp-check-node \${status.value.installed ? 'notepadpp-found' : ''}\`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	const handleAppDetected = (data: any) => {
		emit("detectNotepadpp", data);
	};

	const handleAppInstalled = (data: any) => {
		emit("installNotepadpp", data);
	};

	const handleAppError = (data: any) => {
		emit("notepadppError", data);
	};
<\/script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

.notepadpp-check-node.notepadpp-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: notepadppPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes notepadppPulse {
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
      title: "NotepadppCheckNode.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/nodes/NotepadppCheckNode.vue",
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


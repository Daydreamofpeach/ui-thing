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

const emit = defineEmits<{
  code: [code: string];
  documentation: [doc: string];
  files: [files: FileStructure[]];
}>();

interface FileStructure {
  title: string;
  icon?: string;
  openIcon?: string;
  path?: string;
  content?: string;
  children?: FileStructure[];
}

const props = defineProps<Props>();

onMounted(() => {
  const minimalDoc = "Java version checker node using BaseNodeTemplate, LanguageStatusCard component and useLanguageDetection composable for reliable detection and installation support.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
	<BaseNodeTemplate
		:custom-node-props="_props.customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-coffee"
		:title="_props.customNodeProps.data?.label || 'JAVA CHECK'"
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
		:node-class="javaCheckNodeClass"
		@close="handleClose"
	>
		<!-- Node Content -->
		<div class="node-content-wrapper">
			<LanguageStatusCard
				:config="javaConfig"
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
				javaInstalled?: boolean
				javaVersion?: string
			}
			selected?: boolean
		}
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}

	const _props = defineProps<Props>();

	const emit = defineEmits([
		"detectJava",
		"installJava",
		"javaError",
		"close"
	]);

	// Use the Java configuration from the language configs
	const javaConfig = languageConfigs.java;

	// Get status from the language detection
	const { status } = useLanguageDetection(javaConfig);

	// Theme colors based on status
	const themeColor = computed(() => {
		if (status.value.installed) return "#22c55e";
		return "#ef4444";
	});

	const borderColor = computed(() => {
		if (status.value.installed) return "rgba(34, 197, 94, 0.5)";
		return "rgba(239, 68, 68, 0.3)";
	});

	const statusLabel = computed(() => {
		if (status.value.loading) return "Checking...";
		if (status.value.installed) return \`Installed (\${status.value.version})\`;
		return "Not Installed";
	});

	const statusColor = computed(() => {
		if (status.value.loading) return "#f59e0b";
		if (status.value.installed) return "#22c55e";
		return "#ef4444";
	});

	const javaCheckNodeClass = computed(() => {
		return \`java-check-node \${status.value.installed ? 'java-found' : ''}\`;
	});

	const handleClose = () => {
		emit("close", _props.customNodeProps.id);
	};

	// Event handlers for language actions
	const handleLanguageDetected = (data: any) => {
		emit("detectJava", data);
	};

	const handleLanguageInstalled = (data: any) => {
		emit("installJava", data);
	};

	const handleLanguageError = (data: any) => {
		emit("javaError", data);
	};
<\/script>

<style scoped>
.node-content-wrapper {
	padding: 8px;
}

/* Animated border when Java is found */
.java-check-node.java-found :deep(.base-node-template) {
	border-color: rgba(34, 197, 94, 0.8);
	animation: javaPulse 2s ease-in-out infinite;
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

@keyframes javaPulse {
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
</style>`;

  const languageStatusCardCode = `// See NodeCheckNodeCode.vue for LanguageStatusCard.vue code`;
  const useLanguageDetectionCode = `// See NodeCheckNodeCode.vue for useLanguageDetection.ts code`;

  const files: FileStructure[] = [
    {
      title: "components",
      openIcon: "vscode-icons:default-folder-opened",
      icon: "vscode-icons:default-folder",
      children: [
        {
          title: "canvas",
          openIcon: "vscode-icons:default-folder-opened",
          icon: "vscode-icons:default-folder",
          children: [
            {
              title: "nodes",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "JavaCheckNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/JavaCheckNode.vue",
                  content: mainCode
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "LanguageStatusCard.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/shared/LanguageStatusCard.vue",
                      content: languageStatusCardCode
                    }
                  ]
                }
              ]
            },
            {
              title: "composables",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "useLanguageDetection.ts",
                  icon: "vscode-icons:file-type-typescript-official",
                  path: "components/canvas/composables/useLanguageDetection.ts",
                  content: useLanguageDetectionCode
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  emit("code", mainCode);
  emit("files", files);
});
</script>

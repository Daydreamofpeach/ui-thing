<template>
	<BaseNodeTemplate
		:custom-node-props="nodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-code"
		:theme-color="themeColor"
		:title="headerTitle"
		:show-default-header="true"
		:show-edit-button="false"
		:show-close-button="false"
		:collapsible="true"
		:default-collapsed="false"
		:show-resizer="true"
		:min-width="600"
		:min-height="520"
		:content-style="{ padding: '0' }"
	>
		<template #header-actions>
			<div class="header-actions">
				<div class="header-status">
					<div class="status-dot" />
					<span class="status-text">{{ connectionStatusLabel }}</span>
				</div>
				<button
					class="header-button refresh"
					type="button"
					title="Refresh code"
					@click.stop="refreshCode"
				>
					<Icon name="lucide:refresh-cw" class="w-4 h-4" />
				</button>
				<button
					class="header-button close"
					type="button"
					title="Close editor"
					@click.stop="closeEditor"
				>
					<Icon name="lucide:x" class="w-4 h-4" />
				</button>
			</div>
		</template>

		<div class="code-editor-node">
			<div class="code-info">
				<div class="file-info">
					<Icon name="lucide:file-text" class="info-icon" />
					<span class="file-name">{{ fileInfo.name }}</span>
					<span class="file-size">({{ fileInfo.size }} bytes)</span>
				</div>
				<div class="language-info">
					<Icon name="lucide:code-2" class="info-icon" />
					<span class="language-name">{{ fileInfo.language }}</span>
				</div>
			</div>

			<div class="code-editor-container">
				<MonacoEditor
					:model-value="codeContent"
					:language="fileInfo.language"
					:height="500"
					:readonly="false"
					theme="vs-dark"
					:options="editorOptions"
					@change="onCodeChange"
				/>
			</div>

			<div class="node-actions">
				<button
					class="action-button copy-button"
					type="button"
					title="Copy code"
					@click="copyCode"
				>
					<Icon name="lucide:copy" class="action-icon" />
				</button>
				<button
					class="action-button download-button"
					type="button"
					title="Download file"
					@click="downloadCode"
				>
					<Icon name="lucide:download" class="action-icon" />
				</button>
				<button
					class="action-button format-button"
					type="button"
					title="Format code"
					@click="formatCode"
				>
					<Icon name="lucide:wand-2" class="action-icon" />
				</button>
			</div>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BaseNodeTemplate from "../templates/BaseNodeTemplate.vue";
import MonacoEditor from "#ui/MonacoEditor.vue";

interface Props {
	customNodeProps: any
	updateNodeData?: (nodeId: string, key: string, value: any) => void
	codeContent: string
	fileName: string
	fileType: string
}

const props = withDefaults(defineProps<Props>(), {
	customNodeProps: undefined,
	updateNodeData: undefined,
	codeContent: "",
	fileName: "untitled",
	fileType: "plaintext"
});

const emit = defineEmits<{
	"code-changed": [content: string]
	"file-downloaded": [fileName: string, content: string]
	"close-editor": [nodeId: string]
	"refresh-code": [nodeId: string]
}>();

const nodeProps = computed(() => props.customNodeProps ?? { id: "", data: {} });

console.log("🔧 CodeEditorNode: Props received:", {
	codeContent: props.codeContent,
	fileName: props.fileName,
	fileType: props.fileType,
	codeContentLength: props.codeContent?.length || 0
});

const codeContent = ref(props.codeContent);

const themeColor = "var(--color-primary)";
const headerTitle = computed(() => nodeProps.value?.data?.label || props.fileName || "Code Editor");
const connectionStatusLabel = computed(() => nodeProps.value?.data?.connectionStatus || "Connected");

const fileInfo = computed(() => {
	const language = getLanguageFromExtension(props.fileType);
	return {
		name: props.fileName,
		language,
		size: new Blob([props.codeContent || ""]).size
	};
});

const editorOptions = computed(() => ({
	minimap: { enabled: true },
	scrollBeyondLastLine: false,
	wordWrap: "on",
	lineNumbers: "on",
	glyphMargin: false,
	folding: true,
	lineDecorationsWidth: 0,
	lineNumbersMinChars: 3,
	renderLineHighlight: "line",
	selectOnLineNumbers: true,
	roundedSelection: false,
	cursorStyle: "line",
	readOnly: false,
	automaticLayout: true,
	fontSize: 14,
	lineHeight: 21,
	padding: { top: 10, bottom: 10 }
}));

function getLanguageFromExtension(fileType: string | undefined | null): string {
	const normalized = typeof fileType === "string" ? fileType.trim() : "";
	if (!normalized) {
		return "plaintext";
	}

	const extension = normalized.toLowerCase();
	const languageMap: Record<string, string> = {
		js: "javascript",
		javascript: "javascript",
		ts: "typescript",
		typescript: "typescript",
		py: "python",
		python: "python",
		java: "java",
		cpp: "cpp",
		c: "c",
		php: "php",
		rb: "ruby",
		ruby: "ruby",
		go: "go",
		rust: "rust",
		swift: "swift",
		kt: "kotlin",
		kotlin: "kotlin",
		dart: "dart",
		scala: "scala",
		hs: "haskell",
		haskell: "haskell",
		lua: "lua",
		m: "matlab",
		matlab: "matlab",
		sh: "shell",
		bash: "shell",
		bat: "batch",
		batch: "batch",
		pl: "perl",
		perl: "perl",
		sql: "sql",
		tex: "latex",
		latex: "latex",
		json: "json",
		xml: "xml",
		yaml: "yaml",
		yml: "yaml",
		html: "html",
		css: "css",
		scss: "scss",
		less: "less",
		md: "markdown",
		markdown: "markdown",
		rtf: "rtf",
		txt: "plaintext",
		log: "plaintext"
	};

	return languageMap[extension] || "plaintext";
}

const onCodeChange = (newContent: string) => {
	codeContent.value = newContent;
	emit("code-changed", newContent);
};

const copyCode = async () => {
	try {
		await navigator.clipboard.writeText(codeContent.value);
		console.log("Code copied to clipboard");
	} catch (err) {
		console.error("Failed to copy code:", err);
	}
};

const downloadCode = () => {
	try {
		const blob = new Blob([codeContent.value], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = props.fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		emit("file-downloaded", props.fileName, codeContent.value);
	} catch (err) {
		console.error("Failed to download file:", err);
	}
};

const formatCode = () => {
	try {
		if (fileInfo.value.language === "json") {
			const parsed = JSON.parse(codeContent.value);
			codeContent.value = JSON.stringify(parsed, null, 2);
		}
	} catch (err) {
		console.error("Failed to format code:", err);
	}
};

const refreshCode = () => {
	console.log("🔄 Refreshing code editor");
	codeContent.value = props.codeContent;
	if (!nodeProps.value?.id) {
		console.warn("CodeEditorNode: Missing node id during refresh");
		return;
	}
	emit("refresh-code", nodeProps.value.id);
};

const closeEditor = () => {
	console.log("❌ Closing code editor");
	if (!nodeProps.value?.id) {
		console.warn("CodeEditorNode: Missing node id during close");
		return;
	}
	emit("close-editor", nodeProps.value.id);
};

watch(
	() => props.codeContent,
	(newContent) => {
		codeContent.value = newContent;
	}
);
</script>

<style scoped>
.code-editor-node {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem 1.25rem 1.25rem;
	background: rgba(15, 23, 42, 0.65);
	border-top: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0 0 0.75rem 0.75rem;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.header-status {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	border-radius: 999px;
	background: rgba(var(--color-primary-rgb), 0.12);
}

.status-dot {
	width: 0.45rem;
	height: 0.45rem;
	border-radius: 50%;
	background: var(--color-primary);
}

.status-text {
	font-size: 0.75rem;
	color: rgba(var(--color-primary-rgb), 0.75);
	text-transform: capitalize;
}

.header-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
}

.header-button.refresh:hover {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.35);
	color: var(--color-primary);
	transform: translateY(-1px);
}

.header-button.close:hover {
	background: rgba(239, 68, 68, 0.18);
	border-color: rgba(239, 68, 68, 0.35);
	color: rgb(248, 113, 113);
	transform: translateY(-1px);
}

.code-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 0.75rem;
	color: rgba(226, 232, 240, 0.85);
	gap: 1rem;
	flex-wrap: wrap;
}

.file-info,
.language-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.info-icon {
	width: 0.85rem;
	height: 0.85rem;
	color: rgba(148, 163, 184, 0.9);
}

.file-name,
.language-name {
	color: rgba(226, 232, 240, 0.9);
	font-weight: 500;
}

.file-size {
	color: rgba(148, 163, 184, 0.7);
}

.code-editor-container {
	flex: 1;
	min-height: 0;
	border-radius: 0.75rem;
	overflow: hidden;
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.node-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.action-button {
	padding: 0.5rem;
	border-radius: 0.5rem;
	background: rgba(15, 23, 42, 0.8);
	border: 1px solid rgba(148, 163, 184, 0.25);
	color: rgba(226, 232, 240, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-button:hover {
	color: rgba(255, 255, 255, 0.95);
	transform: translateY(-1px);
}

.copy-button:hover {
	background: rgba(59, 130, 246, 0.18);
	border-color: rgba(59, 130, 246, 0.4);
}

.download-button:hover {
	background: rgba(16, 185, 129, 0.2);
	border-color: rgba(16, 185, 129, 0.4);
}

.format-button:hover {
	background: rgba(168, 85, 247, 0.2);
	border-color: rgba(168, 85, 247, 0.4);
}

.action-icon {
	width: 0.9rem;
	height: 0.9rem;
}
</style>

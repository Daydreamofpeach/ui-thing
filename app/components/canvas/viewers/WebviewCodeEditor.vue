<template>
	<div class="webview-code-editor">
		<div class="editor-tabs">
			<button
				class="tab-button"
				:class="{ active: activeTab === 'webview' }"
				@click="activeTab = 'webview'"
			>
				<Icon name="lucide:globe" class="tab-icon" />
				Web Preview
			</button>
			<button
				class="tab-button"
				:class="{ active: activeTab === 'code' }"
				@click="activeTab = 'code'"
			>
				<Icon name="lucide:code" class="tab-icon" />
				HTML Code
			</button>
		</div>

		<div class="tab-content">
			<div v-if="activeTab === 'webview'" class="webview-tab">
				<div v-if="isGenerating" class="updating-indicator">
					<div class="spinner" />
					<span>Updating preview...</span>
				</div>
				<WebviewViewer
					:key="`webview-${htmlContent.length}`"
					:html-content="htmlContent"
					:file-name="fileName"
					:file-path="currentFilePath || undefined"
					@file-opened="handleFileOpened"
					@error="handleError"
				/>
			</div>

			<div v-if="activeTab === 'code'" class="code-tab">
				<MonacoEditor
					:model-value="htmlContent"
					language="html"
					:height="400"
					:readonly="false"
					theme="vs-dark"
					:options="editorOptions"
					@change="handleCodeChange"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import MonacoEditor from "#ui/MonacoEditor.vue";
	import { useFileGeneration } from "../composables/useFileGeneration";
	import WebviewViewer from "./WebviewViewer.vue";

	interface Props {
		htmlContent: string
		fileName: string
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"html-changed": [htmlContent: string]
		"file-opened": [fileName: string, filePath: string]
		error: [error: string]
	}>();

	const activeTab = ref<"webview" | "code">("webview");
	const htmlContent = ref(props.htmlContent);
	const currentFilePath = ref<string | null>(null);

	// File generation composable
	const { generateFile, isGenerating, error: fileError } = useFileGeneration();

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
		automaticLayout: true
	}));

	const handleCodeChange = async (newContent: string) => {
		console.log("WebviewCodeEditor: Code changed, updating HTML content");
		htmlContent.value = newContent;
		emit("html-changed", newContent);

		// Write the updated content to a file
		try {
			console.log("WebviewCodeEditor: Writing updated HTML to file...");
			const result = await generateFile({
				content: newContent,
				fileName: props.fileName,
				fileType: "html"
			});
			if (result) {
				currentFilePath.value = result.filePath;
				console.log("WebviewCodeEditor: File written successfully:", result.filePath);

				// Small delay to ensure file is fully written
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Emit file opened event with the new file path
				emit("file-opened", result.fileName, result.filePath);
			}
		} catch (error) {
			console.error("WebviewCodeEditor: Failed to write file:", error);
			emit("error", `Failed to write file: ${error}`);
		}
	};

	const handleFileOpened = (fileName: string, filePath: string) => {
		emit("file-opened", fileName, filePath);
	};

	const handleError = (error: string) => {
		emit("error", error);
	};

	// Watch for prop changes
	watch(() => props.htmlContent, (newContent) => {
		htmlContent.value = newContent;
	});

	// Watch for HTML content changes (no automatic tab switching for continuous editing)
	watch(() => htmlContent.value, (newContent, oldContent) => {
		if (newContent !== oldContent && newContent) {
			console.log("WebviewCodeEditor: HTML content changed, updating webview");
		// Don't switch tabs automatically - let user stay in code editor
		}
	});
</script>

<style scoped>
.webview-code-editor {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #111827;
	border-radius: 0.5rem;
	border: 1px solid #374151;
}

.editor-tabs {
	display: flex;
	border-bottom: 1px solid #374151;
	background: rgba(31, 41, 55, 0.5);
}

.tab-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: none;
	border: none;
	color: #9ca3af;
	cursor: pointer;
	transition: all 0.2s;
	border-bottom: 2px solid transparent;
}

.tab-button:hover {
	color: #d1d5db;
	background: rgba(55, 65, 81, 0.3);
}

.tab-button.active {
	color: #3b82f6;
	border-bottom-color: #3b82f6;
	background: rgba(59, 130, 246, 0.1);
}

.tab-icon {
	width: 1rem;
	height: 1rem;
}

.tab-content {
	flex: 1;
	position: relative;
}

.webview-tab,
.code-tab {
	width: 100%;
	height: 100%;
	position: relative;
}

.updating-indicator {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
	background: rgba(0, 0, 0, 0.8);
	color: white;
	padding: 0.5rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
}

.spinner {
	width: 1rem;
	height: 1rem;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top: 2px solid white;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>

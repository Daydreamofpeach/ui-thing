<template>
	<div class="data-display-section">
		<!-- View Type Selector -->
		<div v-if="showViewTypeSelector" class="view-type-selector">
			<label class="view-type-label">View Type</label>
			<select
				v-model="selectedViewType"
				class="view-type-select"
				@change="handleViewTypeChange(selectedViewType)"
			>
				<optgroup label="Data Formats">
					<option value="json">
						JSON
					</option>
					<option value="xml">
						XML
					</option>
					<option value="yaml">
						YAML
					</option>
					<option value="csv">
						CSV
					</option>
					<option value="tsv">
						TSV
					</option>
				</optgroup>
				<optgroup label="Text Formats">
					<option value="txt">
						Text
					</option>
					<option value="markdown">
						Markdown
					</option>
					<option value="html">
						HTML
					</option>
					<option value="rtf">
						RTF
					</option>
					<option value="log">
						Log
					</option>
				</optgroup>
				<optgroup label="Code Formats">
					<option value="js">
						JavaScript
					</option>
					<option value="ts">
						TypeScript
					</option>
					<option value="py">
						Python
					</option>
					<option value="java">
						Java
					</option>
					<option value="cpp">
						C++
					</option>
					<option value="c">
						C
					</option>
					<option value="php">
						PHP
					</option>
					<option value="rb">
						Ruby
					</option>
					<option value="go">
						Go
					</option>
					<option value="rust">
						Rust
					</option>
					<option value="swift">
						Swift
					</option>
					<option value="kotlin">
						Kotlin
					</option>
					<option value="dart">
						Dart
					</option>
					<option value="scala">
						Scala
					</option>
					<option value="haskell">
						Haskell
					</option>
					<option value="lua">
						Lua
					</option>
					<option value="matlab">
						MATLAB
					</option>
					<option value="sh">
						Bash
					</option>
					<option value="bat">
						Batch
					</option>
					<option value="pl">
						Perl
					</option>
					<option value="sql">
						SQL
					</option>
					<option value="latex">
						LaTeX
					</option>
				</optgroup>
				<optgroup label="Display Formats">
					<option value="table">
						Table
					</option>
					<option value="list">
						List
					</option>
					<option value="raw">
						Raw Text
					</option>
				</optgroup>
			</select>
		</div>

		<!-- File Generation Controls -->
		<div v-if="showFileGeneration" class="file-generation-controls">
			<div class="flex gap-2 items-end">
				<div class="flex-1">
					<label class="file-generation-label">File Name</label>
					<input
						v-model="fileName"
						type="text"
						:placeholder="generateFileName(selectedViewType)"
						class="file-name-input"
					>
				</div>
				<button
					:disabled="isGenerating"
					class="generate-file-button"
					@click="generateFile"
				>
					<Icon v-if="isGenerating" name="lucide:loader-2" class="w-3 h-3 animate-spin" />
					<Icon v-else name="lucide:download" class="w-3 h-3" />
					{{ isGenerating ? 'Generating...' : 'Generate File' }}
				</button>
			</div>
			<div v-if="error" class="error-message">
				{{ error }}
			</div>
		</div>

		<!-- Data Content -->
		<div class="data-content">
			<!-- JSON View -->
			<div v-if="selectedViewType === 'json'" class="code-view">
				<pre class="code-content">{{ formatAsJson(data) }}</pre>
			</div>

			<!-- XML View -->
			<div v-else-if="selectedViewType === 'xml'" class="code-view">
				<pre class="code-content">{{ formatAsXml(data) }}</pre>
			</div>

			<!-- YAML View -->
			<div v-else-if="selectedViewType === 'yaml'" class="code-view">
				<pre class="code-content">{{ formatAsYaml(data) }}</pre>
			</div>

			<!-- CSV View -->
			<div v-else-if="selectedViewType === 'csv'" class="code-view">
				<pre class="code-content">{{ formatAsCsv(data) }}</pre>
			</div>

			<!-- TSV View -->
			<div v-else-if="selectedViewType === 'tsv'" class="code-view">
				<pre class="code-content">{{ formatAsTsv(data) }}</pre>
			</div>

			<!-- Text View -->
			<div v-else-if="selectedViewType === 'txt'" class="code-view">
				<pre class="code-content">{{ formatAsText(data) }}</pre>
			</div>

			<!-- HTML View -->
			<div v-else-if="selectedViewType === 'html'" class="html-view">
				<div class="html-content" v-html="formatAsHtml(data)" />
			</div>

			<!-- Markdown View -->
			<div v-else-if="selectedViewType === 'markdown'" class="markdown-view">
				<div class="markdown-content" v-html="formatAsMarkdown(data)" />
			</div>

			<!-- RTF View -->
			<div v-else-if="selectedViewType === 'rtf'" class="code-view">
				<pre class="code-content">{{ formatAsRtf(data) }}</pre>
			</div>

			<!-- Log View -->
			<div v-else-if="selectedViewType === 'log'" class="code-view">
				<pre class="code-content">{{ formatAsText(data) }}</pre>
			</div>

			<!-- Code Views -->
			<div v-else-if="isCodeView(selectedViewType)" class="code-view">
				<pre class="code-content">{{ formatAsCode(data, selectedViewType) }}</pre>
			</div>

			<!-- Table View -->
			<div v-else-if="selectedViewType === 'table'" class="table-view">
				<div v-if="isTableData" class="table-container">
					<table class="data-table">
						<thead>
							<tr>
								<th v-for="header in tableHeaders" :key="header" class="table-header">
									{{ header }}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(row, index) in tableData" :key="index" class="table-row">
								<td v-for="header in tableHeaders" :key="header" class="table-cell">
									{{ formatCellValue(row[header]) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div v-else class="no-table-data">
					<Icon name="lucide:table" class="w-6 h-6 text-gray-400 mb-2" />
					<p class="text-sm text-gray-500">
						Data is not in table format
					</p>
				</div>
			</div>

			<!-- List View -->
			<div v-else-if="selectedViewType === 'list'" class="list-view">
				<div v-if="isListData" class="list-container">
					<div v-for="(item, index) in listData" :key="index" class="list-item">
						<span class="list-index">{{ index + 1 }}.</span>
						<span class="list-value">{{ formatListValue(item) }}</span>
					</div>
				</div>
				<div v-else class="no-list-data">
					<Icon name="lucide:list" class="w-6 h-6 text-gray-400 mb-2" />
					<p class="text-sm text-gray-500">
						Data is not in list format
					</p>
				</div>
			</div>

			<!-- Raw Text View -->
			<div v-else-if="selectedViewType === 'raw'" class="raw-view">
				<pre class="raw-content">{{ formatAsRaw(data) }}</pre>
			</div>

			<!-- No Data -->
			<div v-else class="no-data">
				<Icon name="lucide:file-x" class="w-6 h-6 text-gray-400 mb-2" />
				<p class="text-sm text-gray-500">
					No data to display
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { useFileGeneration } from "../composables/useFileGeneration";

	interface Props {
		data: any
		viewType?: string
		format?: string
		showViewTypeSelector?: boolean
		showFileGeneration?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		viewType: "json",
		format: "output",
		showViewTypeSelector: true,
		showFileGeneration: true
	});

	const emit = defineEmits<{
		"view-type-changed": [viewType: string]
		"file-generated": [fileName: string, filePath: string]
		"open-webview": [htmlContent: string, fileName: string]
		"open-code-editor": [codeContent: string, fileName: string, fileType: string]
	}>();

	const selectedViewType = ref(props.viewType);
	const fileName = ref("");

	// Generate file name based on data and view type
	const generateFileName = (viewType: string): string => {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const baseName = getBaseNameFromData();
		const extension = getFileExtension(viewType);
		return `${baseName}-${timestamp}.${extension}`;
	};

	// Get base name from data (repository name, etc.)
	const getBaseNameFromData = (): string => {
		if (props.data?.repository?.name) {
			return props.data.repository.name.replace(/[^\w-]/g, "-");
		}
		if (props.data?.name) {
			return props.data.name.replace(/[^\w-]/g, "-");
		}
		if (props.data?.title) {
			return props.data.title.replace(/[^\w-]/g, "-");
		}
		return "data";
	};

	// File generation
	const { generateFile: generateFileUtil, isGenerating, error, getFileExtension } = useFileGeneration();

	// Watch for prop changes
	watch(() => props.viewType, (newType) => {
		selectedViewType.value = newType;
	});

	// File generation
	const generateFile = async () => {
		if (!props.data) return;

		const finalFileName = fileName.value || generateFileName(selectedViewType.value);

		const result = await generateFileUtil({
			fileName: finalFileName,
			fileType: selectedViewType.value,
			content: props.data,
			baseDir: "Temp"
		});

		if (result) {
			emit("file-generated", result.fileName, result.filePath);
		}
	};

	// Handle different view types
	const handleViewTypeChange = (viewType: string) => {
		console.log("View type changed to:", viewType);
		selectedViewType.value = viewType;
		emit("view-type-changed", viewType);

		// ViewManager will handle node creation, just emit the change
		console.log("View type changed, ViewManager will handle node creation");
	};

	// Check if view type should use code editor
	const shouldUseCodeEditor = (viewType: string): boolean => {
		// HTML uses webview, PDF/CSV use traditional view, others use code editor
		const traditionalViewTypes = ["html", "pdf", "csv", "tsv"];
		const shouldUse = !traditionalViewTypes.includes(viewType.toLowerCase());
		console.log("Should use code editor for", viewType, ":", shouldUse);
		return shouldUse;
	};

	// These functions are now handled by ViewManager

	// Check if view type is a code format (deprecated - use shouldUseCodeEditor instead)
	const isCodeView = (viewType: string): boolean => {
		return shouldUseCodeEditor(viewType);
	};

	// Format as code based on language
	const formatAsCode = (data: any, language: string): string => {
		// For now, return a simple formatted version
		// In the future, this could use the same formatting functions from useFileGeneration
		return `// Generated ${language.toUpperCase()} file
// Data: ${new Date().toISOString()}

${JSON.stringify(data, null, 2)}`;
	};

	// JSON formatting
	const formatAsJson = (data: any) => {
		if (data == null) return "null";
		try {
			return JSON.stringify(data, null, 2);
		} catch (error) {
			return String(data);
		}
	};

	// XML formatting
	const formatAsXml = (data: any) => {
		if (typeof data === "object" && data !== null) {
			return `<?xml version="1.0" encoding="UTF-8"?>
<root>
${Object.entries(data).map(([key, value]) => `  <${key}>${value}</${key}>`).join("\n")}
</root>`;
		}
		return `<root>${data}</root>`;
	};

	// YAML formatting
	const formatAsYaml = (data: any) => {
		if (typeof data === "object" && data !== null) {
			return Object.entries(data).map(([key, value]) => `${key}: ${value}`).join("\n");
		}
		return `value: ${data}`;
	};

	// CSV formatting
	const formatAsCsv = (data: any) => {
		if (Array.isArray(data)) {
			if (data.length === 0) return "";
			const headers = Object.keys(data[0]);
			const csvRows = [headers.join(",")];
			data.forEach((row) => {
				csvRows.push(headers.map((header) => `"${row[header] || ""}"`).join(","));
			});
			return csvRows.join("\n");
		}
		return `value\n${data}`;
	};

	// TSV formatting
	const formatAsTsv = (data: any) => {
		if (Array.isArray(data)) {
			if (data.length === 0) return "";
			const headers = Object.keys(data[0]);
			const tsvRows = [headers.join("\t")];
			data.forEach((row) => {
				tsvRows.push(headers.map((header) => row[header] || "").join("\t"));
			});
			return tsvRows.join("\n");
		}
		return `value\n${data}`;
	};

	// Text formatting
	const formatAsText = (data: any) => {
		if (typeof data === "string") return data;
		return JSON.stringify(data, null, 2);
	};

	// HTML formatting
	const formatAsHtml = (data: any) => {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Data</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        pre { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Generated Data</h1>
    <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
	};

	// Markdown formatting (basic)
	const formatAsMarkdown = (data: any) => {
		if (data == null) return "";

		if (typeof data === "string") {
			// Basic markdown parsing
			return data
				.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
				.replace(/\*(.*?)\*/g, "<em>$1</em>")
				.replace(/`(.*?)`/g, "<code>$1</code>")
				.replace(/\n/g, "<br>");
		}

		return `# Generated Data

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Generated on: ${new Date().toISOString()}`;
	};

	// RTF formatting
	const formatAsRtf = (data: any) => {
		return `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 Generated Data:\\par
\\par
${JSON.stringify(data, null, 2)}
}`;
	};

	// Raw text formatting
	const formatAsRaw = (data: any) => {
		if (data == null) return "";
		if (typeof data === "string") return data;
		return String(data);
	};

	// Table data detection and formatting
	const isTableData = computed(() => {
		if (!Array.isArray(props.data)) return false;
		return props.data.length > 0 && typeof props.data[0] === "object";
	});

	const tableHeaders = computed(() => {
		if (!isTableData.value) return [];
		return Object.keys(props.data[0] || {});
	});

	const tableData = computed(() => {
		return props.data || [];
	});

	// List data detection and formatting
	const isListData = computed(() => {
		return Array.isArray(props.data);
	});

	const listData = computed(() => {
		return props.data || [];
	});

	const formatCellValue = (value: any) => {
		if (value == null) return "";
		if (typeof value === "object") return JSON.stringify(value);
		return String(value);
	};

	const formatListValue = (value: any) => {
		if (value == null) return "";
		if (typeof value === "object") return JSON.stringify(value, null, 2);
		return String(value);
	};
</script>

<style scoped>
.data-display-section {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: rgba(0, 0, 0, 0.8);
	border-radius: 0.5rem;
	padding: 0.75rem;
}

.view-type-selector {
	margin-bottom: 0.75rem;
}

.view-type-label {
	display: block;
	font-size: 0.75rem;
	font-weight: 500;
	color: #9ca3af;
	margin-bottom: 0.25rem;
}

.view-type-select {
	width: 100%;
	padding: 0.5rem;
	font-size: 0.75rem;
	background-color: rgba(31, 41, 55, 0.8);
	border: 1px solid rgba(75, 85, 99, 0.3);
	border-radius: 0.375rem;
	color: #d1d5db;
	outline: none;
	transition: all 0.2s;
}

.view-type-select:focus {
	border-color: rgba(59, 130, 246, 0.5);
	box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.view-type-select option {
	background-color: #1f2937;
	color: #d1d5db;
}

.file-generation-controls {
	margin-bottom: 0.75rem;
	padding: 0.75rem;
	background-color: rgba(31, 41, 55, 0.5);
	border: 1px solid rgba(75, 85, 99, 0.3);
	border-radius: 0.375rem;
}

.file-generation-label {
	display: block;
	font-size: 0.75rem;
	font-weight: 500;
	color: #9ca3af;
	margin-bottom: 0.25rem;
}

.file-name-input {
	width: 100%;
	padding: 0.5rem;
	font-size: 0.75rem;
	background-color: rgba(31, 41, 55, 0.8);
	border: 1px solid rgba(75, 85, 99, 0.3);
	border-radius: 0.375rem;
	color: #d1d5db;
	outline: none;
	transition: all 0.2s;
}

.file-name-input:focus {
	border-color: rgba(59, 130, 246, 0.5);
	box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.file-name-input::placeholder {
	color: #6b7280;
}

.generate-file-button {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.5rem 0.75rem;
	font-size: 0.75rem;
	background-color: rgba(59, 130, 246, 0.8);
	color: white;
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
	transition: all 0.2s;
}

.generate-file-button:hover:not(:disabled) {
	background-color: rgba(59, 130, 246, 1);
}

.generate-file-button:disabled {
	background-color: rgba(75, 85, 99, 0.5);
	cursor: not-allowed;
	opacity: 0.6;
}

.error-message {
	font-size: 0.75rem;
	color: #f87171;
	margin-top: 0.25rem;
}

.data-content {
	flex: 1;
	overflow: auto;
}

/* Code Views (JSON, XML, YAML, CSV, TSV, Text, RTF, Log, Code) */
.code-view {
	overflow: auto;
	max-height: 24rem;
}

.code-content {
	font-size: 0.75rem;
	font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
	background-color: rgba(31, 41, 55, 0.8);
	padding: 0.75rem;
	border-radius: 0.375rem;
	border: 1px solid rgba(75, 85, 99, 0.3);
	overflow: auto;
	max-height: 24rem;
	white-space: pre-wrap;
	word-break: break-word;
	color: #d1d5db;
}

/* HTML View */
.html-view {
	overflow: auto;
	max-height: 24rem;
}

.html-content {
	font-size: 0.75rem;
	background-color: rgba(31, 41, 55, 0.8);
	padding: 0.75rem;
	border-radius: 0.375rem;
	border: 1px solid rgba(75, 85, 99, 0.3);
	overflow: auto;
	max-height: 24rem;
	color: #d1d5db;
}

/* Table View */
.table-container {
	overflow: auto;
	max-height: 24rem;
}

.data-table {
	width: 100%;
	font-size: 0.75rem;
	border-collapse: collapse;
}

.table-header {
	background-color: rgba(55, 65, 81, 0.5);
	padding: 0.25rem 0.5rem;
	text-align: left;
	font-weight: 500;
	color: #d1d5db;
	border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.table-row {
	border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.table-row:hover {
	background-color: rgba(55, 65, 81, 0.3);
}

.table-cell {
	padding: 0.25rem 0.5rem;
	color: #9ca3af;
}

.no-table-data,
.no-list-data,
.no-data {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 8rem;
	text-align: center;
}

/* List View */
.list-container {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	max-height: 24rem;
	overflow: auto;
}

.list-item {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	font-size: 0.75rem;
}

.list-index {
	font-weight: 500;
	color: #6b7280;
	min-width: 20px;
}

.list-value {
	color: #374151;
	font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

/* Raw View */
.raw-content {
	font-size: 0.75rem;
	font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
	background-color: #f9fafb;
	padding: 0.75rem;
	border-radius: 0.375rem;
	border: 1px solid #e5e7eb;
	overflow: auto;
	max-height: 24rem;
	white-space: pre-wrap;
	word-break: break-word;
}

/* Markdown View */
.markdown-content {
	font-size: 0.75rem;
	max-width: none;
	overflow: auto;
	max-height: 24rem;
}

.markdown-content :deep(code) {
	background-color: #f3f4f6;
	padding: 0.125rem 0.25rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
}

.markdown-content :deep(strong) {
	font-weight: 600;
}

.markdown-content :deep(em) {
	font-style: italic;
}
</style>

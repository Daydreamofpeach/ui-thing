<template>
	<div class="view-manager">
		<DataDisplaySection
			:data="data"
			:view-type="viewType"
			:format="format"
			:show-view-type-selector="true"
			:show-file-generation="true"
			@view-type-changed="handleViewTypeChange"
			@file-generated="handleFileGenerated"
			@open-webview="handleOpenWebview"
			@open-code-editor="handleOpenCodeEditor"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataDisplaySection from '../viewers/DataDisplaySection.vue';

interface Props {
	data: any;
	viewType?: string;
	format?: string;
}

const props = withDefaults(defineProps<Props>(), {
	viewType: 'json',
	format: 'output'
});

const emit = defineEmits<{
	'view-type-changed': [viewType: string];
	'file-generated': [fileName: string, filePath: string];
	'create-webview': [htmlContent: string, fileName: string];
	'create-code-editor': [codeContent: string, fileName: string, fileType: string];
}>();

const selectedViewType = ref(props.viewType);

const handleViewTypeChange = (viewType: string) => {
	console.log('ViewManager: View type changed to:', viewType);
	selectedViewType.value = viewType;
	emit('view-type-changed', viewType);
	
	// Create appropriate viewer based on file type
	if (shouldUseWebview(viewType)) {
		createWebviewOnly();
	} else if (shouldUseCodeEditor(viewType)) {
		createCodeEditorOnly();
	} else {
		// For formats like PDF, CSV, TSV - create code editor as fallback
		createCodeEditorOnly();
	}
};

const shouldUseCodeEditor = (viewType: string): boolean => {
	// Formats that should use code editor (not webview)
	const codeEditorTypes = [
		'json', 'xml', 'yaml', 'txt', 'markdown', 'rtf', 'log',
		'js', 'ts', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 
		'rust', 'swift', 'kotlin', 'dart', 'scala', 'haskell', 
		'lua', 'matlab', 'sh', 'bat', 'pl', 'sql', 'latex'
	];
	return codeEditorTypes.includes(viewType.toLowerCase());
};

const shouldUseWebview = (viewType: string): boolean => {
	// Formats that should use webview (HTML and web-friendly formats)
	const webviewTypes = ['html', 'markdown'];
	return webviewTypes.includes(viewType.toLowerCase());
};

const createWebviewOnly = () => {
	if (!props.data) return;
	
	console.log('ViewManager: Creating webview for web-friendly format');
	
	// Create webview for HTML and other web-friendly formats
	let htmlContent: string;
	let fileName: string;
	
	if (selectedViewType.value === 'markdown') {
		htmlContent = formatAsMarkdown(props.data);
		fileName = generateFileName('markdown');
	} else {
		htmlContent = formatAsHtml(props.data);
		fileName = generateFileName('html');
	}
	
	emit('create-webview', htmlContent, fileName);
};

const createCodeEditorOnly = () => {
	if (!props.data) return;
	
	console.log('ViewManager: Creating code editor only');
	
	// Format content based on the selected view type
	let codeContent: string;
	let fileName: string;
	const viewType = selectedViewType.value;
	
	switch (viewType.toLowerCase()) {
		case 'json':
			codeContent = JSON.stringify(props.data, null, 2);
			break;
		case 'xml':
			codeContent = formatAsXml(props.data);
			break;
		case 'yaml':
			codeContent = formatAsYaml(props.data);
			break;
		case 'csv':
			codeContent = formatAsCsv(props.data);
			break;
		case 'tsv':
			codeContent = formatAsTsv(props.data);
			break;
		case 'markdown':
			codeContent = formatAsMarkdownText(props.data);
			break;
		default:
			codeContent = formatAsCode(props.data, viewType);
	}
	
	fileName = generateFileName(viewType);
	emit('create-code-editor', codeContent, fileName, viewType);
};

const handleFileGenerated = (fileName: string, filePath: string) => {
	emit('file-generated', fileName, filePath);
};

const handleOpenWebview = (htmlContent: string, fileName: string) => {
	emit('create-webview', htmlContent, fileName);
};

const handleOpenCodeEditor = (codeContent: string, fileName: string, fileType: string) => {
	emit('create-code-editor', codeContent, fileName, fileType);
};

// Utility functions
const generateFileName = (viewType: string): string => {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const baseName = getBaseNameFromData();
	const extension = getFileExtension(viewType);
	return `${baseName}-${timestamp}.${extension}`;
};

const getBaseNameFromData = (): string => {
	if (props.data?.repository?.name) {
		return props.data.repository.name.replace(/[^a-zA-Z0-9-_]/g, '-');
	}
	if (props.data?.name) {
		return props.data.name.replace(/[^a-zA-Z0-9-_]/g, '-');
	}
	if (props.data?.title) {
		return props.data.title.replace(/[^a-zA-Z0-9-_]/g, '-');
	}
	return 'data';
};

const getFileExtension = (fileType: string): string => {
	const type = fileType.toLowerCase();
	const extensions: Record<string, string> = {
		'javascript': 'js',
		'typescript': 'ts',
		'python': 'py',
		'ruby': 'rb',
		'perl': 'pl',
		'bash': 'sh',
		'batch': 'bat',
		'matlab': 'm',
		'latex': 'tex',
		'jupyter': 'ipynb',
		'notebook': 'ipynb'
	};
	return extensions[type] || type;
};

const formatAsHtml = (data: any): string => {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Data</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
        pre { background: #2d2d2d; padding: 20px; border-radius: 5px; border: 1px solid #444; }
        h1 { color: #60a5fa; }
    </style>
</head>
<body>
    <h1>Generated Data</h1>
    <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
};

const formatAsMarkdown = (data: any): string => {
	const jsonData = JSON.stringify(data, null, 2);
	const timestamp = new Date().toISOString();
	
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Data - Markdown</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-dark.min.css">
    <style>
        body { 
            background: #0d1117; 
            color: #c9d1d9; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        .markdown-body { 
            max-width: 980px; 
            margin: 0 auto; 
            padding: 45px; 
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        <div class="markdown-content">
            <h1>Generated Data</h1>
            <pre><code class="language-json">${jsonData}</code></pre>
            <p>Generated on: ${timestamp}</p>
        </div>
    </div>
</body>
</html>`;
};

const formatAsCode = (data: any, language: string): string => {
	return `// Generated ${language.toUpperCase()} file
// Data: ${new Date().toISOString()}

${JSON.stringify(data, null, 2)}`;
};

const formatAsXml = (data: any): string => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
${JSON.stringify(data, null, 2).split('\n').map(line => `  <item>${line}</item>`).join('\n')}
</data>`;
	return xml;
};

const formatAsYaml = (data: any): string => {
	// Simple YAML formatting
	return `# Generated YAML file
# Data: ${new Date().toISOString()}

data: ${JSON.stringify(data, null, 2).replace(/^/gm, '  ')}`;
};

const formatAsCsv = (data: any): string => {
	if (Array.isArray(data)) {
		const headers = Object.keys(data[0] || {});
		const csvRows = [headers.join(',')];
		data.forEach(row => {
			const values = headers.map(header => `"${row[header] || ''}"`);
			csvRows.push(values.join(','));
		});
		return csvRows.join('\n');
	}
	return `key,value\n"data","${JSON.stringify(data).replace(/"/g, '""')}"`;
};

const formatAsTsv = (data: any): string => {
	if (Array.isArray(data)) {
		const headers = Object.keys(data[0] || {});
		const tsvRows = [headers.join('\t')];
		data.forEach(row => {
			const values = headers.map(header => row[header] || '');
			tsvRows.push(values.join('\t'));
		});
		return tsvRows.join('\n');
	}
	return `key\tvalue\ndata\t${JSON.stringify(data)}`;
};

const formatAsMarkdownText = (data: any): string => {
	return `# Generated Data

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Generated on: ${new Date().toISOString()}
`;
};
</script>

<style scoped>
.view-manager {
	width: 100%;
	height: 100%;
}
</style>

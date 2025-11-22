<!-- Copied from client/app/components/Automate/CodeArtifactsModal.vue -->
<template>
	<Teleport to="body">
		<div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center">
			<div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
			<div class="relative w-full max-w-7xl mx-4 h-[90vh]">
				<div class="glassmorphic-panel h-full border border-primary/20 border-bottom-3-outset space-y-5 bg-black/90 backdrop-blur-md rounded-xl flex flex-col">
					<div class="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
						<div class="flex items-center gap-3">
							<Icon name="i-heroicons-code-bracket" class="w-6 h-6 text-primary" />
							<h3 class="text-xl font-semibold text-white/90">
								{{ title || 'Code Artifacts' }}
							</h3>
						</div>
						<div class="flex items-center gap-2">
							<button class="glassmorphic-button px-3 py-1.5 text-xs border border-primary/30 text-white hover:bg-primary/20" @click="copyAllCode">
								<Icon :name="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'" class="w-4 h-4 mr-1" />
								{{ copied ? 'Copied' : 'Copy All' }}
							</button>
							<button class="glassmorphic-button px-3 py-1.5 text-xs border border-primary/30 text-white hover:bg-primary/20" @click="downloadAllCode">
								<Icon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
								Download All
							</button>
							<button class="glassmorphic-button p-2 text-white/60 hover:text-white border border-primary/20" title="Close modal" @click="$emit('close')">
								<Icon name="i-heroicons-x-mark" class="w-5 h-5" />
							</button>
						</div>
					</div>

					<div class="flex items-center gap-1 px-6 flex-shrink-0">
						<button
							v-for="tab in availableTabs"
							:key="tab.id"
							class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border"
							:class="activeTab === tab.id ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'"
							@click="activeTab = tab.id"
						>
							<Icon :name="tab.icon" class="w-4 h-4 inline mr-2" />
							{{ tab.label }}
						</button>
					</div>

					<div class="flex-1 px-6 pb-6 min-h-0">
						<div class="h-full rounded-lg overflow-hidden border border-white/10">
							<div ref="editorContainer" class="w-full h-full" :data-language="getLanguageForTab(activeTab)"></div>
						</div>
					</div>

					<div class="flex items-center justify-between p-6 border-t border-white/10 flex-shrink-0">
						<div class="text-xs text-white/50">{{ getCurrentTabInfo() }}</div>
						<div class="flex items-center gap-2">
							<button class="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all duration-200 text-sm font-medium border border-primary/30" @click="saveChanges">
								<Icon name="i-heroicons-check" class="w-4 h-4 mr-2" />
								Save Changes
							</button>
							<button class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-all duration-200 text-sm font-medium border border-white/20" @click="resetToOriginal">
								<Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
								Reset
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as monaco from 'monaco-editor';

interface Props {
	isOpen: boolean;
	form: any;
	title?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: []; update: [form: any] }>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const activeTab = ref('html');
const copied = ref(false);

const availableTabs = computed(() => {
	const tabs: any[] = [];
	if (props.form?.html) tabs.push({ id: 'html', label: 'HTML', icon: 'i-lucide-file-code' });
	if (props.form?.css) tabs.push({ id: 'css', label: 'CSS', icon: 'i-lucide-palette' });
	if (props.form?.json) tabs.push({ id: 'json', label: 'JSON Schema', icon: 'i-lucide-database' });
	return tabs;
});

const getLanguageForTab = (tabId: string) => {
	switch (tabId) {
		case 'html': return 'html';
		case 'css': return 'css';
		case 'json': return 'json';
		default: return 'plaintext';
	}
};

const getCurrentTabContent = () => {
	switch (activeTab.value) {
		case 'html': return props.form?.html || '';
		case 'css': return props.form?.css || '';
		case 'json': return props.form?.json ? JSON.stringify(props.form.json, null, 2) : '';
		default: return '';
	}
};

const getCurrentTabInfo = () => {
	const content = getCurrentTabContent();
	const lines = content.split('\\n').length;
	const chars = content.length;
	return `${activeTab.value.toUpperCase()} • ${lines} lines • ${chars} characters`;
};

const initEditor = async () => {
	if (!editorContainer.value) return;
	editor = monaco.editor.create(editorContainer.value, {
		value: getCurrentTabContent(),
		language: getLanguageForTab(activeTab.value),
		theme: 'vs-dark',
		automaticLayout: true,
		minimap: { enabled: true },
		scrollBeyondLastLine: false,
		fontSize: 14,
		fontFamily: 'Monaco, Menlo, \"Ubuntu Mono\", monospace',
		wordWrap: 'on',
		lineNumbers: 'on',
		glyphMargin: true,
		folding: true,
		lineDecorationsWidth: 20,
		lineNumbersMinChars: 3,
		renderLineHighlight: 'all'
	});
	watch(activeTab, async (newTab) => {
		if (editor) {
			const content = getCurrentTabContent();
			editor.setValue(content);
			monaco.editor.setModelLanguage(editor.getModel()!, getLanguageForTab(newTab));
		}
	});
};

const copyAllCode = async () => {
	try {
		const allCode = {
			html: props.form?.html || '',
			css: props.form?.css || '',
			json: props.form?.json ? JSON.stringify(props.form.json, null, 2) : ''
		};
		const codeText = `<!-- HTML -->\\n${allCode.html}\\n\\n<!-- CSS -->\\n${allCode.css}\\n\\n<!-- JSON Schema -->\\n${allCode.json}`;
		await navigator.clipboard.writeText(codeText);
		copied.value = true;
		setTimeout(() => (copied.value = false), 2000);
	} catch (error) {
		console.error('Failed to copy code:', error);
	}
};

const downloadAllCode = () => {
	const allCode = {
		html: props.form?.html || '',
		css: props.form?.css || '',
		json: props.form?.json ? JSON.stringify(props.form.json, null, 2) : ''
	};
	if (allCode.html) {
		const htmlBlob = new Blob([allCode.html], { type: 'text/html' });
		const htmlUrl = URL.createObjectURL(htmlBlob);
		const htmlLink = document.createElement('a');
		htmlLink.href = htmlUrl;
		htmlLink.download = `${props.form?.title || 'form'}.html`;
		htmlLink.click();
		URL.revokeObjectURL(htmlUrl);
	}
	if (allCode.css) {
		const cssBlob = new Blob([allCode.css], { type: 'text/css' });
		const cssUrl = URL.createObjectURL(cssBlob);
		const cssLink = document.createElement('a');
		cssLink.href = cssUrl;
		cssLink.download = `${props.form?.title || 'form'}.css`;
		cssLink.click();
		URL.revokeObjectURL(cssUrl);
	}
	if (allCode.json) {
		const jsonBlob = new Blob([allCode.json], { type: 'application/json' });
		const jsonUrl = URL.createObjectURL(jsonBlob);
		const jsonLink = document.createElement('a');
		jsonLink.href = jsonUrl;
		jsonLink.download = `${props.form?.title || 'form'}.json`;
		jsonLink.click();
		URL.revokeObjectURL(jsonUrl);
	}
};

const saveChanges = () => {
	if (!editor) return;
	const newContent = editor.getValue();
	switch (activeTab.value) {
		case 'html': props.form.html = newContent; break;
		case 'css': props.form.css = newContent; break;
		case 'json': try { props.form.json = JSON.parse(newContent); } catch (error) { console.error('Invalid JSON:', error); return; } break;
	}
	emit('update', props.form);
};

const resetToOriginal = () => { if (editor) editor.setValue(getCurrentTabContent()); };

onUnmounted(() => { if (editor) { editor.dispose(); editor = null; } });
watch(() => props.isOpen, async (isOpen) => { if (isOpen) { await nextTick(); initEditor(); } else if (editor) { editor.dispose(); editor = null; } });
</script>

<style scoped>
.glassmorphic-panel { background: rgba(var(--color-neutral-rgb), 0.05); backdrop-filter: blur(15px) saturate(1.2); border: 1px solid rgba(var(--color-neutral-rgb), 0.08); transition: all 0.3s ease; }
.glassmorphic-button { background: rgba(var(--color-neutral-rgb), 0.1); backdrop-filter: blur(10px); border-radius: 0.375rem; transition: all 0.2s ease; cursor: pointer; }
.glassmorphic-button:hover { background: rgba(var(--color-neutral-rgb), 0.2); transform: translateY(-1px); }
:deep(.monaco-editor) { border-radius: 0.5rem; }
:deep(.monaco-editor .margin) { background-color: rgba(0, 0, 0, 0.3) !important; }
:deep(.monaco-editor .monaco-editor-background) { background-color: rgba(0, 0, 0, 0.5) !important; }
</style>


<!-- Copied from client/app/components/codeTransmute/CodeTransmuteModal.vue -->
<template>
	<Teleport to="body">
		<div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center">
			<div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
			<div class="relative w-full max-w-7xl mx-4 h-[90vh]">
				<div class="glassmorphic-panel h-full border border-primary/20 border-bottom-3-outset space-y-5 bg-black/90 backdrop-blur-md rounded-xl flex flex-col">
					<!-- Header -->
					<div class="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
						<div class="flex items-center gap-3">
							<Icon name="i-heroicons-code-bracket" class="w-6 h-6 text-primary" />
							<h3 class="text-xl font-semibold text-white/90">
								{{ title || 'Code Transmutation' }}
							</h3>
						</div>
						<div class="flex items-center gap-2">
							<button class="glassmorphic-button px-3 py-1.5 text-xs border border-primary/30 text-white hover:bg-primary/20" @click="copyCode">
								<Icon :name="copied ? 'i-heroicons-check' : 'i-lucide-copy'" class="w-4 h-4 mr-1" />
								{{ copied ? 'Copied' : 'Copy Code' }}
							</button>
							<button class="glassmorphic-button px-3 py-1.5 text-xs border border-primary/30 text-white hover:bg-primary/20" @click="downloadCode">
								<Icon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
								Download
							</button>
							<button class="glassmorphic-button p-2 text-white/60 hover:text-white border border-primary/20" title="Close modal" @click="$emit('close')">
								<Icon name="i-heroicons-x-mark" class="w-5 h-5" />
							</button>
						</div>
					</div>

					<!-- Transmutation Options -->
					<div class="px-6 flex-shrink-0">
						<div class="space-y-3">
							<h4 class="text-sm font-medium text-white/70">Choose Target Framework:</h4>
							<div class="grid grid-cols-2 md:grid-cols-5 gap-3">
								<button
									v-for="option in transmutationOptions"
									:key="option.id"
									class="p-3 rounded-lg border transition-all duration-200 text-center"
									:class="selectedOption === option.id ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'"
									@click="selectTransmutationOption(option.id)"
								>
									<Icon :name="option.icon" class="w-6 h-6 mx-auto mb-2" />
									<div class="text-xs font-medium">{{ option.label }}</div>
									<div class="text-xs text-white/50">{{ option.extension }}</div>
								</button>
							</div>
						</div>
					</div>

					<!-- Code Editor Area -->
					<div class="flex-1 px-6 pb-6 min-h-0">
						<div class="h-full rounded-lg overflow-hidden border border-white/10">
							<div ref="editorContainer" class="w-full h-full" :data-language="getLanguageForOption(selectedOption)"></div>
						</div>
					</div>

					<!-- Footer Info -->
					<div class="flex items-center justify-between p-6 border-t border-white/10 flex-shrink-0">
						<div class="text-xs text-white/50">{{ getCurrentInfo() }}</div>
						<div class="text-xs text-white/50">Generated from: {{ sourceForm?.title || 'Unknown Form' }}</div>
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
	code: string;
	filename: string;
	title?: string;
	sourceForm?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const selectedOption = ref('tsx');
const copied = ref(false);

const transmutationOptions = [
	{ id: 'tsx', label: 'React TSX', extension: '.tsx', icon: 'i-simple-icons-react' },
	{ id: 'jsx', label: 'React JSX', extension: '.jsx', icon: 'i-simple-icons-react' },
	{ id: 'vue', label: 'Vue SFC', extension: '.vue', icon: 'i-simple-icons-vuedotjs' },
	{ id: 'ts', label: 'TypeScript', extension: '.ts', icon: 'i-simple-icons-typescript' },
	{ id: 'js', label: 'JavaScript', extension: '.js', icon: 'i-simple-icons-javascript' }
];

const getLanguageForOption = (optionId: string) => {
	switch (optionId) {
		case 'tsx':
		case 'jsx': return 'typescript';
		case 'vue': return 'vue';
		case 'ts': return 'typescript';
		case 'js': return 'javascript';
		default: return 'typescript';
	}
};

const getCurrentInfo = () => {
	const option = transmutationOptions.find(o => o.id === selectedOption.value);
	return `${option?.label || 'Unknown'} • ${option?.extension || ''} • ${props.filename}`;
};

const selectTransmutationOption = async (optionId: string) => {
	selectedOption.value = optionId;
	await nextTick();
	updateEditorContent();
};

const updateEditorContent = async () => {
	if (!editor || !props.sourceForm) return;
	try {
		const { convertFormToTSX, convertFormToJSX, convertFormToVue, convertFormToTS, convertFormToJS } = await import('./convert');
		let result: any;
		switch (selectedOption.value) {
			case 'tsx': result = convertFormToTSX(props.sourceForm); break;
			case 'jsx': result = convertFormToJSX(props.sourceForm); break;
			case 'vue': result = convertFormToVue(props.sourceForm); break;
			case 'ts': result = convertFormToTS(props.sourceForm); break;
			case 'js': result = convertFormToJS(props.sourceForm); break;
			default: result = convertFormToTSX(props.sourceForm);
		}
		editor.setValue(result.code);
		monaco.editor.setModelLanguage(editor.getModel()!, getLanguageForOption(selectedOption.value));
	} catch (error) {
		console.error('Failed to transmute form:', error);
		editor.setValue('// Error: Failed to transmute form\\n// Please check the console for details');
	}
};

const initEditor = async () => {
	if (!editorContainer.value) return;
	monaco.languages.register({ id: 'vue' });
	monaco.languages.setMonarchTokensProvider('vue', { tokenizer: { root: [] } });
	editor = monaco.editor.create(editorContainer.value, {
		value: props.code || '// Select a transmutation option above',
		language: getLanguageForOption(selectedOption.value),
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
		renderLineHighlight: 'all',
		readOnly: true
	});
	if (props.sourceForm) { await updateEditorContent(); }
};

const copyCode = async () => {
	if (!editor) return;
	try { await navigator.clipboard.writeText(editor.getValue()); copied.value = true; setTimeout(() => (copied.value = false), 2000); } catch (e) { console.error(e); }
};

const downloadCode = () => {
	if (!editor) return;
	const code = editor.getValue();
	const option = transmutationOptions.find(o => o.id === selectedOption.value);
	const filename = option ? `${props.sourceForm?.title || 'form'}${option.extension}` : props.filename;
	const blob = new Blob([code], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

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


<template>
	<div class="monaco-editor-container">
		<div ref="editorRef" class="monaco-editor" :style="{ height: height + 'px' }"></div>
	</div>
</template>

<script lang="ts" setup>
	import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

	declare global {
		interface Window {
			MonacoEnvironment?: {
				getWorkerUrl: (moduleId: string, label: string) => string;
			};
		}
	}

	interface Props {
		modelValue: string;
		language?: string;
		height?: number;
		readonly?: boolean;
		theme?: string;
		options?: any;
	}

	const props = withDefaults(defineProps<Props>(), {
		language: 'json',
		height: 200,
		readonly: false,
		theme: 'vs-dark',
		options: () => ({})
	});

	const emit = defineEmits<{
		'update:modelValue': [value: string];
		change: [value: string];
	}>();

	const editorRef = ref<HTMLElement>();
	let editor: any = null;

	onMounted(async () => {
		await nextTick();
		await initializeEditor();
	});

	onUnmounted(() => {
		if (editor) {
			editor.dispose();
		}
	});

	const initializeEditor = async () => {
		if (!editorRef.value) return;

		try {
			const monaco = await import('monaco-editor');

			if (!window.MonacoEnvironment) {
				window.MonacoEnvironment = {
					getWorker: function () {
						return null;
					}
				};
			}

		editor = monaco.editor.create(editorRef.value, {
			value: props.modelValue,
			language: props.language,
			theme: props.theme,
			readOnly: props.readonly,
			automaticLayout: true,
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			wordWrap: 'on',
			lineNumbers: 'on',
			glyphMargin: false,
			folding: true,
			lineDecorationsWidth: 0,
			lineNumbersMinChars: 3,
			renderLineHighlight: 'none',
			selectOnLineNumbers: true,
			roundedSelection: false,
			cursorStyle: 'line',
			suggest: { enabled: false },
			hover: { enabled: false },
			parameterHints: { enabled: false },
			quickSuggestions: false,
			suggestOnTriggerCharacters: false,
			acceptSuggestionOnEnter: 'off',
			tabCompletion: 'off',
			wordBasedSuggestions: 'off',
			...(props.options || {})
		});

			editor.onDidChangeModelContent(() => {
				const value = editor.getValue();
				emit('update:modelValue', value);
				emit('change', value);
			});

		} catch (error) {
			console.error('Failed to initialize Monaco Editor:', error);
		}
	};

	watch(() => props.modelValue, (newValue) => {
		if (editor && editor.getValue() !== newValue) {
			editor.setValue(newValue);
		}
	});

	watch(() => props.language, async (newLanguage) => {
		if (editor) {
			try {
				const monaco = await import('monaco-editor');
				monaco.editor.setModelLanguage(editor.getModel(), newLanguage);
			} catch (error) {
				console.error('Failed to update language:', error);
			}
		}
	});

	watch(() => props.readonly, (newReadonly) => {
		if (editor) {
			editor.updateOptions({ readOnly: newReadonly });
		}
	});

	defineExpose({
		editor: () => editor,
		focus: () => editor?.focus(),
		getValue: () => editor?.getValue(),
		setValue: (value: string) => editor?.setValue(value)
	});
</script>

<style scoped>
	.monaco-editor-container {
		width: 100%;
		border: 1px solid rgba(75, 85, 99, 0.2);
		border-radius: 0.375rem;
	}

	.monaco-editor {
		width: 100%;
	}
</style>
 
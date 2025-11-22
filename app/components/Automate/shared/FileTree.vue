<template>
	<div class="file-tree">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold text-white/90 flex items-center gap-2">
					<Icon name="i-lucide-folder-tree" class="w-5 h-5 text-primary" />
					Project Files
				</h3>
				<p class="text-sm text-white/60 mt-1">
					Browse and explore your project structure
				</p>
			</div>
			<div class="flex gap-2">
				<button
					@click="refreshTree"
					:disabled="isLoading"
					class="p-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg border border-white/20 transition-colors disabled:opacity-50"
					title="Refresh file tree"
				>
					<Icon :name="isLoading ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
				</button>
				<button
					@click="toggleExpanded"
					class="p-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg border border-white/20 transition-colors"
					:title="allExpanded ? 'Collapse all' : 'Expand all'"
				>
					<Icon :name="allExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- File Tree -->
		<div class="file-tree-container bg-black/20 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
			<div v-if="isLoading" class="flex items-center justify-center py-8">
				<Icon name="i-lucide-loader-2" class="w-6 h-6 text-primary animate-spin mr-2" />
				<span class="text-white/70">Loading file tree...</span>
			</div>
			
			<div v-else-if="!fileTree || fileTree.length === 0" class="text-center py-8 text-white/50">
				<Icon name="i-lucide-folder-x" class="w-8 h-8 mx-auto mb-2 opacity-50" />
				<p>No files found</p>
				<p class="text-xs mt-1">Make sure the project path is correct</p>
			</div>
			
			<div v-else class="space-y-1">
				<FileTreeNode
					v-for="node in fileTree"
					:key="node.path"
					:node="node"
					:expanded="expandedNodes"
					:selected-file="selectedFile"
					@toggle-expand="toggleNode"
					@select-file="selectFile"
					@double-click-file="handleDoubleClick"
					@watch-toggled="(watchId, isWatching) => emit('watchToggled', watchId, isWatching)"
				/>
			</div>
		</div>

		<!-- Selected File Info -->
		<div v-if="selectedFile" class="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
			<div class="flex items-center gap-2 mb-2">
				<Icon :name="getFileIcon(selectedFile.name)" class="w-4 h-4 text-primary" />
				<span class="font-medium text-primary">{{ selectedFile.name }}</span>
			</div>
			<div class="text-xs text-white/60">
				{{ selectedFile.path }}
			</div>
			<div class="flex gap-2 mt-2">
					<button
						@click="openInEditor"
						class="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs transition-colors flex items-center gap-1.5"
						title="Open file in Monaco Editor"
					>
						<Icon name="i-lucide-edit" class="w-3 h-3" />
						Edit
					</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, watch } from 'vue';
	import FileTreeNode from './FileTreeNode.vue';

	interface FileNode {
		name: string
		path: string
		type: 'file' | 'directory'
		children?: FileNode[]
		size?: number
		modified?: string
		extension?: string
	}

	interface Props {
		projectPath: string
		initialFile?: string
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		fileSelected: [file: FileNode]
		fileOpened: [file: FileNode, content: string]
		error: [error: string]
		treeLoaded: [files: FileNode[]]
		watchToggled: [watchId: string, isNowWatching: boolean]
	}>();

	const fileTree = ref<FileNode[]>([]);
	const isLoading = ref(false);
	const expandedNodes = ref<Set<string>>(new Set());
	const selectedFile = ref<FileNode | null>(null);

	const allExpanded = computed(() => {
		// Simple check - if we have files and all directories are expanded
		return fileTree.value.length > 0 && expandedNodes.value.size > 0;
	});

	const loadFileTree = async () => {
		if (!props.projectPath) return;
		
		isLoading.value = true;
		try {
			// Read actual directory contents using Tauri
			const { readDir } = await import('@tauri-apps/plugin-fs');
			const entries = await readDir(props.projectPath);
			
			// Convert Tauri directory entries to our FileNode format
			const convertToFileNode = async (entry: any, basePath: string): Promise<FileNode> => {
				const fullPath = `${basePath}/${entry.name}`;
				const extension = entry.name.includes('.') ? entry.name.split('.').pop() : undefined;
				
				if (entry.isDirectory) {
					// For directories, we'll load children on demand
					return {
						name: entry.name,
						path: fullPath,
						type: 'directory',
						children: []
					};
				} else {
					// For files, get basic info
					return {
						name: entry.name,
						path: fullPath,
						type: 'file',
						extension: extension,
						size: entry.size || 0,
						modified: entry.modifiedAt ? new Date(entry.modifiedAt).toISOString().split('T')[0] : undefined
					};
				}
			};

			// Convert all entries
			const nodes = await Promise.all(
				entries.map(entry => convertToFileNode(entry, props.projectPath))
			);

			// Sort: directories first, then files, both alphabetically
			nodes.sort((a, b) => {
				if (a.type !== b.type) {
					return a.type === 'directory' ? -1 : 1;
				}
				return a.name.localeCompare(b.name);
			});

			fileTree.value = nodes;

			// Auto-expand the root directory
			expandedNodes.value.add(props.projectPath);

			// Emit the tree data for handle generation
			emit('treeLoaded', nodes);

		} catch (error) {
			console.error('Failed to load file tree:', error);
			emit('error', 'Failed to load file tree. Please check the project path.');
		} finally {
			isLoading.value = false;
		}
	};

	const refreshTree = () => {
		loadFileTree();
	};

	const toggleExpanded = () => {
		if (allExpanded.value) {
			expandedNodes.value.clear();
		} else {
			// Expand all directories
			const expandAll = (nodes: FileNode[]) => {
				nodes.forEach(node => {
					if (node.type === 'directory') {
						expandedNodes.value.add(node.path);
						if (node.children) {
							expandAll(node.children);
						}
					}
				});
			};
			expandAll(fileTree.value);
		}
	};

	const toggleNode = async (path: string) => {
		if (expandedNodes.value.has(path)) {
			expandedNodes.value.delete(path);
		} else {
			expandedNodes.value.add(path);
			// Load children for this directory if not already loaded
			await loadDirectoryChildren(path);
		}
	};

	const loadDirectoryChildren = async (dirPath: string) => {
		try {
			// Find the directory node in the tree
			const findNode = (nodes: FileNode[], targetPath: string): FileNode | null => {
				for (const node of nodes) {
					if (node.path === targetPath) return node;
					if (node.children) {
						const found = findNode(node.children, targetPath);
						if (found) return found;
					}
				}
				return null;
			};

			const dirNode = findNode(fileTree.value, dirPath);
			if (!dirNode || dirNode.type !== 'directory' || (dirNode.children && dirNode.children.length > 0)) {
				return; // Already loaded or not a directory
			}

			// Read directory contents
			const { readDir } = await import('@tauri-apps/plugin-fs');
			const entries = await readDir(dirPath);

			// Convert entries to FileNode format
			const convertToFileNode = async (entry: any, basePath: string): Promise<FileNode> => {
				const fullPath = `${basePath}/${entry.name}`;
				const extension = entry.name.includes('.') ? entry.name.split('.').pop() : undefined;
				
				if (entry.isDirectory) {
					return {
						name: entry.name,
						path: fullPath,
						type: 'directory',
						children: []
					};
				} else {
					return {
						name: entry.name,
						path: fullPath,
						type: 'file',
						extension: extension,
						size: entry.size || 0,
						modified: entry.modifiedAt ? new Date(entry.modifiedAt).toISOString().split('T')[0] : undefined
					};
				}
			};

			// Load children
			const children = await Promise.all(
				entries.map(entry => convertToFileNode(entry, dirPath))
			);

			// Sort children: directories first, then files
			children.sort((a, b) => {
				if (a.type !== b.type) {
					return a.type === 'directory' ? -1 : 1;
				}
				return a.name.localeCompare(b.name);
			});

			// Update the directory node with its children
			dirNode.children = children;

		} catch (error) {
			console.error('Failed to load directory children:', error);
		}
	};

	const selectFile = (file: FileNode) => {
		selectedFile.value = file;
		emit('fileSelected', file);
	};

	const handleDoubleClick = async (file: FileNode) => {
		// Select the file first
		selectFile(file);
		
		// Then open it in the editor (same logic as openInEditor)
		try {
			// Check if file is a text file that can be edited
			const textExtensions = ['txt', 'js', 'ts', 'vue', 'html', 'css', 'scss', 'json', 'md', 'yml', 'yaml', 'xml', 'py', 'php', 'rb', 'go', 'rs', 'cpp', 'c', 'h', 'java', 'kt', 'swift', 'dart', 'sh', 'bat', 'ps1', 'sql', 'env', 'ini', 'cfg', 'conf', 'log'];
			const fileExtension = file.extension?.toLowerCase();
			
			if (!fileExtension || !textExtensions.includes(fileExtension)) {
				emit('error', 'This file type cannot be edited in the code editor.');
				return;
			}

			// Read actual file content using Tauri
			const { readTextFile } = await import('@tauri-apps/plugin-fs');
			const content = await readTextFile(file.path);
			
			console.log('File content read:', {
				path: file.path,
				length: content?.length || 0,
				preview: content?.substring(0, 100) || 'No content'
			});

			emit('fileOpened', file, content);
		} catch (error) {
			console.error('Failed to open file:', error);
			emit('error', 'Failed to open file for editing.');
		}
	};


	const openInEditor = async () => {
		if (!selectedFile.value) return;
		
		try {
			// Check if file is a text file that can be edited
			const textExtensions = ['txt', 'js', 'ts', 'vue', 'html', 'css', 'scss', 'json', 'md', 'yml', 'yaml', 'xml', 'py', 'php', 'rb', 'go', 'rs', 'cpp', 'c', 'h', 'java', 'kt', 'swift', 'dart', 'sh', 'bat', 'ps1', 'sql', 'env', 'ini', 'cfg', 'conf', 'log'];
			const fileExtension = selectedFile.value.extension?.toLowerCase();
			
			if (!fileExtension || !textExtensions.includes(fileExtension)) {
				emit('error', 'This file type cannot be edited in the code editor.');
				return;
			}

			// Read actual file content using Tauri
			const { readTextFile } = await import('@tauri-apps/plugin-fs');
			const content = await readTextFile(selectedFile.value.path);

			emit('fileOpened', selectedFile.value, content);
		} catch (error) {
			console.error('Failed to open file:', error);
			emit('error', 'Failed to open file for editing.');
		}
	};


	const getFileIcon = (filename: string) => {
		const ext = filename.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'vue': return 'i-lucide-file-code';
			case 'ts': case 'js': return 'i-lucide-file-code';
			case 'json': return 'i-lucide-file-json';
			case 'md': return 'i-lucide-file-text';
			case 'css': case 'scss': return 'i-lucide-file-css';
			case 'html': return 'i-lucide-file-html';
			case 'png': case 'jpg': case 'jpeg': case 'gif': return 'i-lucide-file-image';
			case 'pdf': return 'i-lucide-file-text';
			default: return 'i-lucide-file';
		}
	};

	// Watch for project path changes
	watch(() => props.projectPath, (newPath) => {
		if (newPath) {
			loadFileTree();
		}
	}, { immediate: true });

	// Auto-select initial file if provided
	watch(() => props.initialFile, (newFile) => {
		if (newFile && fileTree.value.length > 0) {
			// Find and select the file
			const findFile = (nodes: FileNode[], targetPath: string): FileNode | null => {
				for (const node of nodes) {
					if (node.path === targetPath) return node;
					if (node.children) {
						const found = findFile(node.children, targetPath);
						if (found) return found;
					}
				}
				return null;
			};
			
			const file = findFile(fileTree.value, newFile);
			if (file) {
				selectFile(file);
			}
		}
	});
</script>

<style scoped>
.file-tree {
	padding: 1rem;
}

.file-tree-container {
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	padding: 1rem;
	max-height: 24rem;
	overflow-y: auto;
}

/* Custom scrollbar */
.file-tree-container::-webkit-scrollbar {
	width: 6px;
}

.file-tree-container::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
}

.file-tree-container::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.3);
	border-radius: 3px;
}

.file-tree-container::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.5);
}
</style>


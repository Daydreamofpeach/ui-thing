<template>
	<div class="file-tree-node">
		<div
			class="node-item flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer relative"
			:class="{
				'bg-primary/20 text-primary': isSelected,
				'text-white/90': !isSelected
			}"
			@click="handleClick"
			@dblclick="handleDoubleClick"
		>
			<!-- File Connection Handle - Rendered inline with each file -->
			<Handle
				v-if="node.type === 'file'"
				:id="`file-${getFileHandleId(node.path)}`"
				type="source"
				:position="Position.Right"
				class="file-handle-inline"
				:title="`Connect ${node.name}`"
			/>

			<!-- Expand/Collapse Button -->
			<button
				v-if="node.type === 'directory'"
				class="w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
				@click.stop="toggleExpand"
			>
				<Icon
					:name="isExpanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
					class="w-3 h-3"
				/>
			</button>
			<div v-else class="w-4" />

			<!-- File/Directory Icon -->
			<Icon
				:name="nodeIcon"
				class="w-4 h-4 flex-shrink-0"
				:class="{
					'text-primary': isSelected,
					'text-white/70': !isSelected
				}"
			/>

			<!-- Name -->
			<span class="flex-1 truncate text-sm">{{ node.name }}</span>

			<!-- File Size (for files) -->
			<span v-if="node.type === 'file' && node.size" class="text-xs text-white/50 ml-2">
				{{ formatFileSize(node.size) }}
			</span>

			<!-- Watch Icon (for files only) -->
			<FileTreeWatchAction
				v-if="node.type === 'file'"
				:file-path="node.path"
				:file-name="node.name"
				:file-type="node.extension"
				@watch-toggled="handleWatchToggled"
			/>
		</div>

		<!-- Children (if expanded) -->
	<div v-if="node.type === 'directory' && isExpanded && node.children" class="ml-4 space-y-1">
		<FileTreeNode
			v-for="child in node.children"
			:key="child.path"
			:node="child"
			:expanded="expanded"
			:selected-file="selectedFile"
			@toggle-expand="$emit('toggleExpand', $event)"
			@select-file="$emit('selectFile', $event)"
			@double-click-file="$emit('doubleClickFile', $event)"
			@open-in-explorer="$emit('openInExplorer', $event)"
			@watch-toggled="$emit('watchToggled', $event)"
		/>
	</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { computed } from "vue";
	import FileTreeWatchAction from "./FileTreeWatchAction.vue";

	interface FileNode {
		name: string
		path: string
		type: "file" | "directory"
		children?: FileNode[]
		size?: number
		modified?: string
		extension?: string
	}

	interface Props {
		node: FileNode
		expanded: Set<string>
		selectedFile: FileNode | null
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		toggleExpand: [path: string]
		selectFile: [file: FileNode]
		doubleClickFile: [file: FileNode]
		openInExplorer: [file: FileNode]
		watchToggled: [watchId: string, isNowWatching: boolean]
	}>();

	const handleWatchToggled = (watchId: string, isNowWatching: boolean) => {
		emit('watchToggled', watchId, isNowWatching);
	};

	const isExpanded = computed(() => props.expanded.has(props.node.path));
	const isSelected = computed(() => props.selectedFile?.path === props.node.path);

	const nodeIcon = computed(() => {
		if (props.node.type === "directory") {
			return isExpanded.value ? "i-lucide-folder-open" : "i-lucide-folder";
		}

		// File icons based on extension
		const ext = props.node.extension?.toLowerCase();
		switch (ext) {
		case "vue": return "i-lucide-file-code";
		case "ts": case "js": return "i-lucide-file-code";
		case "json": return "i-lucide-file-json";
		case "md": return "i-lucide-file-text";
		case "css": case "scss": return "i-lucide-file-css";
		case "html": return "i-lucide-file-html";
		case "png": case "jpg": case "jpeg": case "gif": return "i-lucide-file-image";
		case "pdf": return "i-lucide-file-text";
		case "txt": return "i-lucide-file-text";
		case "yml": case "yaml": return "i-lucide-file-code";
		case "xml": return "i-lucide-file-code";
		default: return "i-lucide-file";
		}
	});

	const handleClick = () => {
		if (props.node.type === "file") {
			emit("selectFile", props.node);
		} else {
			toggleExpand();
		}
	};

	const handleDoubleClick = () => {
		if (props.node.type === "file") {
			emit("doubleClickFile", props.node);
		}
	};

	const handleContextMenu = (event: MouseEvent) => {
		event.preventDefault();
		if (props.node.type === "file") {
			// Show context menu or directly open in explorer
			emit("openInExplorer", props.node);
		}
	};

	const toggleExpand = () => {
		emit("toggleExpand", props.node.path);
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
	};

	// Generate unique handle ID from file path
	const getFileHandleId = (filePath: string): string => {
		return filePath.replace(/[^a-z0-9]/gi, "_");
	};
</script>

<style scoped>
.file-tree-node {
	user-select: none;
}

.node-item {
	transition: all 0.2s ease;
}

.node-item:hover {
	background: rgba(255, 255, 255, 0.05);
}

.node-item:active {
	transform: scale(0.98);
}

/* File Connection Handle - Inline with file */
:deep(.file-handle-inline) {
	position: absolute;
	right: -8px;
	top: 50%;
	transform: translateY(-50%);
	width: 14px;
	height: 14px;
	background: rgba(34, 197, 94, 0.9);
	border: 2px solid rgba(34, 197, 94, 1);
	border-radius: 50%;
	opacity: 0;
	transition: all 0.2s ease;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	z-index: 100;
}

.node-item:hover :deep(.file-handle-inline) {
	opacity: 1;
}

:deep(.file-handle-inline:hover),
:deep(.file-handle-inline.vue-flow__handle-connecting),
:deep(.file-handle-inline.vue-flow__handle-valid) {
	opacity: 1;
	background: rgba(34, 197, 94, 1);
	transform: translateY(-50%) scale(1.3);
	box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
}
</style>


<template>
	<div v-if="customNodeProps" class="enhanced-node file-creator-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Resizer -->
		<NodeResizer v-if="customNodeProps.selected" :min-width="300" :min-height="400" />

		<!-- Node Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:file-plus" class="w-4 h-4 text-emerald-600" />
				<h3 class="text-sm font-semibold text-emerald-600">
					{{ customNodeProps.data?.label || 'File Creator' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.status === 'ready' ? 'bg-emerald-500' : 'bg-gray-500'" />
				<span class="text-xs" :class="customNodeProps.data?.status === 'ready' ? 'text-emerald-500/70' : 'text-gray-500/70'">
					{{ customNodeProps.data?.status === 'ready' ? 'Ready' : 'Idle' }}
				</span>
			</div>
		</div>

		<!-- File Creation Form -->
		<div class="file-creator-content">
			<!-- File Type Selection -->
			<div class="form-section">
				<label class="form-label">
					<Icon name="lucide:file-type" class="w-4 h-4" />
					File Type
				</label>
				<div class="enhanced-dropdown">
					<select
						v-model="fileType"
						class="enhanced-select"
					>
						<option value="text">
							📄 Text File (.txt)
						</option>
						<option value="javascript">
							⚡ JavaScript (.js)
						</option>
						<option value="typescript">
							🔷 TypeScript (.ts)
						</option>
						<option value="json">
							📋 JSON (.json)
						</option>
						<option value="html">
							🌐 HTML (.html)
						</option>
						<option value="css">
							🎨 CSS (.css)
						</option>
						<option value="vue">
							💚 Vue Component (.vue)
						</option>
						<option value="react">
							⚛️ React Component (.jsx)
						</option>
						<option value="python">
							🐍 Python (.py)
						</option>
						<option value="markdown">
							📝 Markdown (.md)
						</option>
						<option value="xml">
							📄 XML (.xml)
						</option>
						<option value="yaml">
							⚙️ YAML (.yml)
						</option>
					</select>
					<Icon name="lucide:chevron-down" class="enhanced-dropdown-icon" />
				</div>
			</div>

			<!-- File Name Input -->
			<div class="form-section">
				<label class="form-label">File Name</label>
				<div class="file-name-input-container">
					<input
						v-model="fileName"
						type="text"
						:placeholder="currentFileNamePlaceholder"
						class="file-name-input"
					>
					<div class="file-extension-display">
						.{{ currentFileExtension }}
					</div>
				</div>
			</div>

			<!-- File Content -->
			<div class="form-section">
				<label class="form-label">File Content</label>
				<textarea
					v-model="fileContent"
					:placeholder="currentFileTypeInfo.placeholder"
					class="file-content-textarea"
					:rows="8"
				/>
			</div>

			<!-- Folder Selection -->
			<div class="form-section">
				<label class="form-label">
					<Icon name="lucide:folder" class="w-4 h-4" />
					Save Location
				</label>
				<div class="folder-selection-container">
					<!-- Folder Action Buttons -->
					<div class="folder-action-buttons">
						<button
							class="folder-action-btn create-folder-btn"
							@click="showCreateFolderDialog = true"
						>
							<Icon name="lucide:folder-plus" class="w-4 h-4" />
							Create New Folder
						</button>

						<button
							class="folder-action-btn select-folder-btn"
							:disabled="isBrowsingFolder"
							@click="browseForCustomFolder"
						>
							<Icon :name="isBrowsingFolder ? 'lucide:loader-2' : 'lucide:folder-open'" class="w-4 h-4" :class="{ 'animate-spin': isBrowsingFolder }" />
							{{ isBrowsingFolder ? 'Browsing...' : 'Select Existing Folder' }}
						</button>
					</div>

					<!-- Selected Folder Display -->
					<div v-if="customNodeProps.data?.selectedFolderPath" class="selected-folder-display">
						<Icon name="lucide:check-circle" class="w-4 h-4 text-emerald-400" />
						<span class="folder-path">{{ customNodeProps.data.selectedFolderPath }}</span>
						<button
							class="clear-folder-btn"
							title="Clear selected folder"
							@click="clearSelectedFolder"
						>
							<Icon name="lucide:x" class="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>

			<!-- Create Folder Dialog -->
			<div v-if="showCreateFolderDialog" class="create-folder-dialog">
				<div class="dialog-overlay" @click="showCreateFolderDialog = false" />
				<div class="dialog-content">
					<div class="dialog-header">
						<Icon name="lucide:folder-plus" class="w-5 h-5 text-emerald-400" />
						<h3>Create New Folder</h3>
					</div>

					<div class="dialog-body">
						<div class="form-section">
							<label class="form-label">Folder Name</label>
							<input
								v-model="newFolderName"
								type="text"
								placeholder="Enter folder name..."
								class="folder-name-input"
								@keyup.enter="createNewFolder"
								@keyup.escape="cancelCreateFolder"
							>
						</div>

						<div class="form-section">
							<label class="form-label">Parent Directory</label>
							<div class="parent-directory-section">
								<input
									v-model="parentDirectory"
									type="text"
									placeholder="Enter parent directory path..."
									class="parent-directory-input"
								>
								<button
									class="browse-parent-btn"
									:disabled="isBrowsingParent"
									@click="browseForParentDirectoryLocal"
								>
									<Icon :name="isBrowsingParent ? 'lucide:loader-2' : 'lucide:folder-open'" class="w-4 h-4" :class="{ 'animate-spin': isBrowsingParent }" />
								</button>
							</div>
						</div>
					</div>

					<div class="dialog-actions">
						<button class="dialog-btn cancel-btn" @click="cancelCreateFolder">
							<Icon name="lucide:x" class="w-4 h-4" />
							Cancel
						</button>
						<button
							class="dialog-btn create-btn"
							:disabled="!newFolderName.trim() || isCreatingFolder"
							@click="createNewFolder"
						>
							<Icon v-if="isCreatingFolder" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
							<Icon v-else name="lucide:folder-plus" class="w-4 h-4" />
							{{ isCreatingFolder ? 'Creating...' : 'Create Folder' }}
						</button>
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="file-creator-actions">
				<button
					class="create-file-button"
					:disabled="!isFormValid || isCreating"
					@click="createFile"
				>
					<Icon v-if="isCreating" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
					<Icon v-else name="lucide:file-plus" class="w-4 h-4" />
					{{ isCreating ? 'Creating...' : 'Create File' }}
				</button>

				<button
					class="preview-file-button"
					:disabled="!fileContent"
					@click="previewFileLocal"
				>
					<Icon name="lucide:eye" class="w-4 h-4" />
					Preview
				</button>
			</div>

			<!-- Status Display -->
			<div v-if="customNodeProps.data?.status === 'success'" class="success-message">
				<Icon name="lucide:check-circle" class="w-4 h-4" />
				<span>File created successfully!</span>
			</div>

			<div v-if="customNodeProps.data?.status === 'error'" class="error-message">
				<Icon name="lucide:alert-circle" class="w-4 h-4" />
				<span>{{ customNodeProps.data?.errorMessage || 'Failed to create file' }}</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";
	import { computed, ref, watch } from "vue";
	import { useFileCreation } from "../composables/useFileCreation";

	// Tauri FS composables are auto-imported by the Nuxt Tauri module

	// Props
	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	// Emits
	const emit = defineEmits<{
		"file-created": [fileData: any]
		"node-updated": [nodeId: string, data: any]
	}>();

	// Use file creation composable
	const {
		isCreating,
		isCreatingFolder,
		isBrowsingFolder,
		isBrowsingParent,
		fileTypes,
		getFileExtension,
		getFileTypeInfo,
		getFileNamePlaceholder,
		createFolder: createFolderLogic,
		browseForFolder,
		browseForParentDirectory,
		previewFile,
		validateFileName,
		validateFolderName
	} = useFileCreation();

	// File creation logic using the EXACT working pattern from builditConfigGenerator.ts
	const createFileLogic = async (options: { fileName: string, fileContent: string, fileType: string, selectedFolderPath?: string }) => {
		console.log("🔧 FileCreatorNode: Starting file creation with:", options);

		try {
			const extension = getFileExtension(options.fileType);
			const fullFileName = options.fileName.endsWith(`.${extension}`) ? options.fileName : `${options.fileName}.${extension}`;

			// Import Tauri FS functions using the EXACT working pattern from builditConfigGenerator.ts
			console.log("🔧 FileCreatorNode: Importing Tauri FS functions...");
			const { mkdir, writeTextFile, readTextFile, readDir, exists } = await import("@tauri-apps/plugin-fs");
			console.log("✅ FileCreatorNode: Tauri FS functions imported successfully");

			// Determine the file path - use absolute path like the working example
			let filePath: string;

			if (options.selectedFolderPath) {
				// Use the selected folder path (absolute path)
				filePath = `${options.selectedFolderPath}/${fullFileName}`;
				console.log("🔧 FileCreatorNode: Using selected folder path:", filePath);
			} else {
				// Use Documents folder - get the absolute path
				try {
					const { documentDir } = await import("@tauri-apps/api/path");
					const documentsPath = await documentDir();
					filePath = `${documentsPath}/${fullFileName}`;
					console.log("🔧 FileCreatorNode: Using Documents folder:", filePath);
				} catch (pathError) {
					console.error("❌ FileCreatorNode: Error getting Documents path:", pathError);
					// Fallback to using the filename only (will use current directory)
					filePath = fullFileName;
					console.log("🔧 FileCreatorNode: Using fallback path:", filePath);
				}
			}

			// Check if file exists using the direct plugin function (no baseDir)
			console.log("🔧 FileCreatorNode: Checking if file exists at:", filePath);
			const fileExists = await exists(filePath);
			console.log("🔧 FileCreatorNode: File exists check result:", fileExists);

			if (fileExists) {
				console.log("❌ FileCreatorNode: File already exists");
				return { success: false, error: "File already exists" };
			}

			// Create the file using the direct plugin function (no baseDir) - EXACT pattern from working example
			console.log("🔧 FileCreatorNode: Writing file with content length:", options.fileContent.length);
			await writeTextFile(filePath, options.fileContent);

			console.log("✅ FileCreatorNode: File created successfully at:", filePath);
			return { success: true, filePath };
		} catch (error: any) {
			console.error("❌ FileCreatorNode: Error creating file:", {
				error,
				message: error.message,
				stack: error.stack,
				name: error.name
			});
			return { success: false, error: error.message || "Failed to create file" };
		}
	};

	// Local state
	const showCreateFolderDialog = ref(false);
	const newFolderName = ref("");
	const parentDirectory = ref("");

	// Reactive local state that syncs with node data
	const fileName = ref("");
	const fileContent = ref("");
	const fileType = ref("text");

	// Computed properties
	const isFormValid = computed(() => {
		const hasFileName = fileName.value && fileName.value.trim() !== "";
		const hasFileContent = fileContent.value && fileContent.value.trim() !== "";
		const hasFileType = fileType.value && fileType.value.trim() !== "";
		return hasFileName && hasFileContent && hasFileType;
	});

	const currentFileExtension = computed(() => {
		return getFileExtension(fileType.value);
	});

	const currentFileNamePlaceholder = computed(() => {
		return getFileNamePlaceholder(fileType.value);
	});

	const currentFileTypeInfo = computed(() => {
		return getFileTypeInfo(fileType.value);
	});

	// Initialize local state from node data
	const initializeFromNodeData = () => {
		fileName.value = props.customNodeProps.data?.fileName || "";
		fileContent.value = props.customNodeProps.data?.fileContent || "";
		fileType.value = props.customNodeProps.data?.fileType || "text";
	};

	// Sync local state to node data
	const syncToNodeData = () => {
		props.updateNodeData(props.customNodeProps.id, "fileName", fileName.value);
		props.updateNodeData(props.customNodeProps.id, "fileContent", fileContent.value);
		props.updateNodeData(props.customNodeProps.id, "fileType", fileType.value);
	};

	// Watch for changes and sync to node data
	watch(fileName, () => syncToNodeData(), { deep: true });
	watch(fileContent, () => syncToNodeData(), { deep: true });
	watch(fileType, (newType) => {
		console.log("File type changed to:", newType);
		// Always update content to new default when file type changes
		fileContent.value = getFileTypeInfo(newType).defaultContent;
		syncToNodeData();
	});

	// Watch for external node data changes
	watch(
		() => props.customNodeProps.data,
		() => initializeFromNodeData(),
		{ deep: true, immediate: true }
	);

	// Folder browsing functionality using the EXACT working pattern from automate page
	const browseForCustomFolder = async () => {
		try {
			console.log("🔧 FileCreatorNode: Opening folder dialog...");

			// Use the EXACT same pattern as the automate page
			const { open } = await import("@tauri-apps/plugin-dialog");
			const selected = await open({
				directory: true,
				multiple: false,
				title: "Select Folder for File Creation"
			});

			if (selected && typeof selected === "string") {
				console.log("✅ FileCreatorNode: Folder selected:", selected);
				props.updateNodeData(props.customNodeProps.id, "selectedFolderPath", selected);
			} else {
				console.log("❌ FileCreatorNode: No folder selected");
			}
		} catch (error) {
			console.error("❌ FileCreatorNode: Error browsing for folder:", error);
			alert("Failed to open folder browser. Please try again.");
		}
	};

	// Parent directory browsing functionality using the EXACT working pattern from automate page
	const browseForParentDirectoryLocal = async () => {
		try {
			console.log("🔧 FileCreatorNode: Opening parent directory dialog...");

			// Use the EXACT same pattern as the automate page
			const { open } = await import("@tauri-apps/plugin-dialog");
			const selected = await open({
				directory: true,
				multiple: false,
				title: "Select Parent Directory for New Folder"
			});

			if (selected && typeof selected === "string") {
				console.log("✅ FileCreatorNode: Parent directory selected:", selected);
				parentDirectory.value = selected;
			} else {
				console.log("❌ FileCreatorNode: No parent directory selected");
			}
		} catch (error) {
			console.error("❌ FileCreatorNode: Error browsing for parent directory:", error);
			alert("Failed to open folder browser. Please try again.");
		}
	};

	// Folder creation logic using the EXACT working pattern from builditConfigGenerator.ts
	const createNewFolder = async () => {
		const validation = validateFolderName(newFolderName.value);
		if (!validation.isValid) {
			alert(validation.error);
			return;
		}

		try {
			// Import Tauri FS functions using the EXACT working pattern
			console.log("🔧 FileCreatorNode: Importing Tauri FS functions for folder creation...");
			const { mkdir, exists } = await import("@tauri-apps/plugin-fs");
			console.log("✅ FileCreatorNode: Tauri FS functions imported successfully");

			// Determine the folder path
			let folderPath: string;

			if (parentDirectory.value) {
				folderPath = `${parentDirectory.value}/${newFolderName.value}`;
				console.log("🔧 FileCreatorNode: Using parent directory:", folderPath);
			} else {
				// Use Documents folder - get the absolute path
				try {
					const { documentDir } = await import("@tauri-apps/api/path");
					const documentsPath = await documentDir();
					folderPath = `${documentsPath}/${newFolderName.value}`;
					console.log("🔧 FileCreatorNode: Using Documents folder:", folderPath);
				} catch (pathError) {
					console.error("❌ FileCreatorNode: Error getting Documents path:", pathError);
					// Fallback to using the folder name only
					folderPath = newFolderName.value;
					console.log("🔧 FileCreatorNode: Using fallback path:", folderPath);
				}
			}

			// Check if folder exists using the direct plugin function (no baseDir)
			console.log("🔧 FileCreatorNode: Checking if folder exists at:", folderPath);
			const folderExists = await exists(folderPath);
			console.log("🔧 FileCreatorNode: Folder exists check result:", folderExists);

			if (folderExists) {
				console.log("❌ FileCreatorNode: Folder already exists");
				alert("A folder with this name already exists");
				return;
			}

			// Create the folder using the direct plugin function (no baseDir) - EXACT pattern from working example
			console.log("🔧 FileCreatorNode: Creating folder at:", folderPath);
			await mkdir(folderPath, { recursive: true });

			console.log("✅ FileCreatorNode: Folder created successfully at:", folderPath);

			// Set the created folder as the selected folder
			props.updateNodeData(props.customNodeProps.id, "selectedFolderPath", folderPath);
			// Close dialog and reset form
			cancelCreateFolder();
		} catch (error: any) {
			console.error("❌ FileCreatorNode: Error creating folder:", {
				error,
				message: error.message,
				stack: error.stack,
				name: error.name
			});
			alert(error.message || "Failed to create folder. Please try again.");
		}
	};

	const cancelCreateFolder = () => {
		showCreateFolderDialog.value = false;
		newFolderName.value = "";
		parentDirectory.value = "";
	};

	const clearSelectedFolder = () => {
		props.updateNodeData(props.customNodeProps.id, "selectedFolderPath", null);
	};

	const createFile = async () => {
		if (!isFormValid.value) return;

		const baseFileName = fileName.value;
		const content = fileContent.value;
		const selectedFolderPath = props.customNodeProps.data.selectedFolderPath;

		// Get the full filename with extension for validation and creation
		const extension = currentFileExtension.value;
		const fullFileName = `${baseFileName}.${extension}`;

		// Validate file name using the full filename
		const validation = validateFileName(fullFileName, fileType.value);
		if (!validation.isValid) {
			props.updateNodeData(props.customNodeProps.id, "status", "error");
			props.updateNodeData(props.customNodeProps.id, "errorMessage", validation.error);
			return;
		}

		props.updateNodeData(props.customNodeProps.id, "status", "creating");

		console.log("🔧 FileCreatorNode: Starting file creation with:", {
			fileName: fullFileName,
			fileType: fileType.value,
			selectedFolderPath,
			contentLength: content.length
		});

		const result = await createFileLogic({
			fileName: fullFileName,
			fileContent: content,
			fileType: fileType.value,
			selectedFolderPath
		});

		console.log("🔧 FileCreatorNode: File creation result:", result);

		if (result.success && result.filePath) {
			props.updateNodeData(props.customNodeProps.id, "status", "success");
			props.updateNodeData(props.customNodeProps.id, "createdFileName", result.filePath);

			// Emit file created event to trigger code editor node creation
			emit("file-created", {
				fileName: fullFileName,
				filePath: result.filePath,
				fileType: fileType.value,
				fileContent: content,
				selectedFolderPath,
				sourceNodeId: props.customNodeProps.id
			});

			// Clear form after successful creation
			setTimeout(() => {
				props.updateNodeData(props.customNodeProps.id, "status", "ready");
				fileName.value = "";
				fileContent.value = "";
			}, 3000);
		} else {
			props.updateNodeData(props.customNodeProps.id, "status", "error");
			props.updateNodeData(props.customNodeProps.id, "errorMessage", result.error || "Failed to create file");
		}
	};

	const previewFileLocal = () => {
		const content = fileContent.value;
		const name = fileName.value || "preview";

		if (!content) return;

		previewFile(name, content, fileType.value);
	};
</script>

<style scoped>
	.file-creator-node {
		border-color: rgba(16, 185, 129, 0.3);
		min-width: 300px;
		min-height: 400px;
	}

	.file-creator-node.selected {
		border-color: rgba(16, 185, 129, 0.6);
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
	}

	.file-creator-node .node-header {
		background: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.2);
	}

	.file-creator-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 8px;
	}

	/* Enhanced Dropdown Styling - Primary Theme */
	.enhanced-dropdown {
		position: relative;
	}

	.enhanced-select {
		width: 100%;
		padding: 12px 16px;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(12px) saturate(1.2);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.95);
		font-size: 13px;
		font-weight: 500;
		appearance: none;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.enhanced-select:focus {
		outline: none;
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
	}

	.enhanced-select:hover {
		background: rgba(0, 0, 0, 0.6);
		border-color: rgba(var(--color-primary-rgb), 0.5);
	}

	.enhanced-select option {
		background: rgba(0, 0, 0, 0.98);
		color: rgba(255, 255, 255, 0.95);
		padding: 12px 16px;
		border: none;
		font-size: 13px;
		font-weight: 500;
	}

	.enhanced-select option:hover {
		background: rgba(var(--color-primary-rgb), 0.3);
		color: var(--color-primary);
	}

	.enhanced-select option:checked {
		background: var(--color-primary);
		color: rgba(0, 0, 0, 0.9);
		font-weight: 600;
	}

	.enhanced-select option:focus {
		background: rgba(var(--color-primary-rgb), 0.3);
		color: var(--color-primary);
	}

	.enhanced-select option:selected {
		background: var(--color-primary);
		color: rgba(0, 0, 0, 0.9);
		font-weight: 600;
	}

	/* Fix for webkit browsers */
	.enhanced-select::-webkit-scrollbar {
		width: 8px;
	}

	.enhanced-select::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
	}

	.enhanced-select::-webkit-scrollbar-thumb {
		background: var(--color-primary);
		border-radius: 4px;
	}

	.enhanced-select::-webkit-scrollbar-thumb:hover {
		background: rgba(var(--color-primary-rgb), 0.8);
	}

	.enhanced-dropdown-icon {
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		color: var(--color-primary);
		pointer-events: none;
		transition: all 0.3s ease;
	}

	.enhanced-select:focus + .enhanced-dropdown-icon {
		color: rgba(var(--color-primary-rgb), 0.8);
		transform: translateY(-50%) rotate(180deg);
	}

	/* Folder Selection Styling */
	.folder-selection-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.folder-action-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.folder-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 16px;
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.12);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.create-folder-btn:hover {
		background: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.3);
		color: rgba(16, 185, 129, 0.9);
		transform: translateY(-1px);
	}

	.select-folder-btn:hover:not(:disabled) {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		transform: translateY(-1px);
	}

	.folder-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	/* Create Folder Dialog Styling */
	.create-folder-dialog {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dialog-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(12px) saturate(1.5);
	}

	.dialog-content {
		position: relative;
		width: 420px;
		max-width: 90vw;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(24px) saturate(1.8);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 16px;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		z-index: 1001;
	}

	.dialog-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 24px 28px;
		border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.3);
		background: rgba(0, 0, 0, 0.3);
		border-radius: 16px 16px 0 0;
	}

	.dialog-header h3 {
		font-size: 16px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.dialog-body {
		padding: 28px;
		background: rgba(0, 0, 0, 0.2);
	}

	.folder-name-input,
	.parent-directory-input {
		width: 100%;
		padding: 14px 18px;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(12px) saturate(1.2);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.95);
		font-size: 14px;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.folder-name-input:focus,
	.parent-directory-input:focus {
		outline: none;
		background: rgba(0, 0, 0, 0.8);
		border-color: rgba(var(--color-primary-rgb), 0.6);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
	}

	.folder-name-input::placeholder,
	.parent-directory-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.parent-directory-section {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.parent-directory-input {
		flex: 1;
	}

	.browse-parent-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.browse-parent-btn:hover:not(:disabled) {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		transform: translateY(-1px);
	}

	.browse-parent-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.dialog-actions {
		display: flex;
		gap: 12px;
		padding: 24px 28px;
		border-top: 1px solid rgba(var(--color-primary-rgb), 0.3);
		justify-content: flex-end;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 0 0 16px 16px;
	}

	.dialog-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
	}

	.cancel-btn {
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.3);
		color: rgba(255, 255, 255, 0.8);
	}

	.cancel-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		color: rgba(255, 255, 255, 0.95);
		transform: translateY(-1px);
	}

	.create-btn {
		background: rgba(16, 185, 129, 0.3);
		border: 1px solid rgba(16, 185, 129, 0.4);
		color: rgba(16, 185, 129, 0.95);
	}

	.create-btn:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.4);
		border-color: rgba(16, 185, 129, 0.6);
		color: rgba(16, 185, 129, 1);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.create-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.selected-folder-display {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 8px;
		color: rgba(16, 185, 129, 0.9);
		font-size: 12px;
		font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
	}

	.folder-path {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.clear-folder-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 4px;
		color: rgba(16, 185, 129, 0.8);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clear-folder-btn:hover {
		background: rgba(16, 185, 129, 0.3);
		border-color: rgba(16, 185, 129, 0.5);
		color: rgba(16, 185, 129, 1);
	}

	.file-name-input-container {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.file-name-input {
		flex: 1;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 6px;
		color: white;
		font-size: 12px;
	}

	.file-name-input:focus {
		outline: none;
		border-color: rgba(16, 185, 129, 0.5);
		background: rgba(0, 0, 0, 0.3);
	}

	.file-name-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.file-extension-display {
		padding: 8px 12px;
		background: rgba(var(--color-primary-rgb), 0.15);
		border: 1px solid var(--color-primary);
		border-radius: 6px;
		color: var(--color-primary);
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
		transition: all 0.3s ease;
	}

	.file-content-textarea {
		width: 100%;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 6px;
		color: white;
		font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
		font-size: 12px;
		resize: vertical;
		min-height: 120px;
	}

	.file-content-textarea:focus {
		outline: none;
		border-color: rgba(16, 185, 129, 0.5);
		background: rgba(0, 0, 0, 0.3);
	}

	.file-content-textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.file-creator-actions {
		display: flex;
		gap: 12px;
		margin-top: 8px;
	}

	.create-file-button,
	.preview-file-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.create-file-button {
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: rgba(16, 185, 129, 0.9);
	}

	.create-file-button:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.3);
		border-color: rgba(16, 185, 129, 0.5);
		color: rgba(16, 185, 129, 1);
		transform: translateY(-1px);
	}

	.create-file-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.preview-file-button {
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		color: rgba(59, 130, 246, 0.9);
	}

	.preview-file-button:hover:not(:disabled) {
		background: rgba(59, 130, 246, 0.3);
		border-color: rgba(59, 130, 246, 0.5);
		color: rgba(59, 130, 246, 1);
		transform: translateY(-1px);
	}

	.preview-file-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.success-message,
	.error-message {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		margin-top: 8px;
	}

	.success-message {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		color: rgba(34, 197, 94, 0.9);
	}

	.error-message {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: rgba(239, 68, 68, 0.9);
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>

import { ref, computed, readonly } from 'vue';

export interface FileCreationOptions {
	fileName: string;
	fileContent: string;
	fileType: string;
	selectedFolderPath?: string;
	baseDir?: any;
}

export interface FolderCreationOptions {
	folderName: string;
	parentDirectory?: string;
}

export interface FileTypeInfo {
	extension: string;
	defaultContent: string;
	placeholder: string;
}

export function useFileCreation() {
	// State
	const isCreating = ref(false);
	const isCreatingFolder = ref(false);
	const isBrowsingFolder = ref(false);
	const isBrowsingParent = ref(false);

	// File type definitions
	const fileTypes = {
		text: { extension: 'txt', defaultContent: 'Hello, World!', placeholder: 'Enter your text content here...' },
		javascript: { extension: 'js', defaultContent: 'console.log("Hello, World!");', placeholder: 'Enter your JavaScript code here...' },
		typescript: { extension: 'ts', defaultContent: 'console.log("Hello, World!");', placeholder: 'Enter your TypeScript code here...' },
		json: { extension: 'json', defaultContent: `{\n  "message": "Hello, World!",\n  "timestamp": "${new Date().toISOString()}"\n}`, placeholder: 'Enter your JSON content here...' },
		html: { extension: 'html', defaultContent: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>', placeholder: 'Enter your HTML content here...' },
		css: { extension: 'css', defaultContent: 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f5f5f5;\n}', placeholder: 'Enter your CSS styles here...' },
		vue: { extension: 'vue', defaultContent: '<template>\n  <div>\n    <h1>Hello, World!</h1>\n  </div>\n</template>\n\n<script setup>\n// Your Vue component logic here\n</script>', placeholder: 'Enter your Vue component code here...' },
		react: { extension: 'jsx', defaultContent: 'import React from \'react\';\n\nconst MyComponent = () => {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n};\n\nexport default MyComponent;', placeholder: 'Enter your React component code here...' },
		python: { extension: 'py', defaultContent: 'print("Hello, World!")', placeholder: 'Enter your Python code here...' },
		markdown: { extension: 'md', defaultContent: '# Hello, World!\n\nThis is a **Markdown** file created with FileCreatorNode.\n\n## Features\n\n- Easy file creation\n- Multiple file types\n- Tauri integration', placeholder: 'Enter your Markdown content here...' },
		xml: { extension: 'xml', defaultContent: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n    <message>Hello, World!</message>\n</root>', placeholder: 'Enter your XML content here...' },
		yaml: { extension: 'yml', defaultContent: `message: "Hello, World!"\ntimestamp: "${new Date().toISOString()}"\nfeatures:\n  - Easy file creation\n  - Multiple file types\n  - Tauri integration`, placeholder: 'Enter your YAML content here...' }
	};

	// Computed properties
	const getFileExtension = (fileType: string): string => {
		return fileTypes[fileType as keyof typeof fileTypes]?.extension || 'txt';
	};

	const getFileTypeInfo = (fileType: string): FileTypeInfo => {
		return fileTypes[fileType as keyof typeof fileTypes] || fileTypes.text;
	};

	const getFileNamePlaceholder = (fileType: string): string => {
		return 'my-file';
	};

	// File creation methods
	const createFile = async (options: FileCreationOptions): Promise<{ success: boolean; filePath?: string; error?: string }> => {
		if (!options.fileName.trim() || !options.fileContent.trim()) {
			return { success: false, error: 'File name and content are required' };
		}

		isCreating.value = true;

		try {
			const extension = getFileExtension(options.fileType);
			const fullFileName = options.fileName.endsWith(`.${extension}`) ? options.fileName : `${options.fileName}.${extension}`;

			console.log('🔧 useFileCreation: Starting file creation with options:', {
				originalFileName: options.fileName,
				fileType: options.fileType,
				extension,
				fullFileName,
				selectedFolderPath: options.selectedFolderPath,
				contentLength: options.fileContent.length
			});

			// Use the proper Tauri composables like in the working examples
			let baseDir;
			let filePath;

			if (options.selectedFolderPath) {
				// If a custom folder is selected, we need to use absolute path
				// For now, we'll use Documents as base and create in subfolder
				// This is a limitation - we should ideally use the selected folder directly
				filePath = `${options.selectedFolderPath}/${fullFileName}`;
				baseDir = undefined; // Use absolute path
				
					// For custom folders, we need to use the direct Tauri API
				try {
					console.log('🔧 useFileCreation: Using custom folder path:', filePath);
					const { exists, writeTextFile } = await import('@tauri-apps/plugin-fs');
					
					// Check if file exists
					console.log('🔧 useFileCreation: Checking if file exists...');
					const fileExists = await exists(filePath);
					console.log('🔧 useFileCreation: File exists check result:', fileExists);
					
					if (fileExists) {
						console.log('❌ useFileCreation: File already exists');
						return { success: false, error: 'File already exists' };
					}
					
					// Create the file
					console.log('🔧 useFileCreation: Writing file with content length:', options.fileContent.length);
					await writeTextFile(filePath, options.fileContent);
					
					console.log('✅ useFileCreation: File created successfully in custom folder:', filePath);
					return { success: true, filePath };
				} catch (customError: any) {
					console.error('❌ useFileCreation: Error creating file in custom folder:', customError);
					return { success: false, error: customError.message || 'Failed to create file in selected folder' };
				}
			} else {
				// Use Documents folder as default (like in the working example)
				filePath = fullFileName;
				
				// Use the same pattern as the working FileManager.vue
				console.log('🔧 useFileCreation: Using Documents folder for file:', filePath);
				
				// Import Tauri FS functions directly like FileManager.vue does for folder creation
				const { exists, writeTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');
				const baseDir = BaseDirectory.Document;
				
				// Check if file exists
				console.log('🔧 useFileCreation: Checking if file exists in Documents...');
				const fileExists = await exists(filePath, { baseDir });
				console.log('🔧 useFileCreation: File exists check result:', fileExists);
				
				if (fileExists) {
					console.log('❌ useFileCreation: File already exists in Documents');
					return { success: false, error: 'File already exists' };
				}
				
				// Create the file
				console.log('🔧 useFileCreation: Writing file to Documents with content length:', options.fileContent.length);
				await writeTextFile(filePath, options.fileContent, { baseDir });
				
				console.log('✅ useFileCreation: File created successfully in Documents:', filePath);
				return { success: true, filePath };
			}

	} catch (error: any) {
		console.error('❌ useFileCreation: Error creating file:', {
			error,
			message: error.message,
			stack: error.stack,
			name: error.name,
			options
		});
		return { success: false, error: error.message || 'Failed to create file' };
	} finally {
		isCreating.value = false;
	}
	};

	// Folder creation methods
	const getDefaultParentDirectory = async (): Promise<string> => {
		try {
			// Get user's home directory as default
			const { homeDir } = await import('@tauri-apps/api/path');
			return await homeDir();
		} catch (error) {
			console.error('Error getting home directory:', error);
			// Fallback to Documents folder
			try {
				const { documentDir } = await import('@tauri-apps/api/path');
				return await documentDir();
			} catch (fallbackError) {
				console.error('Error getting documents directory:', fallbackError);
				return '';
			}
		}
	};

	const createFolder = async (options: FolderCreationOptions): Promise<{ success: boolean; folderPath?: string; error?: string }> => {
		if (!options.folderName.trim()) {
			return { success: false, error: 'Folder name is required' };
		}

		isCreatingFolder.value = true;

		try {
			const folderName = options.folderName.trim();
			const parentPath = options.parentDirectory?.trim() || await getDefaultParentDirectory();
			const fullPath = `${parentPath}/${folderName}`;

			// Import Tauri FS functions
			const { mkdir, exists } = await import('@tauri-apps/plugin-fs');

			// Check if folder already exists
			const folderExists = await exists(fullPath);

			if (folderExists) {
				return { success: false, error: 'A folder with this name already exists in the selected directory' };
			}

			// Create the folder
			await mkdir(fullPath, { recursive: true });

			console.log('✅ Folder created successfully:', fullPath);
			return { success: true, folderPath: fullPath };

		} catch (error: any) {
			console.error('❌ Error creating folder:', error);
			return { success: false, error: error.message || 'Failed to create folder' };
		} finally {
			isCreatingFolder.value = false;
		}
	};

	// Folder browsing methods
	const browseForFolder = async (title: string = 'Select Folder'): Promise<{ success: boolean; folderPath?: string; error?: string }> => {
		isBrowsingFolder.value = true;

		try {
			// Use Tauri's file dialog to select a folder
			const { open } = await import('@tauri-apps/plugin-dialog');
			const selected = await open({
				directory: true,
				multiple: false,
				title
			});

			if (selected) {
				return { success: true, folderPath: selected as string };
			} else {
				return { success: false, error: 'No folder selected' };
			}
		} catch (error: any) {
			console.error('Error browsing for folder:', error);
			return { success: false, error: error.message || 'Failed to browse for folder' };
		} finally {
			isBrowsingFolder.value = false;
		}
	};

	const browseForParentDirectory = async (title: string = 'Select Parent Directory'): Promise<{ success: boolean; folderPath?: string; error?: string }> => {
		isBrowsingParent.value = true;

		try {
			// Use Tauri's file dialog to select a parent directory
			const { open } = await import('@tauri-apps/plugin-dialog');
			const selected = await open({
				directory: true,
				multiple: false,
				title
			});

			if (selected) {
				return { success: true, folderPath: selected as string };
			} else {
				return { success: false, error: 'No directory selected' };
			}
		} catch (error: any) {
			console.error('Error browsing for parent directory:', error);
			return { success: false, error: error.message || 'Failed to browse for parent directory' };
		} finally {
			isBrowsingParent.value = false;
		}
	};

	// Preview methods
	const previewFile = (fileName: string, fileContent: string, fileType: string): void => {
		if (!fileContent) return;

		const extension = getFileExtension(fileType);

		// Create a preview window or modal
		const previewWindow = window.open('', '_blank', 'width=800,height=600');
		if (previewWindow) {
			previewWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Preview: ${fileName}</title>
					<style>
						body { 
							font-family: 'Fira Code', 'Monaco', 'Consolas', monospace; 
							margin: 20px; 
							background: #1a1a1a; 
							color: #fff;
							white-space: pre-wrap;
						}
						.header { 
							border-bottom: 1px solid #333; 
							padding-bottom: 10px; 
							margin-bottom: 20px; 
							color: #888;
						}
					</style>
				</head>
				<body>
					<div class="header">Preview: ${fileName}.${extension}</div>
					${fileContent}
				</body>
				</html>
			`);
		}
	};

	// Utility methods
	const validateFileName = (fileName: string, fileType: string): { isValid: boolean; error?: string } => {
		if (!fileName.trim()) {
			return { isValid: false, error: 'File name is required' };
		}

		const extension = getFileExtension(fileType);
		const fullFileName = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;

		// Basic filename validation
		const invalidChars = /[<>:"/\\|?*]/;
		if (invalidChars.test(fullFileName)) {
			return { isValid: false, error: 'File name contains invalid characters' };
		}

		if (fullFileName.length > 255) {
			return { isValid: false, error: 'File name is too long' };
		}

		return { isValid: true };
	};

	const validateFolderName = (folderName: string): { isValid: boolean; error?: string } => {
		if (!folderName.trim()) {
			return { isValid: false, error: 'Folder name is required' };
		}

		// Basic folder name validation
		const invalidChars = /[<>:"/\\|?*]/;
		if (invalidChars.test(folderName)) {
			return { isValid: false, error: 'Folder name contains invalid characters' };
		}

		if (folderName.length > 255) {
			return { isValid: false, error: 'Folder name is too long' };
		}

		return { isValid: true };
	};

	return {
		// State
		isCreating: readonly(isCreating),
		isCreatingFolder: readonly(isCreatingFolder),
		isBrowsingFolder: readonly(isBrowsingFolder),
		isBrowsingParent: readonly(isBrowsingParent),

		// File type utilities
		fileTypes,
		getFileExtension,
		getFileTypeInfo,
		getFileNamePlaceholder,

		// File operations
		createFile,
		previewFile,

		// Folder operations
		createFolder,
		browseForFolder,
		browseForParentDirectory,
		getDefaultParentDirectory,

		// Validation
		validateFileName,
		validateFolderName
	};
}

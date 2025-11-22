import { ref, computed } from 'vue';
import { readDir } from '@tauri-apps/plugin-fs';

export interface FileStats {
	extension: string;
	count: number;
	percentage: number;
	color: string;
	size?: number;
}

export interface RepositoryAnalysis {
	fileStats: FileStats[];
	totalFiles: number;
	totalSize: number;
	framework?: string;
	packageManager?: string;
	hasGit: boolean;
	hasPackageJson: boolean;
	hasConfigFiles: boolean;
}

export function useRepositoryAnalysis() {
	const analysis = ref<RepositoryAnalysis | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Color palette for file extensions
	const extensionColors: Record<string, string> = {
		'js': '#f7df1e',
		'ts': '#3178c6',
		'jsx': '#61dafb',
		'tsx': '#61dafb',
		'vue': '#4fc08d',
		'html': '#e34c26',
		'css': '#1572b6',
		'scss': '#cf649a',
		'less': '#1d365d',
		'json': '#000000',
		'md': '#083fa1',
		'py': '#3776ab',
		'java': '#ed8b00',
		'cpp': '#00599c',
		'c': '#a8b9cc',
		'php': '#777bb4',
		'rb': '#cc342d',
		'go': '#00add8',
		'rs': '#000000',
		'swift': '#fa7343',
		'kt': '#7f52ff',
		'dart': '#0175c2',
		'scala': '#dc322f',
		'haskell': '#5e5086',
		'lua': '#000080',
		'sh': '#89e051',
		'bat': '#c1c1c1',
		'ps1': '#012456',
		'sql': '#336791',
		'xml': '#005f9f',
		'yaml': '#cb171e',
		'yml': '#cb171e',
		'txt': '#ffffff',
		'log': '#ffffff',
		'png': '#ff6b6b',
		'jpg': '#ff6b6b',
		'jpeg': '#ff6b6b',
		'gif': '#ff6b6b',
		'svg': '#ff6b6b',
		'ico': '#ff6b6b',
		'woff': '#ff6b6b',
		'woff2': '#ff6b6b',
		'ttf': '#ff6b6b',
		'otf': '#ff6b6b'
	};

	const analyzeRepository = async (folderPath: string): Promise<RepositoryAnalysis> => {
		isLoading.value = true;
		error.value = null;

		try {
			const fileStats: Record<string, { count: number; size: number }> = {};
			let totalFiles = 0;
			let totalSize = 0;
			let framework = 'Unknown';
			let packageManager = 'Unknown';
			let hasGit = false;
			let hasPackageJson = false;
			let hasConfigFiles = false;

			// Recursively scan directory
			await scanDirectory(folderPath, fileStats);

			// Calculate totals
			for (const ext in fileStats) {
				totalFiles += fileStats[ext].count;
				totalSize += fileStats[ext].size;
			}

			// Detect framework and package manager
			const detection = await detectFrameworkAndPackageManager(folderPath);
			framework = detection.framework;
			packageManager = detection.packageManager;
			hasGit = detection.hasGit;
			hasPackageJson = detection.hasPackageJson;
			hasConfigFiles = detection.hasConfigFiles;

			// Convert to FileStats array with percentages
			const fileStatsArray: FileStats[] = Object.entries(fileStats)
				.map(([extension, data]) => ({
					extension,
					count: data.count,
					size: data.size,
					percentage: totalFiles > 0 ? (data.count / totalFiles) * 100 : 0,
					color: extensionColors[extension] || '#6b7280'
				}))
				.sort((a, b) => b.count - a.count);

			const result: RepositoryAnalysis = {
				fileStats: fileStatsArray,
				totalFiles,
				totalSize,
				framework,
				packageManager,
				hasGit,
				hasPackageJson,
				hasConfigFiles
			};

			analysis.value = result;
			return result;

		} catch (err) {
			error.value = `Failed to analyze repository: ${err}`;
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const scanDirectory = async (dirPath: string, fileStats: Record<string, { count: number; size: number }>) => {
		try {
			const entries = await readDir(dirPath, { recursive: false });
			
			for (const entry of entries) {
				if (entry.isFile) {
					const extension = getFileExtension(entry.name);
					if (!fileStats[extension]) {
						fileStats[extension] = { count: 0, size: 0 };
					}
					fileStats[extension].count++;
					fileStats[extension].size += entry.size || 0;
				} else if (entry.isDirectory && !isIgnoredDirectory(entry.name)) {
					// Recursively scan subdirectories
					await scanDirectory(`${dirPath}/${entry.name}`, fileStats);
				}
			}
		} catch (err) {
			console.warn(`Failed to scan directory ${dirPath}:`, err);
		}
	};

	const getFileExtension = (filename: string): string => {
		const parts = filename.split('.');
		return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'no-extension';
	};

	const isIgnoredDirectory = (dirname: string): boolean => {
		const ignoredDirs = [
			'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
			'target', 'out', 'bin', 'obj', '.next', '.nuxt', 'coverage',
			'.nyc_output', 'logs', 'tmp', 'temp', 'cache'
		];
		return ignoredDirs.includes(dirname.toLowerCase());
	};

	const detectFrameworkAndPackageManager = async (folderPath: string) => {
		let framework = 'Unknown';
		let packageManager = 'Unknown';
		let hasGit = false;
		let hasPackageJson = false;
		let hasConfigFiles = false;

		try {
			const entries = await readDir(folderPath, { recursive: false });
			const fileNames = entries.filter(e => e.isFile).map(e => e.name.toLowerCase());

			// Check for Git
			hasGit = fileNames.includes('.gitignore') || fileNames.includes('.gitattributes');

			// Check for package.json
			hasPackageJson = fileNames.includes('package.json');

			// Detect package manager
			if (hasPackageJson) {
				if (fileNames.includes('yarn.lock')) {
					packageManager = 'Yarn';
				} else if (fileNames.includes('pnpm-lock.yaml')) {
					packageManager = 'pnpm';
				} else if (fileNames.includes('package-lock.json')) {
					packageManager = 'npm';
				} else {
					packageManager = 'npm';
				}
			}

			// Detect framework
			if (fileNames.includes('package.json')) {
				// Try to read package.json to detect framework
				try {
					const { readTextFile } = await import('@tauri-apps/plugin-fs');
					const packageJsonContent = await readTextFile(`${folderPath}/package.json`);
					const packageJson = JSON.parse(packageJsonContent);
					
					const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
					
					if (deps.react) framework = 'React';
					else if (deps.vue) framework = 'Vue';
					else if (deps.angular) framework = 'Angular';
					else if (deps.svelte) framework = 'Svelte';
					else if (deps.next) framework = 'Next.js';
					else if (deps.nuxt) framework = 'Nuxt';
					else if (deps.remix) framework = 'Remix';
					else if (deps.solid) framework = 'Solid';
					else if (deps.qwik) framework = 'Qwik';
					else if (deps.astro) framework = 'Astro';
					else framework = 'Node.js';
				} catch {
					framework = 'Unknown';
				}
			}

			// Check for config files
			hasConfigFiles = fileNames.some(name => 
				name.includes('config') || 
				name.includes('webpack') || 
				name.includes('vite') || 
				name.includes('rollup') ||
				name.includes('babel') ||
				name.includes('tsconfig') ||
				name.includes('eslint') ||
				name.includes('prettier')
			);

		} catch (err) {
			console.warn('Failed to detect framework and package manager:', err);
		}

		return {
			framework,
			packageManager,
			hasGit,
			hasPackageJson,
			hasConfigFiles
		};
	};

	const getFileIcon = (extension: string): string => {
		const iconMap: Record<string, string> = {
			'js': 'lucide:file-code',
			'ts': 'lucide:file-code',
			'jsx': 'lucide:file-code',
			'tsx': 'lucide:file-code',
			'vue': 'lucide:file-code',
			'html': 'lucide:file-code',
			'css': 'lucide:file-code',
			'scss': 'lucide:file-code',
			'less': 'lucide:file-code',
			'json': 'lucide:file-code',
			'md': 'lucide:file-text',
			'py': 'lucide:file-code',
			'java': 'lucide:file-code',
			'cpp': 'lucide:file-code',
			'c': 'lucide:file-code',
			'php': 'lucide:file-code',
			'rb': 'lucide:file-code',
			'go': 'lucide:file-code',
			'rs': 'lucide:file-code',
			'swift': 'lucide:file-code',
			'kt': 'lucide:file-code',
			'dart': 'lucide:file-code',
			'scala': 'lucide:file-code',
			'haskell': 'lucide:file-code',
			'lua': 'lucide:file-code',
			'sh': 'lucide:file-code',
			'bat': 'lucide:file-code',
			'ps1': 'lucide:file-code',
			'sql': 'lucide:file-code',
			'xml': 'lucide:file-code',
			'yaml': 'lucide:file-code',
			'yml': 'lucide:file-code',
			'txt': 'lucide:file-text',
			'log': 'lucide:file-text',
			'png': 'lucide:image',
			'jpg': 'lucide:image',
			'jpeg': 'lucide:image',
			'gif': 'lucide:image',
			'svg': 'lucide:image',
			'ico': 'lucide:image',
			'woff': 'lucide:font',
			'woff2': 'lucide:font',
			'ttf': 'lucide:font',
			'otf': 'lucide:font'
		};
		return iconMap[extension] || 'lucide:file';
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return {
		analysis: computed(() => analysis.value),
		isLoading: computed(() => isLoading.value),
		error: computed(() => error.value),
		analyzeRepository,
		getFileIcon,
		formatFileSize,
		extensionColors
	};
}

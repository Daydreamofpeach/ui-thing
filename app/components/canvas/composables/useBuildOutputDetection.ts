import { ref } from "vue";

export interface BuildOutput {
	type: "tauri" | "web" | "unknown";
	outputPath: string;
	files: string[];
	buildCommand: string;
}

export function useBuildOutputDetection() {
	const isScanningBuild = ref(false);
	const buildOutput = ref<BuildOutput | null>(null);

	/**
	 * Detect if a script is a build script
	 */
	const isBuildScript = (scriptName: string, scriptCommand: string): boolean => {
		const buildPatterns = [
			/\bbuild\b/i,
			/\bcompile\b/i,
			/\bdist\b/i,
			/\bprod(uction)?\b/i,
			/tauri\s+build/i,
			/vite\s+build/i,
			/next\s+build/i,
			/webpack\s+--mode\s+production/i
		];

		return buildPatterns.some(pattern =>
			pattern.test(scriptName) || pattern.test(scriptCommand)
		);
	};

	/**
	 * Detect if project is a Tauri project
	 */
	const isTauriProject = async (projectPath: string): Promise<boolean> => {
		try {
			const { readTextFile, exists } = await import("@tauri-apps/plugin-fs");

			// Check for tauri.conf.json or src-tauri folder
			const tauriConfigExists = await exists(`${projectPath}/src-tauri/tauri.conf.json`);
			const tauriCargoExists = await exists(`${projectPath}/src-tauri/Cargo.toml`);

			return tauriConfigExists || tauriCargoExists;
		} catch (error) {
			console.warn("Error checking for Tauri project:", error);
			return false;
		}
	};

	/**
	 * Find Tauri build output (.exe, .msi, .dmg, .app, .deb, .AppImage)
	 */
	const findTauriBuildOutput = async (projectPath: string): Promise<string[]> => {
		try {
			const { readDir } = await import("@tauri-apps/plugin-fs");

			const buildOutputPaths = [
				`${projectPath}/src-tauri/target/release`,
				`${projectPath}/src-tauri/target/release/bundle/msi`,
				`${projectPath}/src-tauri/target/release/bundle/nsis`,
				`${projectPath}/src-tauri/target/release/bundle/deb`,
				`${projectPath}/src-tauri/target/release/bundle/appimage`,
				`${projectPath}/src-tauri/target/release/bundle/dmg`,
				`${projectPath}/src-tauri/target/release/bundle/macos`
			];

			const foundFiles: string[] = [];

			for (const outputPath of buildOutputPaths) {
				try {
					const entries = await readDir(outputPath);

					entries.forEach((entry: any) => {
						const fileName = entry.name.toLowerCase();
						// Look for executables and installers
						if (
							fileName.endsWith(".exe") ||
							fileName.endsWith(".msi") ||
							fileName.endsWith(".dmg") ||
							fileName.endsWith(".app") ||
							fileName.endsWith(".deb") ||
							fileName.endsWith(".appimage")
						) {
							foundFiles.push(`${outputPath}/${entry.name}`);
						}
					});
				} catch (error) {
					// Path might not exist, continue checking others
					continue;
				}
			}

			return foundFiles;
		} catch (error) {
			console.error("Error finding Tauri build output:", error);
			return [];
		}
	};

	/**
	 * Find web build output (dist, build, out folders)
	 */
	const findWebBuildOutput = async (projectPath: string): Promise<string> => {
		try {
			const { exists } = await import("@tauri-apps/plugin-fs");

			const possibleOutputDirs = [
				`${projectPath}/dist`,
				`${projectPath}/build`,
				`${projectPath}/out`,
				`${projectPath}/.next`,
				`${projectPath}/.output/public`, // Nuxt
				`${projectPath}/public/build` // Some frameworks
			];

			for (const dir of possibleOutputDirs) {
				const dirExists = await exists(dir);
				if (dirExists) {
					// Check if there's an index.html
					const indexExists = await exists(`${dir}/index.html`);
					if (indexExists) {
						return dir;
					}
				}
			}

			return "";
		} catch (error) {
			console.error("Error finding web build output:", error);
			return "";
		}
	};

	/**
	 * Scan for build output after build completes
	 */
	const scanBuildOutput = async (
		projectPath: string,
		scriptCommand: string
	): Promise<BuildOutput | null> => {
		isScanningBuild.value = true;

		try {
			console.log("🔍 Scanning for build output:", projectPath);

			// Check if Tauri project
			const isTauri = await isTauriProject(projectPath);

			if (isTauri) {
				console.log("📦 Tauri project detected");
				const tauriFiles = await findTauriBuildOutput(projectPath);

				if (tauriFiles.length > 0) {
					const output: BuildOutput = {
						type: "tauri",
						outputPath: projectPath,
						files: tauriFiles,
						buildCommand: scriptCommand
					};

					buildOutput.value = output;
					return output;
				}
			}

			// Check for web build output
			const webOutputDir = await findWebBuildOutput(projectPath);
			if (webOutputDir) {
				console.log("🌐 Web build output detected:", webOutputDir);

				const output: BuildOutput = {
					type: "web",
					outputPath: webOutputDir,
					files: [`${webOutputDir}/index.html`],
					buildCommand: scriptCommand
				};

				buildOutput.value = output;
				return output;
			}

			console.warn("⚠️ No build output detected");
			return null;
		} catch (error) {
			console.error("❌ Error scanning build output:", error);
			return null;
		} finally {
			isScanningBuild.value = false;
		}
	};

	return {
		isScanningBuild,
		buildOutput,
		isBuildScript,
		isTauriProject,
		findTauriBuildOutput,
		findWebBuildOutput,
		scanBuildOutput
	};
}


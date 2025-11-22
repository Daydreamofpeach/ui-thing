/**
 * Reusable PowerShell Execution Composable
 * Provides a standardized way to execute PowerShell commands across the application
 */

export interface PowerShellExecutionOptions {
	workingDirectory: string
	command: string
	windowStyle?: "Normal" | "Minimized" | "Maximized" | "Hidden"
	executionPolicy?: "Bypass" | "Restricted" | "RemoteSigned" | "Unrestricted"
	noProfile?: boolean
	noExit?: boolean
	showSuccessToast?: boolean
	showErrorToast?: boolean
	successMessage?: string
	errorMessage?: string
}

export interface PowerShellExecutionResult {
	success: boolean
	error?: string
	message?: string
}

export function usePowerShellExecution() {
	/**
	 * Execute a PowerShell command in an external window
	 * @param options - PowerShell execution options
	 * @returns Promise<PowerShellExecutionResult>
	 */
	const executePowerShell = async (options: PowerShellExecutionOptions): Promise<PowerShellExecutionResult> => {
		const {
			workingDirectory,
			command,
			windowStyle = "Normal",
			executionPolicy = "Bypass",
			noProfile = true,
			noExit = true,
			showSuccessToast = true,
			showErrorToast = true,
			successMessage = "Command executed successfully",
			errorMessage = "Failed to execute command"
		} = options;

		try {
			console.log(`🚀 Executing PowerShell command:`, command);
			console.log(`📁 Working directory:`, workingDirectory);

			// Normalize the working directory path
			const normalizedPath = workingDirectory.replace(/\//g, "\\");

			// Build PowerShell arguments
			const argumentsList = [
				"-NoProfile",
				"-ExecutionPolicy", executionPolicy,
				"-NoExit",
				"-Command", command
			];

			// Remove -NoExit if noExit is false
			if (!noExit) {
				const noExitIndex = argumentsList.indexOf("-NoExit");
				if (noExitIndex > -1) {
					argumentsList.splice(noExitIndex, 1);
				}
			}

			// Build the PowerShell command
			const psCommand = `Start-Process powershell -WorkingDirectory '${normalizedPath.replace(/'/g, "''")}' -WindowStyle ${windowStyle} -ArgumentList "${argumentsList.join('","')}"`;

			// Execute the command
			const { useTauriShellCommand } = await import("#imports");
			await useTauriShellCommand.create("exec-pwsh", ["-Command", psCommand]).execute();

			console.log(`✅ PowerShell command executed successfully`);

			// Show success toast if enabled
			if (showSuccessToast) {
				const { useToast } = await import("#imports");
				useToast().add({
					title: "Command Executed",
					description: successMessage,
					color: "success"
				});
			}

			return {
				success: true,
				message: successMessage
			};

		} catch (error: any) {
			console.error(`❌ PowerShell execution failed:`, error);

			// Show error toast if enabled
			if (showErrorToast) {
				const { useToast } = await import("#imports");
				useToast().add({
					title: "Execution Failed",
					description: errorMessage,
					color: "error"
				});
			}

			return {
				success: false,
				error: error.message || "Unknown error occurred"
			};
		}
	};

	/**
	 * Execute a script command (npm/yarn/pnpm/bun run script)
	 * @param workingDirectory - The working directory
	 * @param scriptName - The script name to run
	 * @param packageManager - The package manager to use (auto-detected if not provided)
	 * @param options - Additional PowerShell execution options
	 * @returns Promise<PowerShellExecutionResult>
	 */
	const executeScript = async (
		workingDirectory: string,
		scriptName: string,
		packageManager?: "npm" | "yarn" | "pnpm" | "bun",
		options?: Partial<PowerShellExecutionOptions>
	): Promise<PowerShellExecutionResult> => {
		try {
			// Auto-detect package manager if not provided
			let pm = packageManager;
			if (!pm) {
				pm = await detectPackageManager(workingDirectory);
			}

			// Build the command based on package manager
			const command = buildScriptCommand(scriptName, pm);

			// Execute with default options for script execution
			const defaultOptions: PowerShellExecutionOptions = {
				workingDirectory,
				command,
				showSuccessToast: true,
				showErrorToast: true,
				successMessage: `Script "${scriptName}" started successfully`,
				errorMessage: `Failed to start script "${scriptName}"`,
				...options
			};

			return await executePowerShell(defaultOptions);

		} catch (error: any) {
			console.error(`❌ Script execution failed:`, error);

			const { useToast } = await import("#imports");
			useToast().add({
				title: "Script Failed",
				description: `Failed to execute script "${scriptName}"`,
				color: "error"
			});

			return {
				success: false,
				error: error.message || "Unknown error occurred"
			};
		}
	};

	/**
	 * Execute a custom command
	 * @param workingDirectory - The working directory
	 * @param command - The command to execute
	 * @param options - Additional PowerShell execution options
	 * @returns Promise<PowerShellExecutionResult>
	 */
	const executeCustomCommand = async (
		workingDirectory: string,
		command: string,
		options?: Partial<PowerShellExecutionOptions>
	): Promise<PowerShellExecutionResult> => {
		const defaultOptions: PowerShellExecutionOptions = {
			workingDirectory,
			command,
			showSuccessToast: true,
			showErrorToast: true,
			successMessage: "Custom command executed successfully",
			errorMessage: "Failed to execute custom command",
			...options
		};

		return await executePowerShell(defaultOptions);
	};

	/**
	 * Execute a development server command
	 * @param workingDirectory - The working directory
	 * @param packageManager - The package manager to use (auto-detected if not provided)
	 * @param options - Additional PowerShell execution options
	 * @returns Promise<PowerShellExecutionResult>
	 */
	const executeDevServer = async (
		workingDirectory: string,
		packageManager?: "npm" | "yarn" | "pnpm" | "bun",
		options?: Partial<PowerShellExecutionOptions>
	): Promise<PowerShellExecutionResult> => {
		return await executeScript(workingDirectory, "dev", packageManager, {
			successMessage: "Development server started successfully",
			errorMessage: "Failed to start development server",
			...options
		});
	};

	/**
	 * Execute a build command
	 * @param workingDirectory - The working directory
	 * @param packageManager - The package manager to use (auto-detected if not provided)
	 * @param options - Additional PowerShell execution options
	 * @returns Promise<PowerShellExecutionResult>
	 */
	const executeBuild = async (
		workingDirectory: string,
		packageManager?: "npm" | "yarn" | "pnpm" | "bun",
		options?: Partial<PowerShellExecutionOptions>
	): Promise<PowerShellExecutionResult> => {
		return await executeScript(workingDirectory, "build", packageManager, {
			successMessage: "Build started successfully",
			errorMessage: "Failed to start build",
			...options
		});
	};

	/**
	 * Execute an install command
	 * @param workingDirectory - The working directory
	 * @param packageManager - The package manager to use (auto-detected if not provided)
	 * @param options - Additional PowerShell execution options
	 * @returns Promise<PowerShellExecutionResult>
	 */
	const executeInstall = async (
		workingDirectory: string,
		packageManager?: "npm" | "yarn" | "pnpm" | "bun",
		options?: Partial<PowerShellExecutionOptions>
	): Promise<PowerShellExecutionResult> => {
		return await executeScript(workingDirectory, "install", packageManager, {
			successMessage: "Dependencies installation started successfully",
			errorMessage: "Failed to start dependencies installation",
			...options
		});
	};

	// Helper functions

	/**
	 * Detect package manager from lock files
	 * @param workingDirectory - The working directory to check
	 * @returns Promise<"npm" | "yarn" | "pnpm" | "bun">
	 */
	const detectPackageManager = async (workingDirectory: string): Promise<"npm" | "yarn" | "pnpm" | "bun"> => {
		try {
			const { readDir } = await import("@tauri-apps/plugin-fs");
			const entries = await readDir(workingDirectory);

			// Check for lock files in order of preference
			const lockFiles = {
				"bun.lockb": "bun",
				"pnpm-lock.yaml": "pnpm",
				"yarn.lock": "yarn",
				"package-lock.json": "npm"
			};

			for (const [lockFile, manager] of Object.entries(lockFiles)) {
				if (entries.some(entry => entry.name === lockFile)) {
					console.log(`📦 Detected package manager: ${manager} (found ${lockFile})`);
					return manager as "npm" | "yarn" | "pnpm" | "bun";
				}
			}

			// Default to npm if no lock file found
			console.log(`📦 No lock file found, defaulting to npm`);
			return "npm";

		} catch (error) {
			console.warn(`⚠️ Failed to detect package manager, defaulting to npm:`, error);
			return "npm";
		}
	};

	/**
	 * Build script command based on package manager
	 * @param scriptName - The script name
	 * @param packageManager - The package manager
	 * @returns The command string
	 */
	const buildScriptCommand = (scriptName: string, packageManager: "npm" | "yarn" | "pnpm" | "bun"): string => {
		switch (packageManager) {
			case "yarn":
				return `yarn ${scriptName}`;
			case "pnpm":
				return `pnpm run ${scriptName}`;
			case "bun":
				return `bun run ${scriptName}`;
			case "npm":
			default:
				return `npm run ${scriptName}`;
		}
	};

	return {
		// Main execution function
		executePowerShell,

		// Convenience functions
		executeScript,
		executeCustomCommand,
		executeDevServer,
		executeBuild,
		executeInstall,

		// Helper functions
		detectPackageManager,
		buildScriptCommand
	};
}

import { ref } from 'vue';

// Declare the auto-imported Tauri shell command
declare const useTauriShellCommand: {
	create: (command: string, args: string[]) => {
		execute: () => Promise<{
			code: number;
			stdout: string;
			stderr: string;
		}>;
	};
};

export interface ShellCommandResult {
	success: boolean;
	stdout: string;
	stderr: string;
	exitCode: number;
}

export function useShellCommands() {
	const isExecuting = ref(false);
	const lastResult = ref<ShellCommandResult | null>(null);
	const error = ref<string | null>(null);

	// Execute a shell command
	const executeCommand = async (command: string, args: string[] = []): Promise<ShellCommandResult | null> => {
		isExecuting.value = true;
		error.value = null;

		try {
			// Create command with proper argument structure
			const cmd = useTauriShellCommand.create('shell-exec', [command, ...args]);
			const result = await cmd.execute();
			
			const commandResult: ShellCommandResult = {
				success: result.code === 0,
				stdout: result.stdout,
				stderr: result.stderr,
				exitCode: result.code
			};

			lastResult.value = commandResult;
			return commandResult;

		} catch (err) {
			error.value = `Failed to execute command: ${err}`;
			console.error('Shell command error:', err);
			return null;
		} finally {
			isExecuting.value = false;
		}
	};

	// Execute PowerShell command
	const executePowerShell = async (script: string): Promise<ShellCommandResult | null> => {
		try {
			const cmd = useTauriShellCommand.create('powershell-exec', ['-Command', script]);
			const result = await cmd.execute();
			
			const commandResult: ShellCommandResult = {
				success: result.code === 0,
				stdout: result.stdout,
				stderr: result.stderr,
				exitCode: result.code
			};

			lastResult.value = commandResult;
			return commandResult;

		} catch (err) {
			error.value = `Failed to execute PowerShell: ${err}`;
			console.error('PowerShell command error:', err);
			return null;
		}
	};

	// Execute Bash command (Linux/macOS)
	const executeBash = async (script: string): Promise<ShellCommandResult | null> => {
		try {
			const cmd = useTauriShellCommand.create('bash-exec', ['-c', script]);
			const result = await cmd.execute();
			
			const commandResult: ShellCommandResult = {
				success: result.code === 0,
				stdout: result.stdout,
				stderr: result.stderr,
				exitCode: result.code
			};

			lastResult.value = commandResult;
			return commandResult;

		} catch (err) {
			error.value = `Failed to execute Bash: ${err}`;
			console.error('Bash command error:', err);
			return null;
		}
	};

	// Generate file using shell command
	const generateFileWithCommand = async (
		filePath: string, 
		content: string, 
		command: string = 'echo'
	): Promise<boolean> => {
		try {
			// Use echo to write content to file
			const result = await executeCommand(command, [content, '>', filePath]);
			return result?.success || false;
		} catch (err) {
			console.error('File generation error:', err);
			return false;
		}
	};

	// Convert data to various formats using shell commands
	const convertDataToFormat = async (
		data: any, 
		format: string, 
		outputPath: string
	): Promise<boolean> => {
		const jsonData = JSON.stringify(data, null, 2);
		
		switch (format.toLowerCase()) {
			case 'yaml':
				// Use PowerShell to convert JSON to YAML (requires yq or similar tool)
				const yamlScript = `$json = '${jsonData.replace(/'/g, "''")}'; $yaml = $json | ConvertFrom-Json | ConvertTo-Yaml; $yaml | Out-File -FilePath '${outputPath}' -Encoding UTF8`;
				const result = await executePowerShell(yamlScript);
				return result?.success || false;

			case 'xml':
				// Use PowerShell to convert JSON to XML
				const xmlScript = `$json = '${jsonData.replace(/'/g, "''")}'; $obj = $json | ConvertFrom-Json; $xml = $obj | ConvertTo-Xml -As String; $xml | Out-File -FilePath '${outputPath}' -Encoding UTF8`;
				const xmlResult = await executePowerShell(xmlScript);
				return xmlResult?.success || false;

			case 'csv':
				// Use PowerShell to convert JSON to CSV
				const csvScript = `$json = '${jsonData.replace(/'/g, "''")}'; $obj = $json | ConvertFrom-Json; if ($obj -is [array]) { $obj | Export-Csv -Path '${outputPath}' -NoTypeInformation } else { $obj | ConvertTo-Csv -NoTypeInformation | Out-File -FilePath '${outputPath}' -Encoding UTF8 }`;
				const csvResult = await executePowerShell(csvScript);
				return csvResult?.success || false;

			default:
				// For other formats, just write as text
				return generateFileWithCommand(outputPath, jsonData);
		}
	};

	// Get system information
	const getSystemInfo = async (): Promise<Record<string, string> | null> => {
		try {
			const results: Record<string, string> = {};
			
			// Get platform
			const platformResult = await executePowerShell('Write-Output $env:OS');
			if (platformResult?.success) {
				results.platform = platformResult.stdout.trim();
			}

			// Get version
			const versionResult = await executePowerShell('Write-Output (Get-WmiObject -Class Win32_OperatingSystem).Version');
			if (versionResult?.success) {
				results.version = versionResult.stdout.trim();
			}

			// Get architecture
			const archResult = await executePowerShell('Write-Output $env:PROCESSOR_ARCHITECTURE');
			if (archResult?.success) {
				results.architecture = archResult.stdout.trim();
			}

			// Get username
			const userResult = await executePowerShell('Write-Output $env:USERNAME');
			if (userResult?.success) {
				results.username = userResult.stdout.trim();
			}

			return results;
		} catch (err) {
			console.error('System info error:', err);
			return null;
		}
	};

	// Install tools if needed
	const installTool = async (toolName: string): Promise<boolean> => {
		try {
			let installCommand = '';
			
			switch (toolName.toLowerCase()) {
				case 'yq':
					// Install yq for YAML processing
					installCommand = 'powershell -Command "choco install yq -y"';
					break;
				case 'jq':
					// Install jq for JSON processing
					installCommand = 'powershell -Command "choco install jq -y"';
					break;
				case 'pandoc':
					// Install pandoc for document conversion
					installCommand = 'powershell -Command "choco install pandoc -y"';
					break;
				default:
					return false;
			}

			const result = await executeCommand('cmd', ['/c', installCommand]);
			return result?.success || false;
		} catch (err) {
			console.error('Tool installation error:', err);
			return false;
		}
	};

	return {
		// State
		isExecuting,
		lastResult,
		error,
		
		// Methods
		executeCommand,
		executePowerShell,
		executeBash,
		generateFileWithCommand,
		convertDataToFormat,
		getSystemInfo,
		installTool
	};
}

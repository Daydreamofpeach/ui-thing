/**
 * Execute Command Utility
 * 
 * Cross-platform command execution using Tauri's invoke API with fallback for web.
 */

export interface CommandResult {
  success: boolean;
  output: string;
  error: string;
  code: number;
}

export interface CommandOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

/**
 * Execute a command using Tauri's invoke API with fallback for web
 */
export async function executeCommand(options: CommandOptions): Promise<CommandResult> {
  const { command, args = [], cwd, env, timeout = 30000 } = options;

  try {
    // Check if running in Tauri environment
    if ((import.meta as any).env?.TAURI_PLATFORM) {
      // Use Tauri invoke for desktop
      const { invoke } = await import("@tauri-apps/api/core");
      
      const result = await invoke("execute_command", {
        command,
        args,
        cwd,
        env,
        timeout
      }) as { success: boolean; output: string; error: string; code?: number };

      return {
        success: result.success,
        output: result.output || "",
        error: result.error || "",
        code: result.code || (result.success ? 0 : 1)
      };
    } else {
      // Web fallback - use browser APIs when possible
      return {
        success: false,
        output: "",
        error: "Command execution not available in web environment",
        code: 1
      };
    }
  } catch (error: any) {
    return {
      success: false,
      output: "",
      error: error.message || "Failed to execute command",
      code: 1
    };
  }
}


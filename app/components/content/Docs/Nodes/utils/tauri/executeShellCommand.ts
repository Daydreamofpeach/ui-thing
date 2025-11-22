/**
 * Execute Shell Command Utility
 * 
 * Execute command using Tauri Shell plugin (alternative method).
 */

export interface CommandResult {
  success: boolean;
  output: string;
  error: string;
  code: number;
}

/**
 * Execute command using Tauri Shell plugin (alternative method)
 */
export async function executeShellCommand(command: string, args: string[]): Promise<CommandResult> {
  try {
    if ((import.meta as any).env?.TAURI_PLATFORM) {
      const { Command } = await import("@tauri-apps/plugin-shell");
      
      const cmd = new Command(command, args);
      const result = await cmd.execute();

      return {
        success: (result.code ?? 0) === 0,
        output: result.stdout || "",
        error: result.stderr || "",
        code: result.code ?? 0
      };
    } else {
      // Use the wrapper from composables for web fallback
      const { useTauriShellCommand } = await import("~/composables/tauri");
      const cmd = useTauriShellCommand.create(command, args);
      const res = await cmd.execute();
      return {
        success: res.code === 0,
        output: res.stdout || "",
        error: res.stderr || "",
        code: res.code
      };
    }
  } catch (error: any) {
    return {
      success: false,
      output: "",
      error: error.message || "Failed to execute shell command",
      code: 1
    };
  }
}


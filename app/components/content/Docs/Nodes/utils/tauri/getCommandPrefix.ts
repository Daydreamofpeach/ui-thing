/**
 * Get Command Prefix Utility
 * 
 * Get OS-specific command prefixes.
 */

/**
 * Get OS-specific command prefixes
 */
export function getCommandPrefix(platform: string): string {
  switch (platform) {
    case "windows":
      return "powershell";
    case "darwin":
    case "linux":
      return "sh";
    default:
      return "sh";
  }
}


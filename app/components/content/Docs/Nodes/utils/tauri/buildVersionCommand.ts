/**
 * Build Version Command Utility
 * 
 * Build platform-specific command for version checking.
 */

import { detectPlatform } from "./detectPlatform";

export interface VersionCommand {
  command: string;
  args: string[];
}

/**
 * Build platform-specific command for version checking
 */
export function buildVersionCommand(tool: string, versionFlag: string = "--version"): VersionCommand {
  const platform = detectPlatform();
  
  if (platform === "windows") {
    return {
      command: tool,
      args: [versionFlag]
    };
  } else {
    // Linux/Mac - use 'which' to find tool, then run version
    return {
      command: tool,
      args: [versionFlag]
    };
  }
}


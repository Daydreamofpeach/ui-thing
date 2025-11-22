/**
 * Parse Version Utility
 * 
 * Parse version from command output.
 */

/**
 * Parse version from command output
 */
export function parseVersion(output: string, pattern: RegExp): string | null {
  const match = output.match(pattern);
  return match ? (match[1] || match[0]) : null;
}


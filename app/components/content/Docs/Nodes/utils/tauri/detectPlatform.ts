/**
 * Detect Platform Utility
 * 
 * Detect platform (Windows, Linux, macOS).
 */

/**
 * Detect platform (Windows, Linux, macOS)
 */
export function detectPlatform(): string {
  try {
    if ((import.meta as any).env?.TAURI_PLATFORM) {
      // @ts-ignore
      return window.__TAURI__?.os?.platform?.() || "unknown";
    }
    return navigator.platform.includes("Win") ? "windows" 
         : navigator.platform.includes("Mac") ? "darwin"
         : "linux";
  } catch {
    return "unknown";
  }
}


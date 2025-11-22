/**
 * Composable for opening external URLs
 * 
 * Provides a consistent, proven method for opening URLs in:
 * - Default browser (via Tauri shell plugin)
 * - Fallback to window.open for non-Tauri environments
 * 
 * Usage:
 * ```typescript
 * const { openExternalUrl } = useExternalUrl();
 * await openExternalUrl('https://github.com/user/repo');
 * ```
 */

export function useExternalUrl() {
	/**
	 * Open a URL in the default browser using Tauri's shell plugin
	 * Falls back to window.open if Tauri is not available
	 * 
	 * @param url - The URL to open
	 * @param fallbackTitle - Optional title for window.open fallback
	 */
	const openExternalUrl = async (url: string, fallbackTitle: string = "_blank"): Promise<boolean> => {
		if (!url || url === "#") {
			console.error("❌ Invalid URL provided:", url);
			return false;
		}

		console.log("🌐 Opening external URL:", url);

		try {
			// PROVEN METHOD: Use Tauri shell plugin to open in default browser
			const { invoke } = await import("@tauri-apps/api/core");
			await invoke("plugin:shell|open", { path: url });
			console.log("✅ URL opened in browser via Tauri");
			return true;
		} catch (error) {
			console.warn("⚠️ Tauri shell failed, trying fallback:", error);
			
			// Fallback to window.open for non-Tauri or error cases
			try {
				window.open(url, fallbackTitle);
				console.log("✅ URL opened via window.open");
				return true;
			} catch (fallbackError) {
				console.error("❌ Failed to open URL:", fallbackError);
				return false;
			}
		}
	};

	/**
	 * Open multiple URLs sequentially
	 * @param urls - Array of URLs to open
	 */
	const openMultipleUrls = async (urls: string[]): Promise<void> => {
		for (const url of urls) {
			await openExternalUrl(url);
			// Small delay to prevent browser from blocking multiple popups
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	};

	return {
		openExternalUrl,
		openMultipleUrls
	};
}


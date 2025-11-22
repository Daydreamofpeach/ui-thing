import { useToast } from "#imports";
import { ref } from "vue";
import { localhostHtmlServer } from "~/utils/localhostHtmlServer";

export function useWebviewOperations() {
	const toast = useToast();
	const isWebviewLoading = ref(false);

	/**
	 * Load URL content in a webview node
	 */
	const loadUrlContent = (nodeId: string, url: string, updateNodeData: (nodeId: string, key: string, value: any) => void, htmlContent?: string) => {
		if (!url) return;

		try {
			// Check if we need to convert to localhost URL for production builds
			let finalUrl = url;

			if (localhostHtmlServer.shouldUseLocalhost(url)) {
				finalUrl = localhostHtmlServer.convertToLocalhostUrl(url, htmlContent);
				console.log("🔄 Converted URL to localhost format:", { original: url, converted: finalUrl });
			}

			isWebviewLoading.value = true;
			updateNodeData(nodeId, "url", finalUrl);
			updateNodeData(nodeId, "status", "loading");
			console.log("Loading URL:", finalUrl);
		} catch {
			console.error("Invalid URL:", url);
			toast.add({
				title: "Error",
				description: "Invalid URL format",
				color: "error"
			});
		}
	};

	/**
	 * Switch webview to HTML mode
	 */
	const switchToHtmlMode = (nodeId: string, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		updateNodeData(nodeId, "url", "");
		console.log("Switched to HTML mode for node:", nodeId);
	};

	/**
	 * Switch webview to URL mode
	 */
	const switchToUrlMode = (nodeId: string, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		updateNodeData(nodeId, "htmlContent", "");
		console.log("Switched to URL mode for node:", nodeId);
	};

	/**
	 * Handle webview load event
	 */
	const onWebviewLoad = (nodeId: string, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		isWebviewLoading.value = false;
		updateNodeData(nodeId, "status", "loaded");
		console.log("Webview loaded successfully for node:", nodeId);
	};

	/**
	 * Handle webview error event
	 */
	const onWebviewError = (nodeId: string, event: Event, updateNodeData: (nodeId: string, key: string, value: any) => void) => {
		isWebviewLoading.value = false;
		updateNodeData(nodeId, "status", "error");
		console.error("Webview load error for node:", nodeId, event);
	};

	/**
	 * Open URL in Tauri webview window
	 */
	const openInTauriWebview = async (nodeId: string, url: string, htmlContent?: string) => {
		if (!url) return;

		try {
			// Check if we need to convert to localhost URL for production builds
			let finalUrl = url;

			if (localhostHtmlServer.shouldUseLocalhost(url)) {
				finalUrl = localhostHtmlServer.convertToLocalhostUrl(url, htmlContent);
				console.log("🔄 Converting URL for Tauri webview:", { original: url, converted: finalUrl });
			}

			const webviewId = `webview-${nodeId}-${Date.now()}`;

			const webview = new (window as any).useTauriWebviewWindowWebviewWindow(webviewId, {
				title: `Webview - ${url}`,
				url: finalUrl,
				width: 1280,
				height: 720,
				center: true,
				resizable: true,
				minimizable: true,
				maximizable: true,
				closable: true
			});

			webview.once("tauri://created", () => {
				console.log("Tauri webview created successfully with URL:", finalUrl);
				toast.add({
					title: "Success",
					description: "Tauri webview created",
					color: "success"
				});
			});

			webview.once("tauri://error", (error: any) => {
				console.error("Tauri webview error:", error);
				toast.add({
					title: "Error",
					description: error.payload || "Failed to create webview",
					color: "error"
				});
			});
		} catch (err) {
			console.error("Failed to open in Tauri webview:", err);
			toast.add({
				title: "Error",
				description: "Failed to create Tauri webview",
				color: "error"
			});
		}
	};

	/**
	 * Open URL in external browser
	 */
	const openInExternalBrowser = (url: string) => {
		if (!url) return;

		try {
			if (typeof window !== "undefined" && (window as any).__TAURI__) {
				const { open } = (window as any).__TAURI__.shell;
				open(url);
			} else {
				window.open(url, "_blank");
			}

			toast.add({
				title: "Success",
				description: "Opened in external browser",
				color: "success"
			});
		} catch (err) {
			console.error("Failed to open in external browser:", err);
			toast.add({
				title: "Error",
				description: "Failed to open in external browser",
				color: "error"
			});
		}
	};

	/**
	 * Create HTML content from URL for WebviewCodeEditor
	 */
	const createUrlHtml = (url: string) => {
		return `<!DOCTYPE html>
<html>
<head>
    <title>Web Preview</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: white;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .url-header {
            background: rgba(59, 130, 246, 0.1);
            border-bottom: 1px solid rgba(59, 130, 246, 0.3);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .url-icon {
            width: 20px;
            height: 20px;
            color: rgba(59, 130, 246, 0.8);
        }
        .url-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }
        .webview-frame {
            flex: 1;
            border: none;
            background: white;
        }
        .loading-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }
        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top: 3px solid rgba(59, 130, 246, 1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .loading-text {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="url-header">
        <svg class="url-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
        <span class="url-text">${url}</span>
    </div>
    <iframe 
        class="webview-frame" 
        src="${url}" 
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onload="console.log('URL loaded successfully')"
        onerror="console.error('URL load error')"
    ></iframe>
</body>
</html>`;
	};

	return {
		isWebviewLoading,
		loadUrlContent,
		switchToHtmlMode,
		switchToUrlMode,
		onWebviewLoad,
		onWebviewError,
		openInTauriWebview,
		openInExternalBrowser,
		createUrlHtml
	};
}

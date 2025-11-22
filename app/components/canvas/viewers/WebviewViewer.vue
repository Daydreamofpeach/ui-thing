<template>
	<div class="webview-viewer">
		<div class="webview-header">
			<div class="header-left">
				<Icon name="lucide:globe" class="header-icon" />
				<span class="header-title">Web Preview</span>
			</div>
			<div class="header-actions">
				<button
					class="action-button open-browser-button"
					@click="openInTauriWebview"
				>
					Open in Tauri Webview
				</button>
				<button
					class="action-button refresh-button"
					@click="refresh"
				>
					Refresh
				</button>
			</div>
		</div>
		<div class="webview-content">
			<div v-if="isLoading" class="loading-container">
				<div class="loading-text">
					Loading preview...
				</div>
			</div>
			<div v-else-if="error" class="error-container">
				<div class="error-text">
					{{ error }}
				</div>
			</div>
			<div v-else-if="htmlContent" class="webview-iframe-container">
				<iframe
					ref="webviewFrame"
					:src="iframeSrc"
					class="webview-iframe"
					sandbox="allow-scripts"
					@load="onIframeLoad"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { localhostHtmlServer } from "~/utils/localhostHtmlServer";

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"file-opened": [fileName: string, filePath: string]
		error: [error: string]
	}>();

	// Declare the auto-imported Tauri webview window
	declare const useTauriWebviewWindowWebviewWindow: any;

	interface Props {
		htmlContent: string
		fileName?: string
		filePath?: string
	}

	const webviewFrame = ref<HTMLIFrameElement>();
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const blobUrl = ref<string | null>(null);

	const iframeSrc = computed(() => {
		// If we have a file path, use it directly
		if (props.filePath) {
			return `file://${props.filePath}`;
		}

		// For production builds, check if we should serve through localhost
		if (props.htmlContent && typeof window !== "undefined" && (window as any).__TAURI__) {
			// Use localhost server for HTML content in production
			return localhostHtmlServer.serveHtmlContent(props.htmlContent);
		}

		// Otherwise use blob URL (development)
		if (blobUrl.value) {
			return blobUrl.value;
		}
		return "about:blank";
	});

	const createBlobUrl = (htmlContent: string) => {
		try {
			const blob = new Blob([htmlContent], { type: "text/html" });
			const url = URL.createObjectURL(blob);
			return url;
		} catch (err) {
			console.error("Failed to create blob URL:", err);
			return null;
		}
	};

	const refresh = () => {
		console.log("WebviewViewer: Manual refresh triggered");
		if (props.filePath) {
			// If we have a file path, reload the iframe
			if (webviewFrame.value) {
				const timestamp = Date.now();
				webviewFrame.value.src = `file://${props.filePath}?t=${timestamp}`;
			}
		} else if (props.htmlContent) {
			// Otherwise reload from HTML content
			loadHtmlContent(props.htmlContent);
		}
	};

	const loadHtmlContent = async (htmlContent: string) => {
		isLoading.value = true;
		error.value = null;

		try {
			// Clean up previous blob URL
			if (blobUrl.value) {
				URL.revokeObjectURL(blobUrl.value);
			}

			// Create new blob URL
			const newBlobUrl = createBlobUrl(htmlContent);
			if (!newBlobUrl) {
				throw new Error("Failed to create preview URL");
			}

			blobUrl.value = newBlobUrl;
			isLoading.value = false;

			// Emit file opened event
			const fileName = props.fileName || "preview.html";
			emit("file-opened", fileName, newBlobUrl);
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to load HTML content";
			isLoading.value = false;
			emit("error", error.value);
		}
	};

	const openInTauriWebview = async () => {
		try {
			if (props.htmlContent) {
				// Determine the URL to use for the webview
				let webviewUrl: string;

				if (typeof window !== "undefined" && (window as any).__TAURI__) {
					// For production builds, use localhost server
					webviewUrl = localhostHtmlServer.serveHtmlContent(props.htmlContent);
					console.log("Using localhost URL for Tauri webview:", webviewUrl);
				} else {
					// For development, use blob URL
					webviewUrl = blobUrl.value || "about:blank";
					console.log("Using blob URL for development webview:", webviewUrl);
				}

				// Create a new Tauri webview window
				const webviewId = `webview-${Date.now()}`;
				const webview = new useTauriWebviewWindowWebviewWindow(webviewId, {
					title: `Web Preview - ${props.fileName || "preview.html"}`,
					url: webviewUrl,
					width: 1280,
					height: 720,
					center: true,
					resizable: true,
					minimizable: true,
					maximizable: true,
					closable: true
				});

				webview.once("tauri://created", () => {
					console.log("Tauri webview created successfully with URL:", webviewUrl);
					// Set the URL again to ensure it loads properly
					webview.setUrl(webviewUrl);
				});

				webview.once("tauri://error", (error: any) => {
					console.error("Tauri webview error:", error);
					emit("error", `Failed to create webview: ${error}`);
				});
			}
		} catch (err) {
			console.error("Failed to open in Tauri webview:", err);
			emit("error", `Failed to create webview: ${err}`);
		}
	};

	const onIframeLoad = () => {
		isLoading.value = false;
	};

	// Watch for HTML content changes
	watch(() => props.htmlContent, (newContent) => {
		console.log("WebviewViewer: HTML content changed, reloading...");
		if (newContent) {
			if (props.filePath) {
				// If we have a file path, refresh the iframe
				refresh();
			} else {
				// Otherwise load from HTML content
				loadHtmlContent(newContent);
			}
		}
	}, { immediate: true });

	// Watch for file path changes and refresh iframe
	watch(() => props.filePath, (newFilePath, oldFilePath) => {
		if (newFilePath && newFilePath !== oldFilePath) {
			console.log("WebviewViewer: File path changed, refreshing iframe...", newFilePath);
			// Force iframe refresh by updating the src with a timestamp to bust cache
			if (webviewFrame.value) {
				const timestamp = Date.now();
				webviewFrame.value.src = `file://${newFilePath}?t=${timestamp}`;
			}
		}
	});

	// Cleanup on unmount
	onMounted(() => {
		return () => {
			if (blobUrl.value) {
				URL.revokeObjectURL(blobUrl.value);
			}
		};
	});
</script>

<style scoped>
.webview-viewer {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #111827;
	border-radius: 0.5rem;
	border: 1px solid #374151;
}

.webview-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	border-bottom: 1px solid #374151;
	background: rgba(31, 41, 55, 0.5);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.header-icon {
	width: 1rem;
	height: 1rem;
	color: #3b82f6;
}

.header-title {
	font-size: 0.875rem;
	font-weight: 500;
	color: #3b82f6;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.action-button {
	padding: 0.25rem 0.5rem;
	font-size: 0.75rem;
	border-radius: 0.25rem;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
}

.open-browser-button {
	background: rgba(59, 130, 246, 0.2);
	color: #60a5fa;
}

.open-browser-button:hover {
	background: rgba(59, 130, 246, 0.3);
}

.refresh-button {
	background: rgba(107, 114, 128, 0.2);
	color: #9ca3af;
}

.refresh-button:hover {
	background: rgba(107, 114, 128, 0.3);
}

.webview-content {
	flex: 1;
	position: relative;
}

.loading-container,
.error-container {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 16rem;
}

.loading-text {
	color: #9ca3af;
}

.error-text {
	color: #f87171;
}

.webview-iframe-container {
	width: 100%;
	height: 100%;
}

.webview-iframe {
	width: 100%;
	height: 100%;
	border: 0;
}
</style>

/**
 * Localhost HTML Server Utility
 * Handles serving HTML content through Tauri's localhost plugin
 * for production builds where blob/data URLs don't work properly
 */

interface HtmlContentItem {
	id: string
	html: string
	contentType?: string
	timestamp: number
}

class LocalhostHtmlServer {
	private contentMap: Map<string, HtmlContentItem> = new Map();
	private baseUrl: string;

	constructor() {
		// Use the localhost plugin port (9527 as configured in lib.rs)
		this.baseUrl = "http://localhost:9527";
	}

	/**
	 * Serve HTML content and return a URL
	 * For production builds, we'll use data URLs but the BrowserNode will use srcdoc instead
	 */
	serveHtmlContent(htmlContent: string, contentType: string = "text/html"): string {
		const id = this.generateContentId();
		const timestamp = Date.now();

		// Store the content for potential future use
		this.contentMap.set(id, {
			id,
			html: htmlContent,
			contentType,
			timestamp
		});

		// Create data URL - BrowserNode will detect this and use srcdoc instead
		// This ensures the HTML content is available for the srcdoc attribute
		const dataUrl = this.createDataUrl(htmlContent, contentType);

		console.log(`🌐 Created HTML content URL:`, {
			id,
			url: `${dataUrl.substring(0, 100)}...`,
			contentLength: htmlContent.length,
			isDataUrl: dataUrl.startsWith("data:")
		});

		return dataUrl;
	}

	/**
	 * Create data URL from HTML content
	 */
	private createDataUrl(htmlContent: string, contentType: string): string {
		const base64Content = btoa(unescape(encodeURIComponent(htmlContent)));
		return `data:${contentType};base64,${base64Content}`;
	}

	/**
	 * Get HTML content by ID
	 */
	getHtmlContent(id: string): HtmlContentItem | null {
		return this.contentMap.get(id) || null;
	}

	/**
	 * Check if URL should use localhost
	 */
	shouldUseLocalhost(url: string): boolean {
		// Use localhost for:
		// 1. Blob URLs (don't work in production)
		// 2. Data URLs (don't work in production Tauri webviews)
		// 3. Localhost URLs already (for dev servers)
		// 4. HTTP/HTTPS URLs that aren't external
		return (
			url.startsWith("blob:")
			|| url.startsWith("data:")
			|| url.includes("localhost:")
			|| url.startsWith("http://127.0.0.1:")
			|| url.startsWith("http://localhost:3000")
			|| url.startsWith("http://localhost:5173")
			|| url.startsWith("http://localhost:8080")
		);
	}

	/**
	 * Convert URL to localhost-compatible format
	 */
	convertToLocalhostUrl(url: string, htmlContent?: string): string {
		// If it's already using our localhost plugin (port 9527), return as is
		if (url.includes("localhost:9527")) {
			return url;
		}

		// If we have HTML content and it's a blob/data URL, serve it
		if (htmlContent && (url.startsWith("blob:") || url.startsWith("data:"))) {
			return this.serveHtmlContent(htmlContent);
		}

		// For localhost URLs (dev servers), convert to use the localhost plugin
		if (url.includes("localhost:") || url.includes("127.0.0.1:")) {
			try {
				// Try to parse the URL
				const urlObj = new URL(url);
				const port = urlObj.port || (urlObj.protocol === "https:" ? "443" : "80");
				const path = urlObj.pathname + urlObj.search + urlObj.hash;

				// Use the localhost plugin to proxy the request
				const proxyUrl = `${this.baseUrl}/proxy/${port}${path}`;
				console.log(`🔄 Converting localhost URL to use plugin:`, { original: url, proxy: proxyUrl });
				return proxyUrl;
			} catch (error) {
				console.warn("Failed to parse URL for localhost conversion:", error);
				return url;
			}
		}

		// Return original URL if no conversion needed
		return url;
	}

	/**
	 * Generate unique content ID
	 */
	private generateContentId(): string {
		return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Clean up old content entries
	 */
	cleanup(maxAge: number = 5 * 60 * 1000): void { // 5 minutes default
		const now = Date.now();
		for (const [id, item] of this.contentMap.entries()) {
			if (now - item.timestamp > maxAge) {
				this.contentMap.delete(id);
				console.log(`🧹 Cleaned up old HTML content: ${id}`);
			}
		}
	}

	/**
	 * Get content map for debugging
	 */
	getContentMap(): Map<string, HtmlContentItem> {
		return this.contentMap;
	}
}

// Create singleton instance
export const localhostHtmlServer = new LocalhostHtmlServer();

// Auto-cleanup every 2 minutes
if (typeof window !== "undefined") {
	setInterval(() => {
		localhostHtmlServer.cleanup();
	}, 2 * 60 * 1000);
}

export default localhostHtmlServer;



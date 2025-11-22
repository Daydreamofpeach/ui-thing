import { computed, type Ref } from "vue";
import type { Node } from "@vue-flow/core";

/**
 * Composable for managing browser node viewports (mobile, tablet, desktop, 4K)
 */
export function useViewportManagement(
	viewportNodes: Ref<Node[]>,
	browserNodes: Ref<Node[]>,
	addViewportNode: (type: string, data: any, position: any) => void,
	removeNode: (nodeId: string) => void,
	updateNodeData: (nodeId: string, key: string, value: any) => void
) {
	/**
	 * Get active viewport types for a specific browser node
	 */
	const getActiveViewportTypes = (browserNodeId: string): string[] => {
		const childViewports = viewportNodes.value.filter(
			(vp) => vp.data?.parentBrowserId === browserNodeId
		);
		return childViewports.map((vp) => vp.data?.viewportType).filter(Boolean);
	};

	/**
	 * Handle viewport spawning or toggling
	 * If viewport exists, remove it. If not, create it.
	 */
	const handleSpawnViewport = (viewportType: string, url: string, sourceNodeId: string) => {
		console.log("📱 handleSpawnViewport:", { viewportType, url, sourceNodeId });

		try {
			// Check if viewport already exists
			const existingViewport = viewportNodes.value.find(
				(vp) =>
					vp.data?.parentBrowserId === sourceNodeId &&
					vp.data?.viewportType === viewportType
			);

			if (existingViewport) {
				// Toggle off - remove viewport
				console.log(`🔄 Toggling OFF ${viewportType} viewport`);
				handleCloseViewport(existingViewport.id);
				return;
			}

			// Create new viewport
			console.log(`📱 Spawning new ${viewportType} viewport`);
			const sourceNode = browserNodes.value.find((n) => n.id === sourceNodeId);
			if (!sourceNode) {
				console.error("❌ Source browser node not found:", sourceNodeId);
				return;
			}

			// Position viewport to the right of source
			const viewportPosition = {
				x: sourceNode.position.x + 1000,
				y: sourceNode.position.y
			};

			// Get device dimensions
			const deviceSizes = {
				mobile: { width: 375, height: 667 },
				tablet: { width: 768, height: 1024 },
				desktop: { width: 1920, height: 1080 },
				"4k": { width: 3840, height: 2160 }
			};

			const size = deviceSizes[viewportType as keyof typeof deviceSizes];

			// Create viewport node
			addViewportNode("viewportNode", {
				url,
				viewportType,
				parentBrowserId: sourceNodeId,
				width: size.width,
				height: size.height,
				status: "loading"
			}, viewportPosition);

			// Update source browser to track child viewport
			const currentChildren = sourceNode.data?.childViewportIds || [];
			const newViewportId = `viewport-${viewportType}-${Date.now()}`;
			updateNodeData(sourceNodeId, "childViewportIds", [...currentChildren, newViewportId]);

			console.log(`✅ Created ${viewportType} viewport`);
		} catch (error) {
			console.error("❌ Error spawning viewport:", error);
		}
	};

	/**
	 * Close/remove a viewport node
	 */
	const handleCloseViewport = (viewportId: string) => {
		console.log("🗑️ Closing viewport:", viewportId);

		try {
			const viewport = viewportNodes.value.find((vp) => vp.id === viewportId);
			if (!viewport) {
				console.warn("⚠️ Viewport not found:", viewportId);
				return;
			}

			// Remove from parent browser's tracking
			const parentBrowserId = viewport.data?.parentBrowserId;
			if (parentBrowserId) {
				const parentBrowser = browserNodes.value.find((n) => n.id === parentBrowserId);
				if (parentBrowser) {
					const updatedChildren = (parentBrowser.data?.childViewportIds || []).filter(
						(id: string) => id !== viewportId
					);
					updateNodeData(parentBrowserId, "childViewportIds", updatedChildren);
				}
			}

			// Remove the viewport node
			removeNode(viewportId);
			console.log("✅ Viewport closed");
		} catch (error) {
			console.error("❌ Error closing viewport:", error);
		}
	};

	/**
	 * Handle URL change propagation to child viewports
	 */
	const handleBrowserUrlChanged = (browserNodeId: string, newUrl: string) => {
		console.log("🔄 URL changed for browser:", browserNodeId, "→", newUrl);

		// Update all child viewports
		const childViewports = viewportNodes.value.filter(
			(vp) => vp.data?.parentBrowserId === browserNodeId
		);

		childViewports.forEach((viewport) => {
			console.log(`  📱 Updating viewport ${viewport.data?.viewportType} URL`);
			updateNodeData(viewport.id, "url", newUrl);
			updateNodeData(viewport.id, "status", "loading");
		});
	};

	/**
	 * Handle refresh propagation to child viewports
	 */
	const handleBrowserRefresh = (browserNodeId: string) => {
		console.log("🔄 Refresh requested for browser:", browserNodeId);

		const childViewports = viewportNodes.value.filter(
			(vp) => vp.data?.parentBrowserId === browserNodeId
		);

		childViewports.forEach((viewport) => {
			const currentUrl = viewport.data?.url;
			if (currentUrl) {
				const timestamp = Date.now();
				const refreshUrl = currentUrl.includes("?")
					? `${currentUrl}&t=${timestamp}`
					: `${currentUrl}?t=${timestamp}`;
				updateNodeData(viewport.id, "url", refreshUrl);
				updateNodeData(viewport.id, "status", "loading");
			}
		});
	};

	/**
	 * Handle external browser opening for all viewports
	 */
	const handleBrowserOpenExternal = (browserNodeId: string) => {
		console.log("🌐 Opening external for browser:", browserNodeId);

		const childViewports = viewportNodes.value.filter(
			(vp) => vp.data?.parentBrowserId === browserNodeId
		);

		// This would trigger external browser opening for each viewport
		// Implementation depends on Tauri shell integration
		console.log(`  Opening ${childViewports.length} child viewports externally`);
	};

	return {
		getActiveViewportTypes,
		handleSpawnViewport,
		handleCloseViewport,
		handleBrowserUrlChanged,
		handleBrowserRefresh,
		handleBrowserOpenExternal
	};
}


import type { Ref } from "vue";

/**
 * Form Handlers
 * Handles form submission, browser nodes, and viewport operations
 */
export function useFormHandlers(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	viewportNodes: Ref<any[]>,
	browserNodes: Ref<any[]>,
	updateNodeDataBase: (nodeId: string, key: string, value: any) => void,
	emit: any,
	saveFormChainConfiguration: (browserNodeId: string, formTitle: string, projectId: string) => Promise<void>,
	restoreFormChain: (formData: any, templateConfiguredNodeId: string) => Promise<void>
) {
	/**
	 * Handle form submission success
	 */
	const handleFormSubmitted = (browserNodeId: string, formData: any, chain: any) => {
		console.log("✅ Form submitted successfully:", { browserNodeId, formData, chain });

		// Update browser node to show successful submission
		updateNodeDataBase(browserNodeId, "lastSubmission", {
			timestamp: new Date().toISOString(),
			status: "success",
			data: formData
		});

		// Log success (toast functionality can be added later if needed)
		console.log(`✅ Form data sent via ${chain.hookConfig?.name || "hook"}`);
	};

	/**
	 * Handle form submission error
	 */
	const handleFormSubmissionError = (browserNodeId: string, error: Error) => {
		console.error("❌ Form submission error:", { browserNodeId, error });

		// Update browser node to show error
		updateNodeDataBase(browserNodeId, "lastSubmission", {
			timestamp: new Date().toISOString(),
			status: "error",
			error: error.message
		});

		// Log error (toast functionality can be added later if needed)
		console.error(`❌ ${error.message || "Failed to submit form data"}`);
	};

	/**
	 * Handle submission chain update
	 */
	const handleSubmissionChainUpdated = (browserNodeId: string, chain: any) => {
		console.log("🔗 Submission chain updated:", { browserNodeId, chain });

		// Update browser node with chain status
		updateNodeDataBase(browserNodeId, "submissionChain", {
			hasHook: chain.hasHook,
			hasTransport: chain.hasTransport,
			isConfigured: chain.isConfigured,
			hookConfig: chain.hookConfig,
			transportConfig: chain.transportConfig
		});

		// CRITICAL: Also store hook config directly in browser node data for form submission handling
		if (chain.hookConfig && chain.hookConfig.token) {
			updateNodeDataBase(browserNodeId, "hookConfig", chain.hookConfig);
			console.log("✅ Hook config stored directly in browser node data for form submissions");
		}
	};

	/**
	 * Handle transport attached event
	 */
	const handleTransportAttached = (transportData: any, transportNodeId: string) => {
		console.log("🚛 Transport attached:", { transportData, transportNodeId });

		// Find the hook node this transport is attached to
		const attachedToHookId = allNodes.value.find((n: any) => n.id === transportNodeId)?.data?.attachedToHookId;

		if (attachedToHookId) {
			// Find the browser node connected to this hook
			const connectedBrowserNode = browserNodes.value.find((b: any) =>
				b.data?.connectedHookId === attachedToHookId
			);

			if (connectedBrowserNode) {
				console.log("✅ Updating browser node with transport config:", connectedBrowserNode.id);

				// Store transport config in browser node
				updateNodeDataBase(connectedBrowserNode.id, "transportConfig", {
					id: transportData.id,
					type: transportData.type,
					target: transportData.target,
					name: transportData.name
				});

				console.log("✅ Transport config stored in browser node for form submissions");
			}
		}
	};

	/**
	 * Handle spawn viewport for different devices
	 */
	const handleSpawnViewport = (device: string, url: string, browserNodeId: string, htmlContent?: string) => {
		console.log("🔄 Spawning viewport:", { device, url, browserNodeId, htmlContentLength: htmlContent?.length || 0 });

		// Check if viewport already exists for this browser node
		const existingViewport = viewportNodes.value.find((vp) =>
			vp.data?.parentBrowserId === browserNodeId && vp.data?.viewportType === device
		);

		if (existingViewport) {
			console.log("📱 Viewport already exists, removing:", existingViewport.id);
			// Remove existing viewport
			const index = viewportNodes.value.findIndex((vp) => vp.id === existingViewport.id);
			if (index > -1) {
				viewportNodes.value.splice(index, 1);
			}
			// Remove edges connected to this viewport
			edges.value = edges.value.filter((edge) =>
				edge.source !== existingViewport.id && edge.target !== existingViewport.id
			);
			return;
		}

		// Device size presets
		const deviceSizes = {
			mobile: { width: 375, height: 667 },
			tablet: { width: 768, height: 1024 },
			desktop: { width: 1920, height: 1080 },
			"4k": { width: 3840, height: 2160 }
		};

		const size = deviceSizes[device as keyof typeof deviceSizes];
		if (!size) {
			console.error("❌ Unknown device type:", device);
			return;
		}

		// Find browser node position
		const browserNode = allNodes.value.find((n) => n.id === browserNodeId);
		if (!browserNode) {
			console.error("❌ Browser node not found:", browserNodeId);
			return;
		}

		// Create new viewport node with proper sizing based on ViewportNode component
		const viewportId = `viewport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const viewportNode = {
			id: viewportId,
			type: "viewportNode",
			position: {
				x: browserNode.position.x + 650,
				y: browserNode.position.y + 50
			},
			data: {
				label: `${device.charAt(0).toUpperCase() + device.slice(1)} Viewport`,
				url,
				htmlContent, // CRITICAL: Include HTML content for form previews
				viewportType: device, // CRITICAL: use viewportType, not deviceType
				parentBrowserId: browserNodeId, // CRITICAL: use parentBrowserId, not browserNodeId
				width: size.width,
				height: size.height,
				status: "active"
			},
			// CRITICAL FIX: Set actual node dimensions to match device size + header (100px)
			style: { width: `${size.width}px`, height: `${size.height + 100}px` },
			draggable: true,
			selectable: true,
			hidden: false
		};

		// Add viewport node
		viewportNodes.value.push(viewportNode);

		// Create edge from browser to viewport
		const edge = {
			id: `edge_${browserNodeId}_${viewportId}_${Date.now()}`,
			source: browserNodeId,
			target: viewportId,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			animated: true,
			style: { stroke: "#06b6d4", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "#06b6d4" }
		};
		edges.value.push(edge);

		console.log(`✅ Created ${device} viewport:`, viewportId);
	};

	/**
	 * Handle browser URL changed
	 */
	const handleBrowserUrlChanged = (browserNodeId: string, url: string) => {
		console.log("🔗 Browser URL changed:", { browserNodeId, url });
		// URL change propagation logic can be added here
	};

	/**
	 * Handle browser refresh
	 */
	const handleBrowserRefresh = (browserNodeId: string) => {
		console.log("🔄 Browser refresh requested:", browserNodeId);
		// Refresh logic can be added here
	};

	/**
	 * Handle browser open in external browser
	 */
	const handleBrowserOpenExternal = (browserNodeId: string) => {
		console.log("🌐 Opening browser externally:", browserNodeId);
		// External browser opening logic can be added here
	};

	/**
	 * Handle close browser node
	 */
	const handleCloseBrowserNode = (nodeId: string) => {
		console.log("🗑️ Closing browser node:", nodeId);

		// Remove from browserNodes array
		const index = browserNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			browserNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		// Also close any child viewport nodes
		const connectedViewports = viewportNodes.value.filter((v: any) =>
			v.data?.browserNodeId === nodeId
		);
		connectedViewports.forEach((viewport: any) => {
			handleCloseViewport(viewport.id);
		});

		console.log("✅ Browser node closed and cleaned up");
	};

	/**
	 * Handle close viewport
	 */
	const handleCloseViewport = (nodeId: string) => {
		console.log("🗑️ Closing viewport node:", nodeId);

		// Remove from viewportNodes array
		const index = viewportNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			viewportNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Viewport node closed");
	};

	/**
	 * Handle save form chain configuration (delegates to composable)
	 */
	const handleSaveFormChainConfig = async (browserNodeId: string, formTitle: string, projectId: string) => {
		try {
			await saveFormChainConfiguration(browserNodeId, formTitle, projectId || "default");

			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Configuration Saved!",
				description: `Created template: "${formTitle} - Automation Chain"`,
				color: "success",
				icon: "i-lucide-check-circle"
			});

			emit("reloadComponents"); // Reload templates in sidebar
		} catch (error) {
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Save Failed",
				description: error instanceof Error ? error.message : "Failed to save form chain configuration",
				color: "error",
				icon: "i-lucide-x-circle"
			});
			console.error("❌ Save form chain error:", error);
		}
	};

	/**
	 * Handle restore form chain
	 */
	const handleRestoreFormChain = async (formData: any, templateConfiguredNodeId: string) => {
		try {
			console.log("🔄 Restoring form chain:", { formData, templateConfiguredNodeId });

			await restoreFormChain(formData, templateConfiguredNodeId);

			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Form Restored!",
				description: `Restored "${formData.formTitle || "form"}" chain`,
				color: "success",
				icon: "i-lucide-check-circle"
			});
		} catch (error) {
			console.error("❌ Restore form chain error:", error);

			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Restore Failed",
				description: error instanceof Error ? error.message : "Failed to restore form chain",
				color: "error",
				icon: "i-lucide-x-circle"
			});
		}
	};

	/**
	 * Handle create form preview edge
	 */
	const handleCreateFormPreviewEdge = (sourceId: string, targetId: string, label?: string, addEdges?: (edges: any[]) => void) => {
		console.log("🔧 CanvasPanel: handleCreateFormPreviewEdge called:", { sourceId, targetId, label });

		try {
			const edgeId = `edge-${sourceId}-${targetId}`;
			const newEdge = {
				id: edgeId,
				source: sourceId,
				target: targetId,
				type: "smoothstep",
				animated: true,
				style: {
					stroke: "#8b5cf6",
					strokeWidth: 2
				},
				markerEnd: {
					type: "arrowclosed",
					color: "#8b5cf6"
				},
				label: label || "Form Preview"
			};

			if (addEdges) {
				addEdges([newEdge]);
			}
			console.log("✅ CanvasPanel: Created edge:", edgeId);
		} catch (error) {
			console.error("❌ CanvasPanel: Error creating edge:", error);
		}
	};

	return {
		handleFormSubmitted,
		handleFormSubmissionError,
		handleSubmissionChainUpdated,
		handleTransportAttached,
		handleSpawnViewport,
		handleBrowserUrlChanged,
		handleBrowserRefresh,
		handleBrowserOpenExternal,
		handleCloseBrowserNode,
		handleCloseViewport,
		handleSaveFormChainConfig,
		handleRestoreFormChain,
		handleCreateFormPreviewEdge
	};
}


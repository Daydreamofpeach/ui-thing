import type { Ref } from "vue";

/**
 * Template Handlers
 * Handles template save, restore, chain operations, and form automation
 */
export function useTemplateHandlers(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	codeEditorNodes: Ref<any[]>,
	updateNodeDataBase: (nodeId: string, key: string, value: any) => void,
	vueFlowUpdateNode: any,
	vueFlowFitView: any,
	nodeCreatorRef: Ref<any>,
	emit: any
) {
	/**
	 * Handle template saved
	 */
	const handleTemplateSaved = (templateId: string) => {
		console.log("✅ Template saved successfully:", templateId);
		emit("templateSaved", templateId);
	};

	/**
	 * Handle template updated
	 */
	const handleTemplateUpdated = (nodeId: string, templateData: any) => {
		console.log("✅ Template updated:", { nodeId, templateData });
		updateNodeDataBase(nodeId, "templateData", templateData);
	};

	/**
	 * Handle save status changed
	 */
	const handleSaveStatusChanged = (status: "idle" | "saving" | "saved" | "error") => {
		console.log("💾 Save status changed:", status);
		emit("saveStatusChanged", status);
	};

	/**
	 * Handle show/hide form automation chain
	 */
	const handleShowFormAutomationChain = (_templateId: string, nodeId: string, shouldShow: boolean) => {
		console.log("═══════════════════════════════════════════");
		console.log(`👁️ ${shouldShow ? "SHOWING" : "HIDING"} FORM AUTOMATION CHAIN`);
		console.log("  Node ID:", nodeId);
		console.log("  Total nodes on canvas:", allNodes.value.length);
		console.log("═══════════════════════════════════════════");

		// Find all restored nodes - EXCLUDE formsPanelNode (not needed for form chain)
		const nodeTypesToShow = [
			"browserNode",
			"hookNode",
			"transportNode",
			"transportTemplateNode",
			"codeEditorNode" // Include code editors so they hide/show with chain
		];

		// Collect nodes to update
		const nodesToUpdate: any[] = [];
		allNodes.value.forEach((node: any) => {
			if (nodeTypesToShow.includes(node.type)) {
				console.log(`  Found node: ${node.type} (${node.id}), currently hidden: ${node.hidden}`);
				nodesToUpdate.push(node);
			}
		});

		console.log(`  Total nodes to ${shouldShow ? "show" : "hide"}: ${nodesToUpdate.length}`);

		// Update each node using VueFlow's updateNode
		nodesToUpdate.forEach((node: any) => {
			console.log(`  🔧 ${shouldShow ? "Showing" : "Hiding"} ${node.type} (${node.id})`);

			vueFlowUpdateNode(node.id, {
				hidden: !shouldShow,
				data: {
					...node.data,
					visible: shouldShow
				}
			});
		});

		console.log(`✅ ${shouldShow ? "Showed" : "Hid"} ${nodesToUpdate.length} chain nodes`);

		// If showing, center viewport on the visible nodes
		if (shouldShow && nodesToUpdate.length > 0) {
			console.log("🎯 Centering viewport on visible nodes...");
			setTimeout(() => {
				vueFlowFitView({ padding: 0.2, duration: 800 });
				console.log("✅ Viewport centered");
			}, 100);
		}

		console.log("═══════════════════════════════════════════");
	};

	/**
	 * Handle viewing form automation code - creates code editor nodes
	 */
	const handleViewFormAutomationCode = async (templateId: string) => {
		console.log("💻 Viewing form automation code:", templateId);

		// Find the formAutomationTemplateNode
		const templateNode = allNodes.value.find((n: any) =>
			n.type === "formAutomationTemplateNode" && n.data?.templateId === templateId
		);

		if (!templateNode) {
			console.warn("⚠️ Template node not found");
			return;
		}

		// Extract the browser node from the template's node canvas
		const nodeCanvas = templateNode.data?.templateNodeCanvas || {};
		const chainNodes = nodeCanvas.nodes || [];
		let browserNode = chainNodes.find((n: any) => n.type === "browserNode");

		if (!browserNode) {
			console.warn("⚠️ No browser node found in template chain");
			return;
		}

		// ALTERNATIVE: Try to find the ACTUAL browser node currently on canvas (has live data)
		const liveBrowserNode = allNodes.value.find((n: any) =>
			n.type === "browserNode" && n.data?.formTitle === templateNode.data?.formTitle
		);

		if (liveBrowserNode) {
			console.log("✅ Found LIVE browser node on canvas, using its data instead");
			console.log("   Live node htmlContent length:", liveBrowserNode.data?.htmlContent?.length || 0);
			browserNode = liveBrowserNode;
		}

		// Get ALL code files from browser node data (actual source code, NOT blob URLs!)
		let htmlContent = browserNode.data?.htmlContent || "";
		const formHtml = browserNode.data?.formHtml || "";
		const formCss = browserNode.data?.formCss || "";
		const formTitle = templateNode.data?.formTitle || browserNode.data?.formTitle || "Form";

		console.log("📝 Extracting code for viewing:");
		console.log("  - Full HTML length:", htmlContent.length);
		console.log("  - Form HTML length:", formHtml.length);
		console.log("  - CSS length:", formCss.length);
		console.log("  - HTML content starts with:", htmlContent.substring(0, 50));

		// BACKWARD COMPATIBILITY: Try to decode from dataURL if htmlContent is missing
		if (!htmlContent && browserNode.data?.url?.startsWith("data:text/html;base64,")) {
			console.warn("⚠️ OLD TEMPLATE: No htmlContent, attempting to decode from dataURL");
			try {
				const base64Content = browserNode.data.url.replace("data:text/html;base64,", "");
				const decodedHtml = decodeURIComponent(escape(atob(base64Content)));
				htmlContent = decodedHtml;
				console.log("✅ Successfully decoded HTML from dataURL, length:", htmlContent.length);
			} catch (e) {
				console.error("❌ Failed to decode dataURL:", e);
			}
		}

		// Handle blob URLs (fetch the content)
		if (!htmlContent && browserNode.data?.url?.startsWith("blob:")) {
			console.warn("⚠️ BLOB URL detected, attempting to fetch content");
			try {
				// Fetch the blob URL content
				const response = await fetch(browserNode.data.url);
				htmlContent = await response.text();
				console.log("✅ Successfully fetched HTML from blob URL, length:", htmlContent.length);
			} catch (e) {
				console.error("❌ Failed to fetch blob URL:", e);
			}
		}

		// Validate we have actual code
		if (!htmlContent) {
			console.error("❌ ERROR: No HTML content found in browser node!");
			return;
		}

		// Check if htmlContent is actually a blob/data URL (shouldn't be)
		if (htmlContent.startsWith("blob:")) {
			console.error("❌ ERROR: htmlContent is a blob URL, not actual HTML!");
			return;
		}

		console.log("✅ Valid source code found, creating code editor nodes");

		// Create code editor nodes for HTML, Form HTML, and CSS
		const basePosition = { x: templateNode.position.x + 500, y: templateNode.position.y };
		let yOffset = 0;

		// 1. Full HTML Document
		if (htmlContent && htmlContent.length > 0) {
			console.log("📄 Creating HTML editor");
			nodeCreatorRef.value?.createCodeEditorNode(
				htmlContent,
				`${formTitle} - Full HTML.html`,
				"html",
				{ x: basePosition.x, y: basePosition.y + yOffset }
			);
			yOffset += 400;
		}

		// 2. Form HTML (just the form body)
		if (formHtml && formHtml.length > 0) {
			console.log("📄 Creating Form HTML editor");
			nodeCreatorRef.value?.createCodeEditorNode(
				formHtml,
				`${formTitle} - Form Body.html`,
				"html",
				{ x: basePosition.x, y: basePosition.y + yOffset }
			);
			yOffset += 400;
		}

		// 3. CSS
		if (formCss && formCss.length > 0) {
			console.log("📄 Creating CSS editor");
			nodeCreatorRef.value?.createCodeEditorNode(
				formCss,
				`${formTitle} - Styles.css`,
				"css",
				{ x: basePosition.x, y: basePosition.y + yOffset }
			);
		}

		console.log("✅ Code editor nodes created successfully");
	};

	/**
	 * Handle create dev browser node (from TemplateConfiguredNode)
	 */
	const handleCreateDevBrowserNode = (htmlContent: string, formTitle: string, parentNodeId: string) => {
		console.log("🌐 Creating dev browser node:", { formTitle, parentNodeId });
		
		// Use nodeCreatorRef to create the browser node
		if (nodeCreatorRef.value) {
			nodeCreatorRef.value.createBrowserNodeFromTemplate(htmlContent, formTitle, parentNodeId);
		}
	};

	/**
	 * Handle open form generator (from TemplateConfiguredNode)
	 */
	const handleOpenFormGenerator = (formData: any) => {
		console.log("📝 Opening form generator:", formData);
		// Form generator opening logic
	};

	return {
		handleTemplateSaved,
		handleTemplateUpdated,
		handleSaveStatusChanged,
		handleShowFormAutomationChain,
		handleViewFormAutomationCode,
		handleCreateDevBrowserNode,
		handleOpenFormGenerator
	};
}


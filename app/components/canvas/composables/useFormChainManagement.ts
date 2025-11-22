import type { Ref } from "vue";
import { buttClient } from "~/utils/buttClient";

/**
 * Composable for managing form automation chain saving, loading, and restoration
 * Handles:
 * - Saving configured chains as new templates
 * - Updating master templates with configured forms
 * - Restoring form chains when clicked
 * - Updating templateConfiguredNode with form list
 */
export function useFormChainManagement(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	templateConfiguredNodes: Ref<any[]>,
	updateNodeData: (nodeId: string, key: string, value: any) => void,
	organisationId: string | undefined
) {
	/**
	 * Collect all nodes in a form automation chain
	 */
	const collectFormChainNodes = (browserNodeId: string) => {
		console.log("📦 Collecting form chain nodes from:", browserNodeId);

		const browserNode = allNodes.value.find((n) => n.id === browserNodeId);
		if (!browserNode) {
			console.error("❌ Browser node not found");
			return null;
		}

		const formsPanelId = browserNode.data?.parentFormsPanelId;
		const formsPanelNode = formsPanelId
			? allNodes.value.find((n) => n.id === formsPanelId)
			: undefined;

		// Find hook via edge from browser
		const hookEdge = edges.value.find((e) => e.source === browserNodeId && e.target.includes("hook"));
		const hookNode = hookEdge ? allNodes.value.find((n) => n.id === hookEdge.target) : undefined;

		// Find transports via edges from hook
		const transportNodes: any[] = [];
		const templateNodes: any[] = [];
		const chainEdges: any[] = [];

		if (hookNode) {
			// Add browser→hook edge
			if (hookEdge) chainEdges.push(hookEdge);

			// Add forms panel→browser edge
			if (formsPanelId) {
				const formsPanelEdge = edges.value.find(
					(e) => e.source === formsPanelId && e.target === browserNodeId
				);
				if (formsPanelEdge) chainEdges.push(formsPanelEdge);
			}

			// Find transports
			const transportEdges = edges.value.filter((e) => e.source === hookNode.id);
			transportEdges.forEach((edge) => {
				const transportNode = allNodes.value.find((n) => n.id === edge.target && n.type === "transportNode");
				if (transportNode) {
					transportNodes.push(transportNode);
					chainEdges.push(edge);

					// Find template nodes connected to this transport
					const templateEdges = edges.value.filter((e) => e.source === transportNode.id);
					templateEdges.forEach((tEdge) => {
						const templateNode = allNodes.value.find(
							(n) => n.id === tEdge.target && n.type === "transportTemplateNode"
						);
						if (templateNode) {
							templateNodes.push(templateNode);
							chainEdges.push(tEdge);
						}
					});
				}
			});
		}

		return {
			formsPanelNode,
			browserNode,
			hookNode,
			transportNodes,
			templateNodes,
			edges: chainEdges
		};
	};

	/**
	 * Save form chain configuration
	 * Creates new template AND updates master template
	 */
	const saveFormChainConfiguration = async (
		browserNodeId: string,
		formTitle: string,
		currentTemplateId?: string
	) => {
		console.log("💾 Saving form chain configuration:", formTitle);

		const chain = collectFormChainNodes(browserNodeId);
		if (!chain || !chain.browserNode || !chain.hookNode) {
			throw new Error("Incomplete form chain");
		}

		// Prepare template data
		console.log("📦 Collected chain nodes:");
		console.log("  - Transport nodes:", chain.transportNodes.length);
		console.log("  - Template nodes:", chain.templateNodes.length);
		chain.transportNodes.forEach((t: any) => {
			console.log(`    Transport: ${t.id}, type: ${t.data?.type}, target: ${t.data?.target}`);
		});
		chain.templateNodes.forEach((t: any) => {
			console.log(`    Template: ${t.id}, templateId: ${t.data?.templateId}`);
		});

		const nodes = [
			chain.formsPanelNode,
			chain.browserNode,
			chain.hookNode,
			...chain.transportNodes,
			...chain.templateNodes
		].filter(Boolean).map((n) => ({
			id: n.id,
			type: n.type,
			position: n.position,
			data: n.data
		}));

		const templateEdges = chain.edges.map((e) => ({
			id: e.id,
			source: e.source,
			target: e.target,
			type: e.type,
			animated: e.animated,
			style: e.style,
			markerEnd: e.markerEnd,
			label: e.label
		}));

		// Extract ALL code files from browser node (HTML, CSS, JS, etc.)
		const browserData = chain.browserNode.data;
		console.log("🔍 Browser node data keys:", Object.keys(browserData || {}));
		console.log("🔍 Browser node data:", browserData);
		
		const htmlContent = browserData?.htmlContent || "";
		const formHtml = browserData?.formHtml || "";
		const formCss = browserData?.formCss || "";
		const extractedFormTitle = browserData?.formTitle || formTitle;
		
		console.log("📝 Extracting form code files:");
		console.log("  - Full HTML length:", htmlContent.length);
		console.log("  - Form HTML length:", formHtml.length);
		console.log("  - CSS length:", formCss.length);
		console.log("  - htmlContent preview:", htmlContent.substring(0, 100));
		
		// Validate that we have actual code, not blob URLs
		if (htmlContent.startsWith("blob:") || htmlContent.startsWith("data:")) {
			console.error("❌ ERROR: htmlContent is still a blob/data URL, not actual code!");
			console.error("   This means the form HTML was not properly stored in the browser node.");
			throw new Error("Cannot save template: Browser node contains blob URL instead of actual HTML");
		}

		// Create new standalone template with all code files
		const buttId = `butt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const newTemplateData = {
			name: `${extractedFormTitle} - Automation Chain`,
			description: `Complete form automation chain for ${extractedFormTitle}`,
			template: {
				actions: [],
				type: "FORM_AUTOMATION_CHAIN",
				projectId: organisationId,
				nodeCanvas: {
					nodes,
					edges: templateEdges,
					viewport: { x: 0, y: 0, zoom: 1 }
				},
				// Save ALL code files for complete restoration
				code: {
					html: htmlContent,      // Full HTML document
					formHtml: formHtml,     // Just the form body
					css: formCss,           // Styles
					// Future: JS, TypeScript, etc.
				}
			},
			author: "CUSTOM",
			public: false,
			elevated: false,
			meta: {
				projectId: organisationId,
				butt: buttId,
				formTitle: extractedFormTitle,
				chainType: "form-automation",
				createdFrom: "form-chain-configurator",
				timestamp: new Date().toISOString(),
				// Also in meta for backward compatibility
				code: {
					html: htmlContent,
					formHtml: formHtml,
					css: formCss
				}
			}
		};

		const newTemplate = await buttClient.createTemplate(newTemplateData);
		console.log("✅ New template created:", newTemplate.id);

		// Update master template if in one
		if (currentTemplateId) {
			const currentTemplate = await buttClient.findByIdTemplate(currentTemplateId);
			const existingNodeCanvas = currentTemplate.template?.nodeCanvas || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };

			const updatedNodeCanvas = {
				nodes: [...(existingNodeCanvas.nodes || []), ...nodes],
				edges: [...(existingNodeCanvas.edges || []), ...templateEdges],
				viewport: existingNodeCanvas.viewport
			};

			const configuredFormEntry = {
				formId: chain.browserNode.data?.formId || chain.browserNode.id,
				formTitle: chain.browserNode.data?.formTitle || formTitle,
				formData: {
					browserNodeId: chain.browserNode.id,
					hookNodeId: chain.hookNode.id,
					transportNodeIds: chain.transportNodes.map((t) => t.id),
					templateNodeIds: chain.templateNodes.map((t) => t.id),
					formsPanelNodeId: chain.formsPanelNode?.id
				},
				timestamp: new Date().toISOString()
			};

			await buttClient.updateTemplate(currentTemplateId, {
				template: {
					...currentTemplate.template,
					nodeCanvas: updatedNodeCanvas,
					// Store meta inside template for TypeScript compatibility
					meta: {
						...currentTemplate.template?.meta,
						...currentTemplate.meta,
						lastFormChainUpdate: new Date().toISOString(),
						configuredForms: [
							...(currentTemplate.meta?.configuredForms || []),
							configuredFormEntry
						]
					}
				},
				updatedAt: new Date().toISOString()
			} as any); // Type assertion to avoid TS errors

			// Update templateConfiguredNode to show the form
			const templateConfiguredNode = templateConfiguredNodes.value[0];
			if (templateConfiguredNode) {
				const currentForms = templateConfiguredNode.data?.configuredForms || [];
				updateNodeData(templateConfiguredNode.id, "configuredForms", [
					...currentForms,
					configuredFormEntry
				]);
				console.log("✅ Updated templateConfiguredNode with configured form");
			}

			console.log("✅ Master template updated");
		}

		return newTemplate;
	};

	/**
	 * Restore a configured form chain
	 * Makes all chain nodes visible
	 */
	const restoreFormChain = (formData: any) => {
		console.log("🔄 Restoring form chain:", formData.formTitle);

		const nodeIds = [
			formData.formData?.formsPanelNodeId,
			formData.formData?.browserNodeId,
			formData.formData?.hookNodeId,
			...(formData.formData?.transportNodeIds || []),
			...(formData.formData?.templateNodeIds || [])
		].filter(Boolean);

		nodeIds.forEach((nodeId) => {
			const node = allNodes.value.find((n: any) => n.id === nodeId);
			if (node) {
				updateNodeData(nodeId, "visible", true);
				console.log("✅ Restored node:", nodeId);
			} else {
				console.warn("⚠️ Node not found:", nodeId);
			}
		});

		return nodeIds.length;
	};

	return {
		collectFormChainNodes,
		saveFormChainConfiguration,
		restoreFormChain
	};
}


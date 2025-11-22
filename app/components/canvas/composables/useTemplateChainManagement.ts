import type { Ref } from "vue";
import { useToast } from "~/components/Ui/composables/useToast";

export function useTemplateChainManagement(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	templateNodes: Ref<any[]>,
	templateConfiguredNodes: Ref<any[]>,
	intentSelectionNodes: Ref<any[]>,
	projectExplorerNodes: Ref<any[]>,
	projectScriptRunnerNodes: Ref<any[]>,
	bFolderSetupNodes: Ref<any[]>,
	saveTemplateNodes: Ref<any[]>,
	hookNodes: Ref<any[]>,
	transportNodes: Ref<any[]>,
	transportTemplateNodes: Ref<any[]>,
	solutionNodes: Ref<any[]>,
	codeEditorNodes: Ref<any[]>,
	webviewNodes: Ref<any[]>,
	formsPanelNodes: Ref<any[]>,
	browserNodes: Ref<any[]>,
	addNodes: (nodes: any[]) => void,
	lockNodePosition: (nodeId: string, position: { x: number, y: number }) => void,
	clearAllNodes: () => void,
	clearPositionLocks: () => void,
	vueFlowSetViewport: (viewport: any) => void,
	savePositionsToApi: (nodes: any[], edges: any[], viewport: any) => void,
	verifyAllPositions: (nodes: any[]) => void,
	_updateNodeDataBase: (nodeId: string, key: string, value: any) => void
) {
	const toast = useToast();

	/**
	 * Restore full template chain from saved b.json configuration
	 */
	const restoreTemplateChain = (templateData: any) => {
		const nodeCanvas = templateData.template?.nodeCanvas;
		const templateType = templateData.template?.type;
		const isFormAutomationChain = templateType === "FORM_AUTOMATION_CHAIN";

		if (!nodeCanvas || !nodeCanvas.nodes) {
			toast.add({
				title: "No Saved Configuration",
				description: "This template doesn't have a saved node chain",
				color: "warning"
			});
			return;
		}

		// Clear current canvas COMPLETELY
		console.log("🧹 Clearing canvas before restoration...");
		console.log("🧹 Nodes before clear:", allNodes.value.length);
		clearAllNodes();
		edges.value = [];
		clearPositionLocks();
		console.log("🧹 Nodes after clear:", allNodes.value.length);

		const savedNodes = nodeCanvas.nodes || [];
		const savedEdges = nodeCanvas.edges || [];
		const savedViewport = nodeCanvas.viewport || { x: 0, y: 0, zoom: 1 };
		const scriptCount = templateData.template?.setup?.all?.scripts?.length || 0;
		const toolCount = Object.keys(templateData.template?.detectedTools || {}).length;

		console.log(`✅ Restoring template chain: ${savedNodes.length} total nodes, ${savedEdges.length} edges`);
		console.log(`✅ Template Type: ${templateType}`);
		console.log(`✅ Is Form Automation Chain: ${isFormAutomationChain}`);
		console.log(`✅ Scripts: ${scriptCount}, Tools: ${toolCount}`);
		console.log(`📋 Saved node types:`, savedNodes.map((n: any) => n.type));

		// Check for duplicates in saved data
		const nodeTypeCounts: Record<string, number> = {};
		savedNodes.forEach((n: any) => {
			nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
		});
		console.log(`📊 Node type counts in saved data:`, nodeTypeCounts);

		const duplicateTypes = Object.entries(nodeTypeCounts).filter(([_, count]) => count > 1);
		if (duplicateTypes.length > 0) {
			console.warn(`⚠️ WARNING: Saved data contains duplicate node types:`, duplicateTypes);
		}

		// Get projectPath from the saved chain
		const explorerNode = savedNodes.find((n: any) => n.type === "projectExplorer");
		const bFolderNode = savedNodes.find((n: any) => n.type === "bFolderSetupNode");
		const scriptRunnerNode = savedNodes.find((n: any) => n.type === "projectScriptRunnerNode");
		const projectPathFromChain
			= explorerNode?.data?.projectPath
				|| bFolderNode?.data?.projectPath
				|| scriptRunnerNode?.data?.projectPath
				|| templateData.template?.projectPath
				|| "";

		console.log("🔧 Project path from chain:", projectPathFromChain);

		if (!projectPathFromChain) {
			console.warn("⚠️ No project path found in saved chain - scripts won't be executable");
		}

		// Create FormAutomationTemplateNode or TemplateConfiguredNode based on type
		const nodeId = isFormAutomationChain
			? `formAutomationTemplate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
			: `templateConfigured_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const nodeType = isFormAutomationChain ? "formAutomationTemplateNode" : "templateConfiguredNode";

		// Position form template node near the browser node, not at 50,100
		const browserNodeFromSaved = savedNodes.find((n: any) => n.type === "browserNode");
		const templateNodePosition = isFormAutomationChain && browserNodeFromSaved
			? { x: browserNodeFromSaved.position.x - 600, y: browserNodeFromSaved.position.y }
			: { x: 50, y: 100 };

		const configuredNode = {
			id: nodeId,
			type: nodeType,
			position: templateNodePosition,
			positionAbsolute: templateNodePosition,
			data: {
				label: isFormAutomationChain ? templateData.name : "Configured Template",
				templateId: templateData.id,
				templateName: templateData.name,
				templateDescription: templateData.description,
				formTitle: templateData.meta?.formTitle,
				createdAt: templateData.createdAt || templateData.meta?.timestamp,
				projectPath: projectPathFromChain,
				chainNodeCount: savedNodes.length,
				edgeCount: savedEdges.length,
				scriptCount,
				toolCount,
				status: "configured",
				// Pass nodeCanvas data for FormAutomationTemplateNode to use
				templateNodeCanvas: isFormAutomationChain ? nodeCanvas : undefined,
				// Pass configuredForms for TemplateConfiguredNode
				configuredForms: templateData.meta?.configuredForms || [],
				// For form automation chains, chain starts shown
				chainShown: isFormAutomationChain,
				// Pass form HTML for View Code button
				formHtml: templateData.template?.formHtml || templateData.meta?.formHtml || ""
			},
			style: isFormAutomationChain ? { width: "450px", height: "auto" } : { width: "600px", height: "700px" },
			draggable: true,
			selectable: true
		};

		templateConfiguredNodes.value.push(configuredNode);
		lockNodePosition(configuredNode.id, templateNodePosition);

		console.log(`✅ Created ${nodeType}`);
		console.log(`   Template Type: ${templateType}`);
		console.log(`   Current total nodes: ${allNodes.value.length}`);
		console.log(`   Should be: 1 (only the configured node)`);

		if (allNodes.value.length !== 1) {
			console.error(`⚠️ WARNING: Expected 1 node after clearing and adding TemplateConfiguredNode, but found ${allNodes.value.length}`);
			console.error(`   Existing nodes:`, allNodes.value.map((n: any) => `${n.type} (${n.id})`));
		}

		// Create ID mapping for regeneration (old ID → new ID)
		const idMap = new Map<string, string>();

		// Filter out templateNode but DON'T deduplicate for form automation chains
		// (we need multiple transports and transport templates)
		const filteredNodes = savedNodes.filter((savedNode: any) => savedNode.type !== "templateNode");

		let deduplicatedNodes;
		if (isFormAutomationChain) {
			// For form automation chains, keep ALL nodes (including duplicate types)
			deduplicatedNodes = filteredNodes;
			console.log(`🔧 Form automation chain: Keeping all ${filteredNodes.length} nodes (no deduplication)`);
			console.log("   Node types:", filteredNodes.map((n: any) => `${n.type} (id: ${n.id})`));
			// Show transport details
			filteredNodes.filter((n: any) => n.type === "transportNode").forEach((t: any) => {
				console.log(`   📧 Transport: type=${t.data?.type}, target=${t.data?.target}, name=${t.data?.name}`);
			});
			filteredNodes.filter((n: any) => n.type === "transportTemplateNode").forEach((t: any) => {
				console.log(`   📄 Template: templateId=${t.data?.templateId}, name=${t.data?.templateName}`);
			});
		} else {
			// For regular templates, deduplicate by type
			const deduplicatedNodesMap = new Map<string, any>();
			filteredNodes.forEach((node: any) => {
				deduplicatedNodesMap.set(node.type, node);
			});
			deduplicatedNodes = Array.from(deduplicatedNodesMap.values());
			console.log(`🔧 Regular template: Deduplication ${filteredNodes.length} → ${deduplicatedNodes.length} nodes`);
		}

		const restoredNodes = deduplicatedNodes.map((savedNode: any, index: number) => {
			// Use index to ensure unique IDs even in same millisecond
			const newId = `${savedNode.type}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
			idMap.set(savedNode.id, newId);

			// Special handling for templateConfiguredNode to add configuredForms from template meta
			const nodeData = { ...savedNode.data, visible: true, processesRun: false };
			if (savedNode.type === "templateConfiguredNode" && templateData.meta?.configuredForms) {
				console.log("📋 Adding configuredForms to templateConfiguredNode:", templateData.meta.configuredForms.length);
				nodeData.configuredForms = templateData.meta.configuredForms;
			}

			// Special handling for transportNode to update hook ID reference
			if (savedNode.type === "transportNode" && savedNode.data?.attachedToHookId) {
				const oldHookId = savedNode.data.attachedToHookId;
				const newHookId = idMap.get(oldHookId);
				if (newHookId) {
					console.log(`🔄 Updating transport hook reference: ${oldHookId} → ${newHookId}`);
					nodeData.attachedToHookId = newHookId;
				} else {
					console.warn(`⚠️ Could not find new hook ID for: ${oldHookId}`);
				}
			}

			// Special handling for browserNode to restore ALL code files
			if (savedNode.type === "browserNode") {
				// Get code files from template (new structure)
				const codeFiles = templateData.template?.code || templateData.meta?.code || {};
				const htmlContent = codeFiles.html || savedNode.data?.htmlContent || "";
				const formHtml = codeFiles.formHtml || savedNode.data?.formHtml || "";
				const formCss = codeFiles.css || savedNode.data?.formCss || "";

				console.log("📝 Restoring form code files to browser node:");
				console.log("  - HTML length:", htmlContent.length);
				console.log("  - Form HTML length:", formHtml.length);
				console.log("  - CSS length:", formCss.length);

				// Store ALL code files in node data (NOT blob URLs!)
				if (htmlContent) {
					nodeData.htmlContent = htmlContent;
					nodeData.formHtml = formHtml;
					nodeData.formCss = formCss;
					nodeData.formTitle = templateData.meta?.formTitle || savedNode.data?.formTitle || "";

					// Create dataURL from actual HTML for iframe display
					try {
						const dataUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(htmlContent)))}`;
						nodeData.url = dataUrl;
						console.log("✅ Created dataURL for browser iframe (from actual HTML)");
					} catch (e) {
						console.error("❌ Failed to create dataURL:", e);
						nodeData.url = "";
					}
				} else {
					console.warn("⚠️ No HTML content found in template code files");
				}
			}

			// For form automation chains, create nodes as VISIBLE (not hidden)
			// They can be controlled by the FormAutomationTemplateNode
			// Exception: formsPanelNode stays hidden (user doesn't need to see it)
			const shouldBeHidden = isFormAutomationChain
				? savedNode.type === "formsPanelNode" // Hide forms panel even in form chains
				: true; // Regular templates start hidden

			// Generate default positions if template doesn't have them
			// Templates saved without positions need intelligent layout
			const defaultPosition = savedNode.position
				? { x: savedNode.position.x, y: savedNode.position.y }
				: {
					// Auto-layout: horizontal chain with vertical spacing
					x: 100 + (index * 700), // 700px horizontal spacing
					y: 100 + ((index % 3) * 300) // Stagger vertically every 3 nodes
				};

			return {
				...savedNode,
				id: newId,
				position: defaultPosition,
				positionAbsolute: defaultPosition,
				draggable: true,
				selectable: true,
				hidden: shouldBeHidden,
				data: nodeData
			};
		});

		// Add nodes to appropriate arrays
		console.log(`🔧 Adding ${restoredNodes.length} nodes to arrays...`);

		restoredNodes.forEach((node: any) => {
			console.log(`  ➕ Adding ${node.type} (${node.id})`);
			const nodeArrays: any = {
				templateNode: templateNodes,
				templateConfiguredNode: templateConfiguredNodes,
				intentSelection: intentSelectionNodes,
				projectExplorer: projectExplorerNodes,
				projectScriptRunnerNode: projectScriptRunnerNodes,
				bFolderSetupNode: bFolderSetupNodes,
				saveTemplateNode: saveTemplateNodes,
				hookNode: hookNodes,
				transportNode: transportNodes,
				transportTemplateNode: transportTemplateNodes,
				solutionNode: solutionNodes,
				codeEditorNode: codeEditorNodes,
				webviewNode: webviewNodes,
				formsPanelNode: formsPanelNodes,
				browserNode: browserNodes
			};

			if (node.type in nodeArrays) {
				const arrayBefore = nodeArrays[node.type].value.length;
				nodeArrays[node.type].value.push(node);
				const arrayAfter = nodeArrays[node.type].value.length;
				console.log(`    ${node.type} array: ${arrayBefore} → ${arrayAfter}`);
			} else {
				console.warn(`    ⚠️ Unknown node type: ${node.type}`);
			}

			// Lock position
			lockNodePosition(node.id, { x: node.position.x, y: node.position.y });
		});

		console.log(`✅ Final node counts after restoration:`);
		console.log(`  - intentSelectionNodes: ${intentSelectionNodes.value.length}`);
		console.log(`  - projectExplorerNodes: ${projectExplorerNodes.value.length}`);
		console.log(`  - projectScriptRunnerNodes: ${projectScriptRunnerNodes.value.length}`);
		console.log(`  - bFolderSetupNodes: ${bFolderSetupNodes.value.length}`);
		console.log(`  - saveTemplateNodes: ${saveTemplateNodes.value.length}`);
		console.log(`  - templateConfiguredNodes: ${templateConfiguredNodes.value.length}`);
		console.log(`  - Total allNodes: ${allNodes.value.length}`);

		// Add all restored nodes to VueFlow (even though hidden)
		console.log(`🔧 Adding ${restoredNodes.length} restored nodes to VueFlow...`);
		addNodes(restoredNodes);
		console.log(`✅ Added nodes to VueFlow, now have ${allNodes.value.length} total nodes`);

		// Restore edges with updated node IDs
		const restoredEdges = savedEdges
			.filter((edge: any) => {
				const sourceNode = savedNodes.find((n: any) => n.id === edge.source);
				const targetNode = savedNodes.find((n: any) => n.id === edge.target);
				return sourceNode?.type !== "templateNode" && targetNode?.type !== "templateNode";
			})
			.map((edge: any) => ({
				...edge,
				id: `edge_${idMap.get(edge.source)}_${idMap.get(edge.target)}_${Date.now()}`,
				source: idMap.get(edge.source) || edge.source,
				target: idMap.get(edge.target) || edge.target
			}));

		// Connect form template node to browser node (for form chains)
		if (isFormAutomationChain) {
			const restoredBrowserNode = restoredNodes.find((n: any) => n.type === "browserNode");
			if (restoredBrowserNode) {
				const templateToBrowserEdge = {
					id: `edge_${nodeId}_${restoredBrowserNode.id}_${Date.now()}`,
					source: nodeId,
					target: restoredBrowserNode.id,
					sourceHandle: "right",
					targetHandle: "left",
					type: "smoothstep",
					animated: true,
					style: { stroke: "#a855f7", strokeWidth: 2 },
					markerEnd: { type: "arrowclosed", color: "#a855f7" }
				};
				restoredEdges.push(templateToBrowserEdge);
				console.log(`✅ Connected form template to browser node`);
			}
		} else {
			// For regular templates, connect to first chain node
			const firstChainNode = restoredNodes.find((n: any) => n.type === "intentSelection" || n.type === "projectExplorer");
			if (firstChainNode) {
				const newEdge = {
					id: `edge_${nodeId}_${firstChainNode.id}_${Date.now()}`,
					source: nodeId,
					target: firstChainNode.id,
					sourceHandle: "right",
					targetHandle: "left",
					type: "smoothstep",
					animated: true,
					style: { stroke: "#22c55e", strokeWidth: 2 },
					markerEnd: { type: "arrowclosed", color: "#22c55e" }
				};
				restoredEdges.push(newEdge);
			}
		}

		edges.value = restoredEdges;

		console.log(`✅ Restored ${restoredEdges.length} edges with updated IDs`);
		console.log(`   Edge connections:`, restoredEdges.map((e: any) => `${e.source} → ${e.target}`));

		// Restore viewport
		setTimeout(() => {
			if (savedViewport) {
				vueFlowSetViewport(savedViewport);
			}

			// Lock all restored positions and save to API
			setTimeout(() => {
				console.log("🔒 Locking all restored template chain positions...");
				allNodes.value.forEach((node: any) => {
					if (node.position) {
						lockNodePosition(node.id, node.position);
						console.log(`  🔒 Locked ${node.type}: (${node.position.x}, ${node.position.y})`);
					}
				});

				// Save to API
				const currentViewport = { x: savedViewport.x, y: savedViewport.y, zoom: savedViewport.zoom };
				savePositionsToApi(allNodes.value, edges.value, currentViewport);

				// Verify (just logging)
				verifyAllPositions(allNodes.value);
			}, 300);
		}, 100);

		const restoredCount = restoredNodes.length + 1; // +1 for TemplateConfiguredNode
		toast.add({
			title: "Configured Template Loaded",
			description: `${restoredCount} nodes restored • ${scriptCount} scripts • ${toolCount} tools`,
			color: "success"
		});
	};

	return {
		restoreTemplateChain
	};
}

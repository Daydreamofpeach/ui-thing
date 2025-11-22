import { useToast } from "#ui/composables/useToast";

/**
 * Composable for file creation and code editor node operations
 */
export function useFileNodeOperations(
	createNode: (nodeType: string, data: any) => any,
	addNodes: (nodes: any[]) => void,
	addEdges: (edges: any[]) => void,
	getNodeFn: any,
	allNodes?: any
) {
	/**
	 * Handle file created event from FileCreatorNode to create linked CodeEditorNode
	 */
	const handleFileCreated = (fileData: any) => {
		console.log("🔧 handleFileCreated called with:", fileData);

		try {
			const codeEditorNodeId = `code-editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Position the code editor node to the right of the file creator node
			const sourceNode = getNodeFn.value(fileData.sourceNodeId);
			const sourcePosition = sourceNode?.position || { x: 0, y: 0 };

			const codeEditorData = {
				id: codeEditorNodeId,
				label: `Code Editor - ${fileData.fileName}`,
				position: {
					x: sourcePosition.x + 400,
					y: sourcePosition.y
				},
				data: {
					codeContent: fileData.fileContent,
					fileName: fileData.fileName,
					fileType: fileData.fileType,
					filePath: fileData.filePath,
					selectedFolderPath: fileData.selectedFolderPath
				}
			};

			console.log("🔧 Code editor data:", {
				codeEditorNodeId,
				fileName: fileData.fileName,
				fileType: fileData.fileType,
				fileContentLength: fileData.fileContent?.length || 0
			});

			const newNode = createNode("codeEditorNode", codeEditorData);
			addNodes([newNode]);

			// Create an edge connecting the file creator to the code editor
			const edgeId = `edge-${fileData.sourceNodeId}-${codeEditorNodeId}`;
			const newEdge = {
				id: edgeId,
				source: fileData.sourceNodeId,
				target: codeEditorNodeId,
				type: "default",
				style: { stroke: "#10b981", strokeWidth: 2 },
				animated: true,
				label: "File Created"
			};

			addEdges([newEdge]);

			console.log("✅ Created code editor node and edge:", {
				codeEditorNodeId,
				edgeId
			});
		} catch (error) {
			console.error("❌ Error creating code editor node:", error);
		}
	};

	/**
	 * Handle create save template node request from BFolderSetupNode
	 */
	const handleCreateSaveTemplateNode = (
		bFolderNodeProps: any,
		saveTemplateNodes: any,
		templateNodes: any,
		addEdgesFunc: (edges: any[]) => void,
		_updateNodeDataBase: (nodeId: string, key: string, value: any) => void
	) => {
		const bFolderNode = getNodeFn.value(bFolderNodeProps.id);
		if (!bFolderNode) {
			console.error("❌ BFolder node not found:", bFolderNodeProps.id);
			return;
		}

		// Get template info from BFolder data (propagated through chain)
		const templateId = bFolderNode.data?.templateId;
		const templateName = bFolderNode.data?.templateName;

		// Fallback: Find template node in canvas if not in data
		let finalTemplateId = templateId;
		let finalTemplateName = templateName;

		console.log("═══════════════════════════════════════════");
		console.log("🔍 LOOKING FOR TEMPLATE ID...");
		console.log("═══════════════════════════════════════════");
		console.log("  From BFolder data templateId:", templateId);
		console.log("  From BFolder data templateName:", templateName);
		console.log("  Template nodes available:", templateNodes.value.length);

		// If no template ID in BFolder data, search for template node
		if (!finalTemplateId || finalTemplateId.startsWith("templateNode_")) {
			console.log("⚠️ Template ID not found or is a node ID, searching canvas...");

			const templateNode = templateNodes.value[0];
			if (templateNode) {
				console.log("📋 Template Node Data:", templateNode.data);

				// Use the ACTUAL database template ID from the data
				// The database ID is stored in data.id or data.templateId
				finalTemplateId = templateNode.data?.id;
				finalTemplateName = templateNode.data?.name || templateNode.data?.label || "Untitled Template";

				console.log("✅ Found template from canvas:");
				console.log("  Database Template ID:", finalTemplateId);
				console.log("  Template Name:", finalTemplateName);
			}
		}

		// Check if this is a NEW template (no database ID) or EXISTING template
		const isNewTemplate = !finalTemplateId || finalTemplateId.startsWith("templateNode_");
		
		if (isNewTemplate) {
			console.log("🆕 NEW TEMPLATE CHAIN - Will create in database when saved");
			console.log("  Template Name:", finalTemplateName);
			console.log("  This SaveTemplateNode will use createTemplate API");
		} else {
			console.log("✅ EXISTING TEMPLATE - Will update in database");
			console.log("  Database Template ID:", finalTemplateId);
			console.log("  Template Name:", finalTemplateName);
		}
		console.log("═══════════════════════════════════════════");

		// Get node count safely
		const nodeCount = allNodes?.value?.length || 0;

		// Create SaveTemplateNode
		const nodeId = `saveTemplate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const newNode = {
			id: nodeId,
			type: "saveTemplateNode",
			position: {
				x: bFolderNode.position.x + 650,
				y: bFolderNode.position.y
			},
			data: {
				label: "Save Template",
				templateId: finalTemplateId,
				templateName: finalTemplateName,
				projectPath: bFolderNode.data?.projectPath || "",
				status: "idle",
				hasBJson: bFolderNode.data?.hasBJson || false,
				hasBlJson: bFolderNode.data?.hasBlJson || false,
				hasNodeChain: true,
				chainNodeCount: nodeCount,
				scriptCount: bFolderNode.data?.detectedScripts?.length || 0
			},
			style: {
				width: "500px",
				height: "400px"
			},
			draggable: true,
			selectable: true
		};

		console.log("🎯 Creating SaveTemplateNode:", {
			nodeId,
			templateId: finalTemplateId,
			templateName: finalTemplateName,
			projectPath: newNode.data.projectPath,
			chainNodeCount: nodeCount
		});

		// Add to array
		saveTemplateNodes.value.push(newNode);

		// Create edge from BFolder to SaveTemplate
		const newEdge = {
			id: `edge_${bFolderNode.id}_${nodeId}_${Date.now()}`,
			source: bFolderNode.id,
			target: nodeId,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			animated: true,
			style: { stroke: "#f97316", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "#f97316" }
		};

		addEdgesFunc([newEdge]);

		console.log("✅ SaveTemplateNode created successfully");

		// Silent node creation - no toast (reduces notification spam)
	};

	return {
		handleFileCreated,
		handleCreateSaveTemplateNode
	};
}

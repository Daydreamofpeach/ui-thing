import { computed } from "vue";

export function useTemplateNodeManagement(
	allNodes: any,
	allEdges: any,
	addNodes: any,
	addEdges: any,
	emit: any,
	templateNodes?: any,
	intentSelectionNodes?: any,
	projectExplorerNodes?: any,
	vueFlowUpdateNode?: any,
	getNode?: any,
	allNodeArrays?: any[],
	projectScriptRunnerNodes?: any,
	bFolderSetupNodes?: any,
	saveTemplateNodes?: any
) {
	const handleProjectTypeSelected = (type: string) => {
		console.log("Project type selected:", type);
	};

	const handleFolderSelected = (path: string) => {
		console.log("Folder selected:", path);
	};

	const handleIntentAnalyzed = (results: any) => {
		console.log("Intent analyzed:", results);
	};

	const handleStackSelected = (stack: any) => {
		console.log("Stack selected:", stack);
	};

	const handleIntentSelected = (intent: any) => {
		console.log("Intent selected:", intent);
	};

	const handleProceedToNext = (data: any) => {
		console.log("Proceeding to next step:", data);

		// If a specific next node is specified, create that node
		if (data.nextNode) {
			console.log("📍 Creating specified next node:", data.nextNode);
			// This will be handled by the CanvasPanel handler which will
			// create the appropriate node type
			return;
		}

		// Otherwise, create a default node based on intent type
		switch (data.type) {
			case "git":
				console.log("🔗 Git Clone selected");
				// The GitCloneIntentNode should already be shown
				break;
			case "new":
				console.log("✨ New project selected");
				// Could create a project setup node here
				break;
			case "existing":
				console.log("📁 Existing project selected");
				// Could create analysis node here
				break;
			case "template":
				console.log("📋 Template selected");
				// Could create template node here
				break;
			default:
				console.log("❓ Unknown intent type:", data.type);
		}
	};

	const handleFileSelected = (file: any) => {
		console.log("File selected:", file);
	};

	const handleAnalysisComplete = (analysis: any) => {
		console.log("Analysis complete:", analysis);
	};

	const handleError = (error: string) => {
		console.error("Error:", error);
	};

	const resolveNodeById = (id: string | undefined | null) => {
		if (!id) {
			return null;
		}

		if (typeof getNode === "function") {
			return getNode(id);
		}

		if (getNode?.value) {
			return getNode.value(id);
		}

		return null;
	};

	const notifyOrbitRefresh = (templateNodeId: string | undefined | null) => {
		if (!templateNodeId || !vueFlowUpdateNode) {
			return;
		}

		const templateNode = resolveNodeById(templateNodeId);
		const builditNodeId = templateNode?.data?.parentNodeId;
		if (!builditNodeId) {
			return;
		}

		vueFlowUpdateNode(builditNodeId, (node: any) => ({
			...node,
			data: {
				...(node.data || {}),
				orbitRefreshKey: Date.now()
			}
		}));
	};

	const createEdge = (sourceId: string, targetId: string) => {
		// Generate a unique edge ID with timestamp and random component to prevent collisions
		// when multiple template chains are created simultaneously
		const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const newEdge = {
			id: `edge_${sourceId}_${targetId}_${uniqueId}`,
			source: sourceId,
			target: targetId,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			animated: true,
			style: { stroke: "#f97316", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "#f97316" }
		};

		try {
			addEdges([newEdge]);
			console.log("✅ Created edge with unique ID:", newEdge.id);
			return newEdge;
		} catch (error) {
			console.error("Error creating edge:", error);
			return null;
		}
	};

	const createProjectScriptRunnerNode = (explorerNode: any, projectPath: string) => {
		console.log("🚀🚀🚀 useTemplateNodeManagement: createProjectScriptRunnerNode called");
		console.log("🚀 Explorer node:", explorerNode);
		console.log("🚀 Explorer node position:", explorerNode.position);
		console.log("🚀 Project path:", projectPath);

		if (!projectScriptRunnerNodes) {
			console.error("❌ projectScriptRunnerNodes not provided to composable");
			return null;
		}

		if (!explorerNode || !projectPath) {
			console.error("❌ Invalid explorer node or project path");
			return null;
		}

		// Check if a ProjectScriptRunnerNode already exists for this project path
		const existingNode = projectScriptRunnerNodes.value.find((n: any) => 
			n.data?.projectPath === projectPath
		);
		
		if (existingNode) {
			console.log("✅ ProjectScriptRunnerNode already exists for this path, reusing:", existingNode.id);
			return existingNode;
		}

		const nodeId = `projectScriptRunner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const templateNodeId = explorerNode.data?.templateNodeId || explorerNode.data?.templateId;
		const intentSelectionNodeId = explorerNode.data?.intentSelectionNodeId;

		const node = {
			id: nodeId,
			type: "projectScriptRunnerNode",
			position: {
				x: explorerNode.position.x + 950,
				y: explorerNode.position.y
			},
			data: {
				label: "Project Script Runner",
				projectPath,
				status: "idle",
				templateId: explorerNode.data?.templateId,
				templateName: explorerNode.data?.templateName,
				templateNodeId,
				intentSelectionNodeId,
				parentNodeId: explorerNode.id,
				_isChainNode: true,
				_chainParent: templateNodeId || explorerNode.id,
				_chainOrder: 3
			},
			style: {
				width: "600px",
				height: "700px"
			},
			draggable: true,
			selectable: true
		};

		console.log("✅✅✅ Created project script runner node:", node);
		console.log("✅ Node ID:", nodeId);
		console.log("✅ Node position:", node.position);
		console.log("✅ Node data:", node.data);

		try {
			projectScriptRunnerNodes.value.push(node);
			console.log("✅ Added to projectScriptRunnerNodes array, length:", projectScriptRunnerNodes.value.length);
			console.log("✅ All nodes in projectScriptRunnerNodes:", projectScriptRunnerNodes.value.map((n: any) => n.id));

			addNodes([node]);
			console.log("✅✅✅ Added to VueFlow via addNodes");

			emit("nodeCreated", node);
			console.log("✅ Emitted nodeCreated event");

			notifyOrbitRefresh(templateNodeId);

			return node;
		} catch (error) {
			console.error("❌❌❌ Error creating project script runner node:", error);
			return null;
		}
	};

	const createBFolderSetupNode = (scriptRunnerNode: any, projectPath: string) => {
		console.log("🚀🚀🚀 useTemplateNodeManagement: createBFolderSetupNode called");
		console.log("🚀 Script runner node:", scriptRunnerNode);
		console.log("🚀 Script runner node position:", scriptRunnerNode.position);
		console.log("🚀 Script runner node data:", scriptRunnerNode.data);
		console.log("🚀 Project path:", projectPath);

		if (!bFolderSetupNodes) {
			console.error("❌ bFolderSetupNodes not provided to composable");
			return null;
		}

		if (!scriptRunnerNode || !projectPath) {
			console.error("❌ Invalid script runner node or project path");
			return null;
		}

		// Check if a BFolderSetupNode already exists for this project path
		const existingNode = bFolderSetupNodes.value.find((n: any) => 
			n.data?.projectPath === projectPath
		);
		
		if (existingNode) {
			console.log("✅ BFolderSetupNode already exists for this path, reusing:", existingNode.id);
			return existingNode;
		}

		const nodeId = `bFolderSetup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const templateNodeId = scriptRunnerNode.data?.templateNodeId || scriptRunnerNode.data?.templateId;
		const intentSelectionNodeId = scriptRunnerNode.data?.intentSelectionNodeId;

		const node = {
			id: nodeId,
			type: "bFolderSetupNode",
			position: {
				x: scriptRunnerNode.position.x + 950,
				y: scriptRunnerNode.position.y
			},
			data: {
				label: "B Folder Setup",
				projectPath,
				status: "idle",
				detectedEnvironment: {},
				bFolderPath: "",
				// Pass initial script data if available
				detectedScripts: scriptRunnerNode.data?.detectedScripts || null,
				scriptOSVersions: scriptRunnerNode.data?.scriptOSVersions || null,
				// Template info propagated through chain
				templateId: scriptRunnerNode.data?.templateId,
				templateName: scriptRunnerNode.data?.templateName,
				templateNodeId,
				intentSelectionNodeId,
				parentNodeId: scriptRunnerNode.id,
				_isChainNode: true,
				_chainParent: scriptRunnerNode.data?.templateNodeId || scriptRunnerNode.id,
				_chainOrder: 4
				// Canvas data will be accessed from parent via allNodes/allEdges refs (no circular ref)
			},
			style: {
				width: "600px",
				height: "800px"
			},
			draggable: true,
			selectable: true
		};

		console.log("✅✅✅ Created B Folder Setup node:", node);
		console.log("✅ Node ID:", nodeId);
		console.log("✅ Node position:", node.position);
		console.log("✅ Node data:", node.data);

		try {
			bFolderSetupNodes.value.push(node);
			console.log("✅ Added to bFolderSetupNodes array, length:", bFolderSetupNodes.value.length);
			console.log("✅ All nodes in bFolderSetupNodes:", bFolderSetupNodes.value.map((n: any) => n.id));

			addNodes([node]);
			console.log("✅✅✅ Added to VueFlow via addNodes");

			emit("nodeCreated", node);
			console.log("✅ Emitted nodeCreated event");

			notifyOrbitRefresh(templateNodeId);

			return node;
		} catch (error) {
			console.error("❌❌❌ Error creating B Folder Setup node:", error);
			return null;
		}
	};

	const createSaveTemplateNode = (bFolderNode: any, templateNode: any) => {
		if (!saveTemplateNodes) {
			console.error("saveTemplateNodes not provided to composable");
			return null;
		}

		if (!bFolderNode || !templateNode) {
			console.error("Invalid bFolder node or template node");
			return null;
		}

		// Get the ACTUAL database template ID, not the node ID
		const actualTemplateId = templateNode.data?.templateId || templateNode.id;
		const actualTemplateName = templateNode.data?.templateName || templateNode.data?.label || templateNode.data?.name || "Untitled Template";

		console.log("🎯 createSaveTemplateNode: Using template ID:", actualTemplateId);
		console.log("🎯 createSaveTemplateNode: Using template name:", actualTemplateName);
		console.log("🎯 createSaveTemplateNode: TemplateNode data:", templateNode.data);

		// Check if a SaveTemplateNode already exists for this template
		const existingNode = saveTemplateNodes.value.find((n: any) => 
			n.data?.templateId === actualTemplateId
		);
		
		if (existingNode) {
			console.log("✅ SaveTemplateNode already exists for this template, reusing:", existingNode.id);
			return existingNode;
		}

		const nodeId = `saveTemplate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const node = {
			id: nodeId,
			type: "saveTemplateNode",
			position: {
				x: bFolderNode.position.x + 950,
				y: bFolderNode.position.y
			},
			data: {
				label: "Save Template",
				templateId: actualTemplateId,
				templateName: actualTemplateName,
				projectPath: bFolderNode.data?.projectPath || "",
				status: "idle",
				hasBJson: false,
				hasBlJson: false,
				hasNodeChain: false,
				templateNodeId: templateNode.id,
				intentSelectionNodeId: templateNode.data?.intentSelectionNodeId,
				parentNodeId: bFolderNode.id,
				_isChainNode: true,
				_chainParent: templateNode.id,
				_chainOrder: 5
			},
			style: {
				width: "500px",
				height: "400px"
			},
			draggable: true,
			selectable: true
		};

		try {
			saveTemplateNodes.value.push(node);
			addNodes([node]);
			emit("nodeCreated", node);
			notifyOrbitRefresh(templateNode.id);
			return node;
		} catch (error) {
			console.error("Error creating Save Template node:", error);
			return null;
		}
	};

	const createIntentSelectionNode = (templateNode: any) => {
		if (!intentSelectionNodes) {
			console.error("intentSelectionNodes not provided to composable");
			return null;
		}
		console.log("NodeHookCanvas: Creating intent selection node for template:", templateNode);

		// Get the ACTUAL database template ID, not the node ID
		const actualTemplateId = templateNode.data?.templateId || templateNode.id;
		const actualTemplateName = templateNode.data?.templateName || templateNode.data?.label || templateNode.data?.name || "Untitled Template";

		console.log("🎯 Using template ID:", actualTemplateId);
		console.log("🎯 Using template name:", actualTemplateName);

		// Check if an IntentSelectionNode already exists for this template
		const existingById = templateNode.data?.intentSelectionNodeId
			? intentSelectionNodes.value.find((n: any) => n.id === templateNode.data.intentSelectionNodeId)
			: null;

		if (existingById) {
			console.log("✅ IntentSelectionNode referenced on template, reusing:", existingById.id);
			return existingById;
		}

		const existingNode = intentSelectionNodes.value.find((n: any) => 
			n.data?.templateId === actualTemplateId
		);
		
		if (existingNode) {
			console.log("✅ IntentSelectionNode already exists for this template, reusing:", existingNode.id);
			return existingNode;
		}

		const nodeId = `intentSelection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const chainParent = templateNode.id;
		const node = {
			id: nodeId,
			type: "intentSelection",
			position: {
				x: templateNode.position.x + 550,
				y: templateNode.position.y
			},
			data: {
				label: "Intent Selection",
				selectedIntent: null,
				templateId: actualTemplateId,
				templateName: actualTemplateName,
				templateNodeId: templateNode.id,
				parentNodeId: templateNode.id,
				_isChainNode: true,
				_chainParent: chainParent,
				_chainOrder: 1
			}
		};

		console.log("NodeHookCanvas: Created node:", node);

		templateNode.data = {
			...(templateNode.data || {}),
			intentSelectionNodeId: nodeId,
			_isChainNode: true,
			_chainParent: chainParent,
			_chainOrder: 0
		};

		intentSelectionNodes.value.push(node);
		console.log("NodeHookCanvas: Added to intentSelectionNodes array, length:", intentSelectionNodes.value.length);

		addNodes([node]);
		console.log("NodeHookCanvas: Added to VueFlow");

		emit("nodeCreated", node);
		return node;
	};

	const createProjectExplorerNode = (intentNode: any) => {
		console.log("🔧 useTemplateNodeManagement: createProjectExplorerNode called");
		console.log("🔧 useTemplateNodeManagement: projectExplorerNodes:", projectExplorerNodes);
		console.log("🔧 useTemplateNodeManagement: intentNode:", intentNode);

		if (!projectExplorerNodes) {
			console.error("❌ projectExplorerNodes not provided to composable");
			return null;
		}

		if (!intentNode || !intentNode.data) {
			console.error("❌ Invalid intentNode provided:", intentNode);
			return null;
		}

		console.log("✅ Creating project explorer node for intent:", intentNode);
		console.log("✅ Intent node data:", intentNode.data);
		console.log("✅ Selected folder path:", intentNode.data?.selectedFolderPath);
		console.log("✅ Folder analysis:", intentNode.data?.folderAnalysis);

		// Check if a ProjectExplorerNode already exists for this template/folder
		const templateId = intentNode.data?.templateId;
		const templateNodeId = intentNode.data?.templateNodeId || intentNode.data?.parentNodeId || templateId;
		const folderPath = intentNode.data?.selectedFolderPath;
		const existingNode = projectExplorerNodes.value.find((n: any) => 
			n.data?.templateId === templateId || n.data?.projectPath === folderPath
		);
		
		if (existingNode) {
			console.log("✅ ProjectExplorerNode already exists, reusing:", existingNode.id);
			return existingNode;
		}

		const nodeId = `projectExplorer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const node = {
			id: nodeId,
			type: "projectExplorer",
			position: {
				x: intentNode.position.x + 550,
				y: intentNode.position.y
			},
			data: {
				label: "Project Explorer",
				projectPath: intentNode.data?.selectedFolderPath || null,
				projectName: intentNode.data?.projectName || null,
				analysis: intentNode.data?.folderAnalysis || null,
				selectedFolderPath: intentNode.data?.selectedFolderPath || null,
				folderAnalysis: intentNode.data?.folderAnalysis || null,
				templateId: intentNode.data?.templateId,
				templateName: intentNode.data?.templateName,
				templateNodeId,
				intentSelectionNodeId: intentNode.id,
				parentNodeId: intentNode.id,
				_isChainNode: true,
				_chainParent: templateNodeId || nodeId,
				_chainOrder: 2
			}
		};

		console.log("✅ Created project explorer node:", node);
		console.log("✅ Node data projectPath:", node.data.projectPath);

		try {
			projectExplorerNodes.value.push(node);
			console.log("✅ Added to projectExplorerNodes array, length:", projectExplorerNodes.value.length);

			addNodes([node]);
			console.log("✅ Added to VueFlow");

			emit("nodeCreated", node);
			console.log("✅ Emitted nodeCreated event");

			console.log("🔗 Connecting intent selection to project explorer:", intentNode.id, "->", node.id);
			createEdge(intentNode.id, node.id);
			notifyOrbitRefresh(templateNodeId);

		// Auto-create ProjectScriptRunnerNode connected to this explorer
		// Use setTimeout to ensure the explorer node is fully created first
		if (intentNode.data?.selectedFolderPath) {
			console.log("🚀🚀🚀 Auto-creating ProjectScriptRunnerNode for folder:", intentNode.data.selectedFolderPath);
			console.log("🚀 Explorer node ID:", node.id);
			console.log("🚀 Intent node data:", intentNode.data);
			
			setTimeout(() => {
				console.log("⏰ Timeout fired for ProjectScriptRunnerNode creation");
				const scriptRunnerNode = createProjectScriptRunnerNode(node, intentNode.data.selectedFolderPath);
				console.log("🔧 scriptRunnerNode created:", scriptRunnerNode);
				
				if (scriptRunnerNode) {
					console.log("🔗🔗🔗 Connecting explorer to script runner:", node.id, "->", scriptRunnerNode.id);
					// Connect explorer to script runner
					const edge1 = createEdge(node.id, scriptRunnerNode.id);
					console.log("✅ Edge 1 result:", edge1);

					// Auto-create B Folder Setup Node connected to script runner
					console.log("🚀🚀🚀 Auto-creating BFolderSetupNode for folder:", intentNode.data.selectedFolderPath);
					setTimeout(() => {
						console.log("⏰ Timeout fired for BFolderSetupNode creation");
						console.log("🔧 Checking script runner node data before creating B Folder:");
						console.log("🔧 scriptRunnerNode.data:", scriptRunnerNode.data);

						const bFolderSetupNode = createBFolderSetupNode(scriptRunnerNode, intentNode.data.selectedFolderPath);
						console.log("🔧 bFolderSetupNode created:", bFolderSetupNode);
						
						if (bFolderSetupNode) {
							console.log("🔗🔗🔗 Connecting script runner to B folder setup:", scriptRunnerNode.id, "->", bFolderSetupNode.id);
							// Connect script runner to B folder setup
							const edge2 = createEdge(scriptRunnerNode.id, bFolderSetupNode.id);
							console.log("✅ Edge 2 result:", edge2);

							// Auto-create SaveTemplateNode connected to B folder setup
							setTimeout(() => {
								// Get the template node from the chain
								const templateNodeInChain = templateNodes?.value?.find((t: any) => 
									allEdges.value.some((e: any) => e.source === t.id)
								);
								
								if (templateNodeInChain) {
									const saveTemplateNode = createSaveTemplateNode(bFolderSetupNode, templateNodeInChain);
									
									if (saveTemplateNode) {
										// Connect B Folder to Save Template
										const edge3 = createEdge(bFolderSetupNode.id, saveTemplateNode.id);
										console.log("✅ Edge 3 result:", edge3);
									}
								}

								// Propagate script data
								setTimeout(() => {
									const scriptRunnerData = scriptRunnerNode.data as any;
									if (scriptRunnerData?.detectedScripts && vueFlowUpdateNode) {
										vueFlowUpdateNode(bFolderSetupNode.id, (node: any) => ({
											...node,
											data: {
												...node.data,
												detectedScripts: scriptRunnerData.detectedScripts,
												scriptOSVersions: scriptRunnerData.scriptOSVersions || {}
											}
										}));
									}
								}, 100);
							}, 200);
						}
						}, 200);
					}
				}, 100);
			}

			return node;
		} catch (error) {
			console.error("❌ Error creating project explorer node:", error);
			return null;
		}
	};

	const configureTemplateNode = (nodeId: string) => {
		if (!templateNodes) {
			console.error("templateNodes not provided to composable");
			return;
		}
		const nodeIndex = templateNodes.value.findIndex((n: any) => n.id === nodeId);
		if (nodeIndex !== -1) {
			templateNodes.value[nodeIndex] = {
				...templateNodes.value[nodeIndex],
				data: {
					...templateNodes.value[nodeIndex].data,
					configured: true
				}
			};
		}
	};

	const updateNodeComplete = (nodeId: string, data: any, allArrays?: any[]) => {
		console.log("NodeHookCanvas: updateNodeComplete called with:", nodeId, data);
		
		if (!allArrays || !vueFlowUpdateNode || !getNode || !projectExplorerNodes) {
			console.error("Required dependencies not provided to composable");
			return;
		}

		let nodeFound = false;
		let updatedNode = null;
		for (const { array: nodeArray } of allArrays) {
			const nodeIndex = nodeArray.value.findIndex((n: any) => n.id === nodeId);
			if (nodeIndex !== -1) {
				console.log("NodeHookCanvas: Found node in array, updating data");
				nodeArray.value[nodeIndex] = {
					...nodeArray.value[nodeIndex],
					data: {
						...nodeArray.value[nodeIndex].data,
						...data
					}
				};
				updatedNode = nodeArray.value[nodeIndex];
				nodeFound = true;
				break;
			}
		}

		if (!nodeFound) {
			console.log("NodeHookCanvas: Node not found in any array");
		}

		if (updatedNode && updatedNode.type === "intentSelection" && data.selectedFolderPath) {
			console.log("NodeHookCanvas: Intent node updated with folder, propagating to connected project explorer nodes");

			const connectedEdges = allEdges.value.filter((e: any) => e.source === nodeId);
			console.log("NodeHookCanvas: Found connected edges:", connectedEdges);

			for (const edge of connectedEdges) {
				const targetNode = projectExplorerNodes.value.find((n: any) => n.id === edge.target);
				if (targetNode) {
					console.log("NodeHookCanvas: Updating project explorer node:", targetNode.id);

					const newData = {
						projectPath: data.selectedFolderPath,
						selectedFolderPath: data.selectedFolderPath,
						analysis: data.folderAnalysis,
						folderAnalysis: data.folderAnalysis,
						projectName: data.selectedFolderPath.split(/[/\\]/).pop() || "unknown-project"
					};

					console.log("NodeHookCanvas: New data for project explorer:", newData);

					const explorerIndex = projectExplorerNodes.value.findIndex((n: any) => n.id === targetNode.id);
					if (explorerIndex !== -1) {
						projectExplorerNodes.value[explorerIndex] = {
							...projectExplorerNodes.value[explorerIndex],
							data: {
								...projectExplorerNodes.value[explorerIndex].data,
								...newData
							}
						};
						console.log("NodeHookCanvas: Updated array, new data:", projectExplorerNodes.value[explorerIndex].data);
					}

					const vueFlowNode = getNode.value(targetNode.id);
					if (vueFlowNode) {
						console.log("NodeHookCanvas: Updating VueFlow node:", targetNode.id);
						console.log("NodeHookCanvas: Current VueFlow node data:", vueFlowNode.data);

						vueFlowUpdateNode(targetNode.id, (node: any) => ({
							...node,
							data: {
								...node.data,
								...newData
							}
						}));

						console.log("NodeHookCanvas: VueFlow node updated");

						const updatedNode = getNode.value(targetNode.id);
						console.log("NodeHookCanvas: Verified updated node data:", updatedNode?.data);
					} else {
						console.log("NodeHookCanvas: VueFlow node not found:", targetNode.id);
					}
				}
			}
		}
	};

	const handleNodeUpdated = (nodeId: string, data: any) => {
		console.log("Node updated:", nodeId, data);
		updateNodeComplete(nodeId, data, allNodeArrays);
	};

	const jsonOutput = computed(() => {
		return {
			timestamp: new Date().toISOString(),
			canvas: "node-hook-canvas",
			nodes: allNodes.value.map((node: any) => ({
				id: node.id,
				type: node.type,
				position: node.position,
				data: node.data,
				selected: node.selected || false,
				draggable: node.draggable !== false,
				selectable: node.selectable !== false
			})),
			edges: allEdges.value.map((edge: any) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				sourceHandle: edge.sourceHandle,
				targetHandle: edge.targetHandle,
				type: edge.type || "default",
				label: edge.label || "",
				style: edge.style || {},
				markerEnd: edge.markerEnd || {}
			})),
			metadata: {
				totalNodes: allNodes.value.length,
				totalEdges: allEdges.value.length,
				nodeTypes: [...new Set(allNodes.value.map((n: any) => n.type))],
				lastUpdated: new Date().toISOString()
			}
		};
	});

	const formattedJsonOutput = computed(() => {
		return JSON.stringify(jsonOutput.value, null, 2);
	});

	return {
		handleProjectTypeSelected,
		handleFolderSelected,
		handleIntentAnalyzed,
		handleStackSelected,
		handleIntentSelected,
		handleProceedToNext,
		handleNodeUpdated,
		handleFileSelected,
		handleAnalysisComplete,
		handleError,
		createIntentSelectionNode,
		createProjectExplorerNode,
		createProjectScriptRunnerNode,
		createBFolderSetupNode,
		createEdge,
		configureTemplateNode,
		updateNodeComplete,
		jsonOutput,
		formattedJsonOutput
	};
}


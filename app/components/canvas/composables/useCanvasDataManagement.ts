import type { Ref } from "vue";

/**
 * Composable for managing canvas data loading and saving operations
 */
export function useCanvasDataManagement(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	databaseNodes: Ref<any[]>,
	apiNodes: Ref<any[]>,
	serverNodes: Ref<any[]>,
	cloudNodes: Ref<any[]>,
	eventNodes: Ref<any[]>,
	commandNodes: Ref<any[]>,
	viewNodes: Ref<any[]>,
	gitActionNodes: Ref<any[]>,
	hookNodes: Ref<any[]>,
	transportNodes: Ref<any[]>,
	transportTemplateNodes: Ref<any[]>,
	templateNodes: Ref<any[]>,
	templateConfiguredNodes: Ref<any[]>,
	solutionNodes: Ref<any[]>,
	githubNodes: Ref<any[]>,
	folderBrowserNodes: Ref<any[]>,
	intentSelectionNodes: Ref<any[]>,
	projectExplorerNodes: Ref<any[]>,
	projectScriptRunnerNodes: Ref<any[]>,
	bFolderSetupNodes: Ref<any[]>,
	saveTemplateNodes: Ref<any[]>,
	environmentNodes: Ref<any[]>,
	webviewNodes: Ref<any[]>,
	viewportNodes: Ref<any[]>,
	codeEditorNodes: Ref<any[]>,
	rustCheckNodes: Ref<any[]>,
	nodeCheckNodes: Ref<any[]>,
	phpCheckNodes: Ref<any[]>,
	dotnetCheckNodes: Ref<any[]>,
	pythonCheckNodes: Ref<any[]>,
	javaCheckNodes: Ref<any[]>,
	builditCliNodes: Ref<any[]>,
	fileCreatorNodes: Ref<any[]>,
	formsPanelNodes: Ref<any[]>,
	formBuilderNodes: Ref<any[]>,
	formAutomationNodes: Ref<any[]>,
	scriptEditorNodes: Ref<any[]>,
	userNodes: Ref<any[]>,
	orbitCardNodes: Ref<any[]>,
	projectNodes: Ref<any[]>,
	setupProjectNodes: Ref<any[]>,
	projectToolsSetupNodes: Ref<any[]>,
	projectEnvironmentNodes: Ref<any[]>,
	projectInstallNodes: Ref<any[]>,
	builditNodes: Ref<any[]>,
	userManagementNodes: Ref<any[]>,
	taskNodes: Ref<any[]>,
	integrationConnectionNodes: Ref<any[]>,
	integrationDetailNodes: Ref<any[]>,
	ideStatusNodes: Ref<any[]>,
	browserNodes: Ref<any[]>,
	clearAllNodesBase: () => void,
	clearPositionLocks: () => void,
	lockNodePosition: (nodeId: string, position: { x: number, y: number }) => void,
	loadNodesWithExactPositions: (nodes: any[]) => any[],
	vueFlowSetViewport: (viewport: any) => void,
	verifyAllPositions: (nodes: any[]) => void,
	canvasDisplayName: Ref<string>,
	setEdges: (edges: any[]) => void,
	setCurrentCanvasName?: (name: string) => void,
	addNodes?: (nodes: any[]) => void
) {
	/**
	 * Load canvas data from saved state
	 */
	const loadCanvasData = (canvasData: any) => {
		console.log("📥 Loading canvas:", canvasData);

		// Clear current canvas and position locks
		clearAllNodesBase();
		edges.value = [];
		clearPositionLocks();

		// Load nodes with exact positions using the persistence composable
		if (canvasData.nodes && canvasData.nodes.length > 0) {
			const processedNodes = loadNodesWithExactPositions(canvasData.nodes);

			processedNodes.forEach((node: any) => {
				// Add nodes to appropriate arrays based on type
				const nodeType = node.type;
				const nodeArrays: Record<string, Ref<any[]>> = {
					database: databaseNodes,
					api: apiNodes,
					server: serverNodes,
					cloud: cloudNodes,
					eventNode: eventNodes,
					commandNode: commandNodes,
					viewNode: viewNodes,
					gitActionNode: gitActionNodes,
					hookNode: hookNodes,
					transportNode: transportNodes,
					transportTemplateNode: transportTemplateNodes,
					templateNode: templateNodes,
					templateConfiguredNode: templateConfiguredNodes,
					solutionNode: solutionNodes,
					githubNode: githubNodes,
					folderBrowser: folderBrowserNodes,
					intentSelection: intentSelectionNodes,
					projectExplorer: projectExplorerNodes,
					projectScriptRunnerNode: projectScriptRunnerNodes,
					bFolderSetupNode: bFolderSetupNodes,
					saveTemplateNode: saveTemplateNodes,
					environmentNode: environmentNodes,
					webviewNode: webviewNodes,
					viewportNode: viewportNodes,
					codeEditorNode: codeEditorNodes,
					rustCheckNode: rustCheckNodes,
					nodeCheckNode: nodeCheckNodes,
					phpCheckNode: phpCheckNodes,
					dotnetCheckNode: dotnetCheckNodes,
					pythonCheckNode: pythonCheckNodes,
					javaCheckNode: javaCheckNodes,
					builditCliNode: builditCliNodes,
					fileCreatorNode: fileCreatorNodes,
					formsPanelNode: formsPanelNodes,
					formBuilderNode: formBuilderNodes,
					formAutomationNode: formAutomationNodes,
					scriptEditorNode: scriptEditorNodes,
					userNode: userNodes,
					orbitCardNode: orbitCardNodes,
					projectNode: projectNodes,
					setupProjectNode: setupProjectNodes,
					projectToolsSetupNode: projectToolsSetupNodes,
					projectEnvironmentNode: projectEnvironmentNodes,
					projectInstallNode: projectInstallNodes,
					builditNode: builditNodes,
					userManagementNode: userManagementNodes,
					taskNode: taskNodes,
					integrationConnectionNode: integrationConnectionNodes,
					integrationDetailNode: integrationDetailNodes,
					ideStatusNode: ideStatusNodes,
					browserNode: browserNodes,
					"buildit-cli": builditCliNodes
				};

				if (nodeType in nodeArrays) {
					const targetArray = nodeArrays[nodeType];
					if (targetArray) {
						targetArray.value.push(node);
					}
				}
			});

			// CRITICAL: Add all processed nodes to VueFlow so they're visible
			if (addNodes && processedNodes.length > 0) {
				console.log("🎨 Adding", processedNodes.length, "nodes to VueFlow");
				addNodes(processedNodes);
			} else {
				console.warn("⚠️ addNodes function not available - nodes won't be visible on canvas");
			}
		}

		// Update canvas name in both display and current canvas name
		console.log("📝 Setting canvas name to:", canvasData.name);
		canvasDisplayName.value = canvasData.name;
		if (setCurrentCanvasName) {
			setCurrentCanvasName(canvasData.name);
			console.log("✅ Updated currentCanvasName to:", canvasData.name);
		}

		// IMMEDIATELY lock all loaded positions (no delay!)
		console.log("🔒 Locking all loaded positions IMMEDIATELY...");
		allNodes.value.forEach((node: any) => {
			if (node.position) {
				lockNodePosition(node.id, node.position);
				console.log(`  🔒 Locked ${node.id}: (${node.position.x}, ${node.position.y})`);
			}
		});

		console.log("✅ Loaded", allNodes.value.length, "nodes with locked positions");

		// Wait for nodes to be added to VueFlow before adding edges
		// Use nextTick and a small delay to ensure nodes are rendered
		setTimeout(() => {
			// Load edges after nodes are added
			if (canvasData.edges && canvasData.edges.length > 0) {
				// Filter edges to only include those where both source and target nodes exist
				const validEdges = canvasData.edges.filter((edge: any) => {
					const sourceExists = allNodes.value.some((n: any) => n.id === edge.source);
					const targetExists = allNodes.value.some((n: any) => n.id === edge.target);
					if (!sourceExists || !targetExists) {
						console.warn(`⚠️ Skipping edge ${edge.id}: source or target node missing`, {
							source: edge.source,
							target: edge.target,
							sourceExists,
							targetExists
						});
						return false;
					}
					return true;
				});

				edges.value = validEdges;
				// Update VueFlow with the loaded edges to ensure they render properly
				setEdges([...validEdges]);
				console.log("✅ Loaded", validEdges.length, "valid edges (filtered from", canvasData.edges.length, "total)");
			}

			// Restore viewport (wait longer for VueFlow to fully initialize)
			setTimeout(() => {
				if (canvasData.viewport) {
					console.log("🔄 Restoring viewport:", canvasData.viewport);
					try {
						vueFlowSetViewport(canvasData.viewport);
					} catch (error) {
						console.warn("⚠️ Viewport restoration failed, will retry:", error);
						// Retry after another delay
						setTimeout(() => {
							try {
								vueFlowSetViewport(canvasData.viewport);
							} catch (retryError) {
								console.error("❌ Viewport restoration failed after retry:", retryError);
							}
						}, 500);
					}
				}

				// Verify positions after viewport restore
				setTimeout(() => {
					verifyAllPositions(allNodes.value);
				}, 100);
			}, 300); // Increased delay for VueFlow initialization
		}, 100); // Wait for nodes to be added to VueFlow
	};

	/**
	 * Handle loading canvas from external trigger
	 */
	const handleLoadCanvas = (canvasData: any) => {
		loadCanvasData(canvasData);
	};

	/**
	 * Handle creating a new empty canvas
	 */
	const handleCreateNewCanvas = (clearAllNodes: () => void) => {
		clearAllNodes();
		canvasDisplayName.value = "Untitled Canvas";
	};

	/**
	 * Handle canvas name changes
	 */
	const handleCanvasNameChanged = (name: string) => {
		canvasDisplayName.value = name;
		if (setCurrentCanvasName) {
			setCurrentCanvasName(name);
		}
	};

	return {
		loadCanvasData,
		handleLoadCanvas,
		handleCreateNewCanvas,
		handleCanvasNameChanged
	};
}

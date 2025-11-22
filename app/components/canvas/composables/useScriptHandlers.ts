import type { Ref } from "vue";

/**
 * Script Handlers
 * Handles script editor operations, updates, and lifecycle
 */
export function useScriptHandlers(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	scriptEditorNodes: Ref<any[]>,
	codeEditorNodes: Ref<any[]>,
	getNodeFn: any,
	addNodes: (nodes: any[]) => void,
	addEdges: (edges: any[]) => void,
	updateNodeData: (nodeId: string, key: string, value: any) => void
) {
	/**
	 * Handle script updated from ScriptEditorNode
	 */
	const handleScriptUpdated = (scriptName: string, updates: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("📝 HANDLE SCRIPT UPDATED CALLED");
		console.log("Script Name:", scriptName);
		console.log("Updates:", updates);
		console.log("═══════════════════════════════════════════");

		// Find the script editor node that just updated
		const scriptEditorNode = allNodes.value.find((n: any) =>
			n.type === "scriptEditorNode" && n.data?.scriptData?.name === scriptName
		);

		console.log("🔍 Found scriptEditorNode:", scriptEditorNode?.id);
		console.log("🔍 Source node ID:", scriptEditorNode?.data?.sourceNodeId);

		if (scriptEditorNode?.data?.sourceNodeId) {
			const sourceNodeId = scriptEditorNode.data.sourceNodeId;
			const sourceNode = getNodeFn.value(sourceNodeId);

			console.log("🔍 Found sourceNode:", sourceNode?.id, sourceNode?.type);

			if (sourceNode && sourceNode.type === "projectScriptRunnerNode") {
				console.log("🔄 Updating detectedScripts in ProjectScriptRunnerNode:", sourceNodeId);

				// Get current detectedScripts
				const currentDetectedScripts = sourceNode.data?.detectedScripts;
				const currentScripts = currentDetectedScripts?.scripts || [];

				console.log("📋 Current scripts:", currentScripts.length);
				console.log("📋 Scripts before update:", currentScripts.map((s: any) => ({ name: s.name, description: s.description, order: s.order })));

				// Update the specific script
				const updatedScripts = currentScripts.map((script: any) => {
					if (script.name === scriptName) {
						console.log(`✏️ Updating script "${scriptName}":`, {
							oldDescription: script.description,
							newDescription: updates.description,
							oldOrder: script.order,
							newOrder: updates.order
						});
						return {
							...script,
							description: updates.description || "",
							order: typeof updates.order === "number" ? updates.order : 0
						};
					}
					return script;
				});

				console.log("📋 Scripts after update:", updatedScripts.map((s: any) => ({ name: s.name, description: s.description, order: s.order })));

				// Update the ProjectScriptRunnerNode with new detectedScripts
				updateNodeData(sourceNodeId, "detectedScripts", {
					...currentDetectedScripts,
					scripts: updatedScripts
				});

				console.log("✅ Updated detectedScripts in ProjectScriptRunnerNode");
				console.log("═══════════════════════════════════════════");
			} else {
				console.error("❌ Source node not found or not a projectScriptRunnerNode");
				console.log("═══════════════════════════════════════════");
			}
		} else {
			console.error("❌ No sourceNodeId found in scriptEditorNode");
			console.log("═══════════════════════════════════════════");
		}
	};

	/**
	 * Handle opening script editor
	 */
	const handleOpenScriptEditor = (scriptData: any, sourceNodeId: string, sourcePosition: { x: number, y: number }) => {
		console.log("📝 Opening script editor for:", scriptData.name);

		const nodeId = `scriptEditor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const newNode = {
			id: nodeId,
			type: "scriptEditorNode",
			position: {
				x: sourcePosition.x + 650,
				y: sourcePosition.y
			},
			data: {
				label: `Edit: ${scriptData.name}`,
				scriptData,
				sourceNodeId
			},
			style: {
				width: "500px",
				height: "auto"
			},
			draggable: true,
			selectable: true
		};

		// Add to scriptEditorNodes array FIRST
		scriptEditorNodes.value.push(newNode);
		console.log("✅ Added to scriptEditorNodes array");

		// Create edge BEFORE calling addEdges
		const newEdge = {
			id: `edge_${sourceNodeId}_${nodeId}_${Date.now()}`,
			source: sourceNodeId,
			target: nodeId,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			animated: true,
			style: { stroke: "#a855f7", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "#a855f7" }
		};

		// Add to edges array FIRST
		edges.value.push(newEdge);
		console.log("✅ Added to edges array");

		// Then call VueFlow methods
		addNodes([newNode]);
		addEdges([newEdge]);

		console.log("✅ Created ScriptEditorNode with connection:", nodeId);
	};

	/**
	 * Handle close script editor node
	 */
	const handleCloseScriptEditorNode = (nodeId: string) => {
		console.log("🗑️ Closing script editor node:", nodeId);

		// Remove from scriptEditorNodes array
		const index = scriptEditorNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			scriptEditorNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Script editor node closed");
	};

	/**
	 * Handle close code editor
	 */
	const handleCloseCodeEditor = (nodeId: string) => {
		console.log("🗑️ Closing code editor node:", nodeId);

		// Remove from codeEditorNodes array
		const index = codeEditorNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			codeEditorNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Code editor node closed");
	};

	/**
	 * Handle refresh code editor
	 */
	const handleRefreshCodeEditor = (nodeId: string) => {
		console.log("🔄 Refreshing code editor node:", nodeId);

		const node = allNodes.value.find((n: any) => n.id === nodeId);
		if (!node) {
			console.warn("⚠️ Node not found:", nodeId);
			return;
		}

		// Find connected data source
		const incomingEdge = edges.value.find((e: any) => e.target === nodeId);
		if (!incomingEdge) {
			console.warn("⚠️ No incoming connection found");
			return;
		}

		const sourceNode = allNodes.value.find((n: any) => n.id === incomingEdge.source);
		if (!sourceNode) {
			console.warn("⚠️ Source node not found");
			return;
		}

		console.log("🔍 Refreshing from source:", sourceNode.type);

		// Update code editor content based on source node type
		if (sourceNode.type === "githubNode") {
			// Refresh from GitHub repository
			const repoData = sourceNode.data;
			console.log("📥 Refreshing from GitHub:", repoData);
			// Implementation for GitHub refresh
		} else if (sourceNode.type === "fileCreatorNode") {
			// Refresh from file creator
			const fileContent = sourceNode.data?.fileContent || "";
			updateNodeData(nodeId, "codeContent", fileContent);
			console.log("✅ Refreshed from FileCreatorNode");
		} else if (sourceNode.type === "browserNode") {
			// Refresh from browser HTML
			const htmlContent = sourceNode.data?.htmlContent || "";
			updateNodeData(nodeId, "codeContent", htmlContent);
			console.log("✅ Refreshed from BrowserNode");
		}

		console.log("✅ Code editor refreshed");
	};

	return {
		handleScriptUpdated,
		handleOpenScriptEditor,
		handleCloseScriptEditorNode,
		handleCloseCodeEditor,
		handleRefreshCodeEditor
	};
}



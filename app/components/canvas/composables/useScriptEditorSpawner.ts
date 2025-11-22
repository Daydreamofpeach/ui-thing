/**
 * Composable for spawning ScriptEditorNode from script lists
 * Creates properly connected nodes on the canvas
 */
export function useScriptEditorSpawner() {
	/**
	 * Create a ScriptEditorNode for a given script
	 */
	const createScriptEditorNode = (
		script: any,
		sourceNodeId: string,
		sourceNodePosition: { x: number, y: number },
		projectPath: string
	) => {
		const nodeId = `scriptEditor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const newNode = {
			id: nodeId,
			type: "scriptEditorNode",
			position: {
				x: sourceNodePosition.x + 650, // Position to the right of source
				y: sourceNodePosition.y
			},
			data: {
				label: `Edit: ${script.name}`,
				scriptData: {
					name: script.name,
					command: script.command || "",
					description: script.description || "",
					order: script.order || 0,
					projectPath,
					// OS-specific commands
					windowsCommand: script.windowsCommand || script.command || "",
					linuxCommand: script.linuxCommand || script.command || "",
					macCommand: script.macCommand || script.command || ""
				},
				sourceNodeId // Track which node opened this editor
			},
			style: {
				width: "500px",
				height: "auto"
			},
			draggable: true,
			selectable: true
		};

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

		return { node: newNode, edge: newEdge };
	};

	return {
		createScriptEditorNode
	};
}


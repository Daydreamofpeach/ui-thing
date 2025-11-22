import { nextTick } from "vue";

export function useFileEditorManagement(
	allNodes: any,
	edges: any,
	addEdges: any,
	vueFlowUpdateNode: any,
	nodeCreatorRef: any,
	addNodes?: any
) {
	const findCodeEditorNodeByFilePath = (filePath: string): string | null => {
		const codeEditorNode = allNodes.value.find(
			(node: any) => node.type === "codeEditorNode" && node.data?.filePath === filePath
		);
		return codeEditorNode?.id || null;
	};

	const removeCodeEditorNode = (nodeId: string) => {
		console.log("🔧 Removing code editor node:", nodeId);

		// Find edges connected to this specific node only
		const edgesToRemove = edges.value.filter((e: any) => e.source === nodeId || e.target === nodeId);
		
		console.log("🔍 Found", edgesToRemove.length, "edges to remove for node:", nodeId);
		console.log("🔍 Edges to remove:", edgesToRemove.map((e: any) => ({ id: e.id, source: e.source, target: e.target })));

		// Remove edges one by one to preserve other connections
		edgesToRemove.forEach((edge: any) => {
			const edgeIndex = edges.value.findIndex((e: any) => e.id === edge.id);
			if (edgeIndex !== -1) {
				edges.value.splice(edgeIndex, 1);
				console.log("✅ Removed edge:", edge.id);
			}
		});

		// Remove the node itself
		const nodeIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (nodeIndex !== -1) {
			allNodes.value.splice(nodeIndex, 1);
			console.log("✅ Code editor node removed:", nodeId);
		}

		console.log("🔗 Chain connections preserved during node removal");
	};

	const logChainConnections = () => {
		const chainEdges = edges.value.filter((e: any) => 
			e.source.includes('template') || 
			e.source.includes('intent') || 
			e.source.includes('projectExplorer') ||
			e.target.includes('template') || 
			e.target.includes('intent') || 
			e.target.includes('projectExplorer')
		);
		console.log("🔗 Current chain connections:", chainEdges.map((e: any) => ({ 
			id: e.id, 
			source: e.source, 
			target: e.target,
			type: e.type || 'default'
		})));
	};

	const handleFileOpened = async (file: any, content: string) => {
		console.log("🔷🔷🔷 handleFileOpened CALLED! 🔷🔷🔷");
		console.log("🔷 File opened/toggled:", file);
		console.log("🔷 File name:", file.name);
		console.log("🔷 File path:", file.path);
		console.log("🔷 Content length:", content?.length);
		console.log("🔷 nodeCreatorRef.value:", nodeCreatorRef.value);

		// Log chain connections before making changes
		console.log("📊 Chain connections before file opening:");
		logChainConnections();

		const filePath = file.path;
		const existingEditorNodeId = findCodeEditorNodeByFilePath(filePath);

		if (existingEditorNodeId) {
			console.log("🔄 Editor already open for this file, closing it:", file.name);

			// Log chain connections before closing
			console.log("📊 Chain connections before file closing:");
			logChainConnections();

			removeCodeEditorNode(existingEditorNodeId);

			// Log chain connections after closing
			console.log("📊 Chain connections after file closing:");
			logChainConnections();

			return;
		}

		console.log("📂 Opening new editor for file:", file.name, "Content length:", content?.length || 0);

		let editorNodeId: string | null = null;

		if (nodeCreatorRef.value?.createCodeEditorNode) {
			console.log("✅ nodeCreatorRef.value is available");
			console.log("✅ nodeCreatorRef.value.createCodeEditorNode:", nodeCreatorRef.value.createCodeEditorNode);
			const fileExtension = file.extension || "txt";
			editorNodeId = nodeCreatorRef.value.createCodeEditorNode(content, file.name, fileExtension, filePath);
			console.log("✅ Code editor node ID:", editorNodeId, "for file:", file.name);
		} else if (addNodes) {
			// Fallback: Create node directly using addNodes
			console.log("⚠️ nodeCreatorRef not available, using addNodes fallback");
			const fileExtension = file.extension || "txt";
			const existingEditors = allNodes.value.filter((n: any) => n.type === "codeEditorNode");
			const offset = existingEditors.length * 50;

			editorNodeId = `code-editor-${file.name.replace(/[^a-z0-9]/gi, "_")}-${Date.now()}`;
			const newNode = {
				id: editorNodeId,
				type: "codeEditorNode",
				position: { x: 800 + offset, y: 200 + offset },
				data: {
					label: `Code Editor - ${file.name}`,
					codeContent: content,
					fileName: file.name,
					fileType: fileExtension,
					filePath: filePath,
					collapsed: false
				},
				draggable: true,
				selectable: true
			};

			console.log("✅ Creating code editor node directly:", editorNodeId);
			addNodes([newNode]);
		} else {
			console.error("❌ Cannot create code editor node: nodeCreatorRef and addNodes both unavailable");
			return;
		}

		await nextTick();

		const projectExplorerNode = allNodes.value.find((n: any) => n.type === "projectExplorer");
		const editorNode = allNodes.value.find((n: any) => n.id === editorNodeId);

		console.log("🔍 ProjectExplorer node:", projectExplorerNode?.id);
		console.log("🔍 Editor node:", editorNode?.id);

		if (projectExplorerNode && editorNode) {
			const fileHandleId = `file-${filePath.replace(/[^a-z0-9]/gi, "_")}`;
			const connectionId = `file-to-editor-${filePath.replace(/[^a-z0-9]/gi, "_")}`;

			console.log("🔗 Creating connection with handles:", {
				source: projectExplorerNode.id,
				sourceHandle: fileHandleId,
				target: editorNode.id,
				targetHandle: "left"
			});

			const existingConnection = edges.value.find((e: any) => e.id === connectionId);

			if (!existingConnection) {
				// Wait for VueFlow to render the new node before creating edge
				setTimeout(() => {
					const newEdge = {
						id: connectionId,
						source: projectExplorerNode.id,
						target: editorNode.id,
						sourceHandle: fileHandleId,
						targetHandle: "left",
						type: "smoothstep",
						animated: true,
						style: {
							stroke: "#22c55e",
							strokeWidth: 3
						},
						markerEnd: {
							type: "arrowclosed",
							color: "#22c55e"
						},
						label: file.name,
						labelBgStyle: { fill: "rgba(0, 0, 0, 0.8)" },
						labelStyle: { fill: "#22c55e", fontSize: 12 },
						data: {
							filePath,
							fileName: file.name
						}
					};

					// Use only addEdges to properly manage the edge addition
					// This ensures existing chain connections are preserved
					addEdges([newEdge]);

					console.log("✅ Created connection from file to code editor:", connectionId);
					console.log("📊 Total edges now:", edges.value.length);

					// Log chain connections after making changes to verify they're preserved
					console.log("📊 Chain connections after file opening:");
					logChainConnections();
				}, 200);
			} else {
				console.log("⚠️ Connection already exists for this file:", connectionId);
			}
		} else {
			console.error("❌ Missing nodes for connection:", {
				hasProjectExplorer: !!projectExplorerNode,
				hasEditorNode: !!editorNode,
				editorNodeId
			});
		}
	};

	const toggleCodeEditorCollapse = (nodeId: string) => {
		console.log("Toggling code editor collapse for:", nodeId);

		const node = allNodes.value.find((n: any) => n.id === nodeId);
		if (node) {
			const currentCollapsed = node.data?.collapsed || false;

			vueFlowUpdateNode(nodeId, (node: any) => ({
				...node,
				data: {
					...node.data,
					collapsed: !currentCollapsed
				}
			}));
		}
	};

	const getCodeEditorNodeStyle = (customNodeProps: any) => {
		if (customNodeProps.data?.collapsed) {
			return {
				width: "300px",
				height: "80px"
			};
		}
		return {
			width: customNodeProps.width || "800px",
			height: customNodeProps.height || "600px"
		};
	};

	const handleCodeChanged = (nodeId: string, content: string) => {
		console.log("Code changed in node:", nodeId);
		vueFlowUpdateNode(nodeId, (node: any) => ({
			...node,
			data: {
				...node.data,
				codeContent: content
			}
		}));
	};

	return {
		findCodeEditorNodeByFilePath,
		removeCodeEditorNode,
		handleFileOpened,
		toggleCodeEditorCollapse,
		getCodeEditorNodeStyle,
		handleCodeChanged
	};
}


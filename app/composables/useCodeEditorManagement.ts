import { nextTick, ref } from "vue";

export function useCodeEditorManagement() {
	const codeEditorNodes = ref<any[]>([]);
	const codeEditorContent = ref<Record<string, string>>({});

	const findCodeEditorNodeByFilePath = (filePath: string) => {
		return codeEditorNodes.value.find(node => node.data.filePath === filePath);
	};

	const removeCodeEditorNode = (filePath: string, removeNodes: (nodeIds: string[]) => void) => {
		const editorNode = findCodeEditorNodeByFilePath(filePath);
		if (editorNode) {
			removeNodes([editorNode.id]);
			codeEditorNodes.value = codeEditorNodes.value.filter(node => node.id !== editorNode.id);
			delete codeEditorContent.value[filePath];
			console.log("🗑️ Removed code editor node for:", filePath);
		}
	};

	const handleFileOpened = async (
		filePath: string,
		fileName: string,
		fileType: string,
		content: string,
		projectExplorerNodeId: string,
		addEdges: (edges: any[]) => void,
		removeNodes: (nodeIds: string[]) => void,
		emit: any
	) => {
		console.log("📂 File opened:", { filePath, fileName, fileType });

		// Check if code editor already exists for this file
		const existingEditor = findCodeEditorNodeByFilePath(filePath);
		if (existingEditor) {
			console.log("🔄 Code editor already exists for this file, toggling...");
			removeCodeEditorNode(filePath, removeNodes);
			return;
		}

		// Store content
		codeEditorContent.value[filePath] = content;

		// Create code editor node
		const editorNodeId = `code_editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const sanitizedPath = filePath.replace(/[^a-zA-Z0-9]/g, "_");
		
		const editorNode = {
			id: editorNodeId,
			type: "codeEditorNode",
			position: { 
				x: Math.random() * 400 + 500, 
				y: Math.random() * 300 + 100 
			},
			data: {
				label: fileName,
				fileName,
				fileType,
				codeContent: content,
				filePath
			},
			draggable: true,
			selectable: true,
			resizable: true,
			style: { 
				width: "600px", 
				height: "500px",
				minWidth: "400px",
				minHeight: "300px"
			}
		};

		codeEditorNodes.value.push(editorNode);
		emit("nodeCreated", editorNode);

		// Wait for node to be rendered
		await nextTick();

		// Create connection from the specific file in the tree to the code editor
		const newEdge = {
			id: `edge_file_to_editor_${sanitizedPath}_${Date.now()}`,
			source: projectExplorerNodeId,
			sourceHandle: `file-${sanitizedPath}`,
			target: editorNodeId,
			targetHandle: "code-editor-top",
			type: "default",
			animated: true,
			style: { 
				stroke: "#10b981",
				strokeWidth: 2
			},
			label: fileName,
			labelStyle: { 
				fill: "#10b981", 
				fontWeight: 600 
			}
		};

		addEdges([newEdge]);
		console.log("✅ Created edge from file to code editor:", newEdge);
	};

	const handleCodeChanged = (nodeId: string, newContent: string) => {
		const node = codeEditorNodes.value.find(n => n.id === nodeId);
		if (node?.data?.filePath) {
			codeEditorContent.value[node.data.filePath] = newContent;
			console.log("💾 Code updated for:", node.data.filePath);
		}
	};

	const handleFileSaved = async (nodeId: string, fileName: string, content: string) => {
		console.log("💾 File saved:", { nodeId, fileName, content: content.substring(0, 100) + "..." });
		
		const node = codeEditorNodes.value.find(n => n.id === nodeId);
		if (node?.data?.filePath) {
			try {
				const { writeTextFile } = await import("@tauri-apps/plugin-fs");
				await writeTextFile(node.data.filePath, content);
				console.log("✅ File saved successfully:", node.data.filePath);
			} catch (error) {
				console.error("❌ Error saving file:", error);
			}
		}
	};

	return {
		codeEditorNodes,
		codeEditorContent,
		findCodeEditorNodeByFilePath,
		removeCodeEditorNode,
		handleFileOpened,
		handleCodeChanged,
		handleFileSaved
	};
}


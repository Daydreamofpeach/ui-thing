<template>
	<!-- This component doesn't render anything, it just handles node creation -->
</template>

<script setup lang="ts">
	import { ref } from "vue";

	interface Props {
		allNodes: any[]
		edges: any[]
		webviewNodes: any[]
		codeEditorNodes: any[]
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"nodes-updated": []
		"edges-updated": []
	}>();

	const createWebviewNode = (htmlContent: string, fileName: string) => {
		console.log("NodeCreator: Creating/updating webview node:", { htmlContent: htmlContent.substring(0, 100), fileName });

		// Check if webview node already exists
		const existingWebviewNode = props.allNodes.find((n) => n.type === "webviewNode");

		if (existingWebviewNode) {
			// Update existing webview node
			console.log("NodeCreator: Updating existing webview node");
			existingWebviewNode.data.htmlContent = htmlContent;
			existingWebviewNode.data.fileName = fileName;
			existingWebviewNode.data.label = "Web Preview";
		} else {
			// Create new webview node
			const nodeId = `webview-${Date.now()}`;
			const node = {
				id: nodeId,
				type: "webviewNode",
				position: { x: 400, y: 200 },
				data: {
					label: "Web Preview",
					htmlContent,
					fileName
				}
			};

			// Add node to the webview nodes array
			props.webviewNodes.push(node);

			// Find the view node ID dynamically
			const viewNode = props.allNodes.find((n) => n.type === "viewNode");
			if (viewNode) {
				// Create green connection from view node to webview
				const connectionId = `view-to-webview-${nodeId}`;
				const connection = {
					id: connectionId,
					source: viewNode.id,
					target: nodeId,
					sourceHandle: "right",
					targetHandle: "left",
					type: "smoothstep",
					style: { stroke: "#10b981", strokeWidth: 2 },
					markerEnd: { type: "arrowclosed", color: "#10b981" }
				};

				// Add edge to the edges array
				props.edges.push(connection);
				console.log("NodeCreator: Created connection from view node to webview:", connection);
			} else {
				console.warn("NodeCreator: No view node found to connect to");
			}
		}

		emit("nodes-updated");
		emit("edges-updated");
		console.log("NodeCreator: Webview node created/updated and connected to view node");
	};

	const createCodeEditorNode = (codeContent: string, fileName: string, fileType: string, filePath?: string) => {
		console.log("NodeCreator: Creating/updating code editor node:", { codeContent: codeContent.substring(0, 100), fileName, fileType, filePath });

		// Check if code editor node already exists for this specific file (by filePath or fileName)
		const existingCodeEditorNode = props.allNodes.find((n) =>
			n.type === "codeEditorNode"
			&& (filePath ? n.data?.filePath === filePath : n.data?.fileName === fileName)
		);

		let codeEditorNode;

		if (existingCodeEditorNode) {
			// Update existing code editor node
			console.log("NodeCreator: Updating existing code editor node for file:", fileName);
			existingCodeEditorNode.data.codeContent = codeContent;
			existingCodeEditorNode.data.fileName = fileName;
			existingCodeEditorNode.data.fileType = fileType;
			existingCodeEditorNode.data.label = `Code Editor - ${fileName}`;
			existingCodeEditorNode.data.filePath = filePath || fileName;
			existingCodeEditorNode.data.collapsed = false; // Expand when updating
			codeEditorNode = existingCodeEditorNode;
		} else {
			// Create new code editor node for this file
			// Calculate position based on number of existing code editor nodes
			const existingEditors = props.allNodes.filter((n) => n.type === "codeEditorNode");
			const offset = existingEditors.length * 50; // Stagger position

			const nodeId = `code-editor-${fileName.replace(/[^a-z0-9]/gi, "_")}-${Date.now()}`;
			const node = {
				id: nodeId,
				type: "codeEditorNode",
				position: { x: 800 + offset, y: 200 + offset },
				data: {
					label: `Code Editor - ${fileName}`,
					codeContent,
					fileName,
					fileType,
					filePath: filePath || fileName,
					collapsed: false
				}
			};

			console.log("NodeCreator: Creating new code editor node:", nodeId);
			console.log("NodeCreator: Node object:", node);

			// Add node to the code editor nodes array (reactive)
			props.codeEditorNodes.push(node);
			console.log("NodeCreator: Pushed to codeEditorNodes, new length:", props.codeEditorNodes.length);
			codeEditorNode = node;

			// Important: Emit that nodes were updated so parent can see the change
			emit("nodes-updated");
			console.log("NodeCreator: Emitted nodes-updated event");

			// Find the view node ID dynamically
			const viewNode = props.allNodes.find((n) => n.type === "viewNode");
			if (viewNode) {
				// Create green connection from view node to code editor
				const connectionId = `view-to-code-${nodeId}`;
				const connection = {
					id: connectionId,
					source: viewNode.id,
					target: nodeId,
					sourceHandle: "right",
					targetHandle: "left",
					type: "smoothstep",
					style: { stroke: "#10b981", strokeWidth: 2 },
					markerEnd: { type: "arrowclosed", color: "#10b981" }
				};

				// Add edge to the edges array
				props.edges.push(connection);
				console.log("NodeCreator: Created connection from view node to code editor:", connection);
			} else {
				console.warn("NodeCreator: No view node found to connect to");
			}
		}

		// If there's a webview node, create a connection between webview and code editor
		const webviewNode = props.allNodes.find((n) => n.type === "webviewNode");

		if (webviewNode && codeEditorNode) {
			// Check if connection already exists
			const existingConnection = props.edges.find((e) =>
				e.source === webviewNode.id && e.target === codeEditorNode.id
			);

			if (!existingConnection) {
				const webviewConnectionId = `webview-to-code-${codeEditorNode.id}`;
				const webviewConnection = {
					id: webviewConnectionId,
					source: webviewNode.id,
					target: codeEditorNode.id,
					sourceHandle: "right",
					targetHandle: "left",
					type: "smoothstep",
					style: { stroke: "#10b981", strokeWidth: 2 },
					markerEnd: { type: "arrowclosed", color: "#10b981" }
				};

				props.edges.push(webviewConnection);
				console.log("NodeCreator: Code editor connected to webview node:", webviewConnection);
			}
		}

		emit("nodes-updated");
		emit("edges-updated");
		console.log("NodeCreator: Code editor node created/updated and connected to view node");
		return codeEditorNode.id;
	};

	// Clean up old disconnected nodes
	const cleanupOldNodes = () => {
		console.log("NodeCreator: Cleaning up old disconnected nodes");

		// Remove old webview nodes (keep only the most recent one)
		const webviewNodes = props.allNodes.filter((n) => n.type === "webviewNode");
		if (webviewNodes.length > 1) {
			// Sort by creation time (assuming newer nodes have higher timestamps in ID)
			webviewNodes.sort((a, b) => b.id.localeCompare(a.id));
			// Keep the first (newest) one, remove the rest
			const nodesToRemove = webviewNodes.slice(1);
			nodesToRemove.forEach((node) => {
				// Remove from webviewNodes array
				const webviewIndex = props.webviewNodes.findIndex((n) => n.id === node.id);
				if (webviewIndex !== -1) {
					props.webviewNodes.splice(webviewIndex, 1);
				}
			});
			console.log(`NodeCreator: Removed ${nodesToRemove.length} old webview nodes`);
		}

		// Remove old code editor nodes (keep only the most recent one)
		const codeEditorNodes = props.allNodes.filter((n) => n.type === "codeEditorNode");
		if (codeEditorNodes.length > 1) {
			// Sort by creation time
			codeEditorNodes.sort((a, b) => b.id.localeCompare(a.id));
			// Keep the first (newest) one, remove the rest
			const nodesToRemove = codeEditorNodes.slice(1);
			nodesToRemove.forEach((node) => {
				// Remove from codeEditorNodes array
				const codeEditorIndex = props.codeEditorNodes.findIndex((n) => n.id === node.id);
				if (codeEditorIndex !== -1) {
					props.codeEditorNodes.splice(codeEditorIndex, 1);
				}
			});
			console.log(`NodeCreator: Removed ${nodesToRemove.length} old code editor nodes`);
		}

		// Clean up orphaned edges
		const validNodeIds = new Set(props.allNodes.map((n) => n.id));
		const validEdges = props.edges.filter((edge) =>
			validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
		);

		if (validEdges.length !== props.edges.length) {
			props.edges.splice(0, props.edges.length, ...validEdges);
			console.log(`NodeCreator: Cleaned up ${props.edges.length - validEdges.length} orphaned edges`);
		}
	};

	// Expose methods for parent component
	defineExpose({
		createWebviewNode,
		createCodeEditorNode,
		cleanupOldNodes
	});
</script>
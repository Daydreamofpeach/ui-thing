import { nextTick, type Ref } from "vue";

/**
 * Edge Operations
 * Handles edge CRUD operations, bulk operations, and node positioning
 */
export function useEdgeOperations(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	allNodeArrays: any[],
	getNodeFn: any,
	addEdges: (edges: any[]) => void,
	addNodes: (nodes: any[]) => void,
	removeEdges: (edgeIds: string[]) => void,
	setEdges: (edges: any[]) => void,
	vueFlowUpdateNode: any,
	getConnectionAnimationStyles: (animated: boolean, animationType: string, animationSpeed: string, strokeColor: string) => any
) {
	/**
	 * Add edge with animation styling
	 */
	const addEdge = (edgeData: any) => {
		console.log("➕ CanvasPanel: Adding edge:", edgeData);

		const isAnimated = edgeData.animated || false;
		const animationType = edgeData.animationType || "flow";
		const animationSpeed = edgeData.animationSpeed || "normal";
		const strokeColor = edgeData.style?.stroke;

		// Apply animation effects to the new edge
		const enhancedEdgeData = {
			...edgeData,
			// Animation data will be handled by CSS classes and injected components
			// Apply animation styles
			style: {
				...edgeData.style,
				...getConnectionAnimationStyles(
					isAnimated,
					animationType,
					animationSpeed,
					strokeColor
				)
			}
		};

		// Add to our edges array
		edges.value.push(enhancedEdgeData);

		// Add to VueFlow
		addEdges([enhancedEdgeData]);

		console.log("✅ CanvasPanel: Edge added successfully with animation effects:", enhancedEdgeData);
	};

	/**
	 * Remove edge
	 */
	const removeEdge = (edgeId: string) => {
		console.log("🗑️ CanvasPanel: Removing edge:", edgeId);

		// Remove from our edges array
		const edgeIndex = edges.value.findIndex((edge: any) => edge.id === edgeId);
		if (edgeIndex !== -1) {
			edges.value.splice(edgeIndex, 1);
			console.log("✅ CanvasPanel: Edge removed successfully");
		} else {
			console.warn("⚠️ Edge not found for removal:", edgeId);
		}

		// Also remove from VueFlow if needed
		removeEdges([edgeId]);
	};

	/**
	 * Update edge with animation and style handling
	 */
	const updateEdge = (edgeId: string, edgeData: any) => {
		console.log("🔗 CanvasPanel: Updating edge:", edgeId, edgeData);

		// Find the edge in our edges array and update it
		const edgeIndex = edges.value.findIndex((edge: any) => edge.id === edgeId);
		if (edgeIndex !== -1) {
			// Get the current edge
			const currentEdge = edges.value[edgeIndex];

			const isAnimated = edgeData.animated ?? currentEdge.animated;
			const animationType = edgeData.animationType ?? currentEdge.animationType ?? "flow";
			const animationSpeed = edgeData.animationSpeed ?? currentEdge.animationSpeed ?? "normal";
			const strokeColor = edgeData.style?.stroke || currentEdge.style?.stroke;

			const updatedEdge = {
				...currentEdge,
				// Apply direct properties if they exist in edgeData
				// Handle label - set it if provided (including empty string)
				...(edgeData.label !== undefined && { label: edgeData.label }),
				...(edgeData.type !== undefined && { type: edgeData.type }),
				...(edgeData.animated !== undefined && { animated: edgeData.animated }),
				...(edgeData.animationSpeed !== undefined && { animationSpeed: edgeData.animationSpeed }),
				...(edgeData.animationType !== undefined && { animationType: edgeData.animationType }),
				...(edgeData.curvature !== undefined && { curvature: edgeData.curvature }),
				// Animation data will be handled by CSS classes and injected components
				// Handle style object merging with animation effects
				style: {
					...currentEdge.style,
					...(edgeData.style || {}),
					...getConnectionAnimationStyles(
						isAnimated,
						animationType,
						animationSpeed,
						strokeColor
					)
				},
				// Handle markerEnd updates
				markerEnd: edgeData.markerEnd
					? {
						...currentEdge.markerEnd,
						...edgeData.markerEnd
					}
					: currentEdge.markerEnd
			};

			console.log("🔗 CanvasPanel: Updated edge data:", updatedEdge);

			// Update the edge in the array and trigger VueFlow update
			edges.value[edgeIndex] = updatedEdge;

			// Force VueFlow to re-render by setting the entire edges array
			nextTick(() => {
				setEdges([...edges.value]);
				console.log("✅ CanvasPanel: Edge updated successfully:", updatedEdge);
			});
		} else {
			console.warn("⚠️ Edge not found for update:", edgeId);
		}
	};

	/**
	 * Add multiple nodes for chain templates
	 */
	const addMultipleNodes = (nodesToAdd: any[]) => {
		console.log("➕ CanvasPanel: Adding multiple nodes:", nodesToAdd.length);

		if (!Array.isArray(nodesToAdd)) {
			console.warn("⚠️ addMultipleNodes: Expected array of nodes");
			return;
		}

		// Create node array map from allNodeArrays
		const nodeArrayMap: Record<string, any> = {};
		allNodeArrays.forEach((item: any) => {
			// Extract the type from the name (e.g., "rectangleNodes" → "rectangle")
			const typeName = item.name.replace(/Nodes?$/, "");
			nodeArrayMap[typeName] = item.array;
			
			// Also map common variations
			if (typeName === "intentSelection") nodeArrayMap["intentSelectionNode"] = item.array;
			if (typeName === "projectExplorer") nodeArrayMap["projectExplorerNode"] = item.array;
			if (typeName === "builditCli") nodeArrayMap["buildit-cli"] = item.array;
		});

		// Process each node and add to the canvas
		nodesToAdd.forEach((nodeData, index) => {
			if (!nodeData.type) {
				console.warn(`⚠️ Node at index ${index} missing type:`, nodeData);
				return;
			}

			// Create a properly formatted node
			const newNode = {
				id: nodeData.id || `node-${Date.now()}-${index}`,
				type: nodeData.type,
				position: nodeData.position || { x: 100 + (index * 200), y: 100 },
				data: nodeData.data || {},
				draggable: true,
				selectable: true,
				...nodeData
			};

			// Add to the appropriate node array
			const targetArray = nodeArrayMap[nodeData.type];
			if (targetArray) {
				targetArray.value.push(newNode);
				console.log(`✅ Added ${nodeData.type} node to array:`, newNode.id);
			} else {
				console.warn(`⚠️ No target array found for node type: ${nodeData.type}`);
			}

			// Also add to VueFlow
			addNodes([newNode]);
		});

		console.log("✅ CanvasPanel: Multiple nodes added successfully");
	};

	/**
	 * Add multiple edges for chain templates
	 */
	const addMultipleEdges = (edgesToAdd: any[]) => {
		console.log("➕ CanvasPanel: Adding multiple edges:", edgesToAdd.length);

		if (!Array.isArray(edgesToAdd)) {
			console.warn("⚠️ addMultipleEdges: Expected array of edges");
			return;
		}

		// Process each edge and add to the canvas
		edgesToAdd.forEach((edgeData, index) => {
			if (!edgeData.source || !edgeData.target) {
				console.warn(`⚠️ Edge at index ${index} missing source or target:`, edgeData);
				return;
			}

			// Create a properly formatted edge with unique ID if needed
			const newEdge = {
				id: edgeData.id || `edge-${edgeData.source}-${edgeData.target}-${Date.now()}-${index}`,
				source: edgeData.source,
				target: edgeData.target,
				sourceHandle: edgeData.sourceHandle || "right", // Default source handle (output)
				targetHandle: edgeData.targetHandle || "left", // Default target handle (input)
				type: edgeData.type || "smoothstep",
				animated: edgeData.animated || false,
				animationType: edgeData.animationType || "flow",
				animationSpeed: edgeData.animationSpeed || "normal",
				style: edgeData.style || {},
				...edgeData
			};

			// Use the existing addEdge method to ensure consistency
			addEdge(newEdge);
		});

		console.log("✅ CanvasPanel: Multiple edges added successfully");
	};

	/**
	 * Update node positions for chain templates
	 */
	const updateNodePositions = (positions: Record<string, { x: number, y: number }>) => {
		console.log("📐 CanvasPanel: Updating node positions:", positions);

		if (!positions || Object.keys(positions).length === 0) {
			console.warn("⚠️ No positions to update");
			return;
		}

		// Update each node's position
		Object.entries(positions).forEach(([nodeId, position]) => {
			const node = getNodeFn.value(nodeId);
			if (node) {
				// Update the node position using VueFlow's updateNode
				vueFlowUpdateNode(nodeId, {
					position: { x: position.x, y: position.y }
				});
				console.log(`✅ Updated position for node ${nodeId}:`, position);
			} else {
				console.warn(`⚠️ Node ${nodeId} not found on canvas`);
			}
		});

		console.log("✅ CanvasPanel: All node positions updated successfully");
	};

	return {
		addEdge,
		removeEdge,
		updateEdge,
		addMultipleNodes,
		addMultipleEdges,
		updateNodePositions
	};
}



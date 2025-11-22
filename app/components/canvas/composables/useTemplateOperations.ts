import { useToast } from "#imports";
import type { Ref } from "vue";

/**
 * Composable for template-related operations
 */
export function useTemplateOperations(
	allNodes: Ref<any[]>,
	allEdges: Ref<any[]>,
	viewport: Ref<any>,
	templateNodes: Ref<any[]>,
	createNode: (nodeType: string, data: any) => any,
	createNodeFromTemplate: (nodeType: string, data: any, existingNodes: any[]) => any,
	createIntentSelectionNode: (templateNode: any) => any,
	createEdge: (sourceId: string, targetId: string) => void,
	configureTemplateNode: (nodeId: string) => void,
	lockNodePosition: (nodeId: string, position: { x: number, y: number }) => void,
	savePositionsToApi: (nodes: any[], edges: any[], viewport: any) => void,
	verifyAllPositions: (nodes: any[]) => void,
	addNodes: (nodes: any[]) => void,
	userNodes?: Ref<any[]>,
	orbitCardNodes?: Ref<any[]>
) {
	const toast = useToast();

	/**
	 * Trigger template node chain creation
	 */
	const triggerTemplateNodeChain = (templateNodeId: string) => {
		console.log("🔗 Triggering template node chain for:", templateNodeId);

		let templateNode = templateNodes.value.find((n: any) => n.id === templateNodeId);
		if (!templateNode) {
			console.warn("⚠️ Template node not found in templateNodes array, attempting allNodes lookup:", templateNodeId);
			templateNode = (allNodes.value || []).find((n: any) => n.id === templateNodeId);
			if (templateNode) {
				console.log("✅ Found template node via allNodes fallback, registering:", templateNodeId);
				templateNodes.value.push(templateNode);
			}
		}

		if (!templateNode) {
			console.warn("❌ Template node not found:", templateNodeId);
			return;
		}

		// Mark template node as configured
		configureTemplateNode(templateNodeId);

		// Create intent selection node
		const intentNode = createIntentSelectionNode(templateNode);
		if (intentNode) {
			console.log("✅ Created intent selection node:", intentNode.id);

			// Create edge from template to intent selection
			createEdge(templateNodeId, intentNode.id);
		}
	};

	/**
	 * Add a node with pre-populated data from components (e.g., from component panel)
	 */
	const addNodeWithData = async (
		nodeType: string,
		componentData: any,
		restoreTemplateChain: (templateData: any) => void
	) => {
		console.log("═══════════════════════════════════════════");
		console.log("🎯 ADD NODE WITH DATA CALLED");
		console.log("Node Type:", nodeType);
		console.log("Component Data:", componentData);
		console.log("Component Data.template:", componentData.template);
		console.log("Component Data.template.nodeCanvas:", componentData.template?.nodeCanvas);
		console.log("Component Data.template.canvasData:", componentData.template?.canvasData);
		console.log("Component Data.template keys:", Object.keys(componentData.template || {}));
		console.log("═══════════════════════════════════════════");

		// Check if this template has a saved node chain configuration
		const templateConfig = componentData.template;
		// Support both nodeCanvas (new) and canvasData (old) field names
		const hasNodeCanvas = templateConfig?.nodeCanvas || templateConfig?.canvasData;
		const templateType = templateConfig?.type;

		console.log("📋 Template Config:", templateConfig);
		console.log("📋 Has Node Canvas:", !!hasNodeCanvas);
		console.log("📋 Node Canvas Nodes:", hasNodeCanvas?.nodes?.length || 0);
		console.log("📋 Template Type:", templateType);

		// If it's a FORM_AUTOMATION_CHAIN template with nodeCanvas, load it
		if ((nodeType === "templateNode" || nodeType === "templateConfiguredNode") && templateType === "FORM_AUTOMATION_CHAIN" && hasNodeCanvas && hasNodeCanvas.nodes) {
			console.log("✅ LOADING SAVED FORM AUTOMATION CHAIN!");
			console.log("✅ Nodes to restore:", hasNodeCanvas.nodes?.length);
			console.log("✅ Edges to restore:", hasNodeCanvas.edges?.length);
			restoreTemplateChain(componentData);
			return;
		}
		
		// If it's a regular template with nodeCanvas, use templateConfiguredNode
		if ((nodeType === "templateNode" || nodeType === "templateConfiguredNode") && hasNodeCanvas && hasNodeCanvas.nodes) {
			console.log("✅ LOADING SAVED TEMPLATE CHAIN!");
			console.log("✅ Nodes to restore:", hasNodeCanvas.nodes?.length);
			console.log("✅ Edges to restore:", hasNodeCanvas.edges?.length);
			console.log("📞 Calling restoreTemplateChain...");
			restoreTemplateChain(componentData);
			console.log("✅ restoreTemplateChain called successfully");
			return;
		}
		
		console.log("⚠️ Template does NOT have saved node chain OR wrong node type");
		console.log("   Node Type:", nodeType);
		console.log("   Has NodeCanvas:", !!hasNodeCanvas);
		console.log("   NodeCanvas.nodes:", hasNodeCanvas?.nodes?.length || 0);
		console.log("   Will create single configured node instead");
		console.log("═══════════════════════════════════════════");

		// Generate a unique ID for this node (canvas node ID)
		const uniqueId = `${nodeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const additionalData: any = {
			label: componentData.name || "Node"
		};

		// Populate node with component-specific data
		if (nodeType === "templateNode" || nodeType === "templateConfiguredNode") {
			// Get script count from various possible locations
			const scriptCount = componentData.template?.actions?.length 
				|| componentData.template?.setup?.all?.scripts?.length
				|| componentData.meta?.nodeCount
				|| componentData.template?.scriptCount
				|| 0;

			// Get project path from template metadata
			const projectPath = componentData.meta?.projectPath 
				|| componentData.template?.projectPath
				|| "";

			// Get tool count from environment
			const toolCount = componentData.template?.environment?.detectedTools 
				? Object.keys(componentData.template.environment.detectedTools).length
				: 0;

			Object.assign(additionalData, {
				// Store BOTH the database ID and node ID
				databaseId: componentData.id, // ✅ Database template ID (MongoDB ObjectId)
				id: componentData.id, // ✅ Also in data.id for easy access
				templateId: componentData.id, // ✅ Compatibility with existing code
				templateName: componentData.name,
				name: componentData.name, // Also store as name for fallback
				templateType: componentData.template?.type || "component",
				description: componentData.description,
				status: "configured",
				// For configured templates, add chain info
				chainNodeCount: hasNodeCanvas?.nodes?.length || 0,
				edgeCount: hasNodeCanvas?.edges?.length || 0,
				scriptCount,
				projectPath,
				toolCount,
				// Add flags for configuration status
				hasBJson: !!componentData.template?.setup,
				hasBlJson: !!componentData.template?.environment,
				hasNodeChain: !!(hasNodeCanvas?.nodes?.length)
			});
			console.log("═══════════════════════════════════════════");
			console.log("✅ TEMPLATE NODE CREATED");
			console.log("═══════════════════════════════════════════");
			console.log("  Canvas Node ID:", uniqueId);
			console.log("  Node Type:", nodeType);
			console.log("  Database Template ID:", componentData.id);
			console.log("  Template Name:", componentData.name);
			console.log("  Has Node Canvas:", !!hasNodeCanvas);
			console.log("  Nodes in chain:", hasNodeCanvas?.nodes?.length || 0);
			console.log("═══════════════════════════════════════════");
		} else if (nodeType === "solutionNode") {
			Object.assign(additionalData, {
				solutionId: componentData.id,
				solutionName: componentData.name,
				solutionType: componentData.type || "feature",
				description: componentData.description,
				status: componentData.status || "active"
			});
		} else if (nodeType === "hookNode") {
			Object.assign(additionalData, {
				hookId: componentData.id,
				hookName: componentData.name,
				hookType: componentData.type,
				hookEnabled: componentData.enabled !== false,
				hookPriority: componentData.priority || "normal",
				hookDescription: componentData.description,
				hookToken: componentData.token,
				hookTrigger: componentData.trigger,
				status: componentData.enabled !== false ? "active" : "inactive"
			});
		} else if (nodeType === "transportNode") {
			Object.assign(additionalData, {
				transportId: componentData.id,
				transportName: componentData.name,
				transportType: componentData.type,
				endpoint: componentData.target || "/api/transport",
				transportTarget: componentData.target,
				transportEnabled: componentData.enabled !== false,
				description: componentData.description,
				status: componentData.enabled !== false ? "active" : "inactive"
			});
		} else if (nodeType === "userNode") {
			Object.assign(additionalData, {
				userId: componentData.id,
				userName: componentData.name,
				userEmail: componentData.email,
				userRole: componentData.role,
				description: componentData.description || `User: ${componentData.name}`,
				status: "active",
				// Pass through the complete user data and node structure
				userData: componentData.userData,
				// Preserve the entire data structure for the UserNode component
				data: componentData.data || {
					id: componentData.id,
					name: componentData.name || "Unnamed User",
					email: componentData.email,
					role: componentData.role,
					nodeType: "userNode",
					userData: componentData.userData,
					fields: componentData.fields || [],
					status: "idle",
					lastResult: null,
					lastError: null
				}
			});
		} else if (nodeType === "orbitCardNode") {
			Object.assign(additionalData, {
				taskId: componentData.id,
				taskName: componentData.name,
				taskTitle: componentData.title || componentData.name,
				taskDescription: componentData.description,
				taskStatus: componentData.status || "pending",
				taskPriority: componentData.priority || "medium",
				description: componentData.description || `Task: ${componentData.title || componentData.name}`,
				status: "active",
				// Pass through the complete task data and node structure
				taskData: componentData.taskData,
				orbitTimelineData: componentData.orbitTimelineData || [componentData.taskData || componentData],
				// Preserve the entire data structure for the OrbitCardNode component
				data: componentData.data || {
					id: componentData.id,
					name: componentData.title || componentData.name || "Untitled Task",
					description: componentData.description || "",
					status: componentData.status || "pending",
					priority: componentData.priority || "medium",
					nodeType: "orbitCardNode",
					taskData: componentData.taskData,
					orbitTimelineData: componentData.orbitTimelineData || [componentData.taskData || componentData],
					fields: componentData.fields || [],
					lastResult: null,
					lastError: null
				}
			});
		}

		// Calculate non-overlapping position
		const centerX = viewport.value.x ? Math.abs(viewport.value.x) + 400 : 400;
		const centerY = viewport.value.y ? Math.abs(viewport.value.y) + 300 : 300;

		let position = { x: centerX, y: centerY };
		const existingPositions = allNodes.value.map((n) => n.position);
		const minDistance = 200;

		// Check for overlaps and adjust position
		let attempts = 0;
		while (attempts < 50) {
			const hasOverlap = existingPositions.some((pos) => {
				const dx = pos.x - position.x;
				const dy = pos.y - position.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				return distance < minDistance;
			});

			if (!hasOverlap) break;

			// Try a new position in a spiral pattern
			const angle = attempts * 0.5;
			const radius = 50 + (attempts * 20);
			position = {
				x: centerX + Math.cos(angle) * radius,
				y: centerY + Math.sin(angle) * radius
			};
			attempts++;
		}

		console.log("🔧 Calculated position:", position);
		additionalData.position = position;

		// Create node
		const newNode: any = createNodeFromTemplate(nodeType, additionalData, []);

		// Ensure the node is fully draggable and selectable
		newNode.draggable = true;
		newNode.selectable = true;
		newNode.resizable = true;
		newNode.position = { x: position.x, y: position.y };
		newNode.positionAbsolute = { x: position.x, y: position.y };

		console.log("🔧 Created node with fixed position:", {
			id: newNode.id,
			position: newNode.position
		});

		// Add the node to the canvas
		addNodes([newNode]);
		console.log("🖼️ Added node to canvas:", newNode.id);

		// Also add to specific array if it's a userNode or orbitCardNode
		if (nodeType === "userNode" && userNodes) {
			userNodes.value.push(newNode);
			console.log("✅ Added user node to userNodes array:", newNode.id);
		} else if (nodeType === "orbitCardNode" && orbitCardNodes) {
			orbitCardNodes.value.push(newNode);
			console.log("✅ Added orbit card node to orbitCardNodes array:", newNode.id);
		}

		// Lock the new node's position
		lockNodePosition(newNode.id, newNode.position);

		// Save all positions to API immediately
		await savePositionsToApi(allNodes.value, allEdges.value, viewport.value);

		// Verify all positions match locks
		verifyAllPositions(allNodes.value);

		return newNode;
	};

	/**
	 * Handle template created event
	 */
	const handleTemplateCreated = (template: any) => {
		console.log("✅ Template created:", template);

		const templateNodeId = template?.meta?.nodeId;
		if (templateNodeId) {
			triggerTemplateNodeChain(templateNodeId);
		} else {
			console.warn("⚠️ Template created without nodeId metadata");
		}
	};

	/**
	 * Handle template updated event
	 */
	const handleTemplateUpdated = (
		nodeId: string,
		templateData: any,
		updateNodeData: (nodeId: string, key: string, value: any) => void
	) => {
		console.log("🔄 Updating node with template data:", nodeId, templateData);

		// Guard against undefined/null templateData
		if (!templateData) {
			console.warn("⚠️ No template data provided for node:", nodeId);
			// Still trigger the chain even if no data
			triggerTemplateNodeChain(nodeId);
			return;
		}

		// Update the node with the template information
		Object.entries(templateData).forEach(([key, value]) => {
			updateNodeData(nodeId, key, value);
		});

		// Trigger template node chain configuration
		triggerTemplateNodeChain(nodeId);
	};

	return {
		triggerTemplateNodeChain,
		addNodeWithData,
		handleTemplateCreated,
		handleTemplateUpdated
	};
}


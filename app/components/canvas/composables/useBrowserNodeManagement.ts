import type { Ref } from "vue";

export function useBrowserNodeManagement(
	browserNodes: Ref<any[]>,
	viewportNodes: Ref<any[]>,
	hookNodes: Ref<any[]>,
	transportNodes: Ref<any[]>,
	transportTemplateNodes: Ref<any[]>,
	formsPanelNodes: Ref<any[]>,
	edges: Ref<any[]>,
	allNodes: Ref<any[]>,
	allEdges: Ref<any[]>,
	getNodeFn: any,
	createNode: (nodeType: string, data: any) => any,
	addNodes: (nodes: any[]) => void,
	addEdges: (edges_param: any[]) => void,
	removeNodes: (nodeIds: string[]) => void,
	removeEdges: (edgeIds: string[]) => void,
	updateNodeDataBase: (nodeId: string, key: string, value: any) => void,
	vueFlowUpdateNode: (nodeId: string, updater: (node: any) => any) => void,
	lockNodePosition: (nodeId: string, position: { x: number, y: number }) => void
) {
	/**
	 * Get active viewport types for a browser node
	 */
	const getActiveViewportTypes = (browserNodeId: string) => {
		const childViewports = viewportNodes.value.filter((vp: any) =>
			vp.data?.parentBrowserId === browserNodeId
		);
		return childViewports.map((vp: any) => vp.data?.viewportType).filter(Boolean);
	};

	/**
	 * Handle closing a viewport node
	 */
	const handleCloseViewport = (nodeId: string) => {
		console.log("🗑️ Closing viewport:", nodeId);

		// Find the viewport to get its parent browser ID
		const viewport = viewportNodes.value.find((n: any) => n.id === nodeId);
		const parentBrowserId = viewport?.data?.parentBrowserId;

		// Remove from array
		const index = viewportNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			viewportNodes.value.splice(index, 1);
		}

		// Update parent browser node to remove this viewport from child list
		if (parentBrowserId) {
			const browserNode = browserNodes.value.find((n: any) => n.id === parentBrowserId);
			if (browserNode) {
				const childIds = browserNode.data?.childViewportIds || [];
				const updatedChildIds = childIds.filter((id: string) => id !== nodeId);
				updateNodeDataBase(parentBrowserId, "childViewportIds", updatedChildIds);
				console.log(`✅ Removed viewport from browser's child list`);
			}
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Viewport closed");
	};

	/**
	 * Create a dev preview browser node for TemplateConfiguredNode
	 */
	const handleCreateDevBrowserNode = (url: string, sourceNodeId: string, scriptName: string) => {
		console.log("🌐 Creating dev browser node:", { url, sourceNodeId, scriptName });

		try {
			const sourceNode = getNodeFn.value(sourceNodeId);
			const sourcePosition = sourceNode?.position || { x: 0, y: 0 };
			const sourceWidth = 600;

			const browserNodeId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const newBrowserNode = createNode("browserNode", {
				id: browserNodeId,
				position: {
					x: sourcePosition.x + sourceWidth + 50,
					y: sourcePosition.y
				},
				label: `${scriptName} Preview`,
				url,
				status: "ready",
				scriptName,
				isDevPreview: true
			});

			if (newBrowserNode.style) {
				newBrowserNode.style.width = "900px";
				newBrowserNode.style.height = "700px";
			}

			newBrowserNode.draggable = true;
			newBrowserNode.selectable = true;
			(newBrowserNode as any).selected = true;

			console.log("🔧 Creating dev browser node:", newBrowserNode);

			browserNodes.value.push(newBrowserNode);
			addNodes([newBrowserNode]);

			const edge = {
				id: `edge_${sourceNodeId}_${browserNodeId}_${Date.now()}`,
				source: sourceNodeId,
				target: browserNodeId,
				sourceHandle: "right",
				targetHandle: "left",
				type: "smoothstep",
				animated: true,
				style: { stroke: "#6366f1", strokeWidth: 2 },
				markerEnd: { type: "arrowclosed", color: "#6366f1" },
				updatable: true,
				selectable: false
			};

			// Add to both VueFlow and our edges ref for persistence
			edges.value.push(edge);
			addEdges([edge]);

			setTimeout(() => {
				lockNodePosition(browserNodeId, {
					x: sourcePosition.x + sourceWidth + 50,
					y: sourcePosition.y
				});
				console.log("🔒 Locked initial position for browser node");
			}, 100);

			console.log("✅ Dev browser node created and connected");
		} catch (error) {
			console.error("❌ Error creating dev browser node:", error);
		}
	};

	/**
	 * Create a form preview browser node
	 */
	const handleCreateFormPreviewBrowserNode = (browserNodeData: any, sourceNodeId: string) => {
		console.log("🔧 Creating form preview browser node:", browserNodeData);

		try {
			const sourceNode = getNodeFn.value(sourceNodeId);
			const sourcePosition = sourceNode?.position || { x: 0, y: 0 };
			const sourceWidth = 900;

		const newBrowserNode = createNode("browserNode", {
			id: browserNodeData.id,
			position: {
				x: sourcePosition.x + sourceWidth + 50,
				y: sourcePosition.y
			},
			label: browserNodeData.label,
			url: browserNodeData.url,
			status: browserNodeData.status,
			formId: browserNodeData.formId,
			formTitle: browserNodeData.formTitle,
			isFormPreview: browserNodeData.isFormPreview,
			parentFormsPanelId: sourceNodeId,
			// CRITICAL: Copy ALL form content data for viewport spawning and template saving!
			htmlContent: browserNodeData.htmlContent,  // Full HTML document
			formHtml: browserNodeData.formHtml,        // Form body HTML
			formCss: browserNodeData.formCss           // Form styles
		});

			if (newBrowserNode.style) {
				newBrowserNode.style.width = "800px";
				newBrowserNode.style.height = "700px";
			}
			(newBrowserNode as any).selected = true;

			console.log("🔧 Creating browser node:", newBrowserNode);
			browserNodes.value.push(newBrowserNode);
			addNodes([newBrowserNode]);

			// Create edge from forms panel to browser
			const edge = {
				id: `edge_${sourceNodeId}_${browserNodeData.id}_${Date.now()}`,
				source: sourceNodeId,
				target: browserNodeData.id,
				sourceHandle: "right",
				targetHandle: "left",
				type: "smoothstep",
				animated: true,
				style: { stroke: "#8b5cf6", strokeWidth: 2 },
				markerEnd: { type: "arrowclosed", color: "#8b5cf6" },
				label: "Form Preview"
			};

			// Add to both VueFlow and our edges ref for persistence
			edges.value.push(edge);
			addEdges([edge]);
			lockNodePosition(browserNodeData.id, newBrowserNode.position);

			console.log("✅ Created form preview browser node with edge");
		} catch (error) {
			console.error("❌ Error creating form preview browser node:", error);
		}
	};

	/**
	 * Create hook node for form automation - connects to browser node (not forms panel)
	 */
	const handleCreateHookNodeForForm = (formData: any, sourceNodeId: string) => {
		console.log("🪝 Creating hook node for form:", formData);

		try {
			// Find the browser node that was just created for this form
			const formBrowserNode = browserNodes.value.find((b: any) =>
				b.data?.formId === formData.id && b.data?.isFormPreview
			);

			if (!formBrowserNode) {
				console.warn("⚠️ No browser node found for form, using forms panel position");
				const sourceNode = getNodeFn.value(sourceNodeId);
				const sourcePosition = sourceNode?.position || { x: 0, y: 0 };

				// Fallback to forms panel position
				const hookNodeId = `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

				const newHookNode = createNode("hookNode", {
					id: hookNodeId,
					position: {
						x: sourcePosition.x,
						y: sourcePosition.y + 850
					},
					label: `Hook for ${formData.title}`,
					attachedToFormId: formData.id,
					attachedToFormTitle: formData.title,
					selectedHook: null,
					status: "configuring"
				});

				if (newHookNode.style) {
					newHookNode.style.width = "600px";
					newHookNode.style.height = "650px";
				}

				hookNodes.value.push(newHookNode);
				addNodes([newHookNode]);
				lockNodePosition(hookNodeId, newHookNode.position);

				console.log("✅ Created hook node (no browser node found)");
				return;
			}

			// Check if hook node already exists for this form
			const existingHookNode = hookNodes.value.find((n: any) =>
				n.data?.attachedToFormId === formData.id
			);

			if (existingHookNode) {
				console.log("🪝 Hook node already exists, showing it:", existingHookNode.id);
				existingHookNode.hidden = false;
				updateNodeDataBase(existingHookNode.id, "visible", true);

				vueFlowUpdateNode(existingHookNode.id, (n: any) => ({
					...n,
					hidden: false
				}));

				// Link to browser node
				updateNodeDataBase(formBrowserNode.id, "connectedHookId", existingHookNode.id);
				console.log("🔗 Linked existing hook to browser node:", formBrowserNode.id);

				return;
			}

			// Create hook node positioned below the browser node
			const browserPosition = formBrowserNode.position || { x: 0, y: 0 };
			const browserHeight = 700; // Default browser node height

			const hookNodeId = `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const newHookNode = createNode("hookNode", {
				id: hookNodeId,
				position: {
					x: browserPosition.x,
					y: browserPosition.y + browserHeight + 50
				},
				label: `Hook for ${formData.title}`,
				attachedToFormId: formData.id,
				attachedToFormTitle: formData.title,
				selectedHook: null,
				status: "configuring",
				// Pass form context for smart auto-population
				connectedFormId: formData.id,
				formTitle: formData.title,
				connectedBrowserNodeId: formBrowserNode.id
			});

			if (newHookNode.style) {
				newHookNode.style.width = "600px";
				newHookNode.style.height = "650px";
			}

			newHookNode.draggable = true;
			newHookNode.selectable = true;

			console.log("🪝 Creating hook node below browser:", newHookNode);

			hookNodes.value.push(newHookNode);
			addNodes([newHookNode]);

			// Create edge from browser (bottom) to hook (top)
			const edge = {
				id: `edge_${formBrowserNode.id}_${hookNodeId}_${Date.now()}`,
				source: formBrowserNode.id,
				target: hookNodeId,
				sourceHandle: "bottom",
				targetHandle: "top",
				type: "smoothstep",
				animated: true,
				style: { stroke: "#eab308", strokeWidth: 2 },
				markerEnd: { type: "arrowclosed", color: "#eab308" },
				label: `Hook: ${formData.title}`
			};

			// Add to both VueFlow and our edges ref for persistence
			edges.value.push(edge);
			addEdges([edge]);
			lockNodePosition(hookNodeId, newHookNode.position);

			// Link the hook to the browser node
			updateNodeDataBase(formBrowserNode.id, "connectedHookId", hookNodeId);
			console.log("🔗 Linked new hook to browser node:", formBrowserNode.id);

			console.log(`✅ Created hook node for form ${formData.title} below browser node`);
		} catch (error) {
			console.error("❌ Error creating hook node for form:", error);
		}
	};

	/**
	 * Close/remove a hook node
	 */
	const handleCloseHookNode = (nodeId: string) => {
		console.log("🗑️ Closing hook node:", nodeId);

		try {
			const nodeIndex = hookNodes.value.findIndex((n: any) => n.id === nodeId);
			if (nodeIndex !== -1) {
				hookNodes.value.splice(nodeIndex, 1);
			}

			removeNodes([nodeId]);

			const connectedEdges = edges.value.filter((e: any) =>
				e.source === nodeId || e.target === nodeId
			);

			if (connectedEdges.length > 0) {
				removeEdges(connectedEdges.map((e: any) => e.id));
			}

			console.log(`✅ Removed hook node ${nodeId} and ${connectedEdges.length} connected edges`);
		} catch (error) {
			console.error("❌ Error closing hook node:", error);
		}
	};

	/**
	 * Handle hook attached - auto-spawn transport node
	 */
	const handleHookAttached = (hookData: any, hookNodeId: string) => {
		console.log("═══════════════════════════════════════════");
		console.log("🪝 HOOK ATTACHED EVENT TRIGGERED!");
		console.log("  Hook Node ID:", hookNodeId);
		console.log("  Hook Data:", hookData);
		console.log("═══════════════════════════════════════════");

		try {
			const hookNode = getNodeFn.value(hookNodeId);
			if (!hookNode) {
				console.error("❌ Hook node not found:", hookNodeId);
				return;
			}

			const hookPosition = hookNode.position || { x: 0, y: 0 };
			console.log("📍 Hook node position:", hookPosition);

			// Update hook node with configured data
			console.log("📝 Updating hook node data...");
			updateNodeDataBase(hookNodeId, "hookId", hookData.id);
			updateNodeDataBase(hookNodeId, "hookName", hookData.name || hookData.type);
			updateNodeDataBase(hookNodeId, "hookType", hookData.type);
			updateNodeDataBase(hookNodeId, "hookToken", hookData.token);
			updateNodeDataBase(hookNodeId, "status", "configured");
			console.log("✅ Hook node updated with configuration");

			// Update connected browser node with hook config
			const connectedBrowserNode = browserNodes.value.find((b: any) =>
				b.data?.connectedHookId === hookNodeId
			);

			console.log("🔍 Looking for connected browser node...");
			console.log("  Found:", !!connectedBrowserNode);
			if (connectedBrowserNode) {
				console.log("  Browser node ID:", connectedBrowserNode.id);
				updateNodeDataBase(connectedBrowserNode.id, "hookConfig", {
					id: hookData.id,
					name: hookData.name || hookData.type,
					type: hookData.type,
					token: hookData.token,
					webhookUrl: hookData.webhookUrl || ""
				});
				console.log("✅ Updated browser node with hook config including webhook URL:", hookData.webhookUrl);
			} else {
				console.warn("⚠️ No browser node found with connectedHookId:", hookNodeId);
			}

			console.log("═══════════════════════════════════════════");
			console.log(`✅ HOOK CONFIGURED SUCCESSFULLY!`);
			console.log(`  Hook: ${hookData.name || hookData.type}`);
			console.log(`  Webhook URL: ${hookData.webhookUrl}`);
			console.log(`  Users can now add transport listeners manually`);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Error in handleHookAttached:", error);
			console.error("  Stack trace:", error);
		}
	};

	/**
	 * Close/remove a transport node
	 */
	const handleCloseTransportNode = (nodeId: string) => {
		console.log("🗑️ Closing transport node:", nodeId);

		try {
			const nodeIndex = transportNodes.value.findIndex((n: any) => n.id === nodeId);
			if (nodeIndex !== -1) {
				transportNodes.value.splice(nodeIndex, 1);
			}

			removeNodes([nodeId]);

			const connectedEdges = edges.value.filter((e: any) =>
				e.source === nodeId || e.target === nodeId
			);

			if (connectedEdges.length > 0) {
				removeEdges(connectedEdges.map((e: any) => e.id));
			}

			console.log(`✅ Removed transport node ${nodeId} and ${connectedEdges.length} connected edges`);
		} catch (error) {
			console.error("❌ Error closing transport node:", error);
		}
	};

	/**
	 * Open form generator from TemplateConfiguredNode
	 */
	const handleOpenFormGenerator = (sourceNodeId: string, projectPath: string, templateId: string) => {
		console.log("🎨 Opening form generator", { sourceNodeId, projectPath, templateId });

		try {
			const sourceNode = getNodeFn.value(sourceNodeId);
			const sourcePosition = sourceNode?.position || { x: 0, y: 0 };

			const existingFormsNode = formsPanelNodes.value.find((n: any) =>
				n.data?.sourceTemplateId === templateId
			);

			if (existingFormsNode) {
				console.log("📝 Forms panel already exists, showing it:", existingFormsNode.id);
				existingFormsNode.hidden = false;
				updateNodeDataBase(existingFormsNode.id, "visible", true);

				vueFlowUpdateNode(existingFormsNode.id, (n: any) => ({
					...n,
					hidden: false
				}));

				return;
			}

			const formsPanelNodeId = `formsPanel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const newFormsPanelNode = createNode("formsPanelNode", {
				id: formsPanelNodeId,
				position: {
					x: sourcePosition.x + 700,
					y: sourcePosition.y
				},
				label: "Automated Form Generator",
				projectPath,
				templateId,
				sourceTemplateId: templateId,
				generatedForms: [],
				status: "ready"
			});

			if (newFormsPanelNode.style) {
				newFormsPanelNode.style.width = "900px";
				newFormsPanelNode.style.height = "800px";
			}

			newFormsPanelNode.draggable = true;
			newFormsPanelNode.selectable = true;

			console.log("🎨 Creating forms panel node:", newFormsPanelNode);

			formsPanelNodes.value.push(newFormsPanelNode);
			addNodes([newFormsPanelNode]);

			const edge = {
				id: `edge_${sourceNodeId}_${formsPanelNodeId}_${Date.now()}`,
				source: sourceNodeId,
				target: formsPanelNodeId,
				sourceHandle: "right",
				targetHandle: "left",
				type: "smoothstep",
				animated: true,
				style: { stroke: "#a855f7", strokeWidth: 2 },
				markerEnd: { type: "arrowclosed", color: "#a855f7" }
			};

			// Add to both VueFlow and our edges ref for persistence
			edges.value.push(edge);
			addEdges([edge]);
			lockNodePosition(formsPanelNodeId, newFormsPanelNode.position);

			console.log(`✅ Created forms panel node for template ${templateId}`);
		} catch (error) {
			console.error("❌ Error creating forms panel node:", error);
		}
	};

	/**
	 * Create transport listener node for hook
	 */
	const handleCreateTransportListener = (hookNodeId: string, listenerIndex: number) => {
		console.log("═══════════════════════════════════════════");
		console.log("🚛 CREATING TRANSPORT LISTENER NODE");
		console.log("  Hook Node ID:", hookNodeId);
		console.log("  Listener Index:", listenerIndex);
		console.log("═══════════════════════════════════════════");

		try {
			const hookNode = getNodeFn.value(hookNodeId);
			if (!hookNode) {
				console.error("❌ Hook node not found:", hookNodeId);
				return;
			}

			const hookPosition = hookNode.position || { x: 0, y: 0 };
			const listeners = hookNode.data?.listeners || [];

			// Calculate position for multiple transports (fan out below hook)
			const transportNodeId = `transport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const horizontalOffset = (listenerIndex - Math.floor(listeners.length / 2)) * 650; // Spread transports horizontally
			const verticalOffset = 700;

			// Get form context from hook node
			const hookFormId = hookNode.data?.connectedFormId || hookNode.data?.attachedToFormId;
			const hookFormTitle = hookNode.data?.formTitle || hookNode.data?.attachedToFormTitle || "";
			const hookBrowserNodeId = hookNode.data?.connectedBrowserNodeId;

			const newTransportNode = createNode("transportNode", {
				id: transportNodeId,
				position: {
					x: hookPosition.x + horizontalOffset,
					y: hookPosition.y + verticalOffset
				},
				label: `Listener ${listenerIndex + 1}: Transport`,
				attachedToHookId: hookNodeId, // CRITICAL: This MUST be saved!
				listenerIndex,
				status: "configuring",
				// Pass form context for smart auto-population
				connectedFormId: hookFormId,
				formTitle: hookFormTitle,
				connectedBrowserNodeId: hookBrowserNodeId
			});

			console.log("🔧 NEW TRANSPORT NODE DATA (MUST INCLUDE attachedToHookId):");
			console.log("  attachedToHookId:", hookNodeId);
			console.log("  listenerIndex:", listenerIndex);
			console.log("  Full data:", newTransportNode.data);

			if (newTransportNode.style) {
				newTransportNode.style.width = "600px";
				newTransportNode.style.height = "650px";
			}

			newTransportNode.draggable = true;
			newTransportNode.selectable = true;

			console.log("🚛 Creating transport listener node:", newTransportNode);

			transportNodes.value.push(newTransportNode);
			addNodes([newTransportNode]);

			// Create edge from hook to transport listener
			const edge = {
				id: `edge_${hookNodeId}_${transportNodeId}_${Date.now()}`,
				source: hookNodeId,
				target: transportNodeId,
				sourceHandle: "bottom",
				targetHandle: "top",
				type: "smoothstep",
				animated: true,
				style: { stroke: "#14b8a6", strokeWidth: 2 },
				markerEnd: { type: "arrowclosed", color: "#14b8a6" },
				label: `Listener ${listenerIndex + 1}`
			};

			edges.value.push(edge);
			addEdges([edge]);
			lockNodePosition(transportNodeId, newTransportNode.position);

			// Update hook's listener with the transport node ID for future deletion
			const hookNodeForListener = getNodeFn.value(hookNodeId);
			if (hookNodeForListener && hookNodeForListener.data?.listeners) {
				const listeners = [...hookNodeForListener.data.listeners];
				if (listeners[listenerIndex]) {
					listeners[listenerIndex].transportNodeId = transportNodeId;
					updateNodeDataBase(hookNodeId, "listeners", listeners);
					console.log("✅ Updated listener with transport node ID");
				}
			}

			console.log(`✅ Created transport listener node ${listenerIndex + 1}`);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Error creating transport listener node:", error);
		}
	};

	/**
	 * Remove transport listener node
	 */
	const handleRemoveTransportListener = (hookNodeId: string, listenerIndex: number, transportNodeId: string) => {
		console.log("🗑️ Removing transport listener:", { hookNodeId, listenerIndex, transportNodeId });

		try {
			// Remove the transport node from array
			const transportIndex = transportNodes.value.findIndex((n: any) => n.id === transportNodeId);
			if (transportIndex !== -1) {
				transportNodes.value.splice(transportIndex, 1);
				console.log("✅ Removed transport node from array");
			}

			// Remove from VueFlow
			removeNodes([transportNodeId]);

			// Remove connected edges
			const connectedEdges = edges.value.filter((e: any) =>
				e.source === transportNodeId || e.target === transportNodeId
			);

			if (connectedEdges.length > 0) {
				const edgeIds = connectedEdges.map((e: any) => e.id);
				edges.value = edges.value.filter((e: any) =>
					!edgeIds.includes(e.id)
				);
				removeEdges(edgeIds);
				console.log(`✅ Removed ${connectedEdges.length} edges`);
			}

			console.log("✅ Transport listener node removed successfully");
		} catch (error) {
			console.error("❌ Error removing transport listener:", error);
		}
	};

	/**
	 * Create transport template node showing template code/preview
	 */
	const handleCreateTransportTemplateNode = (templateData: any, transportNodeId: string) => {
		console.log("═══════════════════════════════════════════");
		console.log("📄 CREATING TRANSPORT TEMPLATE NODE");
		console.log("  Template Data:", templateData);
		console.log("  Transport Node ID:", transportNodeId);
		console.log("═══════════════════════════════════════════");

		try {
			const transportNode = getNodeFn.value(transportNodeId);
			if (!transportNode) {
				console.error("❌ Transport node not found:", transportNodeId);
				return;
			}

			const transportPosition = transportNode.position || { x: 0, y: 0 };

			// Create template node ID
			const templateNodeId = `transportTemplate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			// Position template node to the right of transport node
			const templatePosition = {
				x: transportPosition.x + 650, // Transport node width + gap
				y: transportPosition.y
			};

			const newTemplateNode = createNode("transportTemplateNode", {
				id: templateNodeId,
				position: templatePosition,
				label: `Template: ${templateData.templateName}`,
				templateId: templateData.templateId,
				templateName: templateData.templateName,
				templateType: templateData.templateType,
				templateCode: templateData.templateCode,
				templateMeta: templateData.templateMeta,
				transportNodeId,
				status: templateData.status || "active"
			});

			if (newTemplateNode.style) {
				newTemplateNode.style.width = "500px";
				newTemplateNode.style.height = "600px";
			}

			newTemplateNode.draggable = true;
			newTemplateNode.selectable = true;

			console.log("📄 Creating transport template node:", newTemplateNode);

			// Add to transportTemplateNodes array
			transportTemplateNodes.value.push(newTemplateNode);
			addNodes([newTemplateNode]);

			// Create edge from transport to template node
			const edge = {
				id: `edge_${transportNodeId}_${templateNodeId}_${Date.now()}`,
				source: transportNodeId,
				target: templateNodeId,
				sourceHandle: "right",
				targetHandle: "left",
				type: "smoothstep",
				animated: true,
				style: { stroke: "#a855f7", strokeWidth: 2 },
				markerEnd: { type: "arrowclosed", color: "#a855f7" },
				label: "Template Code"
			};

			edges.value.push(edge);
			addEdges([edge]);
			lockNodePosition(templateNodeId, templatePosition);

			console.log(`✅ Created transport template node: ${templateNodeId}`);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Error creating transport template node:", error);
		}
	};

	/**
	 * Create form automation node with template data
	 */
	const handleCreateFormAutomationNode = (templateData: any, position?: { x: number; y: number }) => {
		console.log("🤖 Creating form automation node:", templateData);

		try {
			// Generate unique ID
			const automationNodeId = `form-automation-${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			// Use provided position or default
			const nodePosition = position || { x: 0, y: 0 };

			// Create automation node with template data
			const newAutomationNode = createNode("formAutomationNode", {
				id: automationNodeId,
				position: nodePosition,
				label: `Automation: ${templateData?.title || templateData?.name || "Form Automation"}`,
				templateData: templateData, // Store full template data
				automationSteps: templateData?.template?.automationSteps || [],
				automationState: {
					status: "idle",
					currentStep: 0,
					totalSteps: templateData?.template?.automationSteps?.length || 0,
					progress: 0,
					currentAction: "",
					error: null
				}
			});

			if (newAutomationNode.style) {
				newAutomationNode.style.width = "600px";
				newAutomationNode.style.height = "400px";
			}
			(newAutomationNode as any).selected = true;

			console.log("🤖 Creating automation node:", newAutomationNode);
			
			// Add to VueFlow - this will trigger onNodesChange which registers it
			addNodes([newAutomationNode]);

			// Lock position
			lockNodePosition(automationNodeId, nodePosition);

			console.log("✅ Created form automation node:", automationNodeId);
			return automationNodeId;
		} catch (error) {
			console.error("❌ Error creating form automation node:", error);
			console.error("Error details:", error);
			return null;
		}
	};

	return {
		getActiveViewportTypes,
		handleCloseViewport,
		handleCreateDevBrowserNode,
		handleCreateFormPreviewBrowserNode,
		handleCreateFormAutomationNode,
		handleCreateHookNodeForForm,
		handleCloseHookNode,
		handleHookAttached,
		handleCloseTransportNode,
		handleOpenFormGenerator,
		handleCreateTransportListener,
		handleRemoveTransportListener,
		handleCreateTransportTemplateNode
	};
}

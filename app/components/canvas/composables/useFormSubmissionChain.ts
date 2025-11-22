import type { Ref } from "vue";

/**
 * Composable for managing form submission through hook and transport chains
 * Handles data flow: Form → Hook → Transport
 */
export function useFormSubmissionChain(
	browserNodes: Ref<any[]>,
	hookNodes: Ref<any[]>,
	transportNodes: Ref<any[]>,
	edges: Ref<any[]>,
	getNodeFn: any,
	updateNodeData: (nodeId: string, key: string, value: any) => void
) {
	/**
	 * Find hook node connected to a browser/form node
	 */
	const findConnectedHook = (browserNodeId: string): any | null => {
		console.log("🔍 Finding hook connected to browser node:", browserNodeId);

		// First check if browser node has hook data stored directly
		const browserNode = getNodeFn.value(browserNodeId);
		if (browserNode?.data?.connectedHookId) {
			const hookNode = hookNodes.value.find((h) => h.id === browserNode.data.connectedHookId);
			if (hookNode) {
				console.log("✅ Found hook via stored ID:", hookNode.id);
				return hookNode;
			}
		}

		// Check edges: browser → hook
		const connectedEdges = edges.value.filter((edge: any) =>
			edge.source === browserNodeId || edge.target === browserNodeId
		);

		for (const edge of connectedEdges) {
			const hookNode = hookNodes.value.find((h) =>
				h.id === edge.source || h.id === edge.target
			);
			if (hookNode) {
				console.log("✅ Found hook via edge:", hookNode.id);
				return hookNode;
			}
		}

		console.warn("⚠️ No hook found for browser node:", browserNodeId);
		return null;
	};

	/**
	 * Find transport node connected to a hook node
	 */
	const findConnectedTransport = (hookNodeId: string): any | null => {
		console.log("🔍 Finding transport connected to hook:", hookNodeId);

		// First check if hook node has transport data stored directly
		const hookNode = getNodeFn.value(hookNodeId);
		if (hookNode?.data?.connectedTransportId) {
			const transportNode = transportNodes.value.find((t) => t.id === hookNode.data.connectedTransportId);
			if (transportNode) {
				console.log("✅ Found transport via stored ID:", transportNode.id);
				return transportNode;
			}
		}

		// Check edges: hook → transport
		const connectedEdges = edges.value.filter((edge: any) =>
			edge.source === hookNodeId || edge.target === hookNodeId
		);

		for (const edge of connectedEdges) {
			const transportNode = transportNodes.value.find((t) =>
				t.id === edge.source || t.id === edge.target
			);
			if (transportNode) {
				console.log("✅ Found transport via edge:", transportNode.id);
				return transportNode;
			}
		}

		console.warn("⚠️ No transport found for hook:", hookNodeId);
		return null;
	};

	/**
	 * Get full submission chain configuration for a browser/form node
	 */
	const getSubmissionChain = (browserNodeId: string) => {
		console.log("🔗 Getting submission chain for:", browserNodeId);

		const hookNode = findConnectedHook(browserNodeId);
		if (!hookNode) {
			return {
				hasHook: false,
				hasTransport: false,
				hookNode: null,
				transportNode: null,
				isConfigured: false,
				hookConfig: null,
				transportConfig: null
			};
		}

		const transportNode = findConnectedTransport(hookNode.id);

		const chain = {
			hasHook: true,
			hasTransport: !!transportNode,
			hookNode,
			transportNode,
			isConfigured: hookNode.data?.hookId && (!transportNode || transportNode.data?.transportId),
			hookConfig: {
				id: hookNode.data?.hookId,
				name: hookNode.data?.hookName,
				token: hookNode.data?.hookToken,
				type: hookNode.data?.hookType
			},
			transportConfig: transportNode
				? {
					id: transportNode.data?.transportId,
					name: transportNode.data?.transportName,
					type: transportNode.data?.transportType,
					target: transportNode.data?.transportTarget
				}
				: null
		};

		console.log("✅ Submission chain:", chain);
		return chain;
	};

	/**
	 * Store hook connection in browser node data
	 */
	const linkHookToBrowserNode = (browserNodeId: string, hookNodeId: string, hookData: any) => {
		console.log("🔗 Linking hook to browser node:", { browserNodeId, hookNodeId });

		updateNodeData(browserNodeId, "connectedHookId", hookNodeId);
		updateNodeData(browserNodeId, "hookConfig", {
			id: hookData.id,
			name: hookData.name,
			token: hookData.token,
			type: hookData.type
		});

		console.log("✅ Hook linked to browser node");
	};

	/**
	 * Store transport connection in hook node data
	 */
	const linkTransportToHookNode = (hookNodeId: string, transportNodeId: string, transportData: any) => {
		console.log("🔗 Linking transport to hook node:", { hookNodeId, transportNodeId });

		updateNodeData(hookNodeId, "connectedTransportId", transportNodeId);
		updateNodeData(hookNodeId, "transportConfig", {
			id: transportData.id,
			name: transportData.name,
			type: transportData.type,
			target: transportData.target
		});

		console.log("✅ Transport linked to hook node");
	};

	/**
	 * Submit form data through the chain
	 */
	const submitFormData = async (browserNodeId: string, formData: any) => {
		console.log("📤 Submitting form data through chain:", { browserNodeId, formData });

		const chain = getSubmissionChain(browserNodeId);

		if (!chain.isConfigured) {
			console.error("❌ Submission chain not configured:", chain);
			throw new Error(
				chain.hasHook
					? "Hook found but transport not configured"
					: "No hook configured for this form"
			);
		}

		// Update hook node with submission status
		updateNodeData(chain.hookNode.id, "lastSubmission", {
			timestamp: new Date().toISOString(),
			status: "processing",
			formData
		});

		try {
			// Here you would make the actual API call to submit via hook/transport
			// For now, simulate the submission
			console.log("🚀 Submitting via hook:", chain.hookConfig);
			console.log("🚀 Using transport:", chain.transportConfig);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Update success status
			updateNodeData(chain.hookNode.id, "lastSubmission", {
				timestamp: new Date().toISOString(),
				status: "success",
				formData
			});

			if (chain.transportNode) {
				updateNodeData(chain.transportNode.id, "lastTransmission", {
					timestamp: new Date().toISOString(),
					status: "success",
					data: formData
				});
			}

			console.log("✅ Form submitted successfully");
			return { success: true, chain };
		} catch (error) {
			console.error("❌ Form submission failed:", error);

			updateNodeData(chain.hookNode.id, "lastSubmission", {
				timestamp: new Date().toISOString(),
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error"
			});

			throw error;
		}
	};

	return {
		findConnectedHook,
		findConnectedTransport,
		getSubmissionChain,
		linkHookToBrowserNode,
		linkTransportToHookNode,
		submitFormData
	};
}

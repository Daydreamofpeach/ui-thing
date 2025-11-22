import type { Edge, Node } from "@vue-flow/core";
import type { Ref } from "vue";
import { computed } from "vue";

/**
 * Composable for managing form automation connections (hooks and transports)
 * Provides reactive tracking of which browser nodes are connected to which hooks/transports
 */
export function useFormAutomation(
	browserNodes: Ref<Node[]>,
	hookNodes: Ref<Node[]>,
	transportNodes: Ref<Node[]>,
	edges: Ref<Edge[]>,
	getNode: Ref<(id: string) => Node | undefined>
) {
	/**
	 * Reactive map of browser node IDs to their connected hook nodes
	 * Updates automatically when nodes or edges change
	 */
	const connectedHooksMap = computed(() => {
		const map = new Map<string, Node>();

		console.log("🔄 Recomputing connectedHooksMap...");
		console.log("  Browser nodes:", browserNodes.value.length);
		console.log("  Hook nodes:", hookNodes.value.length);
		console.log("  Edges:", edges.value.length);

		// For each browser node, find its connected hook
		browserNodes.value.forEach((browserNode) => {
			const browserNodeId = browserNode.id;

			console.log(`  🔍 Checking browser ${browserNodeId}`);

			// Find all edges FROM the browser node (direct connection)
			const browserEdges = edges.value.filter((e) => e.source === browserNodeId);
			console.log(`    📎 Found ${browserEdges.length} edges from browser node`);

			for (const edge of browserEdges) {
				console.log(`      🔍 Checking edge to: ${edge.target}`);
				const targetNode = getNode.value(edge.target);

				if (targetNode?.type === "hookNode") {
					const hookNode = hookNodes.value.find((h) => h.id === targetNode.id);
					console.log(`      🪝 Found hook node: ${hookNode?.id}, configured: ${!!hookNode?.data?.hookId}`);

					if (hookNode && (hookNode.data?.hookId || hookNode.data?.status === "configured")) {
						console.log(`      ✅ Mapping browser ${browserNodeId} → hook ${hookNode.data?.hookName}`);
						map.set(browserNodeId, hookNode);
						break;
					}
				}
			}
		});

		console.log(`🎯 Total mappings: ${map.size}`);
		return map;
	});

	/**
	 * Reactive map of browser node IDs to their connected transport nodes
	 * Updates automatically when hooks or edges change
	 */
	const connectedTransportsMap = computed(() => {
		const map = new Map<string, Node>();

		// For each browser node, find its connected transport (via hook)
		browserNodes.value.forEach((browserNode) => {
			const browserNodeId = browserNode.id;
			const hookNode = connectedHooksMap.value.get(browserNodeId);

			if (!hookNode) return;

			// Find transport connected to the hook
			const transportEdge = edges.value.find((e) => e.source === hookNode.id);
			if (transportEdge) {
				const transportNode = transportNodes.value.find((t) => t.id === transportEdge.target);
				if (transportNode && transportNode.data?.transportId) {
					console.log(`✅ Mapped browser ${browserNodeId} → transport ${transportNode.data?.transportName}`);
					map.set(browserNodeId, transportNode);
				}
			}
		});

		return map;
	});

	/**
	 * Get the connected hook node for a specific browser node
	 */
	const getConnectedHook = (browserNodeId: string): Node | null => {
		const hook = connectedHooksMap.value.get(browserNodeId);
		if (hook) {
			console.log(`✅ Found connected hook for ${browserNodeId}:`, hook.data?.hookName);
		} else {
			console.log(`⚠️ No connected hook found for ${browserNodeId}`);
		}
		return hook || null;
	};

	/**
	 * Get the connected transport node for a specific browser node
	 */
	const getConnectedTransport = (browserNodeId: string): Node | null => {
		const transport = connectedTransportsMap.value.get(browserNodeId);
		if (transport) {
			console.log(`✅ Found connected transport for ${browserNodeId}:`, transport.data?.transportName);
		} else {
			console.log(`⚠️ No connected transport found for ${browserNodeId}`);
		}
		return transport || null;
	};

	return {
		connectedHooksMap,
		connectedTransportsMap,
		getConnectedHook,
		getConnectedTransport
	};
}

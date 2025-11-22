<template>
	<!-- This is a controller component - no visual UI, just logic orchestration -->
	<div class="form-submission-controller" style="display: none;" />
</template>

<script setup lang="ts">
	import { computed, watch } from "vue";
	import { useFormSubmissionChain } from "../composables/useFormSubmissionChain";

	interface Props {
		browserNodes: any[]
		hookNodes: any[]
		transportNodes: any[]
		edges: any[]
		getNodeFn: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		formSubmitted: [browserNodeId: string, formData: any, chain: any]
		submissionError: [browserNodeId: string, error: Error]
		chainUpdated: [browserNodeId: string, chain: any]
	}>();

	// Create a wrapper function that calls getNodeFn correctly
	// getNodeFn from VueFlow is already a computed ref
	const getNodeWrapper = {
		value: (nodeId: string) => {
			// props.getNodeFn is a ComputedRef from VueFlow
			// Access its .value to get the function, then call it
			return props.getNodeFn?.value ? props.getNodeFn.value(nodeId) : null;
		}
	};

	// Use the submission chain composable
	const {
		getSubmissionChain,
		linkHookToBrowserNode,
		linkTransportToHookNode,
		submitFormData
	} = useFormSubmissionChain(
		computed(() => props.browserNodes),
		computed(() => props.hookNodes),
		computed(() => props.transportNodes),
		computed(() => props.edges),
		getNodeWrapper,
		props.updateNodeData
	);

	/**
	 * Watch for new edges being created that connect browser → hook or hook → transport
	 * Auto-link them in the node data for easy access
	 */
	watch(() => props.edges, (newEdges, oldEdges) => {
		if (!newEdges || newEdges.length === 0) return;

		try {
			// Find newly added edges
			const oldEdgeIds = new Set(oldEdges?.map((e) => e.id) || []);
			const newlyAddedEdges = newEdges.filter((e) => !oldEdgeIds.has(e.id));

			if (newlyAddedEdges.length === 0) return;

			console.log("🔗 FormSubmissionController: Detected new edges:", newlyAddedEdges.length);

			newlyAddedEdges.forEach((edge) => {
				// Check if edge connects browser → hook
				const browserNode = props.browserNodes.find((n) => n.id === edge.source || n.id === edge.target);
				const hookNode = props.hookNodes.find((n) => n.id === edge.source || n.id === edge.target);

				if (browserNode && hookNode) {
					console.log("🔗 Auto-linking browser → hook:", { browser: browserNode.id, hook: hookNode.id });
					linkHookToBrowserNode(browserNode.id, hookNode.id, hookNode.data);

					// Emit chain update
					try {
						const chain = getSubmissionChain(browserNode.id);
						emit("chainUpdated", browserNode.id, chain);
					} catch (error) {
						console.error("❌ Error getting submission chain for browser node:", error);
					}
				}

				// Check if edge connects hook → transport
				const transportNode = props.transportNodes.find((n) => n.id === edge.source || n.id === edge.target);

				if (hookNode && transportNode) {
					console.log("🔗 Auto-linking hook → transport:", { hook: hookNode.id, transport: transportNode.id });
					linkTransportToHookNode(hookNode.id, transportNode.id, transportNode.data);

					// Find browser node connected to this hook and emit chain update
					const browserNodeForHook = props.browserNodes.find((b) =>
						props.edges.some((e) =>
							(e.source === b.id && e.target === hookNode.id)
							|| (e.target === b.id && e.source === hookNode.id)
						)
					);
					if (browserNodeForHook) {
						try {
							const chain = getSubmissionChain(browserNodeForHook.id);
							emit("chainUpdated", browserNodeForHook.id, chain);
						} catch (error) {
							console.error("❌ Error getting submission chain for hook transport:", error);
						}
					}
				}
			});
		} catch (error) {
			console.error("❌ Error in edges watcher:", error);
		}
	}, { deep: true });

	/**
	 * Watch for hook node updates (configuration changes)
	 * Update linked browser nodes
	 */
	watch(() => props.hookNodes, (newHookNodes) => {
		if (!newHookNodes || newHookNodes.length === 0) return;

		try {
			newHookNodes.forEach((hookNode) => {
				// If hook just got configured (hookId was added)
				if (hookNode.data?.hookId && hookNode.data?.status === "configured") {
					// Find connected browser node
					const connectedBrowserNode = props.browserNodes.find((b) =>
						b.data?.connectedHookId === hookNode.id
					);

					if (connectedBrowserNode) {
						console.log("✅ Hook configured, updating browser node:", connectedBrowserNode.id);
						try {
							const chain = getSubmissionChain(connectedBrowserNode.id);
							emit("chainUpdated", connectedBrowserNode.id, chain);
						} catch (error) {
							console.error("❌ Error getting submission chain:", error);
						}
					}
				}
			});
		} catch (error) {
			console.error("❌ Error in hook nodes watcher:", error);
		}
	}, { deep: true });

	/**
	 * Watch for transport node updates (configuration changes)
	 * Update linked hook and browser nodes with transport config
	 */
	watch(() => props.transportNodes, (newTransportNodes) => {
		if (!newTransportNodes || newTransportNodes.length === 0) return;

		try {
			newTransportNodes.forEach((transportNode) => {
				// If transport just got configured (transportId was added)
				if (transportNode.data?.transportId && transportNode.data?.status === "configured") {
					// Find connected hook node
					const connectedHookNode = props.hookNodes.find((h) =>
						h.data?.connectedTransportId === transportNode.id
					);

					if (connectedHookNode) {
						console.log("✅ Transport configured, updating hook and browser nodes:", connectedHookNode.id);

						// Store transport config in hook node
						props.updateNodeData(connectedHookNode.id, "transportConfig", {
							id: transportNode.data.transportId,
							type: transportNode.data.transportType,
							target: transportNode.data.transportTarget,
							name: transportNode.data.transportName
						});

						// Find browser node connected to this hook
						const connectedBrowserNode = props.browserNodes.find((b) =>
							b.data?.connectedHookId === connectedHookNode.id
						);

						if (connectedBrowserNode) {
							// Store transport config in browser node for easy access
							props.updateNodeData(connectedBrowserNode.id, "transportConfig", {
								id: transportNode.data.transportId,
								type: transportNode.data.transportType,
								target: transportNode.data.transportTarget,
								name: transportNode.data.transportName
							});
							console.log("✅ Transport config stored in browser node");

							try {
								const chain = getSubmissionChain(connectedBrowserNode.id);
								emit("chainUpdated", connectedBrowserNode.id, chain);
							} catch (error) {
								console.error("❌ Error getting submission chain:", error);
							}
						}
					}
				}
			});
		} catch (error) {
			console.error("❌ Error in transport nodes watcher:", error);
		}
	}, { deep: true });

	// Expose methods for parent to call
	defineExpose({
		getSubmissionChain,
		submitFormData: async (browserNodeId: string, formData: any) => {
			try {
				const result = await submitFormData(browserNodeId, formData);
				emit("formSubmitted", browserNodeId, formData, result.chain);
				return result;
			} catch (error) {
				emit("submissionError", browserNodeId, error as Error);
				throw error;
			}
		},
		linkHookToBrowserNode,
		linkTransportToHookNode
	});
</script>

<style scoped>
.form-submission-controller {
	display: none;
}
</style>
<template>
	<div class="h-full w-full flex flex-col relative bg-background">
		<!-- Loading indicator while canvas loads -->
		<div v-if="!isCanvasReady" class="absolute inset-0 flex items-center justify-center bg-background z-10">
			<div class="text-center">
				<div class="text-muted-foreground text-sm">Loading canvas...</div>
			</div>
		</div>
		<!-- Canvas Panel - Always render, ClientOnly for VueFlow -->
		<ClientOnly>
			<template #fallback>
				<div class="h-full w-full flex items-center justify-center bg-background">
					<div class="text-center">
						<div class="text-muted-foreground text-sm">Initializing canvas...</div>
					</div>
				</div>
			</template>
			<div class="h-full w-full overflow-hidden">
				<CanvasPanel 
					ref="canvasRef" 
					:project-id="projectId" 
					:organization-id="organisationId"
				/>
			</div>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
	import CanvasPanel from "~/components/canvas/CanvasPanel.vue";
	import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
	import { useProjectSelection } from "~/composables/useProjectSelection";

	const selectedOrgId = useSelectedOrganisationId();
	const { selectedProjectId } = useProjectSelection();

	const organisationId = computed(() => selectedOrgId.value || "");
	const projectId = computed(() => selectedProjectId.value || "");

	const canvasRef = ref<any | null>(null);
	const isCanvasReady = ref(false);
	const pendingCanvasData = ref<any | null>(null);

	// Watch for canvasRef to be set (when ClientOnly mounts CanvasPanel)
	watch(() => canvasRef.value, (newVal, oldVal) => {
		if (newVal && newVal !== oldVal) {
			console.log("✅ CanvasSection: CanvasPanel ref changed", {
				hasLoadCanvasData: !!newVal?.loadCanvasData,
				hasHandleAddNode: !!newVal?.handleAddNode,
				refType: typeof newVal
			});
			if (newVal.loadCanvasData) {
				isCanvasReady.value = true;
				console.log("✅ CanvasSection: CanvasPanel ref is available with loadCanvasData");
				
				// Load any pending canvas data
				if (pendingCanvasData.value) {
					nextTick(() => {
						try {
							newVal.loadCanvasData(pendingCanvasData.value);
							console.log("✅ CanvasSection: Loaded pending canvas data");
							pendingCanvasData.value = null;
						} catch (error) {
							console.error("❌ CanvasSection: Failed to load pending canvas data:", error);
						}
					});
				}
			}
		}
	}, { immediate: true, deep: false });

	// Poll for canvasRef to become available (fallback for ClientOnly)
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	onMounted(() => {
		// Immediate check
		if (canvasRef.value?.loadCanvasData) {
			isCanvasReady.value = true;
			// Load pending data if any
			if (pendingCanvasData.value) {
				nextTick(() => {
					try {
						canvasRef.value.loadCanvasData(pendingCanvasData.value);
						pendingCanvasData.value = null;
					} catch (error) {
						console.error("❌ Failed to load pending canvas data:", error);
					}
				});
			}
			return;
		}

		// Poll for canvasRef to become available (ClientOnly can delay mounting)
		let pollCount = 0;
		const maxPolls = 100; // 10 seconds max
		pollInterval = setInterval(() => {
			pollCount++;
			if (canvasRef.value?.loadCanvasData) {
				console.log("✅ CanvasSection: CanvasPanel ref detected via polling");
				isCanvasReady.value = true;
				
				// Load pending data if any
				if (pendingCanvasData.value) {
					nextTick(() => {
						try {
							canvasRef.value.loadCanvasData(pendingCanvasData.value);
							console.log("✅ CanvasSection: Loaded pending canvas data after polling");
							pendingCanvasData.value = null;
						} catch (error) {
							console.error("❌ Failed to load pending canvas data:", error);
						}
					});
				}
				
				if (pollInterval) {
					clearInterval(pollInterval);
					pollInterval = null;
				}
			} else if (pollCount >= maxPolls) {
				console.warn("⚠️ CanvasSection: CanvasPanel ref not available after polling");
				if (pollInterval) {
					clearInterval(pollInterval);
					pollInterval = null;
				}
			}
		}, 100);
	});

	// Cleanup
	onBeforeUnmount(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
	});

	// Methods to expose to parent
	const loadCanvasData = async (data: any) => {
		console.log("📥 CanvasSection: loadCanvasData called", {
			hasCanvasRef: !!canvasRef.value,
			hasLoadCanvasData: !!canvasRef.value?.loadCanvasData,
			data: data ? "present" : "null"
		});
		
		// If canvas is ready, load immediately
		if (canvasRef.value?.loadCanvasData) {
			try {
				await canvasRef.value.loadCanvasData(data);
				console.log("✅ CanvasSection: Canvas data loaded successfully");
				return;
			} catch (error) {
				console.error("❌ CanvasSection: Error loading canvas data:", error);
				throw error;
			}
		}
		
		// Store pending data and wait for canvas to be ready
		console.log("⏳ CanvasSection: Canvas not ready, storing pending data");
		pendingCanvasData.value = data;
		
		// Wait up to 10 seconds for ClientOnly to mount
		for (let i = 0; i < 100; i++) {
			await new Promise(resolve => setTimeout(resolve, 100));
			if (canvasRef.value?.loadCanvasData) {
				try {
					await canvasRef.value.loadCanvasData(data);
					pendingCanvasData.value = null;
					console.log("✅ CanvasSection: Canvas data loaded after waiting");
					return;
				} catch (error) {
					console.error("❌ CanvasSection: Error loading canvas data after wait:", error);
					throw error;
				}
			}
		}
		
		// If still not available, keep pending data (will load when canvas becomes ready)
		console.warn("⚠️ CanvasSection: Canvas not available after waiting, data stored for later");
	};

	const handleAddNode = (nodeType: string) => {
		return canvasRef.value?.handleAddNode?.(nodeType);
	};

	const clearAllNodes = () => {
		return canvasRef.value?.clearAllNodes?.();
	};

	const fitView = () => {
		return canvasRef.value?.fitView?.();
	};

	// Expose canvas ref to parent - expose the actual CanvasPanel instance
	const exposed = {
		canvasRef,
		isCanvasReady,
		// Direct access methods for convenience
		loadCanvasData,
		handleAddNode,
		clearAllNodes,
		fitView,
		allNodes: computed(() => canvasRef.value?.allNodes),
		allEdges: computed(() => canvasRef.value?.allEdges),
		viewport: computed(() => canvasRef.value?.viewport)
	};

	// Debug: Log what's being exposed (after first mount)
	onMounted(() => {
		nextTick(() => {
			console.log("🔍 CanvasSection: Exposed methods:", {
				hasLoadCanvasData: typeof exposed.loadCanvasData === 'function',
				hasHandleAddNode: typeof exposed.handleAddNode === 'function',
				hasCanvasRef: !!exposed.canvasRef,
				exposedKeys: Object.keys(exposed)
			});
		});
	});

	defineExpose(exposed);
</script>

<style scoped>
</style>



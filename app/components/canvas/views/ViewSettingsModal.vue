<template>
	<Teleport to="body">
		<div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
			<!-- Backdrop -->
			<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

			<!-- Modal Content -->
			<div class="relative w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden">
				<div class="glassmorphic-panel border border-primary/20 rounded-xl flex flex-col max-h-[85vh]">
					<!-- Header -->
					<div class="p-6 border-b border-white/10">
						<div class="flex items-center gap-3 mb-2">
							<UIcon name="i-lucide-settings" class="size-6 text-primary" />
							<h3 class="text-lg font-semibold text-white">
								View Settings
							</h3>
						</div>
						<p class="text-sm text-white/60">
							Configure "{{ localView.name }}"
						</p>
					</div>

					<!-- Content -->
					<div class="flex-1 overflow-y-auto p-6 space-y-6">
						<!-- Basic Info -->
						<div class="glassmorphic-panel p-4 border border-white/10 rounded-lg space-y-4">
							<h4 class="font-semibold text-white flex items-center gap-2">
								<UIcon name="i-lucide-file-text" class="size-5" />
								Basic Information
							</h4>

							<div>
								<label class="block text-sm font-medium text-white/80 mb-2">
									View Name
								</label>
								<input
									v-model="localView.name"
									type="text"
									class="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary/50 focus:outline-none"
								>
							</div>

							<div>
								<label class="block text-sm font-medium text-white/80 mb-2">
									Description
								</label>
								<textarea
									v-model="localView.description"
									rows="2"
									class="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary/50 focus:outline-none resize-none"
								/>
							</div>
						</div>

						<!-- View Layer Color -->
						<div class="glassmorphic-panel p-4 border border-white/10 rounded-lg space-y-4">
							<div class="flex items-center justify-between">
								<h4 class="font-semibold text-white flex items-center gap-2">
									<UIcon name="i-lucide-palette" class="size-5" />
									View Layer Appearance
								</h4>
								<button
									class="px-3 py-1.5 text-xs rounded-lg transition-all"
									:class="viewColorEnabled ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
									@click="viewColorEnabled = !viewColorEnabled"
								>
									{{ viewColorEnabled ? 'Enabled' : 'Disabled' }}
								</button>
							</div>

							<p class="text-sm text-white/60">
								When this view is active, a colored overlay appears on the canvas to indicate you're in a filtered view.
							</p>

							<div v-if="viewColorEnabled">
								<ColorPicker
									v-model="localView.color"
									label="Layer Color"
									:show-opacity="true"
									@update:opacity="localView.opacity = $event"
								/>
							</div>
						</div>

						<!-- Node Visibility -->
						<div class="glassmorphic-panel p-4 border border-white/10 rounded-lg space-y-4">
							<div class="flex items-center justify-between">
								<h4 class="font-semibold text-white flex items-center gap-2">
									<UIcon name="i-lucide-eye" class="size-5" />
									Node Visibility
								</h4>
								<div class="flex items-center gap-2">
									<button
										class="px-3 py-1.5 text-xs rounded-lg transition-all"
										:class="filterMode === 'show' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-black/30 text-white/50 border border-white/10'"
										@click="setFilterMode('show')"
									>
										Show Only
									</button>
									<button
										class="px-3 py-1.5 text-xs rounded-lg transition-all"
										:class="filterMode === 'hide' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-black/30 text-white/50 border border-white/10'"
										@click="setFilterMode('hide')"
									>
										Hide Only
									</button>
									<button
										class="px-3 py-1.5 text-xs rounded-lg transition-all"
										:class="filterMode === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-black/30 text-white/50 border border-white/10'"
										@click="setFilterMode('all')"
									>
										Show All
									</button>
								</div>
							</div>

							<!-- Select All / Clear All Buttons -->
							<div v-if="filterMode !== 'all' && allNodes.length > 0" class="flex items-center justify-between gap-2">
								<button
									class="flex-1 px-3 py-2 text-sm rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
									@click="selectAllNodes"
								>
									<UIcon name="i-lucide-check-square" class="size-4" />
									Select All ({{ allNodes.length }})
								</button>
								<button
									v-if="selectedNodeIds.size > 0"
									class="flex-1 px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
									@click="clearAllNodes"
								>
									<UIcon name="i-lucide-x-square" class="size-4" />
									Clear All
								</button>
							</div>

							<p class="text-sm text-white/60">
								<span v-if="filterMode === 'show'">
									Only selected nodes will be visible in this view
								</span>
								<span v-else-if="filterMode === 'hide'">
									Selected nodes will be hidden in this view
								</span>
								<span v-else>
									All nodes will be visible in this view
								</span>
							</p>

							<!-- Node Search -->
							<div v-if="filterMode !== 'all'" class="relative">
								<UIcon name="i-lucide-search" class="absolute left-3 top-2.5 size-4 text-white/40" />
								<input
									v-model="nodeSearchQuery"
									type="text"
									placeholder="Search nodes..."
									class="w-full pl-10 pr-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary/50 focus:outline-none text-sm"
								>
							</div>

							<!-- Node List -->
							<div v-if="filterMode !== 'all'" class="space-y-2 max-h-96 overflow-y-auto">
								<div
									v-for="node in filteredNodes"
									:key="node.id"
									class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer"
									:class="isNodeSelected(node.id) ? 'bg-primary/10 border-primary/30' : 'bg-black/20 border-white/10 hover:bg-black/40'"
									@click="toggleNodeSelection(node.id)"
								>
									<div class="flex items-center gap-3">
										<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
											<UIcon name="i-lucide-box" class="size-4 text-primary" />
										</div>
										<div>
											<div class="text-sm font-medium text-white">
												{{ node.data?.label || node.type || node.id }}
											</div>
											<div class="text-xs text-white/50">
												{{ node.type }} • {{ node.id.substring(0, 8) }}
											</div>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<UIcon
											:name="isNodeSelected(node.id) ? 'i-lucide-check-circle-2' : 'i-lucide-circle'"
											class="size-5"
											:class="isNodeSelected(node.id) ? 'text-primary' : 'text-white/30'"
										/>
									</div>
								</div>

								<div v-if="filteredNodes.length === 0" class="text-center py-8 text-sm text-white/50">
									<UIcon name="i-lucide-search-x" class="size-12 mx-auto mb-2 text-white/20" />
									<p>{{ nodeSearchQuery ? 'No nodes match your search' : 'No nodes available' }}</p>
								</div>
							</div>

							<!-- Stats -->
							<div v-if="filterMode !== 'all'" class="flex items-center gap-4 pt-3 border-t border-white/10">
								<div class="text-sm">
									<span class="text-white/60">Total nodes:</span>
									<span class="ml-2 font-semibold text-white">{{ allNodes.length }}</span>
								</div>
								<div class="text-sm">
									<span class="text-white/60">Selected:</span>
									<span class="ml-2 font-semibold text-primary">{{ selectedNodeIds.size }}</span>
								</div>
								<div class="text-sm">
									<span class="text-white/60">Visible in view:</span>
									<span class="ml-2 font-semibold text-green-400">{{ getVisibleCount() }}</span>
								</div>
							</div>
						</div>

						<!-- Fork Settings -->
						<div class="glassmorphic-panel p-4 border border-white/10 rounded-lg space-y-4">
							<h4 class="font-semibold text-white flex items-center gap-2">
								<UIcon name="i-lucide-git-fork" class="size-5" />
								Fork Settings
							</h4>

							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm text-white/80">
										Allow users to fork this view
									</p>
									<p class="text-xs text-white/50 mt-1">
										Users can create their own copy of this view
									</p>
								</div>
								<button
									class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
									:class="
										localView.permissions.allowFork
											? 'bg-green-500/20 text-green-400 border border-green-500/30'
											: 'bg-red-500/20 text-red-400 border border-red-500/30'
									"
									@click="localView.permissions.allowFork = !localView.permissions.allowFork"
								>
									{{ localView.permissions.allowFork ? 'Enabled' : 'Disabled' }}
								</button>
							</div>
						</div>
					</div>

					<!-- Footer -->
					<div class="p-6 border-t border-white/10 flex items-center justify-between">
						<button
							v-if="!localView.isMaster"
							type="button"
							class="glassmorphic-button px-4 py-2 text-sm border border-red-500/30 text-red-400 hover:border-red-500/50"
							@click="deleteView"
						>
							<UIcon name="i-lucide-trash-2" class="size-4 mr-2" />
							Delete View
						</button>
						<div class="flex items-center gap-3 ml-auto">
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-neutral-500/30 text-white/80 hover:text-white"
								@click="emit('close')"
							>
								Cancel
							</button>
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-primary/30 text-primary hover:border-primary/50"
								@click="saveSettings"
							>
								<UIcon name="i-lucide-save" class="size-4 mr-2" />
								Save Settings
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import type { CanvasView } from "../stores/organization/types";
	import { computed, onMounted, ref } from "vue";
	import { ColorPicker } from "../ui/shared";

	// Props
	const props = defineProps<{
		view: CanvasView
		organizationId: string
		allNodes: any[]
		show?: boolean
	}>();

	// Emits
	const emit = defineEmits<{
		close: []
		viewUpdated: [view: CanvasView]
		viewDeleted: [viewId: string]
	}>();

	// State - Ensure all required fields exist
	const viewData: any = props.view;
	const localView = ref<CanvasView>({
		...props.view,
		permissions: props.view.permissions || viewData.meta?.permissions || {
			ownerId: props.view.createdBy || "",
			adminIds: [],
			userIds: [],
			userGroupIds: [],
			isPublic: false,
			accessLevel: "read-write" as const,
			allowFork: true
		},
		color: props.view.color || viewData.meta?.color || "#3b82f6",
		opacity: props.view.opacity ?? viewData.meta?.opacity ?? 50
	});
	const nodeSearchQuery = ref("");
	const selectedNodeIds = ref<Set<string>>(new Set());
	const filterMode = ref<"show" | "hide" | "all">("all");
	const viewColorEnabled = ref<boolean>(!!(props.view.color || viewData.meta?.color));

	// Computed
	const filteredNodes = computed(() => {
		let nodes = props.allNodes || [];

		if (nodeSearchQuery.value) {
			const query = nodeSearchQuery.value.toLowerCase();
			nodes = nodes.filter((n) =>
				n.id.toLowerCase().includes(query)
				|| n.type?.toLowerCase().includes(query)
				|| n.data?.label?.toLowerCase().includes(query)
			);
		}

		return nodes;
	});

	// Methods
	const initializeSelection = () => {
		if (localView.value.visibleNodeIds && localView.value.visibleNodeIds.length > 0) {
			filterMode.value = "show";
			selectedNodeIds.value = new Set(localView.value.visibleNodeIds);
		} else if (localView.value.hiddenNodeIds && localView.value.hiddenNodeIds.length > 0) {
			filterMode.value = "hide";
			selectedNodeIds.value = new Set(localView.value.hiddenNodeIds);
		} else {
			filterMode.value = "all";
			selectedNodeIds.value = new Set();
		}
	};

	const setFilterMode = (mode: "show" | "hide" | "all") => {
		filterMode.value = mode;
		if (mode === "all") {
			selectedNodeIds.value.clear();
		}
	};

	const isNodeSelected = (nodeId: string): boolean => {
		return selectedNodeIds.value.has(nodeId);
	};

	const toggleNodeSelection = (nodeId: string) => {
		if (selectedNodeIds.value.has(nodeId)) {
			selectedNodeIds.value.delete(nodeId);
		} else {
			selectedNodeIds.value.add(nodeId);
		}
		// Force reactivity
		selectedNodeIds.value = new Set(selectedNodeIds.value);
	};

	const selectAllNodes = () => {
		// Add all node IDs to the selection
		const allNodeIds = props.allNodes.map((node) => node.id);
		selectedNodeIds.value = new Set(allNodeIds);
		console.log(`✅ Selected all ${allNodeIds.length} nodes`);
	};

	const clearAllNodes = () => {
		// Clear all selections
		selectedNodeIds.value.clear();
		selectedNodeIds.value = new Set(selectedNodeIds.value);
		console.log("🗑️ Cleared all node selections");
	};

	const getVisibleCount = (): number => {
		if (filterMode.value === "all") return props.allNodes.length;
		if (filterMode.value === "show") return selectedNodeIds.value.size;
		return props.allNodes.length - selectedNodeIds.value.size;
	};

	const saveSettings = () => {
		// Apply node visibility settings
		if (filterMode.value === "show") {
			localView.value.visibleNodeIds = Array.from(selectedNodeIds.value);
			localView.value.hiddenNodeIds = undefined;
		} else if (filterMode.value === "hide") {
			localView.value.hiddenNodeIds = Array.from(selectedNodeIds.value);
			localView.value.visibleNodeIds = undefined;
		} else {
			localView.value.visibleNodeIds = undefined;
			localView.value.hiddenNodeIds = undefined;
		}

		// Clear color if disabled
		if (!viewColorEnabled.value) {
			localView.value.color = undefined;
			localView.value.opacity = undefined;
		}

		emit("viewUpdated", localView.value);
	};

	const deleteView = () => {
		// eslint-disable-next-line no-alert
		const confirmed = confirm(`Are you sure you want to delete "${localView.value.name}"? This action cannot be undone.`);
		if (confirmed) {
			emit("viewDeleted", localView.value.id);
			emit("close");
		}
	};

	// Lifecycle
	onMounted(() => {
		initializeSelection();
	});
</script>

<style scoped>
.glassmorphic-panel {
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
	backdrop-filter: blur(20px);
}
</style>

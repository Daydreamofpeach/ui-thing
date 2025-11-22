<template>
	<div class="view-management-panel h-full w-full flex flex-col">
		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<h3 class="panel-title">
					<Icon name="i-lucide-eye" class="size-5" />
					Canvas Views
				</h3>
				<p class="panel-subtitle">
					Manage canvas views and permissions
				</p>
			</div>
			<div class="header-actions">
				<button
					class="create-view-btn"
					title="Create new view"
					@click="showCreateViewModal = true"
				>
					<Icon name="i-lucide-plus" class="size-4" />
					New View
				</button>
			</div>
		</div>

		<!-- Current Active View Banner -->
		<div v-if="currentCanvasId" class="active-view-banner">
			<div class="banner-content">
				<Icon name="i-lucide-eye" class="size-4 text-primary" />
				<span class="banner-text">
					👁️ {{ getCurrentCanvasName() }}
				</span>
				<UiBadge
					color="blue"
					variant="subtle"
					class="text-xs"
				>
					Active View
				</UiBadge>
			</div>
		</div>

		<!-- Search Bar -->
		<div class="search-section">
			<div class="search-input-wrapper">
				<Icon name="i-lucide-search" class="search-icon" />
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search views..."
					class="search-input"
				>
				<button
					v-if="searchQuery"
					class="clear-search-button"
					@click="searchQuery = ''"
				>
					<Icon name="i-lucide-x" class="size-3" />
				</button>
			</div>
		</div>

		<!-- Content Area -->
		<div class="panel-content">
			<!-- Loading State -->
			<div v-if="isLoading" class="loading-state">
				<Icon name="i-lucide-loader-2" class="size-8 animate-spin text-primary/60" />
				<p class="text-sm text-white/60 mt-3">
					Loading views...
				</p>
			</div>

			<!-- Views List -->
			<div v-else-if="filteredViews.length > 0" class="views-list">
				<div
					v-for="view in filteredViews"
					:key="view.id"
					class="view-item"
					:class="{ active: view.id === currentCanvasId, master: view.meta?.isMaster }"
				>
					<div class="view-info">
						<div class="view-header-row">
							<div class="view-icon">
								<Icon
									:name="view.meta?.isMaster ? 'i-lucide-building-2' : 'i-lucide-eye'"
									class="size-4"
								/>
							</div>
							<div class="view-name-section">
								<div class="view-name">
									{{ view.name }}
									<span
										v-if="view.meta?.color || view.color"
										class="inline-block w-3 h-3 rounded-full ml-2 border border-white/20"
										:style="{ backgroundColor: view.meta?.color || view.color }"
										:title="`View overlay color: ${view.meta?.color || view.color}`"
									/>
								</div>
								<div v-if="view.description" class="view-description">
									{{ view.description }}
								</div>
							</div>
						</div>

						<!-- View Stats -->
						<div class="view-stats">
							<div class="stat-item">
								<Icon name="i-lucide-users" class="size-3" />
								<span>{{ getViewUserCount(view) }} users</span>
							</div>
							<div class="stat-item">
								<Icon name="i-lucide-box" class="size-3" />
								<span>{{ getViewNodeCount(view) }} nodes</span>
							</div>
							<div class="stat-item">
								<Icon
									:name="(view.meta?.permissions || view.permissions)?.isPublic ? 'i-lucide-globe' : 'i-lucide-lock'"
									class="size-3"
								/>
								<span>{{ (view.meta?.permissions || view.permissions)?.isPublic ? 'Public' : 'Private' }}</span>
							</div>
						</div>
					</div>

					<!-- View Actions -->
					<div class="view-actions">
						<button
							v-if="view.id !== currentCanvasId"
							class="action-btn switch-btn"
							:title="`Switch to ${view.name}`"
							@click="switchToView(view)"
						>
							<Icon name="i-lucide-eye" class="size-4" />
						</button>
						<button
							class="action-btn edit-btn"
							title="Manage permissions"
							@click="openPermissionsModal(view)"
						>
							<Icon name="i-lucide-shield" class="size-4" />
						</button>
						<button
							class="action-btn settings-btn"
							title="View settings (Edit color here)"
							@click="openViewSettings(view)"
						>
							<Icon name="i-lucide-settings" class="size-4" />
						</button>
						<button
							class="action-btn delete-btn"
							title="Delete view"
							@click="confirmDeleteView(view)"
						>
							<Icon name="i-lucide-trash-2" class="size-4" />
						</button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="empty-state">
				<Icon name="i-lucide-eye-off" class="size-12 text-white/20 mb-3" />
				<p class="text-sm text-white/50 mb-3">
					{{ searchQuery ? 'No views match your search' : 'No views for this project yet' }}
				</p>
				<p class="text-xs text-white/40">
					Create a new view or create/save a canvas.
					All new canvases are automatically tagged with [PROJECT:{{ projectId }}]
				</p>
			</div>
		</div>

		<!-- Create View Modal -->
		<Teleport to="body">
			<div v-if="showCreateViewModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCreateViewModal = false" />

				<!-- Modal Content -->
				<div class="relative w-full max-w-md mx-4">
					<div class="glassmorphic-panel p-6 border border-primary/20 rounded-xl">
						<div class="flex items-center gap-3 mb-4">
							<Icon name="i-lucide-plus-circle" class="size-6 text-primary" />
							<h3 class="text-lg font-semibold text-white">
								Create New View
							</h3>
						</div>

						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-white/80 mb-2">
									View Name
								</label>
								<input
									v-model="newViewName"
									type="text"
									placeholder="e.g., Development View"
									class="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary/50 focus:outline-none"
									@keyup.enter="createNewView"
								>
							</div>

							<div>
								<label class="block text-sm font-medium text-white/80 mb-2">
									Description (Optional)
								</label>
								<textarea
									v-model="newViewDescription"
									rows="2"
									placeholder="e.g., Canvas view for development team"
									class="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary/50 focus:outline-none resize-none"
								/>
							</div>

							<div class="flex items-center gap-3">
								<input
									id="publicView"
									v-model="newViewIsPublic"
									type="checkbox"
									class="w-4 h-4 rounded border-white/20"
								>
								<label for="publicView" class="text-sm text-white/70 cursor-pointer">
									Make this view public (all organization members can access)
								</label>
							</div>
						</div>

						<div class="flex items-center justify-end gap-3 mt-6">
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-neutral-500/30 text-white/80 hover:text-white"
								@click="showCreateViewModal = false"
							>
								Cancel
							</button>
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-primary/30 text-primary hover:border-primary/50"
								:disabled="!newViewName.trim()"
								@click="createNewView"
							>
								<Icon name="i-lucide-plus-circle" class="size-4 mr-2" />
								Create View
							</button>
						</div>
					</div>
				</div>
			</div>
		</Teleport>

		<!-- View Permissions Modal -->
		<ViewPermissionsModal
			v-if="showPermissionsModal && selectedViewForPermissions"
			:show="showPermissionsModal"
			:view="selectedViewForPermissions"
			:organization-id="organizationId"
			:project-id="projectId"
			@close="closePermissionsModal"
			@permissions-updated="handlePermissionsUpdated"
		/>

		<!-- View Settings Modal -->
		<ViewSettingsModal
			v-if="showSettingsModal && selectedViewForSettings"
			:show="showSettingsModal"
			:view="selectedViewForSettings"
			:organization-id="organizationId"
			:all-nodes="allNodes || []"
			@close="closeSettingsModal"
			@view-updated="handleViewUpdated"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { CanvasView } from "../stores/organization/types";
	import { computed, onMounted, ref } from "vue";
	import ViewPermissionsModal from "./ViewPermissionsModal.vue";
	import ViewSettingsModal from "./ViewSettingsModal.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import UiBadge from "~/components/Ui/Badge.vue";

	// Props
	const props = defineProps<{
		organizationId: string
		projectId?: string
		currentUserId: string
		canvasPanelRef?: any
		userGroupIds?: string[]
		allNodes?: any[]
		savedCanvases: any[] // Canvases from useCanvasViews
		currentCanvasId?: string
	}>();

	// Emits
	const emit = defineEmits<{
		switchToOriginalPanel: []
		viewSwitched: [viewId: string]
		viewCreated: [view: any]
		viewUpdated: [view: any]
		viewDeleted: [viewId: string]
		loadCanvas: [canvasId: string]
	}>();

	// State
	const searchQuery = ref("");
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const showCreateViewModal = ref(false);
	const showPermissionsModal = ref(false);
	const showSettingsModal = ref(false);
	const selectedViewForPermissions = ref<CanvasView | null>(null);
	const selectedViewForSettings = ref<CanvasView | null>(null);

	// New view form
	const newViewName = ref("");
	const newViewDescription = ref("");
	const newViewIsPublic = ref(false);

	// Computed - Use savedCanvases filtered by PROJECT tag in description
	const filteredViews = computed(() => {
		let views = props.savedCanvases || [];

		console.log("🔍 ViewManagementPanel - filteredViews computed:");
		console.log("  Total saved canvases:", views.length);
		console.log("  Current projectId for filtering:", props.projectId);

		// FILTER BY PROJECT ID IN DESCRIPTION
		// Format: [PROJECT:69003e698f59f41739301809]
		if (props.projectId) {
			const projectTag = `[PROJECT:${props.projectId}]`;

			views = views.filter((v: any) => {
				const hasProjectTag = v.description?.includes(projectTag);

				if (!hasProjectTag && v.description) {
					console.log(`  ❌ Filtering out "${v.name}" - no project tag or different project`);
				}

				return hasProjectTag;
			});

			console.log(`  ✅ After project filter: ${views.length} canvases with tag [PROJECT:${props.projectId}]`);
		} else {
			console.log("  ⚠️ No projectId - showing all canvases");
		}

		// Search filter
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			views = views.filter((v: any) =>
				v.name?.toLowerCase().includes(query)
				|| v.description?.toLowerCase().includes(query)
			);
			console.log("  After search filter:", views.length);
		}

		console.log("  📊 Final views to display:", views.length);

		// If no views match the project filter, show ALL views as fallback (for testing/migration)
		if (views.length === 0 && props.savedCanvases.length > 0) {
			console.log("  ⚠️ No project-tagged views found, showing ALL views for this org");
			return props.savedCanvases
				.filter((v: any) => {
					const orgMatch = (v.meta?.organizationId || v.organizationId) === props.organizationId;
					return orgMatch;
				})
				.filter((v: any) => {
					if (!searchQuery.value) return true;
					const query = searchQuery.value.toLowerCase();
					return v.name?.toLowerCase().includes(query) || v.description?.toLowerCase().includes(query);
				});
		}

		return views;
	});

	// Methods
	const _handleSwitchToOriginalPanel = () => {
		emit("switchToOriginalPanel");
	};

	const getCurrentCanvasName = (): string => {
		const currentCanvas = props.savedCanvases.find((c: any) => c.id === props.currentCanvasId);
		return currentCanvas?.name || "Unknown Canvas";
	};

	const _getUserInitials = (_user: any): string => {
		const name = _user.name || _user.username || _user.email || "?";
		return name.substring(0, 2).toUpperCase();
	};

	const getViewUserCount = (view: any): number => {
		const permissions = view.meta?.permissions || view.permissions;
		if (!permissions) return 1;

		let count = 1; // Owner
		count += permissions.adminIds?.length || 0;
		count += permissions.userIds?.length || 0;
		return count;
	};

	const getViewNodeCount = (view: any): number => {
		// Count nodes in this canvas
		return view.nodes?.length || 0;
	};

	const _getAccessLevelBadge = (view: any): string => {
		const permissions = view.meta?.permissions || view.permissions;
		const isOwner = permissions?.ownerId === props.currentUserId;
		const isPublic = permissions?.isPublic;

		if (isOwner) return "Owner";
		if (isPublic) return "Public Access";
		return "Private";
	};

	const _canEditView = (view: any): boolean => {
		const permissions = view.meta?.permissions || view.permissions;
		const isOwner = permissions?.ownerId === props.currentUserId;
		const isAdmin = permissions?.adminIds?.includes(props.currentUserId);
		return isOwner || isAdmin;
	};

	const _canDeleteView = (view: any): boolean => {
		const permissions = view.meta?.permissions || view.permissions;
		return permissions?.ownerId === props.currentUserId;
	};

	const switchToView = (view: any) => {
		console.log("👁️ Switching to view:", view.name);

		// Set the view color overlay if the view has color settings
		if (props.canvasPanelRef?.setActiveViewColor) {
			const viewColor = view.meta?.color || view.color;
			const viewOpacity = view.meta?.opacity ?? view.opacity ?? 50;
			props.canvasPanelRef.setActiveViewColor(viewColor, viewOpacity);
			console.log("🎨 Applied view color:", { color: viewColor, opacity: viewOpacity });
		}

		emit("viewSwitched", view.id);
		emit("loadCanvas", view.id);
	};

	const createNewView = async () => {
		if (!newViewName.value.trim()) return;

		try {
			isLoading.value = true;

			// Use buttClient to create view (same as Canvas tab does)
			const { buttClient } = await import("@utils/buttClient");

			// Add project ID tag to description for filtering
			const baseDescription = newViewDescription.value.trim() || "Canvas view";
			const description = props.projectId
				? `${baseDescription} [PROJECT:${props.projectId}]`
				: baseDescription;

			// Create view data with organization context
			const viewData = {
				name: newViewName.value.trim(),
				description,
				meta: {
					organizationId: props.organizationId,
					projectId: props.projectId,
					isMaster: false,
					permissions: {
						ownerId: props.currentUserId,
						adminIds: [],
						userGroupIds: [],
						userIds: [],
						isPublic: newViewIsPublic.value,
						accessLevel: "read-write",
						allowFork: true
					},
					createdBy: props.currentUserId,
					// Default view appearance
					color: "#3b82f6",
					opacity: 50
				}
			};

			console.log("💾 Creating view with data:", viewData);
			console.log("  Description with project tag:", description);

			// Save to API (same method as Canvas tab)
			const savedView = await buttClient.createView(viewData);
			console.log("✅ View saved to API:", savedView);

			// Emit event to refresh canvas list
			emit("viewCreated", savedView);

			// Reset form
			newViewName.value = "";
			newViewDescription.value = "";
			newViewIsPublic.value = false;
			showCreateViewModal.value = false;

			console.log("✅ View created successfully with project tag");
		} catch (err) {
			console.error("❌ Failed to create view:", err);
			error.value = "Failed to create view";
		} finally {
			isLoading.value = false;
		}
	};

	const openPermissionsModal = (view: any) => {
		console.log("🛡️ Opening permissions modal for view:", view);
		selectedViewForPermissions.value = view as CanvasView;
		showPermissionsModal.value = true;
		console.log("✅ Permissions modal state:", { showing: showPermissionsModal.value, view: selectedViewForPermissions.value?.name });
	};

	const closePermissionsModal = () => {
		showPermissionsModal.value = false;
		selectedViewForPermissions.value = null;
	};

	const openViewSettings = (view: any) => {
		console.log("⚙️ Opening settings modal for view:", view);
		selectedViewForSettings.value = view as CanvasView;
		showSettingsModal.value = true;
		console.log("✅ Settings modal state:", { showing: showSettingsModal.value, view: selectedViewForSettings.value?.name });
	};

	const closeSettingsModal = () => {
		showSettingsModal.value = false;
		selectedViewForSettings.value = null;
	};

	/**
	 * Save view to API (integrates with backend)
	 */
	const saveViewToAPI = async (view: CanvasView) => {
		try {
			console.log("💾 Saving view to API:", view.name);

			// Use the existing buttClient to save view
			const { buttClient } = await import("@utils/buttClient");

			// Create view data for API
			const viewData = {
				name: view.name,
				description: view.description || "",
				meta: {
					organizationId: view.organizationId,
					isMaster: view.isMaster,
					visibleNodeIds: view.visibleNodeIds,
					hiddenNodeIds: view.hiddenNodeIds,
					viewportOverride: view.viewportOverride,
					permissions: view.permissions,
					createdBy: view.createdBy,
					parentViewId: view.parentViewId,
					color: view.color,
					opacity: view.opacity
				}
			};

			// Use existing view API or create new one
			const savedView = await buttClient.createView(viewData);

			console.log("✅ View saved to API:", savedView?.id);
			return savedView;
		} catch (err) {
			console.error("❌ Failed to save view to API:", err);
			throw err;
		}
	};

	/**
	 * Delete view from API
	 */
	const deleteViewFromAPI = async (viewId: string) => {
		try {
			const { buttClient } = await import("@utils/buttClient");
			await buttClient.deleteView(viewId);
			console.log("✅ View deleted from API");
		} catch (err) {
			console.error("❌ Failed to delete view from API:", err);
			throw err;
		}
	};

	const handlePermissionsUpdated = async (view: CanvasView) => {
		console.log("🔐 Permissions updated for view:", view.name);
		await saveViewToAPI(view);
		emit("viewUpdated", view);
		closePermissionsModal();
	};

	const handleViewUpdated = async (view: CanvasView) => {
		console.log("✏️ View updated:", view.name);
		await saveViewToAPI(view);

		// If this is the currently active view, update the canvas color overlay
		if (view.id === props.currentCanvasId && props.canvasPanelRef?.setActiveViewColor) {
			const viewColor = view.color;
			const viewOpacity = view.opacity ?? 50;
			props.canvasPanelRef.setActiveViewColor(viewColor, viewOpacity);
			console.log("🎨 Updated active view color:", { color: viewColor, opacity: viewOpacity });
		}

		emit("viewUpdated", view);
		closeSettingsModal();
	};

	const confirmDeleteView = async (view: any) => {
		// eslint-disable-next-line no-alert
		const confirmed = window.confirm(`Are you sure you want to delete the view "${view.name}"? This action cannot be undone.`);
		if (!confirmed) return;

		try {
			// Delete from API
			await deleteViewFromAPI(view.id);

			emit("viewDeleted", view.id);

			console.log("✅ View deleted:", view.name);
		} catch (err) {
			console.error("❌ Failed to delete view:", err);
			error.value = "Failed to delete view";
		}
	};

	// Note: Views are now loaded via savedCanvases prop (same as Canvas tab)
	// No need for separate loadViewsFromAPI function

	// Lifecycle
	onMounted(async () => {
		console.log("👁️ ViewManagementPanel mounted");
		console.log("  savedCanvases received:", props.savedCanvases?.length || 0);
		console.log("  organizationId:", props.organizationId);
		console.log("  projectId:", props.projectId);
	});
</script>

<style scoped>
.view-management-panel {
	background: rgba(0, 0, 0, 0.4);
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
	flex: 1;
}

.panel-title {
	font-size: 1rem;
	font-weight: 700;
	color: white;
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
}

.panel-subtitle {
	font-size: 0.8rem;
	color: rgba(255, 255, 255, 0.6);
}

.header-actions {
	display: flex;
	gap: 8px;
}

.create-view-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 14px;
	background: rgba(59, 130, 246, 0.15);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 8px;
	color: #3b82f6;
	font-size: 0.85rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}

.create-view-btn:hover {
	background: rgba(59, 130, 246, 0.25);
	border-color: rgba(59, 130, 246, 0.5);
}

.active-view-banner {
	padding: 12px 16px;
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1));
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.banner-content {
	display: flex;
	align-items: center;
	gap: 10px;
}

.banner-text {
	flex: 1;
	font-size: 0.9rem;
	font-weight: 600;
	color: white;
}

.search-section {
	padding: 12px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.search-icon {
	position: absolute;
	left: 10px;
	width: 16px;
	height: 16px;
	color: rgba(255, 255, 255, 0.4);
}

.search-input {
	width: 100%;
	padding: 8px 32px 8px 36px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: white;
	font-size: 0.85rem;
}

.search-input::placeholder {
	color: rgba(255, 255, 255, 0.3);
}

.search-input:focus {
	outline: none;
	border-color: rgba(59, 130, 246, 0.4);
}

.clear-search-button {
	position: absolute;
	right: 8px;
	padding: 4px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
}

.clear-search-button:hover {
	background: rgba(255, 255, 255, 0.1);
}

.panel-content {
	flex: 1;
	overflow-y: auto;
	padding: 12px;
}

.loading-state,
.error-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
}

.views-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.view-item {
	padding: 14px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.05);
	border-radius: 10px;
	transition: all 0.2s;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
}

.view-item:hover {
	background: rgba(0, 0, 0, 0.4);
	border-color: rgba(255, 255, 255, 0.1);
}

.view-item.active {
	border-color: rgba(59, 130, 246, 0.4);
	background: rgba(59, 130, 246, 0.1);
}

.view-item.master {
	border-color: rgba(34, 197, 94, 0.3);
	background: rgba(34, 197, 94, 0.05);
}

.view-info {
	flex: 1;
	min-width: 0;
}

.view-header-row {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	margin-bottom: 8px;
}

.view-icon {
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
}

.view-name-section {
	flex: 1;
	min-width: 0;
}

.view-name {
	font-size: 0.9rem;
	font-weight: 600;
	color: white;
	margin-bottom: 2px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.view-description {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.view-stats {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.6);
}

.view-actions {
	display: flex;
	gap: 6px;
	flex-shrink: 0;
}

.action-btn {
	padding: 8px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.2);
}

.action-btn.switch-btn {
	color: #3b82f6;
	border-color: rgba(59, 130, 246, 0.3);
}

.action-btn.switch-btn:hover {
	background: rgba(59, 130, 246, 0.15);
}

.action-btn.edit-btn {
	color: #a855f7;
	border-color: rgba(168, 85, 247, 0.3);
}

.action-btn.edit-btn:hover {
	background: rgba(168, 85, 247, 0.15);
}

.action-btn.settings-btn {
	color: #8b5cf6;
	border-color: rgba(139, 92, 246, 0.3);
}

.action-btn.settings-btn:hover {
	background: rgba(139, 92, 246, 0.15);
}

.action-btn.delete-btn {
	color: #ef4444;
	border-color: rgba(239, 68, 68, 0.3);
}

.action-btn.delete-btn:hover {
	background: rgba(239, 68, 68, 0.15);
}
</style>

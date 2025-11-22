<template>
	<Teleport to="body">
		<div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
			<!-- Backdrop -->
			<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

			<!-- Modal Content -->
			<div class="relative w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
				<div class="glassmorphic-panel border border-primary/20 rounded-xl flex flex-col max-h-[80vh]">
					<!-- Header -->
					<div class="p-6 border-b border-white/10">
						<div class="flex items-center gap-3 mb-2">
							<UIcon name="i-lucide-shield" class="size-6 text-primary" />
							<h3 class="text-lg font-semibold text-white">
								Manage View Permissions
							</h3>
						</div>
						<p class="text-sm text-white/60">
							Control who can access "{{ view.name }}"
						</p>
					</div>

					<!-- Content -->
					<div class="flex-1 overflow-y-auto p-6 space-y-6">
						<!-- Public Access Toggle -->
						<div class="glassmorphic-panel p-4 border border-white/10 rounded-lg">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<UIcon
											:name="localView.permissions.isPublic ? 'i-lucide-globe' : 'i-lucide-lock'"
											class="size-5"
											:class="localView.permissions.isPublic ? 'text-green-400' : 'text-yellow-400'"
										/>
										<h4 class="font-semibold text-white">
											{{ localView.permissions.isPublic ? 'Public View' : 'Private View' }}
										</h4>
									</div>
									<p class="text-sm text-white/60">
										{{
											localView.permissions.isPublic
												? 'All organization members can view this canvas'
												: 'Only specified users can access this canvas'
										}}
									</p>
								</div>
								<button
									class="ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
									:class="
										localView.permissions.isPublic
											? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
											: 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
									"
									@click="togglePublic"
								>
									{{ localView.permissions.isPublic ? 'Make Private' : 'Make Public' }}
								</button>
							</div>
						</div>

						<!-- User List with Permissions -->
						<div class="glassmorphic-panel p-4 border border-white/10 rounded-lg">
							<div class="flex items-center justify-between mb-4">
								<h4 class="font-semibold text-white flex items-center gap-2">
									<UIcon name="i-lucide-users" class="size-5" />
									User Access
								</h4>
								<button
									class="px-3 py-1.5 bg-primary/20 text-primary text-sm rounded-lg border border-primary/30 hover:bg-primary/30 transition-all"
									@click="showUserSelector = !showUserSelector"
								>
									<UIcon name="i-lucide-user-plus" class="size-4 mr-1" />
									Add User
								</button>
							</div>

							<!-- User Selector -->
							<div v-if="showUserSelector" class="mb-4 p-3 bg-black/30 rounded-lg border border-white/10">
								<div class="mb-3">
									<input
										v-model="userSearchQuery"
										type="text"
										placeholder="Search organization users..."
										class="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-primary/50 focus:outline-none"
									>
								</div>
								<div class="space-y-2 max-h-48 overflow-y-auto">
									<div
										v-for="user in filteredAvailableUsers"
										:key="user.id"
										class="flex items-center justify-between p-2 bg-black/20 rounded-lg hover:bg-black/40 transition-all cursor-pointer"
										@click="addUser(user)"
									>
										<div class="flex items-center gap-3">
											<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
												{{ getUserInitials(user) }}
											</div>
											<div>
												<div class="text-sm font-medium text-white">
													{{ user.name || user.username }}
												</div>
												<div class="text-xs text-white/50">
													{{ user.email }}
												</div>
											</div>
										</div>
										<UIcon name="i-lucide-plus" class="size-4 text-primary" />
									</div>
								</div>
								<div v-if="filteredAvailableUsers.length === 0" class="text-center py-4 text-sm text-white/50">
									No users found
								</div>
							</div>

							<!-- Assigned Users List -->
							<div class="space-y-3">
								<!-- Owner -->
								<div class="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">
											{{ getUserInitials(getOwnerUser()) }}
										</div>
										<div>
											<div class="text-sm font-medium text-white">
												{{ getOwnerUser()?.name || 'Owner' }}
											</div>
											<div class="text-xs text-white/50">
												{{ getOwnerUser()?.email || 'owner@example.com' }}
											</div>
										</div>
									</div>
									<UBadge color="green" variant="subtle">
										Owner
									</UBadge>
								</div>

								<!-- Admins -->
								<div
									v-for="userId in localView.permissions.adminIds"
									:key="userId"
									class="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
								>
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
											{{ getUserInitials(getUserById(userId)) }}
										</div>
										<div>
											<div class="text-sm font-medium text-white">
												{{ getUserById(userId)?.name || 'Admin User' }}
											</div>
											<div class="text-xs text-white/50">
												{{ getUserById(userId)?.email || 'admin@example.com' }}
											</div>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<UBadge color="purple" variant="subtle">
											Admin
										</UBadge>
										<button
											class="p-1 hover:bg-red-500/20 rounded transition-all"
											@click="demoteAdmin(userId)"
										>
											<UIcon name="i-lucide-arrow-down" class="size-4 text-white/50" />
										</button>
										<button
											class="p-1 hover:bg-red-500/20 rounded transition-all"
											@click="removeUser(userId)"
										>
											<UIcon name="i-lucide-x" class="size-4 text-red-400" />
										</button>
									</div>
								</div>

								<!-- Regular Users -->
								<div
									v-for="userId in localView.permissions.userIds"
									:key="userId"
									class="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
								>
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
											{{ getUserInitials(getUserById(userId)) }}
										</div>
										<div>
											<div class="text-sm font-medium text-white">
												{{ getUserById(userId)?.name || 'User' }}
											</div>
											<div class="text-xs text-white/50">
												{{ getUserById(userId)?.email || 'user@example.com' }}
											</div>
										</div>
									</div>
									<div class="flex items-center gap-2">
										<UBadge color="blue" variant="subtle">
											User
										</UBadge>
										<button
											class="p-1 hover:bg-purple-500/20 rounded transition-all"
											title="Promote to Admin"
											@click="promoteToAdmin(userId)"
										>
											<UIcon name="i-lucide-arrow-up" class="size-4 text-white/50" />
										</button>
										<button
											class="p-1 hover:bg-red-500/20 rounded transition-all"
											@click="removeUser(userId)"
										>
											<UIcon name="i-lucide-x" class="size-4 text-red-400" />
										</button>
									</div>
								</div>

								<!-- Empty State -->
								<div v-if="localView.permissions.adminIds.length === 0 && localView.permissions.userIds.length === 0" class="text-center py-8 text-sm text-white/50">
									<UIcon name="i-lucide-user-x" class="size-12 mx-auto mb-2 text-white/20" />
									<p>No users assigned yet</p>
									<p class="text-xs mt-1">
										Click "Add User" to grant access
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Footer -->
					<div class="p-6 border-t border-white/10 flex items-center justify-end gap-3">
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
							@click="savePermissions"
						>
							<UIcon name="i-lucide-save" class="size-4 mr-2" />
							Save Permissions
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import type { CanvasView } from "../stores/organization/types";
	import { buttClient } from "@utils/buttClient";
	import { computed, onMounted, ref } from "vue";
	import { grantUserAccess, promoteToAdmin as promoteUserToAdmin, revokeUserAccess, togglePublicAccess } from "../stores/organization/useViewPermissions";

	// Props
	const props = defineProps<{
		view: CanvasView
		organizationId: string
		projectId?: string
		show?: boolean
	}>();

	// Emits
	const emit = defineEmits<{
		close: []
		permissionsUpdated: [view: CanvasView]
	}>();

	// State - Ensure permissions structure exists
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
		}
	});
	const showUserSelector = ref(false);
	const userSearchQuery = ref("");
	const organizationUsers = ref<any[]>([]);
	const isLoadingUsers = ref(false);

	// Computed
	const assignedUserIds = computed(() => {
		return new Set([
			localView.value.permissions.ownerId,
			...localView.value.permissions.adminIds,
			...localView.value.permissions.userIds
		]);
	});

	const filteredAvailableUsers = computed(() => {
		let users = organizationUsers.value.filter((u) => !assignedUserIds.value.has(u.id));

		if (userSearchQuery.value) {
			const query = userSearchQuery.value.toLowerCase();
			users = users.filter((u) =>
				u.name?.toLowerCase().includes(query)
				|| u.email?.toLowerCase().includes(query)
				|| u.username?.toLowerCase().includes(query)
			);
		}

		return users;
	});

	// Methods
	const getUserInitials = (user: any): string => {
		if (!user) return "?";
		const name = user.name || user.username || user.email || "?";
		return name.substring(0, 2).toUpperCase();
	};

	const getUserById = (userId: string) => {
		return organizationUsers.value.find((u) => u.id === userId);
	};

	const getOwnerUser = () => {
		return getUserById(localView.value.permissions.ownerId);
	};

	const togglePublic = () => {
		localView.value.permissions = togglePublicAccess(localView.value.permissions);
	};

	const addUser = (user: any) => {
		localView.value.permissions = grantUserAccess(localView.value.permissions, user.id);
		showUserSelector.value = false;
		userSearchQuery.value = "";
	};

	const removeUser = (userId: string) => {
		localView.value.permissions = revokeUserAccess(localView.value.permissions, userId);
	};

	const promoteToAdmin = (userId: string) => {
		localView.value.permissions = promoteUserToAdmin(localView.value.permissions, userId);
	};

	const demoteAdmin = (userId: string) => {
		// Remove from admins, add to regular users
		const admins = [...localView.value.permissions.adminIds];
		const adminIndex = admins.indexOf(userId);
		if (adminIndex > -1) {
			admins.splice(adminIndex, 1);
		}

		localView.value.permissions = {
			...localView.value.permissions,
			adminIds: admins,
			userIds: [...localView.value.permissions.userIds, userId]
		};
	};

	const savePermissions = () => {
		emit("permissionsUpdated", localView.value);
	};

	const loadOrganizationUsers = async () => {
		try {
			isLoadingUsers.value = true;

			console.log("📂 Loading organization users for:", props.organizationId);

			// Get organization
			const org = await buttClient.findByIdOrganisation(props.organizationId);
			const memberIds = org?.owners || [];

			organizationUsers.value = [];

			// Load user details
			if (Array.isArray(memberIds)) {
				for (const id of memberIds) {
					try {
						const user = await (buttClient as any).getUserUser?.(id) || {
							id,
							email: `user-${id}@example.com`,
							name: `User ${id}`
						};
						organizationUsers.value.push({
							id,
							email: user.email,
							name: user.name,
							username: user.username,
							role: "member"
						});
					} catch (userError) {
						console.warn("Failed to fetch user:", id, userError);
					}
				}
			}

			console.log("✅ Loaded", organizationUsers.value.length, "users");
		} catch (err) {
			console.error("❌ Failed to load organization users:", err);
		} finally {
			isLoadingUsers.value = false;
		}
	};

	// Lifecycle
	onMounted(async () => {
		await loadOrganizationUsers();
	});
</script>

<style scoped>
.glassmorphic-panel {
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
	backdrop-filter: blur(20px);
}
</style>

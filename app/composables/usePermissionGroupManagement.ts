import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";
import type { PermissionGroup, CreatePermissionGroupData, UpdatePermissionGroupData } from "./types/permissions.types";

export const usePermissionGroupManagement = () => {
	// State
	const permissionGroups = ref<PermissionGroup[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);
	const success = ref<string | null>(null);
	
	// AbortController for cancelling previous requests
	let currentAbortController: AbortController | null = null;

	// Computed
	const hasPermissionGroups = computed(() => permissionGroups.value.length > 0);
	const activePermissionGroups = computed(() => permissionGroups.value.filter((group) => !group.deletedAt));

	const permissionGroupOptions = computed(() =>
		activePermissionGroups.value.map((group) => ({
			value: group.butt,
			label: group.name,
			description: group.description,
			permissionCount: group.permissions?.length || 0
		}))
	);


	// Methods
	const fetchPermissionGroups = async (retryCount = 0): Promise<void> => {
		// Cancel any previous request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController for this request
		currentAbortController = new AbortController();

		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Fetching all permission groups from API... (attempt", retryCount + 1, ")");
			const data = await buttClient.getAllPermissionGroups();
			console.log("✅ Permission groups fetched successfully:", data);

			// The API returns an array of PermissionGroup objects directly
			permissionGroups.value = Array.isArray(data) ? data : [];
			success.value = "Permission groups fetched successfully";
			console.log("✅ Final permission groups count:", permissionGroups.value.length);
		} catch (err: any) {
			console.error("❌ Error fetching permission groups:", err);

			if (err.name === "AbortError") {
				console.log("Permission groups request was cancelled");
				return;
			}

			// Retry for other errors
			if (retryCount < 2) {
				const delay = 2 ** retryCount * 1000;
				setTimeout(() => {
					fetchPermissionGroups(retryCount + 1);
				}, delay);
				return;
			}

			// Set empty array if API fails after retries
			permissionGroups.value = [];
			error.value = "Failed to fetch permission groups";
		} finally {
			loading.value = false;
			currentAbortController = null;
		}
	};

	const getPermissionGroup = async (id: string): Promise<PermissionGroup | null> => {
		try {
			const data = await buttClient.getPermissionGroup(id);
			return data as PermissionGroup || null;
		} catch (err: any) {
			console.error("Error fetching permission group:", err);
			return null;
		}
	};

	const createPermissionGroup = async (groupData: CreatePermissionGroupData): Promise<PermissionGroup> => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Creating permission group with data:", groupData);

			// Validate required fields
			const validatedData = {
				name: groupData.name?.trim(),
				description: groupData.description?.trim(),
				butt: groupData.butt?.trim(),
				permissions: groupData.permissions || []
			};

			// Check for empty or missing fields
			if (!validatedData.name) {
				throw new Error("Permission group name is required");
			}
			if (!validatedData.description) {
				throw new Error("Permission group description is required");
			}
			if (!validatedData.butt) {
				throw new Error("Permission group butt is required");
			}

			// Check for duplicate butt
			const existingGroup = permissionGroups.value.find(g => g.butt === validatedData.butt);
			if (existingGroup) {
				throw new Error(`Permission group with butt "${validatedData.butt}" already exists`);
			}

			console.log("✅ Validation passed, calling API...");

			const data = await buttClient.createPermissionGroup(validatedData);
			console.log("✅ Permission group created successfully:", data);

			// Use the API response directly as it should contain the complete PermissionGroup object
			const newGroup = data as PermissionGroup;
			
			// Add to local state
			permissionGroups.value.push(newGroup);
			success.value = "Permission group created successfully";

			return newGroup;
		} catch (err: any) {
			console.error("Error creating permission group:", err);
			error.value = err?.message || "Failed to create permission group";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const updatePermissionGroup = async (id: string, updateData: UpdatePermissionGroupData): Promise<PermissionGroup> => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Updating permission group with data:", { id, updateData });

			const data = await buttClient.updatePermissionGroup(id, updateData);
			console.log("✅ Permission group updated successfully:", data);

			// Update local state
			const index = permissionGroups.value.findIndex(g => g.id === id);
			if (index !== -1) {
				permissionGroups.value[index] = { 
					...permissionGroups.value[index], 
					...updateData, 
					updatedAt: new Date().toISOString() 
				};
			}

			success.value = "Permission group updated successfully";
			return data as PermissionGroup;
		} catch (err: any) {
			console.error("Error updating permission group:", err);
			error.value = err?.message || "Failed to update permission group";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const deletePermissionGroup = async (id: string): Promise<boolean> => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Deleting permission group:", id);

			await buttClient.deletePermissionGroup(id);
			console.log("✅ Permission group deleted successfully");

			// Update local state
			const index = permissionGroups.value.findIndex(g => g.id === id);
			if (index !== -1) {
				permissionGroups.value[index].deletedAt = new Date().toISOString();
			}

			success.value = "Permission group deleted successfully";
			return true;
		} catch (err: any) {
			console.error("Error deleting permission group:", err);
			error.value = err?.message || "Failed to delete permission group";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Permission Group-Permission Assignment Methods
	const addPermissionsToGroup = async (groupId: string, permissionIds: string[]) => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🎯 Adding permissions to group:", { groupId, permissionIds });
			await buttClient.addPermissionsToGroup(groupId, { permissionIds });
			
			// Update local state
			const group = permissionGroups.value.find(g => g.id === groupId);
			if (group) {
				group.permissions = [...(group.permissions || []), ...permissionIds];
				group.updatedAt = new Date().toISOString();
			}

			console.log("✅ Permissions added to group successfully");
			return true;
		} catch (err: any) {
			console.error("Error adding permissions to group:", err);
			error.value = err?.message || "Failed to add permissions to group";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const removePermissionsFromGroup = async (groupId: string, permissionIds: string[]) => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🎯 Removing permissions from group:", { groupId, permissionIds });
			await buttClient.removePermissionsFromGroup(groupId, { permissionIds });
			
			// Update local state
			const group = permissionGroups.value.find(g => g.id === groupId);
			if (group) {
				group.permissions = (group.permissions || []).filter(id => !permissionIds.includes(id));
				group.updatedAt = new Date().toISOString();
			}

			console.log("✅ Permissions removed from group successfully");
			return true;
		} catch (err: any) {
			console.error("Error removing permissions from group:", err);
			error.value = err?.message || "Failed to remove permissions from group";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const getGroupPermissions = async (groupId: string) => {
		try {
			console.log("🎯 Getting permissions for group:", groupId);
			const data = await buttClient.getGroupPermissions(groupId);
			return Array.isArray(data) ? data : [];
		} catch (err: any) {
			console.error("Error getting group permissions:", err);
			throw err;
		}
	};

	// Cleanup function
	const cleanup = () => {
		if (currentAbortController) {
			currentAbortController.abort();
			currentAbortController = null;
		}
	};

	return {
		// State
		permissionGroups,
		loading,
		error,
		success,

		// Computed
		hasPermissionGroups,
		activePermissionGroups,
		permissionGroupOptions,

		// Methods
		fetchPermissionGroups,
		getPermissionGroup,
		createPermissionGroup,
		updatePermissionGroup,
		deletePermissionGroup,
		addPermissionsToGroup,
		removePermissionsFromGroup,
		getGroupPermissions,
		cleanup
	};
};
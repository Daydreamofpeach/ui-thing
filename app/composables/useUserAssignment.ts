import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";
import type { User, PermissionGroup } from "./types/permissions.types";

export const useUserAssignment = () => {
	// State
	const users = ref<User[]>([]);
	const selectedUser = ref<User | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);
	const success = ref<string | null>(null);
	
	// AbortController for cancelling previous requests
	let currentAbortController: AbortController | null = null;

	// Computed
	const isUserSelected = computed(() => !!selectedUser.value);
	const selectedUserRole = computed(() => selectedUser.value?.role);
	const selectedUserPermissionGroups = computed(() => selectedUser.value?.permissionGroups || []);

	const userOptions = computed(() =>
		users.value.map((user) => ({
			value: user.id,
			label: user.name,
			description: user.email,
			role: user.role?.name || "No role"
		}))
	);

	// Methods
	const fetchUsers = async (): Promise<void> => {
		// Cancel any previous request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController for this request
		currentAbortController = new AbortController();

		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Fetching users from API...");
			const data = await buttClient.getAllUsers();
			console.log("✅ Users fetched successfully:", data);
			
			// Handle different possible response structures
			let usersArray = [];
			if (Array.isArray(data)) {
				usersArray = data;
			} else if (data && Array.isArray(data.data)) {
				usersArray = data.data;
			} else if (data && Array.isArray(data.users)) {
				usersArray = data.users;
			} else if (data && data.results && Array.isArray(data.results)) {
				usersArray = data.results;
			}
			
			users.value = usersArray;
			console.log("👤 Final users count:", users.value.length);
		} catch (err: any) {
			// Don't show error for aborted requests
			if (err.name === 'AbortError') {
				console.log("Users request was cancelled");
				return;
			}
			console.error("❌ Error fetching users:", err);
			error.value = err?.message || "Failed to fetch users";
			users.value = [];
		} finally {
			loading.value = false;
			currentAbortController = null;
		}
	};

	const getUser = async (id: string): Promise<User | null> => {
		try {
			const data = await buttClient.getUserUser(id);
			return data as User || null;
		} catch (err: any) {
			console.error("Error fetching user:", err);
			return null;
		}
	};

	const selectUser = (user: User) => {
		selectedUser.value = user;
		error.value = null;
		success.value = null;
	};

	const clearSelection = () => {
		selectedUser.value = null;
		error.value = null;
		success.value = null;
	};

	const assignRoleToUser = async (userId: string, roleId: string) => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Assigning role to user:", { userId, roleId });
			// This would need to be implemented based on your API
			// await buttClient.assignRoleToUser(userId, roleId);
			
			// Update local state
			const user = users.value.find(u => u.id === userId);
			if (user) {
				// This would need to be updated based on your actual role structure
				user.role = {
					id: roleId,
					name: "Assigned Role", // This should come from the API response
					butt: roleId,
					type: "ASSIGNED"
				};
				user.updatedAt = new Date().toISOString();
			}

			success.value = "Role assigned to user successfully";
			console.log("✅ Role assigned to user successfully");
			return true;
		} catch (err: any) {
			console.error("Error assigning role to user:", err);
			error.value = err?.message || "Failed to assign role to user";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const removeRoleFromUser = async (userId: string) => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Removing role from user:", userId);
			// This would need to be implemented based on your API
			// await buttClient.removeRoleFromUser(userId);
			
			// Update local state
			const user = users.value.find(u => u.id === userId);
			if (user) {
				user.role = undefined;
				user.updatedAt = new Date().toISOString();
			}

			success.value = "Role removed from user successfully";
			console.log("✅ Role removed from user successfully");
			return true;
		} catch (err: any) {
			console.error("Error removing role from user:", err);
			error.value = err?.message || "Failed to remove role from user";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const assignPermissionGroupsToUser = async (userId: string, permissionGroupIds: string[]) => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Assigning permission groups to user:", { userId, permissionGroupIds });
			// This would need to be implemented based on your API
			// await buttClient.assignPermissionGroupsToUser(userId, permissionGroupIds);
			
			// Update local state
			const user = users.value.find(u => u.id === userId);
			if (user) {
				user.permissionGroups = [...(user.permissionGroups || []), ...permissionGroupIds];
				user.updatedAt = new Date().toISOString();
			}

			success.value = "Permission groups assigned to user successfully";
			console.log("✅ Permission groups assigned to user successfully");
			return true;
		} catch (err: any) {
			console.error("Error assigning permission groups to user:", err);
			error.value = err?.message || "Failed to assign permission groups to user";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const removePermissionGroupsFromUser = async (userId: string, permissionGroupIds: string[]) => {
		loading.value = true;
		error.value = null;
		success.value = null;

		try {
			console.log("🎯 Removing permission groups from user:", { userId, permissionGroupIds });
			// This would need to be implemented based on your API
			// await buttClient.removePermissionGroupsFromUser(userId, permissionGroupIds);
			
			// Update local state
			const user = users.value.find(u => u.id === userId);
			if (user) {
				user.permissionGroups = (user.permissionGroups || []).filter(id => !permissionGroupIds.includes(id));
				user.updatedAt = new Date().toISOString();
			}

			success.value = "Permission groups removed from user successfully";
			console.log("✅ Permission groups removed from user successfully");
			return true;
		} catch (err: any) {
			console.error("Error removing permission groups from user:", err);
			error.value = err?.message || "Failed to remove permission groups from user";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const getUserPermissions = async (userId: string) => {
		try {
			console.log("🎯 Getting permissions for user:", userId);
			// This would need to be implemented based on your API
			// const data = await buttClient.getUserPermissions(userId);
			// return data;
			
			const user = users.value.find(u => u.id === userId);
			return user?.permissionGroups || [];
		} catch (err: any) {
			console.error("Error getting user permissions:", err);
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
		users,
		selectedUser,
		loading,
		error,
		success,

		// Computed
		isUserSelected,
		selectedUserRole,
		selectedUserPermissionGroups,
		userOptions,

		// Methods
		fetchUsers,
		getUser,
		selectUser,
		clearSelection,
		assignRoleToUser,
		removeRoleFromUser,
		assignPermissionGroupsToUser,
		removePermissionGroupsFromUser,
		getUserPermissions,
		cleanup
	};
};
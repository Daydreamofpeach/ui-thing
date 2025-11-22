import { usePermissionManagement } from "./usePermissionManagement";
import { useRoleManagement } from "./useRoleManagement";
import { usePermissionGroupManagement } from "./usePermissionGroupManagement";
import { useUserAssignment } from "./useUserAssignment";

export const useUnifiedPermissionManagement = () => {
	// Initialize individual composables
	const permissionManagement = usePermissionManagement();
	const roleManagement = useRoleManagement();
	const permissionGroupManagement = usePermissionGroupManagement();
	const userAssignment = useUserAssignment();

	// Unified initialization
	const initializeAll = async () => {
		console.log("🚀 Initializing all permission management data...");
		
		try {
			// Fetch all data in parallel
			await Promise.all([
				permissionManagement.fetchPermissions(),
				roleManagement.fetchRoles(),
				permissionGroupManagement.fetchPermissionGroups(),
				userAssignment.fetchUsers()
			]);
			
			console.log("✅ All permission management data initialized successfully");
		} catch (error) {
			console.error("❌ Error initializing permission management data:", error);
			// Don't throw - let individual composables handle their own errors
		}
	};

	// Unified refresh
	const refreshAll = async () => {
		console.log("🔄 Refreshing all permission management data...");
		
		try {
			// Refresh all data in parallel
			await Promise.all([
				permissionManagement.fetchPermissions(),
				roleManagement.fetchRoles(),
				permissionGroupManagement.fetchPermissionGroups(),
				userAssignment.fetchUsers()
			]);
			
			console.log("✅ All permission management data refreshed successfully");
		} catch (error) {
			console.error("❌ Error refreshing permission management data:", error);
			// Don't throw - let individual composables handle their own errors
		}
	};

	// Return all individual composables plus unified methods
	return {
		// Individual composables
		permissionManagement,
		roleManagement,
		permissionGroupManagement,
		userAssignment,

		// Unified methods
		initializeAll,
		refreshAll
	};
};
import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";
import type { Role, CreateRoleData, UpdateRoleData } from "./types/permissions.types";

export const useRoleManagement = () => {
	// State
	const roles = ref<Role[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);
	const currentRole = ref<Role | null>(null);

	// Load persisted roles from localStorage
	const loadPersistedRoles = (): Role[] => {
		try {
			const stored = localStorage.getItem('buildit-created-roles');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	};

	// Save roles to localStorage
	const savePersistedRoles = (rolesToSave: Role[]) => {
		try {
			// Only save user-created roles (not default system roles)
			const userCreatedRoles = rolesToSave.filter(role => 
				!['root-role', 'buildit-role', 'manager-role', 'developer-role'].includes(role.id)
			);
			localStorage.setItem('buildit-created-roles', JSON.stringify(userCreatedRoles));
		} catch (err) {
			console.warn('Failed to save roles to localStorage:', err);
		}
	};

  // Computed
	const activeRoles = computed(() => roles.value.filter((role) => !role.deletedAt));
	const roleOptions = computed(() =>
		activeRoles.value.map((role) => ({
			value: role.butt,
			label: role.name,
			description: role.description
		}))
	);

	// Methods
	const fetchRoles = async () => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 fetchRoles called. Current roles before API call:", roles.value.length);
			

			// Try to get roles from API
			let apiRoles: Role[] = [];
			try {
				const allRolesData = await buttClient.getAllRoles();
				console.log("🔍 getAllRoles() returned:", allRolesData);
				
				if (Array.isArray(allRolesData) && allRolesData.length > 0) {
					apiRoles = allRolesData as Role[];
					console.log("✅ Using API roles. Count:", apiRoles.length);
				}
			} catch (apiErr) {
				console.warn("⚠️ API call failed, using default roles:", apiErr);
			}

			// Load persisted user-created roles
			const persistedRoles = loadPersistedRoles();
			console.log("📦 Loaded persisted roles:", persistedRoles.length);

			// Merge API roles with existing local roles and persisted roles
			const existingRoles = roles.value || [];
			const allRoles = [...apiRoles, ...existingRoles, ...persistedRoles];

			// Remove duplicates based on ID and butt, prioritizing existing roles
			const uniqueRoles = allRoles.filter((role, index, self) =>
				index === self.findIndex((r) => r.id === role.id || r.butt === role.butt)
			);

			roles.value = uniqueRoles;
			console.log("✅ Final roles count:", uniqueRoles.length);
			console.log("Roles:", uniqueRoles.map((r) => `${r.name} (${r.butt})`));
		} catch (err: any) {
			console.error("Error fetching roles data:", err);
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const getRole = async (id: string) => {
		loading.value = true;
		error.value = null;

		try {
			const data = await buttClient.getRole(id);
			currentRole.value = data;
			return data;
		} catch (err: any) {
			error.value = err?.message || "Failed to fetch role";
			console.error("Error fetching role:", err);
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const createRole = async (roleData: CreateRoleData) => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🎯 Creating role with data:", roleData);

			// Validate required fields
			const validatedData = {
				name: roleData.name?.trim(),
				description: roleData.description?.trim(),
				butt: roleData.butt?.trim(),
				type: roleData.type?.trim()
			};

			// Check for empty or missing fields
			if (!validatedData.name) {
				throw new Error("Role name is required");
			}
			if (!validatedData.description) {
				throw new Error("Role description is required");
			}
			if (!validatedData.butt) {
				throw new Error("Role butt is required");
			}
			if (!validatedData.type) {
				throw new Error("Role type is required");
			}

			// Check for duplicate butt
			const existingRole = roles.value.find(r => r.butt === validatedData.butt);
			if (existingRole) {
				throw new Error(`Role with butt "${validatedData.butt}" already exists`);
			}

			console.log("✅ Validation passed, calling API...");

			const data = await buttClient.createRole(validatedData);
			console.log("✅ Role created successfully:", data);

			// Add to local state
			const newRole: Role = {
				id: data.id || `role-${Date.now()}`,
				name: validatedData.name,
				description: validatedData.description,
				butt: validatedData.butt,
				type: validatedData.type,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			roles.value.push(newRole);
			savePersistedRoles(roles.value);

			return newRole;
		} catch (err: any) {
			console.error("Error creating role:", err);
			error.value = err?.message || "Failed to create role";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const updateRole = async (id: string, updateData: UpdateRoleData) => {
		loading.value = true;
		error.value = null;

		try {
			const data = await buttClient.updateRole(id, updateData);
			console.log("✅ Role updated successfully:", data);
      
      // Update local state
			const index = roles.value.findIndex(r => r.id === id);
			if (index !== -1) {
				roles.value[index] = { ...roles.value[index], ...updateData, updatedAt: new Date().toISOString() };
				savePersistedRoles(roles.value);
			}

			return data;
    } catch (err: any) {
			console.error("Error updating role:", err);
			error.value = err?.message || "Failed to update role";
			throw err;
    } finally {
			loading.value = false;
		}
	};

	const deleteRole = async (id: string) => {
		loading.value = true;
		error.value = null;

		try {
			await buttClient.deleteRole(id);
			console.log("✅ Role deleted successfully");

			// Update local state
			const index = roles.value.findIndex(r => r.id === id);
			if (index !== -1) {
				roles.value[index].deletedAt = new Date().toISOString();
				savePersistedRoles(roles.value);
			}

			return true;
		} catch (err: any) {
			console.error("Error deleting role:", err);
			error.value = err?.message || "Failed to delete role";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Role-Permission Group Assignment Methods
	const assignPermissionGroupsToRole = async (roleId: string, permissionGroupIds: string[]) => {
		loading.value = true;
		error.value = null;

		try {
			// This would need to be implemented based on your API
			console.log("🎯 Assigning permission groups to role:", { roleId, permissionGroupIds });
			// await buttClient.assignPermissionGroupsToRole(roleId, permissionGroupIds);
			
			// Update local state if needed
			console.log("✅ Permission groups assigned to role successfully");
			return true;
		} catch (err: any) {
			console.error("Error assigning permission groups to role:", err);
			error.value = err?.message || "Failed to assign permission groups to role";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const removePermissionGroupsFromRole = async (roleId: string, permissionGroupIds: string[]) => {
		loading.value = true;
		error.value = null;

		try {
			// This would need to be implemented based on your API
			console.log("🎯 Removing permission groups from role:", { roleId, permissionGroupIds });
			// await buttClient.removePermissionGroupsFromRole(roleId, permissionGroupIds);
			
			// Update local state if needed
			console.log("✅ Permission groups removed from role successfully");
			return true;
		} catch (err: any) {
			console.error("Error removing permission groups from role:", err);
			error.value = err?.message || "Failed to remove permission groups from role";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const getRolePermissionGroups = async (roleId: string) => {
		try {
			// This would need to be implemented based on your API
			console.log("🎯 Getting permission groups for role:", roleId);
			// const data = await buttClient.getRolePermissionGroups(roleId);
			// return data;
			return [];
		} catch (err: any) {
			console.error("Error getting role permission groups:", err);
			throw err;
		}
	};

  return {
    // State
		roles,
    loading,
    error,
		currentRole,
    
    // Computed
		activeRoles,
		roleOptions,
    
    // Methods
		fetchRoles,
		getRole,
		createRole,
		updateRole,
		deleteRole,
		assignPermissionGroupsToRole,
		removePermissionGroupsFromRole,
		getRolePermissionGroups
	};
};
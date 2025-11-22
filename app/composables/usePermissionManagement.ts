import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";
import type { Permission, CreatePermissionData, UpdatePermissionData } from "./types/permissions.types";

export const usePermissionManagement = () => {
	// State
	const permissions = ref<Permission[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);
	const currentPermission = ref<Permission | null>(null);

	// Load persisted permissions from localStorage
	const loadPersistedPermissions = (): Permission[] => {
		try {
			const stored = localStorage.getItem("buildit-created-permissions");
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	};

	// Save permissions to localStorage
	const savePersistedPermissions = (permissionsToSave: Permission[]) => {
		try {
			// Only save user-created permissions (not default system permissions)
			const userCreatedPermissions = permissionsToSave.filter((permission) =>
				!["read-users", "write-users", "delete-users", "read-projects", "write-projects", "delete-projects"].includes(permission.butt)
			);
			localStorage.setItem("buildit-created-permissions", JSON.stringify(userCreatedPermissions));
		} catch (err) {
			console.warn("Failed to save permissions to localStorage:", err);
		}
	};

	// Computed
	const activePermissions = computed(() => permissions.value.filter((permission) => !permission.deletedAt));

	const permissionOptions = computed(() =>
		activePermissions.value.map((permission) => ({
			value: permission.butt,
			label: `${permission.name} (${permission.action} ${permission.subject})`,
			description: permission.description
		}))
	);

	// Methods
	const fetchPermissions = async () => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 fetchPermissions called. Current permissions before API call:", permissions.value.length);
			

			// Try to get permissions from API
			let apiPermissions: Permission[] = [];
			try {
				const allPermissionsData = await buttClient.getAllPermissions();
				console.log("🔍 getAllPermissions() returned:", allPermissionsData);

				if (Array.isArray(allPermissionsData) && allPermissionsData.length > 0) {
					apiPermissions = allPermissionsData as Permission[];
					console.log("✅ Using API permissions. Count:", apiPermissions.length);
				}
			} catch (apiErr) {
				console.warn("⚠️ API call failed, using default permissions:", apiErr);
			}

			// Load persisted user-created permissions
			const persistedPermissions = loadPersistedPermissions();
			console.log("📦 Loaded persisted permissions:", persistedPermissions.length);

			// Merge API permissions with existing local permissions and persisted permissions
			const existingPermissions = permissions.value || [];
			const allPermissions = [...apiPermissions, ...existingPermissions, ...persistedPermissions];

			// Remove duplicates based on ID and butt, prioritizing existing permissions
			const uniquePermissions = allPermissions.filter((permission, index, self) =>
				index === self.findIndex((p) => p.id === permission.id || p.butt === permission.butt)
			);

			permissions.value = uniquePermissions;
			console.log("✅ Final permissions count:", uniquePermissions.length);
			console.log("Permissions:", uniquePermissions.map((p) => `${p.name} (${p.action} ${p.subject})`));
		} catch (err: any) {
			console.error("Error fetching permissions data:", err);
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const getPermission = async (id: string) => {
		loading.value = true;
		error.value = null;

		try {
			const data = await buttClient.getPermission(id);
			currentPermission.value = data;
			return data;
		} catch (err: any) {
			error.value = err?.message || "Failed to fetch permission";
			console.error("Error fetching permission:", err);
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const createPermission = async (permissionData: CreatePermissionData) => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🎯 Creating permission with data:", permissionData);

			// Validate required fields
			const validatedData = {
				name: permissionData.name?.trim(),
				description: permissionData.description?.trim(),
				butt: permissionData.butt?.trim(),
				action: permissionData.action?.trim(),
				subject: permissionData.subject?.trim()
			};

			console.log("🔍 Data validation:", validatedData);

			// Check for empty or missing fields
			if (!validatedData.name) {
				throw new Error("Permission name is required");
			}
			if (!validatedData.description) {
				throw new Error("Permission description is required");
			}
			if (!validatedData.butt) {
				throw new Error("Permission butt is required");
			}
			if (!validatedData.action) {
				throw new Error("Permission action is required");
			}
			if (!validatedData.subject) {
				throw new Error("Permission subject is required");
			}

			// Check for duplicate butt
			const existingPermission = permissions.value.find(p => p.butt === validatedData.butt);
			if (existingPermission) {
				throw new Error(`Permission with butt "${validatedData.butt}" already exists`);
			}

			console.log("✅ Validation passed, calling API...");

			const data = await buttClient.createPermission(validatedData);
			console.log("✅ Permission created successfully:", data);

			// Add to local state
			const newPermission: Permission = {
				id: data.id || `perm-${Date.now()}`,
				name: validatedData.name,
				description: validatedData.description,
				butt: validatedData.butt,
				action: validatedData.action,
				subject: validatedData.subject,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			permissions.value.push(newPermission);
			savePersistedPermissions(permissions.value);

			return newPermission;
		} catch (err: any) {
			console.error("Error creating permission:", err);
			error.value = err?.message || "Failed to create permission";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const updatePermission = async (id: string, updateData: UpdatePermissionData) => {
		loading.value = true;
		error.value = null;

		try {
			const data = await buttClient.updatePermission(id, updateData);
			console.log("✅ Permission updated successfully:", data);

			// Update local state
			const index = permissions.value.findIndex(p => p.id === id);
			if (index !== -1) {
				permissions.value[index] = { ...permissions.value[index], ...updateData, updatedAt: new Date().toISOString() };
				savePersistedPermissions(permissions.value);
			}

			return data;
		} catch (err: any) {
			console.error("Error updating permission:", err);
			error.value = err?.message || "Failed to update permission";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	const deletePermission = async (id: string) => {
		loading.value = true;
		error.value = null;

		try {
			await buttClient.deletePermission(id);
			console.log("✅ Permission deleted successfully");

			// Update local state
			const index = permissions.value.findIndex(p => p.id === id);
			if (index !== -1) {
				permissions.value[index].deletedAt = new Date().toISOString();
				savePersistedPermissions(permissions.value);
			}

			return true;
		} catch (err: any) {
			console.error("Error deleting permission:", err);
			error.value = err?.message || "Failed to delete permission";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	return {
		// State
		permissions,
		loading,
		error,
		currentPermission,

		// Computed
		activePermissions,
		permissionOptions,

		// Methods
		fetchPermissions,
		getPermission,
		createPermission,
		updatePermission,
		deletePermission
	};
};
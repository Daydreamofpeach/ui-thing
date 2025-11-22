/**
 * View Permissions Manager
 *
 * Handles permission checks for canvas views.
 * Determines who can view, edit, share, and delete views.
 *
 * @phase Phase 4 - Multi-Tenancy
 * @created October 28, 2025
 */

import type { CanvasView, ViewAccessResult, ViewPermissions } from "./types";

/**
 * Check if user has access to a view
 */
export function checkViewAccess(
	view: CanvasView,
	userId: string,
	userGroupIds: string[] = []
): ViewAccessResult {
	const permissions = view.permissions;

	// Owner has full control
	if (permissions.ownerId === userId) {
		return {
			canView: true,
			canEdit: true,
			canDelete: true,
			canShare: true,
			canFork: true,
			accessLevel: "full-control"
		};
	}

	// Admin users have full control except deletion
	if (permissions.adminIds.includes(userId)) {
		return {
			canView: true,
			canEdit: true,
			canDelete: false,
			canShare: true,
			canFork: true,
			accessLevel: "full-control"
		};
	}

	// Check if user is in allowed groups
	const hasGroupAccess = userGroupIds.some((groupId) =>
		permissions.userGroupIds.includes(groupId)
	);

	// Check if user is individually granted access
	const hasDirectAccess = permissions.userIds.includes(userId);

	// Check if view is public
	const hasPublicAccess = permissions.isPublic;

	// Determine if user has any access
	const hasAccess = hasGroupAccess || hasDirectAccess || hasPublicAccess;

	if (!hasAccess) {
		return {
			canView: false,
			canEdit: false,
			canDelete: false,
			canShare: false,
			canFork: false,
			accessLevel: "none",
			reason: "No access granted to this view"
		};
	}

	// User has access - determine level
	const canEdit = permissions.accessLevel === "read-write" || permissions.accessLevel === "full-control";
	const canShare = permissions.accessLevel === "full-control";
	const canFork = permissions.allowFork;

	return {
		canView: true,
		canEdit,
		canDelete: false, // Only owner can delete
		canShare,
		canFork,
		accessLevel: permissions.accessLevel
	};
}

/**
 * Create default permissions for a new view
 */
export function createDefaultPermissions(ownerId: string): ViewPermissions {
	return {
		ownerId,
		adminIds: [],
		userGroupIds: [],
		userIds: [],
		isPublic: false,
		accessLevel: "read-write",
		allowFork: true
	};
}

/**
 * Grant user access to a view
 */
export function grantUserAccess(
	permissions: ViewPermissions,
	userId: string
): ViewPermissions {
	if (permissions.userIds.includes(userId)) {
		console.log("ℹ️ User already has access:", userId);
		return permissions;
	}

	console.log("✅ Granting access to user:", userId);
	return {
		...permissions,
		userIds: [...permissions.userIds, userId]
	};
}

/**
 * Revoke user access from a view
 */
export function revokeUserAccess(
	permissions: ViewPermissions,
	userId: string
): ViewPermissions {
	console.log("🚫 Revoking access from user:", userId);
	return {
		...permissions,
		userIds: permissions.userIds.filter((id) => id !== userId),
		adminIds: permissions.adminIds.filter((id) => id !== userId)
	};
}

/**
 * Grant user group access to a view
 */
export function grantGroupAccess(
	permissions: ViewPermissions,
	groupId: string
): ViewPermissions {
	if (permissions.userGroupIds.includes(groupId)) {
		console.log("ℹ️ Group already has access:", groupId);
		return permissions;
	}

	console.log("✅ Granting access to group:", groupId);
	return {
		...permissions,
		userGroupIds: [...permissions.userGroupIds, groupId]
	};
}

/**
 * Revoke user group access from a view
 */
export function revokeGroupAccess(
	permissions: ViewPermissions,
	groupId: string
): ViewPermissions {
	console.log("🚫 Revoking access from group:", groupId);
	return {
		...permissions,
		userGroupIds: permissions.userGroupIds.filter((id) => id !== groupId)
	};
}

/**
 * Make user an admin of a view
 */
export function promoteToAdmin(
	permissions: ViewPermissions,
	userId: string
): ViewPermissions {
	if (permissions.adminIds.includes(userId)) {
		console.log("ℹ️ User is already admin:", userId);
		return permissions;
	}

	console.log("⭐ Promoting user to admin:", userId);
	
	// Ensure user has access first
	const updatedPermissions = grantUserAccess(permissions, userId);
	
	return {
		...updatedPermissions,
		adminIds: [...updatedPermissions.adminIds, userId]
	};
}

/**
 * Remove admin privileges from user
 */
export function demoteFromAdmin(
	permissions: ViewPermissions,
	userId: string
): ViewPermissions {
	console.log("👤 Demoting user from admin:", userId);
	return {
		...permissions,
		adminIds: permissions.adminIds.filter((id) => id !== userId)
	};
}

/**
 * Update view access level
 */
export function updateAccessLevel(
	permissions: ViewPermissions,
	accessLevel: ViewPermissions["accessLevel"]
): ViewPermissions {
	console.log("🔧 Updating access level:", accessLevel);
	return {
		...permissions,
		accessLevel
	};
}

/**
 * Toggle public access
 */
export function togglePublicAccess(permissions: ViewPermissions): ViewPermissions {
	console.log("🌐 Toggling public access:", !permissions.isPublic);
	return {
		...permissions,
		isPublic: !permissions.isPublic
	};
}

/**
 * Filter views by user access
 */
export function filterViewsByAccess(
	views: CanvasView[],
	userId: string,
	userGroupIds: string[] = []
): CanvasView[] {
	return views.filter((view) => {
		const access = checkViewAccess(view, userId, userGroupIds);
		return access.canView;
	});
}

/**
 * Get views where user is owner
 */
export function getOwnedViews(
	views: CanvasView[],
	userId: string
): CanvasView[] {
	return views.filter((view) => view.permissions.ownerId === userId);
}

/**
 * Get views where user is admin
 */
export function getAdminViews(
	views: CanvasView[],
	userId: string
): CanvasView[] {
	return views.filter((view) => view.permissions.adminIds.includes(userId));
}

/**
 * Get shared views (user has access but not owner)
 */
export function getSharedViews(
	views: CanvasView[],
	userId: string,
	userGroupIds: string[] = []
): CanvasView[] {
	return views.filter((view) => {
		const access = checkViewAccess(view, userId, userGroupIds);
		return access.canView && view.permissions.ownerId !== userId;
	});
}


import { ref, computed } from 'vue'
import type { UserRole } from './types/permissions.types'

// Permission checking types (different from Permission CRUD types)
export interface PermissionRule {
  name: string
  butt: string
  action: 'read' | 'write' | 'delete' | 'admin'
  subject: string
  description?: string
}

export interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: PermissionRule[]
  isDefault?: boolean
  isCustom?: boolean
}

export const useUserPermissions = () => {
  // State
  const currentUserPermissions = ref<PermissionRule[]>([])
  const availableRoles = ref<RoleDefinition[]>([])
  const userRoles = ref<UserRole[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Default roles
  const defaultRoles: RoleDefinition[] = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access to organization settings and all features',
      permissions: [
        { name: 'Full Access', butt: 'full_access', action: 'admin', subject: 'all' }
      ],
      isDefault: true
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage users, projects, and organization settings',
      permissions: [
        { name: 'User Management', butt: 'user_management', action: 'admin', subject: 'users' },
        { name: 'Project Management', butt: 'project_management', action: 'admin', subject: 'projects' },
        { name: 'Organization Settings', butt: 'org_settings', action: 'write', subject: 'organization' }
      ],
      isDefault: true
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'Access to development tools and project resources',
      permissions: [
        { name: 'Project Access', butt: 'project_access', action: 'read', subject: 'projects' },
        { name: 'Development Tools', butt: 'dev_tools', action: 'write', subject: 'development' }
      ],
      isDefault: true
    },
    {
      id: 'user',
      name: 'User',
      description: 'Basic access to organization resources',
      permissions: [
        { name: 'Basic Access', butt: 'basic_access', action: 'read', subject: 'resources' }
      ],
      isDefault: true
    },
    {
      id: 'guest',
      name: 'Guest',
      description: 'Read-only access to limited resources',
      permissions: [
        { name: 'Read Only', butt: 'read_only', action: 'read', subject: 'limited' }
      ],
      isDefault: true
    }
  ]

  // Computed
  const hasPermission = computed(() => {
    return (action: string, subject: string) => {
      return currentUserPermissions.value.some(
        permission => 
          (permission.action === action || permission.action === 'admin') &&
          (permission.subject === subject || permission.subject === 'all')
      )
    }
  })

  const isOwner = computed(() => {
    return hasPermission.value('admin', 'all')
  })

  const isAdmin = computed(() => {
    return hasPermission.value('admin', 'users') || isOwner.value
  })

  const canManageUsers = computed(() => {
    return isAdmin.value
  })

  const canManageRoles = computed(() => {
    return isAdmin.value
  })

  const canInviteUsers = computed(() => {
    return hasPermission.value('write', 'users') || isAdmin.value
  })

  const canRemoveUsers = computed(() => {
    return hasPermission.value('delete', 'users') || isAdmin.value
  })

  // Methods
  const setCurrentUserPermissions = (permissions: PermissionRule[]) => {
    currentUserPermissions.value = permissions
  }

  const setAvailableRoles = (roles: RoleDefinition[]) => {
    availableRoles.value = [...defaultRoles, ...roles]
  }

  const setUserRoles = (roles: UserRole[]) => {
    userRoles.value = roles
  }

  const getUserRole = (userId: string, organizationId: string): RoleDefinition | null => {
    const userRole = userRoles.value.find(
      ur => ur.userId === userId && ur.organizationId === organizationId
    )
    
    if (!userRole) return null
    
    return availableRoles.value.find(role => role.id === userRole.roleId) || null
  }

  const canChangeUserRole = (targetUserId: string, newRoleId: string, organizationId: string): boolean => {
    // Only admins can change roles
    if (!isAdmin.value) return false
    
    // Cannot change owner role
    if (newRoleId === 'owner') return false
    
    // Cannot change your own role to non-admin if you're the only admin
    // (This would need additional logic to check if there are other admins)
    
    return true
  }

  const getRolePermissions = (roleId: string): PermissionRule[] => {
    const role = availableRoles.value.find(r => r.id === roleId)
    return role?.permissions || []
  }

  const hasRolePermission = (roleId: string, action: string, subject: string): boolean => {
    const permissions = getRolePermissions(roleId)
    return permissions.some(
      permission => 
        (permission.action === action || permission.action === 'admin') &&
        (permission.subject === subject || permission.subject === 'all')
    )
  }

  const clearPermissions = () => {
    currentUserPermissions.value = []
    availableRoles.value = []
    userRoles.value = []
    error.value = null
  }

  return {
    // State
    currentUserPermissions,
    availableRoles,
    userRoles,
    loading,
    error,
    
    // Computed
    hasPermission,
    isOwner,
    isAdmin,
    canManageUsers,
    canManageRoles,
    canInviteUsers,
    canRemoveUsers,
    
    // Methods
    setCurrentUserPermissions,
    setAvailableRoles,
    setUserRoles,
    getUserRole,
    canChangeUserRole,
    getRolePermissions,
    hasRolePermission,
    clearPermissions
  }
}

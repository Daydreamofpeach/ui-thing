import { ref, computed, watch } from 'vue'
import { getCurrentUserId, getCurrentUserEmail } from '~/utils/authUtils'

export interface CurrentUserPermissions {
  isOwner: boolean
  isAdmin: boolean
  canManageRoles: boolean
  canInviteUsers: boolean
  canRemoveUsers: boolean
  canEditUsers: boolean
}

export function useCurrentUserPermissions() {
  // State
  const currentUserId = ref<string | null>(null)
  const currentUserRole = ref<string | null>(null)
  const organizationId = ref<string | null>(null)
  const members = ref<any[]>([])
  const isInitialized = ref(false)

  // Computed permissions
  const permissions = computed((): CurrentUserPermissions => {
    if (!currentUserId.value || !currentUserRole.value) {
      return {
        isOwner: false,
        isAdmin: false,
        canManageRoles: false,
        canInviteUsers: false,
        canRemoveUsers: false,
        canEditUsers: false
      }
    }

    const isOwner = currentUserRole.value === 'owner'
    const isAdmin = currentUserRole.value === 'admin' || isOwner

    return {
      isOwner,
      isAdmin,
      canManageRoles: isAdmin, // Only admins/owners can manage roles
      canInviteUsers: isAdmin, // Only admins/owners can invite users
      canRemoveUsers: isAdmin, // Only admins/owners can remove users
      canEditUsers: isAdmin // Only admins/owners can edit other users
    }
  })

  // Methods
  const setCurrentUser = (userId: string, role: string, orgId: string) => {
    currentUserId.value = userId
    currentUserRole.value = role
    organizationId.value = orgId
    isInitialized.value = true
  }

  const setMembers = (orgMembers: any[]) => {
    members.value = orgMembers
  }

  const setOrganizationId = (orgId: string) => {
    organizationId.value = orgId
  }

  // Auto-detect current user from authentication system
  const autoDetectCurrentUser = () => {
    const authUserId = getCurrentUserId()
    const authEmail = getCurrentUserEmail()
    
    if (authUserId && !currentUserId.value) {
      currentUserId.value = authUserId
    }
    
    if (authEmail && !currentUserRole.value) {
      // Auto-detected current user email
    }
  }

  // Auto-detect current user role from organization members
  const autoDetectCurrentUserRole = () => {
    if (!currentUserId.value || !members.value.length) return

    // Find the current user in the members list
    const currentUser = members.value.find(member => 
      member.id === currentUserId.value || 
      member.email === getCurrentUserEmail()
    )

    if (currentUser && !currentUserRole.value) {
      currentUserRole.value = currentUser.role || 'member'
      isInitialized.value = true
    }
  }

  // Initialize permissions automatically
  const initialize = () => {
    autoDetectCurrentUser()
    
    // Watch for members changes to auto-detect role
    watch(members, () => {
      autoDetectCurrentUserRole()
    }, { immediate: true })
  }

  const canManageUser = (targetUserId: string, action: 'edit' | 'remove' | 'changeRole'): boolean => {
    // Cannot manage yourself
    if (targetUserId === currentUserId.value) {
      return false
    }

    // Only admins/owners can manage other users
    if (!permissions.value.isAdmin) {
      return false
    }

    // Special rules for different actions
    switch (action) {
      case 'edit':
        return permissions.value.canEditUsers
      case 'remove':
        return permissions.value.canRemoveUsers
      case 'changeRole':
        return permissions.value.canManageRoles
      default:
        return false
    }
  }

  const canChangeUserRole = (targetUserId: string, newRole: string): boolean => {
    // Basic permission check
    if (!canManageUser(targetUserId, 'changeRole')) {
      return false
    }

    // Cannot change to owner role (only system can assign owner)
    if (newRole === 'owner') {
      return false
    }

    // Cannot change your own role to non-admin if you're the only admin
    if (targetUserId === currentUserId.value && newRole !== 'admin' && newRole !== 'owner') {
      const adminCount = members.value.filter(m => 
        m.role === 'admin' || m.role === 'owner'
      ).length
      
      if (adminCount <= 1) {
        console.warn('⚠️ Cannot change own role - you are the only admin')
        return false
      }
    }

    return true
  }

  const clearPermissions = () => {
    currentUserId.value = null
    currentUserRole.value = null
    organizationId.value = null
    members.value = []
    isInitialized.value = false
  }

  // Auto-initialize when composable is created
  initialize()

  return {
    // State
    currentUserId,
    currentUserRole,
    organizationId,
    members,
    isInitialized,
    
    // Computed
    permissions,
    
    // Methods
    setCurrentUser,
    setMembers,
    setOrganizationId,
    autoDetectCurrentUser,
    autoDetectCurrentUserRole,
    initialize,
    canManageUser,
    canChangeUserRole,
    clearPermissions
  }
}

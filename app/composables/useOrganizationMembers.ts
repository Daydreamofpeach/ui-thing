import { computed, isRef, ref, unref, watch } from 'vue'
import { buttClient } from '~/utils/buttClient'
import { useToast } from '#imports'

type OrgState = {
  members: ReturnType<typeof ref<any[]>>
  isLoading: ReturnType<typeof ref<boolean>>
  error: ReturnType<typeof ref<string | null>>
  showAll: ReturnType<typeof ref<boolean>>
}

const stateMap = new Map<string, OrgState>()

function toKey(id?: string | number | null) {
  return id !== undefined && id !== null ? String(id) : ''
}

function ensureState(key: string): OrgState {
  if (!stateMap.has(key)) {
    stateMap.set(key, {
      members: ref<any[]>([]),
      isLoading: ref(false),
      error: ref<string | null>(null),
      showAll: ref(false)
    })
  }
  return stateMap.get(key) as OrgState
}

async function loadMembers(key: string) {
  const state = ensureState(key)
  if (!key) {
    state.members.value = []
    return
  }

  state.isLoading.value = true
  state.error.value = null

  try {
    const organization = await buttClient.findByIdOrganisation(key)
    const owners = organization?.owners || []
    const ownerEmail = organization?.creator || organization?.createdBy || organization?.ownerEmail
    const ownerId = organization?.creatorId || organization?.ownerId

    const members: any[] = []
    if (Array.isArray(owners)) {
      for (const id of owners) {
        try {
          const user = await (buttClient as any).getUserUser?.(id) || { id, email: `user-${id}@example.com`, name: `User ${id}` }
          const isOwner = (ownerEmail && user.email === ownerEmail) || (ownerId && id === ownerId) || owners.length === 1

          members.push({
            id,
            email: user.email,
            name: user.name,
            role: isOwner ? 'Owner' : 'Member'
          })
        } catch (error) {
          console.warn('[useOrganizationMembers] Failed to fetch user:', id, error)
        }
      }
    }

    state.members.value = members
  } catch (error: any) {
    state.error.value = error?.message || 'Failed to load members'
  } finally {
    state.isLoading.value = false
  }
}

export function useOrganizationMembers(organizationId?: string | number | ReturnType<typeof ref<any>>) {
  const orgIdRef = isRef(organizationId) ? organizationId : ref(organizationId)
  const currentKey = computed(() => toKey(unref(orgIdRef)))

  const members = computed(() => ensureState(currentKey.value).members.value)
  const isLoadingMembers = computed(() => ensureState(currentKey.value).isLoading.value)
  const membersError = computed(() => ensureState(currentKey.value).error.value)
  const showAllMembers = computed({
    get: () => ensureState(currentKey.value).showAll.value,
    set: value => {
      ensureState(currentKey.value).showAll.value = value
    }
  })

  const visibleMembers = computed(() => {
    return showAllMembers.value ? members.value : members.value.slice(0, 3)
  })

  const hasMoreMembers = computed(() => members.value.length > 3)

  async function fetchMembers(targetId?: string | number | null) {
    const key = toKey(targetId ?? unref(orgIdRef))
    await loadMembers(key)
  }

  function toggleMemberList() {
    showAllMembers.value = !showAllMembers.value
  }

  function getMemberInitial(name: string) {
    if (!name) return ''
    const parts = name.split(' ').filter(Boolean)
    if (parts.length === 0) return name.charAt(0)
    if (parts.length === 1) return parts[0].charAt(0)
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`
  }

  function getMemberRole(member: any) {
    if (member?.role === 'Owner') return 'Owner'
    if (member?.role === 'Admin') return 'Admin'
    if (member?.role === 'Developer') return 'Developer'
    if (member?.role === 'Member') return 'Member'
    return 'Member'
  }

  function getMemberRoleColor(member: any) {
    if (member?.role === 'Owner') return 'success'
    if (member?.role === 'Admin') return 'info'
    if (member?.role === 'Developer') return 'warning'
    if (member?.role === 'Member') return 'secondary'
    return 'secondary'
  }

  function handleInviteFeedback(title: string, description: string, color: 'success' | 'error' | 'warning' = 'success') {
    useToast().add({ title, description, icon: 'i-lucide-users', color })
  }

  watch(currentKey, key => {
    void loadMembers(key)
  }, { immediate: true })

  return {
    members,
    visibleMembers,
    hasMoreMembers,
    showAllMembers,
    isLoadingMembers,
    membersError,
    fetchMembers,
    toggleMemberList,
    getMemberInitial,
    getMemberRole,
    getMemberRoleColor,
    handleInviteFeedback
  }
}

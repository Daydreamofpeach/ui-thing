import { computed, isRef, ref, unref, watch } from 'vue'
import { useUserInvite } from '~/composables/useUserInvite'

const invitationStore = new Map<string, ReturnType<typeof createInvitationState>>()

function toKey(id?: string | number | null) {
  return id !== undefined && id !== null ? String(id) : ''
}

function createInvitationState() {
  const { invitations, pendingInvitations, acceptedInvitations, fetchInvitations, deleteInvitation, completeInvitation } = useUserInvite()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  return {
    invitations,
    pendingInvitations,
    acceptedInvitations,
    fetchInvitations,
    deleteInvitation,
    completeInvitation,
    isLoading,
    error
  }
}

export function useOrganizationInvitations(organizationId?: string | number | ReturnType<typeof ref<any>>) {
  const orgIdRef = isRef(organizationId) ? organizationId : ref(organizationId)
  const currentKey = computed(() => toKey(unref(orgIdRef)))

  function ensureState(key: string) {
    if (!invitationStore.has(key)) {
      invitationStore.set(key, createInvitationState())
    }
    return invitationStore.get(key)!
  }

  const state = computed(() => ensureState(currentKey.value))

  const invitations = computed(() => state.value.invitations.value.filter(invite => {
    if (!currentKey.value) return true
    return String(invite.organisationId) === currentKey.value
  }))

  const pendingInvitations = computed(() => state.value.pendingInvitations.value.filter(invite => {
    if (!currentKey.value) return invite.status === 'pending'
    return String(invite.organisationId) === currentKey.value && invite.status === 'pending'
  }))

  const acceptedInvitations = computed(() => state.value.acceptedInvitations.value.filter(invite => {
    if (!currentKey.value) return invite.status === 'accepted'
    return String(invite.organisationId) === currentKey.value && invite.status === 'accepted'
  }))

  async function fetchInvitations(targetId?: string | number | null) {
    const key = toKey(targetId ?? unref(orgIdRef))
    const targetState = ensureState(key)
    targetState.isLoading.value = true
    targetState.error.value = null

    try {
      await targetState.fetchInvitations()
    } catch (error: any) {
      targetState.error.value = error?.message || 'Failed to load invitations'
    } finally {
      targetState.isLoading.value = false
    }
  }

  async function deleteOrganisationInvitation(inviteId: string) {
    const success = await state.value.deleteInvitation(inviteId)
    if (success) {
      await fetchInvitations()
    }
    return success
  }

  async function completeOrganisationInvitation(inviteId: string) {
    const success = await state.value.completeInvitation(inviteId)
    if (success) {
      await fetchInvitations()
    }
    return success
  }

  watch(currentKey, key => {
    void fetchInvitations(key)
  }, { immediate: true })

  return {
    invitations,
    pendingInvitations,
    acceptedInvitations,
    fetchInvitations,
    deleteInvitation: deleteOrganisationInvitation,
    completeInvitation: completeOrganisationInvitation,
    isLoading: computed(() => state.value.isLoading.value),
    error: computed(() => state.value.error.value)
  }
}

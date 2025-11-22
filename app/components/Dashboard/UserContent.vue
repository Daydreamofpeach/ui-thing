<template>
  <div class="space-y-6">
    <!-- Header with Add Member Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Team Members</h2>
        <p class="text-muted-foreground">Manage your team members and their roles</p>
      </div>
      <UiButton :disabled="loading" @click="showAddModal = true">
        <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
        <Icon v-else name="lucide:user-plus" class="h-4 w-4 mr-2" />
        {{ loading ? 'Loading...' : 'Add Member' }}
      </UiButton>
    </div>

    <!-- Members Table -->
    <div v-if="members.length > 0" class="rounded-md border">
      <UiTable>
        <UiTableHeader>
          <UiTableRow>
            <UiTableHead>Member</UiTableHead>
            <UiTableHead>Role</UiTableHead>
            <UiTableHead>Status</UiTableHead>
            <UiTableHead>Added By</UiTableHead>
            <UiTableHead>Joined</UiTableHead>
            <UiTableHead class="text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow v-for="member in members" :key="member.id" :class="{ 'opacity-50': loading }">
            <UiTableCell class="font-medium">
              <div class="flex items-center gap-3">
                <UiAvatar class="h-8 w-8">
                  <UiAvatarFallback>{{ member.user_name?.charAt(0).toUpperCase() }}</UiAvatarFallback>
                </UiAvatar>
                <div>
                  <p class="font-medium">{{ member.user_name }}</p>
                  <p class="text-sm text-muted-foreground">{{ member.user_email }}</p>
                </div>
              </div>
            </UiTableCell>
            <UiTableCell>
              <UiBadge :variant="member.role === 'admin' ? 'default' : 'secondary'">
                {{ member.role }}
              </UiBadge>
            </UiTableCell>
            <UiTableCell>
              <UiBadge :variant="getStatusVariant(member.status)">
                {{ member.status }}
              </UiBadge>
            </UiTableCell>
            <UiTableCell>
              <span class="text-sm">{{ member.added_by_name }}</span>
            </UiTableCell>
            <UiTableCell>{{ formatDate(member.created_at) }}</UiTableCell>
            <UiTableCell class="text-right">
              <UiDropdownMenu>
                <UiDropdownMenuTrigger as-child>
                  <UiButton variant="ghost" size="icon" :disabled="loading">
                    <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                  </UiButton>
                </UiDropdownMenuTrigger>
                <UiDropdownMenuContent align="end">
                  <UiDropdownMenuItem :disabled="loading" @click="editMember(member)">
                    <Icon name="lucide:edit" class="h-4 w-4 mr-2" />
                    Edit Role
                  </UiDropdownMenuItem>
                  <UiDropdownMenuItem 
                    :disabled="loading" 
                    @click="toggleMemberStatus(member)"
                  >
                    <Icon 
                      :name="member.status === 'active' ? 'lucide:user-x' : 'lucide:user-check'" 
                      class="h-4 w-4 mr-2" 
                    />
                    {{ member.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </UiDropdownMenuItem>
                  <UiDropdownMenuSeparator />
                  <UiDropdownMenuItem class="text-destructive" :disabled="loading" @click="removeMember(member.id)">
                    <Icon name="lucide:trash" class="h-4 w-4 mr-2" />
                    Remove
                  </UiDropdownMenuItem>
                </UiDropdownMenuContent>
              </UiDropdownMenu>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="lucide:users" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">No team members yet</h3>
      <p class="text-muted-foreground mb-4">Add users to your team to get started</p>
      <UiButton :disabled="loading" @click="showAddModal = true">
        <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
        <Icon v-else name="lucide:user-plus" class="h-4 w-4 mr-2" />
        {{ loading ? 'Loading...' : 'Add Member' }}
      </UiButton>
    </div>

    <!-- Add Member Modal -->
    <UiDialog v-model:open="showAddModal">
      <UiDialogContent class="sm:max-w-[500px]">
        <UiDialogHeader>
          <UiDialogTitle>Add Team Member</UiDialogTitle>
          <UiDialogDescription>Add an existing user to your team</UiDialogDescription>
        </UiDialogHeader>
        <form class="space-y-4" @submit.prevent="addMember">
          <div class="space-y-2">
            <UiLabel for="member-user">Select User *</UiLabel>
            <UiSelect v-model="newMember.user_id" required>
              <UiSelectTrigger>
                <UiSelectValue placeholder="Choose a user to add" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem 
                  v-for="user in availableUsers" 
                  :key="user.id" 
                  :value="user.id.toString()"
                >
                  <div class="flex items-center gap-2">
                    <span>{{ user.name }}</span>
                    <span class="text-sm text-muted-foreground">({{ user.email }})</span>
                  </div>
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
          <div class="space-y-2">
            <UiLabel for="member-role">Role</UiLabel>
            <UiSelect v-model="newMember.role">
              <UiSelectTrigger>
                <UiSelectValue placeholder="Select role" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="member">Member</UiSelectItem>
                <UiSelectItem value="admin">Admin</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
          <div class="flex justify-end gap-3">
            <UiButton type="button" variant="outline" :disabled="loading" @click="closeAddModal">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="!newMember.user_id || loading">
              <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
              {{ loading ? 'Adding...' : 'Add Member' }}
            </UiButton>
          </div>
        </form>
      </UiDialogContent>
    </UiDialog>

    <!-- Edit Member Modal -->
    <UiDialog v-model:open="showEditModal">
      <UiDialogContent class="sm:max-w-[500px]">
        <UiDialogHeader>
          <UiDialogTitle>Edit Member Role</UiDialogTitle>
          <UiDialogDescription>Update member role and permissions</UiDialogDescription>
        </UiDialogHeader>
        <form v-if="editingMember" class="space-y-4" @submit.prevent="updateMember">
          <div class="space-y-2">
            <UiLabel for="edit-member-role">Role</UiLabel>
            <UiSelect v-model="editingMember.role">
              <UiSelectTrigger>
                <UiSelectValue placeholder="Select role" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="member">Member</UiSelectItem>
                <UiSelectItem value="admin">Admin</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
          <div class="space-y-2">
            <UiLabel for="edit-member-status">Status</UiLabel>
            <UiSelect v-model="editingMember.status">
              <UiSelectTrigger>
                <UiSelectValue placeholder="Select status" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="active">Active</UiSelectItem>
                <UiSelectItem value="inactive">Inactive</UiSelectItem>
                <UiSelectItem value="pending">Pending</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
          <div class="flex justify-end gap-3">
            <UiButton type="button" variant="outline" :disabled="loading" @click="closeEditModal">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="loading">
              <UiLoader v-if="loading" class="h-4 w-4 mr-2" />
              {{ loading ? 'Updating...' : 'Update Member' }}
            </UiButton>
          </div>
        </form>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { Member } from '~/lib/members'

// Props
const props = defineProps<{
  adminUserId: number
}>()

// Reactive data
const members = ref<Member[]>([])
const availableUsers = ref<Array<{id: number, name: string, email: string}>>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const loading = ref(false)

const newMember = ref({
  user_id: '',
  role: 'member'
})

const editingMember = ref<Member | null>(null)

// Methods
const fetchMembers = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; members: Member[] }>(`/api/members?admin_user_id=${props.adminUserId}`)
    if (response.success) {
      members.value = response.members
    }
  } catch {
    useSonner.error('Failed to load members', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const fetchAvailableUsers = async () => {
  try {
    const response = await $fetch<{ success: boolean; users: Array<{id: number, name: string, email: string}> }>(`/api/members/available-users?admin_user_id=${props.adminUserId}`)
    if (response.success) {
      availableUsers.value = response.users
    }
  } catch {
    useSonner.error('Failed to load available users', {
      description: 'Please try again later'
    })
  }
}

const addMember = async () => {
  if (!newMember.value.user_id) {
    useSonner.error('Please select a user')
    return
  }

  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; member: Member }>('/api/members', {
      method: 'POST',
      body: {
        user_id: Number(newMember.value.user_id),
        added_by_user_id: props.adminUserId,
        role: newMember.value.role
      }
    })

    if (response.success && response.member) {
      members.value.unshift(response.member)
      closeAddModal()
      useSonner.success('Member added successfully', {
        description: `${response.member.user_name} has been added to your team`
      })
      // Refresh available users
      await fetchAvailableUsers()
    }
  } catch {
    useSonner.error('Failed to add member', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const editMember = (member: Member) => {
  editingMember.value = { ...member }
  showEditModal.value = true
}

const updateMember = async () => {
  if (!editingMember.value || !editingMember.value.id) {
    useSonner.error('No member selected for editing')
    return
  }

  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; member: Member }>(`/api/members/${editingMember.value.id}`, {
      method: 'PUT',
      body: {
        role: editingMember.value.role,
        status: editingMember.value.status
      }
    })

    if (response.success && response.member) {
      const index = members.value.findIndex(m => m.id === editingMember.value!.id)
      if (index !== -1) {
        members.value[index] = response.member
      }
      closeEditModal()
      useSonner.success('Member updated successfully', {
        description: `${response.member.user_name}'s role has been updated`
      })
    }
  } catch {
    useSonner.error('Failed to update member', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const toggleMemberStatus = async (member: Member) => {
  const newStatus = member.status === 'active' ? 'inactive' : 'active'
  
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; member: Member }>(`/api/members/${member.id}`, {
      method: 'PUT',
      body: {
        status: newStatus
      }
    })

    if (response.success && response.member) {
      const index = members.value.findIndex(m => m.id === member.id)
      if (index !== -1) {
        members.value[index] = response.member
      }
      useSonner.success(`Member ${newStatus}`, {
        description: `${member.user_name} has been ${newStatus}`
      })
    }
  } catch {
    useSonner.error('Failed to update member status', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const removeMember = async (memberId: number) => {
  const member = members.value.find(m => m.id === memberId)
  if (!member) return

  // Show confirmation dialog
  const confirmed = await new Promise<boolean>((resolve) => {
    resolve(confirm(`Are you sure you want to remove "${member.user_name}" from your team?`))
  })

  if (!confirmed) return

  try {
    loading.value = true
    
    // Optimistically remove the member from the UI immediately
    const memberIndex = members.value.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return
    
    // Store the member for potential restoration
    const memberToRemove = members.value[memberIndex]
    members.value.splice(memberIndex, 1)
    
    // Show immediate feedback
    useSonner.success('Member removed', {
      description: `${memberToRemove.user_name} has been removed from your team`
    })
    
    // Make the API call in the background
    try {
      await $fetch<{ success: boolean }>(`/api/members/${memberId}`, {
        method: 'DELETE'
      })
      // Refresh available users
      await fetchAvailableUsers()
    } catch (apiError: any) {
      // If API fails, restore the member and show error
      if (apiError.statusCode !== 404) {
        members.value.splice(memberIndex, 0, memberToRemove)
        useSonner.error('Failed to remove member', {
          description: 'The member has been restored. Please try again.'
        })
      }
    }
    
  } catch {
    useSonner.error('Failed to remove member', {
      description: 'Please try again later'
    })
  } finally {
    loading.value = false
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  newMember.value = { user_id: '', role: 'member' }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMember.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default'
    case 'inactive': return 'secondary'
    case 'pending': return 'outline'
    default: return 'secondary'
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchMembers(),
    fetchAvailableUsers()
  ])
})

// Watch for admin user changes
watch(() => props.adminUserId, async () => {
  if (props.adminUserId) {
    await Promise.all([
      fetchMembers(),
      fetchAvailableUsers()
    ])
  }
})
</script>
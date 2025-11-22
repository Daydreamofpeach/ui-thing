<template>
  <div class="w-full">
    <slot name="image">
      <div class="relative group">
        <!-- eslint-disable-next-line vue/html-self-closing -->
        <img
          v-if="profileImage"
          :src="profileImage"
          class="h-[180px] w-full object-cover md:h-[250px] lg:h-[300px] xl:h-[350px]"
        />
        <!-- Edit overlay for banner image -->
        <div v-if="isEditing" class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex gap-2">
            <UiButton size="sm" variant="secondary" @click="openImageUrlDialog('banner')">
              <Icon name="lucide:link" class="size-4 mr-2" />
              URL
            </UiButton>
            <UiButton size="sm" variant="secondary" @click="triggerFileUpload('banner')">
              <Icon name="lucide:upload" class="size-4 mr-2" />
              Upload
            </UiButton>
          </div>
        </div>
        <!-- Hidden file input for banner -->
        <input
          ref="bannerFileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleBannerUpload"
        />
      </div>
    </slot>
    <div class="w-full p-4 md:px-8 md:py-6 lg:px-12 lg:py-8 xl:px-16 xl:py-10">
      <div class="hidden md:block">
        <slot name="crumbs">
          <UiBreadcrumbs :items="dynamicBreadcrumbs" class="mb-5" />
        </slot>
      </div>
      <slot name="back-link">
        <NuxtLink
          class="mb-5 flex items-center gap-3 text-sm underline-offset-2 hover:underline md:hidden"
          to="#"
          ><Icon name="lucide:arrow-left" class="size-4" /> Back</NuxtLink
        >
      </slot>
      <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between w-full">
        <div class="flex items-center gap-5">
          <slot name="avatar">
            <div class="relative group">
              <UiAvatar v-if="avatarImage" :src="avatarImage" class="size-14 md:size-16 lg:size-20 xl:size-24" />
              <!-- Edit overlay for avatar -->
              <div v-if="isEditing" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="flex gap-1">
                  <UiButton size="sm" variant="secondary" class="rounded-full p-1" @click="openImageUrlDialog('avatar')">
                    <Icon name="lucide:link" class="size-3" />
                  </UiButton>
                  <UiButton size="sm" variant="secondary" class="rounded-full p-1" @click="triggerFileUpload('avatar')">
                    <Icon name="lucide:upload" class="size-3" />
                  </UiButton>
                </div>
              </div>
              <!-- Hidden file input for avatar -->
              <input
                ref="avatarFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarUpload"
              />
            </div>
          </slot>
          <div class="flex-1">
            <slot name="title">
              <div v-if="props.title">
                <!-- Editable name field -->
                <UiInput
                  v-if="isEditing"
                  v-model="editableName"
                  class="text-2xl font-bold lg:text-3xl xl:text-4xl border border-dashed border-muted-foreground/30 bg-muted/20 p-2 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter your name"
                />
                <h1 v-else class="text-2xl font-bold lg:text-3xl xl:text-4xl" v-html="editableName" />
              </div>
            </slot>
            <slot name="description">
              <div v-if="props.description">
                <!-- Editable email field -->
                <UiInput
                  v-if="isEditing"
                  v-model="editableEmail"
                  type="email"
                  class="text-muted-foreground text-sm md:text-base lg:text-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-2 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter your email"
                />
                <p
                  v-else
                  class="text-muted-foreground text-sm md:text-base lg:text-lg"
                  v-html="editableEmail"
                />
              </div>
            </slot>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <slot>
            <UiButton 
              size="sm" 
              variant="outline" 
              class="text-xs md:text-sm"
              @click="toggleEditMode"
            >
              <Icon :name="isEditing ? 'lucide:check' : 'lucide:edit'" class="size-4 mr-2" />
              {{ isEditing ? 'Save' : 'Edit' }}
            </UiButton>
          </slot>
        </div>
      </div>
      <UiDivider class="my-8" />
    </div>

    <!-- URL Input Dialog -->
    <UiDialog v-model:open="showUrlDialog">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle>Enter Image URL</UiDialogTitle>
          <UiDialogDescription>
            Enter the URL for your {{ currentImageType === 'banner' ? 'banner' : 'avatar' }} image.
          </UiDialogDescription>
        </UiDialogHeader>
        <div class="space-y-4">
          <UiInput 
            v-model="imageUrl" 
            placeholder="https://example.com/image.jpg"
            type="url"
          />
          <div class="flex justify-end gap-2">
            <UiButton variant="outline" @click="showUrlDialog = false">Cancel</UiButton>
            <UiButton @click="setImageFromUrl">Set Image</UiButton>
          </div>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script lang="ts" setup>
  import type { BreadcrumbItem } from "@/components/Ui/Breadcrumbs.vue";

  const props = withDefaults(
    defineProps<{
      title?: string;
      description?: string;
      crumbs?: BreadcrumbItem[];
      avatar?: string;
      image?: string;
    }>(),
    {
      image:
        "https://images.unsplash.com/photo-1580610447943-1bfbef5efe07?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Loading...",
      description: "Loading...",
      crumbs: () =>
        [
          {
            label: "Dashboard",
            link: "#",
          },
          {
            label: "Profile",
            link: "#",
          },
          {
            label: "Loading...",
            link: "#",
          },
        ] as BreadcrumbItem[],
      avatar: "https://randomuser.me/api/portraits/med/men/2.jpg",
    }
  );

  // Get current user from auth composable
  const { user, setUser } = useAuth()

  // Reactive state for images
  const profileImage = ref(props.image)
  const avatarImage = ref(props.avatar)
  const isEditing = ref(false)
  const showUrlDialog = ref(false)
  const imageUrl = ref('')
  const currentImageType = ref<'banner' | 'avatar'>('banner')

  // Reactive state for editable text fields - initialize with user data
  const editableName = ref(user.value?.name || props.title)
  const editableEmail = ref(user.value?.email || props.description)

  // Dynamic breadcrumbs that update with the user's name
  const dynamicBreadcrumbs = computed(() => [
    {
      label: "Dashboard",
      link: "#",
    },
    {
      label: "Profile",
      link: "#",
    },
    {
      label: editableName.value || "User",
      link: "#",
    },
  ] as BreadcrumbItem[])

  // Template refs
  const bannerFileInput = ref<HTMLInputElement>()
  const avatarFileInput = ref<HTMLInputElement>()

  // Edit mode toggle
  const toggleEditMode = () => {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
      // Save changes when exiting edit mode
      saveChanges()
    }
  }

  // Open URL dialog
  const openImageUrlDialog = (type: 'banner' | 'avatar') => {
    currentImageType.value = type
    imageUrl.value = ''
    showUrlDialog.value = true
  }

  // Set image from URL
  const setImageFromUrl = () => {
    if (imageUrl.value && isValidUrl(imageUrl.value)) {
      if (currentImageType.value === 'banner') {
        profileImage.value = imageUrl.value
      } else {
        avatarImage.value = imageUrl.value
      }
      showUrlDialog.value = false
      imageUrl.value = ''
    }
  }

  // Trigger file upload
  const triggerFileUpload = (type: 'banner' | 'avatar') => {
    if (type === 'banner') {
      bannerFileInput.value?.click()
    } else {
      avatarFileInput.value?.click()
    }
  }

  // Handle banner upload
  const handleBannerUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        profileImage.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        avatarImage.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  // Validate URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Save changes to database
  const saveChanges = async () => {
    if (!user.value?.id) {
      useSonner.error("Error", {
        description: "User not authenticated"
      })
      return
    }

    try {
      const response = await $fetch<{ success: boolean; user: any; message: string }>('/api/user/profile', {
        method: 'PUT',
        body: {
          id: user.value.id,
          name: editableName.value,
          email: editableEmail.value
        }
      })

      if (response.success) {
        // Update the user state with the new data
        setUser(response.user)
        
        useSonner.success("Profile Updated", {
          description: "Your profile has been updated successfully"
        })
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      
      let errorMessage = 'Failed to update profile. Please try again.'
      
      if (error.data?.statusMessage) {
        errorMessage = error.data.statusMessage
      } else if (error.message) {
        errorMessage = error.message
      }
      
      useSonner.error("Update Failed", {
        description: errorMessage
      })
    }
  }

  // Watch for prop changes
  watch(() => props.image, (newImage) => {
    profileImage.value = newImage
  })

  watch(() => props.avatar, (newAvatar) => {
    avatarImage.value = newAvatar
  })

  watch(() => props.title, (newTitle) => {
    editableName.value = newTitle
  })

  watch(() => props.description, (newDescription) => {
    editableEmail.value = newDescription
  })

  // Watch for user data changes and update editable fields
  watch(() => user.value, (newUser) => {
    if (newUser) {
      editableName.value = newUser.name
      editableEmail.value = newUser.email
    }
  }, { immediate: true })
</script>

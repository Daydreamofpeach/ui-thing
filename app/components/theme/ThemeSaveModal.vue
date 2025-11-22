<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="sm:max-w-[500px]">
      <UiDialogHeader>
        <UiDialogTitle>Save Theme as Template</UiDialogTitle>
        <UiDialogDescription>
          Save your custom theme configuration as a reusable template.
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="space-y-2">
          <UiLabel for="theme-name">Theme Name *</UiLabel>
          <UiInput
            id="theme-name"
            v-model="formData.name"
            placeholder="My Custom Theme"
            required
          />
        </div>

        <div class="space-y-2">
          <UiLabel for="theme-description">Description</UiLabel>
          <UiTextarea
            id="theme-description"
            v-model="formData.description"
            placeholder="Describe your theme..."
            :rows="3"
          />
        </div>

        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="close">
            Cancel
          </UiButton>
          <UiButton type="submit" :disabled="!isFormValid || isLoading">
            <Icon v-if="isLoading" name="lucide:loader-2" class="mr-2 size-4 animate-spin" />
            {{ isLoading ? 'Saving...' : 'Save Theme' }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { useThemeTemplateManagement } from '~/composables/useThemeTemplateManagement';

interface Props {
  open: boolean;
  themeData: {
    name: string;
    label: string;
    fonts: {
      heading: string;
      body: string;
      mono: string;
    };
    cssVars: {
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    borders?: {
      radius: string;
    };
    spacing?: {
      scale: string;
      customMultiplier: number;
    };
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  saved: [template: any];
}>();

const { saveThemeAsTemplate, isLoading } = useThemeTemplateManagement();

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) {
      close();
    }
  },
});

const formData = ref({
  name: props.themeData.name || '',
  description: '',
});

const isFormValid = computed(() => {
  return formData.value.name.trim() !== '';
});

const handleSave = async () => {
  if (!isFormValid.value) return;

  try {
    const createdTemplate = await saveThemeAsTemplate({
      name: formData.value.name,
      description: formData.value.description,
      theme: props.themeData,
    });

    emit('saved', createdTemplate);
    close();
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

const close = () => {
  formData.value = {
    name: props.themeData.name || '',
    description: '',
  };
  emit('close');
};

// Update form when theme data changes
watch(() => props.themeData, (newData) => {
  if (newData) {
    formData.value.name = newData.name || '';
  }
}, { immediate: true });
</script>


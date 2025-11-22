<template>
  <div></div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

interface Props {
  node: {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    color?: string;
  };
}

const emit = defineEmits<{
  code: [code: string];
  documentation: [doc: string];
  files: [files: FileStructure[]];
}>();

interface FileStructure {
  title: string;
  icon?: string;
  openIcon?: string;
  path?: string;
  content?: string;
  children?: FileStructure[];
}

const props = defineProps<Props>();

onMounted(() => {
  const minimalDoc = "Event trigger node that listens for and fires workflow events. Used to create event-driven workflows.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="event-node-container">
    <div class="enhanced-node event-node" :class="{ selected }">
      <Handle id="left" type="target" :position="Position.Left" />
      <Handle id="right" type="source" :position="Position.Right" />
      <Handle id="top" type="target" :position="Position.Top" />
      <Handle id="bottom" type="source" :position="Position.Bottom" />

      <NodeResizer v-if="selected" :min-width="200" :min-height="120" />

      <div class="node-header">
        <div class="flex items-center gap-2">
          <Icon name="lucide:zap" class="w-4 h-4 text-orange-600" />
          <h3 class="text-sm font-semibold text-orange-600">
            {{ data?.label || 'Event Node' }}
          </h3>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full" :class="data?.eventName ? 'bg-orange-500' : 'bg-gray-500'" />
          <span class="text-xs" :class="data?.eventName ? 'text-orange-500/70' : 'text-gray-500/70'">
            {{ data?.eventName ? 'Configured' : 'Not Configured' }}
          </span>
        </div>
      </div>

      <div class="node-details">
        <div class="detail-row">
          <span class="detail-label">Event Type</span>
          <span class="detail-value">{{ data?.eventName || 'No event selected' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category</span>
          <span class="detail-value">{{ getEventCategory(data?.eventName) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trigger</span>
          <span class="detail-value">{{ data?.trigger || 'Manual' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value" :class="getStatusClass(data?.status)">
            {{ data?.status || 'Inactive' }}
          </span>
        </div>
      </div>

      <div class="node-actions">
        <button class="action-button configure-button" @click="openEventSelector">
          {{ data?.eventName ? 'Change Event' : 'Configure Event' }}
        </button>
        <button v-if="data?.eventName" class="action-button test-button" @click="testEvent">
          Test Event
        </button>
      </div>
    </div>

    <EventsModal
      v-model:open="eventsModalOpen"
      :current-event="data?.eventName"
      @select="handleEventSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { ref } from "vue";
import EventsModal from "@canvas/modals/EventsModal.vue";

const props = defineProps<{
  id: string
  data: {
    label?: string
    eventName?: string
    trigger?: string
    status?: "active" | "inactive" | "error"
  }
  selected?: boolean
}>();

const emit = defineEmits<{
  updateData: [key: string, value: any]
}>();

const eventsModalOpen = ref(false);

function openEventSelector() {
  eventsModalOpen.value = true;
}

function handleEventSelect(eventName: string) {
  emit("updateData", "eventName", eventName);
  emit("updateData", "status", "active");
}

function testEvent() {
  console.log("Testing event:", props.data?.eventName);
}

function getEventCategory(eventName?: string): string {
  if (!eventName) return "None";
  if (eventName.startsWith("github:")) return "GitHub";
  if (eventName.startsWith("jira:")) return "Jira";
  if (eventName.startsWith("bitbucket:")) return "Bitbucket";
  if (eventName.startsWith("ci:")) return "CI/CD";
  if (eventName.startsWith("on")) return "User Events";
  if (eventName.includes("Template")) return "Templating";
  return "Miscellaneous";
}

function getStatusClass(status?: string): string {
  switch (status) {
  case "active":
    return "text-green-400";
  case "error":
    return "text-red-400";
  case "inactive":
  default:
    return "text-gray-400";
  }
}
<\/script>`;

  const modalCode = `<template>
  <div v-if="isOpen" class="events-modal-overlay" @click="handleOverlayClick">
    <div class="events-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title">
          <Icon name="lucide:zap" class="title-icon" />
          <h2>Select Event</h2>
        </div>
        <button class="close-button" @click="closeModal">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <div class="modal-content">
        <Events
          :selectable="true"
          :selected="selectedEvent"
          @select="handleEventSelect"
        />
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">Cancel</button>
        <button 
          class="confirm-button"
          :disabled="!selectedEvent"
          @click="confirmSelection"
        >
          <Icon name="lucide:check" class="w-4 h-4" />
          Select Event
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Events from '@canvas/selectors/Events.vue';

const props = defineProps<{
  open: boolean;
  currentEvent?: string | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  select: [eventName: string];
}>();

const isOpen = ref(props.open);
const selectedEvent = ref<string | null>(props.currentEvent || null);

watch(() => props.open, (newValue) => {
  isOpen.value = newValue;
});

watch(() => props.currentEvent, (newValue) => {
  selectedEvent.value = newValue || null;
});

function handleEventSelect(eventName: string) {
  selectedEvent.value = eventName;
}

function confirmSelection() {
  if (selectedEvent.value) {
    emit('select', selectedEvent.value);
    closeModal();
  }
}

function closeModal() {
  isOpen.value = false;
  emit('update:open', false);
}

function handleOverlayClick() {
  closeModal();
}
<\/script>`;

  const files: FileStructure[] = [
    {
      title: "components",
      openIcon: "vscode-icons:default-folder-opened",
      icon: "vscode-icons:default-folder",
      children: [
        {
          title: "canvas",
          openIcon: "vscode-icons:default-folder-opened",
          icon: "vscode-icons:default-folder",
          children: [
            {
              title: "nodes",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "childNodes",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "EventNode.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/childNodes/EventNode.vue",
                      content: mainCode
                    }
                  ]
                },
                {
                  title: "modals",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "EventsModal.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/modals/EventsModal.vue",
                      content: modalCode
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  emit("code", mainCode);
  emit("files", files);
});
</script>


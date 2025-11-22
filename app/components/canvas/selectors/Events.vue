<template>
	<div class="events-selector">
		<!-- Search Input -->
		<div class="search-container">
			<input
				v-model="search"
				type="text"
				placeholder="Filter events..."
				class="search-input"
			/>
			<Icon name="lucide:search" class="search-icon" />
		</div>

		<!-- Error Display -->
		<div v-if="error" class="error-message">
			{{ error }}
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="loading-message">
			Loading events...
		</div>

		<!-- Events Sections -->
		<div v-else class="events-sections">
			<div v-for="section in filteredSections" :key="section.label" class="event-section">
				<!-- Section Header -->
				<button 
					class="section-header"
					@click="toggleSection(section.label)"
				>
					<div class="section-title">
						<Icon :name="section.icon" class="section-icon" />
						<span>{{ section.label }}</span>
					</div>
					<Icon 
						name="lucide:chevron-down" 
						class="chevron-icon"
						:class="{ 'rotate-180': !openSections[section.label] }"
					/>
				</button>

				<!-- Section Content -->
				<div v-if="openSections[section.label]" class="section-content">
					<div 
						v-for="event in section.events" 
						:key="event.name" 
						class="event-item"
					>
						<button
							class="event-button"
							:class="{ 'selected': selectedEvent === event.name }"
							@click="selectEvent(event.name)"
						>
							<Icon :name="event.icon" class="event-icon" />
							<span class="event-name">{{ event.name }}</span>
						</button>
						<button
							class="help-button"
							@click="searchEvent(event.name)"
							:title="`Search for ${event.name}`"
						>
							<Icon name="lucide:help-circle" class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<!-- No Results -->
			<div v-if="!filteredSections.some(s => s.events.length)" class="no-results">
				No events found matching "{{ search }}"
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface EventItem {
	name: string;
	icon: string;
}

interface EventSection {
	label: string;
	icon: string;
	events: EventItem[];
}

// Props
const props = defineProps<{
	selectable?: boolean;
	selected?: string | null;
}>();

// Emits
const emit = defineEmits<{
	select: [eventName: string];
}>();

// State
const search = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const openSections = ref<Record<string, boolean>>({});
const selectedEvent = ref<string | null>(props.selected || null);

// Methods
function toggleSection(label: string) {
	openSections.value[label] = !openSections.value[label];
}

function selectEvent(eventName: string) {
	if (props.selectable) {
		selectedEvent.value = eventName;
	}
	emit('select', eventName);
}

function searchEvent(eventName: string) {
	const url = `https://www.google.com/search?q=event+${encodeURIComponent(eventName)}`;
	window.open(url, '_blank');
}

// Event sections data
const eventSections: EventSection[] = [
	{
		label: 'User Events',
		icon: 'lucide:user',
		events: [
			'onClick',
			'onDoubleClick',
			'onHover',
			'onFocus',
			'onBlur',
			'onLoad',
			'onUnload',
			'onChange',
			'onInput',
			'onSubmit',
			'onKeyDown',
			'onKeyUp',
			'onKeyPress',
			'onMouseDown',
			'onMouseUp',
			'onMouseMove',
			'onMouseEnter',
			'onMouseLeave',
			'onScroll',
			'onResize',
			'onDrag',
			'onDrop',
			'onContextMenu',
			'onTouchStart',
			'onTouchEnd',
			'onTouchMove',
			'onTouchCancel',
			'onSelect',
			'onCopy',
			'onCut',
			'onPaste',
			'onAnimationStart',
			'onAnimationEnd',
			'onAnimationIteration',
			'onTransitionEnd'
		].map((name) => ({ name, icon: 'lucide:mouse-pointer-click' }))
	},
	{
		label: 'Templating Events',
		icon: 'lucide:file-text',
		events: [
			'onTemplateCreate',
			'onTemplateUpdate',
			'onTemplateDelete',
			'onTemplateRender',
			'onTemplateExport',
			'onTemplateImport',
			'onTemplateValidate',
			'onTemplateError'
		].map((name) => ({ name, icon: 'lucide:file-text' }))
	},
	{
		label: 'GitHub Events',
		icon: 'simple-icons:github',
		events: [
			'github:push',
			'github:pull_request_opened',
			'github:pull_request_closed',
			'github:pull_request_merged',
			'github:issue_opened',
			'github:issue_closed',
			'github:release_published',
			'github:workflow_run',
			'github:commit_comment',
			'github:star',
			'github:fork'
		].map((name) => ({ name, icon: 'simple-icons:github' }))
	},
	{
		label: 'Jira Events',
		icon: 'lucide:clipboard-list',
		events: [
			'jira:issue_created',
			'jira:issue_updated',
			'jira:issue_deleted',
			'jira:comment_created',
			'jira:comment_updated',
			'jira:comment_deleted',
			'jira:worklog_updated',
			'jira:worklog_deleted'
		].map((name) => ({ name, icon: 'lucide:clipboard-list' }))
	},
	{
		label: 'Bitbucket Events',
		icon: 'lucide:git-branch',
		events: [
			'bitbucket:repo_push',
			'bitbucket:pullrequest_created',
			'bitbucket:pullrequest_merged',
			'bitbucket:pullrequest_declined',
			'bitbucket:issue_created',
			'bitbucket:issue_updated',
			'bitbucket:issue_comment_created'
		].map((name) => ({ name, icon: 'lucide:git-branch' }))
	},
	{
		label: 'CI/CD & DevOps Events',
		icon: 'lucide:server-cog',
		events: [
			'ci:build_started',
			'ci:build_passed',
			'ci:build_failed',
			'ci:deploy_started',
			'ci:deploy_succeeded',
			'ci:deploy_failed',
			'ci:test_passed',
			'ci:test_failed',
			'ci:artifact_uploaded',
			'ci:artifact_downloaded'
		].map((name) => ({ name, icon: 'lucide:server-cog' }))
	},
	{
		label: 'Miscellaneous Dev Events',
		icon: 'lucide:codesandbox',
		events: [
			'onBranchCreated',
			'onBranchDeleted',
			'onTagCreated',
			'onTagDeleted',
			'onPipelineStarted',
			'onPipelineFinished',
			'onReviewRequested',
			'onReviewSubmitted',
			'onEnvironmentCreated',
			'onEnvironmentDeleted'
		].map((name) => ({ name, icon: 'lucide:codesandbox' }))
	}
];

// Computed
const filteredSections = computed(() => {
	if (!search.value) return eventSections;
	return eventSections
		.map((section) => ({
			...section,
			events: section.events.filter((ev) => 
				ev.name.toLowerCase().includes(search.value.toLowerCase())
			)
		}))
		.filter((section) => section.events.length > 0);
});

// Initialize - open all sections by default
if (Object.keys(openSections.value).length === 0) {
	eventSections.forEach((section) => {
		openSections.value[section.label] = true;
	});
}

// Watch for prop changes
watch(() => props.selected, (newSelected) => {
	selectedEvent.value = newSelected;
});
</script>

<style scoped>
.events-selector {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

/* Search Container */
.search-container {
	position: relative;
	width: 100%;
}

.search-input {
	width: 100%;
	padding: 0.75rem 1rem;
	padding-right: 2.5rem;
	background: rgba(var(--color-neutral-rgb), 0.08);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.15);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.875rem;
	backdrop-filter: blur(12px);
	transition: all 0.2s ease;
}

.search-input:focus {
	outline: none;
	border-color: rgba(var(--color-primary-rgb), 0.5);
	box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.search-input::placeholder {
	color: rgba(255, 255, 255, 0.5);
}

.search-icon {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	width: 1rem;
	height: 1rem;
	color: rgba(255, 255, 255, 0.5);
	pointer-events: none;
}

/* Messages */
.error-message {
	padding: 0.75rem;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 0.5rem;
	color: rgb(248, 113, 113);
	font-size: 0.875rem;
}

.loading-message {
	padding: 0.75rem;
	text-align: center;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.875rem;
}

.no-results {
	padding: 1rem;
	text-align: center;
	color: rgba(255, 255, 255, 0.5);
	font-size: 0.875rem;
}

/* Events Sections */
.events-sections {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.event-section {
	background: rgba(var(--color-neutral-rgb), 0.05);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.1);
	border-radius: 0.75rem;
	backdrop-filter: blur(12px);
	overflow: hidden;
}

/* Section Header */
.section-header {
	width: 100%;
	padding: 0.75rem 1rem;
	background: none;
	border: none;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.2s ease;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
	font-size: 0.875rem;
}

.section-header:hover {
	background: rgba(var(--color-primary-rgb), 0.1);
	color: var(--color-primary);
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.section-icon {
	width: 1rem;
	height: 1rem;
	flex-shrink: 0;
}

.chevron-icon {
	width: 1rem;
	height: 1rem;
	transition: transform 0.2s ease;
	flex-shrink: 0;
}

/* Section Content */
.section-content {
	padding: 0 0.5rem 0.75rem 0.5rem;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.event-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0 0.5rem;
}

.event-button {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: rgba(var(--color-neutral-rgb), 0.08);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.15);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	min-width: 0;
}

.event-button:hover {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
	transform: translateY(-1px);
}

.event-button.selected {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	color: var(--color-primary);
}

.event-icon {
	width: 0.875rem;
	height: 0.875rem;
	flex-shrink: 0;
}

.event-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.help-button {
	padding: 0.375rem;
	background: rgba(var(--color-neutral-rgb), 0.08);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.15);
	border-radius: 0.375rem;
	color: rgba(255, 255, 255, 0.6);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.help-button:hover {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
	transform: translateY(-1px);
}

/* Scrollbar Styling */
.events-sections::-webkit-scrollbar {
	width: 6px;
}

.events-sections::-webkit-scrollbar-track {
	background: rgba(var(--color-neutral-rgb), 0.05);
	border-radius: 3px;
}

.events-sections::-webkit-scrollbar-thumb {
	background: rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 3px;
}

.events-sections::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-neutral-rgb), 0.3);
}
</style>

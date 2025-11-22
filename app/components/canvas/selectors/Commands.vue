<template>
	<div class="commands-selector">
		<!-- Search Input -->
		<div class="search-container">
			<input
				v-model="search"
				type="text"
				placeholder="Filter commands..."
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
			Loading commands...
		</div>

		<!-- Commands Sections -->
		<div v-else class="commands-sections">
			<div v-for="section in filteredSections" :key="section.letter" class="command-section">
				<!-- Section Header -->
				<button 
					class="section-header"
					@click="toggleSection(section.letter)"
				>
					<div class="section-title">
						<Icon name="lucide:terminal" class="section-icon" />
						<span>{{ section.letter }}</span>
					</div>
					<Icon 
						name="lucide:chevron-down" 
						class="chevron-icon"
						:class="{ 'rotate-180': !openSections[section.letter] }"
					/>
				</button>

				<!-- Section Content -->
				<div v-if="openSections[section.letter]" class="section-content">
					<div 
						v-for="cmd in section.commands" 
						:key="cmd" 
						class="command-item"
					>
						<button
							class="command-button"
							:class="{ 'selected': selectedCommand === cmd }"
							@click="selectCommand(cmd)"
						>
							<Icon name="lucide:terminal" class="command-icon" />
							<span class="command-name">{{ cmd }}</span>
						</button>
						<button
							class="help-button"
							@click="searchCommand(cmd)"
							:title="`Search for ${cmd}`"
						>
							<Icon name="lucide:help-circle" class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<!-- No Results -->
			<div v-if="!filteredSections.some(s => s.commands.length)" class="no-results">
				No commands found matching "{{ search }}"
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// Props
const props = defineProps<{
	commands: string[];
	loading: boolean;
	error: string | null;
	selectable?: boolean;
	selected?: string | null;
}>();

// Emits
const emit = defineEmits<{
	select: [commandName: string];
	google: [commandName: string];
}>();

// State
const search = ref('');
const selectedCommand = ref<string | null>(props.selected || null);
const openSections = ref<Record<string, boolean>>({});

// Methods
function toggleSection(letter: string) {
	openSections.value[letter] = !openSections.value[letter];
}

function selectCommand(commandName: string) {
	if (props.selectable) {
		selectedCommand.value = commandName;
	}
	emit('select', commandName);
}

function searchCommand(commandName: string) {
	const url = `https://www.google.com/search?q=PowerShell+${encodeURIComponent(commandName)}`;
	window.open(url, '_blank');
	emit('google', commandName);
}

// Computed
const filteredCommands = computed(() => {
	const commands = props.commands ?? [];
	if (!search.value) return commands;
	return commands.filter((cmd) => cmd.toLowerCase().includes(search.value.toLowerCase()));
});

// Group commands by first letter, sort, and filter
const filteredSections = computed(() => {
	const groups: Record<string, string[]> = {};
	for (const cmd of filteredCommands.value) {
		const letter = cmd[0]?.toUpperCase() || "#";
		if (!groups[letter]) groups[letter] = [];
		groups[letter].push(cmd);
	}
	return Object.keys(groups)
		.sort()
		.map((letter) => ({
			letter,
			commands: (groups[letter] ?? []).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
		}));
});

// Watch for prop changes
watch(() => props.selected, (newSelected) => {
	selectedCommand.value = newSelected;
});
</script>

<style scoped>
.commands-selector {
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

/* Commands Sections */
.commands-sections {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.command-section {
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

.command-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0 0.5rem;
}

.command-button {
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

.command-button:hover {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
	transform: translateY(-1px);
}

.command-button.selected {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	color: var(--color-primary);
}

.command-icon {
	width: 0.875rem;
	height: 0.875rem;
	flex-shrink: 0;
}

.command-name {
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
.commands-sections::-webkit-scrollbar {
	width: 6px;
}

.commands-sections::-webkit-scrollbar-track {
	background: rgba(var(--color-neutral-rgb), 0.05);
	border-radius: 3px;
}

.commands-sections::-webkit-scrollbar-thumb {
	background: rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 3px;
}

.commands-sections::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-neutral-rgb), 0.3);
}
</style>

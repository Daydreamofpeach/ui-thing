<template>
	<div class="git-actions-selector">
		<!-- Search Input -->
		<div class="search-container">
			<input
				v-model="search"
				type="text"
				placeholder="Filter git commands..."
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
			Loading git commands...
		</div>

		<!-- Git Commands Grid -->
		<div v-else class="git-actions-sections">
			<div class="git-commands-grid">
				<div 
					v-for="cmd in filteredCommands" 
					:key="cmd" 
					class="git-command-item"
				>
					<button
						class="git-command-button"
						:class="{ 'selected': selectedCommand === cmd }"
						@click="selectCommand(cmd)"
					>
						<Icon name="lucide:git-branch" class="git-command-icon" />
						<span class="git-command-name">{{ cmd }}</span>
					</button>
					<button
						class="help-button"
						@click="searchGitCommand(cmd)"
						:title="`Search for git ${cmd}`"
					>
						<Icon name="lucide:help-circle" class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- No Results -->
			<div v-if="!filteredCommands.length" class="no-results">
				<div v-if="!commands.length && !loading">
					No git commands found. Make sure git is installed and available in your PATH.
				</div>
				<div v-else>
					No git commands found matching "{{ search }}"
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

// Props
const props = defineProps<{
	selectable?: boolean;
	selected?: string | null;
}>();

// Emits
const emit = defineEmits<{
	select: [commandName: string];
}>();

// State
const search = ref('');
const commands = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedCommand = ref<string | null>(props.selected || null);

// Methods
function selectCommand(commandName: string) {
	if (props.selectable) {
		selectedCommand.value = commandName;
	}
	emit('select', commandName);
}

function searchGitCommand(commandName: string) {
	const url = `https://www.google.com/search?q=git+command+${encodeURIComponent(commandName)}`;
	window.open(url, '_blank');
}

// Load git commands
const loadGitCommands = async () => {
	loading.value = true;
	error.value = null;
	
	try {
		const resp = await useTauriShellCommand.create("exec-pwsh", [
			"-Command",
			"git --list-cmds=main,others,alias,nohelpers | ConvertTo-Json"
		]).execute();
		
		if (resp.code === 0 && resp.stdout) {
			const result = resp.stdout.trim();
			let parsed: string[] = [];
			if (result.startsWith("[")) {
				parsed = JSON.parse(result);
			} else if (result) {
				parsed = [JSON.parse(result)];
			}
			commands.value = Array.from(new Set(parsed)).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
		} else {
			error.value = resp.stderr || "Failed to fetch git commands. Make sure git is installed and available in your PATH.";
		}
	} catch (e: any) {
		error.value = e.message || "Failed to fetch git commands. Make sure git is installed and available in your PATH.";
	} finally {
		loading.value = false;
	}
};

// Computed
const filteredCommands = computed(() => {
	const list = commands.value ?? [];
	if (!search.value) return list;
	return list.filter((cmd) => cmd.toLowerCase().includes(search.value.toLowerCase()));
});

// Watch for prop changes
watch(() => props.selected, (newSelected) => {
	selectedCommand.value = newSelected;
});

// Load commands on mount
onMounted(() => {
	loadGitCommands();
});
</script>

<style scoped>
.git-actions-selector {
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

/* Git Actions Sections */
.git-actions-sections {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

.git-commands-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
	padding: 0.5rem;
}

.git-command-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.git-command-button {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: rgba(var(--color-neutral-rgb), 0.08);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.15);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.875rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	min-width: 0;
}

.git-command-button:hover {
	background: rgba(168, 85, 247, 0.15);
	border-color: rgba(168, 85, 247, 0.3);
	color: rgb(168, 85, 247);
	transform: translateY(-1px);
}

.git-command-button.selected {
	background: rgba(168, 85, 247, 0.2);
	border-color: rgba(168, 85, 247, 0.4);
	color: rgb(168, 85, 247);
}

.git-command-icon {
	width: 1.125rem;
	height: 1.125rem;
	flex-shrink: 0;
}

.git-command-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: 500;
}

.help-button {
	padding: 0.5rem;
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
.git-actions-sections::-webkit-scrollbar {
	width: 6px;
}

.git-actions-sections::-webkit-scrollbar-track {
	background: rgba(var(--color-neutral-rgb), 0.05);
	border-radius: 3px;
}

.git-actions-sections::-webkit-scrollbar-thumb {
	background: rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 3px;
}

.git-actions-sections::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-neutral-rgb), 0.3);
}
</style>

<template>
	<div class="views-selector">
		<!-- Search Input -->
		<div class="search-container">
			<input
				v-model="search"
				type="text"
				placeholder="Filter view types..."
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
			Loading view types...
		</div>

		<!-- Views List -->
		<div v-else class="views-sections">
			<div class="views-grid">
				<div 
					v-for="view in filteredViewTypes" 
					:key="view.name" 
					class="view-item"
				>
					<button
						class="view-button"
						:class="{ 'selected': selectedView === view.name }"
						@click="selectView(view.name)"
					>
						<Icon :name="view.icon" class="view-icon" />
						<span class="view-name">{{ view.name }}</span>
					</button>
					<button
						class="help-button"
						@click="searchView(view.name)"
						:title="`Search for ${view.name}`"
					>
						<Icon name="lucide:help-circle" class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- No Results -->
			<div v-if="!filteredViewTypes.length" class="no-results">
				No view types found matching "{{ search }}"
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface ViewType {
	name: string;
	icon: string;
}

// Props
const props = defineProps<{
	selectable?: boolean;
	selected?: string | null;
}>();

// Emits
const emit = defineEmits<{
	select: [viewName: string];
}>();

// State
const search = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const selectedView = ref<string | null>(props.selected || null);

// Methods
function selectView(viewName: string) {
	if (props.selectable) {
		selectedView.value = viewName;
	}
	emit('select', viewName);
}

function searchView(viewName: string) {
	const url = `https://www.google.com/search?q=file+type+${encodeURIComponent(viewName)}`;
	window.open(url, '_blank');
}

// View types data
const viewTypes: ViewType[] = [
	{ name: "PDF", icon: "lucide:file-text" },
	{ name: "DOCX", icon: "lucide:file-text" },
	{ name: "HTML", icon: "lucide:file-code" },
	{ name: "Markdown", icon: "lucide:file-text" },
	{ name: "CSV", icon: "lucide:file-spreadsheet" },
	{ name: "XLSX", icon: "lucide:file-spreadsheet" },
	{ name: "PNG", icon: "lucide:file-image" },
	{ name: "SVG", icon: "lucide:file-image" },
	{ name: "JSON", icon: "lucide:file-json" },
	{ name: "XML", icon: "lucide:file-code" },
	{ name: "YAML", icon: "lucide:file-code" },
	{ name: "TXT", icon: "lucide:file-text" },
	{ name: "JPG", icon: "lucide:file-image" },
	{ name: "GIF", icon: "lucide:file-image" },
	{ name: "MP4", icon: "lucide:file-video" },
	{ name: "MP3", icon: "lucide:file-audio" },
	{ name: "ZIP", icon: "lucide:file-archive" },
	{ name: "TAR", icon: "lucide:file-archive" },
	{ name: "EXE", icon: "lucide:file" },
	{ name: "PPTX", icon: "lucide:file-text" },
	{ name: "ODT", icon: "lucide:file-text" },
	{ name: "ODS", icon: "lucide:file-spreadsheet" },
	{ name: "ODP", icon: "lucide:file-text" },
	{ name: "LaTeX", icon: "lucide:file-code" },
	{ name: "SVGZ", icon: "lucide:file-image" },
	{ name: "BMP", icon: "lucide:file-image" },
	{ name: "TIFF", icon: "lucide:file-image" },
	{ name: "WEBP", icon: "lucide:file-image" },
	{ name: "RTF", icon: "lucide:file-text" },
	{ name: "LOG", icon: "lucide:file-text" },
	{ name: "BIN", icon: "lucide:file" },
	{ name: "SQL", icon: "lucide:file-code" },
	{ name: "YML", icon: "lucide:file-code" },
	{ name: "TSV", icon: "lucide:file-spreadsheet" },
	{ name: "TS", icon: "lucide:file-code" },
	{ name: "JS", icon: "lucide:file-code" },
	{ name: "CSS", icon: "lucide:file-code" },
	{ name: "SCSS", icon: "lucide:file-code" },
	{ name: "LESS", icon: "lucide:file-code" },
	{ name: "SASS", icon: "lucide:file-code" },
	{ name: "C", icon: "lucide:file-code" },
	{ name: "CPP", icon: "lucide:file-code" },
	{ name: "JAVA", icon: "lucide:file-code" },
	{ name: "PY", icon: "lucide:file-code" },
	{ name: "RB", icon: "lucide:file-code" },
	{ name: "GO", icon: "lucide:file-code" },
	{ name: "R", icon: "lucide:file-code" },
	{ name: "PHP", icon: "lucide:file-code" },
	{ name: "SH", icon: "lucide:file-code" },
	{ name: "BAT", icon: "lucide:file-code" },
	{ name: "PL", icon: "lucide:file-code" },
	{ name: "SWIFT", icon: "lucide:file-code" },
	{ name: "KOTLIN", icon: "lucide:file-code" },
	{ name: "RUST", icon: "lucide:file-code" },
	{ name: "DART", icon: "lucide:file-code" },
	{ name: "SCALA", icon: "lucide:file-code" },
	{ name: "HASKELL", icon: "lucide:file-code" },
	{ name: "LUA", icon: "lucide:file-code" },
	{ name: "MATLAB", icon: "lucide:file-code" },
	{ name: "JSON5", icon: "lucide:file-json" },
	{ name: "AVRO", icon: "lucide:file-code" },
	{ name: "PARQUET", icon: "lucide:file-code" },
	{ name: "PROTOBUF", icon: "lucide:file-code" },
	{ name: "FEATHER", icon: "lucide:file-code" },
	{ name: "ARFF", icon: "lucide:file-code" },
	{ name: "SAV", icon: "lucide:file-code" },
	{ name: "DTA", icon: "lucide:file-code" },
	{ name: "POR", icon: "lucide:file-code" },
	{ name: "SAS7BDAT", icon: "lucide:file-code" },
	{ name: "XPT", icon: "lucide:file-code" },
	{ name: "M", icon: "lucide:file-code" },
	{ name: "IPYNB", icon: "lucide:file-code" },
	{ name: "NOTEBOOK", icon: "lucide:file-code" }
];

// Computed
const filteredViewTypes = computed(() => {
	if (!search.value) return viewTypes;
	return viewTypes.filter((view) => view.name.toLowerCase().includes(search.value.toLowerCase()));
});

// Watch for prop changes
watch(() => props.selected, (newSelected) => {
	selectedView.value = newSelected;
});
</script>

<style scoped>
.views-selector {
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

/* Views Sections */
.views-sections {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

.views-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
	padding: 0.5rem;
}

.view-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.view-button {
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

.view-button:hover {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
	transform: translateY(-1px);
}

.view-button.selected {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	color: var(--color-primary);
}

.view-icon {
	width: 1.125rem;
	height: 1.125rem;
	flex-shrink: 0;
}

.view-name {
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
.views-sections::-webkit-scrollbar {
	width: 6px;
}

.views-sections::-webkit-scrollbar-track {
	background: rgba(var(--color-neutral-rgb), 0.05);
	border-radius: 3px;
}

.views-sections::-webkit-scrollbar-thumb {
	background: rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 3px;
}

.views-sections::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-neutral-rgb), 0.3);
}
</style>

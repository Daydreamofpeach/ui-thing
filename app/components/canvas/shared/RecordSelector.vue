<template>
	<div class="record-selector-panel" @wheel.stop>
		<!-- Section Header -->
		<div v-if="!hideHeader" class="section-header" :style="headerStyle">
			<slot name="header-icon">
				<UIcon v-if="headerIcon" :name="headerIcon" class="w-4 h-4" :class="iconClass" />
			</slot>
			<span class="text-sm font-medium text-white/80">{{ headerTitle }}</span>
			<div class="count-badge" :style="badgeStyle">
				{{ filteredRecords.length }} {{ recordTypePlural }}
			</div>
		</div>

		<!-- Search Bar -->
		<div v-if="!isLoading && records.length > 0" class="search-bar-container">
			<SearchBar
				v-model="searchQuery"
				:placeholder="`Search ${recordTypePlural}...`"
			/>
		</div>

		<!-- Actions Slot -->
		<div v-if="!isLoading && $slots.actions" class="actions-container">
			<slot name="actions" />
		</div>

		<!-- Loading State -->
		<div v-if="isLoading" class="loading-state">
			<UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin" :class="iconClass" />
			<span class="text-sm text-white/60">Loading {{ recordTypePlural }}...</span>
		</div>

		<!-- Empty State -->
		<div v-else-if="records.length === 0" class="empty-state">
			<slot name="empty-state">
				<UIcon name="i-lucide-inbox" class="w-8 h-8 text-white/30" />
				<p class="text-sm text-white/50">
					No {{ recordTypePlural }} available
				</p>
				<p class="text-xs text-white/40">
					{{ emptyMessage }}
				</p>
			</slot>
		</div>

		<!-- No Results State (when search returns nothing) -->
		<div v-else-if="filteredRecords.length === 0" class="empty-state">
			<UIcon name="i-lucide-search-x" class="w-8 h-8 text-white/30" />
			<p class="text-sm text-white/50">
				No {{ recordTypePlural }} found
			</p>
			<p class="text-xs text-white/40">
				Try adjusting your search
			</p>
		</div>

		<!-- Records List -->
		<div v-else class="records-list" @wheel.stop>
			<button
				v-for="record in filteredRecords"
				:key="record[idKey]"
				class="record-item"
				:class="{ selected: selectedRecordId === record[idKey] }"
				@click.stop="selectRecord(record)"
				@mousedown.stop
			>
				<!-- Custom Item Template -->
				<slot name="item" :record="record" :is-selected="selectedRecordId === record[idKey]">
					<!-- Default Item Template -->
					<div class="record-item-header">
						<UIcon v-if="itemIcon" :name="itemIcon" class="w-4 h-4" :class="iconClass" />
						<span class="record-name">{{ getRecordName(record) }}</span>
						<UIcon
							v-if="selectedRecordId === record[idKey]"
							name="i-lucide-check-circle"
							class="w-4 h-4 text-green-400 ml-auto"
						/>
					</div>
					<div v-if="record[descriptionKey]" class="record-description">
						{{ record[descriptionKey] }}
					</div>
					<div v-if="showMeta" class="record-meta">
						<slot name="meta" :record="record">
							<span v-if="record[typeKey]" class="meta-tag">{{ record[typeKey] }}</span>
							<span v-if="record.enabled !== undefined" class="meta-tag" :class="record.enabled ? 'enabled' : 'disabled'">
								{{ record.enabled ? 'Enabled' : 'Disabled' }}
							</span>
						</slot>
					</div>
				</slot>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import SearchBar from "@components/ui/SearchBar.vue";
	import { computed, ref, watch } from "vue";

 interface Props {
		// Records data
		records: any[]
		idKey?: string
		nameKey?: string
		descriptionKey?: string
		typeKey?: string

		// Labels
		recordTypeSingular?: string
		recordTypePlural?: string
		headerTitle?: string
		emptyMessage?: string

		// Icons
		headerIcon?: string
		itemIcon?: string
		iconClass?: string

		// States
		isLoading?: boolean
		selectedId?: string | null

		// Styling
		themeColor?: string
		showMeta?: boolean
		hideHeader?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		idKey: "id",
		nameKey: "name",
		descriptionKey: "description",
		typeKey: "type",
		recordTypeSingular: "record",
		recordTypePlural: "records",
		headerTitle: "Available Records",
		emptyMessage: "No records found",
		headerIcon: "i-lucide-database",
		itemIcon: undefined,
		iconClass: "text-cyan-400",
		isLoading: false,
		selectedId: null,
		themeColor: "6, 182, 212", // cyan-500 RGB
		showMeta: true,
		hideHeader: false
	});

	const emit = defineEmits<{
		select: [record: any]
		attach: [record: any]
	}>();

	// Internal selected state
	const selectedRecordId = ref<string | null>(props.selectedId);

	// Search state
	const searchQuery = ref("");

	// Cache for searchable text to avoid rebuilding on every filter
	const searchableTextCache = new Map<any, string>();

	// Computed styles
	const headerStyle = computed(() => ({
		backgroundColor: `rgba(${props.themeColor}, 0.1)`
	}));

	const badgeStyle = computed(() => ({
		backgroundColor: `rgba(${props.themeColor}, 0.2)`,
		borderColor: `rgba(${props.themeColor}, 0.3)`,
		color: `rgb(${props.themeColor})`
	}));

	/**
	 * Get record name with fallback
	 */
	const getRecordName = (record: any): string => {
		return record[props.nameKey] || record[props.typeKey] || "Unnamed";
	};

	/**
	 * Normalize search string for better matching
	 */
	const normalizeString = (str: string): string => {
		return str.toLowerCase().trim().replace(/\s+/g, " ");
	};

	/**
	 * Build searchable text from record (with caching)
	 */
	const getSearchableText = (record: any): string => {
		// Check cache first
		const recordId = record[props.idKey];
		if (recordId && searchableTextCache.has(recordId)) {
			return searchableTextCache.get(recordId)!;
		}

		// Build searchable text
		const parts: string[] = [];

		// Primary fields (highest priority)
		const name = getRecordName(record);
		if (name && name !== "Unnamed") parts.push(name);

		const description = record[props.descriptionKey];
		if (description && typeof description === "string") parts.push(description);

		const type = record[props.typeKey];
		if (type && typeof type === "string") parts.push(type);

		// Secondary searchable fields
		const searchableFields = ["key", "label", "title", "email", "username", "status", "category", "tags"];
		searchableFields.forEach((field) => {
			const value = record[field];
			if (value && typeof value === "string") {
				parts.push(value);
			}
		});

		// Join all parts and normalize
		const searchableText = normalizeString(parts.join(" "));

		// Cache the result
		if (recordId) {
			searchableTextCache.set(recordId, searchableText);
		}

		return searchableText;
	};

	/**
	 * Check if a record matches the search query
	 */
	const matchesSearch = (record: any, normalizedQuery: string, queryWords: string[]): boolean => {
		const searchableText = getSearchableText(record);

		// Fast path: check if all query words are present
		// This is much faster than regex for multi-word queries
		if (queryWords.length > 1) {
			return queryWords.every((word) => searchableText.includes(word));
		}

		// Single word or phrase search
		return searchableText.includes(normalizedQuery);
	};

	/**
	 * Filter records based on search query (optimized)
	 */
	const filteredRecords = computed(() => {
		const query = searchQuery.value.trim();

		// Fast path: no search query
		if (!query) {
			return props.records;
		}

		// Normalize and split query into words for multi-word search
		const normalizedQuery = normalizeString(query);
		const queryWords = normalizedQuery.split(" ").filter((w) => w.length > 0);

		// Fast path: empty after normalization
		if (queryWords.length === 0) {
			return props.records;
		}

		// Filter records efficiently
		const filtered = props.records.filter((record) => {
			return matchesSearch(record, normalizedQuery, queryWords);
		});

		return filtered;
	});

	/**
	 * Select a record and attach it immediately
	 */
	const selectRecord = (record: any) => {
		selectedRecordId.value = record[props.idKey];
		emit("select", record);
		emit("attach", record);
	};

	// Watch for external selectedId changes
	watch(() => props.selectedId, (newId) => {
		selectedRecordId.value = newId;
	});

	// Clear cache when records change to avoid stale data
	watch(() => props.records, () => {
		searchableTextCache.clear();
	}, { deep: false });
</script>

<style scoped>
/* Record Selector Panel */
.record-selector-panel {
	padding: 1rem;
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
}

/* Section Header */
.section-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: rgba(6, 182, 212, 0.1);
	border-radius: 0.5rem;
	margin-bottom: 0.5rem;
	flex-shrink: 0;
}

/* Search Bar Container */
.search-bar-container {
	margin-bottom: 0.75rem;
	flex-shrink: 0;
}

.actions-container {
	margin-bottom: 0.75rem;
}

.count-badge {
	margin-left: auto;
	padding: 0.25rem 0.5rem;
	background: rgba(6, 182, 212, 0.2);
	border: 1px solid rgba(6, 182, 212, 0.3);
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 700;
	color: rgb(6, 182, 212);
}

/* Loading State */
.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 3rem 1rem;
	text-align: center;
}

/* Records List */
.records-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 1rem;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	min-height: 200px;
	max-height: 400px;
	cursor: default;
	padding-right: 8px;
}

.records-list::-webkit-scrollbar {
	width: 10px;
}

.records-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 5px;
	margin: 2px 0;
}

.records-list::-webkit-scrollbar-thumb {
	background: rgba(6, 182, 212, 0.6);
	border-radius: 5px;
	border: 2px solid rgba(0, 0, 0, 0.3);
}

.records-list::-webkit-scrollbar-thumb:hover {
	background: rgba(6, 182, 212, 0.8);
}

/* Record Item */
.record-item {
	padding: 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	width: 100%;
	flex-shrink: 0;
	position: relative;
}

.record-item:hover {
	background: rgba(255, 255, 255, 0.08);
	border-color: rgba(6, 182, 212, 0.3);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}

.record-item.selected {
	background: rgba(6, 182, 212, 0.15);
	border-color: rgba(6, 182, 212, 0.5);
	box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.record-item-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}

.record-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.record-description {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 0.5rem;
	line-height: 1.4;
}

/* Record Meta */
.record-meta {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.meta-tag {
	padding: 0.25rem 0.5rem;
	background: rgba(99, 102, 241, 0.2);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	color: rgb(99, 102, 241);
	text-transform: uppercase;
}

.meta-tag.enabled {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.3);
	color: rgb(34, 197, 94);
}

.meta-tag.disabled {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.3);
	color: rgb(239, 68, 68);
}
</style>


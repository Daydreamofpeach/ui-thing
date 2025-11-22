<template>
	<div v-if="customNodeProps" class="enhanced-node webview-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Resizer -->
		<NodeResizer v-if="customNodeProps.selected" :min-width="200" :min-height="120" />

		<!-- Node Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:globe" class="w-4 h-4 text-blue-600" />
				<h3 class="text-sm font-semibold text-blue-600">
					{{ customNodeProps.data?.label || 'Web Preview' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full bg-blue-500" />
				<span class="text-xs text-blue-500/70">Active</span>
			</div>
		</div>

		<!-- URL Input Section -->
		<div class="webview-url-section">
			<div class="url-input-container">
				<Icon name="lucide:link" class="url-icon" />
				<input
					:value="customNodeProps.data?.url || ''"
					type="url"
					placeholder="Enter URL (https://example.com)"
					class="url-input"
					@input="(event) => updateNodeData(customNodeProps.id, 'url', (event.target as HTMLInputElement).value)"
					@keyup.enter="$emit('load-url-content', customNodeProps.id, customNodeProps.data?.url, customNodeProps.data?.htmlContent)"
				>
				<button
					class="load-url-button"
					:disabled="!customNodeProps.data?.url"
					@click="$emit('load-url-content', customNodeProps.id, customNodeProps.data?.url, customNodeProps.data?.htmlContent)"
				>
					<Icon name="lucide:arrow-right" class="w-4 h-4" />
				</button>
			</div>
			<div class="url-mode-toggle">
				<button
					class="mode-button"
					:class="{ active: !customNodeProps.data?.url }"
					@click="$emit('switch-to-html-mode', customNodeProps.id)"
				>
					<Icon name="lucide:code" class="w-3 h-3" />
					HTML Mode
				</button>
				<button
					class="mode-button"
					:class="{ active: customNodeProps.data?.url }"
					@click="$emit('switch-to-url-mode', customNodeProps.id)"
				>
					<Icon name="lucide:globe" class="w-3 h-3" />
					URL Mode
				</button>
			</div>
		</div>

		<!-- Webview Content -->
		<div class="webview-content">
			<!-- Webview Actions -->
			<div class="webview-actions">
				<button
					class="webview-action-button"
					:disabled="!customNodeProps.data?.url"
					@click="$emit('open-in-tauri-webview', customNodeProps.id, customNodeProps.data?.url, customNodeProps.data?.htmlContent)"
				>
					<Icon name="lucide:external-link" class="w-4 h-4" />
					Open in Tauri Webview
				</button>
				<button
					class="webview-action-button"
					:disabled="!customNodeProps.data?.url"
					@click="$emit('open-in-external-browser', customNodeProps.data?.url)"
				>
					<Icon name="lucide:globe" class="w-4 h-4" />
					Open External
				</button>
			</div>

			<!-- Webview Display -->
			<div class="webview-display">
				<div v-if="!customNodeProps.data?.url" class="no-url-state">
					<Icon name="lucide:globe" class="w-12 h-12 text-gray-400 mb-4" />
					<h4 class="text-sm font-medium text-gray-300 mb-2">
						No URL Loaded
					</h4>
					<p class="text-xs text-gray-500">
						Enter a URL above to start browsing
					</p>
				</div>
				<div v-else class="webview-iframe-container">
					<div v-if="isWebviewLoading" class="loading-overlay">
						<div class="loading-spinner" />
						<span class="loading-text">Loading {{ customNodeProps.data?.url }}...</span>
					</div>
					<iframe
						:src="customNodeProps.data?.url"
						class="webview-iframe"
						sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
						@load="$emit('webview-load', customNodeProps.id)"
						@error="$emit('webview-error', customNodeProps.id, $event)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		isWebviewLoading: boolean
	}

	defineProps<Props>();

	defineEmits<{
		"load-url-content": [nodeId: string, url: string, htmlContent?: string]
		"switch-to-html-mode": [nodeId: string]
		"switch-to-url-mode": [nodeId: string]
		"open-in-tauri-webview": [nodeId: string, url: string, htmlContent?: string]
		"open-in-external-browser": [url: string]
		"webview-load": [nodeId: string]
		"webview-error": [nodeId: string, event: Event]
	}>();
</script>

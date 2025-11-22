<template>
	<UiCard>
		<UiCardHeader>
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
					<UIcon name="i-lucide-check-circle" class="size-6 text-green-500" />
				</div>
				<div>
					<UiCardTitle>Automatically Generated Forms</UiCardTitle>
					<p class="text-sm text-muted-foreground mt-1">
						{{ forms.length }} form(s) created successfully
					</p>
				</div>
			</div>
		</UiCardHeader>
		<UiCardContent>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<UiCard
					v-for="form in forms"
					:key="form.id"
					class="hover:border-primary transition-all"
				>
					<UiCardContent class="p-4 space-y-3">
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
								<UIcon name="i-lucide-file-text" class="size-4 text-green-500" />
							</div>
							<div class="flex-1 min-w-0">
								<h5 class="font-medium text-sm truncate">
									{{ form.title }}
								</h5>
								<p class="text-xs text-muted-foreground line-clamp-1">
									{{ form.description }}
								</p>
							</div>
						</div>

						<div class="flex items-center justify-between text-xs text-muted-foreground">
							<span>{{ form.fields?.length || 0 }} fields</span>
							<span>{{ form.lastModified || "Just now" }}</span>
						</div>

						<!-- Form Artifacts -->
						<div class="space-y-1">
							<div v-if="form.html" class="flex items-center gap-2 text-xs text-green-400">
								<UIcon name="i-lucide-file-code" class="size-3" />
								HTML Generated
							</div>
							<div v-if="form.css" class="flex items-center gap-2 text-xs text-blue-400">
								<UIcon name="i-lucide-palette" class="size-3" />
								CSS Generated
							</div>
							<div v-if="form.json" class="flex items-center gap-2 text-xs text-purple-400">
								<UIcon name="i-lucide-database" class="size-3" />
								JSON Schema
							</div>
						</div>

						<!-- Actions -->
						<div class="flex gap-2 pt-2">
							<UiButton
								variant="outline"
								size="sm"
								class="flex-1"
								title="Preview form with automated submission chain"
								@click="$emit('previewWithChain', form)"
							>
								<UIcon name="i-lucide-eye" class="size-4" />
								Preview & Test
							</UiButton>
							<UiButton
								variant="ghost"
								size="sm"
								title="Attach hook to form"
								@click="$emit('attachHook', form)"
							>
								<UIcon name="i-lucide-link" class="size-4" />
							</UiButton>
						</div>
					</UiCardContent>
				</UiCard>
			</div>
		</UiCardContent>
	</UiCard>
</template>

<script setup lang="ts">
import UiCard from "~/components/Ui/Card/Card.vue";
import UiCardHeader from "~/components/Ui/Card/Header.vue";
import UiCardTitle from "~/components/Ui/Card/Title.vue";
import UiCardContent from "~/components/Ui/Card/Content.vue";
import UiButton from "~/components/Ui/Button.vue";
import UIcon from "~/components/Ui/Icon.vue";

interface Form {
	id: string
	title?: string
	description?: string
	fields?: any[]
	lastModified?: string
	html?: string
	css?: string
	json?: any
}

interface Props {
	forms: Form[]
}

defineProps<Props>();

defineEmits<{
	formSelected: [form: Form]
	previewWithChain: [form: Form]
	attachHook: [form: Form]
}>();
</script>

<style scoped>
.line-clamp-1 {
	display: -webkit-box;
	line-clamp: 1;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>


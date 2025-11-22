<template>
	<div class="project-analysis-display">
		<div class="text-sm text-muted-foreground mb-2">
			Project Analysis:
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
			<UiCard v-if="analysis.frontend" class="bg-primary/10 border-primary/20">
				<UiCardContent class="p-2">
					<div class="text-primary font-medium">
						Frontend
					</div>
					<div class="text-muted-foreground">
						{{ analysis.frontend.name }}
					</div>
				</UiCardContent>
			</UiCard>
			<UiCard v-if="analysis.backend" class="bg-success/10 border-success/20">
				<UiCardContent class="p-2">
					<div class="text-success font-medium">
						Backend
					</div>
					<div class="text-muted-foreground">
						{{ analysis.backend.name }}
					</div>
				</UiCardContent>
			</UiCard>
			<UiCard v-if="analysis.database" class="bg-secondary/10 border-secondary/20">
				<UiCardContent class="p-2">
					<div class="text-secondary-foreground font-medium">
						Database
					</div>
					<div class="text-muted-foreground">
						{{ analysis.database.name }}
					</div>
				</UiCardContent>
			</UiCard>
		</div>
	</div>
</template>

<script setup lang="ts">
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";

	interface Props {
		analysis: {
			frontend?: { name: string };
			backend?: { name: string };
			database?: { name: string };
		};
	}

	defineProps<Props>();
</script>


<template>
	<UiCard>
		<UiCardHeader>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<UIcon name="i-lucide-wand-2" class="size-5 text-primary" />
					<div>
						<UiCardTitle>Form Automation</UiCardTitle>
						<p class="text-sm text-muted-foreground mt-1">
							Select templates to automate form creation
						</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-2 h-2 rounded-full bg-green-500" />
					<span class="text-xs text-muted-foreground">
						{{ selectedTemplates.length }} selected
					</span>
				</div>
			</div>
		</UiCardHeader>
		<UiCardContent class="space-y-4">
			<!-- Creation Mode Selector -->
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Creation Mode:</span>
				<div class="flex gap-2 border rounded-md p-1">
					<UiButton
						variant="ghost"
						size="sm"
						:class="localCreationMode === 'automated' ? 'bg-primary text-primary-foreground' : ''"
						@click="localCreationMode = 'automated'; handleModeChange('automated')"
					>
						Automated (guided)
					</UiButton>
					<UiButton
						variant="ghost"
						size="sm"
						:class="localCreationMode === 'instant' ? 'bg-primary text-primary-foreground' : ''"
						@click="localCreationMode = 'instant'; handleModeChange('instant')"
					>
						Instant (no walkthrough)
					</UiButton>
				</div>
			</div>

			<!-- Template Grid -->
			<div>
				<h4 class="text-base font-medium mb-2">Available Templates</h4>
				<p class="text-sm text-muted-foreground mb-4">
					Select one or more templates to automate form creation
				</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					<UiCard
						v-for="template in formTemplates"
						:key="template.id"
						class="cursor-pointer transition-all hover:border-primary"
						:class="{ 'border-primary bg-primary/10': isTemplateSelected(template) }"
						@click="toggleTemplate(template)"
					>
						<UiCardContent class="p-4">
							<div class="flex items-start gap-3">
								<div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
									<UIcon name="i-lucide-file-text" class="size-5 text-primary" />
								</div>
								<div class="flex-1 min-w-0">
									<h5 class="font-medium mb-1 text-sm">
										{{ template.title }}
									</h5>
									<p class="text-xs text-muted-foreground mb-2 line-clamp-2">
										{{ template.description }}
									</p>
									<div class="flex flex-wrap gap-1">
										<UiBadge variant="outline" class="text-xs">
											{{ template.fields?.length || 0 }} fields
										</UiBadge>
										<UiBadge variant="secondary" class="text-xs">
											{{ template.category }}
										</UiBadge>
									</div>
								</div>
								<div class="flex-shrink-0">
									<div
										class="w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
										:class="isTemplateSelected(template)
											? 'bg-primary border-primary'
											: 'border-muted-foreground/30'"
									>
										<UIcon
											v-if="isTemplateSelected(template)"
											name="i-lucide-check"
											class="size-3 text-primary-foreground"
										/>
									</div>
								</div>
							</div>
						</UiCardContent>
					</UiCard>
				</div>
			</div>

			<!-- Selected Templates Summary -->
			<UiCard v-if="selectedTemplates.length > 0" class="bg-primary/10 border-primary/20">
				<UiCardContent class="p-4">
					<h5 class="font-medium text-primary mb-2 text-sm">
						Selected Templates ({{ selectedTemplates.length }})
					</h5>
					<div class="flex flex-wrap gap-2">
						<UiBadge
							v-for="template in selectedTemplates"
							:key="template.id"
							variant="default"
							class="text-xs"
						>
							{{ template.title }}
						</UiBadge>
					</div>
				</UiCardContent>
			</UiCard>

			<!-- Action Buttons -->
			<div class="flex flex-col sm:flex-row gap-2 justify-center pt-2">
				<UiButton
					variant="outline"
					class="w-full sm:w-auto"
					@click="$emit('createNew')"
				>
					<UIcon name="i-lucide-plus" class="size-4" />
					Create New Form
				</UiButton>
				<UiButton
					class="w-full sm:w-auto"
					:disabled="selectedTemplates.length === 0"
					@click="$emit('automate')"
				>
					<UIcon name="i-lucide-rocket" class="size-4" />
					{{ localCreationMode === 'instant' ? 'Create Instantly' : 'Automate Forms' }} 
					({{ selectedTemplates.length }})
				</UiButton>
			</div>
		</UiCardContent>
	</UiCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useFormTemplateManagement } from "~/composables/useFormTemplateManagement";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiCardHeader from "~/components/Ui/Card/Header.vue";
import UiCardTitle from "~/components/Ui/Card/Title.vue";
import UiCardContent from "~/components/Ui/Card/Content.vue";
import UiButton from "~/components/Ui/Button.vue";
import UiBadge from "~/components/Ui/Badge.vue";
import UIcon from "~/components/Ui/Icon.vue";

interface Template {
	id: string
	title: string
	description: string
	icon?: string
	category: string
	tags?: string[]
	fields?: any[]
}

interface Props {
	selectedTemplates: Template[]
	creationMode: "automated" | "instant"
}

const props = defineProps<Props>();

const emit = defineEmits<{
	"update:selectedTemplates": [templates: Template[]]
	"update:creationMode": [mode: "automated" | "instant"]
	"modeChanged": [mode: "automated" | "instant"]
	automate: []
	createNew: []
}>();

const localCreationMode = computed({
	get: () => props.creationMode,
	set: (value) => emit("update:creationMode", value as "automated" | "instant")
});

const { templates: savedTemplates, loadTemplates } = useFormTemplateManagement();

// Form templates data
const formTemplates = ref<Template[]>([
	{
		id: "contact-us",
		title: "Contact Us Form",
		description: "Get in touch with us",
		icon: "i-lucide-mail",
		category: "communication",
		tags: ["contact", "support", "inquiry"],
		fields: [
			{ label: "Name", type: "text", required: true },
			{ label: "Email", type: "email", required: true },
			{ label: "Subject", type: "text", required: true },
			{ label: "Message", type: "textarea", required: true }
		]
	},
	{
		id: "signup",
		title: "Sign Up Form",
		description: "Create your account to get started",
		icon: "i-lucide-user-plus",
		category: "authentication",
		tags: ["registration", "signup", "account"],
		fields: [
			{ label: "Full Name", type: "text", required: true },
			{ label: "Email Address", type: "email", required: true },
			{ label: "Password", type: "password", required: true },
			{ label: "Terms Agreement", type: "checkbox", required: true }
		]
	},
	{
		id: "newsletter-signup",
		title: "Newsletter Signup",
		description: "Subscribe to our newsletter for updates and insights",
		icon: "i-lucide-newspaper",
		category: "newsletter",
		tags: ["newsletter", "subscription", "email"],
		fields: [
			{ label: "First Name", type: "text", required: true },
			{ label: "Last Name", type: "text", required: true },
			{ label: "Email Address", type: "email", required: true },
			{ label: "Preferences", type: "select", required: true },
			{ label: "Marketing Consent", type: "checkbox", required: true }
		]
	},
	{
		id: "feedback-form",
		title: "Feedback Form",
		description: "Share your thoughts and suggestions with us",
		icon: "i-lucide-message-square",
		category: "feedback",
		tags: ["feedback", "suggestions", "improvement"],
		fields: [
			{ label: "Your Name", type: "text", required: false },
			{ label: "Email Address", type: "email", required: false },
			{ label: "Feedback Type", type: "select", required: true },
			{ label: "Rating", type: "select", required: true },
			{ label: "Your Feedback", type: "textarea", required: true }
		]
	},
	{
		id: "login-automation",
		title: "Login Form",
		description: "User login form with email, password, remember me, and reCAPTCHA",
		icon: "i-lucide-lock",
		category: "auth",
		tags: ["login", "authentication", "user", "recaptcha"],
		fields: [
			{ label: "Email", type: "email", required: true },
			{ label: "Password", type: "password", required: true },
			{ label: "Remember Me", type: "checkbox", required: false },
			{ label: "reCAPTCHA", type: "recaptcha", required: true }
		]
	},
	{
		id: "ratings-form",
		title: "Ratings Form",
		description: "Collect user ratings and feedback with a star rating field",
		icon: "i-lucide-star",
		category: "feedback",
		tags: ["ratings", "feedback", "review", "stars"],
		fields: [
			{ label: "Name", type: "text", required: true },
			{ label: "Email", type: "email", required: true },
			{ label: "Rating", type: "rating", required: true },
			{ label: "Comments", type: "textarea", required: false },
			{ label: "reCAPTCHA", type: "recaptcha", required: true }
		]
	}
]);

// Template selection functions
const isTemplateSelected = (template: Template) => {
	return props.selectedTemplates.some((t) => t.id === template.id);
};

const toggleTemplate = (template: Template) => {
	const current = [...props.selectedTemplates];
	const index = current.findIndex((t) => t.id === template.id);
	if (index > -1) {
		current.splice(index, 1);
	} else {
		current.push(template);
	}
	emit("update:selectedTemplates", current);
};

	const handleModeChange = (value: string | null) => {
		if (value) {
			emit("update:creationMode", value as "automated" | "instant");
			emit("modeChanged", value as "automated" | "instant");
		}
	};

	// Load saved templates from BAPI
	const refreshTemplates = async () => {
		await loadTemplates();
		
		// Clear existing saved templates from the list
		formTemplates.value = formTemplates.value.filter(t => 
			!savedTemplates.value.some(st => st.id === t.id)
		);
		
		// Add saved templates to the list
		savedTemplates.value.forEach((template) => {
			const existingIndex = formTemplates.value.findIndex(t => t.id === template.id);
			if (existingIndex === -1) {
				formTemplates.value.push({
					id: template.id,
					title: template.title,
					description: template.description,
					icon: "i-lucide-file-text",
					category: template.category || "custom",
					tags: template.tags || ["custom"],
					fields: template.fields || []
				});
			} else {
				// Update existing template
				formTemplates.value[existingIndex] = {
					id: template.id,
					title: template.title,
					description: template.description,
					icon: "i-lucide-file-text",
					category: template.category || "custom",
					tags: template.tags || ["custom"],
					fields: template.fields || []
				};
			}
		});
	};

	onMounted(async () => {
		await refreshTemplates();
	});

	// Watch for template changes and refresh
	watch(() => savedTemplates.value, () => {
		refreshTemplates();
	}, { deep: true });
</script>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>


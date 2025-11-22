import { computed, ref } from "vue";
import type { AutomationStep } from "~/utils/formAutomationSteps";

export interface AutomationOptions {
	template: any
	config: any
}

export function useAutomationWizard() {
	const isAutomationActive = ref(false);
	const currentAutomationStep = ref(0);
	const automationSteps = ref<AutomationStep[]>([]);
	const automationProgress = ref(0);
	const currentFieldIndex = ref(0);

	const automationProgressIndicator = computed(() => {
		if (!isAutomationActive.value) return null;

		return {
			progress: automationProgress.value,
			currentStep: currentAutomationStep.value + 1,
			totalSteps: automationSteps.value.length,
			currentStepTitle: automationSteps.value[currentAutomationStep.value]?.title || ""
		};
	});

	const startAutomation = (options: AutomationOptions, formTemplate: any) => {
		console.log("🚀 Starting smart automation with template:", options.template);

		// Convert template automation steps to smart automation steps
		automationSteps.value = [
			{
				id: "set-form-title",
				title: "Setting Form Title",
				description: "Entering form title...",
				action: "type",
				target: "form-title-input",
				value: formTemplate.title,
				delay: 1000
			},
			{
				id: "set-form-description",
				title: "Adding Description",
				description: "Adding form description...",
				action: "type",
				target: "form-description-input",
				value: formTemplate.description,
				delay: 1000
			},
			{
				id: "set-submit-button",
				title: "Customizing Submit Button",
				description: "Setting submit button text...",
				action: "type",
				target: "submit-button-label",
				value: formTemplate.submitLabel,
				delay: 1000
			}
		];

		// Add steps for each field in the template
		formTemplate.fields.forEach((field: any, index: number) => {
			// Add field step
			automationSteps.value.push({
				id: `add-field-${index}`,
				title: `Adding ${field.label} Field`,
				description: `Adding ${field.label.toLowerCase()} field...`,
				action: "click",
				target: "add-field-button",
				delay: 1000
			});

			// Configure field step
			automationSteps.value.push({
				id: `configure-field-${index}`,
				title: `Configuring ${field.label} Field`,
				description: `Setting up ${field.label.toLowerCase()} field...`,
				action: "configure_field",
				target: "field-config",
				value: field,
				fieldIndex: index,
				delay: 1500
			});
		});

		// Add save step
		automationSteps.value.push({
			id: "save-form",
			title: "Saving Form",
			description: "Saving your completed form...",
			action: "click",
			target: "save-form-button",
			delay: 1000
		});

		currentAutomationStep.value = 0;
		currentFieldIndex.value = 0;
		automationProgress.value = 0;
		isAutomationActive.value = true;

		console.log(`📋 Created ${automationSteps.value.length} automation steps`);
	};

	const stopAutomation = () => {
		isAutomationActive.value = false;
		automationSteps.value = [];
		automationProgress.value = 0;
		currentAutomationStep.value = 0;
	};

	const completeAutomation = () => {
		isAutomationActive.value = false;
		currentAutomationStep.value = 0;
		automationSteps.value = [];
		automationProgress.value = 0;
	};

	return {
		// State
		isAutomationActive: readonly(isAutomationActive),
		currentAutomationStep: readonly(currentAutomationStep),
		automationSteps: readonly(automationSteps),
		automationProgress: readonly(automationProgress),
		currentFieldIndex: readonly(currentFieldIndex),
		automationProgressIndicator,

		// Methods
		startAutomation,
		stopAutomation,
		completeAutomation,

		// Internal methods for component use
		_setAutomationActive: (value: boolean) => {
			isAutomationActive.value = value;
		},
		_setCurrentStep: (step: number) => {
			currentAutomationStep.value = step;
		},
		_setProgress: (progress: number) => {
			automationProgress.value = progress;
		}
	};
}

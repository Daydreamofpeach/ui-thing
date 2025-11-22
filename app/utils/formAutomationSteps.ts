import type { FormField } from "~/composables/useFormTemplateManagement";

export interface AutomationStep {
	id: string;
	title: string;
	description: string;
	action: "type" | "click" | "select" | "add_field" | "configure_field" | "wait";
	target?: string;
	value?: any;
	fieldIndex?: number;
	delay?: number;
	completed?: boolean;
}

/**
 * Generate automation steps from form configuration
 * These steps will be saved with the template and executed to demonstrate form creation
 */
export function generateAutomationSteps(
	formTitle: string,
	formDescription: string,
	submitLabel: string,
	fields: FormField[]
): AutomationStep[] {
	const steps: AutomationStep[] = [];

	// Step 1: Set form title
	steps.push({
		id: "form-title",
		title: "Setting Form Title",
		description: `Entering "${formTitle}" as the form title`,
		action: "type",
		target: "form-title-input",
		value: formTitle,
		delay: 800
	});

	// Step 2: Set form description
	if (formDescription) {
		steps.push({
			id: "form-description",
			title: "Setting Form Description",
			description: `Entering form description`,
			action: "type",
			target: "form-description-input",
			value: formDescription,
			delay: 800
		});
	}

	// Step 3: Set submit label
	steps.push({
		id: "form-submit-label",
		title: "Setting Submit Button Label",
		description: `Setting submit button text to "${submitLabel}"`,
		action: "type",
		target: "form-submit-label-input",
		value: submitLabel,
		delay: 800
	});

	// Step 4: Add each field
	fields.forEach((field, index) => {
		// Click "Add Field" button
		steps.push({
			id: `add-field-btn-${index}`,
			title: `Adding Field ${index + 1}`,
			description: `Clicking "Add Field" button`,
			action: "click",
			target: "add-field-button",
			delay: 1000
		});

		// Select field type in modal
		steps.push({
			id: `select-field-type-${index}`,
			title: `Selecting Field Type: ${field.component || field.type}`,
			description: `Selecting ${field.component || field.type} from field type dropdown`,
			action: "select",
			target: "field-type-select",
			value: field.component || field.type,
			delay: 1200
		});

		// Fill in field label
		steps.push({
			id: `field-label-${index}`,
			title: `Setting Field Label: ${field.label}`,
			description: `Entering "${field.label}" as the field label`,
			action: "type",
			target: "field-label-input",
			value: field.label,
			delay: 600
		});

		// Fill in field name
		steps.push({
			id: `field-name-${index}`,
			title: `Setting Field Name: ${field.name}`,
			description: `Entering "${field.name}" as the field identifier`,
			action: "type",
			target: "field-name-input",
			value: field.name,
			delay: 600
		});

		// Fill in placeholder if provided
		if (field.placeholder) {
			steps.push({
				id: `field-placeholder-${index}`,
				title: `Setting Placeholder: ${field.placeholder}`,
				description: `Entering placeholder text`,
				action: "type",
				target: "field-placeholder-input",
				value: field.placeholder,
				delay: 500
			});
		}

		// Fill in description if provided
		if (field.description) {
			steps.push({
				id: `field-description-${index}`,
				title: `Setting Field Description`,
				description: `Entering field help text`,
				action: "type",
				target: "field-description-input",
				value: field.description,
				delay: 600
			});
		}

		// Set required checkbox if needed
		if (field.required) {
			steps.push({
				id: `field-required-${index}`,
				title: `Marking Field as Required`,
				description: `Enabling required checkbox`,
				action: "click",
				target: "field-required-checkbox",
				delay: 400
			});
		}

		// Configure options for Select, MultiSelect, RadioGroup
		if (field.options && field.options.length > 0) {
			steps.push({
				id: `field-options-${index}`,
				title: `Configuring Field Options`,
				description: `Adding ${field.options.length} options to the field`,
				action: "configure_field",
				target: "field-options-textarea",
				value: field.options.map((opt: any) => opt.label || opt.value || opt).join("\n"),
				fieldIndex: index,
				delay: 1000
			});
		}

		// Click "Add Field" button in modal to confirm
		steps.push({
			id: `confirm-field-${index}`,
			title: `Confirming Field ${index + 1}`,
			description: `Clicking "Add Field" to confirm`,
			action: "click",
			target: "confirm-add-field-button",
			delay: 1000
		});
	});

	return steps;
}


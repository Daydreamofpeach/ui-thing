import { ref, computed } from "vue";
import type { AutomationStep } from "~/utils/formAutomationSteps";

export interface AutomationState {
	isRunning: boolean;
	currentStep: number;
	totalSteps: number;
	progress: number;
	status: "idle" | "running" | "paused" | "completed" | "error";
	error?: string;
	currentAction?: string;
}

export interface AutomationConfig {
	autoSave: boolean;
	showProgress: boolean;
	enableValidation: boolean;
	delayBetweenSteps: number;
}

/**
 * Enhanced Form Builder Automation Engine
 * Interacts with the form builder UI to demonstrate form creation
 */
export function useFormBuilderAutomation() {
	const state = ref<AutomationState>({
		isRunning: false,
		currentStep: 0,
		totalSteps: 0,
		progress: 0,
		status: "idle"
	});

	const config = ref<AutomationConfig>({
		autoSave: true,
		showProgress: true,
		enableValidation: true,
		delayBetweenSteps: 800
	});

	// Callbacks for UI interaction
	let onStepCompleteCallback: ((step: AutomationStep, index: number) => void) | null = null;
	let onStateChangeCallback: ((state: AutomationState) => void) | null = null;
	let onCompleteCallback: (() => void) | null = null;
	let onErrorCallback: ((error: string) => void) | null = null;

	// Form builder interaction functions
	let formBuilderRef: any = null;
	let formBuilderNodeId: string | null = null;

	/**
	 * Set the form builder reference for direct interaction
	 */
	const setFormBuilderRef = (ref: any, nodeId: string) => {
		formBuilderRef = ref;
		formBuilderNodeId = nodeId;
	};

	/**
	 * Find element in form builder by target selector
	 */
	const findElement = (target: string): HTMLElement | null => {
		if (!formBuilderRef) return null;

		// Try to find element within form builder node
		const formBuilderElement = document.querySelector(`[data-node-id="${formBuilderNodeId}"]`);
		if (!formBuilderElement) return null;

		// Map target names to actual selectors
		const selectorMap: Record<string, string> = {
			"form-title-input": 'input[placeholder*="title" i], input[placeholder*="Form Title"]',
			"form-description-input": 'input[placeholder*="description" i], input[placeholder*="Description"]',
			"form-submit-label-input": 'input[placeholder*="submit" i], input[placeholder*="Submit Label"]',
			"add-field-button": 'button:has-text("Add Field"), button[aria-label*="Add Field" i]',
			"field-type-select": 'select, [role="combobox"]',
			"field-label-input": 'input[placeholder*="label" i], input[placeholder*="Field label"]',
			"field-name-input": 'input[placeholder*="name" i], input[placeholder*="field_name"]',
			"field-placeholder-input": 'input[placeholder*="placeholder" i]',
			"field-description-input": 'textarea[placeholder*="description" i], textarea[placeholder*="Helpful text"]',
			"field-required-checkbox": 'input[type="checkbox"]',
			"field-options-textarea": 'textarea[placeholder*="option" i]',
			"confirm-add-field-button": 'button:has-text("Add Field"), button:has-text("Confirm")'
		};

		const selector = selectorMap[target] || target;
		return formBuilderElement.querySelector(selector) as HTMLElement;
	};

	/**
	 * Execute a single automation step
	 */
	const executeStep = async (step: AutomationStep, index: number): Promise<void> => {
		state.value.currentAction = step.title;
		state.value.currentStep = index;

		// Wait for delay if specified
		if (step.delay) {
			await delay(step.delay);
		}

		try {
			switch (step.action) {
				case "type":
					await performType(step.target || "", step.value || "");
					break;
				case "click":
					await performClick(step.target || "");
					break;
				case "select":
					await performSelect(step.target || "", step.value);
					break;
				case "add_field":
					await performAddField(step.value);
					break;
				case "configure_field":
					await performConfigureField(step.value, step.fieldIndex || 0);
					break;
				case "wait":
					await delay(step.delay || 1000);
					break;
				default:
					console.warn(`Unknown action: ${step.action}`);
			}

			onStepCompleteCallback?.(step, index);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Step ${index + 1} failed: ${errorMessage}`);
		}
	};

	/**
	 * Type text into an input field
	 */
	const performType = async (target: string, value: string): Promise<void> => {
		const element = findElement(target) as HTMLInputElement | HTMLTextAreaElement;
		if (!element) {
			throw new Error(`Element not found: ${target}`);
		}

		// Focus the element
		element.focus();
		await delay(100);

		// Clear existing value
		element.value = "";
		await delay(50);

		// Type character by character for realistic effect
		for (let i = 0; i < value.length; i++) {
			element.value += value[i];
			element.dispatchEvent(new Event("input", { bubbles: true }));
			await delay(30); // Typing speed
		}

		// Trigger change event
		element.dispatchEvent(new Event("change", { bubbles: true }));
		await delay(100);
	};

	/**
	 * Click an element
	 */
	const performClick = async (target: string): Promise<void> => {
		const element = findElement(target);
		if (!element) {
			throw new Error(`Element not found: ${target}`);
		}

		// Scroll into view
		element.scrollIntoView({ behavior: "smooth", block: "center" });
		await delay(200);

		// Click the element
		element.click();
		await delay(300);
	};

	/**
	 * Select an option from a dropdown/select
	 */
	const performSelect = async (target: string, value: any): Promise<void> => {
		const element = findElement(target) as HTMLSelectElement | HTMLElement;
		if (!element) {
			throw new Error(`Element not found: ${target}`);
		}

		// Handle native select
		if (element instanceof HTMLSelectElement) {
			element.value = value;
			element.dispatchEvent(new Event("change", { bubbles: true }));
		} else {
			// Handle custom select (like UiSelect)
			// Try to find the trigger and click it
			const trigger = element.querySelector('[role="combobox"], button') as HTMLElement;
			if (trigger) {
				trigger.click();
				await delay(300);

				// Find and click the option
				const option = document.querySelector(`[data-value="${value}"], [value="${value}"]`) as HTMLElement;
				if (option) {
					option.click();
					await delay(200);
				}
			}
		}

		await delay(200);
	};

	/**
	 * Add a field to the form builder
	 */
	const performAddField = async (fieldData: any): Promise<void> => {
		// This will be handled by the form builder component directly
		// Emit an event that the form builder can listen to
		if (formBuilderRef && typeof formBuilderRef.addField === "function") {
			formBuilderRef.addField(fieldData);
		} else {
			// Fallback: dispatch custom event
			const event = new CustomEvent("form-builder:add-field", {
				detail: fieldData,
				bubbles: true
			});
			document.dispatchEvent(event);
		}
		await delay(500);
	};

	/**
	 * Configure a field in the form builder
	 */
	const performConfigureField = async (fieldData: any, fieldIndex: number): Promise<void> => {
		// This will be handled by the form builder component directly
		if (formBuilderRef && typeof formBuilderRef.configureField === "function") {
			formBuilderRef.configureField(fieldData, fieldIndex);
		} else {
			// Fallback: dispatch custom event
			const event = new CustomEvent("form-builder:configure-field", {
				detail: { fieldData, fieldIndex },
				bubbles: true
			});
			document.dispatchEvent(event);
		}
		await delay(500);
	};

	/**
	 * Start automation with given steps
	 */
	const start = async (steps: AutomationStep[], automationConfig?: Partial<AutomationConfig>) => {
		if (state.value.isRunning) {
			console.warn("Automation is already running");
			return;
		}

		// Update config if provided
		if (automationConfig) {
			config.value = { ...config.value, ...automationConfig };
		}

		// Reset state
		state.value = {
			isRunning: true,
			currentStep: 0,
			totalSteps: steps.length,
			progress: 0,
			status: "running"
		};

		onStateChangeCallback?.(state.value);

		try {
			// Execute all steps
			for (let i = 0; i < steps.length; i++) {
				if (!state.value.isRunning || state.value.status === "idle") {
					break;
				}

				if (state.value.status === "paused") {
					state.value.currentStep = i;
					return;
				}

				await executeStep(steps[i], i);

				// Update progress
				state.value.currentStep = i + 1;
				state.value.progress = ((i + 1) / steps.length) * 100;
				onStateChangeCallback?.(state.value);

				// Delay between steps
				if (i < steps.length - 1) {
					await delay(steps[i].delay || config.value.delayBetweenSteps);
				}
			}

			// Complete
			if (state.value.status === "running") {
				complete();
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			handleError(errorMessage);
		}
	};

	/**
	 * Pause automation
	 */
	const pause = () => {
		if (state.value.status === "running") {
			state.value.status = "paused";
			onStateChangeCallback?.(state.value);
		}
	};

	/**
	 * Resume automation
	 */
	const resume = async () => {
		if (state.value.status === "paused") {
			state.value.status = "running";
			onStateChangeCallback?.(state.value);
			// Continue from current step
			// This would need the steps array, so we'll handle it in the component
		}
	};

	/**
	 * Stop automation
	 */
	const stop = () => {
		state.value = {
			isRunning: false,
			currentStep: 0,
			totalSteps: 0,
			progress: 0,
			status: "idle"
		};
		onStateChangeCallback?.(state.value);
	};

	/**
	 * Complete automation
	 */
	const complete = () => {
		state.value = {
			...state.value,
			isRunning: false,
			status: "completed",
			progress: 100
		};
		onStateChangeCallback?.(state.value);
		onCompleteCallback?.();
	};

	/**
	 * Handle error
	 */
	const handleError = (error: string) => {
		state.value = {
			...state.value,
			isRunning: false,
			status: "error",
			error
		};
		onStateChangeCallback?.(state.value);
		onErrorCallback?.(error);
	};

	/**
	 * Utility: Delay
	 */
	const delay = (ms: number): Promise<void> => {
		return new Promise(resolve => setTimeout(resolve, ms));
	};

	/**
	 * Event handlers
	 */
	const onStepComplete = (callback: (step: AutomationStep, index: number) => void) => {
		onStepCompleteCallback = callback;
	};

	const onStateChange = (callback: (state: AutomationState) => void) => {
		onStateChangeCallback = callback;
	};

	const onComplete = (callback: () => void) => {
		onCompleteCallback = callback;
	};

	const onError = (callback: (error: string) => void) => {
		onErrorCallback = callback;
	};

	return {
		state: computed(() => state.value),
		config: computed(() => config.value),
		setFormBuilderRef,
		start,
		pause,
		resume,
		stop,
		onStepComplete,
		onStateChange,
		onComplete,
		onError
	};
}


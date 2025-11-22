import { ref } from 'vue';
import { useHooks } from '~/composables/useHooks';

export interface HookNodeData {
	hookId?: string;
	hookName?: string;
	hookDescription?: string;
	hookType?: string;
	hookTriggers?: string[];
	hookTriggerInput?: string;
	hookToken?: string;
}

export function useHookNodeManagement() {
	const { createHook, fetchAvailableHooks } = useHooks();
	const isCreating = ref(false);
	const error = ref<string | null>(null);
	const availableHookTypes = ref<any[]>([]);

	/**
	 * Load available hook types from the API
	 */
	const loadAvailableHookTypes = async () => {
		try {
			console.log('🔧 Loading available hook types from API...');
			const types = await fetchAvailableHooks();
			
			if (types && Array.isArray(types)) {
				availableHookTypes.value = types.map((type: any) => ({
					label: type.label || type.name || type.type || type,
					value: type.value || type.type || type,
					...type
				}));
				console.log('✅ Loaded available hook types:', availableHookTypes.value);
			} else {
				console.warn('⚠️ No hook types returned from API');
				availableHookTypes.value = [];
			}
			
			return availableHookTypes.value;
		} catch (err) {
			console.error('❌ Failed to load available hook types:', err);
			// Set empty array on error - no fake fallbacks
			availableHookTypes.value = [];
			return [];
		}
	};

	/**
	 * Create a hook from node data following the exact API specification
	 */
	const createHookFromNodeData = async (
		nodeData: HookNodeData,
		organisationId: string
	): Promise<any> => {
		isCreating.value = true;
		error.value = null;

		try {
			// Validate required fields
			if (!nodeData.hookName || !nodeData.hookName.trim()) {
				throw new Error('Hook name is required');
			}

			if (!nodeData.hookTriggers || nodeData.hookTriggers.length === 0) {
				throw new Error('At least one trigger is required');
			}

			if (!organisationId) {
				throw new Error('Organisation ID is required');
			}

			// Use a valid hook type from the API enum
			// Valid types: ['BUTT', 'SNS', 'WEBHOOK', 'EMAIL', 'SLACK', 'DISCORD']
			let validHookType = 'BUTT'; // Default to BUTT as it's commonly used
			try {
				const availableTypes = await fetchAvailableHooks();
				if (availableTypes && availableTypes.length > 0) {
					// Use BUTT type if available, otherwise use the first available type
					validHookType = availableTypes.find((type: any) => 
						type.type === 'BUTT'
					)?.type || availableTypes[0]?.type || 'BUTT';
				}
			} catch (typeError) {
				console.warn('⚠️ Could not fetch available hook types, using BUTT as default:', typeError);
			}

			// Build hook data according to API specification
			// Required fields per API: name, type, trigger
			const hookPayload: any = {
				name: nodeData.hookName.trim(),
				type: validHookType,
				trigger: [...(nodeData.hookTriggers || [])], // Ensure it's a plain array, not a proxy
				organisationId: organisationId,
				butt: `HOOK.${nodeData.hookName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_')}` // Add butt field as expected by API
			};

			// Add optional fields only if they have values
			if (nodeData.hookDescription && nodeData.hookDescription.trim()) {
				hookPayload.description = nodeData.hookDescription.trim();
			}
			console.log('🔧 Creating hook with payload:', JSON.stringify(hookPayload, null, 2));
			console.log('🔧 Using hook type:', validHookType);

			// Create the hook via API
			const createdHook = await createHook(hookPayload);

			console.log('✅ Hook created successfully:', createdHook);

			return createdHook;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			error.value = errorMessage;
			console.error('❌ Failed to create hook:', err);
			console.error('❌ Error details:', {
				message: errorMessage,
				nodeData: nodeData,
				organisationId: organisationId
			});
			throw err;
		} finally {
			isCreating.value = false;
		}
	};

	/**
	 * Add a trigger to the node's trigger list
	 */
	const addTrigger = (
		nodeData: HookNodeData,
		triggerInput: string
	): string[] => {
		if (!triggerInput || !triggerInput.trim()) {
			return nodeData.hookTriggers || [];
		}

		const triggers = nodeData.hookTriggers || [];
		const newTrigger = triggerInput.trim();

		if (!triggers.includes(newTrigger)) {
			return [...triggers, newTrigger];
		}

		return triggers;
	};

	/**
	 * Remove a trigger from the node's trigger list
	 */
	const removeTrigger = (
		nodeData: HookNodeData,
		index: number
	): string[] => {
		const triggers = nodeData.hookTriggers || [];
		const newTriggers = [...triggers];
		newTriggers.splice(index, 1);
		return newTriggers;
	};

	/**
	 * Validate hook node data before creation
	 */
	const validateHookData = (nodeData: HookNodeData): { valid: boolean; error?: string } => {
		if (!nodeData.hookName || !nodeData.hookName.trim()) {
			return { valid: false, error: 'Hook name is required' };
		}

		if (!nodeData.hookTriggers || nodeData.hookTriggers.length === 0) {
			return { valid: false, error: 'At least one trigger is required' };
		}

		return { valid: true };
	};

	return {
		// State
		isCreating,
		error,
		availableHookTypes,

		// Methods
		loadAvailableHookTypes,
		createHookFromNodeData,
		addTrigger,
		removeTrigger,
		validateHookData
	};
}


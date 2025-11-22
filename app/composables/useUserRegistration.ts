import { useToast } from "#imports";
import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export interface UserRegistrationData {
	name: string
	email: string
	password: string
	turnstileToken?: string
}

export interface UserRegistrationResponse {
	id?: string
	name?: string
	email?: string
	isActive?: boolean
	role?: {
		id?: string
		name?: string
		butt?: string
		type?: string
	}
	permissionGroups?: any[]
	createdAt?: string
	updatedAt?: string
}

export interface UserRegistrationState {
	isLoading: boolean
	error: string | null
	success: boolean
	registeredUser: UserRegistrationResponse | null
}

export function useUserRegistration() {
	const state = ref<UserRegistrationState>({
		isLoading: false,
		error: null,
		success: false,
		registeredUser: null
	});

	const toast = useToast();

	// Computed properties
	const isLoading = computed(() => state.value.isLoading);
	const error = computed(() => state.value.error);
	const success = computed(() => state.value.success);
	const registeredUser = computed(() => state.value.registeredUser);

	// Validation function
	const validateRegistrationData = (data: UserRegistrationData): string[] => {
		const errors: string[] = [];

		if (!data.name || data.name.trim().length < 2) {
			errors.push("Name must be at least 2 characters long");
		}

		if (!data.email || !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(data.email)) {
			errors.push("Please enter a valid email address");
		}

		if (!data.password || data.password.length < 8) {
			errors.push("Password must be at least 8 characters long");
		}

		// Check for strong password (optional enhancement)
		if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
			errors.push("Password should contain at least one uppercase letter, one lowercase letter, and one number");
		}

		return errors;
	};

	// Main registration function
	const registerUser = async (registrationData: UserRegistrationData): Promise<boolean> => {
		// Reset state
		state.value = {
			isLoading: true,
			error: null,
			success: false,
			registeredUser: null
		};

		try {
			console.log("[useUserRegistration] Starting user registration:", {
				name: registrationData.name,
				email: registrationData.email,
				hasPassword: !!registrationData.password,
				hasTurnstileToken: !!registrationData.turnstileToken
			});

			// Validate input data
			const validationErrors = validateRegistrationData(registrationData);
			if (validationErrors.length > 0) {
				throw new Error(validationErrors.join(". "));
			}

			// Prepare registration payload
			const registrationPayload = {
				name: registrationData.name.trim(),
				email: registrationData.email.trim().toLowerCase(),
				password: registrationData.password,
				turnstileToken: registrationData.turnstileToken || "dummy-token", // Fallback for development
				roleId: "", // Default role will be assigned by the API
				permissionGroups: [], // Will be assigned later
				settings: {} // Default empty settings
			};

			console.log("[useUserRegistration] Calling register API...");

			// Call the register API
			const response = await buttClient.register("web", registrationPayload);

			console.log("[useUserRegistration] Registration successful:", response);

			// Update state with success
			state.value = {
				isLoading: false,
				error: null,
				success: true,
				registeredUser: response
			};

			// Show success toast
			toast.add({
				title: "User Registered Successfully",
				description: `${registrationData.name} has been registered and can now access the system`,
				icon: "i-lucide-user-check",
				color: "success"
			});

			return true;
		} catch (error: any) {
			console.error("[useUserRegistration] Registration failed:", error);

			// Extract meaningful error message
			let errorMessage = "Registration failed. Please try again.";

			if (error?.message) {
				if (error.message.includes("email")) {
					errorMessage = "Email address is already registered or invalid";
				} else if (error.message.includes("password")) {
					errorMessage = "Password does not meet requirements";
				} else if (error.message.includes("turnstile")) {
					errorMessage = "Security verification failed. Please try again.";
				} else {
					errorMessage = error.message;
				}
			}

			// Update state with error
			state.value = {
				isLoading: false,
				error: errorMessage,
				success: false,
				registeredUser: null
			};

			// Show error toast
			toast.add({
				title: "Registration Failed",
				description: errorMessage,
				icon: "i-lucide-alert-circle",
				color: "error"
			});

			return false;
		}
	};

	// Reset state function
	const resetState = () => {
		state.value = {
			isLoading: false,
			error: null,
			success: false,
			registeredUser: null
		};
	};

	// Check if email is already registered (optional utility)
	const checkEmailAvailability = async (email: string): Promise<boolean> => {
		try {
			// This would need to be implemented if the API provides an endpoint for this
			// For now, we'll return true (available) and let the registration handle conflicts
			console.log("[useUserRegistration] Checking email availability:", email);
			return true;
		} catch (error) {
			console.error("[useUserRegistration] Error checking email availability:", error);
			return true; // Assume available on error
		}
	};

	// Generate turnstile token (placeholder - would need actual implementation)
	const generateTurnstileToken = async (): Promise<string> => {
		// In a real implementation, this would interact with Cloudflare Turnstile
		// For now, return a placeholder token
		return "placeholder-turnstile-token";
	};

	return {
		// State
		isLoading,
		error,
		success,
		registeredUser,

		// Actions
		registerUser,
		resetState,
		checkEmailAvailability,
		generateTurnstileToken,

		// Validation
		validateRegistrationData
	};
}

import { getButtClient } from "~/utils/buttClient";
import { navigateTo } from "#imports";
import { useButtAuth } from "@butt/client";
import { computed, nextTick, ref, watch } from "vue";

// Function to parse API errors and return appropriate error codes
function parseApiError(err: unknown): string {
	if (err instanceof Error) {
		const message = err.message.toLowerCase();

		// Check for specific API error messages first
		if (message.includes("user creation failed") || message.includes("validation rules") || message.includes("database constraints")) {
			return "validation error";
		}
		if (message.includes("email already exists") || message.includes("email already registered")) {
			return "email already exists";
		}
		if (message.includes("weak password") || message.includes("password too weak")) {
			return "weak password";
		}
		if (message.includes("invalid email") || message.includes("email format")) {
			return "invalid email";
		}
		if (message.includes("name required") || message.includes("name is required")) {
			return "name required";
		}

		// Check for HTTP status codes
		if (message.includes("401") || message.includes("unauthorized") || message.includes("invalid credentials")) {
			return "invalid credentials";
		}
		if (message.includes("403") || message.includes("forbidden") || message.includes("account locked")) {
			return "account locked";
		}
		if (message.includes("404") || message.includes("not found")) {
			return "user not found";
		}
		if (message.includes("409") || message.includes("conflict")) {
			return "email already exists";
		}
		if (message.includes("422") || message.includes("validation")) {
			return "validation error";
		}
		if (message.includes("429") || message.includes("too many requests")) {
			return "rate limited";
		}
		if (message.includes("500") || message.includes("internal server error")) {
			return "server error";
		}
		if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
			return "network error";
		}
		if (message.includes("email not verified") || message.includes("verification")) {
			return "email not verified";
		}

		// Default to unknown error
		return "unknown error";
	}

	return "unknown error";
}

export function useUnifiedAuth() {
	// Use the proven useButtAuth composable from @butt/client
	const buttClient = getButtClient();
	const buttAuth = useButtAuth(buttClient);

	// Create a direct reactive ref for authentication state
	const authState = ref(buttAuth.isAuthenticated.value);

	// Watch for authentication state changes
	watch(() => buttAuth.isAuthenticated.value, (newValue, oldValue) => {
		console.log("🔄 useUnifiedAuth: buttAuth.isAuthenticated changed:", { newValue, oldValue });
		// Sync our direct auth state ref
		authState.value = newValue;
	}, { immediate: true });

	// Add error state
	const error = ref<string | null>(null);

	// Override the login method to properly include clientInfo
	const login = async (credentials: { email: string, password: string, turnstileToken?: string }) => {
		try {
			error.value = null;

			console.log("🤬 Starting login...");
			console.log("🤬 Client state before login:", {
				isAuthenticated: buttClient.isAuthenticated(),
				hasToken: !!buttClient.getAccessToken(),
				tokenBundle: buttClient.getTokenBundle()
			});

			const result = await buttAuth.login(
				credentials.email,
				credentials.password,
				credentials.turnstileToken ? credentials.turnstileToken : undefined
			);

			console.log("🤬 Login result:", result);
			console.log("🤬 Client state after login:", {
				isAuthenticated: buttClient.isAuthenticated(),
				hasToken: !!buttClient.getAccessToken(),
				tokenBundle: buttClient.getTokenBundle()
			});

			// Wait a bit for events to process
			await new Promise((resolve) => setTimeout(resolve, 100));

			console.log("🤬 Final state after delay:", {
				isAuthenticated: buttClient.isAuthenticated(),
				authComposable: buttAuth.isAuthenticated.value,
				user: buttAuth.user.value
			});

			// Initialize environment after successful login (fire-and-forget, don't block)
			// This runs in the background and won't affect the login flow
			void (async () => {
				try {
					console.log("🌍 Initializing environment after login...");
					const { useEnvironmentInit } = await import("~/composables/useEnvironmentInit");
					const { initializeEnvironment } = useEnvironmentInit();
					const envResult = await initializeEnvironment();

					if (envResult.success) {
						console.log("✅ Environment initialized successfully:", envResult.environmentId);
					} else {
						console.warn("⚠️ Environment initialization failed:", envResult.error);
					}
				} catch (envErr) {
					console.error("❌ Failed to initialize environment:", envErr);
				}
			})();

			// Return immediately - don't wait for environment initialization
			// Proactively navigate to dashboard if we're on login route
			try {
				if (typeof window !== "undefined") {
					await navigateTo("/dashboard");
				}
			} catch (navErr) {
				console.warn("Navigation after login failed (will rely on middleware):", navErr);
			}

			return result;
		} catch (err: unknown) {
			console.error("🤬🤬 Login error:", err);
			// Parse the error to get a proper error code
			const errorCode = parseApiError(err);
			error.value = errorCode;
			throw err;
		}
	};

	// Use the logout method from @butt/client
	const logout = async () => {
		try {
			await buttAuth.logout();
			console.log("🔐 useUnifiedAuth: Logout successful");
		} catch (err) {
			console.error("❌ useUnifiedAuth: Logout error:", err);
			// Even if the API logout fails, the @butt/client handles local state cleanup
		}
	};

	// Add a force refresh mechanism for components
	const forceRefresh = ref(0);
	const triggerRefresh = () => {
		forceRefresh.value++;
		console.log("🔄 useUnifiedAuth: Triggering refresh, new value:", forceRefresh.value);
	};

	// Function to clear all related composable states
	const clearRelatedStates = async () => {
		try {
			console.log("🧹 Clearing related composable states...");

		// Clear organization and project selection states
		// These are imported dynamically to avoid circular dependencies
		const { useSelectedOrganisationId } = await import("~/composables/useSelectedOrganisationId");
		const { useProjectSelection } = await import("~/composables/useProjectSelection");

			// Clear organization selection
			const selectedOrgId = useSelectedOrganisationId();
			selectedOrgId.value = null;

			// Clear project selection
			const { clearProjectSelection } = useProjectSelection();
			clearProjectSelection();

			console.log("✅ Related states cleared");
		} catch (error) {
			console.warn("⚠️ Error clearing related states:", error);
			// Don't throw - we want logout to continue even if this fails
		}
	};

	// Function to immediately clear authentication state (for instant logout)
	const clearAuthState = async () => {
		try {
			console.log("🧹 Clearing authentication state...");

			// Clear all authentication data from storage
			const authKeys = [
				"access_token",
				"refresh_token",
				"user_data",
				"auth_state",
				"currentUser",
				"accessToken",
				"refreshToken",
				"ORG_ID",
				"current-organisation-id",
				"selected-organisation-id",
				"organisation-id",
				// Clear cache on logout
				"buildit_project_cache",
				"buildit_cache_timestamps",
				"organization-id",
				"org-id",
				"selected-organisation-id",
				"selected-organization-id",
				"selected-project-id",
				"current-project-id",
				"project-id",
				// Clear environment data
				"environment_id",
				"machine_id"
			];

			authKeys.forEach((key) => {
				try {
					localStorage.removeItem(key);
					sessionStorage.removeItem(key);
				} catch (err) {
					console.warn(`Failed to remove ${key} from storage:`, err);
				}
			});

			// Clear the buttClient's internal state by calling logout
			// This will clear the internal token cache
			try {
				await buttClient.logout();
			} catch {
				// Ignore errors, we just want to clear the token
			}

			// Force the buttAuth to re-evaluate its state
			// This should trigger the watchers to update
			buttAuth.isAuthenticated.value = false;
			buttAuth.user.value = null;

			// Also update our direct auth state ref
			authState.value = false;

			// Force a reactive update by triggering the watcher
			await nextTick();

			// Also clear the token from buttClient to ensure the computed property updates
			try {
				// Force buttClient to clear its internal token cache
				await buttClient.logout();
			} catch {
				// Ignore errors, we just want to clear the token
			}

			// Wait for the next tick to ensure reactivity updates
			await nextTick();

			// Clear related composable states
			await clearRelatedStates();

			// Trigger a refresh to force all components to update
			triggerRefresh();

			// Emit a global event to notify all components
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("auth-state-changed", {
					detail: { isAuthenticated: false, authState: false }
				}));
			}

			console.log("🔐 useUnifiedAuth: Auth state cleared immediately");
		} catch (err) {
			console.error("❌ useUnifiedAuth: Error clearing auth state:", err);
		}
	};

	// Add GitHub login method
	const loginWithGithub = async () => {
		// This would need to be implemented based on your GitHub OAuth flow
		// For now, return a placeholder
		throw new Error("GitHub login not yet implemented");
	};

	// Create a computed property for isAuthenticated to ensure reactivity
	const isAuthenticated = computed(() => {
		// Force reactivity by checking both the buttAuth state and storage
		const hasToken = buttClient.getAccessToken();
		const isAuth = (buttAuth.isAuthenticated.value || authState.value) && !!hasToken;

			// Force reactivity by including the refresh counter
		const _forceRefresh = forceRefresh.value;

		console.log("🔍 useUnifiedAuth: isAuthenticated computed:", {
			hasToken: !!hasToken,
			buttAuthValue: buttAuth.isAuthenticated.value,
			authStateValue: authState.value,
			result: isAuth,
			forceRefresh: forceRefresh.value
		});

		return isAuth;
	});

	return {
		// State - directly from useButtAuth
		isAuthenticated,
		isLoading: buttAuth.isLoading,
		user: buttAuth.user,
		ability: buttAuth.ability,
		error,

		// Direct reactive refs for components that need immediate updates
		authState,
		forceRefresh,

		// Actions - use our custom methods
		login,
		logout,
		clearAuthState,
		triggerRefresh,
		refreshTokens: buttAuth.refreshTokens,
		loginWithGithub,

		// Role and permission checking
		hasRole: buttAuth.hasRole,
		hasPermission: buttAuth.hasPermission,
		getAvailableActions: buttAuth.getAvailableActions,
		getAvailableSubjects: buttAuth.getAvailableSubjects,
		hasAnyPermissionForSubject: buttAuth.hasAnyPermissionForSubject,
		getPermissionsForSubject: buttAuth.getPermissionsForSubject,
		canPerformAnyAction: buttAuth.canPerformAnyAction,

		// Convenience aliases for backward compatibility
		currentUser: buttAuth.user,
		isLoggedIn: buttAuth.isAuthenticated,
		getAccessToken: () => buttClient.getAccessToken(),
		restoreSession: async () => {
			// The @butt/client handles session restoration automatically
			return buttAuth.isAuthenticated.value;
		},
		clearError: () => {
			error.value = null;
		},
		ensureValidToken: async () => {
			try {
				// Use the @butt/client token validation
				const token = buttClient.getAccessToken();
				return !!token;
			} catch {
				// Token validation failed
				return false;
			}
		}
	};
}

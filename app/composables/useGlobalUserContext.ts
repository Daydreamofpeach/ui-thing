/**
 * Global User Context
 *
 * Provides globally accessible current user information throughout the app.
 * Integrates with useUnifiedAuth and extracts user data from JWT tokens.
 *
 * Usage:
 *   const { currentUserId, currentUserEmail, currentUserName, isUserLoaded } = useGlobalUserContext();
 */

import { computed, ref, watch } from "vue";
import { useUnifiedAuth } from "./useUnifiedAuth";
import { getCurrentInstance, onMounted } from "vue";

// Global state (singleton pattern)
const globalUserId = ref<string>("");
const globalUserEmail = ref<string>("");
const globalUserName = ref<string>("");
const globalUserUsername = ref<string>("");
const isUserLoaded = ref<boolean>(false);

let isInitialized = false;

// Initialize auth within setup only (avoid lifecycle warnings)
function initializeAuthInSetup() {
	try {
		console.log("🌍 Initializing Global User Context auth (setup)...");
		authInstance = useUnifiedAuth();
		// Watch for authentication changes
		watch(() => authInstance!.user.value, (user) => {
			console.log("👤 Global User Context: Auth user changed:", user);
			if (user) {
				globalUserId.value = user.id || "";
				globalUserEmail.value = user.email || "";
				globalUserName.value = user.name || user.displayName || "";
				globalUserUsername.value = user.username || user.email?.split("@")[0] || "";
				isUserLoaded.value = true;
			} else {
				clearUserContext();
			}
		}, { immediate: true });
	} catch (error) {
		console.warn("⚠️ Failed to initialize auth in setup, using storage fallback:", error);
		extractUserFromStorage();
	}
}

export function useGlobalUserContext() {
	// Initialize once within a component setup context
	if (!isInitialized) {
		isInitialized = true;
		if (getCurrentInstance()) {
			initializeAuthInSetup();
		} else {
			// Outside component setup: avoid lifecycle usage, use storage/JWT only
			extractUserFromStorage();
		}
	}

	return {
		// Reactive user data
		currentUserId: computed(() => globalUserId.value),
		currentUserEmail: computed(() => globalUserEmail.value),
		currentUserName: computed(() => globalUserName.value),
		currentUserUsername: computed(() => globalUserUsername.value),
		isUserLoaded: computed(() => isUserLoaded.value),

		// Computed: Best identifier for user (email preferred, fallback to ID)
		currentUserIdentifier: computed(() =>
			globalUserEmail.value || globalUserUsername.value || globalUserId.value
		),

		// Methods
		refreshUserContext,
		clearUserContext,
		setUserContext
	};
}

/**
 * Extract user data from localStorage and JWT token
 */
function extractUserFromStorage() {
	if (typeof window === "undefined") return;

	try {
		console.log("📦 Extracting user from localStorage...");

		// Try direct email key
		const emailFromStorage = localStorage.getItem("email");
		if (emailFromStorage) {
			globalUserEmail.value = emailFromStorage;
			globalUserUsername.value = emailFromStorage.split("@")[0];
			console.log("✅ Got email from localStorage:", emailFromStorage);
		}

		// Try name key
		const nameFromStorage = localStorage.getItem("name");
		if (nameFromStorage) {
			globalUserName.value = nameFromStorage;
			console.log("✅ Got name from localStorage:", nameFromStorage);
		}

		// Try to decode JWT token
		const accessToken = localStorage.getItem("access_token");
		if (accessToken && typeof accessToken === "string") {
			try {
				const base64Payload = accessToken.split(".")[1];
				const payload = JSON.parse(atob(base64Payload));

				console.log("🔐 JWT payload decoded:", payload);

				// Extract from JWT
				if (payload.email) globalUserEmail.value = payload.email;
				if (payload.sub) globalUserId.value = payload.sub;
				if (payload.name) globalUserName.value = payload.name;

				// Generate username from email if not set
				if (!globalUserUsername.value && payload.email) {
					globalUserUsername.value = payload.email.split("@")[0];
				}

				isUserLoaded.value = true;

				console.log("✅ User extracted from JWT:", {
					id: globalUserId.value,
					email: globalUserEmail.value,
					name: globalUserName.value,
					username: globalUserUsername.value
				});
			} catch (jwtError) {
				console.error("❌ Failed to decode JWT:", jwtError);
			}
		}

		// Try currentUser from localStorage (legacy)
		const currentUserStr = localStorage.getItem("currentUser");
		if (currentUserStr && !isUserLoaded.value) {
			try {
				const parsed = JSON.parse(currentUserStr);
				if (parsed.email) globalUserEmail.value = parsed.email;
				if (parsed.username) globalUserUsername.value = parsed.username;
				if (parsed.name) globalUserName.value = parsed.name;

				isUserLoaded.value = true;
				console.log("✅ User extracted from currentUser localStorage");
			} catch (e) {
				console.warn("Failed to parse currentUser:", e);
			}
		}
	} catch (error) {
		console.error("❌ Error extracting user from storage:", error);
	}
}

// Store auth reference at module level to avoid re-initialization
let authInstance: ReturnType<typeof useUnifiedAuth> | null = null;

/**
 * Get auth instance (initialize once)
 */
function getAuthInstance() {
	try {
		if (!authInstance && getCurrentInstance()) {
			authInstance = useUnifiedAuth();
		}
		return authInstance;
	} catch {
		return null;
	}
}

/**
 * Refresh user context from all sources
 */
function refreshUserContext() {
	console.log("🔄 Refreshing global user context...");

	// Try auth first (use cached instance to avoid lifecycle issues)
	try {
		const auth = getAuthInstance();
		if (auth.user.value) {
			globalUserId.value = auth.user.value.id || "";
			globalUserEmail.value = auth.user.value.email || "";
			globalUserName.value = auth.user.value.name || auth.user.value.displayName || "";
			globalUserUsername.value = auth.user.value.username || auth.user.value.email?.split("@")[0] || "";
			isUserLoaded.value = true;

			console.log("✅ Refreshed from auth.user");
			return;
		}
	} catch (error) {
		console.warn("⚠️ Could not get auth instance, using fallback:", error);
	}

	// Fallback to storage
	extractUserFromStorage();
}

/**
 * Clear user context (on logout)
 */
function clearUserContext() {
	console.log("🧹 Clearing global user context");
	globalUserId.value = "";
	globalUserEmail.value = "";
	globalUserName.value = "";
	globalUserUsername.value = "";
	isUserLoaded.value = false;
}

/**
 * Manually set user context (for testing or special cases)
 */
function setUserContext(data: {
	id?: string
	email?: string
	name?: string
	username?: string
}) {
	if (data.id) globalUserId.value = data.id;
	if (data.email) globalUserEmail.value = data.email;
	if (data.name) globalUserName.value = data.name;
	if (data.username) globalUserUsername.value = data.username;

	// Auto-generate username from email if not provided
	if (!data.username && data.email) {
		globalUserUsername.value = data.email.split("@")[0];
	}

	isUserLoaded.value = true;

	console.log("✅ User context manually set:", {
		id: globalUserId.value,
		email: globalUserEmail.value,
		name: globalUserName.value,
		username: globalUserUsername.value
	});
}

// Auto-initialize on import
if (typeof window !== "undefined") {
	// Wait a bit for auth to initialize
	setTimeout(() => {
		if (!isUserLoaded.value) {
			console.log("⏰ Auto-initializing user context from storage...");
			extractUserFromStorage();
		}
	}, 100);
}

import { useToast } from "#imports";
import { computed, readonly, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export interface InviteData {
	email: string
	entityId: string
	entityType: "ORGANISATION" | "PROJECT"
	type: "invite" | "subscribe"
	test?: boolean
}

export interface InviteRecord {
	id: string
	email: string
	entityId: string
	entityType: string
	type: string
	status: "pending" | "accepted" | "completed" | "expired"
	inviterId: string
	createdAt: string
	updatedAt?: string
	acceptedAt?: string
	completedAt?: string
	expiresAt?: string
}

export function useUserInvite() {
	const toast = useToast();

	// State
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const invitations = ref<InviteRecord[]>([]);
	const isSending = ref(false);

	// Computed
	const pendingInvitations = computed(() =>
		invitations.value.filter((invite) => invite.status === "pending")
	);

	const acceptedInvitations = computed(() =>
		invitations.value.filter((invite) => invite.status === "accepted")
	);

	const completedInvitations = computed(() =>
		invitations.value.filter((invite) => invite.status === "completed")
	);

	// Methods
	const fetchInvitations = async (): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			console.log("[useUserInvite] Fetching invitations...");

			const result = await buttClient.getAllInvitations();

			// Transform the result to match our interface
			invitations.value = Array.isArray(result)
				? result.map((invite: any) => ({
					id: invite.id || invite._id || "",
					email: invite.email || "",
					entityId: invite.entityId || invite.entity_id || "",
					entityType: invite.entityType || invite.entity_type || "ORGANISATION",
					type: invite.type || "invite",
					status: invite.status || "pending",
					inviterId: invite.inviterId || invite.inviter_id || "",
					createdAt: invite.createdAt || invite.created_at || new Date().toISOString(),
					updatedAt: invite.updatedAt || invite.updated_at,
					acceptedAt: invite.acceptedAt || invite.accepted_at,
					completedAt: invite.completedAt || invite.completed_at,
					expiresAt: invite.expiresAt || invite.expires_at
				}))
				: [];

			console.log("[useUserInvite] Invitations fetched:", invitations.value);
		} catch (err: any) {
			console.error("[useUserInvite] Failed to fetch invitations:", err);

			const errorMessage = err?.message || "Failed to fetch invitations";
			error.value = errorMessage;

			toast.add({
				title: "Failed to Load Invitations",
				description: errorMessage,
				icon: "i-lucide-alert-circle",
				color: "error"
			});
		} finally {
			isLoading.value = false;
		}
	};

	const sendInvitation = async (inviteData: InviteData): Promise<boolean> => {
		isSending.value = true;
		error.value = null;

		try {
			console.log("[useUserInvite] Sending invitation:", inviteData);
			console.log("[useUserInvite] Entity ID (organization ID):", inviteData.entityId);
			console.log("[useUserInvite] Entity Type:", inviteData.entityType);

			// Ensure entityId is a string
			const entityId = String(inviteData.entityId).trim();

			const payload = {
				email: inviteData.email.trim(),
				entityId,
				entityType: inviteData.entityType,
				type: inviteData.type,
				test: inviteData.test || false
			};

			console.log("[useUserInvite] BApi payload:", payload);
			console.log("[useUserInvite] Payload validation:");
			console.log("  - email:", payload.email, "(valid:", /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(payload.email || ""), ")");
			console.log("  - entityId:", payload.entityId, "(length:", payload.entityId?.length, ")");
			console.log("  - entityType:", payload.entityType, "(valid:", ["ORGANISATION", "PROJECT"].includes(payload.entityType), ")");
			console.log("  - type:", payload.type, "(valid:", ["invite", "subscribe"].includes(payload.type), ")");
			console.log("  - test:", payload.test);

			// Validate payload before sending
			if (!payload.email || !payload.entityId || !payload.entityType || !payload.type) {
				throw new Error("Missing required fields in invitation payload");
			}

			if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(payload.email)) {
				throw new Error("Invalid email format");
			}

			if (!["ORGANISATION", "PROJECT"].includes(payload.entityType)) {
				throw new Error("Invalid entity type");
			}

			if (!["invite", "subscribe"].includes(payload.type)) {
				throw new Error("Invalid invitation type");
			}

			console.log("[useUserInvite] Payload validation passed, sending request...");

			let result;
			try {
				result = await buttClient.sendInvitation(payload);
			} catch (apiError: any) {
				console.error("[useUserInvite] ButtClient threw error:", apiError);
				console.error("[useUserInvite] API Error details:", {
					message: apiError?.message,
					status: apiError?.status,
					statusText: apiError?.statusText,
					response: apiError?.response
				});
				throw apiError; // Re-throw the error to be caught by outer catch
			}

			console.log("[useUserInvite] Raw API response:", result);
			console.log("[useUserInvite] Response type:", typeof result);
			console.log("[useUserInvite] Response is null/undefined:", result == null);

			// Check if the result indicates success
			if (result && (result.success !== false)) {
				console.log("[useUserInvite] Invitation sent successfully:", result);

				toast.add({
					title: "Invitation Sent",
					description: `Invitation sent to ${inviteData.email}`,
					icon: "i-lucide-mail",
					color: "success"
				});

				// Refresh invitations list
				await fetchInvitations();

				return true;
			} else {
				console.error("[useUserInvite] API returned unsuccessful response:", result);
				throw new Error("Server returned unsuccessful response");
			}
		} catch (err: any) {
			console.error("[useUserInvite] Failed to send invitation:", err);
			console.error("[useUserInvite] Error details:", {
				message: err?.message,
				status: err?.status,
				statusText: err?.statusText,
				response: err?.response,
				stack: err?.stack
			});

			let errorMessage = "Failed to send invitation";

			if (err?.status === 500) {
				errorMessage = "Server error: Please try again later or contact support";
			} else if (err?.status === 400) {
				errorMessage = "Invalid request: Please check the email address and try again";
			} else if (err?.status === 401) {
				errorMessage = "Authentication error: Please log in again";
			} else if (err?.status === 403) {
				errorMessage = "Permission denied: You don't have permission to send invitations";
			} else if (err?.message) {
				errorMessage = err.message;
			}

			error.value = errorMessage;

			toast.add({
				title: "Invitation Failed",
				description: errorMessage,
				icon: "i-lucide-alert-circle",
				color: "error"
			});

			return false;
		} finally {
			isSending.value = false;
		}
	};

	const createInvitation = async (inviteData: Omit<InviteData, "test">): Promise<boolean> => {
		isLoading.value = true;
		error.value = null;

		try {
			console.log("[useUserInvite] Creating invitation:", inviteData);

			const result = await buttClient.createInvitation({
				inviterId: inviteData.entityId, // This should be the current user ID
				email: inviteData.email,
				entityId: inviteData.entityId,
				entityType: inviteData.entityType,
				type: inviteData.type
			});

			console.log("[useUserInvite] Invitation created successfully:", result);

			// Refresh invitations list
			await fetchInvitations();

			return true;
		} catch (err: any) {
			console.error("[useUserInvite] Failed to create invitation:", err);

			const errorMessage = err?.message || "Failed to create invitation";
			error.value = errorMessage;

			toast.add({
				title: "Invitation Creation Failed",
				description: errorMessage,
				icon: "i-lucide-alert-circle",
				color: "error"
			});

			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const deleteInvitation = async (invitationId: string): Promise<boolean> => {
		isLoading.value = true;
		error.value = null;

		try {
			console.log("[useUserInvite] Deleting invitation:", invitationId);

			await buttClient.deleteInvitation(invitationId);

			toast.add({
				title: "Invitation Deleted",
				description: "Invitation has been removed",
				icon: "i-lucide-trash",
				color: "success"
			});

			// Refresh invitations list
			await fetchInvitations();

			return true;
		} catch (err: any) {
			console.error("[useUserInvite] Failed to delete invitation:", err);

			const errorMessage = err?.message || "Failed to delete invitation";
			error.value = errorMessage;

			toast.add({
				title: "Delete Failed",
				description: errorMessage,
				icon: "i-lucide-alert-circle",
				color: "error"
			});

			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const completeInvitation = async (invitationId: string): Promise<boolean> => {
		isLoading.value = true;
		error.value = null;

		try {
			console.log("[useUserInvite] Completing invitation:", invitationId);

			await buttClient.completeInvitation(invitationId);

			toast.add({
				title: "Invitation Completed",
				description: "Invitation has been marked as completed",
				icon: "i-lucide-check-circle",
				color: "success"
			});

			// Refresh invitations list
			await fetchInvitations();

			return true;
		} catch (err: any) {
			console.error("[useUserInvite] Failed to complete invitation:", err);

			const errorMessage = err?.message || "Failed to complete invitation";
			error.value = errorMessage;

			toast.add({
				title: "Completion Failed",
				description: errorMessage,
				icon: "i-lucide-alert-circle",
				color: "error"
			});

			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const resetState = () => {
		error.value = null;
		isLoading.value = false;
		isSending.value = false;
	};

	// Validation
	const validateInviteData = (inviteData: Partial<InviteData>): string[] => {
		const errors: string[] = [];

		if (!inviteData.email?.trim()) {
			errors.push("Email address is required");
		} else if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(inviteData.email.trim())) {
			errors.push("Please enter a valid email address");
		}

		if (!inviteData.entityId?.trim()) {
			errors.push("Entity ID is required");
		}

		if (!inviteData.entityType) {
			errors.push("Entity type is required");
		} else if (!["ORGANISATION", "PROJECT"].includes(inviteData.entityType)) {
			errors.push("Entity type must be ORGANISATION or PROJECT");
		}

		if (!inviteData.type) {
			errors.push("Invitation type is required");
		} else if (!["invite", "subscribe"].includes(inviteData.type)) {
			errors.push("Invitation type must be 'invite' or 'subscribe'");
		}

		return errors;
	};

	return {
		// State
		isLoading: readonly(isLoading),
		isSending: readonly(isSending),
		error: readonly(error),
		invitations: readonly(invitations),

		// Computed
		pendingInvitations,
		acceptedInvitations,
		completedInvitations,

		// Methods
		sendInvitation,
		createInvitation,
		fetchInvitations,
		deleteInvitation,
		completeInvitation,
		resetState,
		validateInviteData
	};
}

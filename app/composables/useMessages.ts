// Messages Composable for BuildIt API Integration

import type {
	CreateMessageRequest,
	Message,
	MessageFilters,
	MessageStats,
	MessageType,
	UpdateMessageRequest
} from "~/types/message";

import { computed, readonly, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useMessages = () => {

	// State
	const messages = ref<Message[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Message type options for UI
	const messageTypeOptions = [
		{ value: "MESSAGE", label: "Message" },
		{ value: "NOTIFICATION", label: "Notification" },
		{ value: "TRANSPORT", label: "Transport" },
		{ value: "HOOK", label: "Hook" }
	] as const;

	// Computed properties
	const messageStats = computed((): MessageStats => {
		const total = messages.value.length;

		const byType = messages.value.reduce((acc, message) => {
			const type = message.type || "MESSAGE";
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {} as Record<MessageType, number>);

		const byCreator = messages.value.reduce((acc, message) => {
			if (message.creator) {
				acc[message.creator] = (acc[message.creator] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		const now = new Date();
		const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const recentlyCreated = messages.value.filter(
			(message) => new Date(message.createdAt) > dayAgo
		).length;

		const recentlyUpdated = messages.value.filter(
			(message) => new Date(message.updatedAt) > dayAgo
		).length;

		return {
			total,
			byType,
			byCreator,
			recentlyCreated,
			recentlyUpdated
		};
	});

	// Filter messages
	const filterMessages = (filters: MessageFilters) => {
		return computed(() => {
			return messages.value.filter((message) => {
				if (filters.type && message.type !== filters.type) {
					return false;
				}
				if (filters.creator && message.creator !== filters.creator) {
					return false;
				}
				if (filters.deletedAt !== undefined) {
					const isDeleted = message.deletedAt !== null;
					if (filters.deletedAt !== isDeleted) {
						return false;
					}
				}
				if (filters.dateFrom) {
					const messageDate = new Date(message.createdAt);
					const fromDate = new Date(filters.dateFrom);
					if (messageDate < fromDate) {
						return false;
					}
				}
				if (filters.dateTo) {
					const messageDate = new Date(message.createdAt);
					const toDate = new Date(filters.dateTo);
					if (messageDate > toDate) {
						return false;
					}
				}
				return true;
			});
		});
	};

	// API Methods
	const fetchMessages = async () => {
		console.log("🔍 useMessages.fetchMessages - Starting");
		isLoading.value = true;
		error.value = null;

		try {
			const response = await buttClient.findAllMessage();
			messages.value = response || [];
			console.log("✅ useMessages.fetchMessages - Success:", messages.value.length, "messages");
		} catch (err: any) {
			error.value = err.message || "Failed to fetch messages";
			console.error("❌ useMessages.fetchMessages - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const createMessage = async (messageData: CreateMessageRequest): Promise<Message> => {
		console.log("🔍 useMessages.createMessage - Starting");
		console.log("📦 Message data:", messageData);
		isLoading.value = true;
		error.value = null;

		try {
			// Transform CreateMessageRequest to match BApi payload structure
			const apiPayload = {
				content: (messageData as any).content || "",
				type: (messageData as any).type || "MESSAGE",
				title: (messageData as any).title,
				priority: (messageData as any).priority
			};
			
			const newMessage = await buttClient.createMessage(apiPayload);
			messages.value.unshift(newMessage); // Add to beginning for chronological order
			console.log("✅ useMessages.createMessage - Success:", newMessage);
			return newMessage;
		} catch (err: any) {
			error.value = err.message || "Failed to create message";
			console.error("❌ useMessages.createMessage - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const getMessage = async (id: string): Promise<Message> => {
		console.log("🔍 useMessages.getMessage - Starting");
		console.log("📍 Message ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			const message = await buttClient.findByIdMessage(id);
			console.log("✅ useMessages.getMessage - Success:", message);
			return message;
		} catch (err: any) {
			error.value = err.message || "Failed to fetch message";
			console.error("❌ useMessages.getMessage - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const updateMessage = async (id: string, messageData: UpdateMessageRequest): Promise<Message> => {
		console.log("🔍 useMessages.updateMessage - Starting");
		console.log("📍 Message ID:", id);
		console.log("📦 Update data:", messageData);
		isLoading.value = true;
		error.value = null;

		try {
			const updatedMessage = await buttClient.updateMessage(id, messageData);

			// Update the message in the local array
			const index = messages.value.findIndex((message) => message.id === id);
			if (index !== -1) {
				messages.value[index] = updatedMessage;
			}

			console.log("✅ useMessages.updateMessage - Success:", updatedMessage);
			return updatedMessage;
		} catch (err: any) {
			error.value = err.message || "Failed to update message";
			console.error("❌ useMessages.updateMessage - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const deleteMessage = async (id: string): Promise<void> => {
		console.log("🔍 useMessages.deleteMessage - Starting");
		console.log("📍 Message ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			await buttClient.deleteMessage(id);

			// Remove the message from the local array
			const index = messages.value.findIndex((message) => message.id === id);
			if (index !== -1) {
				messages.value.splice(index, 1);
			}

			console.log("✅ useMessages.deleteMessage - Success");
		} catch (err: any) {
			error.value = err.message || "Failed to delete message";
			console.error("❌ useMessages.deleteMessage - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Utility methods
	const clearError = () => {
		error.value = null;
	};

	const findMessageById = (id: string) => {
		return messages.value.find((message) => message.id === id);
	};

	const getMessagesByType = (type: MessageType) => {
		return messages.value.filter((message) => message.type === type);
	};

	const getMessagesByCreator = (creatorId: string) => {
		return messages.value.filter((message) => message.creator === creatorId);
	};

	const formatMessageInput = (input: any): string => {
		try {
			return typeof input === "string" ? input : JSON.stringify(input, null, 2);
		} catch {
			return String(input);
		}
	};

	const formatMessageOutput = (output: any): string => {
		try {
			return typeof output === "string" ? output : JSON.stringify(output, null, 2);
		} catch {
			return String(output);
		}
	};

	const getTypeLabel = (type?: MessageType): string => {
		const option = messageTypeOptions.find(opt => opt.value === type);
		return option?.label || "Message";
	};

	return {
		// State
		messages: readonly(messages),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Options
		messageTypeOptions,

		// Computed
		messageStats,

		// Methods
		fetchMessages,
		createMessage,
		getMessage,
		updateMessage,
		deleteMessage,
		filterMessages,
		clearError,
		findMessageById,
		getMessagesByType,
		getMessagesByCreator,
		formatMessageInput,
		formatMessageOutput,
		getTypeLabel
	};
}; 
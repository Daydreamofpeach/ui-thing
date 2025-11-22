import type { EventInfo, EventType } from "~/types/event";
import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

const events = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const useEvents = () => {

	// Computed properties for event categorization
	const eventsByCategory = computed(() => {
		const categorized = {
			auth: [] as string[],
			task: [] as string[],
			system: [] as string[]
		};

		events.value.forEach((event) => {
			if (event.startsWith("auth.")) {
				categorized.auth.push(event);
			} else if (event.startsWith("task")) {
				categorized.task.push(event);
			} else {
				categorized.system.push(event);
			}
		});

		return categorized;
	});

	const totalEvents = computed(() => events.value.length);

	const eventStatistics = computed(() => ({
		total: events.value.length,
		auth: eventsByCategory.value.auth.length,
		task: eventsByCategory.value.task.length,
		system: eventsByCategory.value.system.length
	}));

	// Get all events
	const fetchEvents = async (): Promise<void> => {
		try {
			loading.value = true;
			error.value = null;

			const response = await buttClient.getAllEvents();
			events.value = response;

			console.log("✅ Events loaded successfully:", {
				total: response.length,
				categories: eventStatistics.value
			});
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to fetch events";
			console.error("❌ Error in useEvents.fetchEvents:", err);
		} finally {
			loading.value = false;
		}
	};

	// Helper function to get event description
	const getEventDescription = (event: string): string => {
		const descriptions: Record<string, string> = {
			"task.updated": "Triggered when a task is updated",
			"tasks.synced": "Triggered when tasks are synchronized",
			"auth.user.login": "Triggered when a user logs in",
			"auth.user.created": "Triggered when a new user is created",
			"auth.user.verified": "Triggered when a user is verified",
			"auth.token.refresh": "Triggered when an auth token is refreshed",
			"auth.reset.send": "Triggered when a password reset is sent",
			"auth.reset.password": "Triggered when a password is reset",
			"auth.client.created": "Triggered when a new client is created",
			"auth.user.logout": "Triggered when a user logs out"
		};

		return descriptions[event] || "System event";
	};

	// Helper function to get event category
	const getEventCategory = (event: string): "auth" | "task" | "system" => {
		if (event.startsWith("auth.")) return "auth";
		if (event.startsWith("task")) return "task";
		return "system";
	};

	// Helper function to format event name for display
	const formatEventName = (event: string): string => {
		return event
			.split(".")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	};

	return {
		// State
		events: readonly(events),
		loading: readonly(loading),
		error: readonly(error),

		// Computed
		eventsByCategory,
		totalEvents,
		eventStatistics,

		// Actions
		fetchEvents,

		// Helpers
		getEventDescription,
		getEventCategory,
		formatEventName
	};
};

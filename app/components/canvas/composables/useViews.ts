import { ref } from "vue";
import { buttClient } from "~/utils/buttClient";
import { useToast } from "~/components/Ui/composables/useToast";

export interface ViewMeta {
	nodes: any[]
	edges: any[]
	viewport: {
		x: number
		y: number
		zoom: number
	}
	canvasType?: string
	[key: string]: any
}

export interface View {
	id: string
	name: string
	description: string
	meta: ViewMeta
	creator: string
	owners: string[]
	subscribers: string[]
	history: any[]
	deletedAt: string | null
	createdAt: string
	updatedAt: string
}

export function useViews() {
	const toast = useToast();
	const views = ref<View[]>([]);
	const currentView = ref<View | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	/**
	 * Fetches all views from the API
	 */
	const fetchAllViews = async (): Promise<View[]> => {
		isLoading.value = true;
		error.value = null;
		try {
			const data = await buttClient.findAllView();
			if (data) {
				views.value = data as View[];
				return views.value;
			}
			return [];
		} catch (err: any) {
			error.value = err.message || "Failed to fetch views";
			console.error("Failed to fetch views:", err);
			toast.add({
				title: "Error",
				description: "Failed to load canvases",
				color: "error"
			});
			return [];
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * Creates a new view (canvas)
	 */
	const createView = async (
		name: string,
		description: string,
		meta: ViewMeta
	): Promise<View | null> => {
		isLoading.value = true;
		error.value = null;
		try {
			const newView = await buttClient.createView({
				name,
				description,
				meta
			});

			if (newView) {
				views.value.push(newView as View);
				currentView.value = newView as View;

				toast.add({
					title: "Success",
					description: `Canvas "${name}" created successfully`,
					color: "success"
				});

				return newView as View;
			}
			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to create view";
			console.error("Failed to create view:", err);
			toast.add({
				title: "Error",
				description: "Failed to create canvas",
				color: "error"
			});
			return null;
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * Gets a view by ID
	 */
	const getViewById = async (id: string): Promise<View | null> => {
		isLoading.value = true;
		error.value = null;
		try {
			const view = await buttClient.findByIdView(id);
			if (view) {
				currentView.value = view as View;
				return view as View;
			}
			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to get view";
			console.error("Failed to get view:", err);
			toast.add({
				title: "Error",
				description: "Failed to load canvas",
				color: "error"
			});
			return null;
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * Updates a view (canvas)
	 */
	const updateView = async (
		id: string,
		name: string,
		description: string,
		meta: ViewMeta
	): Promise<View | null> => {
		isLoading.value = true;
		error.value = null;
		try {
			const updatedView = await buttClient.updateView(id, {
				name,
				description,
				meta
			});

			if (updatedView) {
				// Update in local array
				const index = views.value.findIndex((v) => v.id === id);
				if (index >= 0) {
					views.value[index] = updatedView as View;
				}

				if (currentView.value?.id === id) {
					currentView.value = updatedView as View;
				}

				return updatedView as View;
			}
			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to update view";
			console.error("Failed to update view:", err);
			toast.add({
				title: "Error",
				description: "Failed to update canvas",
				color: "error"
			});
			return null;
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * Deletes a view (soft delete)
	 */
	const deleteView = async (id: string): Promise<boolean> => {
		isLoading.value = true;
		error.value = null;
		try {
			await buttClient.deleteView(id);

			// Remove from local array
			views.value = views.value.filter((v) => v.id !== id);

			if (currentView.value?.id === id) {
				currentView.value = null;
			}

			toast.add({
				title: "Success",
				description: "Canvas deleted successfully",
				color: "success"
			});

			return true;
		} catch (err: any) {
			error.value = err.message || "Failed to delete view";
			console.error("Failed to delete view:", err);
			toast.add({
				title: "Error",
				description: "Failed to delete canvas",
				color: "error"
			});
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	/**
	 * Adds an owner to a view
	 */
	const addOwner = async (id: string, userId: string): Promise<boolean> => {
		try {
			await buttClient.addOwner(id, { userId });
			toast.add({
				title: "Success",
				description: "Owner added successfully",
				color: "success"
			});
			return true;
		} catch (err: any) {
			console.error("Failed to add owner:", err);
			toast.add({
				title: "Error",
				description: "Failed to add owner",
				color: "error"
			});
			return false;
		}
	};

	/**
	 * Adds a subscriber to a view
	 */
	const addSubscriber = async (id: string, userId: string): Promise<boolean> => {
		try {
			await buttClient.addSubscriber(id, { userId });
			toast.add({
				title: "Success",
				description: "Subscriber added successfully",
				color: "success"
			});
			return true;
		} catch (err: any) {
			console.error("Failed to add subscriber:", err);
			toast.add({
				title: "Error",
				description: "Failed to add subscriber",
				color: "error"
			});
			return false;
		}
	};

	/**
	 * Gets owners of a view
	 */
	const getOwners = async (id: string): Promise<string[]> => {
		try {
			const owners = await buttClient.getOwnersView(id);
			return (owners as string[]) || [];
		} catch (err: any) {
			console.error("Failed to get owners:", err);
			return [];
		}
	};

	/**
	 * Gets subscribers of a view
	 */
	const getSubscribers = async (id: string): Promise<string[]> => {
		try {
			const subscribers = await buttClient.getSubscribers(id);
			return (subscribers as string[]) || [];
		} catch (err: any) {
			console.error("Failed to get subscribers:", err);
			return [];
		}
	};

	return {
		// State
		views,
		currentView,
		isLoading,
		error,

		// Methods
		fetchAllViews,
		createView,
		getViewById,
		updateView,
		deleteView,
		addOwner,
		addSubscriber,
		getOwners,
		getSubscribers
	};
}

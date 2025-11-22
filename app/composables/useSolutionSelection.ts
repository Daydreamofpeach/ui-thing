import { ref, computed } from "vue";

// Global state for solution selection
const selectedSolutionId = ref<string>("");
const solutions = ref<any[]>([]);
const isLoadingSolutions = ref(false);

// AbortController for cancelling previous requests
let currentAbortController: AbortController | null = null;

export const useSolutionSelection = () => {
	// Computed properties
	const selectedSolution = computed(() => {
		if (!selectedSolutionId.value || !solutions.value.length) return null;
		return solutions.value.find((s) => String(s.id) === String(selectedSolutionId.value));
	});

	const hasSelectedSolution = computed(() => {
		return !!selectedSolutionId.value && !!selectedSolution.value;
	});

	// Functions
	const selectSolution = (solutionId: string | number) => {
		console.log("🎯 useSolutionSelection: selectSolution called with:", solutionId);
		selectedSolutionId.value = String(solutionId);
		console.log("🎯 useSolutionSelection: selectedSolutionId updated to:", selectedSolutionId.value);
	};

	const clearSolutionSelection = () => {
		console.log("🎯 useSolutionSelection: Clearing solution selection");
		selectedSolutionId.value = "";
	};

	const setSolutions = (newSolutions: any[]) => {
		console.log("🎯 useSolutionSelection: Setting solutions:", newSolutions.length);
		solutions.value = newSolutions || [];
	};

	const addSolution = (solution: any) => {
		console.log("🎯 useSolutionSelection: Adding solution:", solution);
		if (!solutions.value.some((s) => String(s.id) === String(solution.id))) {
			solutions.value.push(solution);
			console.log("✅ Solution added successfully. Total solutions:", solutions.value.length);
		} else {
			console.log("⚠️ Solution already exists in array, skipping add");
		}
	};

	const updateSolution = (updatedSolution: any) => {
		const index = solutions.value.findIndex((s) => String(s.id) === String(updatedSolution.id));
		if (index !== -1) {
			solutions.value[index] = updatedSolution;
			console.log("✅ Solution updated successfully");
		}
	};

	const removeSolution = (solutionId: string | number) => {
		const index = solutions.value.findIndex((s) => String(s.id) === String(solutionId));
		if (index !== -1) {
			solutions.value.splice(index, 1);
			console.log("✅ Solution removed successfully");
			
			// Clear selection if the removed solution was selected
			if (String(selectedSolutionId.value) === String(solutionId)) {
				clearSolutionSelection();
			}
		}
	};

	const getSolutionById = (id: string | number) => {
		return solutions.value.find((s) => String(s.id) === String(id));
	};

	const loadSolutions = async (projectId: string) => {
		if (!projectId) {
			solutions.value = [];
			return;
		}

		// Cancel any previous request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController for this request
		currentAbortController = new AbortController();

		isLoadingSolutions.value = true;
		try {
			console.log("🔄 Loading solutions for project:", projectId);
			// This would typically call an API to load solutions
			// For now, we'll use a placeholder
			const { buttClient } = await import("~/utils/buttClient");
			const loadedSolutions = await buttClient.findByProjectIdSolution(projectId);
			solutions.value = loadedSolutions || [];
			console.log("✅ Loaded solutions:", solutions.value.length);
		} catch (error: any) {
			// Don't show error for aborted requests
			if (error.name === 'AbortError') {
				console.log("Solutions request was cancelled");
				return;
			}
			console.error("❌ Failed to load solutions:", error);
			solutions.value = [];
		} finally {
			isLoadingSolutions.value = false;
			currentAbortController = null;
		}
	};

	// Cleanup function
	const cleanup = () => {
		if (currentAbortController) {
			currentAbortController.abort();
			currentAbortController = null;
		}
	};

	return {
		// State
		selectedSolutionId,
		selectedSolution,
		hasSelectedSolution,
		solutions,
		isLoadingSolutions,
		
		// Actions
		selectSolution,
		clearSolutionSelection,
		setSolutions,
		addSolution,
		updateSolution,
		removeSolution,
		getSolutionById,
		loadSolutions,
		cleanup
	};
};

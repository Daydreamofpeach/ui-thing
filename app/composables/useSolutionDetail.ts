import { ref, computed } from 'vue'

// Global state for solution detail
const currentSolution = ref<any>(null)
const solutionLoading = ref(false)
const solutionError = ref<string | null>(null)

export const useSolutionDetail = () => {
	const setSolution = (solution: any) => {
		console.log("🔧 useSolutionDetail - Setting solution:", solution)
		currentSolution.value = solution
		solutionLoading.value = false
		solutionError.value = null
	}

	const setLoading = (loading: boolean) => {
		console.log("🔧 useSolutionDetail - Setting loading:", loading)
		solutionLoading.value = loading
		if (loading) {
			solutionError.value = null
		}
	}

	const setError = (error: string) => {
		console.log("🔧 useSolutionDetail - Setting error:", error)
		solutionError.value = error
		solutionLoading.value = false
	}

	const clearSolution = () => {
		console.log("🔧 useSolutionDetail - Clearing solution")
		currentSolution.value = null
		solutionLoading.value = false
		solutionError.value = null
	}

	return {
		// State
		solution: computed(() => currentSolution.value),
		loading: computed(() => solutionLoading.value),
		error: computed(() => solutionError.value),
		
		// Actions
		setSolution,
		setLoading,
		setError,
		clearSolution
	}
} 
import { ref, computed } from 'vue'

// Global logout modal state
const isLogoutModalOpen = ref(false)

export function useLogoutModal() {
	// Open the logout confirmation modal
	const openLogoutModal = () => {
		isLogoutModalOpen.value = true
	}
	
	// Close the logout confirmation modal
	const closeLogoutModal = () => {
		isLogoutModalOpen.value = false
	}
	
	// Toggle the logout confirmation modal
	const toggleLogoutModal = () => {
		isLogoutModalOpen.value = !isLogoutModalOpen.value
	}
	
	return {
		// State
		isLogoutModalOpen: computed(() => isLogoutModalOpen.value),
		
		// Actions
		openLogoutModal,
		closeLogoutModal,
		toggleLogoutModal
	}
}

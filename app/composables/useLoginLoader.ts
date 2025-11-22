import { ref, computed } from 'vue'

// Global loading state for login-to-dashboard transition
const isLoading = ref(false)
const loadingText = ref('Loading...')
const progress = ref(0)
const showProgress = ref(false)
const duration = ref(3000)
const animationStartTime = ref(0)
const targetProgress = ref(0)
const progressAnimationFrame = ref<number | null>(null)

export function useLoginLoader() {
	// Smoothly animate progress to a target value
	const animateProgressTo = (target: number, durationMs = 300) => {
		targetProgress.value = Math.max(0, Math.min(100, target))
		const startProgress = progress.value
		const startTime = Date.now()
		const delta = targetProgress.value - startProgress
		
		const animate = () => {
			const elapsed = Date.now() - startTime
			const progressRatio = Math.min(1, elapsed / durationMs)
			
			// Easing function for smooth animation (ease-out cubic)
			const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3)
			
			const newProgress = startProgress + (delta * easeOutCubic)
			progress.value = Math.round(newProgress * 10) / 10 // Round to 1 decimal
			
			if (progressRatio < 1) {
				progressAnimationFrame.value = requestAnimationFrame(animate)
			} else {
				progress.value = targetProgress.value
				progressAnimationFrame.value = null
			}
		}
		
		if (progressAnimationFrame.value) {
			cancelAnimationFrame(progressAnimationFrame.value)
		}
		
		progressAnimationFrame.value = requestAnimationFrame(animate)
	}
	
	// Start the loading animation
	const startLoading = (text = 'Loading dashboard...', animationDuration = 3000, showProg = false) => {
		isLoading.value = true
		loadingText.value = text
		duration.value = animationDuration
		progress.value = 0
		targetProgress.value = 0
		showProgress.value = showProg
		animationStartTime.value = Date.now()
		
		// Clear any existing animation
		if (progressAnimationFrame.value) {
			cancelAnimationFrame(progressAnimationFrame.value)
			progressAnimationFrame.value = null
		}
		
		// Only simulate progress if not manually controlled
		if (!showProg) {
			const progressInterval = setInterval(() => {
				if (progress.value < 90) {
					const increment = Math.random() * 8 + 2 // 2-10% increments
					animateProgressTo(progress.value + increment, 400)
				}
			}, 500)
			
			// Store interval ID for cleanup
			;(window as any).__loginLoaderInterval = progressInterval
		}
	}
	
	// Complete the loading animation
	const completeLoading = () => {
		animateProgressTo(100, 500)
		
		// Clear the progress interval
		if ((window as any).__loginLoaderInterval) {
			clearInterval((window as any).__loginLoaderInterval)
			delete (window as any).__loginLoaderInterval
		}
		
		// Calculate actual elapsed time
		const elapsedTime = Date.now() - animationStartTime.value
		
		// Ensure minimum animation time for smooth completion
		const minAnimationTime = 2000 // 2 seconds minimum
		const remainingTime = Math.max(0, minAnimationTime - elapsedTime)
		
		// Update duration to match actual loading time
		duration.value = elapsedTime + remainingTime
		
		// Wait for animation to complete before hiding
		setTimeout(() => {
			isLoading.value = false
			progress.value = 0
			targetProgress.value = 0
		}, remainingTime + 800) // Buffer for smooth transition
	}
	
	// Stop loading immediately (for errors)
	const stopLoading = () => {
		isLoading.value = false
		progress.value = 0
		targetProgress.value = 0
		
		// Clear the progress interval
		if ((window as any).__loginLoaderInterval) {
			clearInterval((window as any).__loginLoaderInterval)
			delete (window as any).__loginLoaderInterval
		}
		
		// Clear animation frame
		if (progressAnimationFrame.value) {
			cancelAnimationFrame(progressAnimationFrame.value)
			progressAnimationFrame.value = null
		}
	}
	
	// Update loading text
	const updateLoadingText = (text: string) => {
		loadingText.value = text
	}
	
	// Update progress manually with smooth animation
	const updateProgress = (newProgress: number, animationDuration = 400) => {
		// Calculate animation duration based on progress jump size
		// Larger jumps get more time for smoother visual effect
		const progressDelta = Math.abs(newProgress - progress.value)
		const adaptiveDuration = Math.min(800, Math.max(300, progressDelta * 20))
		
		animateProgressTo(newProgress, adaptiveDuration)
	}
	
	// Show progress bar
	const showProgressBar = () => {
		showProgress.value = true
	}
	
	// Hide progress bar
	const hideProgressBar = () => {
		showProgress.value = false
	}
	
	// Get current animation progress (0-1)
	const getAnimationProgress = () => {
		if (!isLoading.value || animationStartTime.value === 0) return 0
		const elapsed = Date.now() - animationStartTime.value
		return Math.min(1, elapsed / duration.value)
	}
	
	// Update animation duration dynamically
	const updateAnimationDuration = (newDuration: number) => {
		duration.value = newDuration
	}
	
	return {
		// State
		isLoading: computed(() => isLoading.value),
		loadingText: computed(() => loadingText.value),
		progress: computed(() => progress.value),
		showProgress: computed(() => showProgress.value),
		duration: computed(() => duration.value),
		animationProgress: computed(() => getAnimationProgress()),
		
		// Actions
		startLoading,
		completeLoading,
		stopLoading,
		updateLoadingText,
		updateProgress,
		showProgressBar,
		hideProgressBar,
		updateAnimationDuration
	}
}

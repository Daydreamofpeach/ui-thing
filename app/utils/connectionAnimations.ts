/**
 * Connection Animation Utilities
 * Handles the creation of impressive animation effects for VueFlow edges
 */

export type AnimationType = 'flow' | 'pulse' | 'wave' | 'dash' | 'glow' | 'bounce' | 'particle' | 'beam' | 'light' | 'laser';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

/**
 * Get animation styles for VueFlow edges
 * Returns actual CSS properties that VueFlow can apply to edges
 */
export function getConnectionAnimationStyles(
	animated: boolean, 
	animationType: AnimationType, 
	animationSpeed: AnimationSpeed,
	strokeColor?: string
): Record<string, any> {
	if (!animated || animationType === 'flow') {
		return {}; // Let VueFlow handle default flow animation
	}

	const speedMultiplier = {
		slow: 3,
		normal: 2,
		fast: 1
	}[animationSpeed] || 2;

	// Calculate animation duration based on speed
	const animationDuration = `${speedMultiplier * 2}s`;

	// Return actual CSS styles that VueFlow can apply to the edge
	switch (animationType) {
	case "particle":
		return {
			strokeDasharray: "1,12,1,12",
			strokeDashoffset: "0",
			filter: "drop-shadow(0 0 3px currentColor) drop-shadow(0 0 6px currentColor)",
			animation: `particleFlow ${animationDuration} linear infinite`
		};
	case "beam":
		return {
			strokeDasharray: "20,3,40,3",
			strokeDashoffset: "0",
			strokeWidth: "4px",
			filter: "drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor)",
			animation: `beamPulse ${animationDuration} linear infinite`
		};
	case "light":
		return {
			strokeDasharray: "8,4,16,4",
			strokeDashoffset: "0",
			strokeWidth: "3px",
			filter: "drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor) brightness(1.2)",
			animation: `lightGlow ${animationDuration} linear infinite`
		};
	case "laser":
		return {
			strokeDasharray: "30,2,50,2",
			strokeDashoffset: "0",
			strokeWidth: "2px",
			filter: "drop-shadow(0 0 15px currentColor) drop-shadow(0 0 30px currentColor) brightness(2)",
			animation: `laserScan ${animationDuration} linear infinite`
		};
	case "pulse":
		return {
			strokeDasharray: "6,6,12,6",
			strokeDashoffset: "0",
			animation: `pulseFlow ${animationDuration} ease-in-out infinite`
		};
	case "wave":
		return {
			strokeDasharray: "12,6,8,6",
			strokeDashoffset: "0",
			strokeWidth: "3px",
			animation: `waveFlow ${animationDuration} linear infinite`
		};
	case "glow":
		return {
			strokeDasharray: "4,8,12,8",
			strokeDashoffset: "0",
			strokeWidth: "4px",
			filter: "drop-shadow(0 0 12px currentColor) drop-shadow(0 0 24px currentColor) brightness(1.3)",
			animation: `glowFlow ${animationDuration} ease-in-out infinite`
		};
	default:
		return {};
	}
}

/**
 * Get icon for animation type
 */
export function getAnimationIcon(type: AnimationType): string {
	const icons: Record<AnimationType, string> = {
		flow: 'i-lucide-play-circle',
		pulse: 'i-lucide-zap',
		wave: 'i-lucide-waves',
		dash: 'i-lucide-dash',
		glow: 'i-lucide-sun',
		bounce: 'i-lucide-activity',
		particle: 'i-lucide-sparkles',
		beam: 'i-lucide-feather',
		light: 'i-lucide-searchlight',
		laser: 'i-lucide-target'
	};
	return icons[type] || icons.flow;
}

/**
 * Get display name for animation type
 */
export function getAnimationName(type: AnimationType): string {
	const names: Record<AnimationType, string> = {
		flow: 'Flow',
		pulse: 'Pulse',
		wave: 'Wave',
		dash: 'Dashed',
		glow: 'Glow',
		bounce: 'Bounce',
		particle: 'Particle',
		beam: 'Beam',
		light: 'Light',
		laser: 'Laser'
	};
	return names[type] || names.flow;
}



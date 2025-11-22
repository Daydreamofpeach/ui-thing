import { computed } from "vue";
import type { GlassmorphicConfig } from "~/stores/dashboardHeaders";

export function useGlassmorphicEffects() {
	/**
	 * Generate CSS styles for a glassmorphic panel based on configuration
	 */
	const getGlassmorphicStyles = (config: GlassmorphicConfig | undefined) => {
		if (!config || !config.enabled) {
			// When disabled, return styles that explicitly remove all glassmorphic effects
			return {
				backgroundColor: "transparent",
				backdropFilter: "none",
				boxShadow: "none",
				border: "none",
				filter: "none",
				background: "transparent"
			};
		}

		// Convert hex to rgba for background and border
		const hexToRgba = (hex: string, alpha: number) => {
			const r = parseInt(hex.slice(1, 3), 16);
			const g = parseInt(hex.slice(3, 5), 16);
			const b = parseInt(hex.slice(5, 7), 16);
			return `rgba(${r}, ${g}, ${b}, ${alpha})`;
		};

		// When backdrop blur is disabled, make background completely transparent
		const effectiveOpacity = config.backdropBlurEnabled ? config.backgroundOpacity : 0;
		const bgColor = hexToRgba(config.backgroundColor, effectiveOpacity / 100);
		const borderColor = hexToRgba(config.borderColor, config.borderOpacity / 100);

		// Build the filter string only for enabled effects
		const filterParts = [];
		if (config.hueRotation !== 0) filterParts.push(`hue-rotate(${config.hueRotation}deg)`);
		if (config.saturation !== 100) filterParts.push(`saturate(${config.saturation}%)`);
		if (config.brightness !== 100) filterParts.push(`brightness(${config.brightness}%)`);
		if (config.contrast !== 100) filterParts.push(`contrast(${config.contrast}%)`);
		
		const filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

		// Return clean, simple styles that will be applied as inline styles
		return {
			backgroundColor: bgColor,
			backdropFilter: config.backdropBlurEnabled ? `blur(${config.backdropBlur}px)` : "none",
			boxShadow: config.boxShadowBlur > 0 ? `0 8px ${config.boxShadowBlur}px rgba(0, 0, 0, 0.1)` : "none",
			border: config.borderWidth > 0 ? `${config.borderWidth}px solid ${borderColor}` : "none",
			filter: filter,
			background: bgColor
		};
	};

	/**
	 * Generate CSS classes for a glassmorphic panel
	 */
	const getGlassmorphicClasses = (config: GlassmorphicConfig | undefined) => {
		if (!config || !config.enabled) {
			return "";
		}

		const classes = ["glassmorphic-panel"];
		
		// Add specific classes based on configuration
		if (config.backdropBlur > 0) {
			classes.push("backdrop-blur");
		}
		
		if (config.borderWidth > 0) {
			classes.push("has-border");
		}

		return classes.join(" ");
	};

	/**
	 * Apply glassmorphic effects to a DOM element
	 */
	const applyGlassmorphicEffects = (element: HTMLElement, config: GlassmorphicConfig | undefined) => {
		if (!config || !config.enabled) {
			// Reset to default styles
			element.style.backgroundColor = "";
			element.style.backdropFilter = "";
			element.style.boxShadow = "";
			element.style.border = "";
			element.style.filter = "";
			element.classList.remove("glassmorphic-panel", "backdrop-blur", "has-border");
			return;
		}

		const styles = getGlassmorphicStyles(config);
		const classes = getGlassmorphicClasses(config);

		// Apply styles
		Object.assign(element.style, styles);
		
		// Apply classes
		element.className = element.className.replace(/glassmorphic-panel|backdrop-blur|has-border/g, "").trim();
		element.classList.add(...classes.split(" ").filter(Boolean));
	};

	/**
	 * Create a reactive computed style object for Vue templates
	 */
	const createGlassmorphicStyle = (config: GlassmorphicConfig | undefined) => {
		return computed(() => getGlassmorphicStyles(config));
	};

	return {
		getGlassmorphicStyles,
		getGlassmorphicClasses,
		applyGlassmorphicEffects,
		createGlassmorphicStyle
	};
}

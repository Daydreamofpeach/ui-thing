import type { Ref } from "vue";

/**
 * Animation Handlers
 * Handles chain animations, edge effects, and visual transitions
 */
export function useAnimationHandlers(
	edges: Ref<any[]>,
	updateEdge: (edgeId: string, updates: any) => void,
	defaultConnectionStyle: Ref<any>
) {
	/**
	 * Helper to brighten color for animation
	 */
	const brightenColor = (hex: string, percent: number) => {
		// Remove # if present
		hex = hex.replace("#", "");

		// Convert to RGB
		let r = Number.parseInt(hex.substring(0, 2), 16);
		let g = Number.parseInt(hex.substring(2, 4), 16);
		let b = Number.parseInt(hex.substring(4, 6), 16);

		// Increase brightness by percent
		const factor = 1 + (percent / 100);
		r = Math.min(255, Math.floor(r * factor));
		g = Math.min(255, Math.floor(g * factor));
		b = Math.min(255, Math.floor(b * factor));

		// Convert back to hex
		return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
	};

	/**
	 * Animate chain flow - sequential color wave with stunning brightness effect
	 */
	const animateChainSequence = async (sequence: string[], duration: number, originalColor: string) => {
		console.log("🎬 CanvasPanel: Animating chain sequence");

		if (sequence.length < 2) return;

		// Get brightened color (increase brightness + add glow)
		const brightColor = brightenColor(originalColor, 50); // 50% brighter
		const glowColor = brightenColor(originalColor, 80); // 80% brighter for glow

		// Get all connections in the chain
		const chainEdges: any[] = [];
		for (let i = 0; i < sequence.length - 1; i++) {
			const sourceId = sequence[i];
			const targetId = sequence[i + 1];
			const edge = edges.value.find(
				(e: any) => e.source === sourceId && e.target === targetId
			);
			if (edge) {
				chainEdges.push(edge);
			}
		}

		console.log(`🎬 Found ${chainEdges.length} edges to animate`);

		// Animate each connection sequentially with stunning multi-phase effect
		for (let i = 0; i < chainEdges.length; i++) {
			const edge = chainEdges[i];
			const originalWidth = edge.style?.strokeWidth || 3;

			// PHASE 1: PRE-GLOW - Subtle brightness increase
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: brightColor,
					strokeWidth: originalWidth * 1.5,
					filter: `drop-shadow(0 0 4px ${brightColor}) brightness(1.3)`,
					opacity: 0.9,
					transition: "all 0.15s ease-out"
				},
				markerEnd: {
					type: "arrowclosed",
					color: brightColor
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.2));

			// PHASE 2: INTENSE GLOW - Maximum brightness with bloom effect
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: glowColor,
					strokeWidth: originalWidth * 3, // Triple width
					filter: `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 40px ${glowColor}) brightness(2.5) saturate(1.8)`,
					opacity: 1,
					transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
				},
				markerEnd: {
					type: "arrowclosed",
					color: glowColor
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.4));

			// PHASE 3: PULSE - Quick flash
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: "#ffffff",
					strokeWidth: originalWidth * 3.5,
					filter: `drop-shadow(0 0 30px ${glowColor}) brightness(3)`,
					opacity: 1,
					transition: "all 0.1s ease-in"
				},
				markerEnd: {
					type: "arrowclosed",
					color: "#ffffff"
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.15));

			// PHASE 4: FADE OUT - Smooth return with trail effect
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: brightColor,
					strokeWidth: originalWidth * 1.2,
					filter: `drop-shadow(0 0 6px ${originalColor}) brightness(1.2)`,
					opacity: 0.95,
					transition: "all 0.3s ease-out"
				},
				markerEnd: {
					type: "arrowclosed",
					color: brightColor
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.15));

			// PHASE 5: RESTORE - Back to original with smooth transition
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: originalColor,
					strokeWidth: originalWidth,
					filter: "none",
					opacity: 1,
					transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
				},
				markerEnd: {
					type: "arrowclosed",
					color: originalColor
				}
			});

			// Small overlap for smoother flow effect
			await new Promise((resolve) => setTimeout(resolve, duration * 0.1));
		}

		console.log("✅ CanvasPanel: Chain animation complete");
	};

	/**
	 * Update default connection style for manual connections
	 */
	const updateDefaultConnectionStyle = (style: any) => {
		console.log("🎨 CanvasPanel: Updating default connection style:", style);
		defaultConnectionStyle.value = { ...style };
	};

	return {
		brightenColor,
		animateChainSequence,
		updateDefaultConnectionStyle
	};
}


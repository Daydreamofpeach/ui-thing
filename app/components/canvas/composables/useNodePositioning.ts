import { ref } from "vue";

export interface NodePosition {
	x: number
	y: number
}

export function useNodePositioning() {
	// Track the last position where a node was added
	const lastNodePosition = ref<NodePosition>({ x: 100, y: 100 });
	const nodeSpacing = 200; // Horizontal spacing between nodes
	const rowSpacing = 150; // Vertical spacing for new rows
	const nodesPerRow = 4; // Max nodes per row before wrapping
	let nodeCount = 0;

	/**
	 * Get the next position for a new node
	 * Places nodes in a grid pattern, moving right then down
	 */
	const getNextNodePosition = (): NodePosition => {
		const column = nodeCount % nodesPerRow;
		const row = Math.floor(nodeCount / nodesPerRow);

		const position = {
			x: 100 + (column * nodeSpacing),
			y: 100 + (row * rowSpacing)
		};

		nodeCount++;
		lastNodePosition.value = position;

		return { ...position };
	};

	/**
	 * Get position next to the last added node
	 * Places node to the right of the last node
	 */
	const getPositionNextToLast = (offsetX = nodeSpacing, offsetY = 0): NodePosition => {
		return {
			x: lastNodePosition.value.x + offsetX,
			y: lastNodePosition.value.y + offsetY
		};
	};

	/**
	 * Set a specific position as the last position
	 * Useful when loading existing nodes
	 */
	const setLastPosition = (position: NodePosition) => {
		lastNodePosition.value = { ...position };
	};

	/**
	 * Reset positioning to start
	 */
	const resetPositioning = () => {
		lastNodePosition.value = { x: 100, y: 100 };
		nodeCount = 0;
	};

	/**
	 * Get a position that doesn't overlap with existing nodes
	 */
	const getNonOverlappingPosition = (
		existingNodes: any[],
		preferredPosition?: NodePosition
	): NodePosition => {
		const start = preferredPosition || getNextNodePosition();
		let position = { ...start };
		const maxAttempts = 20;
		let attempts = 0;

		// Check if position overlaps with any existing node
		const isOverlapping = (pos: NodePosition, nodes: any[]) => {
			return nodes.some((node) => {
				const nodeX = node.position.x;
				const nodeY = node.position.y;
				const distance = Math.sqrt(
					(pos.x - nodeX) ** 2 + (pos.y - nodeY) ** 2
				);
				return distance < 150; // Minimum distance between nodes
			});
		};

		// Try to find non-overlapping position
		while (isOverlapping(position, existingNodes) && attempts < maxAttempts) {
			// Try next position in grid (getNextNodePosition already increments nodeCount)
			position = getNextNodePosition();
			attempts++;
		}

		return position;
	};

	/**
	 * Update node count based on existing nodes
	 * Call this when loading a canvas to sync positioning
	 */
	const syncWithExistingNodes = (nodes: any[]) => {
		if (nodes.length === 0) {
			resetPositioning();
			return;
		}

		// Find the rightmost and bottommost node
		let maxX = 100;
		let maxY = 100;

		nodes.forEach((node) => {
			if (node.position) {
				if (node.position.x > maxX) maxX = node.position.x;
				if (node.position.y > maxY) maxY = node.position.y;
			}
		});

		// Set last position to bottom-right area
		lastNodePosition.value = {
			x: maxX,
			y: maxY
		};

		// Update node count based on grid
		nodeCount = Math.floor((maxX - 100) / nodeSpacing) + 1;
	};

	return {
		// State
		lastNodePosition,

		// Methods
		getNextNodePosition,
		getPositionNextToLast,
		getNonOverlappingPosition,
		setLastPosition,
		resetPositioning,
		syncWithExistingNodes
	};
}

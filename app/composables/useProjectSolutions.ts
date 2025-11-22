import { useState } from "#app";

export const useProjectSolutions = () => {
	const solutions = useState<any[]>("project-solutions", () => []);

	const setSolutions = (newSolutions: any[]) => {
		solutions.value = newSolutions;
	};

	const getSolutionById = (id: string) => {
		if (!id || !solutions.value || solutions.value.length === 0) {
			return null;
		}
		return solutions.value.find((s) => s.id.toString() === id.toString());
	};

	return {
		solutions,
		setSolutions,
		getSolutionById
	};
}; 
export function useEnvironmentNodeHandlers(
	envDetection: any,
	updateNodeData: any,
	allNodes: any
) {
	const {
		nodeVersion: envNodeVersion,
		packageManagers: envPackageManagers,
		rustVersion: envRustVersion,
		phpVersion: envPhpVersion,
		dotnetVersion: envDotnetVersion,
		pythonVersion: envPythonVersion,
		javaVersion: envJavaVersion,
		osInfo: envOsInfo,
		detectNode: detectNodeEnv,
		detectPackageManagers: detectPackageManagersEnv,
		detectRust: detectRustEnv,
		detectPhp: detectPhpEnv,
		detectDotnet: detectDotnetEnv,
		detectPython: detectPythonEnv,
		detectJava: detectJavaEnv
	} = envDetection;

	const updateEnvironmentNodeData = (nodeId?: string) => {
		const targetNodes = nodeId
			? [allNodes.value.find((n: any) => n.id === nodeId)]
			: allNodes.value.filter((n: any) => n.type === "environmentNode");

		targetNodes.forEach((node: any) => {
			if (node) {
				updateNodeData(node.id, "nodeVersion", envNodeVersion.value);
				updateNodeData(node.id, "packageManagers", envPackageManagers.value);
				updateNodeData(node.id, "rustVersion", envRustVersion.value);
				updateNodeData(node.id, "phpVersion", envPhpVersion.value);
				updateNodeData(node.id, "dotnetVersion", envDotnetVersion.value);
				updateNodeData(node.id, "pythonVersion", envPythonVersion.value);
				updateNodeData(node.id, "javaVersion", envJavaVersion.value);
				updateNodeData(node.id, "osInfo", envOsInfo.value);
			}
		});
	};

	const handleDetectNode = async () => {
		await detectNodeEnv(true);
		updateEnvironmentNodeData();
	};

	const handleDetectPackageManagers = async () => {
		await detectPackageManagersEnv();
		updateEnvironmentNodeData();
	};

	const handleDetectRust = async () => {
		await detectRustEnv(true);
		updateEnvironmentNodeData();
	};

	const handleDetectPhp = async () => {
		await detectPhpEnv(true);
		updateEnvironmentNodeData();
	};

	const handleDetectDotnet = async () => {
		await detectDotnetEnv(true);
		updateEnvironmentNodeData();
	};

	const handleDetectPython = async () => {
		await detectPythonEnv(true);
		updateEnvironmentNodeData();
	};

	const handleDetectJava = async () => {
		await detectJavaEnv(true);
		updateEnvironmentNodeData();
	};

	return {
		updateEnvironmentNodeData,
		handleDetectNode,
		handleDetectPackageManagers,
		handleDetectRust,
		handleDetectPhp,
		handleDetectDotnet,
		handleDetectPython,
		handleDetectJava,
		// Expose environment values for creating nodes
		envNodeVersion,
		envPackageManagers,
		envRustVersion,
		envPhpVersion,
		envDotnetVersion,
		envPythonVersion,
		envJavaVersion,
		envOsInfo
	};
}


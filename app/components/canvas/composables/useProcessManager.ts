import { ref, onBeforeUnmount } from "vue";
import type { Child } from "@tauri-apps/plugin-shell";

interface RunningProcess {
	id: string;
	name: string;
	command: string;
	child: Child;
	startTime: number;
}

export const useProcessManager = () => {
	const runningProcesses = ref<Map<string, RunningProcess>>(new Map());
	const processCounts = ref<Map<string, number>>(new Map());

	// Generate a unique process ID
	const generateProcessId = (scriptName: string) => {
		const count = processCounts.value.get(scriptName) || 0;
		processCounts.value.set(scriptName, count + 1);
		return `${scriptName}_${Date.now()}_${count}`;
	};

	// Register a running process
	const registerProcess = (scriptName: string, command: string, child: Child) => {
		const processId = generateProcessId(scriptName);
		const process: RunningProcess = {
			id: processId,
			name: scriptName,
			command,
			child,
			startTime: Date.now()
		};

		runningProcesses.value.set(processId, process);
		console.log(`✅ Registered process: ${processId} (${scriptName})`);
		console.log(`   Total running processes: ${runningProcesses.value.size}`);

		return processId;
	};

	// Stop a specific process
	const stopProcess = async (processId: string): Promise<boolean> => {
		const process = runningProcesses.value.get(processId);
		if (!process) {
			console.warn(`⚠️ Process not found: ${processId}`);
			return false;
		}

		try {
			console.log(`🛑 Stopping process: ${processId} (${process.name})`);
			
			// Kill the child process
			await process.child.kill();
			
			// Remove from running processes
			runningProcesses.value.delete(processId);
			
			const runTime = Date.now() - process.startTime;
			console.log(`✅ Process stopped: ${process.name} (ran for ${Math.round(runTime / 1000)}s)`);
			console.log(`   Remaining processes: ${runningProcesses.value.size}`);
			
			return true;
		} catch (error) {
			console.error(`❌ Error stopping process ${processId}:`, error);
			// Still remove from map even if kill failed
			runningProcesses.value.delete(processId);
			return false;
		}
	};

	// Stop all processes by script name
	const stopAllByName = async (scriptName: string): Promise<number> => {
		const processesToStop = Array.from(runningProcesses.value.values())
			.filter(p => p.name === scriptName);

		console.log(`🛑 Stopping all "${scriptName}" processes (${processesToStop.length})...`);

		let stoppedCount = 0;
		for (const process of processesToStop) {
			const stopped = await stopProcess(process.id);
			if (stopped) stoppedCount++;
		}

		console.log(`✅ Stopped ${stoppedCount}/${processesToStop.length} processes for "${scriptName}"`);
		return stoppedCount;
	};

	// Stop all running processes
	const stopAllProcesses = async (): Promise<number> => {
		const processIds = Array.from(runningProcesses.value.keys());
		console.log(`🛑 Stopping ALL processes (${processIds.length})...`);

		let stoppedCount = 0;
		for (const processId of processIds) {
			const stopped = await stopProcess(processId);
			if (stopped) stoppedCount++;
		}

		console.log(`✅ Stopped ${stoppedCount}/${processIds.length} processes`);
		return stoppedCount;
	};

	// Get running processes by script name
	const getRunningProcessesByName = (scriptName: string): RunningProcess[] => {
		return Array.from(runningProcesses.value.values())
			.filter(p => p.name === scriptName);
	};

	// Check if a script has running processes
	const isScriptRunning = (scriptName: string): boolean => {
		return getRunningProcessesByName(scriptName).length > 0;
	};

	// Get process count for a script
	const getProcessCount = (scriptName: string): number => {
		return getRunningProcessesByName(scriptName).length;
	};

	// Get all running process info
	const getAllRunningInfo = () => {
		return Array.from(runningProcesses.value.values()).map(p => ({
			id: p.id,
			name: p.name,
			command: p.command,
			runtime: Math.round((Date.now() - p.startTime) / 1000)
		}));
	};

	// Cleanup on unmount - stop all processes
	onBeforeUnmount(async () => {
		if (runningProcesses.value.size > 0) {
			console.log("🧹 Component unmounting, stopping all processes...");
			await stopAllProcesses();
		}
	});

	return {
		runningProcesses,
		registerProcess,
		stopProcess,
		stopAllByName,
		stopAllProcesses,
		getRunningProcessesByName,
		isScriptRunning,
		getProcessCount,
		getAllRunningInfo
	};
};


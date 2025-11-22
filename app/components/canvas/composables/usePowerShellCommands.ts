import { ref } from "vue";

export function usePowerShellCommands() {
	const commands = ref<string[]>([]);
	const commandsLoading = ref(false);
	const commandsError = ref<string | null>(null);

	const loadPowerShellCommands = async () => {
		commandsLoading.value = true;
		commandsError.value = null;

		try {
			const commonCommands = [
				"Get-Process",
				"Get-Service",
				"Get-ChildItem",
				"Set-Location",
				"Get-Content",
				"Set-Content",
				"Copy-Item",
				"Move-Item",
				"Remove-Item",
				"New-Item",
				"Get-Help",
				"Get-Command",
				"Get-Member",
				"Where-Object",
				"ForEach-Object",
				"Select-Object",
				"Sort-Object",
				"Group-Object",
				"Measure-Object",
				"Compare-Object",
				"Start-Process",
				"Stop-Process",
				"Get-EventLog",
				"Clear-EventLog",
				"Write-Host",
				"Write-Output",
				"Read-Host",
				"Get-Date",
				"Set-Date",
				"Get-Location",
				"Push-Location",
				"Pop-Location",
				"Test-Path",
				"Resolve-Path",
				"Split-Path",
				"Join-Path",
				"Get-Acl",
				"Set-Acl",
				"Get-AuthenticodeSignature",
				"Set-AuthenticodeSignature",
				"Get-ExecutionPolicy",
				"Set-ExecutionPolicy",
				"Get-PSSnapin",
				"Add-PSSnapin",
				"Remove-PSSnapin",
				"Get-Module",
				"Import-Module",
				"Remove-Module",
				"New-Module",
				"Get-Variable",
				"Set-Variable",
				"Remove-Variable",
				"Clear-Variable",
				"New-Variable",
				"Get-Alias",
				"Set-Alias",
				"Remove-Alias",
				"New-Alias",
				"Export-Alias",
				"Import-Alias",
				"Get-PSDrive",
				"New-PSDrive",
				"Remove-PSDrive",
				"Get-WmiObject",
				"Invoke-WmiMethod",
				"Register-WmiEvent",
				"Unregister-Event",
				"Get-Event",
				"New-Event",
				"Remove-Event",
				"Wait-Event",
				"Get-Job",
				"Start-Job",
				"Stop-Job",
				"Remove-Job",
				"Receive-Job",
				"Wait-Job",
				"Suspend-Job",
				"Resume-Job",
				"Get-History",
				"Invoke-History",
				"Add-History",
				"Clear-History"
			];

			commands.value = commonCommands.sort();
		} catch (error) {
			commandsError.value = error instanceof Error ? error.message : "Failed to load commands";
			console.error("Error loading PowerShell commands:", error);
		} finally {
			commandsLoading.value = false;
		}
	};

	return {
		commands,
		commandsLoading,
		commandsError,
		loadPowerShellCommands
	};
}

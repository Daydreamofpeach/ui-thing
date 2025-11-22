import { ref } from 'vue'
import { useToast } from '#imports'

export function useBuilditCLI() {
	const cliInstalled = ref(false)
	const cliVersion = ref('')
	const cliChecking = ref(false)
	const cliInstalling = ref(false)
	const cliOutput = ref('')

	const checkBuilditCli = async () => {
		cliChecking.value = true
		cliOutput.value = ''
		
		try {
			const { useTauriShellCommand } = await import('#imports')
			
			// Use the same detection logic as automate page
			const res = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`try { (npm list -g --depth=0 buildit-cli 2>$null | Select-String -Pattern 'buildit-cli@').ToString() } catch { '' }`
			]).execute()
			
			const line = (res.stdout || "").trim()
			const match = line.match(/buildit-cli@([\w.-]+)/i)
			const installed = !!match
			const version = match?.[1] || ""
			
			cliInstalled.value = installed
			cliVersion.value = version
			
			if (installed) {
				cliOutput.value = `Buildit CLI detected: v${version}`
			} else {
				cliOutput.value = 'Buildit CLI not found'
			}
			
			return { installed, version, output: cliOutput.value }
		} catch (error: any) {
			cliOutput.value = `Error checking CLI: ${error.message}`
			cliInstalled.value = false
			cliVersion.value = ''
			
			useToast().add({
				title: 'CLI Check Failed',
				description: error.message || 'Failed to check Buildit CLI',
				color: 'error'
			})
			
			throw error
		} finally {
			cliChecking.value = false
		}
	}

	const installBuilditCli = async () => {
		cliInstalling.value = true
		cliOutput.value = "$ npm i -g buildit-cli\n"
		
		try {
			const { useTauriShellCommand } = await import('#imports')
			
			// Use the same installation logic as automate page
			const res = await useTauriShellCommand.create("exec-pwsh", [
				"-Command",
				`npm i -g buildit-cli 2>&1 | ForEach-Object { $_ }`
			]).execute()
			
			cliOutput.value += (res.stdout || "").trim()
			cliOutput.value += "\n✓ Finished"
			
			// Check CLI after installation
			await checkBuilditCli()
			
			useToast().add({
				title: 'CLI Installed',
				description: 'Buildit CLI installed successfully',
				color: 'success'
			})
			
			return { success: true, output: cliOutput.value }
		} catch (error: any) {
			cliOutput.value += `\n✗ Installation error: ${error.message}`
			
			useToast().add({
				title: 'Installation Error',
				description: error.message || 'Failed to install Buildit CLI',
				color: 'error'
			})
			
			throw error
		} finally {
			cliInstalling.value = false
		}
	}

	// Auto-check CLI on initialization
	const initializeCLI = async () => {
		if (!cliInstalled.value) {
			await checkBuilditCli()
		}
	}

	return {
		// State
		cliInstalled,
		cliVersion,
		cliChecking,
		cliInstalling,
		cliOutput,
		
		// Actions
		checkBuilditCli,
		installBuilditCli,
		initializeCLI
	}
}

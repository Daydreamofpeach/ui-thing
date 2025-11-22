/**
 * Windows Hello 2FA Authentication Composable
 * 
 * Uses PowerShell via Tauri shell to invoke Windows Hello authentication.
 * Works on Windows 10/11 with Windows Hello configured.
 * 
 * Documentation: https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/
 */

import { ref } from 'vue'
import { Command } from '@tauri-apps/plugin-shell'

export interface BiometricStatus {
	isAvailable: boolean
	error?: string
}

export interface AuthenticateOptions {
	title?: string
	message?: string
}

export function useWindowsHelloAuth() {
	const isAuthenticated = ref(false)
	const isAuthenticating = ref(false)
	const biometricAvailable = ref(false)
	const authError = ref<string | null>(null)

	/**
	 * Check if Windows Hello is available and configured
	 * Uses PowerShell to check Windows Hello status
	 */
	async function checkBiometricStatus(): Promise<BiometricStatus> {
		try {
			// Check if we're in Tauri
			if (typeof window === 'undefined' || !(window as any).__TAURI__) {
				return {
					isAvailable: false,
					error: 'Not running in Tauri environment'
				}
			}

			// PowerShell command to check Windows Hello availability
			const checkCmd = Command.create('exec-pwsh', [
				'-Command',
				'$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name; ' +
				'$result = (Get-WindowsHelloForBusinessConfiguration -ErrorAction SilentlyContinue) -ne $null; ' +
				'if ($result) { Write-Output "AVAILABLE" } else { Write-Output "NOT_AVAILABLE" }'
			])

			const output = await checkCmd.execute()
			
			if (output.code === 0) {
				const isAvailable = output.stdout.trim().includes('AVAILABLE')
				biometricAvailable.value = isAvailable
				
				if (!isAvailable) {
					console.log('ℹ️ Windows Hello not configured')
				}
				
				return {
					isAvailable,
					error: isAvailable ? undefined : 'Windows Hello not configured'
				}
			} else {
				console.warn('⚠️ Windows Hello check failed:', output.stderr)
				biometricAvailable.value = false
				return {
					isAvailable: false,
					error: 'Failed to check Windows Hello status'
				}
			}
		} catch (error: any) {
			console.warn('⚠️ Windows Hello check failed:', error)
			biometricAvailable.value = false
			return {
				isAvailable: false,
				error: error?.message || 'Failed to check biometric status'
			}
		}
	}

	/**
	 * Authenticate using Windows Hello via PowerShell
	 * @param reason - Human-readable reason for authentication
	 * @param options - Optional configuration
	 */
	async function authenticateWithWindowsHello(
		reason: string = 'Verify your identity to sign in to BuildIt',
		options?: AuthenticateOptions
	): Promise<boolean> {
		isAuthenticating.value = true
		authError.value = null

		try {
			// Check if we're in Tauri
			if (typeof window === 'undefined' || !(window as any).__TAURI__) {
				console.log('ℹ️ Not in Tauri, skipping Windows Hello')
				isAuthenticated.value = true // Allow login in browser
				return true
			}

			// Check if Windows Hello is available
			const status = await checkBiometricStatus()
			
			if (!status.isAvailable) {
				console.log('ℹ️ Windows Hello not available, proceeding without 2FA')
				isAuthenticated.value = true // Allow login without 2FA if not available
				return true
			}

			// PowerShell command to invoke Windows Hello credential prompt
			// This uses the Windows.Security.Credentials.UI API
			const authCmd = Command.create('exec-pwsh', [
				'-Command',
				`Add-Type -AssemblyName System.Runtime.WindowsRuntime; ` +
				`$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0]; ` +
				`Function Await($WinRtTask) { $asTask = $asTaskGeneric.MakeGenericMethod($WinRtTask.GetType().GenericTypeArguments); $netTask = $asTask.Invoke($null, @($WinRtTask)); $netTask.Wait(-1) | Out-Null; $netTask.Result }; ` +
				`[Windows.Security.Credentials.UI.UserConsentVerifier,Windows.Security.Credentials.UI,ContentType=WindowsRuntime] | Out-Null; ` +
				`$result = Await([Windows.Security.Credentials.UI.UserConsentVerifier]::RequestVerificationAsync("${reason.replace(/"/g, '\\"')}")); ` +
				`if ($result -eq [Windows.Security.Credentials.UI.UserConsentVerificationResult]::Verified) { Write-Output "VERIFIED" } else { Write-Output "FAILED" }`
			])

			const output = await authCmd.execute()
			
			if (output.code === 0 && output.stdout.trim().includes('VERIFIED')) {
				isAuthenticated.value = true
				console.log('✅ Windows Hello authentication successful')
				return true
			} else {
				authError.value = 'Authentication failed or was cancelled'
				isAuthenticated.value = false
				console.warn('❌ Windows Hello authentication failed')
				return false
			}
		} catch (error: any) {
			console.error('❌ Windows Hello authentication error:', error)
			authError.value = error?.message || 'Authentication failed'
			isAuthenticated.value = false
			return false
		} finally {
			isAuthenticating.value = false
		}
	}

	/**
	 * Reset authentication state
	 */
	function resetAuth() {
		isAuthenticated.value = false
		isAuthenticating.value = false
		authError.value = null
	}

	return {
		// State
		isAuthenticated,
		isAuthenticating,
		biometricAvailable,
		authError,
		
		// Methods
		checkBiometricStatus,
		authenticateWithWindowsHello,
		resetAuth
	}
}

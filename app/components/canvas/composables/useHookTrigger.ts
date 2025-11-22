import { ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export interface HookTriggerData {
	formId: string
	formTitle: string
	formData: Record<string, any>
	timestamp: string
	source: string
}

export const useHookTrigger = () => {
	const isTriggeringHook = ref(false);
	const lastTriggerResult = ref<any>(null);
	const triggerError = ref<string | null>(null);

	/**
	 * Trigger a hook by emitting an event
	 * Uses the ButtClient emitEvent API to trigger hooks with form data
	 * @param hookToken - The JWT token for the hook (used to get hook details)
	 * @param payload - The form data to send
	 * @param organisationId - Organisation ID for event context
	 * @param eventName - Event name that matches hook trigger (default: 'form.submitted')
	 */
	const triggerHookViaEvent = async (
		hookToken: string,
		payload: any,
		organisationId?: string,
		eventName: string = "form.submitted"
	) => {
		isTriggeringHook.value = true;
		triggerError.value = null;

		try {
			console.log("═══════════════════════════════════════════");
			console.log("🪝 TRIGGERING HOOK VIA EVENT EMISSION");
			console.log("═══════════════════════════════════════════");
			console.log("  Event Name:", eventName);
			console.log("  Hook Token:", `${hookToken.substring(0, 30)}...`);
			console.log("  Organisation ID:", organisationId || "(using default)");
			console.log("  Form Data:", JSON.stringify(payload, null, 2));

			// Emit event through Buildit event system
			// This will trigger any hooks listening for this event
			const result = await buttClient.emitEvent({
				name: eventName,
				payload: {
					formData: payload,
					source: "buildit-form-submission",
					timestamp: new Date().toISOString()
				},
				source: "buildit-form-node",
				organisationId: organisationId || undefined,
				meta: {
					hookToken: `${hookToken.substring(0, 20)}...`,
					formSubmission: true
				}
			});

			console.log("✅ Event emitted successfully:", result);
			console.log("  Event ID:", result.eventId);
			console.log("  Channels:", result.channels);
			lastTriggerResult.value = result;

			return result;
		} catch (error: any) {
			console.error("❌ Error emitting event:", error);
			console.error("  Error details:", error.response?.data || error.message);

			triggerError.value = error instanceof Error ? error.message : "Unknown error";
			throw error;
		} finally {
			isTriggeringHook.value = false;
		}
	};

	/**
	 * Legacy method - triggers hook via POST
	 * @deprecated Use triggerHookViaEvent instead
	 */
	const triggerHookPost = async (hookToken: string, payload: any) => {
		console.warn("⚠️ triggerHookPost is deprecated, use triggerHookViaEvent instead");
		// For backward compatibility, just emit event with default name
		return triggerHookViaEvent(hookToken, payload, undefined, "form.submitted");
	};

	/**
	 * Send email via hook
	 * @param to - Recipient email
	 * @param subject - Email subject
	 * @param body - Email body (supports HTML)
	 */
	const sendEmailViaHook = async (to: string, subject: string, body: string) => {
		isTriggeringHook.value = true;
		triggerError.value = null;

		try {
			console.log("📧 Sending email via hook:");
			console.log("  To:", to);
			console.log("  Subject:", subject);

			const result = await buttClient.email({
				to,
				subject,
				body
			});

			console.log("✅ Email sent successfully:", result);
			lastTriggerResult.value = result;

			return result;
		} catch (error) {
			console.error("❌ Error sending email via hook:", error);
			triggerError.value = error instanceof Error ? error.message : "Unknown error";
			throw error;
		} finally {
			isTriggeringHook.value = false;
		}
	};

	/**
	 * Subscribe to a hook
	 * @param hookId - Hook ID to subscribe to
	 * @param subscriber - Subscriber ID (user, channel, etc.)
	 * @param type - Subscription type (SNS, EMAIL, SLACK)
	 */
	const subscribeToHook = async (hookId: string, subscriber: string, type: string) => {
		try {
			console.log("🔔 Subscribing to hook:", hookId);
			console.log("  Subscriber:", subscriber);
			console.log("  Type:", type);

			const result = await buttClient.subscribe({
				id: hookId,
				subscriber,
				type
			});

			console.log("✅ Subscribed successfully:", result);
			return result;
		} catch (error) {
			console.error("❌ Error subscribing to hook:", error);
			throw error;
		}
	};

	/**
	 * Process form submission and trigger connected hook
	 * @param formData - The submitted form data
	 * @param hookToken - The hook token to trigger
	 * @param hookType - The type of hook (determines processing method)
	 * @param organisationId - Organisation ID for event context
	 * @param hookTriggers - Array of trigger events from hook configuration
	 * @param transportConfig - Transport configuration for determining delivery
	 */
	const processFormSubmission = async (
		formData: Record<string, any>,
		hookToken: string,
		hookType: string,
		organisationId?: string,
		hookTriggers?: string[],
		transportConfig?: { type?: string, target?: string, name?: string },
		webhookUrl?: string
	) => {
		console.log("📋 Processing form submission...");
		console.log("  Form Data:", formData);
		console.log("  Hook Token:", `${hookToken.substring(0, 30)}...`);
		console.log("  Hook Type:", hookType);
		console.log("  Organisation ID:", organisationId);
		console.log("  Hook Triggers:", hookTriggers);
		console.log("  Transport Config:", transportConfig);
		console.log("  Webhook URL:", webhookUrl);

		try {
		// Priority 1: If webhook URL is provided, POST to it to trigger the hook
			if (webhookUrl) {
				console.log("🌐 Triggering hook via webhook URL:", webhookUrl);

				try {
				// Convert form data keys to lowercase and rename email to from for backend compatibility
					const lowercaseFormData: Record<string, any> = {};
					Object.keys(formData).forEach((key) => {
						const lowercaseKey = key.toLowerCase();
						// Rename 'email' to 'from' for backend template compatibility
						const finalKey = lowercaseKey === "email" ? "from" : lowercaseKey;
						lowercaseFormData[finalKey] = formData[key];
					});

					console.log("📋 Original form data:", formData);
					console.log("📋 Transformed form data:", lowercaseFormData);

					// POST form data to webhook URL
					const response = await fetch(webhookUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(lowercaseFormData)
					});

					if (!response.ok) {
						throw new Error(`Webhook POST failed: ${response.status} ${response.statusText}`);
					}

					const result = await response.json();
					console.log("✅ Webhook triggered successfully:", result);

					return {
						success: true,
						method: "webhook",
						webhookUrl,
						response: result,
						message: "Hook triggered successfully via webhook URL"
					};
				} catch (fetchError) {
					console.error("❌ Error posting to webhook URL:", fetchError);
					throw new Error(`Failed to trigger webhook: ${fetchError}`);
				}
			}

			// Fallback: Direct email sending if no webhook URL (backward compatibility)
			console.warn("⚠️ No webhook URL provided, falling back to direct email sending");

			// Check if this is a contact/support form scenario
			const isContactForm = formData.Email && (formData.Subject || formData.Message || formData.Name);
			const isEmailTransport = transportConfig?.type?.toLowerCase().includes("email")
				|| transportConfig?.type?.toLowerCase().includes("mail");

			console.log("📊 Form Analysis:");
			console.log("  Is contact form?", isContactForm);
			console.log("  Is email transport?", isEmailTransport);

			// For contact/support forms with email fields, send actual emails
			if (isContactForm || isEmailTransport) {
				console.log("📧 Contact form detected - sending emails...");

				const userEmail = formData.Email || formData.email || "";
				const userName = formData.Name || formData.name || "User";
				const subject = formData.Subject || formData.subject || "Form Submission";
				const message = formData.Message || formData.message || "";

				// 1. Send email to buildit support (via transport target or default)
				const supportEmail = transportConfig?.target || "support@builditbuilder.com";
				const supportBody = generateEmailBody(formData);

				console.log("📧 Sending to support:", supportEmail);
				const supportResult = await buttClient.email({
					to: supportEmail,
					subject: `[Contact Form] ${subject}`,
					body: supportBody
				});
				console.log("✅ Support email sent:", supportResult);

				// 2. Send confirmation email to user
				if (userEmail) {
					console.log("📧 Sending confirmation to user:", userEmail);
					const userBody = `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
							<h2 style="color: #3b82f6;">Thank you for contacting us!</h2>
							<p>Hi ${userName},</p>
							<p>We've received your message and will get back to you shortly.</p>
							<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
								<h3 style="margin-top: 0;">Your Message:</h3>
								<p><strong>Subject:</strong> ${subject}</p>
								<p><strong>Message:</strong></p>
								<p>${message}</p>
							</div>
							<p style="color: #6b7280; font-size: 14px;">This is an automated confirmation. Please do not reply to this email.</p>
							<p style="margin-top: 30px;">Best regards,<br><strong>Buildit Team</strong></p>
						</div>
					`;

					const userResult = await buttClient.email({
						to: userEmail,
						subject: `Re: ${subject}`,
						body: userBody
					});
					console.log("✅ User confirmation email sent:", userResult);

					return {
						supportEmail: supportResult,
						userEmail: userResult,
						status: "success",
						message: "Emails sent to both support and user"
					};
				}

				return {
					supportEmail: supportResult,
					status: "success",
					message: "Email sent to support"
				};
			}

			// For non-email forms or hooks, emit event through the system
			const eventName = hookTriggers && hookTriggers.length > 0
				? hookTriggers[0]
				: "form.submitted";

			console.log("📡 Emitting event through hook system...");
			console.log("  Event name:", eventName);
			return await triggerHookViaEvent(hookToken, formData, organisationId, eventName);
		} catch (error) {
			console.error("❌ Error processing form submission:", error);
			throw error;
		}
	};

	/**
	 * Generate email body from form data
	 */
	const generateEmailBody = (formData: Record<string, any>): string => {
		let html = "<h2>Form Submission</h2><table style=\"border-collapse: collapse; width: 100%;\">";

		for (const [key, value] of Object.entries(formData)) {
			if (key !== "to" && key !== "subject") {
				html += `
					<tr>
						<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td>
						<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
					</tr>
				`;
			}
		}

		html += "</table>";
		html += `<p style="margin-top: 20px; color: #666;">Submitted at: ${new Date().toLocaleString()}</p>`;

		return html;
	};

	return {
		isTriggeringHook,
		lastTriggerResult,
		triggerError,
		triggerHookPost,
		triggerHookViaEvent,
		sendEmailViaHook,
		subscribeToHook,
		processFormSubmission
	};
};

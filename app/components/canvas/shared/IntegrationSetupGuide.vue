<template>
	<section class="integration-setup-guide">
		<header class="guide-header">
			<div class="guide-avatar">
				<img :src="oscarMini" alt="Oscar advisor" />
			</div>
			<div class="guide-heading">
				<h4>Oscar's Advice</h4>
				<p>
					Follow these steps to prepare
					<strong>{{ displayName }}</strong>
					before connecting it to Buildit.
				</p>
			</div>
		</header>

		<div class="guide-body">
			<div class="step-status">
				<span class="step-counter">Step {{ currentStepNumber }} of {{ totalSteps }}</span>
				<div class="step-progress">
					<div class="step-progress__bar" :style="{ width: progressPercent }" />
				</div>
			</div>

			<h5 class="step-title">{{ currentStep.title }}</h5>
			<p v-if="currentStep.description" class="step-description">
				{{ currentStep.description }}
			</p>

			<ul v-if="currentStep.bullets?.length" class="step-list">
				<li v-for="(bullet, index) in currentStep.bullets" :key="index">
					{{ bullet }}
				</li>
			</ul>

			<div v-if="currentStep.highlight" class="step-highlight">
				<code>{{ currentStep.highlight }}</code>
			</div>

			<a
				v-if="currentStep.link"
				:href="currentStep.link.href"
				target="_blank"
				rel="noopener noreferrer"
				class="step-link"
			>
				<UIcon name="i-lucide-external-link" class="size-4" />
				<span>{{ currentStep.link.label }}</span>
			</a>
		</div>

		<footer class="guide-footer">
			<button
				class="guide-button secondary"
				:disabled="isFirstStep"
				@click="goBack"
			>
				<UIcon name="i-lucide-arrow-left" class="size-4" />
				<span>Back</span>
			</button>
			<button
				class="guide-button primary"
				@click="goNext"
			>
				<UIcon
					v-if="!isLastStep"
					name="i-lucide-arrow-right"
					class="size-4"
				/>
				<UIcon
					v-else
					name="i-lucide-rotate-cw"
					class="size-4"
				/>
				<span>{{ isLastStep ? 'Review Again' : 'Next Step' }}</span>
			</button>
		</footer>
	</section>
</template>

<script setup lang="ts">
	import oscarMini from "@/assets/oscarMini.png";
	import { computed, ref, watch } from "vue";

	interface GuideLink {
		href: string
		label: string
	}

	interface GuideStep {
		title: string
		description?: string
		bullets?: string[]
		highlight?: string
		link?: GuideLink
	}

	interface Props {
		integration: Record<string, any>
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		finished: []
	}>();

	const currentStepIndex = ref(0);

	const baseApi = computed(() => {
		if (typeof window !== "undefined" && (window as any)?.BAPI) {
			return (window as any).BAPI as string;
		}
		return "https://api.dev.builditbuilder.com";
	});

	const redirectUri = computed(() => `${baseApi.value.replace(/\/$/, "")}/v1/integrations/complete`);

	const normalizedKey = computed(() => {
		const source = String(
			props.integration?.key
			|| props.integration?.type
			|| props.integration?.name
			|| ""
		);
		return source.toLowerCase();
	});

	const displayName = computed(() => props.integration?.name || props.integration?.type || "this integration");

	const developerLink = computed(() => getOAuthSetupUrl(normalizedKey.value));
	const developerLabel = computed(() => getOAuthSetupLabel(normalizedKey.value));

	const steps = computed<GuideStep[]>(() => buildSteps({
		key: normalizedKey.value,
		name: displayName.value,
		redirectUri: redirectUri.value,
		developerLink: developerLink.value,
		developerLabel: developerLabel.value
	}));

	const totalSteps = computed(() => Math.max(steps.value.length, 1));
	const currentStepNumber = computed(() => currentStepIndex.value + 1);
	const currentStep = computed(() => steps.value[currentStepIndex.value] || steps.value[0]);

	const isFirstStep = computed(() => currentStepIndex.value === 0);
	const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);

	const progressPercent = computed(() => `${Math.round(((currentStepIndex.value + 1) / totalSteps.value) * 100)}%`);

	function goBack() {
		if (currentStepIndex.value > 0) {
			currentStepIndex.value -= 1;
		}
	}

	function goNext() {
		if (currentStepIndex.value < steps.value.length - 1) {
			currentStepIndex.value += 1;
			return;
		}
		currentStepIndex.value = 0;
		emit("finished");
	}

	watch(
		() => [props.integration?.id, props.integration?.key, props.integration?.type],
		() => {
			currentStepIndex.value = 0;
		}
	);

	function buildSteps(context: {
		key: string
		name: string
		redirectUri: string
		developerLink: string
		developerLabel: string
	}): GuideStep[] {
		const guideBuilders: Array<{ matches: (key: string) => boolean; steps: GuideStep[] }> = [
			{
				matches: (key) => key.includes("github"),
				steps: [
					{
						title: "Create a GitHub OAuth app",
						description: "Open GitHub Developer settings and register a new OAuth application for this project.",
						bullets: [
							"Choose the account that will own the application.",
							"Set the homepage URL to your project or workspace site."
						],
						link: buildGuideLink(context)
					},
					{
						title: "Configure the callback URL",
						description: "GitHub requires an authorization callback URL. Paste the value below exactly.",
						highlight: context.redirectUri,
						bullets: [
							"Leave the callback URL unchanged after saving.",
							"If you need multiple environments, create separate OAuth apps."
						]
					},
					{
						title: "Capture the credentials",
						description: "After saving, copy the Client ID and generate a new Client Secret. You'll paste them into the form below.",
						bullets: [
							"Secrets are shown once—store them securely.",
							"Rotate secrets if this integration is ever compromised."
						]
					}
				]
			},
			{
				matches: (key) => key.includes("atlassian") || key.includes("jira"),
				steps: [
					{
						title: "Create an Atlassian OAuth 2.0 app",
						description: "Use the Atlassian developer console to add a new OAuth 2.0 integration for Jira or Confluence.",
						bullets: [
							"Pick the workspace where your Atlassian products live.",
							"Choose OAuth 2.0 (3LO) as the authentication method."
						],
						link: buildGuideLink(context)
					},
					{
						title: "Configure redirect and scopes",
						description: "Add the redirect URL exactly as shown and include the recommended scopes.",
						highlight: context.redirectUri,
						bullets: [
							"Minimum scopes: read:jira-work, offline_access.",
							"If you see audience settings, use api.atlassian.com."
						]
					},
					{
						title: "Collect client credentials",
						description: "After publishing the app, copy the Client ID and generate a Client Secret.",
						bullets: [
							"Secrets can be regenerated—rotate them if exposed.",
							"Paste the values into Buildit to finish the connection."
						]
					}
				]
			},
			{
				matches: (key) => key.includes("bitbucket"),
				steps: [
					{
						title: "Create a Bitbucket OAuth consumer",
						description: "In Bitbucket, create a new OAuth consumer. This links your repositories to Buildit.",
						bullets: [
							"Provide the project name as the consumer label.",
							"Enable read access on repositories and webhooks."
						],
						link: buildGuideLink(context)
					},
					{
						title: "Configure the callback URL",
						description: "Set the callback URL to the redirect value below. Bitbucket calls this the 'Callback URL'.",
						highlight: context.redirectUri,
						bullets: [
							"Check 'This is a private consumer' if prompted.",
							"Keep read and repository admin scopes enabled."
						]
					},
					{
						title: "Copy the key and secret",
						description: "Bitbucket provides a Key and Secret—these map to Client ID and Client Secret in Buildit.",
						bullets: [
							"Record the secret safely; Bitbucket only shows it once.",
							"Enter both values in the credentials form."
						]
					}
				]
			},
			{
				matches: (key) => key.includes("google"),
				steps: [
					{
						title: "Create Google OAuth credentials",
						description: "In Google Cloud Console, create an OAuth consent screen and then add a new OAuth client ID.",
						bullets: [
							"Use 'Web application' as the application type.",
							"Add your organization information to the consent screen."
						],
						link: buildGuideLink(context)
					},
					{
						title: "Add authorized redirect URI",
						description: "Under Authorized redirect URIs, paste the value below. Google requires HTTPS.",
						highlight: context.redirectUri,
						bullets: [
							"You can add extra URIs later if needed.",
							"Publish the app if Google marks it as 'Testing'."
						]
					},
					{
						title: "Download the credentials",
						description: "After saving, Google shows a Client ID and Client Secret—paste them into Buildit.",
						bullets: [
							"You can re-download the client details from the Credentials page.",
							"Keep the secret safe; rotate it when you rotate app passwords."
						]
					}
				]
			},
			{
				matches: (key) => key.includes("discord"),
				steps: [
					{
						title: "Create a Discord application",
						description: "Open the Discord Developer Portal and create a new application for your workspace.",
						bullets: [
							"Give the app a name that matches this project.",
							"Navigate to the OAuth2 section once it's created."
						],
						link: buildGuideLink(context)
					},
					{
						title: "Configure redirect and scopes",
						description: "In OAuth2 > General, add the redirect URL below and enable the guild scopes you need.",
						highlight: context.redirectUri,
						bullets: [
							"Recommended scopes: identify, email, guilds.",
							"Save your changes before leaving the page."
						]
					},
					{
						title: "Copy client credentials",
						description: "Grab the Client ID and generate a Client Secret to use in Buildit.",
						bullets: [
							"Reset the secret if it has been exposed.",
							"Paste both values into the credentials form below."
						]
					}
				]
			},
			{
				matches: (key) => key.includes("slack"),
				steps: [
					{
						title: "Create a Slack application",
						description: "Inside the Slack API dashboard, create a new app from scratch for your workspace.",
						bullets: [
							"Install the app to the workspace that Buildit should access.",
							"Go to OAuth & Permissions to manage redirect URLs and scopes."
						],
						link: buildGuideLink(context)
					},
					{
						title: "Add redirect URL and scopes",
						description: "Paste the redirect URL below under 'Redirect URLs', then add the scopes you need.",
						highlight: context.redirectUri,
						bullets: [
							"Start with channels:read, chat:write, users:read.",
							"Click 'Save URLs' after adding the redirect."
						]
					},
					{
						title: "Collect client credentials",
						description: "Under App Credentials, copy the Client ID and Client Secret for Buildit.",
						bullets: [
							"Rotate the secret in Slack if you ever regenerate it here.",
							"Reinstall the app if Slack prompts after changing scopes."
						]
					}
				]
			}
		];

		const matchedGuide = guideBuilders.find((builder) => builder.matches(context.key));
		if (matchedGuide) {
			return matchedGuide.steps;
		}

		return [
			{
				title: "Create the integration in your provider",
				description: `Open the developer portal for ${context.name} and create a new OAuth application.`,
				bullets: [
					"Give the application a recognizable name.",
					"Enable OAuth 2.0 or the closest authentication option."
				],
				link: buildGuideLink(context)
			},
			{
				title: "Configure the redirect or callback URL",
				description: "Most providers require a redirect URI that handles authentication handoff.",
				highlight: context.redirectUri,
				bullets: [
					"Paste the URL exactly—providers are case sensitive.",
					"Add additional URLs later if you support multiple environments."
				]
			},
			{
				title: "Save and copy credentials",
				description: "After creating the app, copy the Client ID and Client Secret into Buildit.",
				bullets: [
					"Secrets are usually shown only once—store them securely.",
					"Rotate the secret in both systems if it becomes compromised."
				]
			}
		];
	}

	function buildGuideLink(context: {
		developerLink: string
		developerLabel: string
	}): GuideLink | undefined {
		if (!context.developerLink || context.developerLink === "#") {
			return undefined;
		}

		return {
			href: context.developerLink,
			label: context.developerLabel || "Open developer portal"
		};
	}

	function getOAuthSetupUrl(key: string): string {
		if (key.includes("atlassian") || key.includes("jira")) {
			return "https://developer.atlassian.com/console/myapps/";
		}
		if (key.includes("github")) {
			return "https://github.com/settings/developers";
		}
		if (key.includes("google")) {
			return "https://console.cloud.google.com/apis/credentials";
		}
		if (key.includes("discord")) {
			return "https://discord.com/developers/applications";
		}
		if (key.includes("bitbucket")) {
			return "https://bitbucket.org/account/settings/app-passwords/";
		}
		if (key.includes("slack")) {
			return "https://api.slack.com/apps";
		}
		return "#";
	}

	function getOAuthSetupLabel(key: string): string {
		if (key.includes("atlassian") || key.includes("jira")) {
			return "Open Atlassian Developer Console";
		}
		if (key.includes("github")) {
			return "Open GitHub Developer Settings";
		}
		if (key.includes("google")) {
			return "Open Google Cloud Console";
		}
		if (key.includes("discord")) {
			return "Open Discord Developer Portal";
		}
		if (key.includes("bitbucket")) {
			return "Open Bitbucket OAuth Consumers";
		}
		if (key.includes("slack")) {
			return "Open Slack API Apps";
		}
		return "Open provider developer portal";
	}
</script>

<style scoped>
.integration-setup-guide {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
	border-radius: 0.75rem;
	background: rgba(59, 130, 246, 0.08);
	border: 1px solid rgba(59, 130, 246, 0.15);
}

.guide-header {
	display: flex;
	gap: 0.75rem;
	align-items: center;
}

.guide-avatar {
	width: 3rem;
	height: 3rem;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.35rem;
}

.guide-avatar img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.guide-heading h4 {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	margin-bottom: 0.15rem;
}

.guide-heading p {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.7);
	margin: 0;
}

.guide-heading strong {
	color: rgba(255, 255, 255, 0.95);
}

.guide-body {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 0.75rem 0.5rem 0.25rem;
}

.step-status {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.step-counter {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.65);
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.step-progress {
	width: 100%;
	height: 0.375rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.12);
	overflow: hidden;
}

.step-progress__bar {
	height: 100%;
	background: linear-gradient(90deg, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.95));
	transition: width 0.25s ease;
}

.step-title {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
}

.step-description {
	font-size: 0.85rem;
	color: rgba(255, 255, 255, 0.75);
	line-height: 1.5;
}

.step-list {
	padding-left: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.step-list li {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.45;
}

.step-highlight {
	background: rgba(15, 23, 42, 0.65);
	border: 1px solid rgba(59, 130, 246, 0.35);
	padding: 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	color: rgba(148, 197, 255, 0.95);
	overflow-x: auto;
}

.step-highlight code {
	font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.step-link {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	align-self: flex-start;
	padding: 0.5rem 0.75rem;
	border-radius: 0.5rem;
	background: rgba(59, 130, 246, 0.18);
	border: 1px solid rgba(59, 130, 246, 0.35);
	color: rgba(148, 197, 255, 0.95);
	text-decoration: none;
	font-size: 0.8125rem;
	font-weight: 600;
	transition: all 0.2s ease;
}

.step-link:hover {
	background: rgba(59, 130, 246, 0.28);
	border-color: rgba(59, 130, 246, 0.45);
	transform: translateY(-1px);
}

.guide-footer {
	display: flex;
	gap: 0.75rem;
}

.guide-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem;
	border-radius: 0.5rem;
	border: 1px solid;
	font-size: 0.85rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.guide-button.secondary {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.75);
}

.guide-button.secondary:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.guide-button.secondary:not(:disabled):hover {
	background: rgba(255, 255, 255, 0.1);
}

.guide-button.primary {
	background: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.35);
	color: rgba(255, 255, 255, 0.95);
}

.guide-button.primary:hover {
	background: rgba(59, 130, 246, 0.32);
	border-color: rgba(59, 130, 246, 0.5);
	transform: translateY(-1px);
}
</style>


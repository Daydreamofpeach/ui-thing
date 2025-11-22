/**
 * Canvas UI Component Library
 * 
 * Reusable, state-driven UI components for the node canvas system.
 * Promotes DRY principles and consistent UX across all canvas features.
 * 
 * @created October 28, 2025
 * @purpose Decouple UI from business logic, enable rapid development
 */

// Core UI Components
export { default as ColorPicker } from "./ColorPicker.vue";
export { default as UserSelector } from "./UserSelector.vue";
export { default as PermissionBadge } from "./PermissionBadge.vue";
export { default as ViewOverlay } from "./ViewOverlay.vue";

// Component Types (for TypeScript support)
export type PermissionLevel = "owner" | "admin" | "edit" | "view" | "none";
export type BadgeSize = "sm" | "md" | "lg";

export interface User {
	id: string
	name?: string
	email: string
	avatar?: string
}

export interface ColorPreset {
	name: string
	value: string
}


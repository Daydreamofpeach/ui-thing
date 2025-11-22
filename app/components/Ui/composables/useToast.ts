// Adapter for canvas code expecting #ui/composables/useToast with toast.add(...)
import { toast as sonnerToast } from "vue-sonner";

type ToastOptions = {
	title?: string;
	description?: string;
	variant?: "default" | "success" | "destructive" | "warning" | "info";
	color?: "success" | "error" | "warning" | "info"; // Legacy support
	duration?: number;
};

export function useToast() {
	const add = (opts: ToastOptions) => {
		const { title, description, variant, color, duration } = opts || {};
		const message = title || description || "";
		
		// Don't show empty toasts
		if (!message && !description) {
			return;
		}
		
		// Support legacy 'color' property
		const effectiveVariant = variant || (color === "success" ? "success" : color === "error" ? "destructive" : color === "warning" ? "warning" : color === "info" ? "info" : undefined);
		
		switch (effectiveVariant) {
			case "success":
				sonnerToast.success(message, { description, duration });
				break;
			case "destructive":
				sonnerToast.error(message, { description, duration });
				break;
			case "warning":
				sonnerToast.warning?.(message, { description, duration });
				break;
			case "info":
				sonnerToast.message?.(message, { description, duration });
				break;
			default:
				sonnerToast(message, { description, duration });
		}
	};

	const success = (title: string, options?: { description?: string; duration?: number }) => {
		if (!title) return;
		sonnerToast.success(title, { 
			description: options?.description || undefined,
			duration: options?.duration 
		});
	};

	const error = (title: string, options?: { description?: string; duration?: number }) => {
		if (!title) return;
		sonnerToast.error(title, { 
			description: options?.description || undefined,
			duration: options?.duration 
		});
	};

	return {
		add,
		success,
		error,
	};
}



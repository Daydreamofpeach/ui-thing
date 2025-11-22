import { useUnifiedAuth } from "~/composables/useUnifiedAuth";

export default defineNuxtRouteMiddleware((to) => {
	const auth = useUnifiedAuth();
	if (!auth.isAuthenticated.value) {
		return navigateTo({
			path: "/auth/login",
			query: { redirect: to.fullPath || "/dashboard" }
		});
	}
});



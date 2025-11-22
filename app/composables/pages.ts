export const usePages = () => {
	const router = useRouter();
	const { pageCategories } = useAppConfig();

	const routes = router.getRoutes().filter((route) => {
		// Exclude specific routes we don't want in navigation
		if (route.name === "index" || route.name === "all") return false;
		if (route.name?.toString().includes("auth-callback")) return false;
		if (route.name?.toString().includes("organizations-ComponentForm")) return false;
		if (route.name?.toString().includes("organizations-name")) return false;
		return true;
	});

	const categorizedRoutes = routes.reduce((acc, route) => {
		const category = route.meta.category as string || "other";
		if (!category) return acc;

		if (!acc[category]) {
			acc[category] = {
				label: pageCategories[category as keyof typeof pageCategories]?.label,
				icon: pageCategories[category as keyof typeof pageCategories]?.icon || "i-lucide-folder",
				to: route.path,
				children: []
			};
		}

		acc[category].children.push({
			label: route.meta.name as string || route.name,
			description: route.meta.description as string,
			icon: route.meta.icon || "i-lucide-file",
			to: route.path
		});

		return acc;
	}, {} as Record<string, any>);

	const pages = Object.values(categorizedRoutes);

	return {
		pages
	};
};

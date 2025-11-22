import type { LocalUser } from "./types/permissions.types";

// Type alias for backward compatibility - not exported to avoid Nuxt auto-import conflicts
type User = LocalUser;

export async function useUserStore() {
	const store = await useTauriStoreLoad<User[]>("users.bin", {
		autoSave: true
	});

	const getUsers = async (): Promise<User[]> => {
		try {
			const users = await store.get("users");
			return Array.isArray(users) ? users : [];
		} catch (error) {
			console.error("Error getting users:", error);
			return [];
		}
	};

	const addUser = async (user: User): Promise<void> => {
		try {
			const users = await getUsers();
			// Check if user already exists
			if (users.some((u) => u.email === user.email)) {
				throw new Error("User already exists");
			}
			users.push(user);
			await store.set("users", users);
		} catch (error) {
			console.error("Error adding user:", error);
			throw error;
		}
	};

	const findUser = async (email: string, password: string): Promise<User | null> => {
		try {
			const users = await getUsers();
			return users.find((u) => u.email === email && u.password === password) || null;
		} catch (error) {
			console.error("Error finding user:", error);
			return null;
		}
	};

	const updateUser = async (email: string, updates: Partial<User>): Promise<void> => {
		try {
			const users = await getUsers();
			const index = users.findIndex((u) => u.email === email);
			if (index === -1) throw new Error("User not found");

			const existingUser = users[index];
			if (!existingUser) throw new Error("User not found");

			// Ensure required fields are not undefined
			const updatedUser: User = {
				...existingUser,
				...updates,
				username: updates.username ?? existingUser.username,
				email: updates.email ?? existingUser.email,
				password: updates.password ?? existingUser.password
			};

			users[index] = updatedUser;
			await store.set("users", users);
		} catch (error) {
			console.error("Error updating user:", error);
			throw error;
		}
	};

	return {
		getUsers,
		addUser,
		findUser,
		updateUser
	};
}

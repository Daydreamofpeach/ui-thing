import { ref } from 'vue';
import { useUserStore } from './useUserStore';

export interface CurrentUser {
  username: string;
  email: string;
  isGithubConnected: boolean;
  githubToken?: string;
}

export function useCurrentUser() {
  const user = ref<CurrentUser | null>(null);

  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('currentUser');
          user.value = null;
        }
      }
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('currentUser');
      // Also clear cache on logout
      localStorage.removeItem('buildit_project_cache');
      localStorage.removeItem('buildit_cache_timestamps');
    } catch (err) {
      console.warn('Failed to clear user data from storage:', err);
    }
    user.value = null;
  };

  const connectGithub = async (token: string) => {
    if (user.value) {
      user.value = {
        ...user.value,
        isGithubConnected: true,
        githubToken: token
      };
      localStorage.setItem('currentUser', JSON.stringify(user.value));
    }
  };

  // Load user on mount
  if (typeof window !== 'undefined') {
    loadUser();
  }

  return {
    user,
    loadUser,
    logout,
    connectGithub
  };
} 
// API utility functions for better organization

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface SignupData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await $fetch<ApiResponse<T>>(endpoint, {
      method: options.method || 'GET',
      body: options.body,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    return response
  } catch (error: any) {
    console.error(`API call failed for ${endpoint}:`, error)
    
    return {
      success: false,
      error: error.data?.statusMessage || error.message || 'An error occurred'
    }
  }
}

// Auth API functions
export const authApi = {
  signup: (data: SignupData) => 
    apiCall<User>('/api/auth/signup', {
      method: 'POST',
      body: data
    }),

  login: (data: LoginData) => 
    apiCall<User>('/api/auth/login', {
      method: 'POST',
      body: data
    })
}

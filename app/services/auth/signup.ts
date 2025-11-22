import { buttClient } from "~/utils/buttClient";
import authMessages from "~/data/auth-messages.json";

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface SignupResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    title: string;
    message: string;
    solutions: string[];
  };
  requiresEmailVerification?: boolean;
}

export interface SignupOptions {
  autoLogin?: boolean;
  sendWelcomeEmail?: boolean;
}

export async function signupUser(
  credentials: SignupCredentials,
  options: SignupOptions = {}
): Promise<SignupResult> {
  try {
    const validation = validateSignupCredentials(credentials);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          code: "validation_error",
          title: "Invalid Information",
          message: validation.errors.join(". "),
          solutions: ["Please correct the highlighted fields and try again"]
        }
      };
    }

    const payload = {
      email: credentials.email,
      password: credentials.password,
      name: credentials.name
    };

    const result = await buttClient.register('client', payload);

    if (result) {
      const requiresVerification = true;
      return {
        success: true,
        data: result,
        requiresEmailVerification: requiresVerification
      };
    } else {
      return {
        success: false,
        error: {
          code: "registration_failed",
          title: "Registration Failed",
          message: "Unable to create your account. Please try again.",
          solutions: [
            "Check your internet connection",
            "Try again in a few minutes",
            "Contact support if the problem persists"
          ]
        }
      };
    }
  } catch (error: any) {
    if (error.message?.includes('Email already exists') || 
        error.message?.includes('409') ||
        error.message?.includes('already registered')) {
      return {
        success: false,
        error: {
          code: "email_already_exists",
          title: authMessages.signup.errors.email_already_exists.title,
          message: authMessages.signup.errors.email_already_exists.message,
          solutions: authMessages.signup.errors.email_already_exists.solutions
        }
      };
    }

    if (error.message?.includes('Password') || error.message?.includes('weak')) {
      return {
        success: false,
        error: {
          code: "weak_password",
          title: authMessages.signup.errors.weak_password.title,
          message: authMessages.signup.errors.weak_password.message,
          solutions: authMessages.signup.errors.weak_password.solutions
        }
      };
    }

    if (error.message?.includes('Invalid email') || error.message?.includes('400')) {
      return {
        success: false,
        error: {
          code: "invalid_email",
          title: authMessages.signup.errors.invalid_email.title,
          message: authMessages.signup.errors.invalid_email.message,
          solutions: authMessages.signup.errors.invalid_email.solutions
        }
      };
    }

    if (error.message?.includes('Name') || error.message?.includes('required')) {
      return {
        success: false,
        error: {
          code: "name_required",
          title: authMessages.signup.errors.name_required.title,
          message: authMessages.signup.errors.name_required.message,
          solutions: authMessages.signup.errors.name_required.solutions
        }
      };
    }

    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return {
        success: false,
        error: {
          code: "network_error",
          title: authMessages.signup.errors.network_error.title,
          message: authMessages.signup.errors.network_error.message,
          solutions: authMessages.signup.errors.network_error.solutions
        }
      };
    }

    if (error.message?.includes('500') || error.message?.includes('Server error')) {
      return {
        success: false,
        error: {
          code: "server_error",
          title: authMessages.signup.errors.server_error.title,
          message: authMessages.signup.errors.server_error.message,
          solutions: authMessages.signup.errors.server_error.solutions
        }
      };
    }

    return {
      success: false,
      error: {
        code: "unknown_error",
        title: authMessages.signup.errors.unknown_error.title,
        message: authMessages.signup.errors.unknown_error.message,
        solutions: authMessages.signup.errors.unknown_error.solutions
      }
    };
  }
}

export function validateSignupCredentials(credentials: SignupCredentials): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!credentials.name || credentials.name.trim().length === 0) {
    errors.push("Full name is required");
  } else if (credentials.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (!/^[a-zA-Z\\s'-]+$/.test(credentials.name.trim())) {
    errors.push("Name can only contain letters, spaces, hyphens, and apostrophes");
  }

  if (!credentials.email) {
    errors.push("Email is required");
  } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(credentials.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!credentials.password) {
    errors.push("Password is required");
  } else {
    if (credentials.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(credentials.password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(credentials.password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\\d)/.test(credentials.password)) {
      errors.push("Password must contain at least one number");
    }
  }

  if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function sendEmailVerification(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send verification email"
    };
  }
}



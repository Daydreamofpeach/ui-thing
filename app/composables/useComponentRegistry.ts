import { ref, computed } from 'vue';
import type { AuthFlowNode, UserFlowNode } from '~/types/api-node-types';

export interface ComponentBlock {
  id: string;
  name: string;
  type: 'auth' | 'user' | 'function' | 'condition';
  category: string;
  description: string;
  tsCode: string;
  vueCode: string;
  dependencies: string[];
  props: Record<string, any>;
  methods: Record<string, any>;
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentRegistry {
  blocks: ComponentBlock[];
  addBlock: (block: Omit<ComponentBlock, 'id' | 'createdAt' | 'updatedAt' | 'isGenerated'>) => void;
  updateBlock: (id: string, updates: Partial<ComponentBlock>) => void;
  removeBlock: (id: string) => void;
  getBlock: (id: string) => ComponentBlock | undefined;
  getBlocksByType: (type: ComponentBlock['type']) => ComponentBlock[];
  getBlocksByCategory: (category: string) => ComponentBlock[];
  generateFromNode: (node: AuthFlowNode | UserFlowNode) => ComponentBlock;
}

const blocks = ref<ComponentBlock[]>([]);

export const useComponentRegistry = (): ComponentRegistry => {
  const addBlock = (blockData: Omit<ComponentBlock, 'id' | 'createdAt' | 'updatedAt' | 'isGenerated'>) => {
    const block: ComponentBlock = {
      ...blockData,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isGenerated: true
    };
    blocks.value.push(block);
  };

  const updateBlock = (id: string, updates: Partial<ComponentBlock>) => {
    const index = blocks.value.findIndex(block => block.id === id);
    if (index !== -1) {
      blocks.value[index] = {
        ...blocks.value[index],
        ...updates,
        updatedAt: new Date()
      };
    }
  };

  const removeBlock = (id: string) => {
    const index = blocks.value.findIndex(block => block.id === id);
    if (index !== -1) {
      blocks.value.splice(index, 1);
    }
  };

  const getBlock = (id: string) => {
    return blocks.value.find(block => block.id === id);
  };

  const getBlocksByType = (type: ComponentBlock['type']) => {
    return blocks.value.filter(block => block.type === type);
  };

  const getBlocksByCategory = (category: string) => {
    return blocks.value.filter(block => block.category === category);
  };

  const generateFromNode = (node: AuthFlowNode | UserFlowNode): ComponentBlock => {
    const baseBlock = {
      name: node.name,
      type: node.type as ComponentBlock['type'],
      category: 'api',
      description: node.description || `Generated from ${node.name} node`,
      tsCode: '',
      vueCode: '',
      dependencies: [],
      props: {},
      methods: {}
    };

    // Generate TypeScript connection logic
    baseBlock.tsCode = generateTsCode(node);
    
    // Generate Vue component code
    baseBlock.vueCode = generateVueCode(node);
    
    // Extract dependencies
    baseBlock.dependencies = extractDependencies(node);
    
    // Extract props and methods
    baseBlock.props = extractProps(node);
    baseBlock.methods = extractMethods(node);

    return baseBlock as ComponentBlock;
  };

  return {
    blocks: computed(() => blocks.value),
    addBlock,
    updateBlock,
    removeBlock,
    getBlock,
    getBlocksByType,
    getBlocksByCategory,
    generateFromNode
  };
};

// Helper functions for code generation
const generateTsCode = (node: AuthFlowNode | UserFlowNode): string => {
  const nodeType = node.type;
  
  switch (nodeType) {
    case 'login':
      return generateLoginTsCode(node);
    case 'register':
      return generateRegisterTsCode(node);
    case 'logout':
      return generateLogoutTsCode(node);
    case 'verify':
      return generateVerifyTsCode(node);
    case 'refresh':
      return generateRefreshTsCode(node);
    case 'reset':
      return generateResetTsCode(node);
    case 'getUser':
      return generateGetUserTsCode(node);
    case 'updateUser':
      return generateUpdateUserTsCode(node);
    case 'assignRole':
      return generateAssignRoleTsCode(node);
    case 'getAllUsers':
      return generateGetAllUsersTsCode(node);
    default:
      return generateGenericTsCode(node);
  }
};

const generateVueCode = (node: AuthFlowNode | UserFlowNode): string => {
  const nodeType = node.type;
  
  switch (nodeType) {
    case 'login':
      return generateLoginVueCode(node);
    case 'register':
      return generateRegisterVueCode(node);
    case 'logout':
      return generateLogoutVueCode(node);
    case 'verify':
      return generateVerifyVueCode(node);
    case 'refresh':
      return generateRefreshVueCode(node);
    case 'reset':
      return generateResetVueCode(node);
    case 'getUser':
      return generateGetUserVueCode(node);
    case 'updateUser':
      return generateUpdateUserVueCode(node);
    case 'assignRole':
      return generateAssignRoleVueCode(node);
    case 'getAllUsers':
      return generateGetAllUsersVueCode(node);
    default:
      return generateGenericVueCode(node);
  }
};

// TypeScript code generators
const generateLoginTsCode = (node: AuthFlowNode): string => {
  return `// Generated TypeScript code for Login functionality
import { useUnifiedAuth } from '~/composables/useUnifiedAuth';
import { buttClient } from '~/utils/buttClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: any;
  error?: string;
  access_token?: string;
}

export const useLoginLogic = () => {
  const { login: unifiedLogin, isLoading, error } = useUnifiedAuth();

  const executeLogin = async (data: LoginData): Promise<LoginResult> => {
    try {
      // Validate input
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }

      // Use unified auth system
      const result = await unifiedLogin({
        email: data.email,
        password: data.password
      });

      return {
        success: true,
        user: result,
        access_token: result?.access_token
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed'
      };
    }
  };

  return {
    executeLogin,
    isLoading,
    error
  };
};`;
};

const generateRegisterTsCode = (node: AuthFlowNode): string => {
  return `// Generated TypeScript code for Register functionality
import { buttClient } from '~/utils/buttClient';
import { useUnifiedAuth } from '~/composables/useUnifiedAuth';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const useRegisterLogic = () => {
  const { login } = useUnifiedAuth();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const executeRegister = async (data: RegisterData): Promise<RegisterResult> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Validate input
      if (!data.name || !data.email || !data.password) {
        throw new Error('Name, email and password are required');
      }

      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Use buttClient register method
      const result = await buttRegister({
        name: data.name,
        email: data.email,
        password: data.password
      });

      // Auto-login after successful registration
      if (result) {
        await login({
          email: data.email,
          password: data.password
        });
      }

      return {
        success: true,
        user: result
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    executeRegister,
    isLoading,
    error
  };
};`;
};

// Vue component generators
const generateLoginVueCode = (node: AuthFlowNode): string => {
  return `<template>
  <div class="login-component">
    <AuthDrawer
      v-model:open="isOpen"
      @close="handleClose"
    >
      <template #logo>
        <img
          src="/WhiteSVGLogo.svg"
          alt="Buildit Logo"
          class="auth-drawer-logo-svg"
        >
      </template>

      <template #title>
        <h2 class="auth-drawer-title-text">
          Welcome Back
        </h2>
      </template>

      <template #subtitle>
        <p class="auth-drawer-subtitle-text">
          Sign in to your account to continue
        </p>
      </template>

      <template #body>
        <div class="auth-content">
          <AuthForm
            :loading="isLoading"
            @submit="handleLogin"
          >
            <template #fields>
              <AuthField
                v-model="formState.email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                :required="true"
                :icon="true"
                :error="error || undefined"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </template>
              </AuthField>

              <AuthField
                v-model="formState.password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                :required="true"
                :icon="true"
                :error="error || undefined"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </template>
              </AuthField>
            </template>

            <template #actions>
              <AuthButton
                type="submit"
                variant="primary"
                size="lg"
                :loading="isLoading"
                :block="true"
              >
                {{ isLoading ? "Signing in..." : "Sign In" }}
              </AuthButton>
            </template>
          </AuthForm>
        </div>
      </template>
    </AuthDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useLoginLogic, type LoginData } from './login-logic';
import AuthDrawer from '~/components/ui/AuthDrawer.vue';
import AuthForm from '~/components/ui/AuthForm.vue';
import AuthField from '~/components/ui/AuthField.vue';
import AuthButton from '~/components/ui/AuthButton.vue';

interface Props {
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false
});

const emit = defineEmits<{
  close: [];
  success: [result: any];
  error: [error: string];
}>();

const { executeLogin, isLoading, error } = useLoginLogic();

const isOpen = ref(props.open);

const formState = reactive<LoginData>({
  email: '',
  password: ''
});

const handleLogin = async (event: Event) => {
  event.preventDefault();
  
  const result = await executeLogin(formState);
  
  if (result.success) {
    emit('success', result);
    handleClose();
  } else {
    emit('error', result.error || 'Login failed');
  }
};

const handleClose = () => {
  isOpen.value = false;
  emit('close');
};
</script>

<style scoped>
.login-component {
  /* Component-specific styles */
}
</style>`;
};

const generateRegisterVueCode = (node: AuthFlowNode): string => {
  return `<template>
  <div class="register-component">
    <AuthDrawer
      v-model:open="isOpen"
      @close="handleClose"
    >
      <template #logo>
        <img
          src="/WhiteSVGLogo.svg"
          alt="Buildit Logo"
          class="auth-drawer-logo-svg"
        >
      </template>

      <template #title>
        <h2 class="auth-drawer-title-text">
          Create Account
        </h2>
      </template>

      <template #subtitle>
        <p class="auth-drawer-subtitle-text">
          Join Buildit and start building amazing projects
        </p>
      </template>

      <template #body>
        <div class="auth-content">
          <AuthForm
            :loading="isLoading"
            @submit="handleRegister"
          >
            <template #fields>
              <AuthField
                v-model="formState.name"
                label="Full Name"
                placeholder="Enter your full name"
                :required="true"
                :icon="true"
                :error="error || undefined"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </template>
              </AuthField>

              <AuthField
                v-model="formState.email"
                label="Email"
                type="email"
                placeholder="Enter your email address"
                :required="true"
                :icon="true"
                :error="error || undefined"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </template>
              </AuthField>

              <AuthField
                v-model="formState.password"
                label="Password"
                type="password"
                placeholder="Choose a secure password"
                :required="true"
                :icon="true"
                :error="error || undefined"
                hint="Password must be at least 8 characters long"
              >
                <template #icon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </template>
              </AuthField>
            </template>

            <template #actions>
              <AuthButton
                type="submit"
                variant="primary"
                size="lg"
                :loading="isLoading"
                :block="true"
              >
                {{ isLoading ? "Creating Account..." : "Create Account" }}
              </AuthButton>
            </template>
          </AuthForm>
        </div>
      </template>
    </AuthDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRegisterLogic, type RegisterData } from './register-logic';
import AuthDrawer from '~/components/ui/AuthDrawer.vue';
import AuthForm from '~/components/ui/AuthForm.vue';
import AuthField from '~/components/ui/AuthField.vue';
import AuthButton from '~/components/ui/AuthButton.vue';

interface Props {
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false
});

const emit = defineEmits<{
  close: [];
  success: [result: any];
  error: [error: string];
}>();

const { executeRegister, isLoading, error } = useRegisterLogic();

const isOpen = ref(props.open);

const formState = reactive<RegisterData>({
  name: '',
  email: '',
  password: ''
});

const handleRegister = async (event: Event) => {
  event.preventDefault();
  
  const result = await executeRegister(formState);
  
  if (result.success) {
    emit('success', result);
    handleClose();
  } else {
    emit('error', result.error || 'Registration failed');
  }
};

const handleClose = () => {
  isOpen.value = false;
  emit('close');
};
</script>

<style scoped>
.register-component {
  /* Component-specific styles */
}
</style>`;
};

// Generic generators for other node types
const generateGenericTsCode = (node: AuthFlowNode | UserFlowNode): string => {
  return `// Generated TypeScript code for ${node.name}
// This is a generic implementation - customize as needed

export interface ${node.name}Data {
  // Define your data interface here
}

export interface ${node.name}Result {
  success: boolean;
  data?: any;
  error?: string;
}

export const use${node.name}Logic = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (data: ${node.name}Data): Promise<${node.name}Result> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Implement your logic here
      // Use buttClient methods as needed

      return {
        success: true,
        data: {}
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    execute,
    isLoading,
    error
  };
};`;
};

const generateGenericVueCode = (node: AuthFlowNode | UserFlowNode): string => {
  return `<template>
  <div class="${node.name.toLowerCase()}-component">
    <!-- Generated UI component for ${node.name} -->
    <div class="component-container">
      <h3>${node.name}</h3>
      <p>${node.description || 'Generated component'}</p>
      <!-- Add your UI elements here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { use${node.name}Logic, type ${node.name}Data } from './${node.name.toLowerCase()}-logic';

// Component implementation
</script>

<style scoped>
.${node.name.toLowerCase()}-component {
  /* Component-specific styles */
}
</style>`;
};

// Helper functions for extracting metadata
const extractDependencies = (node: AuthFlowNode | UserFlowNode): string[] => {
  const deps = ['vue'];
  
  if (node.type.includes('auth') || ['login', 'register', 'logout', 'verify', 'refresh', 'reset'].includes(node.type)) {
    deps.push('~/composables/useUnifiedAuth');
    deps.push('~/utils/buttClient');
  }
  
  if (node.type.includes('user') || ['getUser', 'updateUser', 'assignRole', 'getAllUsers'].includes(node.type)) {
    deps.push('~/utils/buttClient');
  }
  
  return deps;
};

const extractProps = (node: AuthFlowNode | UserFlowNode): Record<string, any> => {
  return {
    open: { type: Boolean, default: false },
    // Add more props based on node type
  };
};

const extractMethods = (node: AuthFlowNode | UserFlowNode): Record<string, any> => {
  return {
    execute: 'Function to execute the node logic',
    // Add more methods based on node type
  };
};

// Placeholder generators for other node types
const generateLogoutTsCode = (node: AuthFlowNode) => generateGenericTsCode(node);
const generateVerifyTsCode = (node: AuthFlowNode) => generateGenericTsCode(node);
const generateRefreshTsCode = (node: AuthFlowNode) => generateGenericTsCode(node);
const generateResetTsCode = (node: AuthFlowNode) => generateGenericTsCode(node);
const generateGetUserTsCode = (node: UserFlowNode) => generateGenericTsCode(node);
const generateUpdateUserTsCode = (node: UserFlowNode) => generateGenericTsCode(node);
const generateAssignRoleTsCode = (node: UserFlowNode) => generateGenericTsCode(node);
const generateGetAllUsersTsCode = (node: UserFlowNode) => generateGenericTsCode(node);

const generateLogoutVueCode = (node: AuthFlowNode) => generateGenericVueCode(node);
const generateVerifyVueCode = (node: AuthFlowNode) => generateGenericVueCode(node);
const generateRefreshVueCode = (node: AuthFlowNode) => generateGenericVueCode(node);
const generateResetVueCode = (node: AuthFlowNode) => generateGenericVueCode(node);
const generateGetUserVueCode = (node: UserFlowNode) => generateGenericVueCode(node);
const generateUpdateUserVueCode = (node: UserFlowNode) => generateGenericVueCode(node);
const generateAssignRoleVueCode = (node: UserFlowNode) => generateGenericVueCode(node);
const generateGetAllUsersVueCode = (node: UserFlowNode) => generateGenericVueCode(node);

// Configuration utility for Blue Carbon Registry
// Centralizes all environment variable access and validation

interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
  };

  // Blockchain Configuration
  blockchain: {
    rpcUrl: string;
    walletConnectProjectId: string;
    chainId: number;
    enabled: boolean;
  };

  // IPFS Configuration
  ipfs: {
    gateway: string;
    apiUrl: string;
    enabled: boolean;
  };

  // Authentication
  auth: {
    cookieName: string;
  };

  // File Upload
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
  };

  // Feature Flags
  features: {
    demoMode: boolean;
    blockchain: boolean;
    ipfs: boolean;
  };

  // External Services
  external: {
    mapboxToken?: string;
    sentryDsn?: string;
  };

  // Development
  dev: {
    debug: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };

  // Environment
  env: 'development' | 'production' | 'test';
}

// Helper function to get environment variable with fallback
function getEnvVar(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

// Helper function to get boolean environment variable
function getEnvBoolean(key: string, fallback: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

// Helper function to get number environment variable
function getEnvNumber(key: string, fallback: number = 0): number {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Create configuration object
export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', import.meta.env.DEV ? 'http://localhost:3001' : '/api'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 10000),
  },

  blockchain: {
    rpcUrl: getEnvVar('VITE_RPC_URL', 'https://rpc.sepolia.org'),
    walletConnectProjectId: getEnvVar('VITE_WALLETCONNECT_PROJECT_ID', ''),
    chainId: getEnvNumber('VITE_CHAIN_ID', 11155111), // Sepolia by default
    enabled: getEnvBoolean('VITE_ENABLE_BLOCKCHAIN', true),
  },

  ipfs: {
    gateway: getEnvVar('VITE_IPFS_GATEWAY', 'https://ipfs.io/ipfs/'),
    apiUrl: getEnvVar('VITE_IPFS_API_URL', 'https://api.pinata.cloud'),
    enabled: getEnvBoolean('VITE_ENABLE_IPFS', false),
  },

  auth: {
    cookieName: getEnvVar('VITE_AUTH_COOKIE_NAME', 'blue-carbon-auth'),
  },

  upload: {
    maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB default
    allowedTypes: getEnvVar('VITE_ALLOWED_FILE_TYPES', 'image/*,application/pdf,text/plain').split(','),
  },

  features: {
    demoMode: getEnvBoolean('VITE_ENABLE_DEMO_MODE', import.meta.env.DEV),
    blockchain: getEnvBoolean('VITE_ENABLE_BLOCKCHAIN', true),
    ipfs: getEnvBoolean('VITE_ENABLE_IPFS', false),
  },

  external: {
    mapboxToken: getEnvVar('VITE_MAPBOX_ACCESS_TOKEN'),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  },

  dev: {
    debug: getEnvBoolean('VITE_DEBUG', import.meta.env.DEV),
    logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as AppConfig['dev']['logLevel']),
  },

  env: import.meta.env.MODE as AppConfig['env'],
};

// Validation functions
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required API configuration
  if (!config.api.baseUrl && config.env === 'development') {
    errors.push('API base URL is required in development');
  }

  // Validate blockchain configuration if enabled
  if (config.features.blockchain) {
    if (!config.blockchain.rpcUrl) {
      errors.push('Blockchain RPC URL is required when blockchain is enabled');
    }
    if (!config.blockchain.walletConnectProjectId) {
      console.warn('WalletConnect project ID is missing - wallet connection may not work properly');
    }
  }

  // Validate IPFS configuration if enabled
  if (config.features.ipfs) {
    if (!config.ipfs.gateway) {
      errors.push('IPFS gateway is required when IPFS is enabled');
    }
    if (!config.ipfs.apiUrl) {
      errors.push('IPFS API URL is required when IPFS is enabled');
    }
  }

  // Validate external services in production
  if (config.env === 'production') {
    if (!config.external.mapboxToken) {
      console.warn('Mapbox token is missing - map features may not work');
    }
    if (!config.external.sentryDsn) {
      console.warn('Sentry DSN is missing - error tracking disabled');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Initialize configuration validation
const validationResult = validateConfig();
if (!validationResult.valid) {
  console.error('Configuration validation failed:', validationResult.errors);
  // Don't throw in production - just log warnings
  if (config.env === 'production') {
    console.warn('Production deployment with missing configuration - some features may not work');
  }
}

// Log configuration in development
if (config.dev.debug && config.env === 'development') {
  console.log('App Configuration:', {
    ...config,
    // Hide sensitive values
    blockchain: {
      ...config.blockchain,
      walletConnectProjectId: config.blockchain.walletConnectProjectId ? '[REDACTED]' : '',
    },
    external: {
      mapboxToken: config.external.mapboxToken ? '[REDACTED]' : '',
      sentryDsn: config.external.sentryDsn ? '[REDACTED]' : '',
    },
  });
}

// Export individual config sections for convenience
export const {
  api: apiConfig,
  blockchain: blockchainConfig,
  ipfs: ipfsConfig,
  auth: authConfig,
  upload: uploadConfig,
  features: featureFlags,
  external: externalConfig,
  dev: devConfig,
} = config;

// Export utility functions
export function isProduction(): boolean {
  return config.env === 'production';
}

export function isDevelopment(): boolean {
  return config.env === 'development';
}

export function isTest(): boolean {
  return config.env === 'test';
}

export function isDemoMode(): boolean {
  return config.features.demoMode;
}

export function isDebugEnabled(): boolean {
  return config.dev.debug;
}

// Default export
export default config;
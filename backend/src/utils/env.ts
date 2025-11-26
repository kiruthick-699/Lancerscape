/**
 * backend/src/utils/env.ts
 * 
 * Safe environment variable loader with validation
 */

/**
 * Environment configuration interface
 */
interface EnvConfig {
  /** Backend server port */
  backendPort: number;
  
  /** AI API key (optional, for Phase 7) */
  aiApiKey?: string;
  
  /** Storage path for uploads */
  storagePath: string;
  
  /** Frontend URL for CORS */
  frontendUrl: string;
  
  /** Node environment */
  nodeEnv: string;
}

/**
 * loadEnvConfig
 * 
 * Load and validate environment variables
 * 
 * @throws Error if required environment variables are missing or invalid
 * @returns Validated environment configuration
 */
export function loadEnvConfig(): EnvConfig {
  // Load BACKEND_PORT (required)
  const backendPort = process.env.BACKEND_PORT || process.env.PORT;
  if (!backendPort) {
    throw new Error(
      'Missing required environment variable: BACKEND_PORT or PORT. ' +
      'Please set this in your .env file or environment.'
    );
  }
  
  const parsedPort = parseInt(backendPort, 10);
  if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error(
      `Invalid BACKEND_PORT: "${backendPort}". Must be a valid port number (1-65535).`
    );
  }
  
  // Load STORAGE_PATH (required)
  const storagePath = process.env.STORAGE_PATH;
  if (!storagePath) {
    throw new Error(
      'Missing required environment variable: STORAGE_PATH. ' +
      'Please set the path for temporary file uploads (e.g., ./uploads).'
    );
  }
  
  // Load AI_API_KEY (optional, will be required in Phase 7)
  const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!aiApiKey) {
    console.warn(
      'Warning: AI_API_KEY not set. AI features will not be available. ' +
      'Set OPENAI_API_KEY or AI_API_KEY to enable dispute analysis.'
    );
  }
  
  // Load FRONTEND_URL (optional, defaults to localhost:3000)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Load NODE_ENV (optional, defaults to development)
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    backendPort: parsedPort,
    aiApiKey,
    storagePath,
    frontendUrl,
    nodeEnv,
  };
}

/**
 * Singleton instance of environment configuration
 * Loaded once at startup to fail fast if configuration is invalid
 */
export const envConfig = loadEnvConfig();

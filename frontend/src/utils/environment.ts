/**
 * Environment Helper Utility for Vite
 * 
 * This utility provides a centralized way to access environment variables in Vite.
 * In Vite, environment variables are accessed via import.meta.env and must be prefixed with VITE_
 * to be exposed to the client-side code.
 */

export interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;
  
  // Application Configuration
  appName: string;
  appVersion: string;
  
  // Development Configuration
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Optional configurations
  enableLogging?: boolean;
  debugMode?: boolean;
}

class EnvironmentHelper {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadEnvironmentConfig();
  }

  /**
   * Load and validate environment configuration
   */
  private loadEnvironmentConfig(): EnvironmentConfig {
    const env = import.meta.env;
    
    return {
      // API Configuration
      apiUrl: this.getEnvVar('VITE_API_URL', 'http://localhost:8000/api'),
      apiTimeout: parseInt(this.getEnvVar('VITE_API_TIMEOUT', '10000')),
      
      // Application Configuration
      appName: this.getEnvVar('VITE_APP_NAME', 'Invoy'),
      appVersion: this.getEnvVar('VITE_APP_VERSION', '1.0.0'),
      
      // Environment Detection
      isDevelopment: env.MODE === 'development',
      isProduction: env.MODE === 'production',
      
      // Optional configurations
      enableLogging: this.getBooleanEnvVar('VITE_ENABLE_LOGGING', true),
      debugMode: this.getBooleanEnvVar('VITE_DEBUG_MODE', env.MODE === 'development'),
    };
  }

  /**
   * Get environment variable with fallback
   */
  private getEnvVar(key: string, defaultValue: string): string {
    const value = import.meta.env[key];
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get boolean environment variable with fallback
   */
  private getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Get the complete environment configuration
   */
  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Get API base URL
   */
  public getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Get API timeout
   */
  public getApiTimeout(): number {
    return this.config.apiTimeout;
  }

  /**
   * Get application name
   */
  public getAppName(): string {
    return this.config.appName;
  }

  /**
   * Get application version
   */
  public getAppVersion(): string {
    return this.config.appVersion;
  }

  /**
   * Check if running in development mode
   */
  public isDev(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Check if running in production mode
   */
  public isProd(): boolean {
    return this.config.isProduction;
  }

  /**
   * Check if logging is enabled
   */
  public isLoggingEnabled(): boolean {
    return this.config.enableLogging || false;
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    return this.config.debugMode || false;
  }

  /**
   * Log configuration (only in development)
   */
  public logConfig(): void {
    if (this.isDev() && this.isLoggingEnabled()) {
      console.group('🔧 Environment Configuration');
      console.table(this.config);
      console.groupEnd();
    }
  }

  /**
   * Validate required environment variables
   */
  public validateEnvironment(): { isValid: boolean; missingVars: string[] } {
    const missingVars: string[] = [];
    
    // Add validation for required environment variables here
    // Example:
    // if (!this.config.apiUrl) missingVars.push('VITE_API_URL');
    
    return {
      isValid: missingVars.length === 0,
      missingVars
    };
  }
}

// Create singleton instance
const envHelper = new EnvironmentHelper();

// Log configuration in development
envHelper.logConfig();

// Validate environment on startup
const validation = envHelper.validateEnvironment();
if (!validation.isValid && envHelper.isDev()) {
  console.warn('⚠️ Missing environment variables:', validation.missingVars);
}

export default envHelper;

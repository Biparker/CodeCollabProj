/**
 * Type declarations for environment variables
 * Extends NodeJS.ProcessEnv to provide type safety for REACT_APP_* variables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * Node environment (development, production, test)
     */
    NODE_ENV: 'development' | 'production' | 'test';

    /**
     * Base URL for API requests
     * @example "http://localhost:5001/api"
     */
    REACT_APP_API_URL: string;

    /**
     * Optional: Application name for display purposes
     */
    REACT_APP_NAME?: string;

    /**
     * Optional: Application version
     */
    REACT_APP_VERSION?: string;

    /**
     * Optional: Enable debug mode for additional logging
     */
    REACT_APP_DEBUG?: 'true' | 'false';

    /**
     * Optional: Sentry DSN for error tracking
     */
    REACT_APP_SENTRY_DSN?: string;

    /**
     * Optional: Google Analytics tracking ID
     */
    REACT_APP_GA_TRACKING_ID?: string;

    /**
     * Optional: Feature flags as JSON string
     */
    REACT_APP_FEATURE_FLAGS?: string;
  }
}

export {};

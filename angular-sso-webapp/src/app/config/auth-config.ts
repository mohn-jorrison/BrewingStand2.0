import { Configuration, BrowserCacheLocation, LogLevel, InteractionType } from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';

// Azure AD B2C Authority URLs structure
export interface B2CAuthority {
  signUpSignIn: string;
  editProfile?: string;
  resetPassword: string;
}

// Tenant-specific Azure AD B2C configuration
export interface TenantAuthConfig {
  tenantId: string;
  tenantName: string;
  clientId: string;
  authority: B2CAuthority;
  knownAuthorities: string[];
  redirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string[];
  apiEndpoint?: string;
}

// Multi-tenant Azure AD B2C configurations
export const TENANT_AUTH_CONFIGS: Record<string, TenantAuthConfig> = {
  default: {
    tenantId: 'default',
    tenantName: 'TechCorp Solutions',
    clientId: 'YOUR_DEFAULT_CLIENT_ID', // Replace with actual client ID
    authority: {
      signUpSignIn: 'https://YOUR_TENANT_NAME.b2clogin.com/YOUR_TENANT_NAME.onmicrosoft.com/B2C_1_signupsignin1',
      resetPassword: 'https://YOUR_TENANT_NAME.b2clogin.com/YOUR_TENANT_NAME.onmicrosoft.com/B2C_1_passwordreset1'
    },
    knownAuthorities: ['YOUR_TENANT_NAME.b2clogin.com'],
    redirectUri: `${window.location.origin}/auth/callback`,
    postLogoutRedirectUri: `${window.location.origin}`,
    scopes: ['openid', 'profile', 'offline_access'],
    apiEndpoint: 'https://api.techcorp.com'
  },
  enterprise: {
    tenantId: 'enterprise',
    tenantName: 'Goldman Sachs Enterprise',
    clientId: 'YOUR_ENTERPRISE_CLIENT_ID', // Replace with actual client ID
    authority: {
      signUpSignIn: 'https://YOUR_ENTERPRISE_TENANT.b2clogin.com/YOUR_ENTERPRISE_TENANT.onmicrosoft.com/B2C_1_enterprise_signin',
      resetPassword: 'https://YOUR_ENTERPRISE_TENANT.b2clogin.com/YOUR_ENTERPRISE_TENANT.onmicrosoft.com/B2C_1_enterprise_reset'
    },
    knownAuthorities: ['YOUR_ENTERPRISE_TENANT.b2clogin.com'],
    redirectUri: `${window.location.origin}/auth/callback`,
    postLogoutRedirectUri: `${window.location.origin}`,
    scopes: ['openid', 'profile', 'offline_access', 'https://YOUR_ENTERPRISE_TENANT.onmicrosoft.com/api/read'],
    apiEndpoint: 'https://api.enterprise.goldmansachs.com'
  },
  startup: {
    tenantId: 'startup',
    tenantName: 'Stripe Innovations',
    clientId: 'YOUR_STARTUP_CLIENT_ID', // Replace with actual client ID
    authority: {
      signUpSignIn: 'https://YOUR_STARTUP_TENANT.b2clogin.com/YOUR_STARTUP_TENANT.onmicrosoft.com/B2C_1_startup_flow',
      resetPassword: 'https://YOUR_STARTUP_TENANT.b2clogin.com/YOUR_STARTUP_TENANT.onmicrosoft.com/B2C_1_startup_reset'
    },
    knownAuthorities: ['YOUR_STARTUP_TENANT.b2clogin.com'],
    redirectUri: `${window.location.origin}/auth/callback`,
    postLogoutRedirectUri: `${window.location.origin}`,
    scopes: ['openid', 'profile', 'offline_access'],
    apiEndpoint: 'https://api.stripe-innovations.com'
  },
  creative: {
    tenantId: 'creative',
    tenantName: 'Pixel Studios',
    clientId: 'YOUR_CREATIVE_CLIENT_ID', // Replace with actual client ID
    authority: {
      signUpSignIn: 'https://YOUR_CREATIVE_TENANT.b2clogin.com/YOUR_CREATIVE_TENANT.onmicrosoft.com/B2C_1_creative_signin',
      resetPassword: 'https://YOUR_CREATIVE_TENANT.b2clogin.com/YOUR_CREATIVE_TENANT.onmicrosoft.com/B2C_1_creative_reset'
    },
    knownAuthorities: ['YOUR_CREATIVE_TENANT.b2clogin.com'],
    redirectUri: `${window.location.origin}/auth/callback`,
    postLogoutRedirectUri: `${window.location.origin}`,
    scopes: ['openid', 'profile', 'offline_access'],
    apiEndpoint: 'https://api.pixelstudios.com'
  }
};

/**
 * Factory function to create MSAL configuration for a specific tenant
 */
export function createMsalConfiguration(tenantConfig: TenantAuthConfig): Configuration {
  return {
    auth: {
      clientId: tenantConfig.clientId,
      authority: tenantConfig.authority.signUpSignIn,
      knownAuthorities: tenantConfig.knownAuthorities,
      redirectUri: tenantConfig.redirectUri,
      postLogoutRedirectUri: tenantConfig.postLogoutRedirectUri,
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false, // Set to true for IE11 or Edge support
      secureCookies: false
    },
    system: {
      loggerOptions: {
        loggerCallback: (logLevel: LogLevel, message: string) => {
          console.log(`MSAL [${LogLevel[logLevel]}]: ${message}`);
        },
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false
      }
    }
  };
}

/**
 * Factory function to create MSAL Guard configuration
 */
export function createMsalGuardConfig(tenantConfig: TenantAuthConfig): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: tenantConfig.scopes
    },
    loginFailedRoute: '/auth/error'
  };
}

/**
 * Factory function to create MSAL Interceptor configuration
 */
export function createMsalInterceptorConfig(tenantConfig: TenantAuthConfig): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  
  // Add API endpoints that require authentication
  if (tenantConfig.apiEndpoint) {
    protectedResourceMap.set(tenantConfig.apiEndpoint, tenantConfig.scopes);
  }
  
  // Add Microsoft Graph if needed
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

/**
 * B2C Policy Names - these should match your Azure AD B2C user flows
 */
export const B2C_POLICIES = {
  SIGN_UP_SIGN_IN: 'B2C_1_signupsignin1',
  EDIT_PROFILE: 'B2C_1_editprofile1',
  RESET_PASSWORD: 'B2C_1_passwordreset1',
  
  // Enterprise-specific policies
  ENTERPRISE_SIGN_IN: 'B2C_1_enterprise_signin',
  ENTERPRISE_RESET: 'B2C_1_enterprise_reset',
  
  // Startup-specific policies
  STARTUP_FLOW: 'B2C_1_startup_flow',
  STARTUP_RESET: 'B2C_1_startup_reset',
  
  // Creative-specific policies
  CREATIVE_SIGNIN: 'B2C_1_creative_signin',
  CREATIVE_RESET: 'B2C_1_creative_reset'
} as const;

/**
 * Default scopes for Microsoft Graph API
 */
export const GRAPH_SCOPES = {
  READ_USER: ['user.read'],
  READ_MAIL: ['mail.read'],
  READ_CALENDAR: ['calendars.read']
} as const;

/**
 * Environment-specific configuration
 */
export const AUTH_CONFIG = {
  production: false, // Set to true in production
  enableLogging: true,
  cacheLocation: BrowserCacheLocation.LocalStorage,
  storeAuthStateInCookie: false
} as const;
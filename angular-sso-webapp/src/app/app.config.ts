import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import { 
  MsalModule, 
  MsalGuard, 
  MsalInterceptor, 
  MsalService, 
  MsalBroadcastService,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG
} from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

import { routes } from './app.routes';
import { 
  TENANT_AUTH_CONFIGS, 
  createMsalConfiguration, 
  createMsalGuardConfig, 
  createMsalInterceptorConfig 
} from './config/auth-config';
import { AuthInterceptor, ErrorInterceptor } from './interceptors/auth.interceptor';

/**
 * Factory function to create MSAL instance
 * Uses default tenant configuration for initial setup
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  const defaultConfig = TENANT_AUTH_CONFIGS['default'];
  const msalConfig = createMsalConfiguration(defaultConfig);
  return new PublicClientApplication(msalConfig);
}

/**
 * Factory function to create MSAL Guard configuration
 */
export function MSALGuardConfigFactory() {
  const defaultConfig = TENANT_AUTH_CONFIGS['default'];
  return createMsalGuardConfig(defaultConfig);
}

/**
 * Factory function to create MSAL Interceptor configuration
 */
export function MSALInterceptorConfigFactory() {
  const defaultConfig = TENANT_AUTH_CONFIGS['default'];
  return createMsalInterceptorConfig(defaultConfig);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([])
    ),
    // MSAL Configuration
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    // MSAL Services
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    // Import MSAL Module
    importProvidersFrom(MsalModule)
  ]
};

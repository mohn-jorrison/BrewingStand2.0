import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of, Subject, map, catchError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  MsalService, 
  MsalBroadcastService, 
  MSAL_GUARD_CONFIG, 
  MsalGuardConfiguration 
} from '@azure/msal-angular';
import { 
  AuthenticationResult, 
  PopupRequest, 
  RedirectRequest, 
  SilentRequest,
  AccountInfo,
  InteractionStatus,
  EventMessage,
  EventType,
  AuthError
} from '@azure/msal-browser';

import { TenantConfigService } from './tenant-config.service';
import { 
  TENANT_AUTH_CONFIGS, 
  TenantAuthConfig, 
  createMsalConfiguration,
  B2C_POLICIES 
} from '../config/auth-config';

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  profilePicture?: string;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tenantId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureAuthService implements OnDestroy {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    tenantId: 'default'
  });

  public authState$ = this.authStateSubject.asObservable();
  private destroy$ = new Subject<void>();
  private currentTenantConfig: TenantAuthConfig | null = null;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private tenantConfigService: TenantConfigService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize authentication service
   */
  private initializeAuth(): void {
    // Subscribe to tenant configuration changes
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenantConfig => {
        if (tenantConfig) {
          this.currentTenantConfig = TENANT_AUTH_CONFIGS[tenantConfig.tenantId];
          this.updateAuthState({ tenantId: tenantConfig.tenantId });
        }
      });

    // Subscribe to MSAL events
    this.msalBroadcastService.msalSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: EventMessage) => {
        this.handleMsalEvent(result);
      });

    // Subscribe to interaction status
    this.msalBroadcastService.inProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: InteractionStatus) => {
        this.updateAuthState({ isLoading: status !== InteractionStatus.None });
      });

    // Check for existing authentication
    this.checkAccount();
  }

  /**
   * Handle MSAL events
   */
  private handleMsalEvent(result: EventMessage): void {
    switch (result.eventType) {
      case EventType.LOGIN_SUCCESS:
        this.handleLoginSuccess(result.payload as AuthenticationResult);
        break;
      case EventType.LOGIN_FAILURE:
        this.handleAuthError(result.error as AuthError);
        break;
      case EventType.LOGOUT_SUCCESS:
        this.handleLogoutSuccess();
        break;
      case EventType.ACQUIRE_TOKEN_SUCCESS:
        this.handleTokenSuccess(result.payload as AuthenticationResult);
        break;
      case EventType.ACQUIRE_TOKEN_FAILURE:
        this.handleAuthError(result.error as AuthError);
        break;
    }
  }

  /**
   * Check for existing account on app startup
   */
  private checkAccount(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    
    if (accounts.length > 0) {
      const account = accounts[0];
      this.setActiveAccount(account);
      this.getUserFromAccount(account);
    }
  }

  /**
   * Sign in with redirect
   */
  signInRedirect(): Observable<void> {
    if (!this.currentTenantConfig) {
      return this.handleError('No tenant configuration available');
    }

    this.updateAuthState({ isLoading: true, error: null });

    const loginRequest: RedirectRequest = {
      scopes: this.currentTenantConfig.scopes,
      authority: this.currentTenantConfig.authority.signUpSignIn
    };

    return from(this.msalService.loginRedirect(loginRequest));
  }

  /**
   * Sign in with popup
   */
  signInPopup(): Observable<AuthenticationResult> {
    if (!this.currentTenantConfig) {
      return this.handleError('No tenant configuration available');
    }

    this.updateAuthState({ isLoading: true, error: null });

    const loginRequest: PopupRequest = {
      scopes: this.currentTenantConfig.scopes,
      authority: this.currentTenantConfig.authority.signUpSignIn
    };

    return from(this.msalService.loginPopup(loginRequest)).pipe(
      map(result => {
        this.handleLoginSuccess(result);
        return result;
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Sign out
   */
  signOut(): Observable<void> {
    this.updateAuthState({ isLoading: true });

    const account = this.msalService.instance.getActiveAccount();
    
    if (account) {
      return from(this.msalService.logoutRedirect({
        account,
        postLogoutRedirectUri: this.currentTenantConfig?.postLogoutRedirectUri
      }));
    } else {
      this.handleLogoutSuccess();
      return of(void 0);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(scopes?: string[]): Observable<string> {
    const account = this.msalService.instance.getActiveAccount();
    
    if (!account || !this.currentTenantConfig) {
      return this.handleError('No active account or tenant configuration');
    }

    const tokenRequest: SilentRequest = {
      scopes: scopes || this.currentTenantConfig.scopes,
      account,
      authority: this.currentTenantConfig.authority.signUpSignIn
    };

    return from(this.msalService.acquireTokenSilent(tokenRequest)).pipe(
      map(result => result.accessToken),
      catchError(error => {
        // If silent token acquisition fails, try interactive
        if (error.name === 'InteractionRequiredAuthError') {
          return this.getTokenInteractive(tokenRequest.scopes);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Get token interactively
   */
  private getTokenInteractive(scopes: string[]): Observable<string> {
    if (!this.currentTenantConfig) {
      return this.handleError('No tenant configuration available');
    }

    const tokenRequest: PopupRequest = {
      scopes,
      authority: this.currentTenantConfig.authority.signUpSignIn
    };

    return from(this.msalService.acquireTokenPopup(tokenRequest)).pipe(
      map(result => result.accessToken),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Reset password
   */
  resetPassword(): Observable<void> {
    if (!this.currentTenantConfig) {
      return this.handleError('No tenant configuration available');
    }

    const resetRequest: RedirectRequest = {
      scopes: ['openid'],
      authority: this.currentTenantConfig.authority.resetPassword
    };

    return from(this.msalService.loginRedirect(resetRequest));
  }

  /**
   * Edit profile (if supported by tenant)
   */
  editProfile(): Observable<void> {
    if (!this.currentTenantConfig?.authority.editProfile) {
      return this.handleError('Profile editing not supported for this tenant');
    }

    const editRequest: RedirectRequest = {
      scopes: ['openid'],
      authority: this.currentTenantConfig.authority.editProfile
    };

    return from(this.msalService.loginRedirect(editRequest));
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }

  /**
   * Handle successful login
   */
  private handleLoginSuccess(result: AuthenticationResult): void {
    if (result.account) {
      this.setActiveAccount(result.account);
      this.getUserFromAccount(result.account);
    }
  }

  /**
   * Handle token acquisition success
   */
  private handleTokenSuccess(result: AuthenticationResult): void {
    // Token acquired successfully, can be used for API calls
    console.log('Token acquired successfully');
  }

  /**
   * Handle logout success
   */
  private handleLogoutSuccess(): void {
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  /**
   * Set active account in MSAL
   */
  private setActiveAccount(account: AccountInfo): void {
    this.msalService.instance.setActiveAccount(account);
  }

  /**
   * Create user object from account information
   */
  private getUserFromAccount(account: AccountInfo): void {
    const user: User = {
      id: account.localAccountId,
      email: account.username,
      name: account.name || account.username,
      displayName: account.name,
      givenName: (account.idTokenClaims as any)?.given_name,
      surname: (account.idTokenClaims as any)?.family_name,
      tenantId: this.authStateSubject.value.tenantId,
      roles: this.extractRolesFromClaims(account.idTokenClaims),
      permissions: this.extractPermissionsFromClaims(account.idTokenClaims),
      lastLogin: new Date()
    };

    this.updateAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  /**
   * Extract roles from token claims
   */
  private extractRolesFromClaims(claims: any): string[] {
    // Azure AD B2C can store roles in different claim types
    const roleClaims = claims?.roles || claims?.['extension_roles'] || claims?.['app_roles'] || [];
    return Array.isArray(roleClaims) ? roleClaims : [roleClaims].filter(Boolean);
  }

  /**
   * Extract permissions from token claims
   */
  private extractPermissionsFromClaims(claims: any): string[] {
    const permissionClaims = claims?.permissions || claims?.['extension_permissions'] || [];
    return Array.isArray(permissionClaims) ? permissionClaims : [permissionClaims].filter(Boolean);
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: AuthError): void {
    console.error('Authentication error:', error);
    
    let errorMessage = 'Authentication failed';
    
    if (error.errorCode === 'user_cancelled') {
      errorMessage = 'Sign in was cancelled';
    } else if (error.errorCode === 'network_error') {
      errorMessage = 'Network error occurred. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.updateAuthState({
      isLoading: false,
      error: errorMessage
    });
  }

  /**
   * Handle general errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Service error:', error);
    
    const errorMessage = typeof error === 'string' ? error : 
                        error?.message || 'An unexpected error occurred';
    
    this.updateAuthState({
      isLoading: false,
      error: errorMessage
    });

    throw error;
  }

  /**
   * Update authentication state
   */
  private updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      ...updates
    });
  }
}
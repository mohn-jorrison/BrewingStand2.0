import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, combineLatest } from 'rxjs';

import { AzureAuthService } from '../services/azure-auth.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private azureAuthService: AzureAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): Observable<boolean> {
    return combineLatest([
      this.azureAuthService.authState$,
      this.authService.authState$
    ]).pipe(
      map(([azureAuthState, traditionalAuthState]) => {
        const isAuthenticated = azureAuthState.isAuthenticated || traditionalAuthState.isAuthenticated;
        
        if (isAuthenticated) {
          return true;
        } else {
          // Redirect to sign-in page with return URL
          this.router.navigate(['/auth/signin'], { 
            queryParams: { returnUrl: url } 
          });
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private azureAuthService: AzureAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkRole(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkRole(childRoute);
  }

  private checkRole(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    const requiredAnyRole = route.data['anyRole'] as string[];

    return combineLatest([
      this.azureAuthService.authState$,
      this.authService.authState$
    ]).pipe(
      map(([azureAuthState, traditionalAuthState]) => {
        const isAuthenticated = azureAuthState.isAuthenticated || traditionalAuthState.isAuthenticated;
        
        if (!isAuthenticated) {
          this.router.navigate(['/auth/signin']);
          return false;
        }

        // Check roles from either authentication service
        const hasRoleInAzure = (role: string) => this.azureAuthService.hasRole(role);
        const hasRoleInTraditional = (role: string) => this.authService.hasRole(role);
        const hasAnyRoleInAzure = (roles: string[]) => this.azureAuthService.hasAnyRole(roles);
        const hasAnyRoleInTraditional = (roles: string[]) => this.authService.hasAnyRole(roles);

        // Check if user has all required roles
        if (requiredRoles?.length > 0) {
          const hasAllRoles = requiredRoles.every(role => 
            hasRoleInAzure(role) || hasRoleInTraditional(role)
          );
          if (!hasAllRoles) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        // Check if user has any of the required roles
        if (requiredAnyRole?.length > 0) {
          const hasAnyRole = hasAnyRoleInAzure(requiredAnyRole) || hasAnyRoleInTraditional(requiredAnyRole);
          if (!hasAnyRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(
    private azureAuthService: AzureAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return combineLatest([
      this.azureAuthService.authState$,
      this.authService.authState$
    ]).pipe(
      map(([azureAuthState, traditionalAuthState]) => {
        const isAuthenticated = azureAuthState.isAuthenticated || traditionalAuthState.isAuthenticated;
        
        if (isAuthenticated) {
          // User is already authenticated, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}
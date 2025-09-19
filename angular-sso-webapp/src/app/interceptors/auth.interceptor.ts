import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';

import { AzureAuthService } from '../services/azure-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private azureAuthService: AzureAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if the request needs authentication
    if (this.shouldAttachToken(req)) {
      return this.azureAuthService.getAccessToken().pipe(
        switchMap(token => {
          // Clone the request and attach the authorization header
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authReq);
        }),
        catchError(error => {
          // If token acquisition fails, proceed without token
          console.warn('Failed to acquire token, proceeding without authentication:', error);
          return next.handle(req);
        })
      );
    }

    return next.handle(req);
  }

  /**
   * Determine if the request should have an auth token attached
   */
  private shouldAttachToken(req: HttpRequest<any>): boolean {
    // Don't attach token to auth endpoints
    if (req.url.includes('/auth/') || req.url.includes('b2clogin.com')) {
      return false;
    }

    // Don't attach token to external domains (unless specifically configured)
    if (req.url.startsWith('http') && !this.isInternalApi(req.url)) {
      return false;
    }

    // Only attach to API calls that require authentication
    return this.isProtectedEndpoint(req.url);
  }

  /**
   * Check if URL is an internal API
   */
  private isInternalApi(url: string): boolean {
    const internalDomains = [
      'api.techcorp.com',
      'api.enterprise.goldmansachs.com',
      'api.stripe-innovations.com',
      'api.pixelstudios.com',
      'graph.microsoft.com'
    ];

    return internalDomains.some(domain => url.includes(domain));
  }

  /**
   * Check if endpoint requires authentication
   */
  private isProtectedEndpoint(url: string): boolean {
    const protectedPatterns = [
      '/api/',
      '/graph/',
      'graph.microsoft.com'
    ];

    return protectedPatterns.some(pattern => url.includes(pattern));
  }
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private azureAuthService: AzureAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - token might be expired
          console.log('Unauthorized request detected, attempting to refresh token');
          
          // For now, just log the error. In a real app, you might want to
          // attempt token refresh or redirect to login
          return throwError(() => error);
        }

        if (error.status === 403) {
          // Forbidden - user doesn't have permission
          console.log('Forbidden request - insufficient permissions');
        }

        if (error.status >= 500) {
          // Server error
          console.error('Server error occurred:', error);
        }

        return throwError(() => error);
      })
    );
  }
}
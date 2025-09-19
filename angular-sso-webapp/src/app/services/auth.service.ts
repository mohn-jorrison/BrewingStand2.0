import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, throwError } from 'rxjs';

export interface User {
  email: string;
  name: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  // Mock users for demo
  private mockUsers = [
    { email: 'admin@company.com', password: 'password123', name: 'Admin User', roles: ['admin', 'user'] },
    { email: 'user@company.com', password: 'password123', name: 'Regular User', roles: ['user'] },
    { email: 'demo@company.com', password: 'demo123', name: 'Demo User', roles: ['demo'] }
  ];

  constructor() {
    // Check for stored authentication on service initialization
    this.checkStoredAuth();
  }

  /**
   * Sign in with email and password
   */
  signIn(email: string, password: string): Observable<User> {
    this.setLoadingState(true);

    // Simulate API call with proper Observable
    return new Observable<User>(observer => {
      setTimeout(() => {
        const foundUser = this.mockUsers.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const user: User = {
            email: foundUser.email,
            name: foundUser.name,
            roles: foundUser.roles
          };
          
          this.setAuthenticatedUser(user);
          this.setLoadingState(false);
          observer.next(user);
          observer.complete();
        } else {
          this.setLoadingState(false);
          observer.error(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  /**
   * Sign out the current user
   */
  signOut(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  /**
   * Get current authentication state
   */
  getCurrentAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Set authenticated user
   */
  private setAuthenticatedUser(user: User): void {
    // Store in localStorage for persistence
    localStorage.setItem('auth_token', 'mock_token_' + Date.now());
    localStorage.setItem('user_data', JSON.stringify(user));

    this.authStateSubject.next({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  }

  /**
   * Set loading state
   */
  private setLoadingState(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }

  /**
   * Check for stored authentication on app startup
   */
  private checkStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        this.authStateSubject.next({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }

  /**
   * Password reset (mock implementation)
   */
  resetPassword(email: string): Observable<boolean> {
    return of(true).pipe(delay(1000));
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
}

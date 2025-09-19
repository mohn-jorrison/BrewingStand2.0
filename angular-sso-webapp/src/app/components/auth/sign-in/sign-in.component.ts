import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AuthService, AuthState, User } from '../../../services/auth.service';
import { AzureAuthService } from '../../../services/azure-auth.service';
import { TenantConfigService } from '../../../services/tenant-config.service';
import { TenantConfiguration } from '../../../models/tenant-config.model';

import { ConfigurableCardComponent } from '../../ui/configurable-card/configurable-card.component';
import { ConfigurableInputComponent } from '../../ui/configurable-input/configurable-input.component';
import { ConfigurableButtonComponent } from '../../ui/configurable-button/configurable-button.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfigurableCardComponent,
    ConfigurableInputComponent,
    ConfigurableButtonComponent
  ],
  template: `
    <div [class]="getContainerClasses()" [style]="getContainerStyles()">
      <div class="auth-wrapper">
        <app-configurable-card 
          [hasHeader]="true" 
          [elevated]="true"
          customClasses="auth-card">
          
          <div slot="header" class="auth-header">
            <div *ngIf="tenantConfig?.logo" class="logo-container">
              <img 
                [src]="tenantConfig?.logo?.url || ''" 
                [alt]="tenantConfig?.logo?.alt || 'Logo'"
                [style.width]="tenantConfig?.logo?.width || 'auto'"
                [style.height]="tenantConfig?.logo?.height || 'auto'"
                class="logo"
              />
            </div>
            <div class="auth-title">
              <h1>{{ tenantConfig?.authentication?.title || 'Welcome Back' }}</h1>
              <p>{{ tenantConfig?.authentication?.subtitle || 'Sign in to access your applications' }}</p>
            </div>
          </div>

          <form [formGroup]="signInForm" (ngSubmit)="onSubmit()" class="auth-form">
            <!-- Azure AD B2C Sign-in Button -->
            <div class="azure-signin-section">
              <app-configurable-button 
                type="button"
                (click)="signInWithAzureB2C()"
                [disabled]="isLoading"
                customClasses="w-full azure-signin-btn">
                <span *ngIf="!isLoading" class="azure-signin-content">
                  <svg class="microsoft-icon" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Continue with Microsoft
                </span>
                <span *ngIf="isLoading" class="loading-content">
                  <svg class="loading-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
                    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              </app-configurable-button>
            </div>

            <!-- Divider -->
            <div class="divider-section">
              <div class="divider-line"></div>
              <span class="divider-text">or sign in with email</span>
              <div class="divider-line"></div>
            </div>

            <!-- Traditional Email/Password Form (kept for fallback) -->
            <div class="traditional-signin-section">
              <div class="form-group">
              <app-configurable-input
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                [required]="true"
                [prefixIcon]="true"
                [errorMessage]="getFieldError('email')"
                formControlName="email">
                <svg slot="prefix-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </app-configurable-input>
            </div>

            <div class="form-group">
              <app-configurable-input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                label="Password"
                placeholder="Enter your password"
                [required]="true"
                [prefixIcon]="true"
                [suffixIcon]="true"
                [errorMessage]="getFieldError('password')"
                formControlName="password">
                <svg slot="prefix-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <button 
                  slot="suffix-icon" 
                  type="button" 
                  (click)="togglePasswordVisibility()"
                  class="password-toggle">
                  <svg *ngIf="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                </button>
              </app-configurable-input>
            </div>

            <div *ngIf="tenantConfig?.authentication?.showRememberMe" class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="rememberMe" class="checkbox">
                <span>Remember me</span>
              </label>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <app-configurable-button 
                type="submit" 
                [disabled]="!signInForm.valid || isLoading"
                customClasses="w-full">
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading" class="loading-content">
                  <svg class="loading-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
                    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              </app-configurable-button>
            </div>

            <div *ngIf="tenantConfig?.authentication?.showForgotPassword" class="forgot-password">
              <button type="button" class="forgot-link" (click)="onForgotPassword()">
                Forgot your password?
              </button>
            </div>
            </div> <!-- Close traditional-signin-section -->
          </form>

          <div class="demo-credentials">
            <p class="demo-text">Azure AD B2C Integration:</p>
            <code>Click "Continue with Microsoft" to use Azure AD B2C authentication</code>
            <p class="demo-text-small">Fallback demo credentials for testing:</p>
            <code>admin@company.com / password123</code>
          </div>
        </app-configurable-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      position: relative;
      background: var(--primary-bg);
    }

    .auth-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 20%, rgba(var(--primary-main-rgb), 0.3) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(var(--accent-main-rgb), 0.2) 0%, transparent 40%),
        radial-gradient(circle at 40% 60%, rgba(var(--primary-bg-rgb), 0.1) 0%, transparent 40%),
        linear-gradient(135deg, var(--primary-bg) 0%, var(--accent-bg) 100%);
      z-index: -1;
    }

    .auth-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .auth-card {
      width: 100%;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 0;
    }

    .logo-container {
      margin-bottom: 1.5rem;
    }

    .logo {
      max-width: 100%;
      height: auto;
    }

    .auth-title h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .auth-title p {
      margin: 0;
      color: rgb(var(--secondary-600));
      font-size: 0.875rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .azure-signin-section {
      margin-bottom: 0.5rem;
    }

    .azure-signin-btn {
      background: #0078d4 !important;
      border: 1px solid #0078d4 !important;
      color: white !important;
    }

    .azure-signin-btn:hover {
      background: #106ebe !important;
      border-color: #106ebe !important;
    }

    .azure-signin-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .microsoft-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .divider-section {
      display: flex;
      align-items: center;
      margin: 1rem 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background-color: rgb(var(--secondary-300));
    }

    .divider-text {
      padding: 0 1rem;
      font-size: 0.875rem;
      color: rgb(var(--secondary-500));
      background: white;
    }

    .traditional-signin-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: rgb(var(--secondary-700));
      cursor: pointer;
    }

    .checkbox {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      border: 1px solid rgb(var(--secondary-300));
    }

    .checkbox:checked {
      background-color: rgb(var(--primary-600));
      border-color: rgb(var(--primary-600));
    }

    .password-toggle {
      background: none;
      border: none;
      cursor: pointer;
      color: rgb(var(--secondary-400));
      transition: color 0.2s ease;
    }

    .password-toggle:hover {
      color: rgb(var(--secondary-600));
    }

    .error-message {
      padding: 0.75rem;
      background-color: rgb(254, 226, 226);
      color: rgb(185, 28, 28);
      border-radius: var(--border-radius);
      font-size: 0.875rem;
      border: 1px solid rgb(252, 165, 165);
    }

    .form-actions {
      margin-top: 0.5rem;
    }

    .loading-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .forgot-password {
      text-align: center;
      margin-top: 1rem;
    }

    .forgot-link {
      background: none;
      border: none;
      color: rgb(var(--primary-600));
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.875rem;
      transition: color 0.2s ease;
    }

    .forgot-link:hover {
      color: rgb(var(--primary-700));
    }

    .demo-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background-color: rgb(var(--secondary-50));
      border-radius: var(--border-radius);
      text-align: center;
    }

    .demo-text {
      margin: 0 0 0.5rem 0;
      font-size: 0.75rem;
      color: rgb(var(--secondary-600));
    }

    .demo-text-small {
      margin: 0.75rem 0 0.25rem 0;
      font-size: 0.7rem;
      color: rgb(var(--secondary-500));
    }

    code {
      font-size: 0.75rem;
      color: rgb(var(--secondary-700));
      background-color: rgb(var(--secondary-100));
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
    }
  `]
})
export class SignInComponent implements OnInit, OnDestroy {
  signInForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  tenantConfig: TenantConfiguration | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private azureAuthService: AzureAuthService,
    private tenantConfigService: TenantConfigService,
    private router: Router
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Subscribe to tenant configuration
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config: TenantConfiguration | null) => {
        this.tenantConfig = config;
      });

    // Subscribe to Azure authentication state (for Azure AD B2C flows)
    this.azureAuthService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState) => {
        // Only update loading state if it's from Azure auth
        if (authState.error) {
          this.errorMessage = authState.error;
        }
        
        // Redirect if already authenticated
        if (authState.isAuthenticated) {
          this.router.navigate(['/dashboard']);
        }
      });

    // Subscribe to traditional auth state (for email/password flows)
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState: AuthState) => {
        console.log('Traditional auth state changed:', authState); // Debug log
        // Redirect if already authenticated via traditional auth
        if (authState.isAuthenticated) {
          console.log('Traditional auth successful, navigating to dashboard'); // Debug log
          this.router.navigate(['/dashboard']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      console.log('Attempting traditional sign-in with:', email); // Debug log
      this.errorMessage = '';
      this.isLoading = true; // Set loading state manually for traditional auth

      this.authService.signIn(email, password).subscribe({
        next: (user: User) => {
          console.log('Traditional sign-in successful:', user); // Debug log
          this.isLoading = false;
          // Navigation is handled by the authState subscription
        },
        error: (error: any) => {
          console.error('Traditional sign-in error:', error); // Debug log
          this.isLoading = false;
          this.errorMessage = error.message || 'Sign in failed. Please try again.';
        }
      });
    } else {
      console.log('Form is invalid:', this.signInForm.errors); // Debug log
      // Mark all fields as touched to show validation errors
      Object.keys(this.signInForm.controls).forEach(key => {
        this.signInForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Sign in with Azure AD B2C
   */
  signInWithAzureB2C(): void {
    this.errorMessage = '';
    this.isLoading = true; // Set loading state for Azure auth

    this.azureAuthService.signInRedirect().subscribe({
      next: () => {
        // Redirect is handled by MSAL, loading state will be managed by Azure auth service
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Azure sign-in failed. Please try again.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(): void {
    // Use Azure AD B2C password reset flow
    this.isLoading = true;
    this.azureAuthService.resetPassword().subscribe({
      next: () => {
        // Redirect is handled by MSAL
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Password reset failed. Please try again.';
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  getContainerClasses(): string {
    return 'auth-container';
  }

  getContainerStyles(): string {
    if (this.tenantConfig?.authentication?.backgroundImage) {
      return `background-image: url(${this.tenantConfig.authentication.backgroundImage})`;
    }
    return '';
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AzureAuthService } from '../../../services/azure-auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <div class="loading-indicator">
          <svg class="loading-spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
            <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2>Completing sign-in...</h2>
        <p>Please wait while we process your authentication.</p>
        
        <div *ngIf="error" class="error-message">
          <h3>Authentication Error</h3>
          <p>{{ error }}</p>
          <button class="retry-button" (click)="goToSignIn()">
            Return to Sign In
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, var(--primary-bg) 0%, var(--accent-bg) 100%);
    }

    .callback-content {
      text-align: center;
      max-width: 400px;
      background: white;
      padding: 3rem 2rem;
      border-radius: var(--border-radius);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .loading-indicator {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
    }

    .loading-spinner {
      width: 3rem;
      height: 3rem;
      color: rgb(var(--primary-600));
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

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    p {
      margin: 0 0 2rem 0;
      color: rgb(var(--secondary-600));
      line-height: 1.5;
    }

    .error-message {
      background-color: rgb(254, 226, 226);
      border: 1px solid rgb(252, 165, 165);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-top: 2rem;
    }

    .error-message h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      color: rgb(185, 28, 28);
    }

    .error-message p {
      margin: 0 0 1.5rem 0;
      color: rgb(153, 27, 27);
    }

    .retry-button {
      background-color: rgb(var(--primary-600));
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius);
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .retry-button:hover {
      background-color: rgb(var(--primary-700));
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  error: string | null = null;

  constructor(
    private azureAuthService: AzureAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for authentication state
    this.azureAuthService.authState$.subscribe(authState => {
      if (authState.isAuthenticated) {
        // Get return URL from query params or default to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      } else if (authState.error) {
        this.error = authState.error;
      }
    });

    // If there's an error in the URL (from Azure AD B2C), display it
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.error = params['error_description'] || params['error'] || 'Authentication failed';
      }
    });

    // Set a timeout to redirect to sign-in if authentication doesn't complete
    setTimeout(() => {
      if (!this.azureAuthService.isAuthenticated() && !this.error) {
        this.error = 'Authentication timed out. Please try again.';
      }
    }, 10000); // 10 second timeout
  }

  goToSignIn(): void {
    this.router.navigate(['/auth/signin']);
  }
}
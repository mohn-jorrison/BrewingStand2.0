import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AuthService, AuthState, User } from '../../services/auth.service';
import { TenantConfigService } from '../../services/tenant-config.service';
import { TenantConfiguration, Product } from '../../models/tenant-config.model';

import { ConfigurableCardComponent } from '../ui/configurable-card/configurable-card.component';
import { ConfigurableButtonComponent } from '../ui/configurable-button/configurable-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ConfigurableCardComponent,
    ConfigurableButtonComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header [class]="getHeaderClasses()">
        <div class="header-content">
          <div class="header-left">
            <div *ngIf="tenantConfig?.logo" class="logo-container">
              <img 
                [src]="tenantConfig?.logo?.url || ''" 
                [alt]="tenantConfig?.logo?.alt || 'Logo'"
                [style.width]="tenantConfig?.logo?.width || 'auto'"
                [style.height]="tenantConfig?.logo?.height || 'auto'"
                class="logo"
              />
            </div>
            <div class="header-info">
              <h1>{{ tenantConfig?.name || 'Enterprise Portal' }}</h1>
              <p *ngIf="currentUser">Welcome, {{ currentUser.email }}</p>
            </div>
          </div>
          <div class="header-right">
            <!-- User Menu -->
            <div class="user-menu">
              <div class="user-info">
                <div class="user-avatar">
                  {{ getCurrentUserInitials() }}
                </div>
                <div class="user-details">
                  <span class="user-name">{{ currentUser?.name || currentUser?.email }}</span>
                  <span class="user-role">{{ getCurrentUserRole() }}</span>
                </div>
              </div>
              <div class="user-actions">
                <app-configurable-button 
                  variant="outline" 
                  size="small"
                  (click)="showLogoutConfirm()">
                  <span class="logout-icon">🚪</span>
                  Sign Out
                </app-configurable-button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main [class]="getMainClasses()">
        <div class="dashboard-content">
          <!-- Welcome Section -->
          <div class="welcome-section">
            <h2>{{ tenantConfig?.dashboard?.welcomeMessage || 'Your Applications' }}</h2>
            <p>Access the tools and services available to your account</p>
          </div>

          <!-- Stats Section (if enabled) -->
          <div *ngIf="tenantConfig?.dashboard?.showStats" class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ getAccessibleProductsCount() }}</div>
                <div class="stat-label">Available Apps</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ getRestrictedProductsCount() }}</div>
                <div class="stat-label">Restricted Apps</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ currentUser?.roles?.length || 0 }}</div>
                <div class="stat-label">User Roles</div>
              </div>
            </div>
          </div>

          <!-- Accessible Products -->
          <div class="products-section">
            <div class="section-header">
              <h3>Available Applications</h3>
              <div class="badge">{{ getAccessibleProducts().length }} accessible</div>
            </div>
            <div [class]="getProductGridClasses()">
              <app-configurable-card 
                *ngFor="let product of getAccessibleProducts()"
                [hoverable]="true"
                [clickable]="true"
                [hasHeader]="true"
                [hasFooter]="true"
                customClasses="product-card accessible"
                (click)="onProductClick(product)">
                
                <div slot="header" class="product-header">
                  <div class="product-icon accessible">
                    <ng-container [ngSwitch]="product.iconName">
                      <svg *ngSwitchCase="'shield'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                      <svg *ngSwitchCase="'chart'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      <svg *ngSwitchCase="'users'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                      <svg *ngSwitchCase="'database'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                      </svg>
                      <svg *ngSwitchCase="'document'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <svg *ngSwitchCase="'settings'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <svg *ngSwitchDefault class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                    </ng-container>
                  </div>
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <div class="status-badge accessible">
                      <svg class="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Accessible
                    </div>
                    <div *ngIf="tenantConfig?.dashboard?.productGrid?.showCategories" class="category-badge">
                      {{ product.category }}
                    </div>
                  </div>
                  <div class="product-action">
                    <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </div>
                </div>

                <div class="product-description">
                  {{ product.description }}
                </div>

                <div slot="footer">
                  <app-configurable-button 
                    customClasses="w-full"
                    (click)="onProductClick(product)">
                    Open Application
                  </app-configurable-button>
                </div>
              </app-configurable-card>
            </div>
          </div>

          <!-- Restricted Products -->
          <div *ngIf="getRestrictedProducts().length > 0" class="products-section">
            <div class="section-header">
              <h3>Restricted Applications</h3>
              <div class="badge restricted">{{ getRestrictedProducts().length }} restricted</div>
            </div>
            <div [class]="getProductGridClasses()">
              <app-configurable-card 
                *ngFor="let product of getRestrictedProducts()"
                [hasHeader]="true"
                [hasFooter]="true"
                customClasses="product-card restricted">
                
                <div slot="header" class="product-header">
                  <div class="product-icon restricted">
                    <ng-container [ngSwitch]="product.iconName">
                      <!-- Same icon switch as above -->
                    </ng-container>
                  </div>
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <div class="status-badge restricted">
                      <svg class="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Restricted
                    </div>
                    <div *ngIf="tenantConfig?.dashboard?.productGrid?.showCategories" class="category-badge">
                      {{ product.category }}
                    </div>
                  </div>
                </div>

                <div class="product-description">
                  {{ product.description }}
                </div>

                <div slot="footer">
                  <app-configurable-button 
                    variant="secondary"
                    [disabled]="true"
                    customClasses="w-full">
                    Access Restricted
                  </app-configurable-button>
                </div>
              </app-configurable-card>
            </div>
          </div>
        </div>
      </main>

      <!-- Logout Confirmation Modal -->
      <div *ngIf="showLogoutModal" class="modal-overlay" (click)="hideLogoutConfirm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirm Logout</h3>
            <button class="modal-close" (click)="hideLogoutConfirm()">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to sign out of your account?</p>
            <p class="modal-subtitle">You will be redirected to the login page.</p>
          </div>
          <div class="modal-footer">
            <app-configurable-button 
              variant="secondary" 
              size="medium"
              (click)="hideLogoutConfirm()">
              Cancel
            </app-configurable-button>
            <app-configurable-button 
              variant="primary" 
              size="medium"
              (click)="confirmSignOut()">
              Sign Out
            </app-configurable-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      position: relative;
    }

    .dashboard-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--primary-bg);
      background-image: 
        radial-gradient(at 25% 25%, rgba(var(--primary-bg-rgb), 0.4) 0px, transparent 25%),
        radial-gradient(at 75% 75%, rgba(var(--accent-bg-rgb), 0.3) 0px, transparent 25%),
        radial-gradient(at 75% 25%, var(--secondary-bg) 0px, transparent 25%);
      opacity: 0.9;
      z-index: -1;
    }

    .header {
      background: linear-gradient(135deg, 
        rgba(var(--primary-main-rgb), 0.1) 0%, 
        rgba(255, 255, 255, 0.95) 25%, 
        rgba(var(--accent-main-rgb), 0.05) 100%);
      backdrop-filter: blur(15px);
      border-bottom: 1px solid rgba(var(--primary-main-rgb), 0.3);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(var(--primary-main-rgb), 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    /* User Menu Styles */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border-radius: var(--border-radius);
      background: rgba(var(--primary-50), 0.5);
      border: 1px solid rgba(var(--primary-200), 0.3);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgb(var(--primary-500)) 0%, rgb(var(--primary-600)) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 0 2px 8px rgba(var(--primary-500), 0.3);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .user-name {
      font-weight: 600;
      color: rgb(var(--secondary-900));
      font-size: 0.875rem;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgb(var(--secondary-600));
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .user-actions {
      display: flex;
      align-items: center;
    }

    .logout-icon {
      margin-right: 0.5rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: rgb(var(--secondary-400));
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      color: rgb(var(--secondary-600));
      background: rgb(var(--secondary-100));
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body p {
      margin: 0 0 0.75rem 0;
      color: rgb(var(--secondary-700));
      line-height: 1.5;
    }

    .modal-body p:last-child {
      margin-bottom: 0;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      color: rgb(var(--secondary-600)) !important;
    }

    .modal-footer {
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .logo {
      max-width: 100%;
      height: auto;
    }

    .header-info h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .header-info p {
      margin: 0;
      font-size: 0.875rem;
      color: rgb(var(--secondary-600));
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: calc(var(--border-radius) * 2);
      padding: 2rem;
      border: 1px solid rgba(var(--primary-200), 0.2);
      box-shadow: 0 10px 30px rgba(var(--primary-500), 0.1);
    }

    .welcome-section h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: rgb(var(--secondary-900));
    }

    .welcome-section p {
      margin: 0;
      color: rgb(var(--secondary-600));
      font-size: 1.125rem;
    }

    .stats-section {
      margin: 1rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: rgb(var(--primary-600));
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgb(var(--secondary-600));
    }

    .products-section {
      margin: 2rem 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: rgb(var(--secondary-100));
      color: rgb(var(--secondary-700));
    }

    .badge.restricted {
      background-color: rgb(254, 226, 226);
      color: rgb(185, 28, 28);
    }

    .product-grid {
      display: grid;
      gap: 1.5rem;
    }

    .product-grid.grid-1 {
      grid-template-columns: 1fr;
    }

    .product-grid.grid-2 {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .product-grid.grid-3 {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .product-grid.grid-4 {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    /* Cards Layout - Creative Agency Style */
    .product-grid.cards-layout {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .product-grid.cards-layout .product-card {
      background: linear-gradient(145deg, #ffffff 0%, rgba(var(--primary-bg-rgb), 0.1) 100%);
      border-radius: 2rem;
      padding: 2rem;
      border: 2px solid rgba(var(--primary-main-rgb), 0.1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 32px rgba(var(--primary-main-rgb), 0.1);
      transform-origin: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-grid.cards-layout .product-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, rgba(var(--primary-main-rgb), 1), rgba(var(--accent-main-rgb), 1), rgba(var(--primary-main-rgb), 1));
    }

    .product-grid.cards-layout .product-card:hover {
      transform: translateY(-8px) rotate(2deg) scale(1.02);
      box-shadow: 0 32px 64px rgba(var(--primary-main-rgb), 0.2);
      border-color: rgba(var(--primary-main-rgb), 0.3);
    }

    .product-grid.cards-layout .product-card:nth-child(even):hover {
      transform: translateY(-8px) rotate(-2deg) scale(1.02);
    }

    @media (min-width: 768px) {
      .product-grid.cards-layout {
        max-width: 1200px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
      }
    }

    .product-card {
      transition: all 0.2s ease-in-out;
    }

    .product-card.accessible:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(var(--primary-500), 0.15);
    }

    .product-card.restricted {
      opacity: 0.6;
    }

    .product-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .product-icon {
      width: 3rem;
      height: 3rem;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .product-icon.accessible {
      background-color: rgb(var(--primary-100));
      color: rgb(var(--primary-600));
    }

    .product-icon.restricted {
      background-color: rgb(var(--secondary-100));
      color: rgb(var(--secondary-500));
    }

    .icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .product-info {
      flex: 1;
    }

    .product-info h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .status-badge.accessible {
      background-color: rgb(220, 252, 231);
      color: rgb(22, 163, 74);
    }

    .status-badge.restricted {
      background-color: rgb(254, 226, 226);
      color: rgb(185, 28, 28);
    }

    .status-icon {
      width: 0.875rem;
      height: 0.875rem;
    }

    .category-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      background-color: rgb(var(--secondary-100));
      color: rgb(var(--secondary-600));
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }

    .product-action {
      flex-shrink: 0;
    }

    .action-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: rgb(var(--secondary-400));
    }

    .product-description {
      color: rgb(var(--secondary-600));
      line-height: 1.5;
      margin: 1rem 0;
    }

    .w-full {
      width: 100%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .main-content {
        padding: 1rem;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .product-header {
        flex-direction: column;
        text-align: center;
      }

      .product-info {
        text-align: left;
      }

      /* Mobile user menu */
      .user-menu {
        padding: 0.25rem;
        gap: 0.5rem;
      }

      .user-details {
        display: none;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  tenantConfig: TenantConfiguration | null = null;
  products: Product[] = [];
  showLogoutModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private tenantConfigService: TenantConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState: AuthState) => {
        if (!authState.isAuthenticated) {
          this.router.navigate(['/']);
        } else {
          this.currentUser = authState.user;
        }
      });

    // Subscribe to tenant configuration
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config: TenantConfiguration | null) => {
        this.tenantConfig = config;
      });

    // Load mock products
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSignOut(): void {
    this.authService.signOut();
  }

  showLogoutConfirm(): void {
    this.showLogoutModal = true;
  }

  hideLogoutConfirm(): void {
    this.showLogoutModal = false;
  }

  confirmSignOut(): void {
    this.showLogoutModal = false;
    console.log('User signed out at:', new Date().toLocaleString());
    this.authService.signOut();
    // The auth service will handle the redirect to login
  }

  getCurrentUserInitials(): string {
    if (!this.currentUser) return 'U';
    
    const name = this.currentUser.name || this.currentUser.email;
    const parts = name.split(' ');
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  }

  getCurrentUserRole(): string {
    if (!this.currentUser?.roles || this.currentUser.roles.length === 0) {
      return 'User';
    }
    
    // Return the first role, capitalized
    return this.currentUser.roles[0].charAt(0).toUpperCase() + 
           this.currentUser.roles[0].slice(1);
  }

  onProductClick(product: Product): void {
    if (product.hasAccess) {
      console.log(`Opening ${product.name} at ${product.url}`);
      // In a real app, this would navigate to the product or open in a new tab
      alert(`Opening ${product.name}. In a real app, this would navigate to ${product.url}`);
    }
  }

  getAccessibleProducts(): Product[] {
    return this.products.filter(p => p.hasAccess);
  }

  getRestrictedProducts(): Product[] {
    return this.products.filter(p => !p.hasAccess);
  }

  getAccessibleProductsCount(): number {
    return this.getAccessibleProducts().length;
  }

  getRestrictedProductsCount(): number {
    return this.getRestrictedProducts().length;
  }

  getHeaderClasses(): string {
    const classes = ['header'];
    if (this.tenantConfig?.layout.header.sticky) {
      classes.push('sticky');
    }
    return classes.join(' ');
  }

  getMainClasses(): string {
    return 'main-content';
  }

  getProductGridClasses(): string {
    const classes = ['product-grid'];
    const layout = this.tenantConfig?.dashboard?.productGrid?.layout || 'grid';
    const itemsPerRow = this.tenantConfig?.dashboard?.productGrid?.itemsPerRow || 3;
    
    // Handle different layout types
    if (layout === 'cards') {
      classes.push('cards-layout');
      classes.push(`cards-${itemsPerRow}`);
    } else if (layout === 'list') {
      classes.push('list-layout');
    } else {
      classes.push(`grid-${itemsPerRow}`);
    }
    
    return classes.join(' ');
  }

  private loadProducts(): void {
    // Mock products data
    this.products = [
      {
        id: '1',
        name: 'Security Dashboard',
        description: 'Monitor and manage security across all your applications',
        iconName: 'shield',
        hasAccess: true,
        category: 'Security',
        url: '/security'
      },
      {
        id: '2',
        name: 'Analytics Platform',
        description: 'Comprehensive analytics and reporting tools',
        iconName: 'chart',
        hasAccess: true,
        category: 'Analytics',
        url: '/analytics'
      },
      {
        id: '3',
        name: 'User Management',
        description: 'Manage users, roles, and permissions across your organization',
        iconName: 'users',
        hasAccess: true,
        category: 'Management',
        url: '/users'
      },
      {
        id: '4',
        name: 'Data Warehouse',
        description: 'Centralized data storage and processing platform',
        iconName: 'database',
        hasAccess: false,
        category: 'Data',
        url: '/warehouse'
      },
      {
        id: '5',
        name: 'Documentation Hub',
        description: 'Access all technical documentation and guides',
        iconName: 'document',
        hasAccess: true,
        category: 'Resources',
        url: '/docs'
      },
      {
        id: '6',
        name: 'System Settings',
        description: 'Configure system-wide settings and preferences',
        iconName: 'settings',
        hasAccess: false,
        category: 'Administration',
        url: '/settings'
      }
    ];
  }
}

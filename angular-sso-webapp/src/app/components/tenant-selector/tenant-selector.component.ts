import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { TenantConfigService } from '../../services/tenant-config.service';
import { TenantConfiguration } from '../../models/tenant-config.model';

@Component({
  selector: 'app-tenant-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tenant-selector">
      <div class="selector-header">
        <h3>Choose Your Tenant Experience</h3>
        <p>Select a tenant configuration to see how the application adapts its theme and layout</p>
      </div>
      
      <div class="tenant-options">
        <div 
          *ngFor="let tenant of tenantOptions"
          class="tenant-option"
          [class.active]="currentTenantId === tenant.id"
          (click)="selectTenant(tenant.id)">
          
          <div class="tenant-preview" [style.background]="getTenantPreviewColor(tenant.id)">
            <div class="preview-elements">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-card"></div>
                <div class="preview-card"></div>
              </div>
            </div>
          </div>
          
          <div class="tenant-info">
            <h4>{{ tenant.name }}</h4>
            <p>{{ tenant.description }}</p>
            <div class="tenant-features">
              <span *ngFor="let feature of tenant.features" class="feature-tag">
                {{ feature }}
              </span>
            </div>
          </div>
          
          <div class="selection-indicator">
            <svg *ngIf="currentTenantId === tenant.id" class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="demo-note">
        <p>💡 This tenant selector is for demonstration purposes. In a real application, tenant configuration would be determined automatically based on domain, user organization, or other criteria.</p>
      </div>
    </div>
  `,
  styles: [`
    .tenant-selector {
      position: fixed;
      top: 1rem;
      right: 1rem;
      width: 300px;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid rgb(var(--secondary-200));
      z-index: 10000;
      max-height: 80vh;
      overflow-y: auto;
    }

    .selector-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid rgb(var(--secondary-100));
    }

    .selector-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .selector-header p {
      margin: 0;
      font-size: 0.875rem;
      color: rgb(var(--secondary-600));
      line-height: 1.4;
    }

    .tenant-options {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tenant-option {
      border: 2px solid rgb(var(--secondary-200));
      border-radius: var(--border-radius);
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .tenant-option:hover {
      border-color: rgb(var(--primary-300));
      box-shadow: 0 2px 8px rgba(var(--primary-500), 0.1);
    }

    .tenant-option.active {
      border-color: rgb(var(--primary-500));
      background-color: rgb(var(--primary-50));
    }

    .tenant-preview {
      width: 100%;
      height: 60px;
      border-radius: 0.375rem;
      margin-bottom: 0.75rem;
      position: relative;
      overflow: hidden;
    }

    .preview-elements {
      position: absolute;
      inset: 0;
      padding: 0.5rem;
    }

    .preview-header {
      height: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      margin-bottom: 0.5rem;
    }

    .preview-content {
      display: flex;
      gap: 0.25rem;
    }

    .preview-card {
      flex: 1;
      height: 20px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 2px;
    }

    .tenant-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: rgb(var(--secondary-900));
    }

    .tenant-info p {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: rgb(var(--secondary-600));
      line-height: 1.3;
    }

    .tenant-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .feature-tag {
      padding: 0.125rem 0.375rem;
      background-color: rgb(var(--secondary-100));
      color: rgb(var(--secondary-700));
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .selection-indicator {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background-color: rgb(var(--primary-500));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .tenant-option.active .selection-indicator {
      opacity: 1;
    }

    .check-icon {
      width: 1rem;
      height: 1rem;
    }

    .demo-note {
      padding: 1rem 1.5rem;
      background-color: rgb(var(--primary-50));
      border-top: 1px solid rgb(var(--primary-200));
      border-radius: 0 0 var(--border-radius) var(--border-radius);
    }

    .demo-note p {
      margin: 0;
      font-size: 0.75rem;
      color: rgb(var(--primary-700));
      line-height: 1.4;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .tenant-selector {
        position: relative;
        top: auto;
        right: auto;
        width: 100%;
        margin: 1rem;
        max-height: none;
      }
    }
  `]
})
export class TenantSelectorComponent implements OnInit, OnDestroy {
  currentTenantId = 'default';
  
  tenantOptions = [
    {
      id: 'default',
      name: 'Default Theme',
      description: 'Classic blue theme with standard layout and components',
      features: ['Standard Layout', 'Blue Theme', 'Default Components']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Professional theme with sidebar navigation and enterprise features',
      features: ['Sidebar Layout', 'Navy/Gold Theme', 'Enterprise Features']
    },
    {
      id: 'startup',
      name: 'Startup Hub',
      description: 'Modern purple theme with rounded components for innovative teams',
      features: ['Rounded Design', 'Purple Theme', 'Vibrant Animations']
    },
    {
      id: 'creative',
      name: 'Creative Agency',
      description: 'Card-based mobile-first design with creative animations and layouts',
      features: ['Cards Layout', 'Orange/Green Theme', 'Creative Animations']
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(private tenantConfigService: TenantConfigService) {}

  ngOnInit(): void {
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tenant: TenantConfiguration | null) => {
        this.currentTenantId = tenant?.tenantId || 'default';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTenant(tenantId: string): void {
    this.tenantConfigService.setTenant(tenantId).subscribe();
  }

  getTenantPreviewColor(tenantId: string): string {
    switch (tenantId) {
      case 'enterprise':
        return 'linear-gradient(135deg, #6175be, #eab308)';
      case 'startup':
        return 'linear-gradient(135deg, #d946ef, #c026d3)';
      case 'creative':
        return 'linear-gradient(135deg, #f97316, #22c55e, #f59e0b)';
      default:
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }
  }
}

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TenantConfigService } from '../../../services/tenant-config.service';
import { ComponentConfig, TenantConfiguration } from '../../../models/tenant-config.model';

@Component({
  selector: 'app-configurable-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <div *ngIf="hasHeader" [class]="getHeaderClasses()">
        <ng-content select="[slot=header]"></ng-content>
      </div>
      <div [class]="getContentClasses()">
        <ng-content></ng-content>
      </div>
      <div *ngIf="hasFooter" [class]="getFooterClasses()">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: linear-gradient(145deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(var(--primary-bg-rgb), 0.3) 50%, 
        rgba(255, 255, 255, 0.9) 100%);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease-in-out;
      border: 1px solid rgba(var(--primary-main-rgb), 0.2);
      box-shadow: 0 4px 20px rgba(var(--primary-main-rgb), 0.08);
    }

    .card-hoverable:hover {
      box-shadow: 0 8px 30px rgba(var(--primary-main-rgb), 0.15);
      transform: translateY(-2px);
      border-color: rgba(var(--primary-main-rgb), 0.3);
    }

    .card-clickable {
      cursor: pointer;
    }

    .card-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      border-bottom: 1px solid rgb(var(--secondary-100));
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
    }

    .card-content {
      padding: 1.5rem;
    }

    .card-content-with-header {
      padding-top: 0;
    }

    .card-content-with-footer {
      padding-bottom: 0;
    }

    .card-footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid rgb(var(--secondary-100));
      margin-top: 1.5rem;
      padding-top: 1rem;
    }

    /* Size variants */
    .card-small {
      max-width: 16rem;
    }

    .card-small .card-header,
    .card-small .card-content,
    .card-small .card-footer {
      padding: 1rem;
    }

    .card-small .card-content-with-header {
      padding-top: 0;
    }

    .card-small .card-content-with-footer {
      padding-bottom: 0;
    }

    .card-small .card-header {
      padding-bottom: 0.75rem;
      margin-bottom: 1rem;
    }

    .card-small .card-footer {
      padding-top: 0.75rem;
      margin-top: 1rem;
    }

    .card-medium {
      max-width: 24rem;
    }

    .card-large {
      max-width: 32rem;
    }

    .card-large .card-header,
    .card-large .card-content,
    .card-large .card-footer {
      padding: 2rem;
    }

    .card-large .card-content-with-header {
      padding-top: 0;
    }

    .card-large .card-content-with-footer {
      padding-bottom: 0;
    }

    .card-large .card-header {
      padding-bottom: 1.25rem;
      margin-bottom: 2rem;
    }

    .card-large .card-footer {
      padding-top: 1.25rem;
      margin-top: 2rem;
    }

    /* Variant styles */
    .card-minimal {
      border: none;
      box-shadow: none;
      background-color: transparent;
    }

    .card-bold {
      border: 2px solid rgb(var(--primary-200));
      box-shadow: 0 4px 6px -1px rgba(var(--primary-500), 0.1);
    }

    .card-bold:hover {
      border-color: rgb(var(--primary-300));
      box-shadow: 0 10px 15px -3px rgba(var(--primary-500), 0.2);
    }

    /* Border radius variants */
    .card-rounded {
      border-radius: 1rem;
    }

    .card-sharp {
      border-radius: 0;
    }

    .card-default-radius {
      border-radius: var(--border-radius);
    }

    /* Elevation variants */
    .card-elevated {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .card-elevated:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class ConfigurableCardComponent implements OnInit, OnDestroy {
  @Input() hoverable = false;
  @Input() clickable = false;
  @Input() elevated = false;
  @Input() hasHeader = false;
  @Input() hasFooter = false;
  @Input() customClasses = '';

  private destroy$ = new Subject<void>();
  private config: ComponentConfig | null = null;

  constructor(private tenantConfigService: TenantConfigService) {}

  ngOnInit(): void {
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tenant: TenantConfiguration | null) => {
        this.config = tenant?.components.card || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCardClasses(): string {
    const classes: string[] = ['card'];

    // Size classes
    const size = this.config?.size || 'medium';
    classes.push(`card-${size}`);

    // Variant classes
    if (this.config?.variant) {
      classes.push(`card-${this.config.variant}`);
    }

    // Border radius based on variant
    if (this.config?.variant === 'rounded') {
      classes.push('card-rounded');
    } else if (this.config?.variant === 'sharp') {
      classes.push('card-sharp');
    } else {
      classes.push('card-default-radius');
    }

    // Interactive classes
    if (this.hoverable) {
      classes.push('card-hoverable');
    }
    if (this.clickable) {
      classes.push('card-clickable');
    }
    if (this.elevated) {
      classes.push('card-elevated');
    }

    // Custom classes
    if (this.config?.customClasses) {
      classes.push(this.config.customClasses);
    }
    if (this.customClasses) {
      classes.push(this.customClasses);
    }

    return classes.join(' ');
  }

  getHeaderClasses(): string {
    const classes: string[] = ['card-header'];
    const size = this.config?.size || 'medium';
    return classes.join(' ');
  }

  getContentClasses(): string {
    const classes: string[] = ['card-content'];
    
    if (this.hasHeader) {
      classes.push('card-content-with-header');
    }
    if (this.hasFooter) {
      classes.push('card-content-with-footer');
    }

    return classes.join(' ');
  }

  getFooterClasses(): string {
    const classes: string[] = ['card-footer'];
    return classes.join(' ');
  }
}

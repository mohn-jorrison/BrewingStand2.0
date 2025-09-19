import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TenantConfigService } from '../../../services/tenant-config.service';
import { ComponentConfig, TenantConfiguration } from '../../../models/tenant-config.model';

@Component({
  selector: 'app-configurable-button',
  template: `
    <button 
      [class]="getButtonClasses()"
      [disabled]="disabled"
      [type]="type"
      (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      border: none;
      outline: none;
      position: relative;
      overflow: hidden;
      transform: translateY(0);
    }

    button:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.5s;
    }

    button:hover:before {
      left: 100%;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    button:focus {
      box-shadow: 0 0 0 3px rgba(var(--primary-500), 0.3);
    }

    /* Primary variant (mapped to default) */
    .btn-primary, .btn-default {
      background: linear-gradient(135deg, rgb(var(--primary-500)) 0%, rgb(var(--primary-600)) 100%);
      color: white;
      box-shadow: 0 4px 14px 0 rgba(var(--primary-500), 0.25);
    }

    .btn-primary:hover:not(:disabled), .btn-default:hover:not(:disabled) {
      background: linear-gradient(135deg, rgb(var(--primary-600)) 0%, rgb(var(--primary-700)) 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(var(--primary-500), 0.4);
    }

    /* Secondary variant (mapped to minimal) */
    .btn-secondary, .btn-minimal {
      background: rgba(var(--primary-500), 0.1);
      color: rgb(var(--primary-600));
      border: 1px solid rgba(var(--primary-500), 0.2);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover:not(:disabled), .btn-minimal:hover:not(:disabled) {
      background: rgba(var(--primary-500), 0.15);
      color: rgb(var(--primary-700));
      border-color: rgba(var(--primary-500), 0.3);
      transform: translateY(-1px);
    }

    /* Outline variant */
    .btn-outline {
      background: transparent;
      color: rgb(var(--primary-600));
      border: 2px solid rgb(var(--primary-500));
    }

    .btn-outline:hover:not(:disabled) {
      background: rgb(var(--primary-500));
      color: white;
      transform: translateY(-1px);
    }

    /* Ghost variant */
    .btn-ghost {
      background: transparent;
      color: rgb(var(--primary-600));
      border: none;
    }

    .btn-ghost:hover:not(:disabled) {
      background: rgba(var(--primary-500), 0.1);
      transform: translateY(-1px);
    }

    /* Bold variant */
    .btn-bold {
      background: linear-gradient(135deg, rgb(var(--primary-600)) 0%, rgb(var(--primary-700)) 100%);
      color: white;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 6px 20px rgba(var(--primary-600), 0.3);
    }

    .btn-bold:hover:not(:disabled) {
      background: linear-gradient(135deg, rgb(var(--primary-700)) 0%, rgb(var(--primary-800)) 100%);
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 30px rgba(var(--primary-600), 0.4);
    }

    /* Creative variant - Unique card-based design */
    .btn-creative {
      background: linear-gradient(135deg, rgb(var(--primary-400)) 0%, rgb(var(--accent-500)) 50%, rgb(var(--secondary-500)) 100%);
      color: white;
      font-weight: 600;
      border-radius: 2rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(var(--primary-500), 0.3);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-creative::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .btn-creative:hover:not(:disabled) {
      background: linear-gradient(135deg, rgb(var(--primary-500)) 0%, rgb(var(--accent-600)) 50%, rgb(var(--secondary-600)) 100%);
      transform: translateY(-4px) scale(1.02) rotate(1deg);
      box-shadow: 0 16px 48px rgba(var(--primary-500), 0.4);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .btn-creative:hover:not(:disabled)::before {
      left: 100%;
    }

    /* Size variants */
    .btn-small {
      padding: 0.375rem 0.875rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .btn-medium {
      padding: 0.625rem 1.25rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .btn-large {
      padding: 0.875rem 1.75rem;
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 600;
    }

    /* Border radius variants */
    .btn-rounded {
      border-radius: 9999px;
    }

    .btn-sharp {
      border-radius: 0;
    }

    .btn-default-radius {
      border-radius: var(--border-radius);
    }
  `]
})
export class ConfigurableButtonComponent implements OnInit, OnDestroy {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() customClasses = '';

  private destroy$ = new Subject<void>();
  private config: ComponentConfig | null = null;

  constructor(private tenantConfigService: TenantConfigService) {}

  ngOnInit(): void {
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tenant: TenantConfiguration | null) => {
        this.config = tenant?.components.button || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClick(event: Event): void {
    // Custom click handling can be added here
  }

  getButtonClasses(): string {
    const classes: string[] = [];

    // Base classes
    classes.push('btn');

    // Variant classes
    if (this.config?.variant) {
      classes.push(`btn-${this.config.variant}`);
    } else {
      classes.push(`btn-${this.variant}`);
    }

    // Size classes
    const size = this.config?.size || this.size;
    classes.push(`btn-${size}`);

    // Border radius based on variant
    if (this.config?.variant === 'rounded') {
      classes.push('btn-rounded');
    } else if (this.config?.variant === 'sharp') {
      classes.push('btn-sharp');
    } else {
      classes.push('btn-default-radius');
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
}

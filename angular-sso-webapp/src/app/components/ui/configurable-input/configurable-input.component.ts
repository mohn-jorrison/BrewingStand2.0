import { Component, Input, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TenantConfigService } from '../../../services/tenant-config.service';
import { ComponentConfig, TenantConfiguration } from '../../../models/tenant-config.model';

@Component({
  selector: 'app-configurable-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContainerClasses()">
      <label *ngIf="label" [for]="id" [class]="getLabelClasses()">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>
      <div class="relative">
        <div *ngIf="prefixIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <ng-content select="[slot=prefix-icon]"></ng-content>
        </div>
        <input 
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [required]="required"
          [class]="getInputClasses()"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        <div *ngIf="suffixIcon" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <ng-content select="[slot=suffix-icon]"></ng-content>
        </div>
      </div>
      <div *ngIf="helperText || errorMessage" [class]="getHelperTextClasses()">
        {{ errorMessage || helperText }}
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ConfigurableInputComponent),
      multi: true
    }
  ],
  styles: [`
    .input-container {
      width: 100%;
    }

    .input-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: rgb(var(--secondary-700));
    }

    .input-field {
      width: 100%;
      transition: all 0.2s ease-in-out;
      border: 1px solid rgb(var(--secondary-300));
      background-color: white;
      color: rgb(var(--secondary-900));
    }

    .input-field:focus {
      outline: none;
      border-color: rgb(var(--primary-500));
      box-shadow: 0 0 0 3px rgba(var(--primary-500), 0.1);
    }

    .input-field:disabled {
      background-color: rgb(var(--secondary-50));
      color: rgb(var(--secondary-500));
      cursor: not-allowed;
    }

    .input-field.error {
      border-color: rgb(239, 68, 68);
    }

    .input-field.error:focus {
      border-color: rgb(239, 68, 68);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    /* Size variants */
    .input-small {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .input-medium {
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .input-large {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    /* With icons */
    .input-with-prefix {
      padding-left: 2.5rem;
    }

    .input-with-suffix {
      padding-right: 2.5rem;
    }

    /* Border radius variants */
    .input-rounded {
      border-radius: 9999px;
    }

    .input-sharp {
      border-radius: 0;
    }

    .input-default-radius {
      border-radius: var(--border-radius);
    }

    .helper-text {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .helper-text.success {
      color: rgb(34, 197, 94);
    }

    .helper-text.error {
      color: rgb(239, 68, 68);
    }

    .helper-text.info {
      color: rgb(var(--secondary-600));
    }
  `]
})
export class ConfigurableInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() id = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() prefixIcon = false;
  @Input() suffixIcon = false;
  @Input() customClasses = '';

  value = '';
  private destroy$ = new Subject<void>();
  private config: ComponentConfig | null = null;

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private tenantConfigService: TenantConfigService) {}

  ngOnInit(): void {
    this.tenantConfigService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tenant: TenantConfiguration | null) => {
        this.config = tenant?.components.input || null;
      });

    if (!this.id) {
      this.id = 'input-' + Math.random().toString(36).substr(2, 9);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Focus handling if needed
  }

  getContainerClasses(): string {
    return 'input-container';
  }

  getLabelClasses(): string {
    return 'input-label';
  }

  getInputClasses(): string {
    const classes: string[] = ['input-field'];

    // Size classes
    const size = this.config?.size || 'medium';
    classes.push(`input-${size}`);

    // Border radius based on variant
    if (this.config?.variant === 'rounded') {
      classes.push('input-rounded');
    } else if (this.config?.variant === 'sharp') {
      classes.push('input-sharp');
    } else {
      classes.push('input-default-radius');
    }

    // Icon padding
    if (this.prefixIcon) {
      classes.push('input-with-prefix');
    }
    if (this.suffixIcon) {
      classes.push('input-with-suffix');
    }

    // Error state
    if (this.errorMessage) {
      classes.push('error');
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

  getHelperTextClasses(): string {
    const classes: string[] = ['helper-text'];
    
    if (this.errorMessage) {
      classes.push('error');
    } else {
      classes.push('info');
    }

    return classes.join(' ');
  }
}

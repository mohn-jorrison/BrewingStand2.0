import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TenantConfiguration } from '../models/tenant-config.model';

@Injectable({
  providedIn: 'root'
})
export class TenantConfigService {
  private currentTenantSubject = new BehaviorSubject<TenantConfiguration | null>(null);
  public currentTenant$ = this.currentTenantSubject.asObservable();

  private tenantConfigurations: Record<string, TenantConfiguration> = {};

  constructor() {
    this.loadTenantConfigurations();
  }

  /**
   * Load tenant configurations from assets or API
   */
  private loadTenantConfigurations(): void {
    // In a real application, this would load from an API or configuration service
    // For now, we'll define configurations directly
    this.tenantConfigurations = {
      'default': this.getDefaultTenantConfig(),
      'enterprise': this.getEnterpriseTenantConfig(),
      'startup': this.getStartupTenantConfig(),
      'creative': this.getCreativeAgencyTenantConfig(),
    };
  }

  /**
   * Set the current tenant configuration
   */
  setTenant(tenantId: string): Observable<TenantConfiguration | null> {
    const config = this.tenantConfigurations[tenantId] || this.tenantConfigurations['default'];
    this.currentTenantSubject.next(config);
    this.applyTenantTheme(config);
    return of(config);
  }

  /**
   * Get the current tenant configuration
   */
  getCurrentTenant(): TenantConfiguration | null {
    return this.currentTenantSubject.value;
  }

  /**
   * Apply tenant theme to CSS custom properties
   */
  private applyTenantTheme(config: TenantConfiguration): void {
    const root = document.documentElement;
    
    // Apply color palette with RGB conversion
    Object.entries(config.theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, this.hexToRgb(value));
    });
    
    Object.entries(config.theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--secondary-${key}`, this.hexToRgb(value));
    });
    
    Object.entries(config.theme.colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--accent-${key}`, this.hexToRgb(value));
    });

    // Apply typography
    root.style.setProperty('--font-primary', config.theme.typography.primaryFont);
    root.style.setProperty('--font-secondary', config.theme.typography.secondaryFont);

    // Apply spacing
    root.style.setProperty('--border-radius', config.theme.spacing.borderRadius);
    root.style.setProperty('--spacing-unit', config.theme.spacing.spacingUnit);

    // Apply background colors as direct hex values for gradients
    root.style.setProperty('--primary-bg', config.theme.colors.primary[50]);
    root.style.setProperty('--secondary-bg', config.theme.colors.secondary[50]);
    root.style.setProperty('--accent-bg', config.theme.colors.accent[50]);
    root.style.setProperty('--primary-main', config.theme.colors.primary[500]);
    root.style.setProperty('--accent-main', config.theme.colors.accent[500]);

    // Convert hex to RGBA for better browser support
    const primaryRgb = this.hexToRgb(config.theme.colors.primary[500]);
    const accentRgb = this.hexToRgb(config.theme.colors.accent[500]);
    const primaryBgRgb = this.hexToRgb(config.theme.colors.primary[50]);
    const accentBgRgb = this.hexToRgb(config.theme.colors.accent[50]);
    
    root.style.setProperty('--primary-main-rgb', primaryRgb);
    root.style.setProperty('--accent-main-rgb', accentRgb);
    root.style.setProperty('--primary-bg-rgb', primaryBgRgb);
    root.style.setProperty('--accent-bg-rgb', accentBgRgb);

    // Apply custom CSS if provided
    if (config.theme.customCss) {
      this.injectCustomCSS(config.theme.customCss);
    }
  }

  /**
   * Convert hex color to RGB values for CSS custom properties
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `${r}, ${g}, ${b}`;
  }

  /**
   * Inject custom CSS into the document
   */
  private injectCustomCSS(css: string): void {
    const existingStyle = document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'tenant-custom-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Default tenant configuration
   */
  private getDefaultTenantConfig(): TenantConfiguration {
    return {
      tenantId: 'default',
      name: 'TechCorp Solutions',
      logo: {
        url: 'https://logo.clearbit.com/microsoft.com',
        alt: 'TechCorp Solutions',
        width: '120px',
        height: '40px'
      },
      theme: {
        colors: {
          primary: {
            50: '#eff8ff',
            100: '#dbeefe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a'
          },
          secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a'
          },
          accent: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e'
          }
        },
        typography: {
          primaryFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          secondaryFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          headingWeight: '600',
          bodyWeight: '400'
        },
        spacing: {
          borderRadius: '0.75rem',
          spacingUnit: '1.25rem'
        },
        customCss: `
          .gradient-bg {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          }
          .card-shadow {
            box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1);
          }
          .btn-gradient {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            transition: all 0.3s ease;
          }
          .btn-gradient:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
          }
          .corporate-professional {
            border-left: 4px solid #3b82f6;
            background: linear-gradient(to right, #eff8ff, #ffffff);
          }
          .main-background {
            background: linear-gradient(135deg, #eff8ff 0%, #dbeafe 25%, #bfdbfe 50%, #ffffff 100%);
          }
          .card-background {
            background: linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%);
            border: 1px solid rgba(59, 130, 246, 0.1);
          }
        `
      },
      layout: {
        containerMaxWidth: '1200px',
        gridColumns: 3,
        sidebar: {
          enabled: false,
          width: '250px',
          position: 'left'
        },
        header: {
          height: '64px',
          sticky: true,
          showLogo: true,
          showNavigation: true
        },
        footer: {
          enabled: true,
          content: '© 2025 Default Organization. All rights reserved.'
        }
      },
      components: {
        button: {
          variant: 'default',
          size: 'medium'
        },
        input: {
          variant: 'default',
          size: 'medium'
        },
        card: {
          variant: 'default',
          size: 'medium'
        },
        form: {
          variant: 'default',
          size: 'medium'
        }
      },
      authentication: {
        title: 'Welcome Back',
        subtitle: 'Sign in to access your applications',
        showRememberMe: true,
        showForgotPassword: true
      },
      dashboard: {
        welcomeMessage: 'Welcome to your dashboard',
        showStats: true,
        productGrid: {
          layout: 'grid',
          itemsPerRow: 3,
          showCategories: true
        }
      },
      customization: {
        enableCustomCss: false
      }
    };
  }

  /**
   * Enterprise tenant configuration
   */
  private getEnterpriseTenantConfig(): TenantConfiguration {
    const config = this.getDefaultTenantConfig();
    return {
      ...config,
      tenantId: 'enterprise',
      name: 'Goldman Sachs',
      logo: {
        url: 'https://logo.clearbit.com/goldmansachs.com',
        alt: 'Goldman Sachs',
        width: '140px',
        height: '45px'
      },
      theme: {
        ...config.theme,
        colors: {
          primary: {
            50: '#f7f8fc',
            100: '#eceef8',
            200: '#d4daee',
            300: '#afbae0',
            400: '#8395ce',
            500: '#6175be',
            600: '#4d5eab',
            700: '#424d8b',
            800: '#394170',
            900: '#2c3459'
          },
          secondary: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12'
          },
          accent: {
            50: '#09090b',
            100: '#18181b',
            200: '#27272a',
            300: '#3f3f46',
            400: '#52525b',
            500: '#71717a',
            600: '#a1a1aa',
            700: '#d4d4d8',
            800: '#e4e4e7',
            900: '#f4f4f5'
          }
        },
        spacing: {
          borderRadius: '0.375rem',
          spacingUnit: '1.25rem'
        },
        customCss: `
          .gradient-bg {
            background: linear-gradient(135deg, #6175be 0%, #394170 100%);
          }
          .card-shadow {
            box-shadow: 0 25px 50px -12px rgba(44, 52, 89, 0.3);
          }
          .btn-gradient {
            background: linear-gradient(135deg, #6175be 0%, #4d5eab 100%);
            transition: all 0.3s ease;
          }
          .btn-gradient:hover {
            background: linear-gradient(135deg, #4d5eab 0%, #394170 100%);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(97, 117, 190, 0.4);
          }
          .enterprise-card {
            border: 1px solid rgba(234, 179, 8, 0.2);
            background: linear-gradient(145deg, #ffffff 0%, #fefce8 100%);
          }
          .gold-accent {
            border-left: 4px solid #eab308;
            background: linear-gradient(to right, #fefce8, #ffffff);
          }
          .main-background {
            background: linear-gradient(135deg, #f7f8fc 0%, #eceef8 25%, #d4daee 50%, #fefce8 100%);
          }
          .card-background {
            background: linear-gradient(145deg, #ffffff 0%, #f7f8fc 50%, #fefce8 100%);
            border: 1px solid rgba(97, 117, 190, 0.1);
          }
          .luxury-gradient {
            background: linear-gradient(135deg, #2c3459 0%, #394170 50%, #eab308 100%);
          }
        `
      },
      authentication: {
        title: 'Enterprise Portal',
        subtitle: 'Access your enterprise applications',
        showRememberMe: false,
        showForgotPassword: true
      },
      layout: {
        ...config.layout,
        sidebar: {
          enabled: true,
          width: '280px',
          position: 'left'
        }
      }
    };
  }

  /**
   * Startup tenant configuration
   */
  private getStartupTenantConfig(): TenantConfiguration {
    const config = this.getDefaultTenantConfig();
    return {
      ...config,
      tenantId: 'startup',
      name: 'Stripe Innovations',
      logo: {
        url: 'https://logo.clearbit.com/stripe.com',
        alt: 'Stripe Innovations',
        width: '100px',
        height: '35px'
      },
      theme: {
        ...config.theme,
        colors: {
          primary: {
            50: '#fdf4ff',
            100: '#fae8ff',
            200: '#f5d0fe',
            300: '#f0abfc',
            400: '#e879f9',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
            800: '#86198f',
            900: '#701a75'
          },
          secondary: {
            50: '#fef7ff',
            100: '#fdeeff',
            200: '#f9ddff',
            300: '#f3bdff',
            400: '#ea8dff',
            500: '#dd56ff',
            600: '#c632ff',
            700: '#a318d3',
            800: '#86198f',
            900: '#701a75'
          },
          accent: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843'
          }
        },
        spacing: {
          borderRadius: '1rem',
          spacingUnit: '1rem'
        },
        customCss: `
          .gradient-bg {
            background: linear-gradient(135deg, #d946ef 0%, #c026d3 50%, #a21caf 100%);
          }
          .card-shadow {
            box-shadow: 0 25px 50px -12px rgba(217, 70, 239, 0.25);
          }
          .btn-gradient {
            background: linear-gradient(135deg, #d946ef 0%, #c026d3 100%);
            transition: all 0.3s ease;
          }
          .btn-gradient:hover {
            background: linear-gradient(135deg, #c026d3 0%, #a21caf 100%);
            transform: translateY(-1px) scale(1.02);
            box-shadow: 0 15px 30px rgba(217, 70, 239, 0.4);
          }
          .startup-card {
            border-radius: 1rem;
            background: linear-gradient(145deg, #ffffff 0%, #fdf4ff 100%);
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          .startup-card:hover {
            transform: translateY(-4px);
            transition: all 0.3s ease;
          }
          .purple-accent {
            border-left: 4px solid #d946ef;
            background: linear-gradient(to right, #fdf4ff, #ffffff);
          }
          .main-background {
            background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 25%, #f5d0fe 50%, #f0abfc 75%, #ffffff 100%);
          }
          .card-background {
            background: linear-gradient(145deg, #ffffff 0%, #fdf4ff 50%, #fae8ff 100%);
            border: 1px solid rgba(217, 70, 239, 0.1);
          }
          .vibrant-gradient {
            background: linear-gradient(135deg, #d946ef 0%, #c026d3 25%, #a21caf 50%, #ec4899 75%, #f472b6 100%);
          }
          .animated-background {
            background: linear-gradient(45deg, #d946ef, #c026d3, #a21caf, #ec4899);
            background-size: 400% 400%;
            animation: gradientShift 3s ease infinite;
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `
      },
      authentication: {
        title: 'Welcome to Stripe Innovations',
        subtitle: 'Let\'s build something amazing together',
        showRememberMe: true,
        showForgotPassword: false
      },
      components: {
        button: {
          variant: 'rounded',
          size: 'medium'
        },
        input: {
          variant: 'rounded',
          size: 'medium'
        },
        card: {
          variant: 'rounded',
          size: 'medium'
        },
        form: {
          variant: 'rounded',
          size: 'medium'
        }
      }
    };
  }

  /**
   * Get Creative Agency tenant configuration - Card-based mobile-first design
   */
  private getCreativeAgencyTenantConfig(): TenantConfiguration {
    const config = this.getDefaultTenantConfig();
    return {
      ...config,
      tenantId: 'creative',
      name: 'Pixel Studios',
      logo: {
        url: 'https://logo.clearbit.com/behance.net',
        alt: 'Pixel Studios',
        width: '120px',
        height: '40px'
      },
      theme: {
        ...config.theme,
        colors: {
          primary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12'
          },
          secondary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d'
          },
          accent: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f'
          }
        },
        typography: {
          primaryFont: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          secondaryFont: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          headingWeight: '700',
          bodyWeight: '400'
        },
        spacing: {
          borderRadius: '1.5rem',
          spacingUnit: '1.5rem'
        },
        customCss: `
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Space+Grotesk:wght@400;500;700&display=swap');
          
          .gradient-bg {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f59e0b 100%);
          }
          .card-shadow {
            box-shadow: 0 32px 64px -12px rgba(249, 115, 22, 0.25), 0 0 0 1px rgba(249, 115, 22, 0.05);
          }
          .btn-gradient {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 2rem;
          }
          .btn-gradient:hover {
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
          }
          .creative-card {
            border-radius: 2rem;
            background: linear-gradient(145deg, #ffffff 0%, #fff7ed 100%);
            border: 2px solid rgba(249, 115, 22, 0.1);
            position: relative;
            overflow: hidden;
          }
          .creative-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #f97316, #22c55e, #f59e0b);
          }
          .creative-card:hover {
            transform: translateY(-8px) rotate(1deg);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 32px 64px rgba(249, 115, 22, 0.3);
          }
          .mobile-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            max-width: 400px;
            margin: 0 auto;
          }
          .desktop-layout {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
          }
          .floating-action {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #f97316, #ea580c);
            border-radius: 50%;
            width: 60px;
            height: 60px;
            box-shadow: 0 16px 32px rgba(249, 115, 22, 0.4);
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          .creative-header {
            background: linear-gradient(135deg, #f97316 0%, #22c55e 50%, #f59e0b 100%);
            background-size: 200% 200%;
            animation: gradientShift 5s ease infinite;
          }
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `
      },
      layout: {
        containerMaxWidth: '1400px',
        gridColumns: 1, // Mobile-first approach
        sidebar: {
          enabled: false,
          width: '0px',
          position: 'left'
        },
        header: {
          height: '80px',
          sticky: true,
          showLogo: true,
          showNavigation: false // Minimalist header
        },
        footer: {
          enabled: true,
          content: 'Copyright © 2025 Pixel Studios. All rights reserved.'
        }
      },
      dashboard: {
        welcomeMessage: 'Create Something Amazing',
        showStats: false, // Clean, minimal approach
        productGrid: {
          itemsPerRow: 1, // Card-based layout
          showCategories: false,
          layout: 'cards'
        }
      },
      authentication: {
        title: 'Welcome to Pixel Studios',
        subtitle: 'Where creativity meets technology',
        showRememberMe: false, // Simplified auth
        showForgotPassword: true
      },
      components: {
        button: {
          variant: 'creative',
          size: 'large'
        },
        input: {
          variant: 'creative',
          size: 'large'
        },
        card: {
          variant: 'creative',
          size: 'large'
        },
        form: {
          variant: 'creative',
          size: 'large'
        }
      }
    };
  }
}

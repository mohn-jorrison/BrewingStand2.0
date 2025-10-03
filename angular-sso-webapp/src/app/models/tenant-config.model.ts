export interface TenantTheme {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    headingWeight: string;
    bodyWeight: string;
  };
  spacing: {
    borderRadius: string;
    spacingUnit: string;
  };
  customCss?: string;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ComponentConfig {
  variant: 'default' | 'minimal' | 'bold' | 'rounded' | 'sharp' | 'creative';
  size: 'small' | 'medium' | 'large';
  customClasses?: string;
}

export interface LayoutConfig {
  containerMaxWidth: string;
  gridColumns: number;
  sidebar: {
    enabled: boolean;
    width: string;
    position: 'left' | 'right';
  };
  header: {
    height: string;
    sticky: boolean;
    showLogo: boolean;
    showNavigation: boolean;
  };
  footer: {
    enabled: boolean;
    content: string;
  };
}

export interface TenantConfiguration {
  tenantId: string;
  name: string;
  logo: {
    url: string;
    alt: string;
    width?: string;
    height?: string;
  };
  theme: TenantTheme;
  layout: LayoutConfig;
  components: {
    button: ComponentConfig;
    input: ComponentConfig;
    card: ComponentConfig;
    form: ComponentConfig;
  };
  authentication: {
    title: string;
    subtitle: string;
    showRememberMe: boolean;
    showForgotPassword: boolean;
    backgroundImage?: string;
    customFields?: AuthField[];
  };
  dashboard: {
    welcomeMessage: string;
    showStats: boolean;
    productGrid: {
      layout: 'grid' | 'list' | 'cards';
      itemsPerRow: number;
      showCategories: boolean;
    };
    // Add template storage
    customTemplate?: string; // Base64 encoded template
  };
  customization: {
    enableCustomCss: boolean;
    customJavaScript?: string;
    additionalFonts?: string[];
    // Add template management
    enableCustomTemplates?: boolean;
    templateVersion?: string;
  };
}

export interface AuthField {
  id: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: string;
  options?: { value: string; label: string }[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  iconName: string;
  hasAccess: boolean;
  category: string;
  url?: string;
  customData?: Record<string, any>;
}

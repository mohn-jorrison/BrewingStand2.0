# Multi-Tenant Angular SSO Application

A scalable Angular application designed with multi-tenant architecture that allows different organizations to have their own customized themes, layouts, and configurations while sharing the same codebase.

## 🌟 Features

### Multi-Tenant Architecture
- **Dynamic Theming**: Each tenant can have custom color palettes, typography, and spacing
- **Configurable Components**: Buttons, inputs, cards, and other UI elements adapt to tenant preferences
- **Layout Customization**: Flexible layouts including sidebar positioning, grid configurations, and responsive design
- **Tenant-Specific Branding**: Custom logos, welcome messages, and authentication screens

### Authentication & Security
- **Single Sign-On (SSO)**: Centralized authentication system
- **Role-Based Access Control**: Different user roles with appropriate permissions
- **Secure Token Management**: JWT-based authentication with local storage persistence
- **Form Validation**: Comprehensive client-side validation with error handling

### Configurable UI Components
- **Smart Components**: All UI components automatically adapt to tenant configurations
- **Flexible Styling**: CSS custom properties enable real-time theme switching
- **Responsive Design**: Mobile-first approach with configurable breakpoints
- **Accessibility**: WCAG compliant components with proper ARIA attributes

## 🏗️ Architecture

### Project Structure
```
src/app/
├── components/
│   ├── auth/
│   │   └── sign-in/                 # Authentication components
│   ├── dashboard/                   # Main dashboard/product grid
│   ├── tenant-selector/             # Demo tenant switching
│   └── ui/                          # Reusable UI components
│       ├── configurable-button/
│       ├── configurable-input/
│       └── configurable-card/
├── models/
│   └── tenant-config.model.ts       # TypeScript interfaces
├── services/
│   ├── auth.service.ts              # Authentication logic
│   └── tenant-config.service.ts     # Tenant configuration management
└── styles/
    └── globals.css                  # Global styles with CSS custom properties
```

### Key Technologies
- **Angular 18+**: Latest Angular framework with standalone components
- **TypeScript**: Strong typing for better development experience
- **TailwindCSS**: Utility-first CSS framework for rapid styling
- **RxJS**: Reactive programming for state management
- **CSS Custom Properties**: Dynamic theming system

## 🎨 Tenant Configurations

The application comes with three pre-configured tenant themes:

### 1. Default Theme
- **Colors**: Classic blue primary with standard secondary colors
- **Layout**: Traditional layout without sidebar
- **Components**: Standard rounded corners and medium sizing
- **Target**: General purpose applications

### 2. Enterprise Theme
- **Colors**: Professional sky blue with yellow accents
- **Layout**: Sidebar navigation enabled with enterprise features
- **Components**: Slightly more conservative styling with tighter spacing
- **Target**: Large corporations and enterprise clients

### 3. Startup Theme
- **Colors**: Modern pink primary with green accents
- **Layout**: Creative layout with rounded components
- **Components**: Bold, rounded design with larger spacing
- **Target**: Startups and creative agencies

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 18+

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angular-sso-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Demo Credentials
```
Email: admin@company.com
Password: password123

Email: user@company.com  
Password: password123

Email: demo@company.com
Password: demo123
```

## 🔧 Configuration

### Adding a New Tenant

1. **Define the tenant configuration** in `tenant-config.service.ts`:
   ```typescript
   private getCustomTenantConfig(): TenantConfiguration {
     return {
       tenantId: 'custom',
       name: 'Custom Organization',
       theme: {
         colors: {
           primary: { /* custom color palette */ },
           // ... more theme properties
         }
       },
       // ... other configuration
     };
   }
   ```

2. **Add the configuration to the service**:
   ```typescript
   private loadTenantConfigurations(): void {
     this.tenantConfigurations = {
       'default': this.getDefaultTenantConfig(),
       'enterprise': this.getEnterpriseTenantConfig(),
       'startup': this.getStartupTenantConfig(),
       'custom': this.getCustomTenantConfig(), // Add your new tenant
     };
   }
   ```

### Customizing Components

All UI components automatically inherit tenant configurations. To customize a specific component:

1. **Override in tenant configuration**:
   ```typescript
   components: {
     button: {
       variant: 'rounded',
       size: 'large',
       customClasses: 'shadow-lg hover:shadow-xl'
     }
   }
   ```

2. **Add custom CSS** (optional):
   ```typescript
   theme: {
     customCss: `
       .custom-component {
         /* Your custom styles */
       }
     `
   }
   ```

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Configurable breakpoints per tenant
- Adaptive layouts for different screen sizes
- Touch-friendly interfaces on mobile devices

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permission levels for users
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Anti-forgery tokens

## Development

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Testing

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Multi-Tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/)
- [Angular Style Guide](https://angular.dev/style-guide)

For questions and support, please create an issue in the repository.

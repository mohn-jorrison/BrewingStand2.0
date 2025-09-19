# Azure AD B2C Multi-Tenant Authentication Setup

This guide explains how to configure Azure AD B2C authentication for your multi-tenant Angular application.

## 🚀 Quick Start

1. **Update Configuration**: Replace placeholder values in `src/app/config/auth-config.ts`
2. **Create Azure AD B2C Tenant**: Set up your Azure AD B2C tenant
3. **Register Applications**: Create app registrations for each tenant
4. **Configure User Flows**: Set up sign-in/sign-up policies
5. **Test Authentication**: Verify the integration works

## 📋 Prerequisites

- Azure subscription with Azure AD B2C tenant
- Angular 18+ application
- MSAL Angular packages (already installed)

## 🔧 Configuration Steps

### 1. Azure AD B2C Tenant Setup

1. **Create B2C Tenant**:
   - Go to Azure Portal → Create a resource → Azure Active Directory B2C
   - Choose "Create a new Azure AD B2C Tenant"
   - Follow the wizard to create your tenant

2. **Register Applications**:
   For each tenant (default, enterprise, startup, creative), create app registrations:
   
   ```
   Application Type: Single-page application (SPA)
   Redirect URIs: 
   - http://localhost:4200/auth/callback
   - https://yourdomain.com/auth/callback
   
   Logout URL: 
   - http://localhost:4200
   - https://yourdomain.com
   ```

3. **Create User Flows**:
   Create the following user flows in your B2C tenant:
   
   - **Sign up and sign in**: `B2C_1_signupsignin1`
   - **Password reset**: `B2C_1_passwordreset1`
   - **Profile editing**: `B2C_1_editprofile1` (optional)

### 2. Update Configuration File

Edit `src/app/config/auth-config.ts` and replace the placeholder values:

```typescript
export const TENANT_AUTH_CONFIGS: Record<string, TenantAuthConfig> = {
  default: {
    tenantId: 'default',
    tenantName: 'TechCorp Solutions',
    clientId: 'YOUR_ACTUAL_CLIENT_ID', // ← Replace this
    authority: {
      signUpSignIn: 'https://YOUR_TENANT_NAME.b2clogin.com/YOUR_TENANT_NAME.onmicrosoft.com/B2C_1_signupsignin1', // ← Replace this
      resetPassword: 'https://YOUR_TENANT_NAME.b2clogin.com/YOUR_TENANT_NAME.onmicrosoft.com/B2C_1_passwordreset1' // ← Replace this
    },
    knownAuthorities: ['YOUR_TENANT_NAME.b2clogin.com'], // ← Replace this
    // ... rest of config
  },
  // ... repeat for other tenants
};
```

### 3. Environment-Specific Configuration

For different environments, you can create environment-specific config files:

**src/environments/environment.ts** (Development):
```typescript
export const environment = {
  production: false,
  azureAdB2C: {
    defaultTenant: 'YOUR_DEV_TENANT_NAME',
    clientId: 'YOUR_DEV_CLIENT_ID'
  }
};
```

**src/environments/environment.prod.ts** (Production):
```typescript
export const environment = {
  production: true,
  azureAdB2C: {
    defaultTenant: 'YOUR_PROD_TENANT_NAME',
    clientId: 'YOUR_PROD_CLIENT_ID'
  }
};
```

## 🎛️ Multi-Tenant Configuration

### Tenant-Specific Settings

Each tenant can have its own Azure AD B2C configuration:

```typescript
// Example: Different B2C tenants for different business units
enterprise: {
  clientId: 'enterprise-app-client-id',
  authority: {
    signUpSignIn: 'https://contoso-enterprise.b2clogin.com/contoso-enterprise.onmicrosoft.com/B2C_1_enterprise_signin'
  },
  knownAuthorities: ['contoso-enterprise.b2clogin.com']
},
startup: {
  clientId: 'startup-app-client-id',
  authority: {
    signUpSignIn: 'https://contoso-startup.b2clogin.com/contoso-startup.onmicrosoft.com/B2C_1_startup_flow'
  },
  knownAuthorities: ['contoso-startup.b2clogin.com']
}
```

### Custom Claims and Attributes

To collect additional user information, configure custom attributes in Azure AD B2C:

1. Go to your B2C tenant → User flows → Select your flow
2. Navigate to "User attributes" and "Application claims"
3. Add custom attributes like:
   - Department
   - Job Title
   - Company
   - Custom roles

Update the auth service to extract these claims:

```typescript
private extractRolesFromClaims(claims: any): string[] {
  // Standard role claims
  const roles = claims?.roles || [];
  
  // Custom B2C extension attributes
  const customRoles = claims?.['extension_customRoles'] || [];
  
  return [...roles, ...customRoles];
}
```

## 🔐 Security Best Practices

### 1. Token Validation
The MSAL library handles token validation, but ensure you:
- Validate tokens on your backend API
- Check token expiration
- Verify audience and issuer claims

### 2. Secure API Calls
```typescript
// Example protected API call
this.azureAuthService.getAccessToken(['https://yourdomain.onmicrosoft.com/api/read'])
  .subscribe(token => {
    // Use token for API calls
    this.http.get('/api/protected-endpoint', {
      headers: { Authorization: `Bearer ${token}` }
    });
  });
```

### 3. Role-Based Access Control
```typescript
// Protect routes with role requirements
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }
}
```

## 🧪 Testing the Integration

### 1. Local Development
```bash
# Start the development server
npm start

# Navigate to http://localhost:4200
# Click "Continue with Microsoft"
# You should be redirected to Azure AD B2C
```

### 2. Test Different Tenants
1. Switch between tenants using the tenant selector
2. Verify each tenant uses its own B2C configuration
3. Test sign-in, sign-out, and password reset flows

### 3. Error Scenarios
Test these scenarios:
- Network connectivity issues
- Invalid credentials
- Token expiration
- User cancellation

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure redirect URIs are properly configured
   - Check that your domain is added to CORS settings

2. **Invalid Authority**:
   - Verify the authority URL format
   - Check that the user flow exists

3. **Token Acquisition Fails**:
   - Check scopes configuration
   - Verify the application has required permissions

### Debug Mode
Enable verbose logging in `auth-config.ts`:
```typescript
system: {
  loggerOptions: {
    logLevel: LogLevel.Verbose, // Change from Warning to Verbose
    piiLoggingEnabled: true // Enable for development only
  }
}
```

### Network Traces
Monitor network traffic in browser dev tools:
1. Go to Network tab
2. Filter by "b2clogin.com"
3. Check for failed requests or unexpected redirects

## 📊 Monitoring and Analytics

### Application Insights
Integrate with Azure Application Insights for monitoring:

```typescript
// Add to your auth service
private logAuthEvent(event: string, properties?: any): void {
  if (this.appInsights) {
    this.appInsights.trackEvent(event, properties);
  }
}
```

### Custom Metrics
Track authentication metrics:
- Sign-in success/failure rates
- Token refresh frequency
- User journey completion rates

## 🔄 Migration from Mock Auth

If you were using the mock authentication service, the new Azure AD B2C service provides:

✅ **Real authentication** with Azure AD B2C  
✅ **Multi-tenant support** with tenant-specific configurations  
✅ **Token management** with automatic refresh  
✅ **Role-based access control** from B2C claims  
✅ **Password reset** and profile management flows  
✅ **Production-ready** security and scalability  

The UI components remain the same, but now integrate with real Azure AD B2C authentication.

## 📞 Support

For issues with this implementation:
1. Check the troubleshooting section above
2. Review Azure AD B2C logs in the Azure portal
3. Enable verbose logging for detailed error information
4. Consult the [MSAL Angular documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular)

---

*This implementation provides enterprise-grade authentication with Azure AD B2C while maintaining the multi-tenant UI flexibility of your application.*
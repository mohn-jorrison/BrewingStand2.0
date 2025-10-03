# Dynamic Template System

This implementation demonstrates a dynamic template system where different tenants can have completely custom dashboard layouts stored as base64-encoded templates in MongoDB and injected at runtime.

## Features

- **Dynamic Template Loading**: Templates are fetched from a service and dynamically compiled into Angular components
- **Base64 Storage**: Templates are encoded and can be stored in MongoDB for runtime retrieval
- **Tenant-Specific Styling**: Each tenant can have custom CSS that's applied when their template loads
- **Fallback Support**: If a custom template fails to load, the component gracefully falls back to the default template
- **Live Updates**: Templates can be updated without code deployment

## Demo Tenants

### Default Tenant
- Standard blue theme with default layout
- Uses the built-in template

### Enterprise Tenant  
- Professional navy/gold theme
- Standard template with enterprise styling

### Startup Tenant
- Purple theme with rounded components
- Standard template with startup styling

### **NovaTech (tech-startup) - Dynamic Template Demo** 🚀
- **Custom Template**: Uses a completely different template stored as base64
- **Startup Vibes**: Fun emojis, casual messaging, and vibrant colors
- **Dynamic Layout**: Different header styling, hero section, and card layouts
- **Custom CSS**: Gradients, animations, and startup-themed styling

### Creative Agency
- Orange/green theme with creative card layouts
- Standard template with creative styling

## How It Works

### 1. Template Service (`template.service.ts`)
- Manages template storage and retrieval
- Handles base64 encoding/decoding
- Contains mock templates for demonstration
- In production, would fetch from MongoDB API

### 2. Dynamic Component Creation
The dashboard component can dynamically create and render custom templates:

```typescript
private createDynamicComponent(template: string): void {
  // Creates a new Angular component at runtime
  // Binds all methods and properties from parent
  // Injects the custom template HTML
}
```

### 3. Template Example
The NovaTech template includes:
- Custom header with different styling and messaging
- Hero section with startup-focused content
- Fun emoji icons instead of SVG icons
- Different button text ("🚀 Launch App" vs "Open Application")
- Casual, encouraging messaging throughout

### 4. CSS Injection
Custom styles are injected into the document head:
```typescript
private applyCustomStyles(tenantId: string): void {
  const customStyles = this.templateService.getTenantStyles(tenantId);
  // Creates <style> tag and injects custom CSS
}
```

## Testing the Feature

1. **Start the application**
2. **Login with any credentials** (demo mode)
3. **Use the Tenant Selector** (top-right corner) to switch between tenants
4. **Select "NovaTech (Custom Template)"** to see the dynamic template in action

You'll notice:
- Completely different layout and styling
- Fun, casual messaging with emojis
- Different component arrangements
- Custom colors and animations
- All rendered from a template stored as a base64 string

## Production Implementation

In a real application:

### Backend API
```javascript
// GET /api/templates/:tenantId/:templateType
app.get('/api/templates/:tenantId/:templateType', async (req, res) => {
  const template = await db.collection('tenant_templates').findOne({
    tenantId: req.params.tenantId,
    templateType: req.params.templateType
  });
  res.json(template);
});
```

### MongoDB Document
```json
{
  "tenantId": "tech-startup",
  "templateType": "dashboard", 
  "template": "PGRpdiBjbGFzcz0iY3VzdG9tLWRhc2hib2FyZCI+...", // base64
  "version": "1.0.0",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Admin Interface
You could build an admin interface that allows:
- Template editing with live preview
- Template validation
- Version management
- Rollback capabilities

## Security Considerations

- **Template Validation**: Always validate templates server-side
- **Content Security Policy**: Implement CSP to prevent XSS
- **Sanitization**: Sanitize templates before rendering
- **Access Control**: Restrict who can modify templates
- **Audit Trail**: Track template changes for security

## Benefits

- **No Code Deployments**: Update layouts without releasing code
- **Tenant Customization**: Each tenant can have unique experiences  
- **A/B Testing**: Easy to test different layouts
- **Brand Alignment**: Templates can match tenant branding exactly
- **Scalability**: Add new tenants without code changes

This approach provides maximum flexibility while maintaining security and performance!
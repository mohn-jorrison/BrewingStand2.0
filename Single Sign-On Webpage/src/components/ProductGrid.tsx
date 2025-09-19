import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Database, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  ArrowUpRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  hasAccess: boolean;
  category: string;
  url?: string;
}

interface ProductGridProps {
  userEmail: string;
  onSignOut: () => void;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Security Dashboard',
    description: 'Monitor and manage security across all your applications',
    icon: <Shield className="w-8 h-8" />,
    hasAccess: true,
    category: 'Security',
    url: '/security'
  },
  {
    id: '2',
    name: 'Analytics Platform',
    description: 'Comprehensive analytics and reporting tools',
    icon: <BarChart3 className="w-8 h-8" />,
    hasAccess: true,
    category: 'Analytics',
    url: '/analytics'
  },
  {
    id: '3',
    name: 'User Management',
    description: 'Manage users, roles, and permissions across your organization',
    icon: <Users className="w-8 h-8" />,
    hasAccess: true,
    category: 'Management',
    url: '/users'
  },
  {
    id: '4',
    name: 'Data Warehouse',
    description: 'Centralized data storage and processing platform',
    icon: <Database className="w-8 h-8" />,
    hasAccess: false,
    category: 'Data',
    url: '/warehouse'
  },
  {
    id: '5',
    name: 'Documentation Hub',
    description: 'Access all technical documentation and guides',
    icon: <FileText className="w-8 h-8" />,
    hasAccess: true,
    category: 'Resources',
    url: '/docs'
  },
  {
    id: '6',
    name: 'System Settings',
    description: 'Configure system-wide settings and preferences',
    icon: <Settings className="w-8 h-8" />,
    hasAccess: false,
    category: 'Administration',
    url: '/settings'
  }
];

export function ProductGrid({ userEmail, onSignOut }: ProductGridProps) {
  const handleProductClick = (product: Product) => {
    if (product.hasAccess) {
      // In a real app, this would navigate to the product
      console.log(`Accessing ${product.name} at ${product.url}`);
    }
  };

  const accessibleProducts = products.filter(p => p.hasAccess);
  const restrictedProducts = products.filter(p => !p.hasAccess);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1>Enterprise Portal</h1>
                <p className="text-muted-foreground">
                  Welcome, {userEmail}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2>Your Applications</h2>
          <p className="text-muted-foreground">
            Access the tools and services available to your account
          </p>
        </div>

        {/* Accessible Products */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h3>Available Applications</h3>
            <Badge variant="secondary">{accessibleProducts.length} accessible</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                onClick={() => handleProductClick(product)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {product.icon}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {product.name}
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{product.description}</CardDescription>
                  <Button className="w-full mt-4" size="sm">
                    Open Application
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Restricted Products */}
        {restrictedProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h3>Restricted Applications</h3>
              <Badge variant="destructive">{restrictedProducts.length} restricted</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restrictedProducts.map((product) => (
                <Card key={product.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                          {product.icon}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {product.name}
                            <XCircle className="w-4 h-4 text-destructive" />
                          </CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{product.description}</CardDescription>
                    <Button className="w-full mt-4" size="sm" variant="secondary" disabled>
                      Access Restricted
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
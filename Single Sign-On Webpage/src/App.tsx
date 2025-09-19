import { useState } from 'react';
import { SignInForm } from './components/SignInForm';
import { ProductGrid } from './components/ProductGrid';

// Mock user data for demo purposes
const mockUsers = [
  { email: 'admin@company.com', password: 'password123', name: 'Admin User' },
  { email: 'user@company.com', password: 'password123', name: 'Regular User' },
  { email: 'demo@company.com', password: 'demo123', name: 'Demo User' }
];

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (foundUser) {
      setUser({ email: foundUser.email, name: foundUser.name });
    } else {
      alert('Invalid credentials. Please try admin@company.com / password123');
    }
    
    setIsLoading(false);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (user) {
    return <ProductGrid userEmail={user.email} onSignOut={handleSignOut} />;
  }

  return <SignInForm onSignIn={handleSignIn} isLoading={isLoading} />;
}
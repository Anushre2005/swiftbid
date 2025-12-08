import React, { createContext, useContext, useState } from 'react';
import type { UserRole, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage (in a real app, this would be an API call)
const mockUsers: (User & { password: string })[] = [
  { id: '1', email: 'sales@swiftbid.ai', password: 'password123', name: 'John Sales', role: 'sales' },
  { id: '2', email: 'tech@swiftbid.ai', password: 'password123', name: 'Jane Tech', role: 'tech' },
  { id: '3', email: 'pricing@swiftbid.ai', password: 'password123', name: 'Bob Pricing', role: 'pricing' },
  { id: '4', email: 'management@swiftbid.ai', password: 'password123', name: 'Sarah CEO', role: 'management' },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return false; // User already exists
    }
    
    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      name,
      role,
    };
    
    mockUsers.push({ ...newUser, password });
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
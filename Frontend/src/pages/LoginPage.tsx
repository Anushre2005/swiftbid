// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Buildings, Envelope, LockKey, WarningCircle } from '@phosphor-icons/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !selectedRole) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password, selectedRole);
      
      if (success) {
        // Redirect based on the role
        if (selectedRole === 'sales') {
          navigate('/dashboard');
        } else if (selectedRole === 'management') {
          navigate('/management');
        } else {
          navigate('/inbox');
        }
      } else {
        setError('Invalid email, password, or role. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Left Side - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
        {/* gradient updated to Tailwind default colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-90"></div>
        <div className="relative z-10 text-white text-center p-12">
          <Buildings size={64} weight="duotone" className="mx-auto mb-6 text-amber-500" />
          <h1 className="text-5xl font-bold mb-4">SwiftBid AI</h1>
          <p className="text-xl text-slate-300">Accelerating B2B Tenders</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-8 bg-slate-50 overflow-y-auto overflow-x-hidden w-full min-h-0">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 my-4 sm:my-auto">
          {/* text-navy -> text-slate */}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-slate-500 mb-6">Sign in to your account</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <WarningCircle size={16} weight="duotone" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Envelope
                  size={18}
                  weight="duotone"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@swiftbid.ai"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <LockKey
                  size={18}
                  weight="duotone"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none bg-white text-sm sm:text-base"
                required
              >
                <option value="" disabled>
                  Choose your role...
                </option>
                <option value="sales">Sales Manager</option>
                <option value="tech">Technical Lead</option>
                <option value="pricing">Pricing Analyst</option>
                <option value="management">Management / CEO</option>
              </select>
            </div>

            <div className="mt-4">
              {/* Button with slate colors - removed inline styles */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 text-base"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-slate-600 mb-4">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-slate-900 font-semibold hover:text-slate-800 hover:underline"
            >
              Sign up
            </Link>
          </div>

          <details className="p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
            <summary className="font-semibold cursor-pointer mb-1">
              Demo Credentials (click to expand)
            </summary>
            <div className="mt-2 space-y-0.5">
              <p className="break-words">sales@swiftbid.ai / password123 (Sales)</p>
              <p className="break-words">tech@swiftbid.ai / password123 (Tech)</p>
              <p className="break-words">pricing@swiftbid.ai / password123 (Pricing)</p>
              <p className="break-words">
                management@swiftbid.ai / password123 (Management)
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

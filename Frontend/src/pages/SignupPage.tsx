// src/pages/SignupPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Buildings, Envelope, LockKey, User, WarningCircle, CheckCircle } from '@phosphor-icons/react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword || !selectedRole) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(email, password, name, selectedRole);

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
        setError('An account with this email already exists. Please sign in instead.');
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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-90"></div>
        <div className="relative z-10 text-white text-center p-12">
          <Buildings size={64} weight="duotone" className="mx-auto mb-6 text-amber-500" />
          <h1 className="text-5xl font-bold mb-4">SwiftBid AI</h1>
          <p className="text-xl text-slate-300">Accelerating B2B Tenders</p>
          <div className="mt-8 space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle size={20} weight="duotone" className="text-amber-500" />
              <span>Streamlined RFP management</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle size={20} weight="duotone" className="text-amber-500" />
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle size={20} weight="duotone" className="text-amber-500" />
              <span>Collaborative workflows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50 overflow-y-auto overflow-x-hidden w-full">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-10 my-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">
            Create Account
          </h2>
          <p className="text-center text-slate-500 mb-8">Sign up to get started</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <WarningCircle size={16} weight="duotone" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  weight="duotone"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm sm:text-base"
                  required
                />
              </div>
            </div>

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
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm sm:text-base"
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
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none bg-white text-sm sm:text-base"
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
                  placeholder="At least 6 characters"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm sm:text-base"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockKey
                  size={18}
                  weight="duotone"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none text-sm sm:text-base"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-base shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-slate-900 font-semibold hover:text-slate-800 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

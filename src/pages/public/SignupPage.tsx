import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  FormField,
  Stack,
} from '../../components/ui';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export function SignupPage() {
  const {
    signUpWithEmail,
    signInWithGoogle,
    isAuthenticated,
    error,
    clearError,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Destination redirect path
  const fromPath = (location.state as { from?: string })?.from || '/app/jobs';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, navigate, fromPath]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter an email address and a password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
      // onAuthStateChanged will handle redirection
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    setLocalError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle redirection
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const activeErrorMessage = localError || error;

  return (
    <div className="max-w-md mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 justify-center mb-1">
          <Badge variant="category" size="sm">
            Create Account
          </Badge>
          <Badge variant="neutral" size="sm">
            Remote AI Opportunities
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          Join WFH AI Jobs
        </Heading>

        <Text variant="muted" className="text-xs sm:text-sm max-w-sm mx-auto">
          Create an account to track verified remote AI opportunities, bookmark active projects, and receive alerts.
        </Text>
      </div>

      {/* Main Registration Card */}
      <Card padded className="border-slate-800 bg-slate-950/80 shadow-2xl">
        <div className="space-y-5">
          {/* Error Notice */}
          {activeErrorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{activeErrorMessage}</div>
            </div>
          )}

          {/* Google Sign-Up Action */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800/90 text-slate-200 border border-slate-700/80 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {/* Standard Google SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Sign up with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-950 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
              Or register with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <FormField label="Full Name or Nickname" id="name">
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Morgan"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
              />
            </FormField>

            <FormField label="Email Address" id="email" required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                required
              />
            </FormField>

            <FormField label="Password" id="password" required hint="Must be at least 6 characters">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" id="confirmPassword" required>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                required
              />
            </FormField>

            <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-emerald-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-emerald-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              leftIcon={<UserPlus className="w-4 h-4" />}
              isLoading={isSubmitting}
              disabled={isSubmitting || isGoogleSubmitting}
            >
              Create Account
            </Button>
          </form>

          {/* Links to Login */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-900">
            <span>Already have an account?</span>{' '}
            <Link
              to="/login"
              state={{ from: fromPath }}
              className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}


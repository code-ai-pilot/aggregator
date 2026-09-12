import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  KeyRound,
  ArrowLeft,
  Mail,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';

export function ForgotPasswordPage() {
  const { sendPasswordReset, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSubmittedEmail(email.trim());
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeErrorMessage = localError || error;

  return (
    <div className="max-w-md mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 justify-center mb-1">
          <Badge variant="category" size="sm">
            Account Recovery
          </Badge>
          <Badge variant="neutral" size="sm">
            Password Reset
          </Badge>
        </div>

        <Heading level={1} className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          Reset Password
        </Heading>

        <Text variant="muted" className="text-xs sm:text-sm max-w-sm mx-auto">
          Enter your registered email address and we will send you a secure link to reset your account password.
        </Text>
      </div>

      <Card padded className="border-slate-800 bg-slate-950/80 shadow-2xl">
        <div className="space-y-5">
          {/* Success State */}
          {submittedEmail ? (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <Heading level={3} className="text-lg font-semibold text-slate-100">
                  Reset Link Dispatched
                </Heading>
                <Text variant="muted" className="text-xs">
                  We sent password reset instructions to <strong className="text-slate-200">{submittedEmail}</strong>.
                  Check your inbox (and spam folder) to finalize your new password.
                </Text>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full justify-center">
                    Return to Sign In
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedEmail(null);
                    setEmail('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Send to a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Notice */}
              {activeErrorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{activeErrorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Registered Email Address"
                  id="reset-email"
                  required
                  hint="The email address associated with your contractor account"
                >
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  leftIcon={<Send className="w-4 h-4" />}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Password Reset Email
                </Button>
              </form>

              <div className="pt-2 text-center border-t border-slate-900">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}


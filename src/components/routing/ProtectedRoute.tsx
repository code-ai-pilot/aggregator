import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContextPlaceholder';
import { Container, Card, Heading, Text, Badge, Button, Stack, LoadingState } from '../ui';
import { Lock, LogIn, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Boundary
 * Guarantees that unauthenticated users cannot access /app/* content.
 * Prevents unauthorized flashes while Firebase Auth is resolving session state.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Loading State: Prevent flashing protected content before session verification
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <LoadingState message="Verifying authentication session..." />
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card padded className="border-amber-500/30 bg-slate-900/90 shadow-xl">
            <Stack direction="col" gap="md" align="center" className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 mb-1">
                  <Badge variant="warning" size="xs">
                    Access Restricted
                  </Badge>
                  <Badge variant="neutral" size="xs">
                    Protected Boundary
                  </Badge>
                </div>
                <Heading level={2} className="text-xl">
                  Authentication Required
                </Heading>
                <Text variant="muted" className="max-w-md mx-auto">
                  The route <code className="text-emerald-400 font-mono text-xs">{location.pathname}</code> is protected.
                  Please sign in or create an account to access remote AI contract feeds, bookmarking, and seeker preferences.
                </Text>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-left w-full text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security &amp; Protection Active</span>
                </div>
                <p>
                  No protected job seeker data or features are exposed until authenticated session verification completes.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link to="/login" state={{ from: location.pathname }}>
                  <Button variant="primary" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                    Sign In to Continue
                  </Button>
                </Link>
                <Link to="/signup" state={{ from: location.pathname }}>
                  <Button variant="outline" size="sm">
                    Create an Account
                  </Button>
                </Link>
              </div>
            </Stack>
          </Card>
        </Container>
      </div>
    );
  }

  return <>{children}</>;
}


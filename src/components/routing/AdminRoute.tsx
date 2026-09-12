import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContextPlaceholder';
import { Container, Card, Heading, Text, Badge, Button, Stack, LoadingState } from '../ui';
import { ShieldX, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute Authorization Boundary
 * Guarantees that non-admin and unauthenticated users cannot access /admin/* content.
 * Prevents unauthorized flashes while Firebase Auth is resolving session state.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, loading, setSimulatedAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <LoadingState message="Verifying administrator authorization..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card padded className="border-rose-500/30 bg-slate-900/90 shadow-xl">
            <Stack direction="col" gap="md" align="center" className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldX className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 mb-1">
                  <Badge variant="danger" size="xs">
                    403 Forbidden
                  </Badge>
                  <Badge variant="neutral" size="xs">
                    Admin Authorization Boundary
                  </Badge>
                </div>
                <Heading level={2} className="text-xl">
                  Admin Authorization Required
                </Heading>
                <Text variant="muted" className="max-w-md mx-auto">
                  The admin endpoint <code className="text-rose-400 font-mono text-xs">{location.pathname}</code> requires administrative privileges.
                  {!isAuthenticated
                    ? ' You are currently not signed in.'
                    : ' Your current account role does not have administrative privileges.'}
                </Text>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-left w-full text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Admin Role Verification Boundary</span>
                </div>
                <p>
                  Platform moderation, source ingestion controls, and administrative records are isolated behind this role verification gate.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link to="/">
                  <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Home
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/login" state={{ from: location.pathname }}>
                    <Button variant="secondary" size="sm">
                      Sign In as Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  onClick={() => setSimulatedAdmin(true)}
                >
                  Simulate Admin Role (Dev Test)
                </Button>
              </div>
            </Stack>
          </Card>
        </Container>
      </div>
    );
  }

  return <>{children}</>;
}


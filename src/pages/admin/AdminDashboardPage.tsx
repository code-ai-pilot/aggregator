import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Grid, Heading, Text, Badge, Button, Stack } from '../../components/ui';
import { Link } from 'react-router-dom';
import { Shield, Briefcase, Database, Activity, AlertTriangle, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../components/routing/AuthContextPlaceholder';

export function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/admin"
        routeCategory="ADMIN"
        pageTitle="Admin Console / System Overview"
        description="Central administrative portal for aggregator governance, ingestion pipeline health, source monitors, and moderation."
        readyForFeature="Admin Dashboard & System Telemetry"
        boundaryNote="Admin Authorization Boundary: Verified for administrative role (ADMIN_ROLE_REQUIRED)."
        details={[
          { label: 'Admin Identity', value: user?.email || 'admin@wfh-ai-jobs.internal' },
          { label: 'Role Authorization', value: 'Server Claim: role:admin' },
          { label: 'Pipeline State', value: 'Ready for Scheduled Ingestion' },
        ]}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin/jobs">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Manage Jobs (/admin/jobs)
              </Button>
            </Link>
            <Link to="/admin/sources">
              <Button variant="outline" size="sm">
                Job Sources (/admin/sources)
              </Button>
            </Link>
            <Link to="/admin/ingestion">
              <Button variant="secondary" size="sm">
                Ingestion Monitor (/admin/ingestion)
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="danger" size="sm">
                Reports &amp; Flags (/admin/reports)
              </Button>
            </Link>
          </div>

          <Grid cols={3} gap="md">
            <Card padded className="border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Job Moderation</span>
              </div>
              <Heading level={4} className="text-sm font-semibold text-slate-100">
                Active Listings
              </Heading>
              <Text variant="muted" className="text-xs mt-1">
                Review, edit, expire, or manually approve scraped AI job listings.
              </Text>
            </Card>

            <Card padded className="border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs mb-1">
                <Activity className="w-4 h-4" />
                <span>Ingestion Pipeline</span>
              </div>
              <Heading level={4} className="text-sm font-semibold text-slate-100">
                Scraper Telemetry
              </Heading>
              <Text variant="muted" className="text-xs mt-1">
                View ingestion logs, failure rates, and rate limit metrics.
              </Text>
            </Card>

            <Card padded className="border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs mb-1">
                <Users className="w-4 h-4" />
                <span>User Governance</span>
              </div>
              <Heading level={4} className="text-sm font-semibold text-slate-100">
                Roles &amp; Claims
              </Heading>
              <Text variant="muted" className="text-xs mt-1">
                Assign administrative roles and manage account access.
              </Text>
            </Card>
          </Grid>
        </div>
      </RoutePlaceholderCard>
    </div>
  );
}

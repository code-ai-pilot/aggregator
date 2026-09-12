import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Grid, Heading, Text, Badge, Button, Stack } from '../../components/ui';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Bookmark, User, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../components/routing/AuthContextPlaceholder';
import { useSavedJobs } from '../../context/SavedJobsContext';

export function AppDashboardPage() {
  const { user } = useAuth();
  const { savedJobs } = useSavedJobs();

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/app"
        routeCategory="AUTHENTICATED"
        pageTitle="App Dashboard / Job Seeker Overview"
        description="Main authenticated entry point providing job seekers with recent job alerts, saved job activity, and quick filters."
        readyForFeature="User Dashboard & Activity Feed"
        boundaryNote="Protected Route. Only rendered for authenticated sessions."
        details={[
          { label: 'Active Session', value: user?.displayName || 'Active User' },
          { label: 'Protected Scope', value: 'User Profile & State' },
          { label: 'Data Persistence', value: 'Ready for Firestore User Sync' },
        ]}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/app/jobs">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Browse Job Feed (/app/jobs)
              </Button>
            </Link>
            <Link to="/app/saved">
              <Button variant="outline" size="sm">
                View Saved Contracts (/app/saved)
              </Button>
            </Link>
            <Link to="/app/profile">
              <Button variant="secondary" size="sm">
                Edit Profile (/app/profile)
              </Button>
            </Link>
          </div>

          <Grid cols={3} gap="md">
            <Card padded className="border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Job Feed</span>
              </div>
              <Heading level={4} className="text-sm font-semibold text-slate-100">
                13 Categories
              </Heading>
              <Text variant="muted" className="text-xs mt-1">
                Filter by verified AI annotation, prompt RLHF, and evaluation roles.
              </Text>
            </Card>

            <Link to="/app/saved" className="block focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-lg">
              <Card padded className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors h-full">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Jobs</span>
                </div>
                <Heading level={4} className="text-sm font-semibold text-slate-100 font-mono">
                  {savedJobs.length} Bookmarked
                </Heading>
                <Text variant="muted" className="text-xs mt-1">
                  Keep track of high-paying contracts, deadlines, and active application links.
                </Text>
              </Card>
            </Link>

            <Card padded className="border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </div>
              <Heading level={4} className="text-sm font-semibold text-slate-100">
                Notifications
              </Heading>
              <Text variant="muted" className="text-xs mt-1">
                Configure hourly rate thresholds and preferred platforms.
              </Text>
            </Card>
          </Grid>
        </div>
      </RoutePlaceholderCard>
    </div>
  );
}

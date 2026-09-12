import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Heading, Text, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';
import { Database, Plus, RefreshCw, ExternalLink } from 'lucide-react';

export function AdminSourcesPage() {
  const sampleSources = [
    { name: 'Outlier.ai Direct API/Scraper', url: 'https://outlier.ai', status: 'HEALTHY', lastRun: '10 mins ago', totalJobs: 42 },
    { name: 'Appen Remote Task Feed', url: 'https://appen.com', status: 'HEALTHY', lastRun: '25 mins ago', totalJobs: 38 },
    { name: 'Telus International AI Portal', url: 'https://telusinternational.com', status: 'RATE_LIMITED', lastRun: '1 hour ago', totalJobs: 19 },
    { name: 'OneForma Jobs Directory', url: 'https://oneforma.com', status: 'HEALTHY', lastRun: '40 mins ago', totalJobs: 27 },
  ];

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/admin/sources"
        routeCategory="ADMIN"
        pageTitle="Job Sources Configuration"
        description="Configuration and health monitoring of upstream job board scrapers, RSS feeds, and platform adapters."
        readyForFeature="Aggregator Ingestion Source Config & Health Tracking"
        boundaryNote="Admin Authorization Boundary: Verified for administrative role (ADMIN_ROLE_REQUIRED)."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Add Source Connector
              </Button>
              <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Trigger Ingestion Sync
              </Button>
            </div>
            <Badge variant="purple" size="sm">4 Registered Sources</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Provider</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Last Ingestion</TableHead>
                <TableHead>Indexed Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleSources.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-slate-200">{s.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{s.url}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'HEALTHY' ? 'success' : 'warning'} size="xs">
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{s.lastRun}</TableCell>
                  <TableCell className="font-semibold text-emerald-400 text-xs">{s.totalJobs}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="xs">Configure</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RoutePlaceholderCard>
    </div>
  );
}

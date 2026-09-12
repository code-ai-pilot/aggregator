import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Heading, Text, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Grid } from '../../components/ui';
import { Activity, Play, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export function AdminIngestionPage() {
  const samplePipelineRuns = [
    { runId: 'run-9842', timestamp: '2026-09-09 10:15:00', duration: '14.2s', status: 'SUCCESS', jobsIngested: 126, deduplicated: 18 },
    { runId: 'run-9841', timestamp: '2026-09-09 09:15:00', duration: '12.8s', status: 'SUCCESS', jobsIngested: 119, deduplicated: 14 },
    { runId: 'run-9840', timestamp: '2026-09-09 08:15:00', duration: '16.5s', status: 'WARNING', jobsIngested: 94, deduplicated: 9 },
  ];

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/admin/ingestion"
        routeCategory="ADMIN"
        pageTitle="Ingestion Pipeline &amp; Scraper Telemetry"
        description="Execution controls, deduplication statistics, cron status, and raw telemetry for the automated job aggregator."
        readyForFeature="Ingestion Cron Pipeline & Deduplication Engine"
        boundaryNote="Admin Authorization Boundary: Verified for administrative role (ADMIN_ROLE_REQUIRED)."
      >
        <div className="space-y-4">
          <Grid cols={3} gap="md">
            <Card padded className="border-slate-800 bg-slate-900/60">
              <span className="text-[11px] text-slate-500 uppercase">Cron Frequency</span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">Hourly (Every 60 min)</p>
            </Card>
            <Card padded className="border-slate-800 bg-slate-900/60">
              <span className="text-[11px] text-slate-500 uppercase">Deduplication Rate</span>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">14.8% Duplicate Exclusions</p>
            </Card>
            <Card padded className="border-slate-800 bg-slate-900/60">
              <span className="text-[11px] text-slate-500 uppercase">Total Active Indexed</span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">482 Verified Contracts</p>
            </Card>
          </Grid>

          <div className="flex items-center justify-between pt-2">
            <Button variant="primary" size="sm" leftIcon={<Play className="w-4 h-4" />}>
              Trigger Manual Pipeline Run
            </Button>
            <Badge variant="neutral" size="sm">Pipeline v0.1.0 Ready</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ingested</TableHead>
                <TableHead>Deduplicated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePipelineRuns.map((r) => (
                <TableRow key={r.runId}>
                  <TableCell className="font-mono text-xs text-slate-400">{r.runId}</TableCell>
                  <TableCell className="text-xs text-slate-300">{r.timestamp}</TableCell>
                  <TableCell className="text-xs text-slate-400">{r.duration}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'SUCCESS' ? 'success' : 'warning'} size="xs">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-400 text-xs">{r.jobsIngested}</TableCell>
                  <TableCell className="text-slate-400 text-xs">{r.deduplicated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RoutePlaceholderCard>
    </div>
  );
}

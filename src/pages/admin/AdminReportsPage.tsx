import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Heading, Text, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

export function AdminReportsPage() {
  const sampleReports = [
    { id: 'rep-401', jobTitle: 'Outdated RLHF Batch Link', reason: 'EXPIRED_LINK', reporter: 'alex@example.com', status: 'PENDING_REVIEW' },
    { id: 'rep-402', jobTitle: 'Pay rate discrepancy report', reason: 'PAY_RATE_MISMATCH', reporter: 'contractor@mail.org', status: 'RESOLVED' },
  ];

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/admin/reports"
        routeCategory="ADMIN"
        pageTitle="Reports &amp; Flagged Content"
        description="Moderation queue for user-submitted flags, dead links, inaccurate pay scales, or suspicious external listings."
        readyForFeature="User Flagging & Moderation Review Queue"
        boundaryNote="Admin Authorization Boundary: Verified for administrative role (ADMIN_ROLE_REQUIRED)."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">1 Active Flag</Badge>
              <Badge variant="success" size="sm">1 Resolved</Badge>
            </div>
            <Button variant="outline" size="sm">Export Incident Report</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Target Listing</TableHead>
                <TableHead>Reason Flagged</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleReports.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="font-mono text-xs text-slate-400">{rep.id}</TableCell>
                  <TableCell className="font-medium text-slate-200">{rep.jobTitle}</TableCell>
                  <TableCell>
                    <Badge variant="danger" size="xs">{rep.reason}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{rep.reporter}</TableCell>
                  <TableCell>
                    <Badge variant={rep.status === 'PENDING_REVIEW' ? 'warning' : 'neutral'} size="xs">
                      {rep.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="xs" className="text-emerald-400">Resolve</Button>
                      <Button variant="ghost" size="xs" className="text-rose-400">Dismiss</Button>
                    </div>
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

import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Heading, Text, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';
import { Users, UserCheck, Shield, KeyRound } from 'lucide-react';

export function AdminUsersPage() {
  const sampleUsers = [
    { uid: 'usr-admin-01', name: 'Lead System Admin', email: 'admin@wfh-ai-jobs.internal', role: 'ADMIN', createdAt: '2026-09-01' },
    { uid: 'usr-sub-02', name: 'Alex Developer', email: 'alex@example.com', role: 'JOB_SEEKER', createdAt: '2026-09-05' },
    { uid: 'usr-sub-03', name: 'Morgan Evaluator', email: 'morgan@example.com', role: 'JOB_SEEKER', createdAt: '2026-09-08' },
  ];

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/admin/users"
        routeCategory="ADMIN"
        pageTitle="User Accounts &amp; Access Control"
        description="Platform user directory, custom claims assignment (Admin / Moderator / User), and security auditing."
        readyForFeature="User Account Governance & Custom Claims"
        boundaryNote="Admin Authorization Boundary: Verified for administrative role (ADMIN_ROLE_REQUIRED)."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" leftIcon={<KeyRound className="w-4 h-4" />}>
                Grant Admin Claim
              </Button>
            </div>
            <Badge variant="purple" size="sm">3 Sample Accounts</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User UID</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Role Claim</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleUsers.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell className="font-mono text-xs text-slate-400">{u.uid}</TableCell>
                  <TableCell className="font-medium text-slate-200">{u.name}</TableCell>
                  <TableCell className="text-xs text-slate-300">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMIN' ? 'purple' : 'neutral'} size="xs">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{u.createdAt}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="xs">Manage Role</Button>
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

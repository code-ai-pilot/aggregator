import React from 'react';
import { RoutePlaceholderCard } from '../../components/layout/RoutePlaceholderCard';
import { Card, Heading, Text, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';
import { Briefcase, Plus, Filter, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

export function AdminJobsPage() {
  const sampleAdminJobs = [
    { id: 'job-101', title: 'Senior RLHF Evaluator', source: 'Outlier', status: 'ACTIVE', category: 'AI_RESPONSE_EVALUATION' },
    { id: 'job-102', title: 'Multilingual Audio Transcriber', source: 'OneForma', status: 'ACTIVE', category: 'TRANSCRIPTION' },
    { id: 'job-103', title: 'Visual Annotation Specialist', source: 'Appen', status: 'PENDING_REVIEW', category: 'IMAGE_ANNOTATION' },
  ];

  return (
    <div className="space-y-6">
      <RoutePlaceholderCard
        routePath="/admin/jobs"
        routeCategory="ADMIN"
        pageTitle="Admin Job Management"
        description="Comprehensive CRUD operations for job listings, categorization overrides, expiration triggers, and manual curation."
        readyForFeature="Admin Job Moderation & Listing Operations"
        boundaryNote="Admin Authorization Boundary: Verified for administrative role (ADMIN_ROLE_REQUIRED)."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => alert('Add job modal placeholder')}>
                Add Manual Listing
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                Filter Active / Pending
              </Button>
            </div>
            <Badge variant="neutral" size="sm">3 Sample Records</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Role Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleAdminJobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-mono text-xs text-slate-400">{j.id}</TableCell>
                  <TableCell className="font-medium text-slate-200">{j.title}</TableCell>
                  <TableCell>{j.source}</TableCell>
                  <TableCell>
                    <Badge variant="category" size="xs">{j.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={j.status === 'ACTIVE' ? 'success' : 'warning'} size="xs">
                      {j.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="xs">Edit</Button>
                      <Button variant="ghost" size="xs" className="text-rose-400 hover:text-rose-300">Expire</Button>
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

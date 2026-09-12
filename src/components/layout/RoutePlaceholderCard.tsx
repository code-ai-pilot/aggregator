import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Stack, Text, Heading } from '../ui';
import { Layers, ShieldCheck, FileCode, CheckCircle2 } from 'lucide-react';

interface RoutePlaceholderCardProps {
  routePath: string;
  routeCategory: 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN';
  pageTitle: string;
  description: string;
  readyForFeature: string;
  boundaryNote?: string;
  details?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export function RoutePlaceholderCard({
  routePath,
  routeCategory,
  pageTitle,
  description,
  readyForFeature,
  boundaryNote,
  details = [],
  children,
}: RoutePlaceholderCardProps) {
  const categoryVariant =
    routeCategory === 'PUBLIC'
      ? 'info'
      : routeCategory === 'AUTHENTICATED'
      ? 'success'
      : 'purple';

  return (
    <div className="space-y-6">
      <Card padded className="border-slate-800/80 bg-slate-950/60 shadow-lg">
        <Stack direction="col" gap="md">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Badge variant={categoryVariant} size="sm">
                {routeCategory} ROUTE
              </Badge>
              <code className="text-xs font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {routePath}
              </code>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Route Resolved Deliberately</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Heading level={1} className="text-2xl font-bold tracking-tight text-slate-100">
              {pageTitle}
            </Heading>
            <Text variant="muted" className="text-sm">
              {description}
            </Text>
          </div>

          {boundaryNote && (
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Boundary Status: </span>
                {boundaryNote}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Feature Target
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">
                {readyForFeature}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Implementation State
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Route Boundary Active
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Architecture Isolation
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                No unrequested logic executed
              </div>
            </div>

            {details.map((d, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {d.label}
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {d.value}
                </div>
              </div>
            ))}
          </div>

          {children && <div className="pt-2">{children}</div>}
        </Stack>
      </Card>
    </div>
  );
}

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending:    { label: 'Pending',      className: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved:   { label: 'Approved',     className: 'bg-blue-100 text-blue-700 border-blue-200' },
  preparing:  { label: 'Preparing',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
  ready:      { label: 'Ready',        className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  collected:  { label: 'Collected',    className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  on_the_way: { label: 'On the way',   className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'Delivered',    className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelled',    className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="outline" className={cn('font-medium border', config.className)}>
      {config.label}
    </Badge>
  );
}
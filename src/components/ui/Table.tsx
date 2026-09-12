import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export function Table({ containerClassName = '', className = '', children, ...props }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40 ${containerClassName}`}>
      <table className={`w-full text-left text-sm text-slate-300 border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children: React.ReactNode;
}

export function TableHeader({ className = '', children, ...props }: TableHeaderProps) {
  return (
    <thead className={`bg-slate-900/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children: React.ReactNode;
}

export function TableBody({ className = '', children, ...props }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-slate-800/60 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
  className?: string;
  key?: React.Key;
  children: React.ReactNode;
}

export function TableRow({ interactive = true, className = '', children, ...props }: TableRowProps) {
  const hoverClass = interactive ? 'hover:bg-slate-900/50 transition-colors' : '';
  return (
    <tr className={`${hoverClass} ${className}`} {...props}>
      {children}
    </tr>
  );
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children?: React.ReactNode;
}

export function TableHead({ className = '', children, ...props }: TableHeadProps) {
  return (
    <th scope="col" className={`px-4 py-3 font-medium text-slate-400 ${className}`} {...props}>
      {children}
    </th>
  );
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children?: React.ReactNode;
}

export function TableCell({ className = '', children, ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3.5 align-middle text-slate-200 ${className}`} {...props}>
      {children}
    </td>
  );
}

export interface TableEmptyProps {
  colSpan: number;
  message?: string;
  children?: React.ReactNode;
}

export function TableEmpty({ colSpan, message = 'No records found', children }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-xs text-slate-400">
        {children || message}
      </td>
    </tr>
  );
}

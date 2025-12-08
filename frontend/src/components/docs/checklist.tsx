import { ReactNode } from "react";

interface ChecklistItemProps {
  children: ReactNode;
}

export function ChecklistItem({ children }: ChecklistItemProps) {
  return (
    <li className="flex items-center gap-3">
      <div className="h-5 w-5 rounded border border-slate-300 bg-white flex-shrink-0" />
      {children}
    </li>
  );
}

interface ChecklistGroupProps {
  title: string;
  children: ReactNode;
}

export function ChecklistGroup({ title, children }: ChecklistGroupProps) {
  return (
    <div>
      <h3 className="font-medium text-slate-900 mb-2">{title}</h3>
      <ul className="space-y-2 text-slate-700 text-sm">{children}</ul>
    </div>
  );
}

interface ChecklistContainerProps {
  children: ReactNode;
}

export function ChecklistContainer({ children }: ChecklistContainerProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
      <div className="space-y-4">{children}</div>
    </div>
  );
}
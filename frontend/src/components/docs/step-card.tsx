import { ReactNode } from "react";

interface StepCardProps {
  step: number;
  title: string;
  children: ReactNode;
}

export function StepCard({ step, title, children }: StepCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
          {step}
        </span>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface InfoBoxProps {
  title: string;
  children: ReactNode;
  variant?: "default" | "muted";
}

export function InfoBox({ title, children, variant = "default" }: InfoBoxProps) {
  const bgClass = variant === "muted" ? "bg-slate-50/50" : "";
  
  return (
    <div className={`rounded-lg border border-slate-200 p-6 ${bgClass}`}>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      {children}
    </div>
  );
}

interface CallbackBoxProps {
  label: string;
  description: string;
}

export function CallbackBox({ label, description }: CallbackBoxProps) {
  return (
    <div className="rounded bg-slate-50 p-3">
      <span className="font-medium text-slate-700">{label}</span>
      <p className="text-slate-500 text-xs mt-1">{description}</p>
    </div>
  );
}
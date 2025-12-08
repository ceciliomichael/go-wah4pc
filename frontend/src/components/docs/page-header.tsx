import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-4 text-lg text-slate-600">{description}</p>
      {children}
    </div>
  );
}
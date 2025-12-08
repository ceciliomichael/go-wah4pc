import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type HttpMethod = "get" | "post" | "put" | "delete";

interface EndpointCardProps {
  method: HttpMethod;
  path: string;
  description: string;
  children?: ReactNode;
}

export function EndpointCard({
  method,
  path,
  description,
  children,
}: EndpointCardProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3">
        <Badge variant={method}>{method.toUpperCase()}</Badge>
        <h3 className="font-mono text-lg font-medium text-slate-900">{path}</h3>
      </div>
      <p className="text-slate-600">{description}</p>
      {children}
    </div>
  );
}

interface EndpointSectionProps {
  title: string;
  children: ReactNode;
}

export function EndpointSection({ title, children }: EndpointSectionProps) {
  return (
    <div>
      <h4 className="font-medium text-slate-900 mb-2">{title}</h4>
      {children}
    </div>
  );
}
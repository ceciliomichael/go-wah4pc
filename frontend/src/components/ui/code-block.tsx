"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/utils/cn";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  className,
  ...props
}: CodeBlockProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const onCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [code]);

  return (
    <div
      className={cn(
        "relative my-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 text-slate-50",
        className
      )}
      {...props}
    >
      {filename && (
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-medium text-slate-400">
          <span>{filename}</span>
        </div>
      )}
      <div className="group relative">
        <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <button
          onClick={onCopy}
          className="absolute right-2 top-2 hidden rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white group-hover:flex focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Copy code"
        >
          {hasCopied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

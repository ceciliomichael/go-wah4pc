"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: "#14b8a6",
    primaryTextColor: "#fff",
    primaryBorderColor: "#0d9488",
    lineColor: "#0f766e",
    secondaryColor: "#f0fdfa",
    tertiaryColor: "#fff",
  },
});

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const render = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        ref.current!.innerHTML = svg;
      } catch {
        // swallow rendering errors; component will just show nothing
      }
    };

    void render();
  }, [chart]);

  return (
    <div
      ref={ref}
      className="flex justify-center my-8 p-4 bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto"
    />
  );
}

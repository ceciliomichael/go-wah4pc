import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleSize?: "lg" | "xl" | "2xl";
}

export function Section({
  title,
  description,
  children,
  className = "",
  titleSize = "2xl",
}: SectionProps) {
  const titleClasses = {
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h2
          className={`scroll-m-20 ${titleClasses[titleSize]} font-semibold tracking-tight text-slate-900`}
        >
          {title}
        </h2>
      )}
      {description && <p className="text-slate-700">{description}</p>}
      {children}
    </section>
  );
}
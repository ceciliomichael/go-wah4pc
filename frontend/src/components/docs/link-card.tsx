import Link from "next/link";

interface LinkCardProps {
  href: string;
  title: string;
  description: string;
}

export function LinkCard({ href, title, description }: LinkCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
    >
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}

interface LinkCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
}

export function LinkCardGrid({ children, columns = 2 }: LinkCardGridProps) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return <div className={`grid gap-4 ${gridCols}`}>{children}</div>;
}
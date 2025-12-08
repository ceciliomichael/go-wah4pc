import { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; code: string }
> = {
  info: {
    container: "bg-blue-50 text-blue-800 border-blue-200",
    code: "bg-blue-100",
  },
  success: {
    container: "bg-green-50 text-green-800 border-green-200",
    code: "bg-green-100",
  },
  warning: {
    container: "bg-yellow-50 text-yellow-800 border-yellow-200",
    code: "bg-yellow-100",
  },
  error: {
    container: "bg-red-50 text-red-800 border-red-200",
    code: "bg-red-100",
  },
};

export function Alert({ variant = "info", title, children }: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-md p-4 text-sm border ${styles.container}`}>
      {title && <strong>{title}:</strong>} {children}
    </div>
  );
}

export function InlineCode({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: AlertVariant;
}) {
  const styles = variantStyles[variant];
  return <code className={`${styles.code} px-1 rounded`}>{children}</code>;
}
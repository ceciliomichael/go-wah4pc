"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { BookOpen, Activity, Database, Code2, Server } from "lucide-react";

const sidebarItems = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Quickstart",
        href: "/docs/quickstart",
        icon: BookOpen,
      },
      {
        title: "Flow Overview",
        href: "/docs/flow-overview",
        icon: Activity,
      },
    ],
  },
  {
    title: "API Reference",
    items: [
      {
        title: "Endpoints",
        href: "/docs/api-reference",
        icon: Server,
      },
      {
        title: "FHIR Format",
        href: "/docs/fhir-patient-format",
        icon: Database,
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Provider Integration",
        href: "/docs/provider-integration",
        icon: Code2,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 shrink-0 border-r border-slate-200 bg-slate-50/50 h-[calc(100vh-4rem)] sticky top-16 hidden lg:block overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">
        {sidebarItems.map((group, index) => (
          <div key={index} className="flex flex-col gap-2">
            <h4 className="font-semibold text-sm text-slate-900 px-2">
              {group.title}
            </h4>
            <div className="flex flex-col gap-1">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

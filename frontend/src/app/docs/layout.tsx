import { Sidebar } from "@/components/ui/sidebar";
import { CopyMarkdownButton } from "@/components/ui/copy-markdown-button";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center px-4 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 mr-8">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              W
            </div>
            WAH4PC
          </div>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <Link href="/docs/quickstart" className="text-brand-600">Documentation</Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="https://github.com/wah4pc"
              target="_blank"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              GitHub
            </Link>
            {/* Mobile menu button would go here */}
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 py-12 px-4 md:px-8 lg:px-12 max-w-5xl mx-auto">
          <div className="mb-6 flex justify-end">
            <CopyMarkdownButton />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

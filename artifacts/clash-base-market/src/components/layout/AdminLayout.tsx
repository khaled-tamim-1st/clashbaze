import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const sidebarLinks = [
  { href: "/admin", label: "نظرة عامة", exact: true },
  { href: "/admin/accounts", label: "الحسابات" },
  { href: "/admin/blog", label: "المدونة" },
];

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {sidebarLinks.map((link) => {
        const active = link.exact ? location === link.href : location.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-56 shrink-0 border-l border-border bg-card flex-col p-4 gap-4">
        <div className="px-3 py-2 mb-2">
          <Link href="/">
            <span className="text-base font-bold text-primary">كلاش ماركت</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">لوحة التحكم</p>
        </div>
        <SidebarLinks />
        <div className="mt-auto pt-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <span className="font-bold text-primary text-sm">لوحة التحكم</span>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <rect y="3" width="20" height="2" rx="1" />
                  <rect y="9" width="20" height="2" rx="1" />
                  <rect y="15" width="20" height="2" rx="1" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-card p-4">
              <div className="mb-6 px-3">
                <span className="text-base font-bold text-primary">كلاش ماركت</span>
                <p className="text-xs text-muted-foreground mt-0.5">لوحة التحكم</p>
              </div>
              <SidebarLinks onNavigate={() => setOpen(false)} />
              <div className="mt-auto pt-6 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { logout(); setOpen(false); }}>
                  تسجيل الخروج
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

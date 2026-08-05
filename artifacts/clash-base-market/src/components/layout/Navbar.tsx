
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/clash-of-clans", label: "كلاش أوف كلانز" },
  { href: "/clash-royale", label: "كلاش رويال" },
  { href: "/blog", label: "المدونة" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location === link.href ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-lg font-bold text-primary tracking-wide">كلاش ماركت</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            isAdmin ? (
              <div className="flex items-center gap-2">
                <Link href="/admin">
                  <Button variant="outline" size="sm">لوحة التحكم</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>خروج</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={logout}>تسجيل الخروج</Button>
            )
          ) : (
            <Link href="/login">
              <Button size="sm">تسجيل الدخول</Button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <rect y="3" width="20" height="2" rx="1" />
                  <rect y="9" width="20" height="2" rx="1" />
                  <rect y="15" width="20" height="2" rx="1" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card p-6">
              <div className="mb-6">
                <span className="text-lg font-bold text-primary">كلاش ماركت</span>
              </div>
              <nav className="flex flex-col gap-4">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-8 pt-6 border-t border-border">
                {user ? (
                  <div className="flex flex-col gap-3">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">لوحة التحكم</Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full" onClick={() => { logout(); setOpen(false); }}>
                      تسجيل الخروج
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full">تسجيل الدخول</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

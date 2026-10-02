"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// --- Ripple click effect hook ---
function useRipple() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const idRef = useRef(0);

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const id = ++idRef.current;
    setRipples((prev) => [
      ...prev,
      { x: e.clientX - rect.left, y: e.clientY - rect.top, id },
    ]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, []);

  const RippleLayer = useCallback(
    ({ elRect }: { elRect: DOMRect }) => (
      <span className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple absolute rounded-full bg-white/30 animate-ripple-out"
            style={{
              left: r.x - 20,
              top: r.y - 20,
              width: 40,
              height: 40,
            }}
          />
        ))}
      </span>
    ),
    [ripples]
  );

  return { addRipple, RippleLayer };
}

// --- Nav link with active state + ripple ---
function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname() || "";
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  const { addRipple, RippleLayer } = useRipple();
  const ref = useRef<HTMLAnchorElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (ref.current) setRect(ref.current.getBoundingClientRect());
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "text-teal-400"
          : "text-gray-300 hover:text-white"
      }`}
      onMouseDown={addRipple}
    >
      {rect && <RippleLayer elRect={rect} />}
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full animate-in slide-in-from-bottom-1" />
      )}
    </Link>
  );
}

// --- Mobile menu with smooth height animation ---
function MobileMenu({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: any;
}) {
  const { addRipple, RippleLayer } = useRipple();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dashboardPath = session?.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
  const coursesPath = session?.user?.role === "admin" ? "/admin/courses" : "/courses";

  useEffect(() => {
    if (menuRef.current) setRect(menuRef.current.getBoundingClientRect());
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="md:hidden border-t border-white/10 bg-navy-800/95 backdrop-blur-xl"
    >
      <div className="px-4 py-3 space-y-1">
        <NavLink href="/" onClick={onClose}>Home</NavLink>
        <NavLink href={coursesPath} onClick={onClose}>Courses</NavLink>
        <NavLink href="/about" onClick={onClose}>About</NavLink>
        <NavLink href="/trainers" onClick={onClose}>Trainers</NavLink>
        <NavLink href="/blog" onClick={onClose}>Blog</NavLink>
        <NavLink href="/contact" onClick={onClose}>Contact</NavLink>

        <div className="border-t border-white/10 pt-3 mt-2 space-y-1">
          {session ? (
            <>
              <NavLink href={dashboardPath} onClick={onClose}>My Dashboard</NavLink>
              <button
                onClick={() => {
                  onClose();
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/auth/login" onClick={onClose}>Login</NavLink>
              <NavLink href="/register" onClick={onClose}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Header ---
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const dashboardPath = session?.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
  const coursesPath = session?.user?.role === "admin" ? "/admin/courses" : "/courses";

  // Close mobile menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-navy-800/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
              <span className="text-white font-bold text-lg">RTR</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              RTR Media
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href={coursesPath}>Courses</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/trainers">Trainers</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-3">
            {status === "loading" ? (
              <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
            ) : session ? (
              <>
                <Link
                  href={dashboardPath}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg hover:from-teal-500 hover:to-teal-400 transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {/* Animated hamburger */}
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-[9px]" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-[9px]" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          session={session}
        />
      </nav>

      {/* Global ripple styles */}
      <style>{`
        @keyframes ripple-out {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        .animate-ripple-out {
          animation: ripple-out 0.6s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

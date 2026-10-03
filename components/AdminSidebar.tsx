"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: "📊",
  },
  {
    href: "/admin/courses",
    label: "Courses",
    icon: "🎓",
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: "👥",
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: "📝",
  },
];

export function AdminSidebar() {
  const pathname = usePathname() || "";

  return (
    <div className="hidden md:block w-64 bg-navy-800/40 backdrop-blur-xl border-r border-white/5 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4">
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-teal-600/20 text-teal-400"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/courses", label: "Courses", icon: "🎓" },
  { href: "/admin/students", label: "Students", icon: "👥" },
  { href: "/admin/blog", label: "Blog", icon: "📝" },
];

export function AdminNavBar() {
  const pathname = usePathname() || "";

  return (
    <nav className="mb-6 flex overflow-x-auto gap-2 pb-2 border-b border-gray-200">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              isActive
                ? "bg-teal-600/10 text-teal-700 border-2 border-teal-400"
                : "text-gray-600 hover:text-navy-700 hover:bg-navy-100"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
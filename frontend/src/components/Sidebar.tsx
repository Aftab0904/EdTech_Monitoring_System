"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Info, Database } from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Project Explanation", href: "/explanation", icon: Info },
    { name: "Ask Queries About the Data", href: "/queries", icon: Database },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">EdUplift AI</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Growth Intelligence</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-slate-800">
        <p className="text-xs text-slate-500">Professional Edition v2.0</p>
      </div>
    </div>
  );
};

export default Sidebar;

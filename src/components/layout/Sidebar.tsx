import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function in case utils.ts isn't built yet, we'll write it inline or write lib/utils.ts next.
// We'll write lib/utils.ts shortly.

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Define sidebar menu options based on role
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
    },
    {
      title: 'Patients',
      path: '/patients',
      icon: Users,
      roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    },
    {
      title: 'My Records',
      path: `/patients/${user.id}`, // for patients to see their own details
      icon: FileText,
      roles: ['patient'],
    },
    {
      title: 'Appointments',
      path: '/appointments',
      icon: Calendar,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
    },
    {
      title: 'Doctors',
      path: '/doctors',
      icon: Stethoscope,
      roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    },
    {
      title: 'Billing & Invoices',
      path: '/billing',
      icon: CreditCard,
      roles: ['admin', 'receptionist', 'patient'],
    },
  ];

  // Filter items based on active user role
  const filteredItems = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200 bg-slate-900 text-slate-100 transition-all duration-300 dark:border-slate-800",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header / Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30 flex-shrink-0 animate-pulse">
            <Activity className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-bold tracking-wide text-lg text-white select-none whitespace-nowrap">
              WeCare <span className="text-blue-500 text-xs font-semibold px-1 py-0.5 rounded bg-blue-500/10 ml-1 border border-blue-500/20">SaaS</span>
            </span>
          )}
        </div>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-sm z-50"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors select-none",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-2 border-t border-slate-800">
        {!collapsed && (
          <div className="mb-2 rounded-lg bg-slate-800/50 p-3 flex items-center space-x-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 capitalize border border-blue-500/20">
                <Shield className="mr-1 h-3 w-3" />
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors select-none",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

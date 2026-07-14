import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  Building2, 
  Bell, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Settings,
  HelpCircle,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, hospitals, activeHospital, switchHospital, logout } = useAuthStore();
  const [showHospMenu, setShowHospMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const navigate = useNavigate();

  const hospRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (hospRef.current && !hospRef.current.contains(event.target as Node)) {
        setShowHospMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (darkTheme) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    setDarkTheme(!darkTheme);
  };

  if (!user) return null;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
      
      {/* Page Title & Context */}
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
          HMS Workspace
        </h2>
        <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500">|</span>
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        
        {/* Hospital Switcher */}
        <div className="relative" ref={hospRef}>
          <button
            onClick={() => setShowHospMenu(!showHospMenu)}
            className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="max-w-[150px] truncate">{activeHospital?.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showHospMenu && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Hospital Branch
              </div>
              {hospitals.map((hosp) => (
                <button
                  key={hosp.id}
                  onClick={() => {
                    switchHospital(hosp.id);
                    setShowHospMenu(false);
                  }}
                  className={`flex w-full flex-col rounded-md px-3 py-2 text-left text-xs transition ${
                    activeHospital?.id === hosp.id
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold">{hosp.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{hosp.address}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
          title="Toggle Dark Mode"
        >
          {darkTheme ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-500" />}
        </button>

        {/* Notifications Icon (Decoration) */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              {/* User Meta */}
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                <p className="mt-1 text-[9px] uppercase font-bold tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-1.5 py-0.5 rounded inline-block">
                  {user.role}
                </p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard');
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition text-left"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex w-full items-center space-x-2 rounded-md px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition text-left"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex w-full items-center space-x-2 rounded-md px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition text-left"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Help & Support</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 rounded-md px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

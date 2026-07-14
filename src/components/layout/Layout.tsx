import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Side collapsible navigation */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        
        {/* Content container */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;

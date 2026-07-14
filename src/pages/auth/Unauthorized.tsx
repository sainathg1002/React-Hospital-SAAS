import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center transition-colors">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 mb-6">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Your current role does not have the authorization required to view this section. Please contact your system administrator if you think this is a mistake.
      </p>
      
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition w-full sm:w-auto shadow-sm"
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard Home
        </button>
      </div>
    </div>
  );
};
export default Unauthorized;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore, MOCK_USERS } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  Key, 
  Mail, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Shield, 
  Calendar, 
  LineChart, 
  Lock,
  LockKeyhole
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, error, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'form' | 'demo'>('form');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
    clearError();
    const success = await login(email, 'password123');
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f3f6f9] dark:bg-slate-950 transition-colors duration-200 overflow-hidden relative">
      
      {/* Decorative Wave & Dot Background (Left Column Backdrop) */}
      <div className="absolute top-8 left-8 w-24 h-24 text-slate-300/40 pointer-events-none hidden md:block">
        <svg width="100%" height="100%" fill="currentColor">
          <pattern id="dot-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-600/10 to-transparent blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-[16px] border-blue-500/5 pointer-events-none"></div>

      {/* Left Column: Center Login Form Card */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 w-full lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
          
          {/* Logo & Subtitle */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3 animate-pulse">
              <Activity className="h-5.5 w-5.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-white">WeCare Portal</h2>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Hospital Management SaaS Console</p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 select-none">
            <button
              onClick={() => { setActiveTab('form'); clearError(); }}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 transition ${
                activeTab === 'form'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-450 dark:text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('demo'); clearError(); }}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 transition ${
                activeTab === 'demo'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-450 dark:text-slate-500'
              }`}
            >
              Demo Roles
            </button>
          </div>

          {/* Active Tab View */}
          <div>
            {error && (
              <div className="mb-4 flex items-start space-x-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {activeTab === 'form' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Email input */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      {...register('email')}
                      className={`block w-full rounded-lg border bg-slate-50 py-2.5 pl-10 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 ${
                        errors.email ? 'border-red-500 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="name@hospital.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`block w-full rounded-lg border bg-slate-50 py-2.5 pl-10 pr-10 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 ${
                        errors.password ? 'border-red-500 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-xs pt-1 select-none">
                  <label className="flex items-center text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      className="mr-1.5 rounded border-slate-200 text-blue-600 focus:ring-blue-500/20 h-3.5 w-3.5"
                    />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => e.preventDefault()}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Sign In Trigger */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 flex items-center justify-center rounded-lg bg-blue-600 py-2.5 px-4 text-xs font-bold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Social Dividers */}
                <div className="relative my-6 select-none">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="bg-white dark:bg-slate-900 px-2.5 text-slate-400 dark:text-slate-500">
                      Or sign in with
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); alert('OAuth integration stub'); }}
                    className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    {/* Google SVG */}
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.97-.93 2.1l3.05 2.37c1.78-1.64 2.83-4.07 2.83-6.3z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.05-2.37c-.9.6-2.07.98-3.32.98-2.55 0-4.71-1.73-5.48-4.05L5.02 18.02C7 21.93 11.08 24 12 24z"/>
                      <path fill="#FBBC05" d="M6.52 15.65c-.2-.6-.31-1.25-.31-1.92s.11-1.32.31-1.92L3.43 9.4C2.62 11.01 2.18 12.83 2.18 14.73s.44 3.72 1.25 5.33l3.09-2.41z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 8.08 0 4.62 2.24 2.82 5.5l3.7 2.87c.77-2.32 2.93-4.05 5.48-4.05z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); alert('OAuth integration stub'); }}
                    className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-855 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    {/* Microsoft SVG */}
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 23 23">
                      <rect x="0" y="0" width="11" height="11" fill="#f25022" />
                      <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
                      <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
                      <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
                    </svg>
                    <span>Microsoft</span>
                  </button>
                </div>

              </form>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mb-3">
                  Click a role card to sign in with preseeded Indian details.
                </p>
                {Object.entries(MOCK_USERS).map(([email, info]) => (
                  <button
                    key={email}
                    onClick={() => handleDemoLogin(email)}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-150 bg-slate-50 p-2.5 hover:bg-slate-100 hover:border-slate-250 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-850 dark:hover:border-slate-700 transition text-left"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={info.avatarUrl}
                        alt={info.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{info.name}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{email}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                      {info.role}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Compliance Card Info */}
            <div className="mt-8 flex items-center justify-center space-x-1.5 text-[10px] text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 py-2 px-3 rounded-lg select-none">
              <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">WeCare Compliance Platform • Localized INR Workspace</span>
            </div>

          </div>
          
        </div>
      </div>

      {/* Right Column: Graphic Cover Banner (Mockup Match) */}
      <div className="relative hidden w-0 flex-1 lg:block lg:w-1/2">
        
        {/* Unsplash Healthcare Hero Image */}
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80"
          alt="Healthcare administration dashboard"
        />

        {/* Navy/Blue overlay matching mockup color grading */}
        <div className="absolute inset-0 bg-[#0f223d]/90 mix-blend-multiply"></div>

        {/* Cover Content layout */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 text-white z-20">
          
          {/* Top Header Badge */}
          <div className="flex justify-end select-none">
            <div className="flex items-center space-x-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-semibold tracking-wide border border-white/15">
              <LockKeyhole className="h-3.5 w-3.5 text-blue-400" />
              <span>Secure • Compliant • Reliable</span>
            </div>
          </div>

          {/* Center Titles & Features List */}
          <div className="max-w-xl space-y-8 my-auto">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                Simplify Healthcare <br />
                Deliver <span className="text-blue-500">Better Care</span>
              </h1>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-md">
                Manage appointments, diagnostics, billing, and patient records in one secure platform built for modern healthcare providers.
              </p>
            </div>

            {/* Circular blue icon list details */}
            <div className="space-y-5">
              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/10 flex-shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wide">Smart Appointments</h4>
                  <p className="text-[11px] text-slate-350 mt-0.5">Schedule and manage appointments efficiently</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/10 flex-shrink-0">
                  <LineChart className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wide">Real-time Analytics</h4>
                  <p className="text-[11px] text-slate-350 mt-0.5">Track performance and key healthcare metrics</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/10 flex-shrink-0">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wide">Secure & Compliant</h4>
                  <p className="text-[11px] text-slate-350 mt-0.5">HIPAA compliant with end-to-end encryption</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Accent Glassmorphic Card */}
          <div className="max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-500 select-none">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 border border-blue-400/20">
                <Shield className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold">Trusted by Healthcare Professionals</h4>
            </div>
            <p className="mt-2 text-[11px] text-slate-300 leading-relaxed">
              Built specifically for Indian healthcare providers with localized features and INR billing support.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Login;

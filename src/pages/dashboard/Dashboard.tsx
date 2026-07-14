import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePatientStore } from '@/store/patientStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Stethoscope, 
  Activity, 
  Plus, 
  FileText, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  UserCheck, 
  HeartHandshake 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { ActivityLog } from '@/types';

// Mock chart data
const VISIT_TRENDS = [
  { name: 'Mon', Patients: 24, Revenue: 1200 },
  { name: 'Tue', Patients: 35, Revenue: 2100 },
  { name: 'Wed', Patients: 42, Revenue: 2800 },
  { name: 'Thu', Patients: 30, Revenue: 1900 },
  { name: 'Fri', Patients: 48, Revenue: 3400 },
  { name: 'Sat', Patients: 15, Revenue: 950 },
  { name: 'Sun', Patients: 8, Revenue: 500 },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { appointments, fetchAppointments, doctors, fetchDoctors } = useAppointmentStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchDoctors();

    // Fetch mock activity logs
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  }, [fetchPatients, fetchAppointments, fetchDoctors]);

  // Statistics Computations
  const totalPatients = patients.length;
  const activeAppts = appointments.filter(a => a.status === 'scheduled').length;
  const totalDocs = doctors.length;
  
  // Custom dashboard displays per role
  if (!user) return null;

  const renderKPI = (title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{value}</h3>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{subtext}</p>
        </div>
        <div className={`rounded-xl p-3.5 ${colorClass} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Welcome Back, {user.name}</h1>
          <p className="mt-1 text-xs text-blue-100 max-w-xl">
            Here's a summary of today's activities. You are signed in under the <strong className="capitalize">{user.role}</strong> role.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {user.role !== 'patient' && (
            <button
              onClick={() => navigate('/appointments')}
              className="flex items-center space-x-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50 shadow transition select-none"
            >
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </button>
          )}
          {user.role === 'admin' && (
            <button
              onClick={() => navigate('/patients')}
              className="flex items-center space-x-1.5 rounded-lg bg-blue-500 bg-opacity-25 border border-blue-400 px-4 py-2 text-xs font-semibold text-white hover:bg-opacity-35 shadow transition select-none"
            >
              <Users className="h-4 w-4" />
              <span>Manage Patients</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards based on role */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {user.role === 'admin' && (
          <>
            {renderKPI('Total Patients', totalPatients, '+3 registered this week', <Users className="h-5 w-5" />, 'bg-blue-600')}
            {renderKPI('Active Appointments', activeAppts, 'Scheduled consultations', <Calendar className="h-5 w-5" />, 'bg-teal-600')}
            {renderKPI('Available Doctors', totalDocs, 'On-call practitioners', <Stethoscope className="h-5 w-5" />, 'bg-indigo-600')}
            {renderKPI('System Logs', logs.length, 'Audit trail records', <Activity className="h-5 w-5" />, 'bg-purple-600')}
          </>
        )}

        {user.role === 'doctor' && (
          <>
            {renderKPI("Today's Visits", appointments.filter(a => a.doctorId === 'doc-1').length, 'Scheduled calendar events', <Calendar className="h-5 w-5" />, 'bg-blue-600')}
            {renderKPI('Total Patients In-care', totalPatients - 1, 'Assigned clinic records', <Users className="h-5 w-5" />, 'bg-teal-600')}
            {renderKPI('Assigned Specialty', 'Cardiologist', 'Heart & Vascular Clinic', <Stethoscope className="h-5 w-5" />, 'bg-indigo-600')}
            {renderKPI('Consultations Done', 12, 'Completed during July', <UserCheck className="h-5 w-5" />, 'bg-emerald-600')}
          </>
        )}

        {user.role === 'nurse' && (
          <>
            {renderKPI('Checked-In Patients', totalPatients, 'Under active supervision', <Users className="h-5 w-5" />, 'bg-blue-600')}
            {renderKPI('Pending Vitals', 2, 'Vitals monitoring queue', <Activity className="h-5 w-5" />, 'bg-orange-500')}
            {renderKPI("Today's Consults", activeAppts, 'Clinician consult queue', <Calendar className="h-5 w-5" />, 'bg-teal-600')}
            {renderKPI('Assigned Station', 'Ward 3B', 'General Medicine Dept', <Stethoscope className="h-5 w-5" />, 'bg-indigo-600')}
          </>
        )}

        {user.role === 'receptionist' && (
          <>
            {renderKPI('Total Bookings', appointments.length, 'Active database logs', <Calendar className="h-5 w-5" />, 'bg-blue-600')}
            {renderKPI('Registered Patients', totalPatients, 'Profiles on file', <Users className="h-5 w-5" />, 'bg-teal-600')}
            {renderKPI('Pending Invoices', 2, 'Awaiting payment billing', <CreditCard className="h-5 w-5" />, 'bg-orange-500')}
            {renderKPI('Available Doctors', totalDocs, 'Active clinic schedule', <Stethoscope className="h-5 w-5" />, 'bg-indigo-600')}
          </>
        )}

        {user.role === 'patient' && (
          <>
            {renderKPI('Next Appointment', 'July 15 - 10:30 AM', 'With Dr. Rajesh Sharma', <Calendar className="h-5 w-5" />, 'bg-blue-600')}
            {renderKPI('My Last Vitals', '118/76 BP', 'Recorded on 2026-07-10', <Activity className="h-5 w-5" />, 'bg-teal-600')}
            {renderKPI('Allergies Noted', '2 Listed', 'Penicillin, Sulfa Drugs', <AlertCircle className="h-5 w-5" />, 'bg-red-500')}
            {renderKPI('My Records', '2 Diagnosis Files', 'Exhaustion, Soft Tissue Contusion', <FileText className="h-5 w-5" />, 'bg-indigo-600')}
          </>
        )}
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Trend Charts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Clinic Visitation Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Weekly breakdown of outpatient visits and medical revenues</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/10 px-2.5 py-1 rounded-md font-semibold select-none">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+15% Growth</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VISIT_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Patients" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Panel / Audit Logs depending on role */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {user.role === 'patient' ? 'Prescribed Care Directives' : 'Recent Operations Activity'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {user.role === 'patient' ? 'Active prescriptions & healthcare warnings' : 'System-wide audit trail logs'}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-1">
            {user.role === 'patient' ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3.5 dark:border-teal-900/20 dark:bg-teal-950/10">
                  <div className="flex items-center space-x-2">
                    <HeartHandshake className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-400">Diet & Rest Routine</span>
                  </div>
                  <p className="mt-1 text-[11px] text-teal-700 dark:text-teal-500 leading-relaxed">
                    Advised strictly 8 hours of sleep. Stay hydrated. Reduce caffeine intake after 3:00 PM.
                  </p>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/20 dark:bg-blue-950/10">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-400">Cardiovascular Exam</span>
                  </div>
                  <p className="mt-1 text-[11px] text-blue-700 dark:text-blue-500 leading-relaxed">
                    Heart health report signed off by Dr. Priya Patel. Next checkup scheduled for 2026-07-16.
                  </p>
                </div>
              </div>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start space-x-3 text-xs leading-relaxed group">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>{' '}
                      {log.action === 'PATIENT_CREATE' ? 'registered' : log.action === 'APPT_SCHEDULE' ? 'scheduled' : 'updated'}{' '}
                      {log.details.replace(/.*patient:|.*new patient:|.*appointment for |.*invoice /i, '')}
                    </p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {user.role !== 'patient' && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Audit Trail syncing under HIPAA logging standards.
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Dashboard;

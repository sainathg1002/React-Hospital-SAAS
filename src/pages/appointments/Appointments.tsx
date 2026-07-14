import React, { useEffect, useState } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useAuthStore } from '@/store/authStore';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Search, 
  User, 
  Clock, 
  Stethoscope, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDate } from '@/lib/utils';

// Zod validation for Booking Form
const bookingSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  doctorId: z.string().min(1, 'Please select a physician'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Please select a valid date' }),
  time: z.string().min(1, 'Please specify time'),
  reason: z.string().min(3, 'Please specify consultation reason'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export const Appointments: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    appointments, 
    doctors, 
    fetchAppointments, 
    fetchDoctors, 
    createAppointment, 
    cancelAppointment, 
    completeAppointment,
    isLoading 
  } = useAppointmentStore();
  
  const { patients, fetchPatients } = usePatientStore();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Date filtering state for Calendar view (defaults to today)
  const [activeCalendarDate, setActiveCalendarDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, [fetchAppointments, fetchDoctors, fetchPatients]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      notes: '',
    }
  });

  const onSubmit = async (values: BookingFormValues) => {
    const selectedPatient = patients.find(p => p.id === values.patientId);
    const selectedDoctor = doctors.find(d => d.id === values.doctorId);

    if (!selectedPatient || !selectedDoctor) return;

    const success = await createAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: values.date,
      time: values.time,
      status: 'scheduled',
      reason: values.reason,
      notes: values.notes,
    });

    if (success) {
      reset();
      setShowBookModal(false);
    }
  };

  // Status handlers
  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment(id);
    }
  };

  const handleComplete = async (id: string) => {
    await completeAppointment(id);
  };

  // Filters & Search
  const filteredAppts = appointments.filter((appt) => {
    // Patients can only see their own appointments
    const belongsToPatient = user?.role !== 'patient' || appt.patientId === user.id;

    const matchesSearch = 
      appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCalendarDate = viewMode === 'list' || appt.date === activeCalendarDate;

    return belongsToPatient && matchesSearch && matchesCalendarDate;
  });

  // Calculate day-offset for calendar controls
  const adjustCalendarDate = (offset: number) => {
    const current = new Date(activeCalendarDate);
    current.setDate(current.getDate() + offset);
    setActiveCalendarDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Consultations Scheduler</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Coordinate clinic calendars, physician slots, and check-in patient visits</p>
        </div>
        {user?.role !== 'patient' && (
          <button
            onClick={() => setShowBookModal(true)}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow shadow-blue-500/10 transition select-none"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        )}
      </div>

      {/* View Switcher & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="Search by physician, patient or reason..."
          />
        </div>

        {/* View Toggle / Calendar Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          
          {viewMode === 'calendar' && (
            <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 dark:border-slate-750 dark:bg-slate-800">
              <button
                onClick={() => adjustCalendarDate(-1)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white rounded"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-slate-750 dark:text-slate-200">
                {formatDate(activeCalendarDate)}
              </span>
              <button
                onClick={() => adjustCalendarDate(1)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white rounded"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 dark:border-slate-750 dark:bg-slate-800 select-none">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar View</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid/Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Retrieving scheduler lists...</p>
          </div>
        ) : filteredAppts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-400 mb-4 border border-slate-200 dark:border-slate-800">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">No appointments scheduled</h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-sm">
              {viewMode === 'calendar' 
                ? `No clinical visits are currently booked for ${formatDate(activeCalendarDate)}.`
                : 'There are no active booking records in the clinic index.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500 select-none">
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Consulting Physician</th>
                  <th className="py-3.5 px-6">Schedule Time</th>
                  <th className="py-3.5 px-6">Consultation Reason</th>
                  <th className="py-3.5 px-6">Visit Status</th>
                  <th className="py-3.5 px-6 text-right">Schedule Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAppts.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                    
                    {/* Patient */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450 font-bold">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{appt.patientName}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">{appt.patientId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{appt.doctorName}</span>
                      </div>
                    </td>

                    {/* Date/Time */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 dark:text-white">
                        {formatDate(appt.date)}
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{appt.time}</span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-450 max-w-xs truncate">
                      {appt.reason}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize ${
                        appt.status === 'scheduled'
                          ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/15 dark:border-blue-900/30 dark:text-blue-400'
                          : appt.status === 'completed'
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-900/15 dark:border-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/15 dark:border-red-900/30 dark:text-red-400'
                      }`}>
                        {appt.status}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-6 text-right">
                      {appt.status === 'scheduled' && user?.role !== 'patient' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleComplete(appt.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-650 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:hover:bg-emerald-900/30 border border-emerald-200/50 transition"
                            title="Complete Visit"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleCancel(appt.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-450 dark:hover:bg-red-900/30 border border-red-200/50 transition"
                            title="Cancel Booking"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No actions</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOOK APPOINTMENT MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 transition-all animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center">
                <CalendarIcon className="mr-1.5 h-4 w-4 text-blue-600" />
                <span>Book Clinical Appointment</span>
              </h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              
              {/* Select Patient */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Select Patient *</label>
                <select
                  {...register('patientId')}
                  className={`block w-full rounded-lg border bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                    errors.patientId ? 'border-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: {p.id.toUpperCase()})
                    </option>
                  ))}
                </select>
                {errors.patientId && <p className="text-[10px] text-red-500 mt-1">{errors.patientId.message}</p>}
              </div>

              {/* Select Doctor */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Select Consulting Doctor *</label>
                <select
                  {...register('doctorId')}
                  className={`block w-full rounded-lg border bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                    errors.doctorId ? 'border-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
                {errors.doctorId && <p className="text-[10px] text-red-500 mt-1">{errors.doctorId.message}</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    {...register('date')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.date ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.date && <p className="text-[10px] text-red-500 mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Select Time *</label>
                  <input
                    type="time"
                    {...register('time')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.time ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.time && <p className="text-[10px] text-red-500 mt-1">{errors.time.message}</p>}
                </div>
              </div>

              {/* Consultation Reason */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Reason for Visit *</label>
                <input
                  type="text"
                  {...register('reason')}
                  className={`block w-full rounded-lg border bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                    errors.reason ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Chronic joint pains, cardiology follow-up"
                />
                {errors.reason && <p className="text-[10px] text-red-500 mt-1">{errors.reason.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  {...register('notes')}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                  placeholder="e.g. Patient requests wheelchair assistance"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-750 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Schedule'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Appointments;

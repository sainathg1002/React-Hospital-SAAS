import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/store/patientStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useAuthStore } from '@/store/authStore';
import { 
  ArrowLeft, 
  User, 
  Activity, 
  Calendar, 
  CreditCard, 
  FileText, 
  Plus, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types';

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { currentPatient, fetchPatientById, addVitals, addMedicalRecord, isLoading, error } = usePatientStore();
  const { appointments, fetchAppointments } = useAppointmentStore();

  const [activeTab, setActiveTab] = useState<'info' | 'vitals' | 'encounters' | 'appointments' | 'billing'>('info');
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Vitals Form State
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [spo2, setSpo2] = useState(99);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);

  // Encounter Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [docName, setDocName] = useState(user?.name || 'Dr. Rajesh Sharma');

  useEffect(() => {
    if (id) {
      fetchPatientById(id);
      fetchAppointments();
      
      // Fetch billing invoices
      fetch('/api/invoices')
        .then((res) => res.json())
        .then((data: Invoice[]) => {
          // Filter invoices for this patient
          setInvoices(data.filter((inv) => inv.patientId === id));
        })
        .catch((err) => console.error(err));
    }
  }, [id, fetchPatientById, fetchAppointments]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPatient) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-lg mx-auto mt-10 dark:bg-red-950/20 dark:border-red-900/30 text-red-700 dark:text-red-400">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-base font-bold">Failed to load patient</h3>
        <p className="mt-2 text-xs">{error || 'Patient record could not be found.'}</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 inline-flex items-center space-x-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Registry</span>
        </button>
      </div>
    );
  }

  // Filter appointments for this patient
  const patientAppts = appointments.filter((appt) => appt.patientId === currentPatient.id);

  // Form Submissions
  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addVitals(currentPatient.id, {
      bloodPressure: bp,
      heartRate: Number(hr),
      temperature: Number(temp),
      spo2: Number(spo2),
      weight: Number(weight),
      height: Number(height),
    });
    if (success) {
      setShowVitalModal(false);
      fetchPatientById(currentPatient.id); // Reload
    }
  };

  const handleSaveEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addMedicalRecord(currentPatient.id, {
      diagnosis,
      treatment,
      notes,
      doctorName: docName,
    });
    if (success) {
      setDiagnosis('');
      setTreatment('');
      setNotes('');
      setShowRecordModal(false);
      fetchPatientById(currentPatient.id); // Reload
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back Button & Patient Header Card */}
      <div className="flex flex-col gap-4">
        <div>
          <button
            onClick={() => navigate(user?.role === 'patient' ? '/dashboard' : '/patients')}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{user?.role === 'patient' ? 'Dashboard' : 'Patients Registry'}</span>
          </button>
        </div>

        {/* Profile Meta Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-extrabold text-2xl border border-blue-100 dark:border-blue-900/30">
              {currentPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{currentPatient.name}</h1>
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-150 dark:border-red-950/30">
                  {currentPatient.bloodGroup} Blood Group
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                Patient File ID:{' '}
                <span className="font-mono text-slate-500 font-semibold">{currentPatient.id.toUpperCase()}</span>
                {' '}•{' '}
                DOB: <strong className="text-slate-600 dark:text-slate-300">{currentPatient.dateOfBirth}</strong>
                {' '}•{' '}
                Gender: <strong className="text-slate-600 dark:text-slate-300">{currentPatient.gender}</strong>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {user?.role !== 'patient' && (
              <>
                <button
                  onClick={() => setShowVitalModal(true)}
                  className="flex items-center justify-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition shadow-sm"
                >
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span>Log Vitals</span>
                </button>
                <button
                  onClick={() => setShowRecordModal(true)}
                  className="flex items-center justify-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Diagnosis</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Tabs (Sidebar style) */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === 'info'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span>Profile & Allergies</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === 'vitals'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
            }`}
          >
            <Activity className="h-4.5 w-4.5" />
            <span>Vitals Monitoring ({currentPatient.vitals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('encounters')}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === 'encounters'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            <span>Clinical Records ({currentPatient.records.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === 'appointments'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Appointments ({patientAppts.length})</span>
          </button>
          {user?.role !== 'doctor' && user?.role !== 'nurse' && (
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                activeTab === 'billing'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
              }`}
            >
              <CreditCard className="h-4.5 w-4.5" />
              <span>Billing Invoices ({invoices.length})</span>
            </button>
          )}
        </div>

        {/* Tab View Container */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 min-h-[400px]">
          
          {/* 1. Info / Profile Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* Basic Demographic */}
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  Demographic & Address Details
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <dt className="text-slate-400 dark:text-slate-500 font-medium">Residential Address</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{currentPatient.address}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 dark:text-slate-500 font-medium">Email Address</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{currentPatient.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 dark:text-slate-500 font-medium">Telephone Number</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{currentPatient.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 dark:text-slate-500 font-medium">Biological Gender</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{currentPatient.gender}</dd>
                  </div>
                </dl>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  Emergency Contact
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <dt className="text-slate-400 dark:text-slate-500 font-medium">Contact Name</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{currentPatient.emergencyContactName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 dark:text-slate-500 font-medium">Contact Phone</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{currentPatient.emergencyContactPhone}</dd>
                  </div>
                </dl>
              </div>

              {/* Medical Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-150 dark:border-slate-800 pt-5">
                <div>
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center">
                    <AlertCircle className="mr-1.5 h-4 w-4" /> Allergies & Warnings
                  </h4>
                  {currentPatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentPatient.allergies.map((allergy, i) => (
                        <span key={i} className="rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-100 dark:border-red-950/30">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No allergies registered in patient records.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
                    Medical History Timeline
                  </h4>
                  {currentPatient.medicalHistory.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                      {currentPatient.medicalHistory.map((hist, i) => (
                        <li key={i} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          <span className="font-medium">{hist}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No medical history registered.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 2. Vitals Logs Tab */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Logged Vitals Logs History</h3>
                {currentPatient.vitals.length > 1 && (
                  <span className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Tracking active</span>
                  </span>
                )}
              </div>

              {currentPatient.vitals.length === 0 ? (
                <div className="text-center py-10">
                  <Activity className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">No clinical vitals recorded for this patient.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentPatient.vitals.map((v) => (
                    <div key={v.id} className="rounded-xl border border-slate-150 p-4 dark:border-slate-800 hover:border-slate-300 transition duration-200">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-2 mb-3 gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          Evaluation Date: {formatDate(v.date)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Vital Record: {v.id.toUpperCase()}</span>
                      </div>
                      
                      {/* Vitals Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Blood Pressure</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-white mt-0.5">{v.bloodPressure} mmHg</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Heart Rate</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-white mt-0.5">{v.heartRate} bpm</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Temperature</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-white mt-0.5">{v.temperature} °F</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">SpO2 Oxygen</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-white mt-0.5">{v.spo2} %</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Weight</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-white mt-0.5">{v.weight ? `${v.weight} kg` : 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Height</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-white mt-0.5">{v.height ? `${v.height} cm` : 'N/A'}</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Clinical Records Tab */}
          {activeTab === 'encounters' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Physician Diagnosis & Consultation History
              </h3>

              {currentPatient.records.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">No medical encounters or diagnosis notes reported.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-y-1 before:left-3.5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {currentPatient.records.map((rec) => (
                    <div key={rec.id} className="relative pl-8">
                      {/* Timeline icon dot */}
                      <div className="absolute left-1.5 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-white dark:ring-slate-900">
                        <CheckCircle className="h-3 w-3" />
                      </div>

                      <div className="rounded-xl border border-slate-150 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {rec.doctorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(rec.date)} | ID: {rec.id.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Clinical Diagnosis: </span>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{rec.diagnosis}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Treatment / Prescription Plan: </span>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{rec.treatment}</p>
                          </div>
                          {rec.notes && (
                            <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="font-semibold text-slate-400 italic">Consultation Notes:</span>
                              <p className="text-slate-500 dark:text-slate-400 italic mt-0.5 leading-relaxed">{rec.notes}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Scheduled Appointments History
              </h3>

              {patientAppts.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">No scheduled appointments on file.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 select-none">
                        <th className="py-2.5 px-4">Doctor</th>
                        <th className="py-2.5 px-4">Date & Time</th>
                        <th className="py-2.5 px-4">Reason</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patientAppts.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                            {appt.doctorName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {formatDate(appt.date)}
                            </span>
                            <span className="block text-[10px] text-slate-400">{appt.time}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {appt.reason}
                          </td>
                          <td className="py-3 px-4">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Patient Account Invoices
              </h3>

              {invoices.length === 0 ? (
                <div className="text-center py-10">
                  <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">No account invoices billed to this patient.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 select-none">
                        <th className="py-2.5 px-4">Invoice ID</th>
                        <th className="py-2.5 px-4">Bill Date</th>
                        <th className="py-2.5 px-4">Due Date</th>
                        <th className="py-2.5 px-4">Total Amount</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-white font-mono uppercase">
                            {inv.id}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(inv.date)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                            {formatCurrency(inv.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-900/15 dark:border-emerald-900/30 dark:text-emerald-400'
                                : inv.status === 'unpaid'
                                ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/15 dark:border-orange-900/30 dark:text-orange-400'
                                : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/15 dark:border-red-900/30 dark:text-red-400'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: LOG VITALS */}
      {showVitalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center">
                <Activity className="mr-1.5 h-4 w-4 text-blue-600" />
                <span>Log Clinical Vitals</span>
              </h3>
              <button onClick={() => setShowVitalModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="120/80"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Pulse / Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="72"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="98.6"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="99"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVitalModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-750 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  Record Vitals
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MEDICAL ENCOUNTER / DIAGNOSIS */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center">
                <FileText className="mr-1.5 h-4 w-4 text-blue-600" />
                <span>Log Medical Encounter & Diagnosis</span>
              </h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEncounter} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Consulting Physician *</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white font-semibold"
                  placeholder="e.g. Dr. Sarah Connor"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                  placeholder="e.g. Acute Bronchitis, Sprained Ankle"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Treatment / Prescription Plan *</label>
                <textarea
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                  placeholder="e.g. Advised rest, prescribed Albuterol inhaler, checkup in 7 days."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Consultation / Assessment Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                  placeholder="Additional observations, blood panel comments..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-750 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  Save Encounter File
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default PatientProfile;

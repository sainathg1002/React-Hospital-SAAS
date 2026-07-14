import React, { useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { 
  Search, 
  Plus, 
  User, 
  Filter, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Zod Schema for Patient Form
const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Please enter a valid date' }),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  bloodGroup: z.string().min(1, 'Please specify blood group'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(8, 'Emergency contact phone is required'),
  allergiesInput: z.string().optional(), // comma-separated
  historyInput: z.string().optional(), // comma-separated
});

type PatientFormValues = z.infer<typeof patientSchema>;

export const Patients: React.FC = () => {
  const { patients, fetchPatients, createPatient, isLoading, error } = usePatientStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedBlood, setSelectedBlood] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '',
      address: '',
      bloodGroup: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergiesInput: '',
      historyInput: '',
    }
  });

  const onSubmit = async (values: PatientFormValues) => {
    const allergies = values.allergiesInput 
      ? values.allergiesInput.split(',').map(item => item.trim()).filter(Boolean) 
      : [];
    const medicalHistory = values.historyInput 
      ? values.historyInput.split(',').map(item => item.trim()).filter(Boolean) 
      : [];

    const success = await createPatient({
      name: values.name,
      email: values.email,
      phone: values.phone,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      address: values.address,
      bloodGroup: values.bloodGroup,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone,
      allergies,
      medicalHistory,
    });

    if (success) {
      reset();
      setShowAddModal(false);
    }
  };

  // Filter patients based on user controls
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    const matchesGender = selectedGender === 'all' || patient.gender === selectedGender;
    const matchesBlood = selectedBlood === 'all' || patient.bloodGroup.toUpperCase() === selectedBlood.toUpperCase();

    return matchesSearch && matchesGender && matchesBlood;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Patients Registry</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Search, filter, and register new patients in the clinical database</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow shadow-blue-500/10 transition select-none"
        >
          <Plus className="h-4 w-4" />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Control panel: search & filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition"
              placeholder="Search by name, email, or telephone..."
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold select-none">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Gender Switcher */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* Blood Type Switcher */}
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

        </div>
      </div>

      {/* Patients Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Retrieving patient directories...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-400 mb-4 border border-slate-200 dark:border-slate-800">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">No patients found</h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-sm">
              We couldn't find any records matching your search or filters. Try adjusting your parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500 select-none">
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Birth & Gender</th>
                  <th className="py-3.5 px-6">Blood Type</th>
                  <th className="py-3.5 px-6">Last Logged Vitals</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredPatients.map((patient) => {
                  const lastVitals = patient.vitals[0];
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 cursor-pointer transition group"
                    >
                      {/* Name Card */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold text-sm">
                            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {patient.name}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              ID: {patient.id.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-700 dark:text-slate-300">{patient.email}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{patient.phone}</p>
                      </td>

                      {/* DOB & Gender */}
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-700 dark:text-slate-300">{patient.dateOfBirth}</p>
                        <span className="inline-block text-[10px] text-slate-400 dark:text-slate-500">
                          {patient.gender}
                        </span>
                      </td>

                      {/* Blood Group */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/20 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30">
                          {patient.bloodGroup}
                        </span>
                      </td>

                      {/* Last Vitals */}
                      <td className="py-4 px-6">
                        {lastVitals ? (
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              {lastVitals.bloodPressure} <span className="text-[10px] text-slate-400">BP</span>
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              Pulse: {lastVitals.heartRate} bpm | Temp: {lastVitals.temperature}°F
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No vitals logged</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition">
                          <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 transition-all animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">Register New Patient</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Create a clinical file profile. All fields marked with * are required.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="e.g. John Doe"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="john.doe@email.com"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telephone Number *</label>
                  <input
                    type="text"
                    {...register('phone')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="e.g. 555-1234"
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group *</label>
                  <input
                    type="text"
                    {...register('bloodGroup')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.bloodGroup ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="e.g. O+, AB-"
                  />
                  {errors.bloodGroup && <p className="text-[10px] text-red-500 mt-1">{errors.bloodGroup.message}</p>}
                </div>
              </div>

              {/* Row 3: Gender & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Biological Gender *</label>
                  <select
                    {...register('gender')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.gender ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-[10px] text-red-500 mt-1">{errors.gender.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.dateOfBirth ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-[10px] text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
                </div>
              </div>

              {/* Row 4: Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address *</label>
                <input
                  type="text"
                  {...register('address')}
                  className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                    errors.address ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                  }`}
                  placeholder="Street name, City, Zipcode"
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address.message}</p>}
              </div>

              {/* Row 5: Emergency Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Name *</label>
                  <input
                    type="text"
                    {...register('emergencyContactName')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.emergencyContactName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="Full name of contact"
                  />
                  {errors.emergencyContactName && <p className="text-[10px] text-red-500 mt-1">{errors.emergencyContactName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Phone *</label>
                  <input
                    type="text"
                    {...register('emergencyContactPhone')}
                    className={`block w-full rounded-lg border bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white ${
                      errors.emergencyContactPhone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="Contact telephone"
                  />
                  {errors.emergencyContactPhone && <p className="text-[10px] text-red-500 mt-1">{errors.emergencyContactPhone.message}</p>}
                </div>
              </div>

              {/* Optional lists (comma-separated inputs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergies (comma separated)</label>
                  <input
                    type="text"
                    {...register('allergiesInput')}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="e.g. Peanuts, Aspirin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical History (comma separated)</label>
                  <input
                    type="text"
                    {...register('historyInput')}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                    placeholder="e.g. Asthma, Knee surgery"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Save Patient File'
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
export default Patients;

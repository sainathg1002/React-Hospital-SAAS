import React, { useEffect, useState } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { 
  Search, 
  Stethoscope, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Loader2 
} from 'lucide-react';

export const Doctors: React.FC = () => {
  const { doctors, fetchDoctors, isLoading } = useAppointmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Unique departments for filter list
  const departments = ['all', ...new Set(doctors.map(doc => doc.department))];

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' || doc.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Doctors Directory</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Access practitioner availability, credentials, and specialties across clinical wards</p>
      </div>

      {/* Control panel: search & filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors flex flex-col sm:flex-row items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="Search by physician name or clinical specialty..."
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-48 capitalize"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === 'all' ? 'All Departments' : dept}
            </option>
          ))}
        </select>

      </div>

      {/* Grid of Doctor Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Loading physician database...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-xl border border-slate-205 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Stethoscope className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No doctors found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Adjust your filters or query parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => (
            <div 
              key={doc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
            >
              {/* Photo Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="h-20 w-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                />
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" title="Active on shift"></span>
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 space-y-2 text-xs">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{doc.name}</h3>
                  <span className="inline-block mt-0.5 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[9px]">
                    {doc.specialty}
                  </span>
                </div>

                <div className="space-y-1 text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{doc.department}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 dark:border-slate-850 flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-350">
                    On-call: {doc.availability.join(', ')}
                  </span>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
export default Doctors;

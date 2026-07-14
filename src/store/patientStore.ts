import { create } from 'zustand';
import type { Patient, Vitals, MedicalRecord } from '@/types';

interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  fetchPatientById: (id: string) => Promise<void>;
  createPatient: (patientData: Omit<Patient, 'id' | 'vitals' | 'records'>) => Promise<boolean>;
  updatePatient: (patient: Patient) => Promise<boolean>;
  addVitals: (patientId: string, vitals: Omit<Vitals, 'id' | 'date'>) => Promise<boolean>;
  addMedicalRecord: (patientId: string, record: Omit<MedicalRecord, 'id' | 'date'>) => Promise<boolean>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  currentPatient: null,
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/patients');
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      set({ patients: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'An error occurred', isLoading: false });
    }
  },

  fetchPatientById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error('Patient not found');
      const data = await res.json();
      set({ currentPatient: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'An error occurred', isLoading: false });
    }
  },

  createPatient: async (patientData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patientData,
          vitals: [],
          records: [],
        }),
      });
      if (!res.ok) throw new Error('Failed to register patient');
      
      // Refresh patient list
      await get().fetchPatients();
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Failed to register patient', isLoading: false });
      return false;
    }
  },

  updatePatient: async (patient) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });
      if (!res.ok) throw new Error('Failed to update patient');
      const data = await res.json();
      
      // Update local state
      set((state) => ({
        patients: state.patients.map((p) => (p.id === patient.id ? data : p)),
        currentPatient: state.currentPatient?.id === patient.id ? data : state.currentPatient,
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Failed to update patient', isLoading: false });
      return false;
    }
  },

  addVitals: async (patientId, vitalsData) => {
    const patient = get().patients.find((p) => p.id === patientId) || get().currentPatient;
    if (!patient) {
      set({ error: 'Patient not loaded' });
      return false;
    }

    const newVital: Vitals = {
      ...vitalsData,
      id: `v-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedPatient: Patient = {
      ...patient,
      vitals: [newVital, ...patient.vitals],
    };

    return get().updatePatient(updatedPatient);
  },

  addMedicalRecord: async (patientId, recordData) => {
    const patient = get().patients.find((p) => p.id === patientId) || get().currentPatient;
    if (!patient) {
      set({ error: 'Patient not loaded' });
      return false;
    }

    const newRecord: MedicalRecord = {
      ...recordData,
      id: `r-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedPatient: Patient = {
      ...patient,
      records: [newRecord, ...patient.records],
    };

    return get().updatePatient(updatedPatient);
  },
}));

import { create } from 'zustand';
import type { Appointment, Doctor } from '@/types';

interface AppointmentState {
  appointments: Appointment[];
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  fetchDoctors: () => Promise<void>;
  createAppointment: (apptData: Omit<Appointment, 'id'>) => Promise<boolean>;
  updateAppointment: (appt: Appointment) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<boolean>;
  completeAppointment: (id: string) => Promise<boolean>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  doctors: [],
  isLoading: false,
  error: null,

  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      set({ appointments: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'An error occurred', isLoading: false });
    }
  },

  fetchDoctors: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/doctors');
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      set({ doctors: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'An error occurred', isLoading: false });
    }
  },

  createAppointment: async (apptData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptData),
      });
      if (!res.ok) throw new Error('Failed to book appointment');
      
      await get().fetchAppointments();
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Failed to book appointment', isLoading: false });
      return false;
    }
  },

  updateAppointment: async (appt) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/appointments/${appt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appt),
      });
      if (!res.ok) throw new Error('Failed to update appointment');
      const data = await res.json();

      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === appt.id ? data : a)),
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Failed to update appointment', isLoading: false });
      return false;
    }
  },

  cancelAppointment: async (id) => {
    const appt = get().appointments.find((a) => a.id === id);
    if (!appt) {
      set({ error: 'Appointment not found' });
      return false;
    }
    const updated = { ...appt, status: 'cancelled' as const };
    return get().updateAppointment(updated);
  },

  completeAppointment: async (id) => {
    const appt = get().appointments.find((a) => a.id === id);
    if (!appt) {
      set({ error: 'Appointment not found' });
      return false;
    }
    const updated = { ...appt, status: 'completed' as const };
    return get().updateAppointment(updated);
  },
}));

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '@/components/layout/Layout';

// Pages
import { Login } from '@/pages/auth/Login';
import { Unauthorized } from '@/pages/auth/Unauthorized';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Patients } from '@/pages/patients/Patients';
import { PatientProfile } from '@/pages/patients/PatientProfile';
import { Appointments } from '@/pages/appointments/Appointments';
import { Doctors } from '@/pages/doctors/Doctors';
import { Billing } from '@/pages/billing/Billing';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Default Route redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard for all logged-in users */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Patients: restricted to admin, doctor, nurse, receptionist */}
        <Route
          path="patients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
              <Patients />
            </ProtectedRoute>
          }
        />

        {/* Patient Profile: patients can see their own profile; staff can see any */}
        <Route path="patients/:id" element={<PatientProfile />} />

        {/* Appointments: all roles have access but see different scopes */}
        <Route path="appointments" element={<Appointments />} />

        {/* Doctors Directory: restricted to staff */}
        <Route
          path="doctors"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
              <Doctors />
            </ProtectedRoute>
          }
        />

        {/* Billing & Invoices: restricted to admin, receptionist, and patient */}
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
              <Billing />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default AppRoutes;

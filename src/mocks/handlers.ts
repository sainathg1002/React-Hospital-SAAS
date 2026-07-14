import { http, HttpResponse } from 'msw';
import { db } from './db';
import type { Patient, Appointment, Invoice } from '@/types';

export const handlers = [
  // Patient CRUD
  http.get('/api/patients', () => {
    return HttpResponse.json(db.getPatients());
  }),

  http.get('/api/patients/:id', ({ params }) => {
    const { id } = params;
    const patient = db.getPatientById(id as string);
    if (!patient) {
      return new HttpResponse('Patient not found', { status: 404 });
    }
    return HttpResponse.json(patient);
  }),

  http.post('/api/patients', async ({ request }) => {
    const body = (await request.json()) as Omit<Patient, 'id'>;
    const newPatient: Patient = {
      ...body,
      id: `pat-${Date.now().toString().slice(-4)}`,
      vitals: body.vitals || [],
      records: body.records || [],
    };
    db.upsertPatient(newPatient);
    
    // Log activity
    db.addActivityLog({
      userId: 'usr-sys',
      userName: 'HMS Portal',
      action: 'PATIENT_CREATE',
      details: `Registered new patient: ${newPatient.name}`,
    });

    return HttpResponse.json(newPatient, { status: 201 });
  }),

  http.put('/api/patients/:id', async ({ params, request }) => {
    const { id } = params;
    const existing = db.getPatientById(id as string);
    if (!existing) {
      return new HttpResponse('Patient not found', { status: 404 });
    }
    const body = (await request.json()) as Patient;
    const updatedPatient: Patient = {
      ...body,
      id: id as string, // ensure ID stays consistent
    };
    db.upsertPatient(updatedPatient);

    // Log activity
    db.addActivityLog({
      userId: 'usr-sys',
      userName: 'HMS Portal',
      action: 'PATIENT_UPDATE',
      details: `Updated info for patient: ${updatedPatient.name}`,
    });

    return HttpResponse.json(updatedPatient);
  }),

  // Appointments CRUD
  http.get('/api/appointments', () => {
    return HttpResponse.json(db.getAppointments());
  }),

  http.post('/api/appointments', async ({ request }) => {
    const body = (await request.json()) as Omit<Appointment, 'id'>;
    const newAppt: Appointment = {
      ...body,
      id: `appt-${Date.now().toString().slice(-4)}`,
    };
    db.upsertAppointment(newAppt);

    // Log activity
    db.addActivityLog({
      userId: 'usr-sys',
      userName: 'HMS Portal',
      action: 'APPT_SCHEDULE',
      details: `Scheduled appointment for ${newAppt.patientName} with ${newAppt.doctorName}`,
    });

    return HttpResponse.json(newAppt, { status: 201 });
  }),

  http.put('/api/appointments/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Appointment;
    const updatedAppt: Appointment = {
      ...body,
      id: id as string,
    };
    db.upsertAppointment(updatedAppt);

    // Log activity
    db.addActivityLog({
      userId: 'usr-sys',
      userName: 'HMS Portal',
      action: 'APPT_UPDATE',
      details: `Updated appointment status to '${updatedAppt.status}' for ${updatedAppt.patientName}`,
    });

    return HttpResponse.json(updatedAppt);
  }),

  // Doctors
  http.get('/api/doctors', () => {
    return HttpResponse.json(db.getDoctors());
  }),

  // Billing
  http.get('/api/invoices', () => {
    return HttpResponse.json(db.getInvoices());
  }),

  http.post('/api/invoices', async ({ request }) => {
    const body = (await request.json()) as Omit<Invoice, 'id'>;
    const newInvoice: Invoice = {
      ...body,
      id: `inv-${Date.now().toString().slice(-4)}`,
    };
    db.upsertInvoice(newInvoice);

    db.addActivityLog({
      userId: 'usr-sys',
      userName: 'HMS Portal',
      action: 'BILLING_CREATE',
      details: `Generated invoice ${newInvoice.id} for ${newInvoice.patientName} - $${newInvoice.amount}`,
    });

    return HttpResponse.json(newInvoice, { status: 201 });
  }),

  // Activity Logs
  http.get('/api/logs', () => {
    return HttpResponse.json(db.getActivityLogs());
  }),
];

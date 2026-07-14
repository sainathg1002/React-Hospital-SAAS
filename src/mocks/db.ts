import type { Patient, Doctor, Appointment, Invoice, ActivityLog } from '@/types';

// Seed Initial Doctors
const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Priya Patel',
    email: 'p.patel@hospital.com',
    phone: '98220-19900',
    specialty: 'Cardiologist',
    department: 'Heart & Vascular Clinic',
    availability: ['Monday', 'Wednesday', 'Friday'],
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Sharma',
    email: 'r.sharma@hospital.com',
    phone: '98450-10200',
    specialty: 'Diagnostic Medicine',
    department: 'Internal Medicine',
    availability: ['Tuesday', 'Thursday'],
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-3',
    name: 'Dr. Aditi Desai',
    email: 'a.desai@hospital.com',
    phone: '98920-14400',
    specialty: 'General Surgeon',
    department: 'Surgery Division',
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Malhotra',
    email: 'v.malhotra@hospital.com',
    phone: '98110-17700',
    specialty: 'Neurosurgeon',
    department: 'Neurology Department',
    availability: ['Wednesday', 'Thursday'],
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
  },
];

// Seed Initial Patients
const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Aarav Mehta',
    email: 'patient@hospital.com', // linked to patient portal demo
    phone: '98199-01939',
    gender: 'Male',
    dateOfBirth: '1980-02-19',
    address: '1007, Lodha Altamount, Altamount Road, Mumbai',
    bloodGroup: 'O-',
    emergencyContactName: 'Rajesh Mehta',
    emergencyContactPhone: '98199-00001',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    medicalHistory: ['Fractured Ribs (2024)', 'Concussion (2025)', 'Chronic Fatigue'],
    vitals: [
      { id: 'v-1', date: '2026-07-10', bloodPressure: '118/76', heartRate: 64, temperature: 98.4, spo2: 99, weight: 85, height: 180 },
      { id: 'v-2', date: '2026-06-05', bloodPressure: '122/80', heartRate: 68, temperature: 98.6, spo2: 98, weight: 86, height: 180 },
    ],
    records: [
      { id: 'r-1', date: '2026-07-10', diagnosis: 'Mild Exhaustion & Sleep Deprivation', treatment: 'Prescribed rest, hydration and multivitamins.', notes: 'Patient exhibits high stress levels. Advised reduction in late night work schedules.', doctorName: 'Dr. Rajesh Sharma' },
      { id: 'r-2', date: '2026-06-05', diagnosis: 'Rib Cage Soft Tissue Contusion', treatment: 'Pain management and hot fomentation.', notes: 'Injury occurred during cricket. Advised to avoid heavy impact sports for 3 weeks.', doctorName: 'Dr. Aditi Desai' },
    ]
  },
  {
    id: 'pat-2',
    name: 'Devendra Kulkarni',
    email: 'd.kulkarni@express.com',
    phone: '98330-19380',
    gender: 'Male',
    dateOfBirth: '1985-06-18',
    address: '344, Prabhat Road, Deccan, Pune',
    bloodGroup: 'A+',
    emergencyContactName: 'Sunita Kulkarni',
    emergencyContactPhone: '98330-02940',
    allergies: ['Dust Mites (Severe)'],
    medicalHistory: ['None reported'],
    vitals: [
      { id: 'v-3', date: '2026-07-12', bloodPressure: '110/70', heartRate: 58, temperature: 98.2, spo2: 100, weight: 78, height: 176 }
    ],
    records: [
      { id: 'r-3', date: '2026-07-12', diagnosis: 'Routine Health Clearance', treatment: 'Annual physical examination completed. All parameters within normal ranges.', doctorName: 'Dr. Priya Patel' }
    ]
  },
  {
    id: 'pat-3',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@bugle.in',
    phone: '98120-19620',
    gender: 'Male',
    dateOfBirth: '2001-08-10',
    address: '20, Rajouri Garden, New Delhi',
    bloodGroup: 'O+',
    emergencyContactName: 'Mayank Sharma',
    emergencyContactPhone: '98120-88220',
    allergies: ['Pollen'],
    medicalHistory: ['Anemia (2023)', 'Ligament Tear (2024)'],
    vitals: [
      { id: 'v-4', date: '2026-07-01', bloodPressure: '115/72', heartRate: 72, temperature: 98.6, spo2: 99, weight: 70, height: 175 }
    ],
    records: [
      { id: 'r-4', date: '2026-07-01', diagnosis: 'Dehydration & Low Blood Sugar', treatment: 'IV Fluids administered, recommended high calorie diet.', doctorName: 'Dr. Rajesh Sharma' }
    ]
  },
  {
    id: 'pat-4',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@cats.org',
    phone: '98440-90090',
    gender: 'Female',
    dateOfBirth: '1988-10-02',
    address: 'Flat 4B, Harrington Road, Chetpet, Chennai',
    bloodGroup: 'AB-',
    emergencyContactName: 'Ranganathan Iyer',
    emergencyContactPhone: '98440-90100',
    allergies: ['Sulfa Drugs'],
    medicalHistory: ['Wrist sprain (2025)'],
    vitals: [
      { id: 'v-5', date: '2026-07-08', bloodPressure: '110/68', heartRate: 60, temperature: 98.4, spo2: 99, weight: 55, height: 162 }
    ],
    records: [
      { id: 'r-5', date: '2026-07-08', diagnosis: 'Acute Wrist Sprain', treatment: 'Compression wrapping, NSAIDs prescribed for 5 days.', doctorName: 'Dr. Aditi Desai' }
    ]
  }
];

// Seed Initial Appointments
const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'pat-1',
    patientName: 'Aarav Mehta',
    doctorId: 'doc-2',
    doctorName: 'Dr. Rajesh Sharma',
    date: '2026-07-15',
    time: '10:30',
    status: 'scheduled',
    reason: 'Follow-up on chronic fatigue and sleep analysis.',
  },
  {
    id: 'appt-2',
    patientId: 'pat-2',
    patientName: 'Devendra Kulkarni',
    doctorId: 'doc-1',
    doctorName: 'Dr. Priya Patel',
    date: '2026-07-16',
    time: '14:00',
    status: 'scheduled',
    reason: 'Executive cardiovascular physical examination.',
  },
  {
    id: 'appt-3',
    patientId: 'pat-3',
    patientName: 'Rohan Sharma',
    doctorId: 'doc-3',
    doctorName: 'Dr. Aditi Desai',
    date: '2026-07-14',
    time: '09:00',
    status: 'completed',
    reason: 'Stitch removal checkup and blood panel.',
  },
];

// Seed Initial Invoices (INR)
const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    patientId: 'pat-1',
    patientName: 'Aarav Mehta',
    date: '2026-07-10',
    dueDate: '2026-07-24',
    amount: 3200,
    status: 'paid',
    items: [
      { description: 'Specialist Consultation (Diagnostics)', quantity: 1, unitPrice: 1500, total: 1500 },
      { description: 'Blood Panel & Metabolic Screen', quantity: 1, unitPrice: 1200, total: 1200 },
      { description: 'Prescription Multi-Vitamins', quantity: 1, unitPrice: 500, total: 500 },
    ],
  },
  {
    id: 'inv-2',
    patientId: 'pat-4',
    patientName: 'Ananya Iyer',
    date: '2026-07-08',
    dueDate: '2026-07-22',
    amount: 5800,
    status: 'unpaid',
    items: [
      { description: 'Minor Surgery Consultation', quantity: 1, unitPrice: 3500, total: 3500 },
      { description: 'X-Ray (Right Wrist)', quantity: 1, unitPrice: 1800, total: 1800 },
      { description: 'Elastic Wrist Splint Support', quantity: 1, unitPrice: 500, total: 500 },
    ],
  },
  {
    id: 'inv-3',
    patientId: 'pat-3',
    patientName: 'Rohan Sharma',
    date: '2026-06-25',
    dueDate: '2026-07-09',
    amount: 850,
    status: 'overdue',
    items: [
      { description: 'General Practice Evaluation', quantity: 1, unitPrice: 850, total: 850 },
    ],
  },
];

// Seed Initial Activity Logs
const DEFAULT_LOGS: ActivityLog[] = [
  { id: 'log-1', timestamp: '2026-07-14T10:15:00Z', userId: 'usr-admin-1', userName: 'Dr. Rajesh Sharma', action: 'PATIENT_CREATE', details: 'Added new patient Devendra Kulkarni' },
  { id: 'log-2', timestamp: '2026-07-14T11:20:00Z', userId: 'usr-recep-1', userName: 'Amit Kumar', action: 'APPT_SCHEDULE', details: 'Scheduled appointment for Ananya Iyer' },
  { id: 'log-3', timestamp: '2026-07-14T12:05:00Z', userId: 'usr-doctor-1', userName: 'Dr. Priya Patel', action: 'RECORD_ADD', details: 'Added medical record diagnosis for Aarav Mehta' },
];

class MockDB {
  private get<T>(key: string, defaults: T[]): T[] {
    const data = localStorage.getItem(`hms_db_${key}`);
    if (!data) {
      localStorage.setItem(`hms_db_${key}`, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(`hms_db_${key}`, JSON.stringify(data));
  }

  // Patients
  getPatients(): Patient[] {
    return this.get<Patient>('patients', DEFAULT_PATIENTS);
  }

  savePatients(patients: Patient[]): void {
    this.set<Patient>('patients', patients);
  }

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find((p) => p.id === id);
  }

  upsertPatient(patient: Patient): void {
    const patients = this.getPatients();
    const index = patients.findIndex((p) => p.id === patient.id);
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.push(patient);
    }
    this.savePatients(patients);
  }

  // Doctors
  getDoctors(): Doctor[] {
    return this.get<Doctor>('doctors', DEFAULT_DOCTORS);
  }

  // Appointments
  getAppointments(): Appointment[] {
    return this.get<Appointment>('appointments', DEFAULT_APPOINTMENTS);
  }

  saveAppointments(appts: Appointment[]): void {
    this.set<Appointment>('appointments', appts);
  }

  upsertAppointment(appt: Appointment): void {
    const appts = this.getAppointments();
    const index = appts.findIndex((a) => a.id === appt.id);
    if (index >= 0) {
      appts[index] = appt;
    } else {
      appts.push(appt);
    }
    this.saveAppointments(appts);
  }

  // Invoices
  getInvoices(): Invoice[] {
    return this.get<Invoice>('invoices', DEFAULT_INVOICES);
  }

  saveInvoices(invoices: Invoice[]): void {
    this.set<Invoice>('invoices', invoices);
  }

  upsertInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
    } else {
      invoices.push(invoice);
    }
    this.saveInvoices(invoices);
  }

  // Logs
  getActivityLogs(): ActivityLog[] {
    return this.get<ActivityLog>('logs', DEFAULT_LOGS);
  }

  addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.get<ActivityLog>('logs', DEFAULT_LOGS);
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.set<ActivityLog>('logs', logs);
  }
}

export const db = new MockDB();

export type Role = 'admin' | 'staff' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  active: boolean;
  professionalIds: string[];
}

export interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  workingHours?: unknown;
  active: boolean;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  serviceId: string;
  professionalId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number;
  price: number;
  status: AppointmentStatus;
  userId: string;
  createdAt?: number;
  notes?: string;
}

export interface Unsubscribe {
  (): void;
}

export interface AuthBackend {
  onAuthStateChanged: (cb: (user: UserProfile | null) => void) => Unsubscribe;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  getCurrentUser: () => UserProfile | null;
  ensureUserDoc: (role?: Role) => Promise<void>;
}

export interface BookingBackend {
  subscribeServices: (cb: (services: Service[]) => void) => Unsubscribe;
  subscribeProfessionals: (cb: (professionals: Professional[]) => void) => Unsubscribe;
  subscribeAppointments: (
    user: UserProfile | null,
    cb: (appointments: Appointment[]) => void
  ) => Unsubscribe;
  // Services CRUD
  addService: (service: Service) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  // Professionals CRUD
  addProfessional: (professional: Professional) => Promise<void>;
  updateProfessional: (id: string, data: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  createAppointment: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'userId' | 'status'> & { status?: AppointmentStatus },
    userId: string
  ) => Promise<string>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export interface Backend {
  auth: AuthBackend;
  booking: BookingBackend;
}



import { Appointment, AppointmentStatus, AuthBackend, Backend, BookingBackend, Professional, Role, Service, Unsubscribe, UserProfile } from './Backend';

const STORAGE_KEYS = {
  users: 'local.users',
  currentUserId: 'local.currentUserId',
  services: 'local.services',
  professionals: 'local.professionals',
  appointments: 'local.appointments',
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const rnd = g.crypto && typeof g.crypto.randomUUID === 'function' ? g.crypto.randomUUID() : null;
  if (rnd) return rnd as string;
  return Math.random().toString(36).slice(2);
}

class LocalAuth implements AuthBackend {
  private listeners: Array<(u: UserProfile | null) => void> = [];

  private notify() {
    const user = this.getCurrentUser();
    this.listeners.forEach(l => l(user));
  }

  onAuthStateChanged(cb: (user: UserProfile | null) => void): Unsubscribe {
    this.listeners.push(cb);
    cb(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  async signIn(email: string, _password: string): Promise<UserProfile> {
    const users = readJson<Record<string, UserProfile & { password?: string }>>(STORAGE_KEYS.users, {});
    const match = Object.values(users).find(u => u.email === email);
    if (!match) throw new Error('Usuário não encontrado');
    writeJson(STORAGE_KEYS.currentUserId, match.id);
    this.notify();
    return { id: match.id, email: match.email, role: match.role };
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    this.notify();
  }

  getCurrentUser(): UserProfile | null {
    const id = readJson<string | null>(STORAGE_KEYS.currentUserId, null);
    if (!id) return null;
    const users = readJson<Record<string, UserProfile>>(STORAGE_KEYS.users, {});
    return users[id] || null;
  }

  async ensureUserDoc(_role: Role = 'user'): Promise<void> {}
}

class LocalBooking implements BookingBackend {
  private servicesListeners: Array<(items: Service[]) => void> = [];
  private professionalsListeners: Array<(items: Professional[]) => void> = [];
  private appointmentsListeners: Array<(items: Appointment[]) => void> = [];

  private notifyServices() {
    const items = readJson<Service[]>(STORAGE_KEYS.services, []);
    this.servicesListeners.forEach(l => l(items));
  }
  private notifyProfessionals() {
    const items = readJson<Professional[]>(STORAGE_KEYS.professionals, []);
    this.professionalsListeners.forEach(l => l(items));
  }
  private notifyAppointments() {
    const items = readJson<Appointment[]>(STORAGE_KEYS.appointments, []);
    this.appointmentsListeners.forEach(l => l(items));
  }

  subscribeServices(cb: (services: Service[]) => void): Unsubscribe {
    this.servicesListeners.push(cb);
    cb(readJson<Service[]>(STORAGE_KEYS.services, []));
    return () => {
      this.servicesListeners = this.servicesListeners.filter(l => l !== cb);
    };
  }
  subscribeProfessionals(cb: (professionals: Professional[]) => void): Unsubscribe {
    this.professionalsListeners.push(cb);
    cb(readJson<Professional[]>(STORAGE_KEYS.professionals, []));
    return () => {
      this.professionalsListeners = this.professionalsListeners.filter(l => l !== cb);
    };
  }
  subscribeAppointments(user: UserProfile | null, cb: (appointments: Appointment[]) => void): Unsubscribe {
    this.appointmentsListeners.push(cb);
    const items = readJson<Appointment[]>(STORAGE_KEYS.appointments, []);
    cb(this.filterByUser(items, user));
    return () => {
      this.appointmentsListeners = this.appointmentsListeners.filter(l => l !== cb);
    };
  }

  private filterByUser(items: Appointment[], user: UserProfile | null) {
    if (user && user.role !== 'admin') return items.filter(i => i.userId === user.id);
    return items;
  }

  async addService(service: Service): Promise<void> {
    const items = readJson<Service[]>(STORAGE_KEYS.services, []);
    const exists = items.some(s => s.id === service.id);
    const list = exists ? items.map(s => (s.id === service.id ? service : s)) : [...items, service];
    writeJson(STORAGE_KEYS.services, list);
    this.notifyServices();
  }

  async updateService(service: Service): Promise<void> {
    const items = readJson<Service[]>(STORAGE_KEYS.services, []);
    writeJson(STORAGE_KEYS.services, items.map(s => (s.id === service.id ? service : s)));
    this.notifyServices();
  }

  async deleteService(id: string): Promise<void> {
    const items = readJson<Service[]>(STORAGE_KEYS.services, []);
    writeJson(STORAGE_KEYS.services, items.filter(s => s.id !== id));
    this.notifyServices();
  }

  async addProfessional(professional: Professional): Promise<void> {
    const items = readJson<Professional[]>(STORAGE_KEYS.professionals, []);
    const exists = items.some(p => p.id === professional.id);
    const list = exists ? items.map(p => (p.id === professional.id ? professional : p)) : [...items, professional];
    writeJson(STORAGE_KEYS.professionals, list);
    this.notifyProfessionals();
  }

  async updateProfessional(id: string, data: Partial<Professional>): Promise<void> {
    const items = readJson<Professional[]>(STORAGE_KEYS.professionals, []);
    writeJson(
      STORAGE_KEYS.professionals,
      items.map(p => (p.id === id ? { ...p, ...data } : p))
    );
    this.notifyProfessionals();
  }

  async deleteProfessional(id: string): Promise<void> {
    const items = readJson<Professional[]>(STORAGE_KEYS.professionals, []);
    writeJson(STORAGE_KEYS.professionals, items.filter(p => p.id !== id));
    this.notifyProfessionals();
  }

  async createAppointment(
    data: Omit<Appointment, 'id' | 'createdAt' | 'userId' | 'status'> & { status?: AppointmentStatus },
    userId: string
  ): Promise<string> {
    const items = readJson<Appointment[]>(STORAGE_KEYS.appointments, []);
    const id = generateId();
    const record: Appointment = {
      ...data,
      id,
      status: data.status || 'scheduled',
      userId,
      createdAt: Date.now(),
    } as Appointment;
    items.push(record);
    writeJson(STORAGE_KEYS.appointments, items);
    this.notifyAppointments();
    return id;
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<void> {
    const items = readJson<Appointment[]>(STORAGE_KEYS.appointments, []);
    const idx = items.findIndex(i => i.id === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...data } as Appointment;
      writeJson(STORAGE_KEYS.appointments, items);
      this.notifyAppointments();
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    const items = readJson<Appointment[]>(STORAGE_KEYS.appointments, []);
    writeJson(STORAGE_KEYS.appointments, items.filter(i => i.id !== id));
    this.notifyAppointments();
  }
}

export function createLocalBackend(): Backend {
  const auth = new LocalAuth();
  const booking = new LocalBooking();

  // No seeding

  return { auth, booking };
}



import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getBackend } from '../backend';

export interface Service {
  professionalIds: any;
  description: ReactNode;
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  active: boolean;
}

export interface Professional {
  phone: ReactNode;
  workingHours: any;
  email: ReactNode;
  id: string;
  name: string;
  specialty?: string;
  active: boolean;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  notes: any;
  id: string;
  serviceId: string;
  professionalId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  price: number;
  status: AppointmentStatus;
  userId: string; // who created/booked
  createdAt?: any;
}

interface BookingState {
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: string | null;
  selectedTime: string | null;
  clientInfo: { name: string; phone: string } | null;
}

interface BookingContextType {
  appointments: Appointment[];
  services: Service[];
  professionals: Professional[];
  addProfessional: (data: Professional) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'userId' | 'status'> & { status?: AppointmentStatus }) => Promise<string>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addService: (service: Service) => void; // <-- Add this line
  updateService: (service: Service) => void; // <-- Add if needed
  deleteService: (id: string) => void;
  // Booking flow
  bookingState: BookingState;
  setSelectedService: (s: Service | null) => void;
  setSelectedProfessional: (p: Professional | null) => void;
  setSelectedDate: (d: string | null) => void;
  setSelectedTime: (t: string | null) => void;
  setClientInfo: (info: { name: string; phone: string } | null) => void;
  addAppointment: (appointment: Appointment) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within <BookingProvider />');
  return ctx;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    const backend = getBackend();
    const unsub1 = backend.booking.subscribeServices(items => setServices(items));
    const unsub2 = backend.booking.subscribeProfessionals(items => setProfessionals(items));
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    const backend = getBackend();
    const unsub = backend.booking.subscribeAppointments(user, items => setAppointments(items));
    return () => unsub();
  }, [user?.id, user?.role]);

  const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'userId' | 'status'> & { status?: AppointmentStatus }) => {
    const backend = getBackend();
    const userId = user?.id || 'public';
    const id = await backend.booking.createAppointment(data, userId);
    return id;
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const backend = getBackend();
    await backend.booking.updateAppointment(id, data);
  };

  const deleteAppointment = async (id: string) => {
    const backend = getBackend();
    await backend.booking.deleteAppointment(id);
  };

  const [bookingState, setBookingState] = useState<BookingState>({
    selectedService: null,
    selectedProfessional: null,
    selectedDate: null,
    selectedTime: null,
    clientInfo: null,
  });

  const setSelectedService = (s: Service | null) => setBookingState(prev => ({ ...prev, selectedService: s }));
  const setSelectedProfessional = (p: Professional | null) => setBookingState(prev => ({ ...prev, selectedProfessional: p }));
  const setSelectedDate = (d: string | null) => setBookingState(prev => ({ ...prev, selectedDate: d }));
  const setSelectedTime = (t: string | null) => setBookingState(prev => ({ ...prev, selectedTime: t }));
  const setClientInfo = (info: { name: string; phone: string } | null) => setBookingState(prev => ({ ...prev, clientInfo: info }));
  const resetBooking = () => setBookingState({ selectedService: null, selectedProfessional: null, selectedDate: null, selectedTime: null, clientInfo: null });

  const addService = (service: Service) => {
    const backend = getBackend();
    backend.booking.addService(service);
  };
  const updateService = (service: Service) => {
    const backend = getBackend();
    backend.booking.updateService(service);
  };
  const deleteService = (id: string) => {
    const backend = getBackend();
    backend.booking.deleteService(id);
  };

  const value = useMemo<BookingContextType>(() => ({
    appointments, services, professionals, addAppointment: createAppointment,
    createAppointment, updateAppointment, deleteAppointment, addService, updateService, deleteService,
    addProfessional: (data: Professional) => { const b = getBackend(); b.booking.addProfessional(data); },
    updateProfessional: (id: string, data: Partial<Professional>) => { const b = getBackend(); b.booking.updateProfessional(id, data); },
    deleteProfessional: (id: string) => { const b = getBackend(); b.booking.deleteProfessional(id); },
    bookingState,
    setSelectedService, setSelectedProfessional, setSelectedDate, setSelectedTime, setClientInfo, resetBooking,
  }), [appointments, services, professionals, bookingState]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

import React, { useState } from 'react';
import { Check, ArrowLeft, Clock, DollarSign, User } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import { useSalon } from '../contexts/SalonContext';
import type { Service, Professional } from '../contexts/BookingContext';

const PublicBooking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const { salonConfig } = useSalon();

  const {
    services,
    professionals,
    appointments,
    bookingState,
    setSelectedService,
    setSelectedProfessional,
    setSelectedDate,
    setSelectedTime,
    setClientInfo,
    addAppointment,
    resetBooking
  } = useBooking();


  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setCurrentStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(4);
  };

  const handleClientInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const clientInfo = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string
    };
    
    setClientInfo(clientInfo);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create appointment
    if (bookingState.selectedService && bookingState.selectedProfessional && 
        bookingState.selectedDate && bookingState.selectedTime) {
      addAppointment({
        serviceId: bookingState.selectedService.id,
        professionalId: bookingState.selectedProfessional.id,
        clientName: clientInfo.name,
        clientPhone: clientInfo.phone,
        date: bookingState.selectedDate,
        time: bookingState.selectedTime,
        duration: bookingState.selectedService.duration,
        price: bookingState.selectedService.price,
        status: 'scheduled',
        id: '',
        userId: '',
        notes: undefined
      });
    }

    setIsSubmitting(false);
    setBookingComplete(true);
  };

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    // Se um profissional específico foi selecionado e uma data foi escolhida,
    // 1) limitar pela jornada (start/end) e intervalos (breaks) do dia
    // 2) remover horários já ocupados (status != 'cancelled')
    const selectedPro = bookingState.selectedProfessional;
    const selectedDate = bookingState.selectedDate;
    const selectedService = bookingState.selectedService;
    if (selectedPro && selectedPro.id !== 'any' && selectedDate) {
      const day = new Date(selectedDate).getDay();
      // Mapeamento correto: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
      const map: Record<number, string> = { 
        0: 'sunday', 
        1: 'monday', 
        2: 'tuesday', 
        3: 'wednesday', 
        4: 'thursday', 
        5: 'friday', 
        6: 'saturday' 
      };
      const key = map[day];
      const schedule: any = (selectedPro as any).workingHours?.[key];
      if (!schedule) return [];

      const startMin = toMinutes(schedule.start);
      const endMin = toMinutes(schedule.end);
      const breaks: Array<{ start: string; end: string }> = schedule.breaks || [];
      const duration = selectedService?.duration || 0;

      const withinJornada = (t: string) => {
        const m = toMinutes(t);
        const endOfService = m + duration;
        return m >= startMin && endOfService <= endMin;
      };
      const inBreak = (t: string) => {
        const m = toMinutes(t);
        const endOfService = m + duration;
        return breaks.some(b => {
          const bs = toMinutes(b.start);
          const be = toMinutes(b.end);
          return Math.max(m, bs) < Math.min(endOfService, be);
        });
      };

      const bookedTimes = new Set(
        appointments
          .filter(a => a.professionalId === selectedPro.id && a.date === selectedDate && a.status !== 'cancelled')
          .map(a => a.time)
      );

      return slots.filter(t => withinJornada(t) && !inBreak(t) && !bookedTimes.has(t));
    }
    return slots;
  };

  const getNextDays = (days: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const resetAndRestart = () => {
    resetBooking();
    setCurrentStep(1);
    setBookingComplete(false);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agendamento Confirmado!</h2>
            <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium">{bookingState.selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-medium">{bookingState.selectedProfessional?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {bookingState.selectedDate ? new Date(bookingState.selectedDate).toLocaleDateString('pt-BR') : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">{bookingState.selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium">R$ {bookingState.selectedService?.price.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Você receberá uma confirmação em breve. Para alterações, entre em contato conosco.
            </p>
            <button
              onClick={resetAndRestart}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Salon Header */}
        <div className="mb-8 text-center">
          {salonConfig.logo && (
            <div className="mb-4">
              <img 
                src={salonConfig.logo} 
                alt={`Logo ${salonConfig.name}`}
                className="h-20 w-auto mx-auto object-contain"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{salonConfig.name}</h1>
          {salonConfig.description && (
            <p className="text-lg text-gray-600">{salonConfig.description}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-8 mt-2 text-sm text-gray-600">
            <span className={currentStep === 1 ? 'text-blue-600 font-medium' : ''}>Serviço</span>
            <span className={currentStep === 2 ? 'text-blue-600 font-medium' : ''}>Profissional</span>
            <span className={currentStep === 3 ? 'text-blue-600 font-medium' : ''}>Data/Hora</span>
            <span className={currentStep === 4 ? 'text-blue-600 font-medium' : ''}>Confirmação</span>
          </div>
        </div>

        {/* Mini resumo fixo acima do conteúdo (aparece após escolher serviço) */}
        {currentStep > 1 && (
          <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Serviço</span>
                <p className="font-medium">{bookingState.selectedService?.name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Profissional</span>
                <p className="font-medium">{bookingState.selectedProfessional?.name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Data</span>
                <p className="font-medium">{bookingState.selectedDate ? new Date(bookingState.selectedDate).toLocaleDateString('pt-BR') : '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Hora</span>
                <p className="font-medium">{bookingState.selectedTime || '—'}</p>
              </div>
              <div className="ml-auto">
                <span className="text-gray-500">Total</span>
                <p className="font-bold text-blue-600">{bookingState.selectedService ? `R$ ${bookingState.selectedService.price.toFixed(2)}` : '—'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha seu serviço</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.filter(service => service.active).map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                  >
                    <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} min
                      </div>
                      <div className="flex items-center text-blue-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        R$ {service.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Professional Selection */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button onClick={() => setCurrentStep(1)} className="mr-4 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Escolha o profissional</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => handleProfessionalSelect({ id: 'any', name: 'Qualquer profissional', email: '', phone: '', active: true, workingHours: {} })}
                  className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-lg">Qualquer profissional</h3>
                    <p className="text-sm text-gray-600">Disponível mais cedo</p>
                  </div>
                </div>
                {professionals
                  .filter(prof => prof.active && bookingState.selectedService?.professionalIds.includes(prof.id))
                  .map((professional) => (
                    <div
                      key={professional.id}
                      onClick={() => handleProfessionalSelect(professional)}
                      className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-blue-600 font-semibold text-xl">
                            {professional.name.charAt(0)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-sm text-gray-600">{professional.email}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button onClick={() => setCurrentStep(2)} className="mr-4 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Escolha data e horário</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h3 className="font-semibold mb-4">Selecione a data</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getNextDays(14).map((date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = bookingState.selectedDate === dateStr;
                      const isWeekend = date.getDay() === 0; // Sunday
                      
                      if (isWeekend) return null;
                      
                      // Debug: verificar o mapeamento dos dias
                      const dayOfWeek = date.getDay();
                      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      
                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleDateSelect(dateStr)}
                          className={`p-3 text-left rounded-lg border transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">
                            {date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {dayNames[dayOfWeek]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                {bookingState.selectedDate && (
                  <div>
                    <h3 className="font-semibold mb-4">Horários disponíveis</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                      {generateTimeSlots().map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className="p-2 text-sm border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Client Information */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button onClick={() => setCurrentStep(3)} className="mr-4 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Confirme seus dados</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Booking summary */}
                <div>
                  <h3 className="font-semibold mb-4">Resumo do agendamento</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Serviço</label>
                      <p className="font-medium">{bookingState.selectedService?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Profissional</label>
                      <p className="font-medium">{bookingState.selectedProfessional?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Data</label>
                      <p className="font-medium">
                        {bookingState.selectedDate ? 
                          new Date(bookingState.selectedDate).toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : ''
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Horário</label>
                      <p className="font-medium">{bookingState.selectedTime}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          R$ {bookingState.selectedService?.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client form */}
                <div>
                  <h3 className="font-semibold mb-4">Seus dados</h3>
                  <form onSubmit={handleClientInfoSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite seu nome"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(63) 99999-9999"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do agendamento</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Serviço</span>
                    <p className="font-medium text-gray-900">{bookingState.selectedService?.name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Profissional</span>
                    <p className="font-medium text-gray-900">{bookingState.selectedProfessional?.name || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Data</span>
                      <p className="font-medium text-gray-900">{bookingState.selectedDate ? new Date(bookingState.selectedDate).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Hora</span>
                      <p className="font-medium text-gray-900">{bookingState.selectedTime || '—'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-xl font-bold text-blue-600">{bookingState.selectedService ? `R$ ${bookingState.selectedService.price.toFixed(2)}` : '—'}</span>
                    </div>
                  </div>
                  {currentStep < 4 && bookingState.selectedService && bookingState.selectedProfessional && bookingState.selectedDate && bookingState.selectedTime && (
                    <button onClick={() => setCurrentStep(4)} className="w-full mt-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">Avançar para confirmação</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
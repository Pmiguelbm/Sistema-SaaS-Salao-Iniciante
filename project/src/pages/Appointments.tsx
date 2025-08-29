import React, { useState } from 'react';
import { Calendar, Plus, Search, Clock, User, Phone, DollarSign } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';

const Appointments: React.FC = () => {
  const { appointments, services, professionals, updateAppointment, deleteAppointment } = useBooking();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Serviço não encontrado';
  };

  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    return professional?.name || 'Profissional não encontrado';
  };

  const handleStatusChange = (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    updateAppointment(appointmentId, { status: newStatus });
  };

  const handleDelete = (appointmentId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      deleteAppointment(appointmentId);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.clientPhone.includes(searchTerm) ||
                         getServiceName(appointment.serviceId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = viewMode === 'calendar' ? appointment.date === selectedDate : true;
    
    return matchesStatus && matchesSearch && matchesDate;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600">Gerencie todos os agendamentos</p>
          </div>
          <button onClick={() => navigate('/booking')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </button>
        </div>

        {/* Filters and view toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="scheduled">Agendados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>

            {/* Date picker for calendar view */}
            {viewMode === 'calendar' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4 mr-1 inline" />
              Calendário
            </button>
          </div>
        </div>

        {/* Appointments list */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{appointment.clientName}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{appointment.clientPhone}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Serviço:</span>
                          <p className="font-medium">{getServiceName(appointment.serviceId)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Profissional:</span>
                          <p className="font-medium">{getProfessionalName(appointment.professionalId)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Data/Hora:</span>
                          <p className="font-medium">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duração/Valor:</span>
                          <p className="font-medium">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {appointment.duration}min
                            <DollarSign className="h-3 w-3 inline ml-2 mr-1" />
                            R$ {appointment.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                      
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="scheduled">Agendado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>

                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-gray-500 text-sm">Observações:</span>
                      <p className="text-gray-700 text-sm mt-1">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {appointments
                    .filter(a => a.status === 'completed')
                    .reduce((sum, a) => sum + a.price, 0)
                    .toFixed(2)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Appointments;
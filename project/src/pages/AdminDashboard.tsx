import React from 'react';
import { Calendar, Users, Clock, DollarSign, TrendingUp } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout';
import { useBooking } from '../contexts/BookingContext';

const AdminDashboard: React.FC = () => {
  const { appointments, services, professionals } = useBooking();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const todayAppointments = appointments.filter(apt => apt.date === today && apt.status !== 'cancelled');
  const tomorrowAppointments = appointments.filter(apt => apt.date === tomorrow && apt.status !== 'cancelled');
  const totalRevenue = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + apt.price, 0);
  
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return aptDate >= today && apt.status === 'scheduled';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Serviço não encontrado';
  };

  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    return professional?.name || 'Profissional não encontrado';
  };

  const stats = [
    {
      name: 'Hoje',
      value: todayAppointments.length.toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Amanhã',
      value: tomorrowAppointments.length.toString(),
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Profissionais Ativos',
      value: professionals.filter(p => p.active).length.toString(),
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Receita Mensal',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} rounded-lg p-3`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's appointments */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Agendamentos de Hoje</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum agendamento para hoje</p>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.clientName}</p>
                        <p className="text-sm text-gray-600">{getServiceName(appointment.serviceId)}</p>
                        <p className="text-sm text-gray-500">{getProfessionalName(appointment.professionalId)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <p className="text-sm text-gray-600">R$ {appointment.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming appointments */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Próximos Agendamentos</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum agendamento próximo</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.clientName}</p>
                        <p className="text-sm text-gray-600">{getServiceName(appointment.serviceId)}</p>
                        <p className="text-sm text-gray-500">{getProfessionalName(appointment.professionalId)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => (window.location.href = '/admin/appointments')} className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Calendar className="h-5 w-5 mr-2" />
              Novo Agendamento
            </button>
            <button onClick={() => (window.location.href = '/admin/professionals')} className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Users className="h-5 w-5 mr-2" />
              Cadastrar Profissional
            </button>
            <button onClick={() => (window.location.href = '/admin/reports')} className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <TrendingUp className="h-5 w-5 mr-2" />
              Ver Relatórios
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
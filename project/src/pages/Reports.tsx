import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, Users, Scissors, Download } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout';
import { useBooking } from '../contexts/BookingContext';

const Reports: React.FC = () => {
  const { appointments, services, professionals } = useBooking();
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const parseLocalYmd = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const { start, end } = useMemo(() => {
    const today = new Date();
    let s = new Date();
    let e = today;
    switch (dateRange) {
      case 'week':
        s.setDate(today.getDate() - 7);
        break;
      case 'month':
        s.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        s.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          s = parseLocalYmd(startDate);
          e = parseLocalYmd(endDate);
        }
        break;
    }
    return { start: startOfDay(s), end: endOfDay(e) };
  }, [dateRange, startDate, endDate]);
  
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = parseLocalYmd(appointment.date);
      return appointmentDate >= start && appointmentDate <= end;
    });
  }, [appointments, start, end]);

  const completedAppointments = useMemo(
    () => filteredAppointments.filter(a => a.status === 'completed'),
    [filteredAppointments]
  );

  // Revenue metrics
  const totalRevenue = useMemo(
    () => completedAppointments.reduce((sum, a) => sum + a.price, 0),
    [completedAppointments]
  );
  const averageTicket = useMemo(
    () => (completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0),
    [completedAppointments, totalRevenue]
  );

  // Service metrics
  const serviceStats = useMemo(() => {
    return services
      .map(service => {
        const serviceAppointments = completedAppointments.filter(a => a.serviceId === service.id);
        const revenue = serviceAppointments.reduce((sum, a) => sum + a.price, 0);
        const totalTime = serviceAppointments.reduce((sum, a) => sum + a.duration, 0);
        return {
          ...service,
          appointmentCount: serviceAppointments.length,
          revenue,
          totalTime,
          averageTicket: serviceAppointments.length > 0 ? revenue / serviceAppointments.length : 0
        };
      })
      .sort((a, b) => b.appointmentCount - a.appointmentCount);
  }, [services, completedAppointments]);

  // Professional metrics
  const professionalStats = useMemo(() => {
    return professionals
      .map(professional => {
        const professionalAppointments = completedAppointments.filter(a => a.professionalId === professional.id);
        const revenue = professionalAppointments.reduce((sum, a) => sum + a.price, 0);
        const totalTime = professionalAppointments.reduce((sum, a) => sum + a.duration, 0);
        return {
          ...professional,
          appointmentCount: professionalAppointments.length,
          revenue,
          totalTime,
          averageTicket: professionalAppointments.length > 0 ? revenue / professionalAppointments.length : 0,
          utilization: totalTime > 0 ? Math.min((totalTime / (8 * 60 * 22)) * 100, 100) : 0
        };
      })
      .sort((a, b) => b.appointmentCount - a.appointmentCount);
  }, [professionals, completedAppointments]);

  const exportData = () => {
    // Mock export functionality
    const csvData = [
      ['Data', 'Cliente', 'Serviço', 'Profissional', 'Valor', 'Status'],
      ...filteredAppointments.map(appointment => [
        appointment.date,
        appointment.clientName,
        services.find(s => s.id === appointment.serviceId)?.name || 'N/A',
        professionals.find(p => p.id === appointment.professionalId)?.name || 'N/A',
        `R$ ${appointment.price.toFixed(2)}`,
        appointment.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análise de performance e receita</p>
          </div>
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>

        {/* Date range selector */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Período do Relatório</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="year">Último ano</option>
              <option value="custom">Período personalizado</option>
            </select>
            
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAppointments.length}</p>
                <p className="text-xs text-gray-500">{completedAppointments.length} concluídos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Apenas agendamentos concluídos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">R$ {averageTicket.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Por atendimento concluído</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredAppointments.length > 0 
                    ? Math.round((completedAppointments.length / filteredAppointments.length) * 100)
                    : 0
                  }%
                </p>
                <p className="text-xs text-gray-500">Agendamentos finalizados</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services report */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Performance por Serviço</h3>
                <Scissors className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {serviceStats.map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Agendamentos:</span>
                          <p className="font-medium">{service.appointmentCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Receita:</span>
                          <p className="font-medium text-green-600">R$ {service.revenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Ticket Médio:</span>
                          <p className="font-medium">R$ {service.averageTicket.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {serviceStats.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum dado disponível para o período</p>
                )}
              </div>
            </div>
          </div>

          {/* Professionals report */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Performance por Profissional</h3>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {professionalStats.map((professional, index) => (
                  <div key={professional.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-sm">
                              {professional.name.charAt(0)}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900">{professional.name}</h4>
                        </div>
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Agendamentos:</span>
                          <p className="font-medium">{professional.appointmentCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Receita:</span>
                          <p className="font-medium text-green-600">R$ {professional.revenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Ticket Médio:</span>
                          <p className="font-medium">R$ {professional.averageTicket.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tempo Total:</span>
                          <p className="font-medium">{Math.round(professional.totalTime / 60)}h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {professionalStats.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum dado disponível para o período</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
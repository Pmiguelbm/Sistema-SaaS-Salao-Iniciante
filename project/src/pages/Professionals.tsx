import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout';
import { useBooking } from '../contexts/BookingContext';

const Professionals: React.FC = () => {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useBooking();
  const [showModal, setShowModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<null | {
    id: string;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    workingHours: WorkingHours;
  }>(null);
  interface WorkingHours {
    [key: string]: {
      start: string;
      end: string;
      breaks: { start: string; end: string }[];
    };
  }

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    active: boolean;
    workingHours: WorkingHours;
  }>({
    name: '',
    email: '',
    phone: '',
    active: true,
    workingHours: {
      monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
      saturday: { start: '08:00', end: '16:00', breaks: [] }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfessional) {
      updateProfessional(editingProfessional.id, formData);
    } else {
      addProfessional({ ...formData, id: crypto.randomUUID() });
    }
    handleCloseModal();
  };

  const handleEdit = (professional: {
    id: string;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    workingHours?: WorkingHours;
  }) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      active: professional.active,
      workingHours: professional.workingHours || formData.workingHours
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      deleteProfessional(id);
    }
  };

  const handleToggleActive = (professional: any) => {
    updateProfessional(professional.id, { active: !professional.active });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProfessional(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      active: true,
      workingHours: {
        monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        saturday: { start: '08:00', end: '16:00', breaks: [] }
      }
    });
  };

  const daysOfWeek = [
    { key: 'monday', name: 'Segunda-feira' },
    { key: 'tuesday', name: 'Terça-feira' },
    { key: 'wednesday', name: 'Quarta-feira' },
    { key: 'thursday', name: 'Quinta-feira' },
    { key: 'friday', name: 'Sexta-feira' },
    { key: 'saturday', name: 'Sábado' }
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
            <p className="text-gray-600">Gerencie sua equipe de profissionais</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Profissional
          </button>
        </div>

        {/* Professionals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {professional.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        professional.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {professional.active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(professional)}
                    className={`p-1 rounded ${professional.active ? 'text-green-600' : 'text-gray-400'}`}
                    title={professional.active ? 'Profissional ativo' : 'Profissional inativo'}
                  >
                    {professional.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {professional.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {professional.phone}
                  </div>
                </div>

                {/* Working days */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Dias de trabalho:</p>
                  <div className="flex flex-wrap gap-1">
                    {daysOfWeek.map(day => {
                      const hasSchedule = professional.workingHours && professional.workingHours[day.key];
                      return (
                        <span
                          key={day.key}
                          className={`text-xs px-2 py-1 rounded-full ${
                            hasSchedule 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {day.name.substring(0, 3)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(professional)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(professional.id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Horários de trabalho
                  </label>
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {daysOfWeek.map(day => {
                      const schedule = formData.workingHours[day.key];
                      const isWorking = !!schedule;
                      
                      return (
                        <div key={day.key} className="flex items-center space-x-4">
                          <div className="w-20">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isWorking}
                                onChange={(e) => {
                                  const newWorkingHours = { ...formData.workingHours };
                                  if (e.target.checked) {
                                    newWorkingHours[day.key as keyof typeof newWorkingHours] = { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] };
                                  } else {
                                    delete newWorkingHours[day.key as keyof typeof newWorkingHours];
                                  }
                                  setFormData({ ...formData, workingHours: newWorkingHours });
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <span className="text-sm">{day.name.substring(0, 3)}</span>
                            </label>
                          </div>
                          
                          {isWorking && (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="time"
                                value={schedule.start}
                                onChange={(e) => {
                                  const newWorkingHours = {
                                    ...formData.workingHours,
                                    [day.key]: { ...schedule, start: e.target.value }
                                  };
                                  setFormData({ ...formData, workingHours: newWorkingHours });
                                }}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              />
                              <span className="text-sm text-gray-500">às</span>
                              <input
                                type="time"
                                value={schedule.end}
                                onChange={(e) => {
                                  const newWorkingHours = {
                                    ...formData.workingHours,
                                    [day.key]: { ...schedule, end: e.target.value }
                                  };
                                  setFormData({ ...formData, workingHours: newWorkingHours });
                                }}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Profissional ativo
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingProfessional ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Professionals;
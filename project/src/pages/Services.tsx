import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout';
import { useBooking } from '../contexts/BookingContext';

const Services: React.FC = () => {
  const { services, professionals, addService, updateService, deleteService } = useBooking();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<null | {
    id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    active: boolean;
    professionalIds: string[];
  }>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    active: true,
    professionalIds: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService({ ...editingService, ...formData });
    } else {
      addService({ ...formData, id: crypto.randomUUID() });
    }
    handleCloseModal();
  };

  const handleEdit = (service: {
    id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    active: boolean;
    professionalIds?: string[];
  }) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description,
      active: service.active,
      professionalIds: service.professionalIds || []
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(id);
    }
  };

  const handleToggleActive = (service: any) => {
    updateService({ ...service, active: !service.active });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      duration: 30,
      price: 0,
      description: '',
      active: true,
      professionalIds: []
    });
  };

  const handleProfessionalToggle = (professionalId: string) => {
    setFormData(prev => ({
      ...prev,
      professionalIds: prev.professionalIds.includes(professionalId)
        ? prev.professionalIds.filter(id => id !== professionalId)
        : [...prev.professionalIds, professionalId]
    }));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
            <p className="text-gray-600">Gerencie os serviços oferecidos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </button>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`p-1 rounded ${service.active ? 'text-green-600' : 'text-gray-400'}`}
                      title={service.active ? 'Serviço ativo' : 'Serviço inativo'}
                    >
                      {service.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Duração
                    </div>
                    <span className="font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Preço
                    </div>
                    <span className="font-medium text-blue-600">R$ {service.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Associated professionals */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Profissionais:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.professionalIds?.map((profId: React.Key | null | undefined) => {
                      const prof = professionals.find(p => p.id === profId);
                      return prof ? (
                        <span key={profId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {prof.name}
                        </span>
                      ) : null;
                    })}
                    {(!service.professionalIds || service.professionalIds.length === 0) && (
                      <span className="text-xs text-gray-500">Nenhum profissional associado</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do serviço
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (min)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="15"
                      step="15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profissionais que oferecem este serviço
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {professionals.filter(p => p.active).map((professional) => (
                      <label key={professional.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.professionalIds.includes(professional.id)}
                          onChange={() => handleProfessionalToggle(professional.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{professional.name}</span>
                      </label>
                    ))}
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
                    Serviço ativo
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
                    {editingService ? 'Atualizar' : 'Criar'}
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

export default Services;
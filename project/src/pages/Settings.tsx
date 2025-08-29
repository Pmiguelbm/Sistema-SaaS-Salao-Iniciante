import React, { useState, useEffect } from 'react';
import { Save, Clock, Calendar, AlertTriangle, Bell, Building, Upload } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout';
import { useSalon } from '../contexts/SalonContext';

const Settings: React.FC = () => {
  const { salonConfig, updateSalonConfig } = useSalon();
  
  const [settings, setSettings] = useState({
    // Business hours
    businessHours: {
      start: '08:00',
      end: '18:00'
    },
    // Booking rules
    bufferTime: 15, // minutes between appointments
    minAdvanceBooking: 2, // hours
    maxAdvanceBooking: 30, // days
    allowSameDayBooking: true,
    allowWeekendBooking: true,
    // Notifications
    emailNotifications: {
      newBooking: true,
      cancellation: true,
      reminder: true
    },
    whatsappNotifications: {
      newBooking: false,
      cancellation: false,
      reminder: false
    },
    // General
    timezone: 'America/Araguaina',
    currency: 'BRL',
    language: 'pt-BR'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [salonFormData, setSalonFormData] = useState({
    name: salonConfig.name,
    logo: salonConfig.logo,
    description: salonConfig.description || '',
    address: salonConfig.address || '',
    phone: salonConfig.phone || '',
    email: salonConfig.email || '',
    website: salonConfig.website || ''
  });

  // Sync form data when salonConfig changes
  useEffect(() => {
    setSalonFormData({
      name: salonConfig.name,
      logo: salonConfig.logo,
      description: salonConfig.description || '',
      address: salonConfig.address || '',
      phone: salonConfig.phone || '',
      email: salonConfig.email || '',
      website: salonConfig.website || ''
    });
  }, [salonConfig]);

  const handleSalonFormChange = (field: string, value: string) => {
    setSalonFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSalonFormData(prev => ({
          ...prev,
          logo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalonSave = async () => {
    setIsSaving(true);
    
    updateSalonConfig(salonFormData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    alert('Informações do salão salvas com sucesso!');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  const handleSettingChange = (section: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(typeof prev[section] === 'object' && prev[section] !== null ? prev[section] : {}),
        [key]: value
      }
    }));
  };

  const handleDirectChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configure as regras de funcionamento do seu salão</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Salon Information */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Informações do Salão</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Salão *
                  </label>
                  <input
                    type="text"
                    value={salonFormData.name}
                    onChange={(e) => handleSalonFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome do seu salão"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo do Salão
                  </label>
                  <div className="flex items-center space-x-4">
                    {salonFormData.logo && (
                      <img 
                        src={salonFormData.logo} 
                        alt="Logo preview" 
                        className="h-16 w-16 object-contain border rounded-lg"
                      />
                    )}
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 transition-colors">
                      <Upload className="h-4 w-4 inline mr-2" />
                      {salonFormData.logo ? 'Alterar Logo' : 'Upload Logo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 2MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={salonFormData.description}
                  onChange={(e) => handleSalonFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Breve descrição do seu salão"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={salonFormData.address}
                    onChange={(e) => handleSalonFormChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Endereço completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={salonFormData.phone}
                    onChange={(e) => handleSalonFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(63) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={salonFormData.email}
                    onChange={(e) => handleSalonFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contato@salao.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={salonFormData.website}
                    onChange={(e) => handleSalonFormChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="www.salao.com"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSalonSave}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Informações do Salão'}
                </button>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Horário de Funcionamento</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Abertura
                  </label>
                  <input
                    type="time"
                    value={settings.businessHours.start}
                    onChange={(e) => handleSettingChange('businessHours', 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Fechamento
                  </label>
                  <input
                    type="time"
                    value={settings.businessHours.end}
                    onChange={(e) => handleSettingChange('businessHours', 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Rules */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Regras de Agendamento</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo Buffer (min)
                  </label>
                  <input
                    type="number"
                    value={settings.bufferTime}
                    onChange={(e) => handleDirectChange('bufferTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Intervalo entre agendamentos</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antecedência Mínima (h)
                  </label>
                  <input
                    type="number"
                    value={settings.minAdvanceBooking}
                    onChange={(e) => handleDirectChange('minAdvanceBooking', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="72"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tempo mínimo para agendar</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antecedência Máxima (dias)
                  </label>
                  <input
                    type="number"
                    value={settings.maxAdvanceBooking}
                    onChange={(e) => handleDirectChange('maxAdvanceBooking', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tempo máximo para agendar</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sameDayBooking"
                    checked={settings.allowSameDayBooking}
                    onChange={(e) => handleDirectChange('allowSameDayBooking', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sameDayBooking" className="ml-2 text-sm text-gray-700">
                    Permitir agendamentos no mesmo dia
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="weekendBooking"
                    checked={settings.allowWeekendBooking}
                    onChange={(e) => handleDirectChange('allowWeekendBooking', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="weekendBooking" className="ml-2 text-sm text-gray-700">
                    Permitir agendamentos aos sábados
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Notificações</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Email</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNewBooking"
                      checked={settings.emailNotifications.newBooking}
                      onChange={(e) => handleSettingChange('emailNotifications', 'newBooking', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailNewBooking" className="ml-2 text-sm text-gray-700">
                      Novo agendamento
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailCancellation"
                      checked={settings.emailNotifications.cancellation}
                      onChange={(e) => handleSettingChange('emailNotifications', 'cancellation', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailCancellation" className="ml-2 text-sm text-gray-700">
                      Cancelamentos
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailReminder"
                      checked={settings.emailNotifications.reminder}
                      onChange={(e) => handleSettingChange('emailNotifications', 'reminder', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailReminder" className="ml-2 text-sm text-gray-700">
                      Lembretes para clientes
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">WhatsApp</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 mr-2" />
                    <p className="text-sm text-amber-700">
                      As notificações via WhatsApp requerem configuração adicional com a API do Twilio.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="whatsappNewBooking"
                      checked={settings.whatsappNotifications.newBooking}
                      onChange={(e) => handleSettingChange('whatsappNotifications', 'newBooking', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="whatsappNewBooking" className="ml-2 text-sm text-gray-700">
                      Novo agendamento
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="whatsappCancellation"
                      checked={settings.whatsappNotifications.cancellation}
                      onChange={(e) => handleSettingChange('whatsappNotifications', 'cancellation', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="whatsappCancellation" className="ml-2 text-sm text-gray-700">
                      Cancelamentos
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="whatsappReminder"
                      checked={settings.whatsappNotifications.reminder}
                      onChange={(e) => handleSettingChange('whatsappNotifications', 'reminder', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="whatsappReminder" className="ml-2 text-sm text-gray-700">
                      Lembretes para clientes
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Configurações Gerais</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleDirectChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/Araguaina">America/Araguaína</option>
                    <option value="America/Sao_Paulo">America/São Paulo</option>
                    <option value="America/Manaus">America/Manaus</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleDirectChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleDirectChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button (bottom) */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
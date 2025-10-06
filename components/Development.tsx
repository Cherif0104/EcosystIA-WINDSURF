import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';

interface API {
  id: number;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'testing';
  description: string;
  lastTested: string;
}

interface Integration {
  id: number;
  name: string;
  type: 'webhook' | 'api' | 'sdk';
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  lastSync: string;
}

const Development: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'apis' | 'integrations' | 'logs' | 'tests'>('apis');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [editingApi, setEditingApi] = useState<API | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);

  // Données d'exemple
  const [apis, setApis] = useState<API[]>([
    {
      id: 1,
      name: 'API Utilisateurs',
      url: '/api/users',
      method: 'GET',
      status: 'active',
      description: 'Gestion des utilisateurs EcosystIA',
      lastTested: '2024-01-15 10:30'
    },
    {
      id: 2,
      name: 'API Projets',
      url: '/api/projects',
      method: 'POST',
      status: 'testing',
      description: 'Création et gestion des projets',
      lastTested: '2024-01-15 09:15'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 1,
      name: 'Supabase Auth',
      type: 'api',
      status: 'connected',
      description: 'Authentification et base de données',
      lastSync: '2024-01-15 11:00'
    },
    {
      id: 2,
      name: 'Gemini AI',
      type: 'api',
      status: 'connected',
      description: 'Intelligence artificielle et ARVA',
      lastSync: '2024-01-15 10:45'
    }
  ]);

  const handleCreateApi = (apiData: Omit<API, 'id'>) => {
    const newApi: API = {
      ...apiData,
      id: Math.max(...apis.map(a => a.id)) + 1
    };
    setApis([...apis, newApi]);
    setShowApiModal(false);
  };

  const handleUpdateApi = (apiData: API) => {
    setApis(apis.map(api => api.id === apiData.id ? apiData : api));
    setEditingApi(null);
  };

  const handleDeleteApi = (id: number) => {
    setApis(apis.filter(api => api.id !== id));
  };

  const handleCreateIntegration = (integrationData: Omit<Integration, 'id'>) => {
    const newIntegration: Integration = {
      ...integrationData,
      id: Math.max(...integrations.map(i => i.id)) + 1
    };
    setIntegrations([...integrations, newIntegration]);
    setShowIntegrationModal(false);
  };

  const handleUpdateIntegration = (integrationData: Integration) => {
    setIntegrations(integrations.map(integration => 
      integration.id === integrationData.id ? integrationData : integration
    ));
    setEditingIntegration(null);
  };

  const handleDeleteIntegration = (id: number) => {
    setIntegrations(integrations.filter(integration => integration.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🔧 Développement
        </h1>
        <p className="text-gray-600">
          Gestion des APIs, intégrations et outils de développement
        </p>
      </div>

      {/* Navigation des onglets */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'apis', label: 'APIs', count: apis.length },
            { id: 'integrations', label: 'Intégrations', count: integrations.length },
            { id: 'logs', label: 'Logs', count: 0 },
            { id: 'tests', label: 'Tests', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'apis' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">APIs</h2>
            <button
              onClick={() => setShowApiModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nouvelle API
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernier test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apis.map((api) => (
                    <tr key={api.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{api.name}</div>
                          <div className="text-sm text-gray-500">{api.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <code className="bg-gray-100 px-2 py-1 rounded">{api.url}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(api.method)}`}>
                          {api.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(api.status)}`}>
                          {api.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {api.lastTested}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingApi(api)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteApi(api.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Intégrations</h2>
            <button
              onClick={() => setShowIntegrationModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nouvelle intégration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  Type: {integration.type} | Dernière sync: {integration.lastSync}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingIntegration(integration)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logs de développement</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div>[2024-01-15 11:00:00] INFO: API utilisateurs initialisée</div>
            <div>[2024-01-15 10:45:00] INFO: Intégration Supabase connectée</div>
            <div>[2024-01-15 10:30:00] INFO: Service Gemini AI démarré</div>
            <div>[2024-01-15 10:15:00] INFO: Application EcosystIA lancée</div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tests automatisés</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-green-900">Tests unitaires</h3>
                <p className="text-sm text-green-700">15/15 tests passés</p>
              </div>
              <span className="text-green-600 font-semibold">✅ 100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-green-900">Tests d'intégration</h3>
                <p className="text-sm text-green-700">8/8 tests passés</p>
              </div>
              <span className="text-green-600 font-semibold">✅ 100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h3 className="font-medium text-yellow-900">Tests E2E</h3>
                <p className="text-sm text-yellow-700">12/15 tests passés</p>
              </div>
              <span className="text-yellow-600 font-semibold">⚠️ 80%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Development;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ConfigPanel() {
  const [configs, setConfigs] = useState({});
  const [editingConfig, setEditingConfig] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await axios.get(`${API_URL}/system-config`);
      const configObj = {};
      response.data.forEach(config => {
        configObj[config.key] = config.value;
      });
      setConfigs(configObj);
    } catch (error) {
      console.error('Error loading configs:', error);
      // Inicializar configuraciones si no existen
      await initializeConfigs();
    } finally {
      setLoading(false);
    }
  };

  const initializeConfigs = async () => {
    try {
      await axios.post(`${API_URL}/system-config/init`);
      loadConfigs();
    } catch (error) {
      console.error('Error initializing configs:', error);
    }
  };

  const updateConfig = async (key, value) => {
    try {
      await axios.post(`${API_URL}/system-config?key=${key}&value=${value}`);
      setConfigs(prev => ({ ...prev, [key]: value }));
      setEditingConfig(null);
      setNewValue('');
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error al guardar la configuración');
    }
  };

  const startEdit = (key) => {
    setEditingConfig(key);
    setNewValue(configs[key]);
  };

  const cancelEdit = () => {
    setEditingConfig(null);
    setNewValue('');
  };

  const getConfigIcon = (key) => {
    const icons = {
      'ai_role': '🤖',
      'office_hours': '🕒',
      'available_products': '📦',
      'webhook_url': '🔗',
      'history_days': '📅'
    };
    return icons[key] || '⚙️';
  };

  const getConfigTitle = (key) => {
    const titles = {
      'ai_role': 'Rol de la IA',
      'office_hours': 'Horarios de Atención',
      'available_products': 'Productos Disponibles',
      'webhook_url': 'URL del Webhook',
      'history_days': 'Días de Historial'
    };
    return titles[key] || key;
  };

  const getConfigDescription = (key) => {
    const descriptions = {
      'ai_role': 'Define el comportamiento y personalidad de la IA',
      'office_hours': 'Horarios en los que la oficina está disponible',
      'available_products': 'Lista de productos que maneja el sistema (uno por línea)',
      'webhook_url': 'URL donde se enviarán los mensajes de los usuarios',
      'history_days': 'Número de días para mantener el historial de conversaciones'
    };
    return descriptions[key] || '';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>⚙️ Configuración del Sistema</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>Configura los parámetros del sistema y el comportamiento de la IA</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {Object.entries(configs).map(([key, value]) => (
          <div 
            key={key}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  {getConfigIcon(key)} {getConfigTitle(key)}
                </h3>
                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                  {getConfigDescription(key)}
                </p>
                
                {editingConfig === key ? (
                  <div>
                    {key === 'available_products' ? (
                      <textarea
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Ingresa un producto por línea"
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          resize: 'vertical'
                        }}
                      />
                    ) : (
                      <input
                        type={key === 'history_days' ? 'number' : 'text'}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => updateConfig(key, newValue)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={cancelEdit}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '4px',
                      border: '1px solid #e9ecef',
                      marginBottom: '10px',
                      fontFamily: key === 'available_products' ? 'inherit' : 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {value || <em style={{ color: '#999' }}>Sin configurar</em>}
                    </div>
                    <button 
                      onClick={() => startEdit(key)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Cargando configuraciones...
        </div>
      ) : Object.keys(configs).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          <p>No hay configuraciones disponibles.</p>
          <button 
            onClick={initializeConfigs}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Inicializar Configuraciones
          </button>
        </div>
      ) : (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          border: '1px solid #b3d9ff'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>💡 Información</h4>
          <p style={{ margin: 0, color: '#004499', fontSize: '14px' }}>
            Las configuraciones se guardan en la base de datos del sistema. 
            Los cambios en "Días de Historial" afectarán las consultas del endpoint /historia.
          </p>
        </div>
      )}
    </div>
  );
}

export default ConfigPanel;
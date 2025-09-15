import React, { useState } from 'react';
import axios from 'axios';
import AdminPanel from './AdminPanel';
import ConfigPanel from './ConfigPanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [email, setEmail] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const initializeUser = async () => {
    if (!email.trim()) return;
    
    try {
      // Obtener o crear usuario
      const userResponse = await axios.post(`${API_URL}/access`, { email });
      setUser(userResponse.data);
      
      // Obtener conversación del día actual
      const conversationResponse = await axios.get(`${API_URL}/conversations/today/${userResponse.data.user_id}`);
      setCurrentConversation(conversationResponse.data.id);
      
      // Cargar mensajes existentes
      loadMessages(conversationResponse.data.id);
    } catch (error) {
      console.error('Failed to initialize user:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentConversation) return;
    
    try {
      await axios.post(`${API_URL}/messages`, {
        conversation_id: currentConversation,
        role: 'user',
        content: messageText
      });
      
      setMessageText('');
      loadMessages(currentConversation);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const changeUser = () => {
    setUser(null);
    setCurrentConversation(null);
    setMessages([]);
    setEmail('');
    setMessageText('');
  };

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Sistema de Conversaciones IA</h1>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginRight: '10px', padding: '8px' }}
          />
          <button 
            onClick={initializeUser}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Iniciar Chat
          </button>
        </div>
        <div>
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', marginRight: '10px' }}
          >
            {showAdmin ? 'Ocultar Panel Admin' : 'Mostrar Panel Admin'}
          </button>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            style={{ backgroundColor: '#6f42c1', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}
          >
            {showConfig ? 'Ocultar Configuración' : 'Mostrar Configuración'}
          </button>
        </div>
        {showAdmin && <AdminPanel />}
        {showConfig && <ConfigPanel />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            onClick={() => { setShowAdmin(!showAdmin); setShowConfig(false); }}
            style={{ 
              backgroundColor: '#6c757d', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            {showAdmin ? 'Chat' : 'Admin Panel'}
          </button>
          <button 
            onClick={() => { setShowConfig(!showConfig); setShowAdmin(false); }}
            style={{ 
              backgroundColor: '#6f42c1', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            {showConfig ? 'Chat' : 'Configuración'}
          </button>
          <span>Usuario: {user.email}</span>
        </div>
        <button 
          onClick={changeUser}
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px'
          }}
        >
          Cambiar Usuario
        </button>
      </div>
      
      {showAdmin ? (
        <AdminPanel />
      ) : showConfig ? (
        <ConfigPanel />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            <h3>Chat con IA - {user.email}</h3>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', minHeight: '400px' }}>
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  style={{ 
                    marginBottom: '15px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f3e5f5',
                    borderLeft: `4px solid ${msg.role === 'user' ? '#2196f3' : '#9c27b0'}`
                  }}
                >
                  <strong style={{ color: msg.role === 'user' ? '#1976d2' : '#7b1fa2' }}>
                    {msg.role === 'user' ? 'Tú' : 'IA'}:
                  </strong> {msg.content}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ padding: '20px', borderTop: '1px solid #ccc', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', marginBottom: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => loadMessages(currentConversation)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refrescar
              </button>
            </div>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe tu mensaje..."
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  marginRight: '10px'
                }}
              />
              <button 
                onClick={sendMessage}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
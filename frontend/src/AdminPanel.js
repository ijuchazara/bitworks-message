import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserConversations = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/conversations/${userId}`);
      setConversations(response.data);
      setSelectedUser(userId);
      setSelectedConversation(null);
      setMessages([]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${conversationId}`);
      setMessages(response.data);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Panel de Usuarios */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h2>👥 Usuarios</h2>
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => loadUserConversations(user.id)}
              style={{
                padding: '12px',
                margin: '8px 0',
                cursor: 'pointer',
                backgroundColor: selectedUser === user.id ? '#007bff' : 'white',
                color: selectedUser === user.id ? 'white' : 'black',
                borderRadius: '8px',
                border: '1px solid #ddd',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{user.email}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                ID: {user.id} | Registrado: {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de Conversaciones */}
      <div style={{ width: '350px', borderRight: '1px solid #ccc', padding: '20px', backgroundColor: '#f1f3f4' }}>
        <h2>💬 Conversaciones</h2>
        {selectedUser ? (
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {conversations.length > 0 ? (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversationMessages(conv.id)}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation === conv.id ? '#28a745' : 'white',
                    color: selectedConversation === conv.id ? 'white' : 'black',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{conv.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Creada: {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Actualizada: {new Date(conv.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                No hay conversaciones
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            Selecciona un usuario para ver sus conversaciones
          </div>
        )}
      </div>

      {/* Panel de Mensajes */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#ffffff' }}>
        <h2>📝 Historial de Mensajes</h2>
        {selectedConversation ? (
          <div style={{ maxHeight: '80vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            {messages.length > 0 ? (
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    padding: '12px',
                    margin: '10px 0',
                    backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f3e5f5',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${msg.role === 'user' ? '#2196f3' : '#9c27b0'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: msg.role === 'user' ? '#1976d2' : '#7b1fa2' }}>
                      {msg.role === 'user' ? '👤 Usuario' : '🤖 Asistente'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ lineHeight: '1.5' }}>{msg.content}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                No hay mensajes en esta conversación
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            Selecciona una conversación para ver los mensajes
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

import MainCard from 'ui-component/cards/MainCard';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';
const AGENT_PORT = import.meta.env.VITE_AGENT_PORT || '8001';

const ChatPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [user, setUser] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [clients, setClients] = useState([]);
  const [usersForClient, setUsersForClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/clients`);
        setClients(response.data.filter((c) => c.status === 'Activo'));
      } catch (error) {
        enqueueSnackbar('Error al cargar la lista de clientes', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (selectedClient) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${API_URL}/clients/${selectedClient.client_code}/users`);
          setUsersForClient(response.data);
        } catch (error) {
          enqueueSnackbar('Error al cargar los usuarios del cliente', { variant: 'error' });
        }
      };
      fetchUsers();
    } else {
      setUsersForClient([]);
    }
    setSelectedUsername('');
  }, [selectedClient, enqueueSnackbar]);

  useEffect(() => {
    if (!user) return;
    const wsUrl = `ws://localhost:${AGENT_PORT}/ws/${user.user_id}`;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('WebSocket connection established');
    ws.onmessage = (event) => {
      setIsTyping(false);
      try {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } catch (e) {
        if (event.data === 'new_message') {
          console.log('User message processed by agent.');
        }
      }
    };
    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    return () => ws.close();
  }, [user]);

  const initializeUser = async () => {
    if (!selectedClient || !selectedUsername.trim()) {
      enqueueSnackbar('Debe seleccionar un cliente y un nombre de usuario.', { variant: 'warning' });
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/load_conversation`, {
        params: { username: selectedUsername, client_code: selectedClient.client_code }
      });
      setUser(response.data);
      setCurrentConversation(response.data.conversation_id);
      setMessages(response.data.messages);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.detail || 'Error al cargar la conversación', { variant: 'error' });
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user?.username) return;
    const tempMessage = { id: Date.now(), role: 'user', content: messageText };
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    const currentMessage = messageText;
    setMessageText('');
    setIsTyping(true);
    try {
      await axios.get(`http://localhost:${AGENT_PORT}/question`, {
        params: { username: user.username, client_code: user.client_code, texto: currentMessage }
      });
    } catch (error) {
      setIsTyping(false);
      enqueueSnackbar('Error al enviar el mensaje', { variant: 'error' });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const changeUser = () => {
    setUser(null);
    setCurrentConversation(null);
    setMessages([]);
    setSelectedClient(null);
    setSelectedUsername('');
    setIsNewUser(false);
  };

  if (!user) {
    return (
      <MainCard title="Iniciar Sesión en el Chat">
        <Grid container spacing={3} direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
          <Grid>
            <Typography variant="h3" gutterBottom>
              Bienvenido al Sistema de Chat
            </Typography>
          </Grid>
          <Grid sx={{ width: '100%', maxWidth: '400px' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="secondary" />
              </Box>
            ) : (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={selectedClient ? selectedClient.id : ''}
                    label="Cliente"
                    onChange={(e) => {
                      const client = clients.find((c) => c.id === e.target.value);
                      setSelectedClient(client);
                    }}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedClient && (
                  <>
                    <FormControlLabel
                      control={<Switch checked={isNewUser} onChange={(e) => setIsNewUser(e.target.checked)} />}
                      label="Nuevo Usuario"
                    />
                    {isNewUser ? (
                      <TextField
                        fullWidth
                        label="Ingresa tu nombre de usuario"
                        variant="outlined"
                        value={selectedUsername}
                        onChange={(e) => setSelectedUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && initializeUser()}
                      />
                    ) : (
                      <FormControl fullWidth>
                        <InputLabel>Username</InputLabel>
                        <Select value={selectedUsername} label="Username" onChange={(e) => setSelectedUsername(e.target.value)}>
                          {usersForClient.map((u) => (
                            <MenuItem key={u.id} value={u.username}>
                              {u.username}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Grid>
          <Grid>
            <Button variant="contained" color="secondary" onClick={initializeUser} size="large" disabled={!selectedClient || !selectedUsername}>
              Iniciar Chat
            </Button>
          </Grid>
        </Grid>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={user.client_name}
      secondary={
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1">{user.username}</Typography>
          <Button variant="outlined" color="error" onClick={changeUser}>
            Cambiar Usuario
          </Button>
        </Stack>
      }
      content={false}
    >
      <Box sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
        <Paper variant="outlined" sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: theme.palette.grey[50] }}>
          <Stack spacing={2}>
            {messages.map((msg) => (
              <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Paper
                  elevation={2}
                  sx={{ p: 1.5, maxWidth: '70%', bgcolor: msg.role === 'user' ? theme.palette.primary.light : theme.palette.secondary.light }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                </Paper>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper elevation={2} sx={{ p: 1.5, bgcolor: theme.palette.secondary.light }}>
                  <Typography variant="body1">
                    <em>IA está escribiendo...</em>
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Paper>
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            variant="outlined"
            placeholder="Escribe tu mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" color="secondary" endIcon={<SendIcon />} onClick={sendMessage} size="large">
            Enviar
          </Button>
        </Box>
      </Box>
    </MainCard>
  );
};

export default ChatPage;
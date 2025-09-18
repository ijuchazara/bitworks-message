import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconMessageCircle } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';

const UsersPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingConversation, setLoadingConversation] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar los usuarios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversationModal = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setLoadingConversation(true);
    try {
      const response = await axios.get(`${API_URL}/load_conversation`, {
        params: { username: user.username, client_code: user.client_code }
      });
      setConversationMessages(response.data.messages);
    } catch (error) {
      enqueueSnackbar('Error al cargar la conversación', { variant: 'error' });
      setConversationMessages([]);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setConversationMessages([]);
  };

  return (
    <>
      <MainCard title="Gestión de Usuarios">
        <Typography variant="body2" sx={{ mb: 3 }}>
          Lista de todos los usuarios registrados en el sistema.
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Conversación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.client_name}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'Activo' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenConversationModal(user)} color="secondary">
                        <IconMessageCircle />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Última Conversación de: {selectedUser?.username}</DialogTitle>
        <DialogContent dividers>
          {loadingConversation ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <Stack spacing={2}>
              {conversationMessages.length > 0 ? (
                conversationMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: msg.role === 'user' ? theme.palette.primary.light : theme.palette.secondary.light
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'right' }}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              ) : (
                <Typography>No se encontraron mensajes para este usuario.</Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersPage;
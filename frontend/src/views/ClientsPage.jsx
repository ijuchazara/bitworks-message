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
  Fab,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import MainCard from 'ui-component/cards/MainCard';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';

const ClientsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState({
    id: null,
    client_code: '',
    name: '',
    status: 'Activo',
    attributes: []
  });
  const [modalTemplates, setModalTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients`);
      setClients(response.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar los clientes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await axios.get(`${API_URL}/templates`);
      const activeTemplates = response.data.filter((t) => t.status === 'Activo');
      return activeTemplates;
    } catch (error) {
      enqueueSnackbar('Error al cargar las plantillas de atributos', { variant: 'error' });
      return [];
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadClientAttributes = async (clientId) => {
    try {
      const response = await axios.get(`${API_URL}/attributes/${clientId}`);
      return response.data;
    } catch (error) {
      enqueueSnackbar('Error al cargar los atributos del cliente', { variant: 'error' });
      return [];
    }
  };

  const handleOpenModal = async (client = null) => {
    const fetchedTemplates = await loadTemplates();
    setModalTemplates(fetchedTemplates);

    if (client) {
      setIsEditing(true);
      const clientAttributes = await loadClientAttributes(client.id);
      const mappedAttributes = fetchedTemplates.map((template) => {
        const existingAttr = clientAttributes.find((attr) => attr.template_id === template.id);
        return {
          template_id: template.id,
          value: existingAttr ? existingAttr.value : ''
        };
      });
      setCurrentClient({ ...client, attributes: mappedAttributes });
    } else {
      setIsEditing(false);
      const newClientAttributes = fetchedTemplates.map((template) => ({
        template_id: template.id,
        value: ''
      }));
      setCurrentClient({ id: null, client_code: '', name: '', status: 'Activo', attributes: newClientAttributes });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalTemplates([]);
  };

  const handleSaveClient = async () => {
    if (!currentClient.name.trim() || !currentClient.client_code.trim()) {
      enqueueSnackbar('El código y el nombre del cliente no pueden estar vacíos', { variant: 'warning' });
      return;
    }

    const url = isEditing ? `${API_URL}/clients/${currentClient.client_code}` : `${API_URL}/clients`;
    const method = isEditing ? 'put' : 'post';

    const clientDataToSend = {
      client_code: currentClient.client_code,
      name: currentClient.name,
      status: currentClient.status,
      attributes: currentClient.attributes.map((attr) => ({
        template_id: attr.template_id,
        value: attr.value
      }))
    };

    try {
      await axios({ method, url, data: clientDataToSend });
      enqueueSnackbar(`Cliente "${currentClient.name}" guardado con éxito`, { variant: 'success' });
      loadClients();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.detail || 'Error al guardar el cliente', { variant: 'error' });
    } finally {
      handleCloseModal();
    }
  };

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setCurrentClient((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Activo' : 'Inactivo') : value
    }));
  };

  const handleAttributeChange = (templateId, value) => {
    setCurrentClient((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr) =>
        attr.template_id === templateId ? { ...attr, value } : attr
      )
    }));
  };

  return (
    <>
      <MainCard
        title="Gestión de Clientes"
        secondary={
          <Stack direction="row" spacing={2} alignItems="center">
            <Fab color="secondary" size="small" onClick={() => handleOpenModal()}>
              <AddIcon />
            </Fab>
          </Stack>
        }
      >
        <Typography variant="body2" sx={{ mb: 3 }}>
          Administra los clientes que utilizarán el servicio de chat.
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
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre del Cliente</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.client_code}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{new Date(client.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={client.status}
                        color={client.status === 'Activo' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(client)} color="secondary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Cliente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="client_code"
              label="Código de Cliente"
              fullWidth
              variant="outlined"
              value={currentClient.client_code}
              onChange={handleInputChange}
              disabled={isEditing}
            />
            <TextField
              name="name"
              label="Nombre del Cliente"
              fullWidth
              variant="outlined"
              value={currentClient.name}
              onChange={handleInputChange}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentClient.status === 'Activo'}
                  onChange={handleInputChange}
                  name="status"
                  color="success"
                />
              }
              label="Activo"
            />
            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
              Atributos del Cliente
            </Typography>
            {loadingTemplates ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              modalTemplates.map((template) => (
                <TextField
                  key={template.id}
                  label={template.description}
                  fullWidth
                  variant="outlined"
                  value={currentClient.attributes.find((attr) => attr.template_id === template.id)?.value || ''}
                  onChange={(e) => handleAttributeChange(template.id, e.target.value)}
                  multiline={template.data_type === 'textarea'}
                  rows={template.data_type === 'textarea' ? 3 : 1}
                  type={template.data_type === 'integer' ? 'number' : 'text'}
                />
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveClient} variant="contained" color="secondary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientsPage;
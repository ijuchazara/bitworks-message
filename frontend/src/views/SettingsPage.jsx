import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Paper,
  Stack,
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

const SettingsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSetting, setCurrentSetting] = useState({
    key: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      enqueueSnackbar('Error al cargar los parámetros del sistema', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (setting = null) => {
    if (setting) {
      setIsEditing(true);
      setCurrentSetting(setting);
    } else {
      setIsEditing(false);
      setCurrentSetting({ key: '', value: '', description: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSaveSetting = async () => {
    const data = {
      key: currentSetting.key,
      value: currentSetting.value,
      description: currentSetting.description
    };

    try {
      await axios.post(`${API_URL}/settings`, data);
      enqueueSnackbar(`Parámetro "${currentSetting.key}" guardado con éxito`, { variant: 'success' });
      loadSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
      enqueueSnackbar(error.response?.data?.detail || 'Error al guardar el parámetro', { variant: 'error' });
    } finally {
      handleCloseModal();
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentSetting((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <MainCard
        title="Parámetros del Sistema"
        secondary={
          <Fab color="secondary" size="small" onClick={() => handleOpenModal()}>
            <AddIcon />
          </Fab>
        }
      >
        <Typography variant="body2" sx={{ mb: 3 }}>
          Gestiona los parámetros de configuración globales que se aplican a todo el sistema.
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.key}>
                    <TableCell>{setting.key}</TableCell>
                    <TableCell>{setting.description}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{setting.value}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(setting)} color="secondary">
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

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Parámetro del Sistema</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField name="key" label="Nombre" value={currentSetting.key} onChange={handleInputChange} fullWidth disabled={isEditing} />
            <TextField name="description" label="Descripción" value={currentSetting.description} onChange={handleInputChange} fullWidth />
            <TextField
              name="value"
              label="Valor"
              value={currentSetting.value}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveSetting} variant="contained" color="secondary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsPage;
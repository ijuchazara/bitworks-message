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
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

const TemplatesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({
    id: null,
    key: '',
    description: '',
    data_type: 'text',
    status: 'Activo'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      enqueueSnackbar('Error al cargar las plantillas de parámetros', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setIsEditing(true);
      setCurrentTemplate(template);
    } else {
      setIsEditing(false);
      setCurrentTemplate({ id: null, key: '', description: '', data_type: 'text', status: 'Activo' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSaveTemplate = async () => {
    const url = isEditing ? `${API_URL}/templates/${currentTemplate.id}` : `${API_URL}/templates`;
    const method = isEditing ? 'put' : 'post';
    const data = {
      key: currentTemplate.key,
      description: currentTemplate.description,
      data_type: currentTemplate.data_type,
      status: currentTemplate.status
    };

    try {
      await axios({
        method: method,
        url: url,
        data: data
      });
      enqueueSnackbar(`Plantilla "${currentTemplate.key}" guardada con éxito`, { variant: 'success' });
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      enqueueSnackbar(error.response?.data?.detail || 'Error al guardar la plantilla', { variant: 'error' });
    } finally {
      handleCloseModal();
    }
  };

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setCurrentTemplate((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Activo' : 'Inactivo') : value
    }));
  };

  const displayedTemplates = templates;

  return (
    <>
      <MainCard
        title="Plantilla de Parámetros de Cliente"
        secondary={
          <Stack direction="row" spacing={2} alignItems="center">
            <Fab color="secondary" size="small" onClick={() => handleOpenModal()}>
              <AddIcon />
            </Fab>
          </Stack>
        }
      >
        <Typography variant="body2" sx={{ mb: 3 }}>
          Define los parámetros de configuración que se aplicarán a todos los clientes nuevos.
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
                  <TableCell>Tipo de Dato</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.key}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>{template.data_type}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.status}
                        color={template.status === 'Activo' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(template)} color="secondary">
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
        <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Plantilla de Parámetro</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField name="key" label="Nombre" value={currentTemplate.key} onChange={handleInputChange} fullWidth disabled={isEditing} />
            <TextField name="description" label="Descripción" value={currentTemplate.description} onChange={handleInputChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Tipo de Dato</InputLabel>
              <Select name="data_type" value={currentTemplate.data_type} label="Tipo de Dato" onChange={handleInputChange}>
                <MenuItem value="text">Texto Simple</MenuItem>
                <MenuItem value="textarea">Texto Extenso</MenuItem>
                <MenuItem value="integer">Número Entero</MenuItem>
                <MenuItem value="float">Número con Decimales</MenuItem>
                <MenuItem value="date">Fecha</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={currentTemplate.status === 'Activo'}
                  onChange={handleInputChange}
                  name="status"
                  color="success"
                />
              }
              label="Activo"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveTemplate} variant="contained" color="secondary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplatesPage;
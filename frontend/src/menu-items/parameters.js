import { IconSettings, IconTemplate } from '@tabler/icons-react';

const icons = { IconSettings, IconTemplate };

const parameters = {
  id: 'parameters',
  title: 'Parámetros',
  type: 'group',
  children: [
    {
      id: 'system-params',
      title: 'Ajustes',
      type: 'item',
      url: '/settings',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
    {
      id: 'client-templates',
      title: 'Plantillas',
      type: 'item',
      url: '/templates',
      icon: icons.IconTemplate,
      breadcrumbs: false
    }
  ]
};

export default parameters;

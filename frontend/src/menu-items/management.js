import { IconUsers, IconUserCheck } from '@tabler/icons-react';

const icons = { IconUsers, IconUserCheck };

const management = {
  id: 'management',
  title: 'Administración',
  type: 'group',
  children: [
    {
      id: 'clients',
      title: 'Clientes',
      type: 'item',
      url: '/clients',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'users',
      title: 'Usuarios',
      type: 'item',
      url: '/users',
      icon: icons.IconUserCheck,
      breadcrumbs: false
    }
  ]
};

export default management;
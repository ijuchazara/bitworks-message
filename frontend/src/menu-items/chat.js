import { IconMessageCircle } from '@tabler/icons-react';

const icons = { IconMessageCircle };

const chat = {
  id: 'chat-group',
  title: 'Chat',
  type: 'group',
  children: [
    {
      id: 'chat',
      title: 'Iniciar Chat',
      type: 'item',
      url: '/chat',
      icon: icons.IconMessageCircle,
      breadcrumbs: false
    }
  ]
};

export default chat;

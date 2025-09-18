import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const ChatPage = Loadable(lazy(() => import('views/ChatPage')));
const SettingsPage = Loadable(lazy(() => import('views/SettingsPage')));
const TemplatesPage = Loadable(lazy(() => import('views/TemplatesPage')));
const ClientsPage = Loadable(lazy(() => import('views/ClientsPage')));
const UsersPage = Loadable(lazy(() => import('views/UsersPage')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <ChatPage />
    },
    {
      path: 'chat',
      element: <ChatPage />
    },
    {
      path: 'settings',
      element: <SettingsPage />
    },
    {
      path: 'templates',
      element: <TemplatesPage />
    },
    {
      path: 'clients',
      element: <ClientsPage />
    },
    {
      path: 'users',
      element: <UsersPage />
    }
  ]
};

export default MainRoutes;
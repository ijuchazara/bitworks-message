import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import ThemeCustomization from 'themes';
import router from 'routes';

const App = () => {
  return (
    <ThemeCustomization>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeCustomization>
  );
};

export default App;
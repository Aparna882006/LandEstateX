import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <AppRoutes />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
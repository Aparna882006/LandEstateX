
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import AppRoutes from './routes/AppRoutes';
import ChatWidget from './components/ai/ChatWidget';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <AppRoutes />

          {/* Global AI Property Chatbot */}
          <ChatWidget />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

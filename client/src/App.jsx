import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Routes>
          {/* Routes will be added as we build each module */}
          <Route path="/" element={<PlaceholderHome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Temporary placeholder — will be replaced with real pages
function PlaceholderHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          TMS
        </div>
        <p className="text-surface-300 text-lg">
          Training Management System
        </p>
        <p className="text-surface-500 text-sm">
          Backend running on port 5000 • Frontend on port 3000
        </p>
      </div>
    </div>
  );
}

export default App;

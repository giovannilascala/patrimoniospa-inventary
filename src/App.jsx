
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import RegistroBeni from '@/pages/RegistroBeni';
import AggiungiBene from '@/pages/AggiungiBene';
import DettaglioBene from '@/pages/DettaglioBene';
import Impostazioni from '@/pages/Impostazioni';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/registro-beni" element={<ProtectedRoute><RegistroBeni /></ProtectedRoute>} />
            <Route path="/aggiungi-bene" element={<ProtectedRoute><AggiungiBene /></ProtectedRoute>} />
            <Route path="/dettaglio-bene/:id" element={<ProtectedRoute><DettaglioBene /></ProtectedRoute>} />
            <Route path="/impostazioni" element={<ProtectedRoute><Impostazioni /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

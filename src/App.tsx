import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { CreateForm } from './pages/CreateForm';
import { PaymentPage } from './pages/PaymentPage';
import { ReceiptPage } from './pages/ReceiptPage';

const App: React.FC = () => {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Payment Form Page (public link) */}
          <Route path="/pay/:formId" element={<PaymentPage />} />

          {/* Payment Receipt Page (public link) */}
          <Route path="/receipt/:txHash" element={<ReceiptPage />} />

          {/* Creator Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="create" element={<CreateForm />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
};

export default App;

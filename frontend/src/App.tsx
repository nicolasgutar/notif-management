import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NotificationConfig from './pages/NotificationConfig';
import ScheduleManager from './pages/ScheduleManager';
import MobileMock from './pages/MobileMock';
import EmailMock from './pages/EmailMock';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<NotificationConfig />} />
            <Route path="/schedules" element={<ScheduleManager />} />
            <Route path="/mobile-mock" element={<MobileMock />} />
            <Route path="/email-mock" element={<EmailMock />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
};

export default App;

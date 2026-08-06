import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerAccounts from '../pages/customer/CustomerAccounts';
import TransferForm from '../pages/customer/TransferForm';
import Payments from '../pages/customer/Payments';
import StandingOrders from '../pages/customer/StandingOrders';
import Transactions from '../pages/customer/Transactions';
import Cards from '../pages/customer/Cards';
import LoansSavings from '../pages/customer/LoansSavings';

// Manager Pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ManagerApprovals from '../pages/manager/ManagerApprovals';
import ManagerCustomers from '../pages/manager/ManagerCustomers';
import ManagerAccounts from '../pages/manager/ManagerAccounts';
import ManagerAuditLogs from '../pages/manager/ManagerAuditLogs';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Routes with Layout */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<Layout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/accounts" element={<CustomerAccounts />} />
          <Route path="/customer/transactions" element={<Transactions />} />
          <Route path="/customer/transfer" element={<TransferForm />} />
          <Route path="/customer/payments" element={<Payments />} />
          <Route path="/customer/standing-orders" element={<StandingOrders />} />
          <Route path="/customer/cards" element={<Cards />} />
          <Route path="/customer/loans-savings" element={<LoansSavings />} />
        </Route>
      </Route>

      {/* Manager Routes with Layout */}
      <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
        <Route element={<Layout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/approvals" element={<ManagerApprovals />} />
          <Route path="/manager/customers" element={<ManagerCustomers />} />
          <Route path="/manager/accounts" element={<ManagerAccounts />} />
          <Route path="/manager/audit" element={<ManagerAuditLogs />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div className="p-8 text-center text-xl">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;

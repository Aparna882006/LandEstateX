import { Routes, Route } from 'react-router-dom';

import LandingPage from '../pages/public/LandingPage';
import PropertyListingPage from '../pages/public/PropertyListingPage';
import PropertyDetailsPage from '../pages/buyer/PropertyDetailsPage';
import WishlistPage from '../pages/buyer/WishlistPage';
import ComparisonPage from '../pages/buyer/ComparisonPage';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import EmailVerificationPage from '../pages/auth/EmailVerificationPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import DashboardPage from '../pages/buyer/DashboardPage';
import BrokerDashboardPage from '../pages/broker/BrokerDashboardPage';

import ProtectedRoute from './ProtectedRoute';
import RequireRole from './RequireRole';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsersPage from '../pages/admin/UserManagementPage';
import PropertyManagementPage from '../pages/admin/PropertyManagementPage';
import BrokerManagementPage from '../pages/admin/BrokerManagementPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import FraudDetectionPage from '../pages/admin/FraudDetectionPage';
import SettingsPage from '../pages/admin/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/properties" element={<PropertyListingPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        {/* Normal User Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/compare" element={<ComparisonPage />} />

        {/* Admin Routes */}
        <Route element={<RequireRole role="admin" />}>

          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/admin/users"
            element={<UsersPage />}
          />

          <Route
            path="/admin/properties"
            element={<PropertyManagementPage />}
          />

          <Route
            path="/admin/brokers"
            element={<BrokerManagementPage />}
          />

          <Route
            path="/admin/analytics"
            element={<AnalyticsPage />}
          />

          <Route
            path="/admin/fraud"
            element={<FraudDetectionPage />}
          />

          <Route
            path="/admin/settings"
            element={<SettingsPage />}
          />

        </Route>

        {/* Broker Routes */}
        <Route element={<RequireRole role="broker" />}>
          <Route
            path="/broker/dashboard"
            element={<BrokerDashboardPage />}
          />
        </Route>

      </Route>

    </Routes>
  );
};

export default AppRoutes;
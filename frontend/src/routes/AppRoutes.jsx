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
import ProtectedRoute from './ProtectedRoute';
import RequireRole from "./RequireRole";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UsersPage from "../pages/admin/UserManagementPage";
import PropertyManagementPage from "../pages/admin/PropertyManagementPage";
import BrokerManagementPage from "../pages/admin/BrokerManagementPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import FraudDetectionPage from "../pages/admin/FraudDetectionPage";
import SettingsPage from "../pages/admin/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/properties" element={<PropertyListingPage />} />
      <Route path="/properties/:id" element={<PropertyDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
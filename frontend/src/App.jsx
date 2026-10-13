import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages (will create next)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Customer Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* Restaurant Owner Protected Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

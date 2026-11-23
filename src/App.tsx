import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';

// Pages
import BillboardPage from './pages/billboard/BillboardPage';
import EventDetailPage from './pages/billboard/EventDetailPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderSuccessPage from './pages/checkout/OrderSuccessPage';
import MyTicketsPage from './pages/client/MyTicketsPage';
import MyOrdersPage from './pages/client/MyOrdersPage';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EditEventPage from './pages/organizer/EditEventPage';
import EventStatsPage from './pages/organizer/EventStatsPage';
import CheckinScannerPage from './pages/porter/CheckinScannerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-background text-foreground antialiased">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<BillboardPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes: Cliente */}
              <Route
                path="/checkout/:eventId"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['cliente']}>
                      <CheckoutPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['cliente']}>
                      <OrderSuccessPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id/success"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['cliente']}>
                      <OrderSuccessPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['cliente']}>
                      <MyTicketsPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['cliente']}>
                      <MyOrdersPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes: Organizador */}
              <Route
                path="/organizer/events"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['organizador']}>
                      <OrganizerEventsPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/new"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['organizador']}>
                      <CreateEventPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['organizador']}>
                      <EditEventPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/:id/stats"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['organizador']}>
                      <EventStatsPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes: Portero */}
              <Route
                path="/checkin"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['portero']}>
                      <CheckinScannerPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

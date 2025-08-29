import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { SalonProvider } from './contexts/SalonContext';
import PublicBooking from './pages/PublicBooking';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Professionals from './pages/Professionals';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SalonProvider>
        <BookingProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicBooking />} />
                <Route path="/booking" element={<PublicBooking />} />
                <Route path="/login" element={<Login />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/professionals" element={
                  <ProtectedRoute>
                    <Professionals />
                  </ProtectedRoute>
                } />
                <Route path="/admin/services" element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                } />
                <Route path="/admin/appointments" element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </BookingProvider>
      </SalonProvider>
    </AuthProvider>
  );
}

export default App;
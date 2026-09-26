import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import 'remixicon/fonts/remixicon.css';
import { useAuth } from './hooks/useAuth';
import api from './api/axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ui/Toast';
import Home from './pages/Home';

// Lazy-loaded routes for better performance
const About = lazy(() => import('./pages/About'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Destinations = lazy(() => import('./pages/Destinations'));
const SignIn = lazy(() => import('./auth/SignIn'));
const SignUp = lazy(() => import('./auth/SignUp'));
const Admin = lazy(() => import('./pages/Admin'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const MyBookings = lazy(() => import('./pages/MyBookings'));

import './App.css';

// Protected route wrapper for admin role
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="detail-loading-spinner"></div>
      </div>
    );
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Page loading fallback for Suspense
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <div className="detail-loading-spinner"></div>
  </div>
);

const App = () => {
  const [destinationList, setDestinationList] = useState([]);
  const location = useLocation();


  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  const fetchData = async () => {
    try {
      const response = await api.get("/national");
      setDestinationList(response.data.destination || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path='/destinations'
            element={<Destinations destinationList={destinationList} />}
          />
          <Route path='/about' element={<About />} />
          <Route path='/testimonials' element={<Testimonials />} />
          <Route path='/destination/:id' element={<DestinationDetail />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route
            path='/admin'
            element={
              <ProtectedAdminRoute>
                <Admin destinationList={destinationList} refreshDestinations={fetchData} />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Suspense>
      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;
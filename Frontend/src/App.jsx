import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import 'remixicon/fonts/remixicon.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Testimonials from './pages/Testimonials';
import Destinations from './pages/Destinations';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import Admin from './pages/Admin';
import DestinationDetail from './pages/DestinationDetail';
import MyBookings from './pages/MyBookings';

import './App.css';

// Protected route wrapper component for admin role
const ProtectedAdminRoute = ({ user, loading, children }) => {
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>Loading...</div>;
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [destinationList, setDestinationList] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();

  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  // Check logged in user state on mount / route change
  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8080/me', { withCredentials: true });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setAuthLoading(false);
        return;
      }
    } catch (err) {
      // Fallback check localStorage if server session endpoint fails
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setAuthLoading(false);
          return;
        } catch (e) { }
      }
    }
    setUser(null);
    setAuthLoading(false);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/national");
      setDestinationList(response.data.destination || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  useEffect(() => {
    fetchData();
    checkAuth();
  }, []);

  // Scroll to top of page whenever route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path='/destinations'
          element={<Destinations destinationList={destinationList} />}
        />
        <Route path='/about' element={<About />} />
        <Route path='/testimonials' element={<Testimonials />} />
        <Route path='/destination/:id' element={<DestinationDetail user={user} />} />
        <Route path='/my-bookings' element={<MyBookings user={user} />} />
        <Route path='/signin' element={<SignIn onLoginSuccess={checkAuth} />} />
        <Route path='/signup' element={<SignUp onLoginSuccess={checkAuth} />} />
        <Route
          path='/admin'
          element={
            <ProtectedAdminRoute user={user} loading={authLoading}>
              <Admin destinationList={destinationList} refreshDestinations={fetchData} />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import FeedbackForm from './components/FeedbackForm';
import FeedbackDashboard from './components/FeedbackDashboard';
import LoginPage from './components/LoginPage';
import UserRegistrationForm from './components/UserRegistrationForm';
import CustomerFeedbackPage from './components/CustomerFeedbackPage';
import { logout, getUserRole } from './services/api';
import './App.css';

// ✅ Optional component to show access-denied message on home
const HomeWrapper = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const accessDenied = query.get('access') === 'denied';

    return (
        <>
            {accessDenied && <p className="error">Access denied: Customers are not allowed to access the dashboard.</p>}
            <FeedbackForm />
        </>
    );
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true); // Wait until role check is complete

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            const role = getUserRole();
            setUserRole(role);
        }
        setLoading(false);
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
        const role = getUserRole();
        setUserRole(role);
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setUserRole(null);
    };

    return (
        <Router>
            <div className="App">
                <nav className="navbar">
                    <Link to="/" className="nav-link">Submit Feedback</Link>
                    <Link to="/register" className="nav-link">Register</Link>

                    {isLoggedIn && userRole === 'customer' && (
                        <Link to="/my-feedback" className="nav-link">My Feedback</Link>
                    )}

                    {isLoggedIn && userRole !== 'customer' && (
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    )}

                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="nav-button">Logout</button>
                    ) : (
                        <Link to="/login" className="nav-link">Login</Link>
                    )}
                </nav>

                <main className="container">
                    {!loading && (
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    isLoggedIn && userRole === 'customer'
                                        ? <Navigate to="/my-feedback" />
                                        : <HomeWrapper />
                                }
                            />
                            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                            <Route path="/register" element={<UserRegistrationForm />} />
                            <Route
                                path="/dashboard"
                                element={
                                    isLoggedIn
                                        ? userRole !== 'customer'
                                            ? <FeedbackDashboard role={userRole} />
                                            : <Navigate to="/?access=denied" />
                                        : <Navigate to="/login" />
                                }
                            />
                            <Route
                                path="/my-feedback"
                                element={
                                    isLoggedIn && userRole === 'customer'
                                        ? <CustomerFeedbackPage />
                                        : <Navigate to="/login" />
                                }
                            />
                        </Routes>
                    )}
                </main>
            </div>
        </Router>
    );
}

export default App;

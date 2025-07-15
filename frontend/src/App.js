import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link,
    Navigate
} from 'react-router-dom';

import FeedbackDashboard from './components/FeedbackDashboard';
import FeedbackForm from './components/FeedbackForm';
import LoginPage from './components/LoginPage';
import UserRegistrationForm from './components/UserRegistrationForm';
import CustomerFeedbackPage from './components/CustomerFeedbackPage';
import { logout, getUserRole } from './services/api';

import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            const role = getUserRole();
            setUserRole(role?.toLowerCase()); // ✅ convert role to lowercase
        }
        setLoading(false);
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
        const role = getUserRole();
        setUserRole(role?.toLowerCase()); // ✅ convert role to lowercase
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
                    <h1>Customer Feedback</h1>
                    {!isLoggedIn && (
                        <>
                            <Link to="/register" className="nav-link">Register</Link>
                            <Link to="/login" className="nav-link">Login</Link>
                        </>
                    )}

                    {isLoggedIn && userRole === 'customer' && (
                        <>
                            <Link to="/feedback" className="nav-link">Submit Feedback</Link>
                            <Link to="/my-feedback" className="nav-link">My Feedback</Link>
                        </>
                    )}

                    {isLoggedIn && userRole !== 'customer' && (
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    )}

                    {isLoggedIn && (
                        <button onClick={handleLogout} className="nav-button">Logout</button>
                    )}
                </nav>

                <main className="container">
                    {!loading && (
                        <Routes>
                            {/* Default: redirect to login if not authenticated */}
                            <Route path="/" element={
                                isLoggedIn
                                    ? userRole === 'customer'
                                        ? <Navigate to="/my-feedback" />
                                        : <Navigate to="/dashboard" />
                                    : <Navigate to="/login" />
                            } />

                            {/* Auth pages */}
                            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                            <Route path="/register" element={<UserRegistrationForm />} />

                            {/* Staff dashboard */}
                            <Route
                                path="/dashboard"
                                element={
                                    isLoggedIn && userRole !== 'customer'
                                        ? <FeedbackDashboard role={userRole} />
                                        : <Navigate to="/login" />
                                }
                            />

                            {/* Customer feedback form */}
                            <Route
                                path="/feedback"
                                element={
                                    isLoggedIn && userRole === 'customer'
                                        ? <FeedbackForm />
                                        : <Navigate to="/login" />
                                }
                            />

                            {/* Customer feedback history */}
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

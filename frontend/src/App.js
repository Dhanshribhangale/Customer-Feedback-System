import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import FeedbackForm from './components/FeedbackForm';
import FeedbackDashboard from './components/FeedbackDashboard';
import LoginPage from './components/LoginPage'; // Import the new page
import { logout, getUserRole } from './services/api';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if a token exists on initial load
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <div className="App">
                <nav className="navbar">
                    <Link to="/" className="nav-link">Submit Feedback</Link>
                    {isLoggedIn && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
                    {isLoggedIn ? (
                         <button onClick={handleLogout} className="nav-button">Logout</button>
                    ) : (
                         <Link to="/login" className="nav-link">Login</Link>
                    )}
                </nav>
                <main className="container">
                    <Routes>
                        <Route path="/" element={<FeedbackForm />} />
                        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                        <Route 
                            path="/dashboard" 
                            element={isLoggedIn ? <FeedbackDashboard /> : <Navigate to="/login" />} 
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
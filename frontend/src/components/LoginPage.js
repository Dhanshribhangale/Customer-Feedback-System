import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, getUserRole } from '../services/api';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('registered') === 'true') {
            setSuccessMessage('✅ Registered successfully. Please log in.');
        }
    }, [location.search]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const data = await login(credentials); // Save token to localStorage
            onLogin(data.access);

            const role = getUserRole();
            if (role === 'customer') {
                navigate('/my-feedback');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('❌ Invalid username or password.');
        }
    };

    return (
        <div className ="newformcontainer">
            <h2>Login</h2>
            {successMessage && <p className="success">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default LoginPage;

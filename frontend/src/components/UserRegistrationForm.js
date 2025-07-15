import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './UserRegistrationForm.css';

const UserRegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'customer',
        department: '',
    });

    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.getDepartments();
                setDepartments(response.data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const dataToSend = { ...formData };

        // Handle department field based on role
        if (formData.role === 'customer') {
            delete dataToSend.department;
        } else if (!formData.department) {
            setError('❌ Please select a department.');
            return;
        }

        try {
            await api.registerUser(dataToSend);
            setMessage('✅ User registered successfully!');
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'customer',
                department: '',
            });
        } catch (err) {
            const errMsg =
                err.response?.data?.username?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.non_field_errors?.[0] ||
                'Please try again.';
            setError('❌ Registration failed. ' + errMsg);
            console.error('Registration error:', err.response?.data || err);
        }
    };

    return (
        <div className="newformcontainer">
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                        <option value="head">Department Head</option>
                    </select>
                </div>

                {(formData.role === 'employee' || formData.role === 'head') && (
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button type="submit">Register</button>
            </form>

            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default UserRegistrationForm;

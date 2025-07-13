import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './FeedbackForm.css'; // ✅ CSS for styling

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        feedback_type: '',
        comments: '',
        department: '',
    });

    const [departments, setDepartments] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.submitFeedback(formData);
            setSuccessMessage('✅ Feedback submitted successfully!');
            setErrorMessage('');
            setFormData({
                name: '',
                email: '',
                feedback_type: '',
                comments: '',
                department: '',
            });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Feedback submission failed:', error);
            setErrorMessage('❌ Failed to submit feedback. Please try again.');
        }
    };

    return (
        <div className="feedback-form-container">
            <h2>💬 Submit Feedback</h2>
            <form onSubmit={handleSubmit} className="feedback-form">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                />
                <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
                <select
                    name="feedback_type"
                    value={formData.feedback_type}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Feedback Type</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Appreciation">Appreciation</option>
                </select>
                <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    placeholder="Enter your feedback here"
                    required
                />
                <button type="submit">Submit</button>
            </form>

            {successMessage && <p className="success">{successMessage}</p>}
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    );
};

export default FeedbackForm;

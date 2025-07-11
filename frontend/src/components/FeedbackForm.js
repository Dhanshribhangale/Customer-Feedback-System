import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        feedback_type: 'Suggestion',
        comments: '',
        department: '',
    });

    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.getDepartments()
            .then(response => {
                 console.log("Loaded departments:", response.data); 
                setDepartments(response.data);
                setLoadingDepartments(false);
            })
            .catch(error => {
                console.error('Error fetching departments:', error);
                setLoadingDepartments(false);
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.submitFeedback(formData);
            setMessage('✅ Thank you! Your feedback has been submitted successfully.');
            setFormData({
                name: '',
                email: '',
                feedback_type: 'Suggestion',
                comments: '',
                department: '',
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setMessage('❌ Error: Could not submit feedback. Please try again.');
        }
    };

    return (
        <div className="form-container">
            <h2>Customer Feedback</h2>
            <p>We’d love to hear your thoughts, suggestions, or concerns.</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Feedback Type</label>
                    <select name="feedback_type" value={formData.feedback_type} onChange={handleChange} required>
                        <option value="Suggestion">Suggestion</option>
                        <option value="Complaint">Complaint</option>
                        <option value="Compliment">Compliment</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} required>
                        <option value="">-- Select Department --</option>
                        {loadingDepartments ? (
                            <option disabled>Loading departments...</option>
                        ) : departments.length === 0 ? (
                            <option disabled>No departments available</option>
                        ) : (
                            departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="form-group">
                    <label>Comments</label>
                    <textarea name="comments" value={formData.comments} onChange={handleChange} required rows="5" />
                </div>

                <button type="submit">Submit Feedback</button>
            </form>

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default FeedbackForm;

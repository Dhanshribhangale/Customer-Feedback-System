import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CustomerFeedbackPage.css';

const CustomerFeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchFeedback = async () => {
        try {
            const response = await api.getFeedback();
            setFeedbackList(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch feedback:', err);
            setError('❌ Failed to load your feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    return (
        <div className="customer-feedback-container">
            <h2>📋 My Feedback History</h2>
            {loading && <p>Loading feedback...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && feedbackList.length === 0 && (
                <p>No feedback submitted yet.</p>
            )}

            {!loading && !error && feedbackList.length > 0 && (
                <table className="feedback-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Type</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbackList.map(item => (
                            <tr key={item.id}>
                                <td>{item.department_name || 'N/A'}</td>
                                <td>{item.feedback_type}</td>
                                <td>{item.comments}</td>
                                <td>{item.status}</td>
                                <td>{item.response ? item.response : '⌛ Awaiting reply'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CustomerFeedbackPage;


import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CustomerFeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState([]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.getFeedback();
                setFeedbackList(response.data);
            } catch (err) {
                console.error('Failed to fetch customer feedback:', err);
            }
        };
        fetchFeedback();
    }, []);

    return (
        <div className="customer-feedback-container">
            <h2>My Feedback</h2>
            {feedbackList.length === 0 ? (
                <p>No feedback submitted yet.</p>
            ) : (
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
                                <td>{item.department_name}</td>
                                <td>{item.feedback_type}</td>
                                <td>{item.comments}</td>
                                <td>{item.status}</td>
                                <td>{item.response || 'Awaiting reply'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CustomerFeedbackPage;

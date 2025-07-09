import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SentimentChart from './SentimentChart';
import ReactPaginate from 'react-paginate';

import './FeedbackDashboard.css'; // optional CSS for styling pagination

const FeedbackDashboard = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [filteredFeedback, setFilteredFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(0);

    const itemsPerPage = 5;

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.getFeedback();
                setFeedbackList(response.data);
                setFilteredFeedback(response.data);
            } catch (err) {
                setError('Failed to fetch feedback data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    useEffect(() => {
        let data = [...feedbackList];

        if (sentimentFilter !== 'All') {
            data = data.filter(item => item.sentiment === sentimentFilter);
        }

        if (searchTerm.trim()) {
            data = data.filter(
                item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredFeedback(data);
        setCurrentPage(0);
    }, [searchTerm, sentimentFilter, feedbackList]);

    const offset = currentPage * itemsPerPage;
    const currentItems = filteredFeedback.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filteredFeedback.length / itemsPerPage);

    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    if (loading) return <p>Loading feedback...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="dashboard-container">
            <h2>Feedback Dashboard</h2>
            <div className="chart-container">
                <SentimentChart feedbackData={filteredFeedback} />
            </div>

            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Neutral">Neutral</option>
                </select>
            </div>

            <h3>All Feedback Submissions</h3>
            <div className="feedback-table-container">
                <table className="feedback-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Comments</th>
                            <th>Sentiment</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.feedback_type}</td>
                                    <td>{item.comments}</td>
                                    <td className={`sentiment-${item.sentiment?.toLowerCase()}`}>{item.sentiment}</td>
                                    <td>{new Date(item.created_at).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No feedback found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ReactPaginate
                previousLabel={'←'}
                nextLabel={'→'}
                breakLabel={'...'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                activeClassName={'active'}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
            />
        </div>
    );
};

export default FeedbackDashboard;

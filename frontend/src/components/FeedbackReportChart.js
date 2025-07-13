import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import api from '../services/api';

const FeedbackReportChart = () => {
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get('/feedback/report/');
                setReportData(response.data);
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
        };
        fetchReport();
    }, []);

    if (!reportData) return <p>Loading report...</p>;

    const data = {
        labels: ['Received', 'Closed', 'Pending'],
        datasets: [
            {
                data: [reportData.received, reportData.closed, reportData.pending],
                backgroundColor: ['#36a2eb', '#28a745', '#ffc107'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div style={{ maxWidth: 400, margin: '20px auto' }}>
            <h3>📊 Feedback Status Report</h3>
            <Pie data={data} />
        </div>
    );
};

export default FeedbackReportChart;

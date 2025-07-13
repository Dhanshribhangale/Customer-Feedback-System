import React from 'react';
import { Pie } from 'react-chartjs-2';

const FeedbackReportChart = ({ reportData }) => {
    const data = {
        labels: ['Received', 'Closed', 'Pending'],
        datasets: [
            {
                data: [
                    reportData.total_feedbacks,
                    reportData.closed_feedbacks,
                    reportData.pending_feedbacks,
                ],
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

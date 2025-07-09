import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentChart = ({ feedbackData }) => {
    const sentimentCounts = feedbackData.reduce((acc, item) => {
        const sentiment = item.sentiment || 'Neutral';
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
    }, { Positive: 0, Negative: 0, Neutral: 0 });

    const data = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
            {
                label: '# of Feedback',
                data: [sentimentCounts.Positive, sentimentCounts.Negative, sentimentCounts.Neutral],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return <Pie data={data} />;
};

export default SentimentChart;
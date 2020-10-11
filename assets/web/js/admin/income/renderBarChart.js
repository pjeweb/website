import Chart from 'chart.js'

import {formatCurrency} from '../graph-utils'

export default function renderBarChart(graphElement, label, {labels, data}) {
    const ctx = graphElement.querySelector('canvas').getContext('2d')

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                borderWidth: 0.4,
                backgroundColor: 'rgba(220,220,220,0.2)',
                borderColor: 'rgba(220,220,220,1)',
                pointBorderColor: 'rgba(220,220,220,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                data: data,
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: tooltipItem => formatCurrency(tooltipItem.yLabel),
                },
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: formatCurrency,
                    },
                }],
            },
        },
    })
}
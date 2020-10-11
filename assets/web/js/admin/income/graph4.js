import Chart from 'chart.js'

import parse from 'date-fns/parse'
import format from 'date-fns/format'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import isBefore from 'date-fns/isBefore'
import add from 'date-fns/add'

import {getCurrentDate, registerListener} from './dates'

const subscriberTiers = [
    {
        label: 'Tier 1',
        backgroundColor: 'rgba(51, 122, 183, 0.6)',
        color: 'rgba(51, 122, 183, 1)',
    },
    {
        label: 'Tier 2',
        backgroundColor: 'rgba(0, 220, 0, 0.6)',
        color: 'rgba(0, 220, 0, 1)',
        pointBackgroundColor: '#fff',
    },
    {
        label: 'Tier 3',
        backgroundColor: 'rgba(220, 0, 0, 0.6)',
        color: 'rgba(220, 0, 0, 1)',
    },
    {
        label: 'Tier 4',
        backgroundColor: 'rgba(220, 0, 220, 0.6)',
        color: 'rgba(220, 0, 220, 1)',
    },
]

export default function renderGraph4() {
    const graph = document.getElementById('graph4')
    if (!graph) {
        return
    }

    const ctx = graph.querySelector('canvas').getContext('2d')
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                    stacked: true,
                }],
            },
        },
    })

    const updateGraph = async function (currentDate) {
        const selectedDate = parse(format(currentDate, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date())
        const fromDate = startOfMonth(selectedDate)
        const toDate = endOfMonth(selectedDate)

        let data = await fetch(`/admin/chart/finance/NewTieredSubscribersLastXDays.json?${new URLSearchParams({
            fromDate: format(fromDate, 'YYYY-MM-DD'),
            toDate: format(toDate, 'YYYY-MM-DD'),
        }).toString()}`)
            .then(response => response.json())

        const dataSets = subscriberTiers.map(() => [])
        const dataLabels = []
        const dates = []
        for (let m = fromDate; isBefore(m, toDate) || m.getTime() === toDate.getTime(); m = add(m, {days: 1})) {
            dates.push(format(m, 'yyyy-MM-dd'))
            dataLabels.push(format(m, 'd'))

            dataSets.forEach(dataSet => {
                dataSet.push(0)
            })
        }

        for (let i = 0; i < data.length; ++i) {
            const x = dates.indexOf(data[i].date)
            if (x !== -1) {
                const tierLevel = parseInt(data[i]['subscriptionTier'], 10)
                dataSets[tierLevel] = parseInt(data[i]['total'], 10)
            }
        }

        chart.data.labels = dataLabels
        chart.data.datasets = subscriberTiers.map((tier, i) => {
            const {label, color, backgroundColor, pointBackgroundColor} = tier

            return {
                label,
                data: dataSets[i],
                borderWidth: 0.4,
                backgroundColor,
                borderColor: color,
                pointBorderColor: color,
                pointBackgroundColor: pointBackgroundColor || color,
            }
        })
        chart.update()
    }

    registerListener(updateGraph)
    updateGraph(getCurrentDate())
}
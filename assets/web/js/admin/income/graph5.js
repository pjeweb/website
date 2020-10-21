import Chart from 'chart.js'

import parse from 'date-fns/parse'
import format from 'date-fns/format'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import isBefore from 'date-fns/isBefore'
import add from 'date-fns/add'

import {formatCurrency} from '../graph-utils'
import {getCurrentDate, registerListener} from './dates'

export default function renderGraph5() {
    const graph = document.getElementById('graph5')
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
            tooltips: {
                callbacks: {
                    label: t => formatCurrency(t['yLabel']),
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

    const updateGraph = function (currentDate) {
        const selectedDate = parse(format(currentDate, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date())
        const fromDate = startOfMonth(selectedDate)
        const toDate = endOfMonth(selectedDate)

        fetch(`/admin/chart/finance/NewDonationsLastXDays.json?${new URLSearchParams({
            fromDate: format(fromDate, 'yyyy-MM-dd'),
            toDate: format(toDate, 'yyyy-MM-dd'),
        }).toString()}`)
            .then(response => response.json())
            .then(data => {
                const label = `Donations ${format(currentDate, 'MMMM yyyy')}`
                const dataSet = []
                const dataLabels = []
                const dates = []
                for (let m = fromDate; isBefore(m, toDate) || m.getTime() === toDate.getTime(); m = add(m, {days: 1})) {
                    dates.push(format(m, 'yyyy-MM-dd'))
                    dataLabels.push(format(m, 'd'))

                    dataSet.push(0)
                }

                for (let i = 0; i < data.length; ++i) {
                    const x = dates.indexOf(data[i].date)
                    dataSet[x] = parseInt(data[i]['total'], 10)
                }

                chart.label = label
                chart.data.labels = dataLabels
                chart.data.datasets = [{
                    label: label,
                    data: dataSet,
                    borderWidth: 0.4,
                    backgroundColor: 'rgba(220, 220, 220, 0.2)',
                    borderColor: 'rgba(220, 220, 220, 1)',
                    pointBorderColor: 'rgba(220, 220, 220, 1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                }]
                chart.update()
            })
    }

    registerListener(updateGraph)
    updateGraph(getCurrentDate())
}
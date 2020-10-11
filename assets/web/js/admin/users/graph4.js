import Chart from 'chart.js'

import parse from 'date-fns/parse'
import format from 'date-fns/format'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import isBefore from 'date-fns/isBefore'
import add from 'date-fns/add'

import {getCurrentDate, registerListener} from './dates'

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

        let data = await fetch(`/admin/chart/users/NewUsersAndBansLastXDays.json?${new URLSearchParams({
            fromDate: format(fromDate, 'YYYY-MM-DD'),
            toDate: format(toDate, 'YYYY-MM-DD'),
        }).toString()}`)
            .then(response => response.json())


        const dataSetUsers = []
        const dataSetBans = []
        const dataLabels = []
        const dates = []
        for (let m = fromDate; isBefore(m, toDate) || m.getTime() === toDate.getTime(); m = add(m, {days: 1})) {
            dates.push(format(m, 'yyyy-MM-dd'))
            dataLabels.push(format(m, 'd'))

            dataSetUsers.push(0)
            dataSetBans.push(0)
        }

        for (let y = 0; y < data.length; ++y) {
            for (let i = 0; i < data[y].length; ++i) {
                const x = dates.indexOf(data[y][i].date)
                if (x !== -1) {
                    switch (y) {
                        case 0:
                            dataSetUsers[x] = parseInt(data[y][i]['total'])
                            break

                        case 1:
                            dataSetBans[x] = parseInt(data[y][i]['total'])
                            break
                    }
                }
            }
        }

        chart.data.labels = dataLabels
        chart.data.datasets = [
            {
                label: 'Users',
                data: dataSetUsers,
                borderWidth: 0.4,
                backgroundColor: 'rgba(51, 122, 183, 0.6)',
                borderColor: 'rgba(51, 122, 183, 1)',
                pointBorderColor: 'rgba(51, 122, 183, 1)',
                pointBackgroundColor: 'rgba(51, 122, 183, 1)',
            },
            {
                label: 'Bans',
                data: dataSetBans,
                borderWidth: 0.4,
                backgroundColor: 'rgba(220, 0, 0, 0.6)',
                borderColor: 'rgba(220, 0, 0, 1)',
                pointBorderColor: 'rgba(220, 0, 0, 1)',
                pointBackgroundColor: 'rgba(220, 0, 0, 1)',
            },
        ]
        chart.update()
    }

    registerListener(updateGraph)
    updateGraph(getCurrentDate())
}
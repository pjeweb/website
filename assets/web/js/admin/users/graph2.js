import add from 'date-fns/add'
import parse from 'date-fns/parse'
import format from 'date-fns/format'

import {prepareGraphData} from '../graph-utils'

import {getCurrentDate} from './dates'
import renderBarChart from './renderBarChart'

const months = 12

export default function renderGraph2() {
    const graph = document.getElementById('graph2')
    if (!graph) {
        return
    }

    const label = `Users Last ${months} Months`
    const fromDate = add(parse(format(getCurrentDate(), 'yyyy-MM-dd')), {months: -months})
    const toDate = parse(format(getCurrentDate(), 'yyyy-MM-dd'))

    fetch(`/admin/chart/users/NewUsersLastXMonths.json?${new URLSearchParams({
        fromDate: format(fromDate, 'yyyy-MM-dd'),
        toDate: format(toDate, 'yyyy-MM-dd'),
    }).toString()}`)
        .then(response => response.json())
        .then(data => {
            renderBarChart(graph, label, prepareGraphData(data, 'total', months, 'months'))
        })
}
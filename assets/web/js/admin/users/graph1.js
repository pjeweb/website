import parse from 'date-fns/parse'
import format from 'date-fns/format'
import add from 'date-fns/add'

import {prepareGraphData} from '../graph-utils'

import renderBarChart from './renderBarChart'
import {getCurrentDate} from './dates'

const days = 14

export default async function renderGraph1() {
    const graph = document.getElementById('graph1')
    if (!graph) {
        return
    }

    const label = `Users Last ${days} Days`
    const fromDate = add(parse(format(getCurrentDate(), 'yyyy-MM-dd')), {days: -days})
    const toDate = parse(format(getCurrentDate(), 'yyyy-MM-dd'))

    let data = await fetch(`/admin/chart/users/NewUsersLastXDays.json?${new URLSearchParams({
        fromDate: format(fromDate, 'yyyy-MM-dd'),
        toDate: format(toDate, 'yyyy-MM-dd'),
    }).toString()}`)
        .then(response => response.json())

    renderBarChart(graph, label, prepareGraphData(data, 'total', days, 'days'))
}
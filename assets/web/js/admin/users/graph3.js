import add from 'date-fns/add'
import parse from 'date-fns/parse'
import format from 'date-fns/format'

import {prepareGraphData} from '../graph-utils'

import {getCurrentDate} from './dates'
import renderBarChart from './renderBarChart'

const years = 5

export default async function renderGraph3() {
    const graph = document.getElementById('graph3')
    if (!graph) {
        return
    }

    const label = `Users ${years} Years`
    const fromDate = add(parse(format(getCurrentDate(), 'yyyy-MM-dd')), {years: -years})
    const toDate = parse(format(getCurrentDate(), 'yyyy-MM-dd'))

    let data = await fetch(`/admin/chart/users/NewUsersLastXYears.json?${new URLSearchParams({
        fromDate: format(fromDate, 'yyyy-MM-dd'),
        toDate: format(toDate, 'yyyy-MM-dd'),
    }).toString()}`)
        .then(response => response.json())

    renderBarChart(graph, label, prepareGraphData(data, 'total', years, 'years'))
}
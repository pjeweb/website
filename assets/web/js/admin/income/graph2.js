import {prepareGraphData} from '../graph-utils'
import renderBarChart from './renderBarChart'

const months = 12

export default async function renderGraph2() {
    const graph = document.getElementById('graph2')
    if (!graph) {
        return
    }

    const label = `Revenue Last ${months} Months`
    let data = await fetch(`/admin/chart/finance/RevenueLastXMonths.json?months=${months}`)
        .then(response => response.json())

    renderBarChart(graph, label, prepareGraphData(data, 'sum', months, 'months'))
}
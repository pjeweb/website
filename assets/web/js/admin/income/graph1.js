import {prepareGraphData} from '../graph-utils'
import renderBarChart from './renderBarChart'

const days = 14

export default async function renderGraph1() {
    const graph = document.getElementById('graph1')
    if (!graph) {
        return
    }

    const label = `Revenue Last ${days} Days`
    let data = await fetch(`/admin/chart/finance/RevenueLastXDays.json?days=${days}`)
        .then(response => response.json())

    renderBarChart(graph, label, prepareGraphData(data, 'sum', days, 'days'))
}
import {prepareGraphData} from '../graph-utils'
import renderBarChart from './renderBarChart'

const months = 12

export default function renderGraph2() {
    const graph = document.getElementById('graph2')
    if (!graph) {
        return
    }

    const label = `Revenue Last ${months} Months`
    fetch(`/admin/chart/finance/RevenueLastXMonths.json?months=${months}`)
        .then(response => response.json())
        .then(data => {
            renderBarChart(graph, label, prepareGraphData(data, 'sum', months, 'months'))
        })
}
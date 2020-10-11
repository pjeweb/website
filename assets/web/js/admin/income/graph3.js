import { prepareGraphData} from '../graph-utils'
import renderBarChart from './renderBarChart'

const years = 5

export default async function renderGraph3() {
    const graph = document.getElementById('graph3')
    if (!graph) {
        return
    }

    const label = `Revenue Last ${years} Years`
    let data = await fetch(`/admin/chart/finance/RevenueLastXYears.json?years=${years}`)
        .then(response => response.json())

    renderBarChart(graph, label, prepareGraphData(data, 'sum', years, 'years'))
}
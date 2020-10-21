import { prepareGraphData} from '../graph-utils'
import renderBarChart from './renderBarChart'

const years = 5

export default function renderGraph3() {
    const graph = document.getElementById('graph3')
    if (!graph) {
        return
    }

    const label = `Revenue Last ${years} Years`
    fetch(`/admin/chart/finance/RevenueLastXYears.json?years=${years}`)
        .then(response => response.json())
        .then(data => {
            renderBarChart(graph, label, prepareGraphData(data, 'sum', years, 'years'))
        })
}
import {renderDateSelector} from './income/dates'
import renderGraph1 from './income/graph1'
import renderGraph2 from './income/graph2'
import renderGraph3 from './income/graph3'
import renderGraph4 from './income/graph4'
import renderGraph5 from './income/graph5'

const incomeGraphsElement = document.getElementById('income-graphs')
if (incomeGraphsElement) {
    renderDateSelector()
    renderGraph1()
    renderGraph2()
    renderGraph3()
    renderGraph4()
    renderGraph5()
}

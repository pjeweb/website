import {renderDates} from './users/dates'
import renderGraph1 from './users/graph1'
import renderGraph2 from './users/graph2'
import renderGraph3 from './users/graph3'
import renderGraph4 from './users/graph4'

const moderationGraphsElement = document.getElementById('moderation-graphs')
if (moderationGraphsElement) {
    renderDates()
    renderGraph1()
    renderGraph2()
    renderGraph3()
    renderGraph4()
}
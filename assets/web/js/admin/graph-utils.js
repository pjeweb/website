import set from 'date-fns/set'
import add from 'date-fns/add'
import isBefore from 'date-fns/isBefore'
import format from 'date-fns/format'

const getToday0100 = () => set(new Date(),{hours: 1, minutes: 0, seconds: 0, milliseconds: 0})

const fillGraphDates = function (data, property, timeRange, timeUnit, format1, format2, addon) {
    const dataSet = []
    const dataLabels = []
    const dates = []
    const a = add(getToday0100(), {[timeUnit]: timeRange})
    const b = getToday0100()

    for (let m = a; isBefore(m, b) || m.getTime() === b.getTime(); m = add(m, {[timeUnit]: 1})) {
        dates.push(format(m, format1) + addon)
        dataLabels.push(format(m, format2))
        dataSet.push(0)
    }

    for (let i = 0; i < data.length; ++i) {
        let x = dates.indexOf(data[i].date)
        if (x !== -1) {
            dataSet[x] = data[i][property]
        }
    }

    return {
        labels: dataLabels,
        data: dataSet,
    }
}

export const prepareGraphData = function (data, property, timeRange, timeUnit) {
    let graphData = {}

    switch (timeUnit.toUpperCase()) {
        case 'DAYS':
            graphData = fillGraphDates(data, property, timeRange, timeUnit, 'yyyy-MM-dd', 'MM/d', '')
            break

        case 'MONTHS':
            graphData = fillGraphDates(data, property, timeRange, timeUnit, 'yyyy-MM', 'yy/MM', '-01')
            break

        case 'YEARS':
            graphData = fillGraphDates(data, property, timeRange, timeUnit, 'yyyy', 'yyyy', '-01-01')
            break
    }

    return graphData
}


export const formatCurrency = function (label) {
    return '$' + label.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

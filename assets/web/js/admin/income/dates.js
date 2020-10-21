import add from 'date-fns/add'
import format from 'date-fns/format'

let currDate = new Date()

const listeners = []

function trigger() {
    listeners.forEach(listener => listener(currDate))
}

export function registerListener(listener) {
    listeners.push(listener)
}

export function getCurrentDate() {
    return currDate
}

export function renderDateSelector() {
    const datesElement = document.getElementById('income-dates')
    const dateDisplayElement = datesElement.querySelector('.js-dgg-date-selector-date')

    datesElement.querySelector('.js-dgg-date-selector-left').addEventListener('click', () => {
        currDate = add(currDate, {months: -1})
        dateDisplayElement.textContent = format(currDate, 'MMMM yyyy')
        trigger()
    })

    datesElement.querySelector('.js-dgg-date-selector-right').addEventListener('click', () => {
        currDate = add(currDate, {months: 1})
        dateDisplayElement.textContent = format(currDate, 'MMMM yyyy')
        trigger()
    })

    dateDisplayElement.textContent = format(currDate, 'MMMM yyyy')
}
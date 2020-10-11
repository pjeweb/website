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

export function renderDates() {
    const datesElement = document.getElementById('moderation-dates')
    const datesIn = datesElement.querySelector('span.date')

    datesElement.querySelector('.fa-arrow-left').addEventListener('click', () => {
        currDate = add(currDate, {months: -1})
        datesIn.textContent = currDate.format('MMMM yyyy')
        trigger()
    })

    datesElement.querySelector('.fa-arrow-right').addEventListener('click', () => {
        currDate = add(currDate, {months: 1})
        datesIn.textContent = format(currDate, 'MMMM yyyy')
        trigger()
    })

    datesIn.textContent = format(currDate, 'MMMM yyyy')
}
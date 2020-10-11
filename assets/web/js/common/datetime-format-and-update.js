import formatDate from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export const applyMomentToElement = function (element) {
    const format = element.getAttribute('data-format') || 'MMMM Do, h:mm:ss a'
    let datetime = element.getAttribute('data-datetime') || element.getAttribute('datetime') || element.textContent
    if (datetime === 'true') {
        datetime = element.getAttribute('title')
    }

    if (!element.getAttribute('title')) {
        element.setAttribute('title', datetime)
    }

    if (element.getAttribute('data-moment-fromnow')) {
        element.classList.add('moment-update')
        element.innerHTML = formatDistanceToNow(new Date(datetime), {addSuffix: true})
    } else {
        element.innerHTML = formatDate(new Date(datetime), format)
    }

    element.setAttribute('data-datetime', datetime)
    element.classList.add('moment-set')
}

const applyMomentUpdate = function () {
    document.querySelectorAll('time.moment-update').forEach(element => {
        applyMomentToElement(element)
    })
}

export const applyMomentToElements = function () {
    document.querySelectorAll('time[data-moment]:not(.moment-set)').forEach(element => {
        applyMomentToElement(element)
    })
}

window.setInterval(applyMomentUpdate, 30000)
const AUTO_HIDE_TIME = 7000 // ms
const HIDE_ANIMATION_DURATION = 500 // ms
const MAX_NUMBER_ALERTS = 2

const alertsRootElement = document.getElementById('alerts-container')

const show = function (alertElement) {
    // auto hide
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove()
        }
    }, AUTO_HIDE_TIME)

    // ensure limit
    const alertElements = Array.from(alertsRootElement.querySelectorAll('.alert-container'))
    const numberOfActiveAlerts = alertElements.length
    if (numberOfActiveAlerts > MAX_NUMBER_ALERTS) {
        const lastAlertElement = alertElements[numberOfActiveAlerts - 1]
        lastAlertElement.classList.add('alert-fade-out')
        setTimeout(() => lastAlertElement.remove(), HIDE_ANIMATION_DURATION)
    }

    setTimeout(() => {
        alertElement.classList.add('show')
    }, 1)
}

function createAndShowAlert(message,  title = 'Info', mod = 'info') {
    if (!alertsRootElement) {
        console.error('#alerts-container missing in DOM')
        return
    }

    const alertElement = document.createElement('div')
    alertElement.className = 'alert-container'
    alertElement.innerHTML = `
        <div class="alert alert-${mod} alert-dismissable">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">&times;</button>
            <strong><i class="fas fa-check-square"></i> ${title}</strong>
            <div>${message}</div>
        </div>
        `
    alertsRootElement.prepend(alertElement)
    show(alertElement)
}

export function alertSuccess(message) {
    createAndShowAlert(message, 'Success', 'info')
}

export function alertDanger(message) {
    createAndShowAlert(message, 'Error', 'danger')
}

// show alerts already existing in DOM
if (alertsRootElement) {
    alertsRootElement.querySelectorAll('.alert-container').forEach(alertElement => {
        show(alertElement)
    })
}
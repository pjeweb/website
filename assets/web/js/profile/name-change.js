import {debounce} from 'throttle-debounce'

const nameChangeFormElement = document.querySelector('form#nameForm')
if (nameChangeFormElement) {
    const nameChangeElement = document.querySelector('input#nameChange')

    const nameChangeAlertElement = document.querySelector('#nameChangeAlert')

    function alertContent(value) {
        const pElement = nameChangeAlertElement.querySelector('p')
        if (value) {
            pElement.innerHTML = value
        }
        return pElement.innerHTML
    }

    const alertContentDefault = alertContent()
    const alertContentSuccess = '<i class="fas fa-fw fa-check-circle"></i>&nbsp;Click <strong>here</strong> to confirm your username!'


    let isValidName = false
    const onUsernameChange = function () {
        const username = nameChangeElement.value
        if (username === '') {
            alertContent(alertContentDefault)
            return
        }

        fetch('/profile/usernamecheck?' + new URLSearchParams({username}).toString())
            .then(response => response.json())
            .then(data => {
                if (data) {
                    if (data.success === true) {
                        nameChangeAlertElement.removeClass('alert-danger').addClass('alert-success')
                        alertContent(alertContentSuccess)
                        isValidName = true
                    } else {
                        nameChangeAlertElement.removeClass('alert-success').addClass('alert-danger')
                        const msg = data.error || 'Username already exists, try another!'
                        alertContent(`<i class="fas fa-fw fa-times-circle"></i>&nbsp;${msg}`)
                    }
                } else {
                    nameChangeAlertElement.removeClass('alert-success').addClass('alert-danger')
                }
            })
    }

    nameChangeAlertElement.addEventListener('click', e => {
        e.preventDefault()

        if (isValidName) {
            nameChangeFormElement.submit()
        }
    })

    const nameChangeBackDropElement = document.querySelector('#nameChangeBackDrop')
    nameChangeBackDropElement.addEventListener('click', e => {
        e.preventDefault()
        nameChangeElement.blur()
        nameChangeElement.focus()
    })

    const debouncedOnUsernameChange = debounce(250, false, onUsernameChange)
    nameChangeElement.addEventListener('keyup', debouncedOnUsernameChange)
    nameChangeElement.addEventListener('change', debouncedOnUsernameChange)
}
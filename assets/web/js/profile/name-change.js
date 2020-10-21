import {debounce} from 'throttle-debounce'

const nameChangeElement = document.querySelector('input#nameChange')
if (nameChangeElement) {
    const nameChangeFormElement = document.querySelector('form#nameForm')
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

        fetch(`/profile/usernamecheck?${new URLSearchParams({username}).toString()}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    if (data.success === true) {
                        nameChangeAlertElement.classList.remove('alert-danger')
                        nameChangeAlertElement.classList.add('alert-success')
                        alertContent(alertContentSuccess)
                        isValidName = true
                    } else {
                        nameChangeAlertElement.classList.remove('alert-success')
                        nameChangeAlertElement.classList.add('alert-danger')
                        const msg = data.error || 'Username already exists, try another!'
                        alertContent(`<i class="fas fa-fw fa-times-circle"></i>&nbsp;${msg}`)
                    }
                } else {
                    nameChangeAlertElement.classList.remove('alert-success')
                    nameChangeAlertElement.classList.add('alert-danger')
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
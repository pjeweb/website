// TODO: replace modal from bootstrap/jquery with something else?
import $ from 'jquery'

const userDetailsFormElement = document.querySelector('form#user-details')

if (userDetailsFormElement) {
    const usernameWarningModalElement = document.querySelector('#username-warning-modal')
    const usernameInputElement = document.querySelector('#inputUsername')
    const updateAnywayElement = usernameWarningModalElement.querySelector('button#update-anyway')

    const onSubmit = function (e) {
        e.preventDefault()

        fetch(`/profile/username/similaremotes?${new URLSearchParams({username: usernameInputElement.value}).toString()}`)
            .then(response => response.json())
            .then(response => {
                if ('error' in response) {
                    $(document).alertDanger(response.error.message, {delay: 3000})
                    return
                }

                const emotes = response.data.emotes
                if (emotes.length) {
                    // Display modal that warns the user if there are similar emotes.
                    usernameWarningModalElement.querySelectorAll('.modal-body p .username').forEach(userNameElement => {
                        userNameElement.textContent = usernameInputElement.value
                    })
                    usernameWarningModalElement.querySelectorAll('.modal-body p .emotes').forEach(emotesElement => {
                        emotesElement.textContent = emotes.join(', ')
                    })

                    $(usernameWarningModalElement).modal('show')
                } else {
                    // Remove this submit handler and submit the form normally.
                    userDetailsFormElement.removeEventListener('submit', onSubmit)
                    userDetailsFormElement.submit()
                }
            })
    }

    userDetailsFormElement.addEventListener('submit', onSubmit)

    updateAnywayElement.addEventListener('click', () => {
        document.querySelector('input#skipEmoteCheck').value = 'true'
        userDetailsFormElement.removeEventListener('submit', onSubmit)
        userDetailsFormElement.submit()
    })
}
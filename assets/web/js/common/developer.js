if (document.body.id === 'developer') {
    document.getElementById('btn-create-app').addEventListener('click', e => {
        e.preventDefault()

        const recaptchaElement = document.getElementById('recaptcha1')
        const form = e.target.closest('form')
        if (recaptchaElement.classList.contains('hidden')) {
            recaptchaElement.classList.remove('hidden')
        } else {
            form.submit()
        }
    })

    document.getElementById('btn-create-key').addEventListener('click', e => {
        e.preventDefault()

        const recaptchaElement = document.getElementById('recaptcha2')
        const form = e.target.closest('form')
        if (recaptchaElement.classList.contains('hidden')) {
            recaptchaElement.classList.remove('hidden')
        } else {
            form.submit()
        }
    })

    const createSecretButtonElement = document.getElementById('app-form-secret-create')
    if (createSecretButtonElement) {
        const formElement = document.getElementById('app-form')

        createSecretButtonElement.addEventListener('click', e => {
            e.preventDefault()

            if (confirm('Are you sure? This will invalidate the previous secret.')) {
                const id = createSecretButtonElement.getAttribute('data-id')
                const secretInputElement = formElement.querySelector('input[name="secret"]')

                fetch('/profile/app/secret', {
                    method: 'POST',
                    body: new URLSearchParams({id}).toString()
                })
                    .then(response => response.json())
                    .then(data => {
                        secretInputElement.value = data.secret
                    })
            }
        })
    }
}
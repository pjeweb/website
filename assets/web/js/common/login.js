// TODO: replace modal from bootstrap/jquery with something else?
import $ from 'jquery'

const KEYCODE_ENTER = 13

const selectFollowUri = function (formElement) {
    let follow = ''
    try {
        const targetWindow = window.self !== window.top ? window.top : window
        const a = document.createElement('a')
        a.href = targetWindow.location.href.toString()
        follow = a.pathname + a.hash + a.search
    } catch (ignored) {
    }

    formElement.querySelector('input[name="follow"]').value = follow
}

const submitLogin = function (formElement, provider) {
    formElement.querySelector('input[name="authProvider"]').value = provider
    formElement.submit()
}

const setupLoginForm = function (formElement) {
    formElement.querySelectorAll('#loginproviders .btn').forEach(buttonElement => {
        const provider = buttonElement.getAttribute('data-provider')

        buttonElement.addEventListener('click', e => {
            e.preventDefault()

            submitLogin(formElement, provider)
        })

        buttonElement.addEventListener('keyup', e => {
            e.preventDefault()

            if (e.keyCode === KEYCODE_ENTER) {
                submitLogin(formElement, provider)
            }
        })
    })
}

const loginModalFormElement = document.querySelector('#loginmodal form')
if (loginModalFormElement) {
    loginModalFormElement.addEventListener('submit', () => selectFollowUri(loginModalFormElement))
    setupLoginForm(loginModalFormElement)
}

const loginFormElement = document.getElementById('loginform')
if (loginFormElement) {
    setupLoginForm(loginFormElement)
}

// may be called by dgg-chat-gui
window.showLoginModal = () => {
    $('#loginmodal').modal('show')
}
// TODO: replace modal, button from bootstrap/jquery with something else?
import $ from 'jquery'

import createEventListenerMatching from '../helpers/createEventListenerMatching'
import {alertSuccess} from '../common/alerts'

// COMPOSE
const KEYCODE_SPACE = 32
const KEYCODE_ENTER = 13

const MESSAGE_LIMIT_CHARS = 500

const composeModalElement = document.querySelector('#compose.message-composition')

if (composeModalElement) {
    const modalMessageElement = composeModalElement.querySelector('.modal-message')
    const formElement = composeModalElement.querySelector('#compose-form')
    const messageElement = formElement.querySelector('textarea#compose-message')
    const recipientsElement = formElement.querySelector('input#compose-recipients')
    const recipientsContainerElement = formElement.querySelector('.modal-recipients .recipient-container')
    const submitButtonElement = formElement.querySelector('button#modal-send-btn')
    const closeButtonElement = formElement.querySelector('button#modal-close-btn')
    const userGroupsElement = formElement.querySelector('.modal-user-groups')

    let saveStateOnClose = false

    const disableMessageForm = function () {
        formElement.querySelectorAll('button, input, textarea')
            .forEach(inputElement => inputElement.setAttribute('disabled', 'disabled'))
    }

    const enableMessageForm = function () {
        formElement.querySelectorAll('button, input, textarea')
            .forEach(inputElement => inputElement.removeAttribute('disabled'))
    }

    const resetForm = function () {
        messageElement.value = ''
        recipientsElement.value = ''
        recipientsContainerElement.innerHTML = ''
        modalMessageElement.style.display = 'none'
        enableMessageForm()
    }

    const sendMessage = function () {
        const message = messageElement.value
        const recipients = getRecipientLabels()

        if (recipients.length === 0) {
            modalMessageElement.style.display = ''
            modalMessageElement.innerHTML = '<span class="text-danger">Recipients required</span>'
            return
        }
        if (message.trim() === '') {
            modalMessageElement.style.display = ''
            modalMessageElement.innerHTML = '<span class="text-danger">Message required</span>'
            return
        }
        if (message.trim().length > MESSAGE_LIMIT_CHARS) {
            modalMessageElement.style.display = ''
            modalMessageElement.innerHTML = `<span class="text-danger">Your message cannot be longer than ${MESSAGE_LIMIT_CHARS} characters</span>`
            return
        }

        disableMessageForm()
        modalMessageElement.style.display = ''
        modalMessageElement.innerHTML = '<i class="fas fa-cog fa-spin"></i> Sending message ...'

        saveStateOnClose = true


        const params = new URLSearchParams()
        params.append('message', message)
        recipients.forEach(recipient => {
            params.append('recipients[]', recipient)
        })

        fetch('/profile/messages/send', {
            method: 'POST',
            body: params,
        })
            .then(response => {
                saveStateOnClose = false

                if (response.ok) {
                    return response.json()
                } else {
                    const error = new Error()
                    error.status = response.status
                    error.statusText = response.statusText
                    throw error
                }
            })
            .then(data => {
                if (data.success === true) {
                    alertSuccess('Your message has been sent.', {delay: 3000})
                    composeModalElement.modal('hide')
                } else {
                    modalMessageElement.style.display = ''
                    modalMessageElement.innerHTML = `<span class="text-danger">${data.message}</span>`
                    enableMessageForm()
                }
            })
            .catch(error => {
                modalMessageElement.style.display = ''
                modalMessageElement.innerHTML = `<span class="text-danger">${error.status}: ${error.statusText}</span>`
            })
    }

    const splitRecipientString = function (str) {
        return str.split(' ').filter(e => e.search(/^[A-Z0-9_]{3,20}$/i) === 0)
    }

    const addRecipientLabel = function (recipient, style = '') {
        const id = recipient.toLowerCase()
        if (!recipientsContainerElement.querySelector(`.recipient[data-recipient="${id}"]`)) {
            recipientsContainerElement.innerHTML +=
                `<span class="recipient ${style}" data-recipient="${id}">` +
                `<span class="recipient-name">${recipient}</span>` +
                `<i class="glyphicon glyphicon-remove remove-recipient" title="Remove"></i>` +
                `</span>`
        }
    }

    const getRecipientLabels = function () {
        return (
            Array.from(recipientsContainerElement.querySelectorAll('.recipient'))
                .map(recipientElement => recipientElement.getAttribute('data-recipient'))
        )
    }

    composeModalElement.addEventListener('keydown', () => {
        modalMessageElement.style.display = 'none'
    })

    const $composeModalElement = $(composeModalElement)
    $composeModalElement.on('shown.bs.modal', e => {
        e.currentTarget.querySelector('input#compose-recipients').focus()
    })
    $composeModalElement.on('hidden.bs.modal', () => {
        if (!saveStateOnClose) {
            resetForm()
        }
    })

    composeModalElement.addEventListener('click', createEventListenerMatching('.remove-recipient', (e, removeRecipientElement) => {
        removeRecipientElement.closest('.recipient').remove()
    }))

    const composeRecipientsInputElement = composeModalElement.querySelector('input#compose-recipients')

    composeRecipientsInputElement.addEventListener('change', e => {
        splitRecipientString(e.target.value).forEach(addRecipientLabel)
        recipientsElement.value = ''
    })

    composeRecipientsInputElement.addEventListener('keypress', e => {
        const delimiterCharRegex = /[;:,']/i
        const key = e.which

        if (key === KEYCODE_SPACE || key === KEYCODE_ENTER || delimiterCharRegex.test(String.fromCharCode(key))) {
            e.preventDefault()
            e.stopPropagation()

            splitRecipientString(e.target.value).forEach(addRecipientLabel)
            recipientsElement.value = ''
        }
        recipientsElement.focus()
    })

    closeButtonElement.addEventListener('click', () => {
        $(composeModalElement).modal('hide')
    })

    submitButtonElement.addEventListener('click', sendMessage)

    messageElement.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.keyCode === KEYCODE_ENTER) {
            e.preventDefault()
            e.stopPropagation()
            sendMessage()
        }
    })

    userGroupsElement.addEventListener('click', createEventListenerMatching('.groups a', (e, groupsLinkElement) => {
        addRecipientLabel(groupsLinkElement.textContent, 'group')
    }))

    const inboxMessageReplyElement = document.getElementById('inbox-message-reply')
    if (inboxMessageReplyElement) {
        inboxMessageReplyElement.addEventListener('click', () => {
            const $composeModalElement = $(composeModalElement)

            $composeModalElement.unbind('shown.bs.modal')
            $composeModalElement.on('shown.bs.modal', () => {
                composeModalElement.querySelector('textarea').focus()
            })

            composeModalElement.querySelector('#composeLabel').textContent = 'Reply ...'
            composeModalElement.querySelectorAll('.modal-recipients, .modal-settings, .modal-user-groups').forEach(element => {
                element.style.display = 'none'
            })

            recipientsElement.value = ''
            recipientsContainerElement.innerHTML = ''
            addRecipientLabel(inboxMessageReplyElement.getAttribute('data-replyto'))
        })
    }
}
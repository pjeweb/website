import {formatMessage} from './formatters'
import {toggleShowMoreBtn} from './common/toggle-show-more-button'
import {fadeIn, fadeOut} from '../helpers/fade'
import {applyMomentToElements} from '../common/datetime-format-and-update'

// INBOX
const inboxTableElement = document.getElementById('inbox-list')
if (inboxTableElement) {
    const inboxToolsFormElement = document.querySelector('form#inbox-tools-form')
    const inboxToolsElement = document.getElementById('inbox-tools')
    const btnToggleElement = inboxToolsElement.querySelector('#inbox-toggle-select')
    const btnReadSelectedElement = inboxToolsElement.querySelector('#inbox-read-selected')
    const btnDeleteElement = inboxToolsElement.querySelector('#inbox-delete-selected')
    const btnShowMoreElement = document.getElementById('inbox-list-more')
    const inboxLoadingElement = document.getElementById('inbox-loading')
    const inboxEmptyElement = document.getElementById('inbox-empty')
    const modalDeleteElement = document.getElementById('inbox-modal-delete')

    let start = 0
    let pageSize = 25

    const toggleToolsBasedOnSelection = function () {
        const someSelected = getActiveSelectorElements().length

        if (someSelected) {
            btnReadSelectedElement.removeAttribute('disabled')
            btnDeleteElement.removeAttribute('disabled')
        } else {
            btnReadSelectedElement.setAttribute('disabled', 'disabled')
            btnDeleteElement.setAttribute('disabled', 'disabled')
        }
    }

    const getActiveSelectorElements = function () {
        return Array.from(inboxTableElement.querySelectorAll('tbody td.selector.active'))
    }

    const toggleSelectorElement = function (selectorElement) {
        const activate = selectorElement.classList.contains('active')
        selectorElement.classList[activate ? 'add' : 'remove']('active')
        selectorElement.querySelector('i').className = activate ? 'far fa-dot-circle' : 'far fa-circle'
        toggleToolsBasedOnSelection()
    }

    const toggleRowClick = function (e) {
        const userid = e.target.getAttribute('data-id')
        if (userid !== undefined) {
            e.preventDefault()
            e.stopPropagation()
            window.location.href = `/profile/messages/${encodeURIComponent(userid)}`
        }
    }

    const toggleRowSelector = function (e) {
        e.preventDefault()
        e.stopPropagation()

        toggleSelectorElement(e.target)
    }

    inboxTableElement.addEventListener('click', e => {
        if (e.target.matches('tbody tr')) {
            toggleRowClick(e)
        } else if (e.target.matches('tbody td.selector')) {
            toggleRowSelector(e)
        }
    })

    inboxTableElement.addEventListener('mousedown', e => {
        if (e.target.matches('tbody tr')) {
            e.target.classList.add('pressed')
        }
    })

    inboxTableElement.addEventListener('mouseup', e => {
        if (e.target.matches('tbody tr')) {
            e.target.classList.remove('pressed')
        }
    })

    btnToggleElement.addEventListener('click', e => {
        e.preventDefault()
        inboxTableElement.querySelectorAll('.selector').forEach(toggleSelectorElement)
    })

    btnReadSelectedElement.addEventListener('click', e => {
        e.preventDefault()

        const selectedIds = getActiveSelectorElements()
            .map(selectorElement => selectorElement.closest('tr').getAttribute('data-id'))

        inboxToolsFormElement.setAttribute('action', '/profile/messages/read')
        selectedIds.forEach(id => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'selected[]'
            input.value = id
            inboxToolsFormElement.append(input)
        })
        inboxToolsFormElement.submit()
    })

    btnDeleteElement.addEventListener('click', e => {
        const selectedIds = getActiveSelectorElements()
            .map(selectorElement => selectorElement.closest('tr').getAttribute('data-id'))

        modalDeleteElement.querySelector('.modal-body').innerHTML =
            `<div>Are you sure you want to delete ${selectedIds.length} conversation(s)?</div>` +
            '<div>This cannot be undone.</div>'

        const buttonElements = modalDeleteElement.querySelectorAll('button')
        modalDeleteElement.addEventListener('click', e => {
            if (e.target.matches('#deleteConversation')) {
                buttonElements.forEach(buttonElement => {
                    buttonElement.setAttribute('disabled', 'disabled')
                })

                inboxToolsFormElement.setAttribute('action', '/profile/messages/delete')
                inboxToolsFormElement.innerHTML += selectedIds.map(id => `<input type="hidden" name="selected[]" value="${id}">`).join('')
                inboxToolsFormElement.submit()
            }
        })

        $(modalDeleteElement).modal('show')
    })

    const renderMessage = function (msg) {
        let message = formatMessage(msg.message)

        return (
            `<tr data-id="${msg.userid}" data-username="${msg.user}" class="${msg.unread <= 0 ? 'read' : 'unread'}">` +
            `<td class="selector"><i class="far fa-circle"></i></td>` +
            `<td class="from">` +
            `<a href="/profile/messages/${msg.userid}">${msg.user}</a> ` +
            `<span class="count">(${msg.unread > 0 ? msg.unread : parseInt(msg.read) + parseInt(msg.unread)})</span>` +
            `</td>` +
            `<td class="message-txt"><span>${message}</span></td>` +
            `<td class="timestamp"><time data-moment>${msg.timestamp}</time></td>` +
            `</tr>`
        )
    }

    const displayInbox = function (data) {
        start += pageSize

        const newMessages = (data || []).map(renderMessage).join('')
        inboxTableElement.querySelector('table#inbox-message-grid tbody').innerHTML += newMessages

        toggleShowMoreBtn(btnShowMoreElement, data, pageSize)
        inboxEmptyElement.style.display = (start === pageSize && data.length === 0) ? '' : 'none'
        fadeOut(inboxLoadingElement)
        applyMomentToElements()
    }

    const loadInbox = function (e) {
        e.preventDefault()

        fadeIn(inboxLoadingElement)

        fetch('/api/messages/inbox?' + new URLSearchParams({s: `${start}`}).toString())
            .then(response => response.json())
            .then(displayInbox)
    }

    btnShowMoreElement.addEventListener('click', loadInbox)
    loadInbox()
}

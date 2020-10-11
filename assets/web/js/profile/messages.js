// TODO: replace modal from bootstrap/jquery with something else?
// TODO re-implement emotes in private messages

import $ from 'jquery'

import {formatMessage} from './formatters'
import {toggleShowMoreBtn} from './common/toggle-show-more-button'
import {fadeIn, fadeOut} from '../helpers/fade'
import {applyMomentToElements} from '../common/datetime-format-and-update'

const messageTableElement = document.getElementById('message-list')
if (messageTableElement) {
    const inboxToolsFormElement = document.querySelector('form#inbox-tools-form')
    const userid = messageTableElement.data('userid')
    const username = messageTableElement.data('username')
    const inboxLoadingElement = document.getElementById('inbox-loading')
    const btnShowMoreElement = document.getElementById('inbox-list-more')
    const btnDeleteElement = document.getElementById('inbox-delete-selected')
    const inboxEmptyElement = document.getElementById('inbox-empty')
    const modalDeleteElement = document.getElementById('inbox-modal-delete')

    let start = 0
    let pageSize = 25

    const renderMessage = function (msg) {
        const messageText = formatMessage(msg.message)
        const isMe = parseInt(userid) !== parseInt(msg.userid)
        const isRead = msg.isread === 1

        return (
            `<tr data-id="${msg.id}" data-username="${msg.from}" class="message-active message-${isMe ? 'me' : 'notme'} message-${isRead ? 'read' : 'unread'}">` +
            `<td class="message">` +
            `<div class="message-header">` +
            `<div class="from">` +
            `<i title="${isRead ? 'Opened' : 'Unopened'}" class="fa fa-fw fa-dgg-${isRead ? 'read' : 'unread'}"></i>` +
            `<div class="username">${msg.from}</div>` +
            `<time class="timestamp" data-moment data-moment-fromnow="true">${msg.timestamp}</time>` +
            `</div>` +
            `<time class="timestamp" data-moment>${msg.timestamp}</time>` +
            `</div>` +
            `<div class="message-txt">${messageText}</div>` +
            `</td>` +
            `</tr>`
        )
    }

    const displayMessages = function (data) {
        start += pageSize
        messageTableElement.find('table#inbox-message-grid tbody').append((data.length ? data : []).map(renderMessage).join(''))
        toggleShowMoreBtn(btnShowMoreElement, data, pageSize)
        inboxEmptyElement.toggle(start === pageSize && data.length === 0)


        fadeOut(inboxLoadingElement)
        applyMomentToElements()
    }

    const loadMessages = function () {
        fadeIn(inboxLoadingElement)

        fetch(`/api/messages/usr/${encodeURIComponent(username.toLowerCase())}/inbox?${new URLSearchParams({s: `${start}`}).toString()}`)
            .then(response => response.json())
            .then(displayMessages)
    }

    btnShowMoreElement.on('click', loadMessages)
    loadMessages()

    btnDeleteElement.on('click', () => {
        const selectedIds = [messageTableElement.data('userid')]

        modalDeleteElement.querySelector('.modal-body').innerHTML =
            `<div>Are you sure you want to delete this entire conversation?</div>` +
            '<div>This cannot be undone.</div>'

        modalDeleteElement.addEventListener('click', e => {
            if (e.target.matches('#deleteConversation')) {
                inboxToolsFormElement.setAttribute('action', '/profile/messages/delete')
                selectedIds.forEach(id => {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = 'selected[]'
                    input.value = id
                    inboxToolsFormElement.append(input)
                })
                inboxToolsFormElement.submit()
            }
        })

        $(modalDeleteElement).modal('show')
    })

    document.getElementById('inbox-scroll-bottom').addEventListener('click', e => {
        e.preventDefault()

        window.scrollTo(0, document.body.scrollHeight)
    })

    document.getElementById('inbox-scroll-top').addEventListener('click', e => {
        e.preventDefault()

        window.scrollTo(0, 0)
    })
}
import {getPopupOptionsString} from '../common/popups'
import {applyOrientation, getOrientation, setOrientation} from './layout'

const CHAT_EMBED_URL = '/embed/chat'

const panelToolsElement = document.getElementById('chat-panel-tools')
let popoutWindow

function hideChat(chatIFrameElement) {
    document.body.classList.add('nochat')
    chatIFrameElement.src = '' // Instead of removing the node completely we just unload the iframe content so we can reanimate the chat e.g. if the popout was closed
}

// Chat top tools
if (panelToolsElement) {
    const chatIFrameElement = document.querySelector('#chat-wrap iframe')

    const popoutButtonElement = panelToolsElement.querySelector('#popout')
    if (popoutButtonElement) {
        popoutButtonElement.addEventListener('click', e => {
            e.preventDefault()

            popoutWindow = window.open(CHAT_EMBED_URL, '_blank', getPopupOptionsString())
            popoutWindow.addEventListener('beforeunload', () => {
                document.body.classList.remove('nochat')

                if (chatIFrameElement) {
                    chatIFrameElement.src = CHAT_EMBED_URL
                }
            })
            hideChat(chatIFrameElement)
        })
    }

    const refreshButtonElement = panelToolsElement.querySelector('#refresh')
    if (refreshButtonElement) {
        refreshButtonElement.addEventListener('click', e => {
            e.preventDefault()

            if (chatIFrameElement.contentWindow) {
                chatIFrameElement.contentWindow.location.reload()
            }
        })
    }

    const closeButtonElement = panelToolsElement.querySelector('#close')
    if (closeButtonElement) {
        closeButtonElement.addEventListener('click', e => {
            e.preventDefault()
            hideChat(chatIFrameElement)
        })
    }

    const swapButtonElement = panelToolsElement.querySelector('#swap')
    if (swapButtonElement) {
        swapButtonElement.addEventListener('click', e => {
            e.preventDefault()

            setOrientation(getOrientation() === '1' ? '0' : '1')
            applyOrientation()
        })
    }
}
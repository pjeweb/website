import {getPopupOptionsString} from '../common/popups'
import {applyOrientation, getOrientation, setOrientation} from './layout'

const chatPanelElement = document.getElementById('chat-panel')
const panelToolsElement = document.getElementById('chat-panel-tools')
const chatIFrameElement = document.querySelector('#chat-wrap iframe')

// Chat top tools
function onIframeLoaded() {
    const chatWindow = this.contentWindow
    if (!chatWindow) {
        return
    }

    panelToolsElement.addEventListener('click', e => {
        /** @var {Element} triggerElement */
        const triggerElement = e.target

        if (triggerElement.id === 'popout') {
            e.preventDefault()

            window.open('/embed/chat', '_blank', getPopupOptionsString())
            document.body.classList.add('nochat')
            chatPanelElement.remove()
        } else if (triggerElement.id === 'refresh') {
            e.preventDefault()

            chatWindow.location.reload()
        } else if (triggerElement.id === 'close') {
            e.preventDefault()

            document.body.classList.add('nochat')
            chatPanelElement.remove()
        } else if (triggerElement.id === 'swap') {
            e.preventDefault()

            setOrientation(getOrientation() === '1' ? '0' : '1')
            applyOrientation()
        }
    })
}

chatIFrameElement.addEventListener('load', onIframeLoaded)
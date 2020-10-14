// Bigscreen resize bar / drag resize
import {getOrientation as getLayoutOrientation, getWidth as getLayoutWidth} from './layout'

const minWidth = 300 // pixels
const maxSizePercent = 76.6666

const chatPanelElement = document.getElementById('chat-panel')
const resizeBarElement = document.getElementById('chat-panel-resize-bar')

const overlayElement = document.createElement('div')
overlayElement.className = 'overlay'

function getSize() {
    return parseFloat(localStorage.getItem('bigscreen.chat.size') || 20.00)
}

function setSize(percentage) {
    const percent = (getLayoutOrientation() === '0') ? 100 - percentage : percentage
    localStorage.setItem('bigscreen.chat.size', Math.min(maxSizePercent, Math.max(0, percent)).toFixed(4))
}

function applySize() {
    const percent = getSize()
    const minPercent = (minWidth / getLayoutWidth() * 100)

    chatPanelElement.style.width = percent > minPercent ? Math.max(minPercent, percent) + '%' : 'inherit'
}

function onResizeStart(e) {
    e.preventDefault()

    const startClientX = e.clientX || e.originalEvent['touches'][0].clientX || 0
    const resizeBarOffsetLeft = resizeBarElement.getBoundingClientRect().left + window.pageXOffset
    const chatPanelOffsetLeft = chatPanelElement.getBoundingClientRect().left + window.pageXOffset
    const startPosX = resizeBarOffsetLeft - chatPanelOffsetLeft

    const clientWidth = getLayoutWidth()
    resizeBarElement.classList.add('active')

    let clientX = -1

    function onResizeEnd() {
        e.preventDefault()
        if (clientX === -1) {
            return
        }

        document.body.removeEventListener('mouseup', onResizeEnd)
        document.body.removeEventListener('touchend', onResizeEnd)
        document.body.removeEventListener('mousemove', onResizeMove)
        document.body.removeEventListener('touchmove', onResizeMove)

        //const clientX = e.clientX || e.originalEvent['touches'][0].clientX || 0
        setSize((clientX / clientWidth) * 100)

        resizeBarElement.classList.remove('active')
        resizeBarElement.removeAttribute('style')
        overlayElement.remove()
        applySize()
    }

    function onResizeMove(e) {
        clientX = e.clientX || e.originalEvent['touches'][0].clientX || 0
        resizeBarElement.style.left = `${startPosX + (clientX - startClientX)}px`
    }

    document.body.addEventListener('mouseup', onResizeEnd)
    document.body.addEventListener('touchend', onResizeEnd)
    document.body.addEventListener('mousemove', onResizeMove)
    document.body.addEventListener('touchmove', onResizeMove)

    document.body.append(overlayElement)
}

resizeBarElement.addEventListener('mousedown', onResizeStart)
resizeBarElement.addEventListener('touchstart', onResizeStart)

applySize()
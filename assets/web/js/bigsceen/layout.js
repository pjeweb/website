const layoutElement = document.getElementById('bigscreen-layout')

export function getOrientation() {
    return localStorage.getItem('bigscreen.chat.orientation') || '0'
}

export function setOrientation(dir) {
    localStorage.setItem('bigscreen.chat.orientation', dir)
}

export function getWidth() {
    return layoutElement.offsetWidth
}

export function applyOrientation() {
    const dir = getOrientation()
    layoutElement.setAttribute('data-orientation', dir)

    switch (parseInt(dir)) {
        case 0:
            layoutElement.classList.remove('chat-left')
            layoutElement.classList.add('chat-right')
            break
        case 1:
            layoutElement.classList.remove('chat-right')
            layoutElement.classList.add('chat-left')
            break
    }
}

applyOrientation()
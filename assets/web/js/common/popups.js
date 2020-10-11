const popupDefaults = {
    height: 500,
    width: 420,
    scrollbars: 0,
    toolbar: 0,
    location: 0,
    status: 'no',
    menubar: 0,
    resizable: 0,
    dependent: 0,
}

export const getPopupOptionsString = options => {
    options = (!options) ? popupDefaults : Object.assign({}, popupDefaults, options)
    return Object.keys(options).map(k => `${k}=${options[k]}`).join(',')
}

// Generic popup links
document.body.addEventListener('click', function (e) {
    /** @var {HTMLAnchorElement} linkElement */
    const linkElement = e.target
    if (linkElement.matches('a.popup')) {
        e.preventDefault()

        const href = linkElement.getAttribute('href')
        const options = JSON.parse(linkElement.getAttribute('data-options'))
        window.open(href, '_blank', getPopupOptionsString(options))
    }
})
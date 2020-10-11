import {debounce} from 'throttle-debounce'

const flairSearchElement = document.getElementById('flair-search')
if (flairSearchElement) {
    const emoteGrid = document.getElementById('flair-grid')
    const emoteElements = emoteGrid.querySelectorAll('.image-grid-item')

    const debounced = debounce(50, false, () => {
        let search = flairSearchElement.value
        if (search && search.trim()) {
            search = search.trim().toLowerCase()

            emoteElements.forEach(emoteElement => {
                const matches = emoteElement.getAttribute('data-name').toLowerCase().indexOf(search) > -1
                emoteElement.classList[matches ? 'remove' : 'add']('hidden')
            })
        } else {
            emoteElements.classList.remove('hidden')
        }
    })
    flairSearchElement.addEventListener('keydown', e => debounced(e))
}
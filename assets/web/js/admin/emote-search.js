// TODO: replace modal from bootstrap/jquery with something else?
import $ from 'jquery'
import {debounce} from 'throttle-debounce'

const emoteSearchElement = document.getElementById('emote-search')
if (emoteSearchElement) {
    const emoteGrid = document.getElementById('emote-grid')
    const emotes = emoteGrid.querySelector('.image-grid-item')

    const debounced = debounce(50, false, () => {
        const search = emoteSearchElement.value
        if (search != null && search.trim() !== '') {
            emotes.forEach(emoteElement => {
                const matches = emoteElement.getAttribute('data-prefix').toLowerCase().indexOf(search.toLowerCase()) > -1
                emoteElement.classList[matches ? 'remove' : 'add']('hidden')
            })
        } else {
            emotes.classList.remove('hidden')
        }
    })
    emoteSearchElement.addEventListener('keydown', e => debounced(e))

    document.querySelectorAll('.preview-icon').forEach(previewIconElement => {
        previewIconElement.addEventListener('click', e => {
            const emoteId = previewIconElement.getAttribute('data-id')
            const modalElement = document.getElementById('emotePreviewModal')
            const $modal = $(modalElement)
            $modal.modal({show: false})

            fetch(`/admin/emotes/${emoteId}/preview`)
                .then(response => response.text())
                .then(data => {
                    modalElement.querySelector('.modal-body').innerHTML = data
                    $modal.modal({show: true})
                })
        })
    })
}
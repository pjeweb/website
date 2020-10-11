// TODO: replace modal from bootstrap/jquery with something else?
import $ from 'jquery'
import {debounce} from 'throttle-debounce'

const emoteSearchElement = document.getElementById('emote-search')
if (emoteSearchElement) {
    const emoteGrid = document.getElementById('emote-grid')
    const emotes = emoteGrid.find('.image-grid-item')

    const debounced = debounce(50, false, () => {
        const search = emoteSearchElement.value
        if (search != null && search.trim() !== '') {
            emotes.each((i, v) => {
                $(v).toggleClass('hidden', !(v.getAttribute('data-prefix').toLowerCase().indexOf(search.toLowerCase()) > -1))
            })
        } else {
            emotes.removeClass('hidden')
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
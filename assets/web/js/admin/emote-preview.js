// TODO: replace modal from bootstrap/jquery with something else?
import $ from 'jquery'

const emoteEditPreviewBtnElement = document.getElementById('emoteEditPreviewBtn')
if (emoteEditPreviewBtnElement) {
    emoteEditPreviewBtnElement.addEventListener('click', e => {
        const modalElement = document.getElementById('emotePreviewModal')
        const prefix = document.getElementById('inputPrefix').value
        const styles = document.getElementById('inputStyles').value
        const imageId = document.getElementById('inputImage').value

        const $modal = $(modalElement)
        $modal.modal({show: false})

        fetch('/admin/emotes/preview', {
            method: 'POST',
            body: new URLSearchParams({prefix, styles, imageId}).toString(),
        })
            .then(response => response.text())
            .then(html => {
                modalElement.querySelector('.modal-body').innerHTML = html
                $modal.modal({show: true})
            })
    })
}
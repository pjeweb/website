export const toggleShowMoreBtn = function (btnShowMoreElement, data, pageSize) {
    if (!data || data.length < pageSize) {
        btnShowMoreElement.textContent = 'The End'
        btnShowMoreElement.setAttribute('disabled', 'disabled')
        btnShowMoreElement.className = 'btn btn btn-dark'
        btnShowMoreElement.style.display = ''
    } else {
        btnShowMoreElement.textContent = 'Show more'
        btnShowMoreElement.removeAttribute('disabled')
        btnShowMoreElement.className = 'btn btn-primary'
        btnShowMoreElement.style.display = ''
    }
}
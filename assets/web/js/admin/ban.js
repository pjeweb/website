const deleteBanElement = document.getElementById('delete-ban')
if (deleteBanElement) {
    deleteBanElement.addEventListener('click', e => {
        if (!confirm('Are you sure?')) {
            e.preventDefault()
        }
    })
}
const flairContentElement = document.getElementById('flair-content')
if (flairContentElement) {
    const deleteFormElement = document.getElementById('delete-form')

    flairContentElement.querySelectorAll('.delete-item').forEach(deleteItemElement => {
        deleteItemElement.addEventListener('click', () => {
            if (confirm('This cannot be undone. Are you sure?')) {
                deleteFormElement.submit()
            }
        })
    })
}
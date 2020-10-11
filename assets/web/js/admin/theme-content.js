const themeContentElement = document.getElementById('theme-content')
if (themeContentElement) {
    document.querySelectorAll('.delete-item').forEach(deleteItemElement => {
        deleteItemElement.addEventListener('click', () => {
            if (confirm('This cannot be undone. Are you sure?')) {
                document.getElementById('delete-form').submit()
            }
        })
    })
}
const themeSelectElement = document.getElementById('themeSelect')
if (themeSelectElement) {
    themeSelectElement.addEventListener('change',  () => {
        window.location.href = `/admin/emotes?theme=${themeSelectElement.value}`
    })
}
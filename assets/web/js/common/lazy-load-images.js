// lazy loading images
document.querySelectorAll('img[data-src]').forEach(imageElement => {
    const url = imageElement.getAttribute('data-src')

    if (url) {
        const loader = new Image()
        loader.src = url

        imageElement.removeAttribute('data-src')
        imageElement.classList.add('is-loading')

        function onLoad() {
            removeListeners()
            imageElement.src = url
            imageElement.classList.remove('is-loading')
            imageElement.classList.remove('img_320x240')
            imageElement.classList.remove('img_64x64')
        }

        function onError() {
            removeListeners()
            imageElement.classList.remove('is-loading')
            imageElement.classList.add('is-invalid')
        }

        function removeListeners() {
            imageElement.removeEventListener('load', onLoad)
            imageElement.removeEventListener('error', onError)
        }

        imageElement.addEventListener('load', onLoad)
        imageElement.addEventListener('error', onError)
    }
})
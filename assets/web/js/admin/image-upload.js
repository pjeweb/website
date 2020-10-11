const fileInput = document.getElementById('file-input')

function uploadImage(imageView, data, success, failure) {
    const uploadAction = imageView.getAttribute('data-upload')
    const uploadUrl = imageView.getAttribute('data-cdn')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadAction, true)
    xhr.addEventListener('error', err => failure(err))
    xhr.addEventListener('abort', () => failure('aborted'))
    xhr.addEventListener('load', () => {
        try {
            const res = JSON.parse(xhr.responseText)[0]
            if (res['error']) {
                return failure(res['error'])
            }

            const img = imageView.querySelector('img') || new Image()
            img.setAttribute('width', res['width'])
            img.setAttribute('height', res['height'])
            img.setAttribute('src', uploadUrl + res['name'])
            imageView.querySelector('input[name="imageId"]').value = res['id']
            imageView.prepend(img)
            success(res)
        } catch (e) {
            failure(e)
        }
    })
    xhr.send(data)
}

function beginUpload(imageView, file) {
    const data = new FormData()
    data.append('files[]', file)
    imageView.classList.remove('error')
    imageView.classList.remove('success')
    imageView.classList.add('busy')
    uploadImage(imageView, data,
        () => {
            imageView.classList.add('success')
            imageView.classList.remove('busy')
        },
        () => {
            imageView.classList.add('error')
            imageView.classList.remove('busy')
        }
    )
    fileInput.value = ''
}

function dropHandler(ev) {
    const data = ev.originalEvent.dataTransfer
    const target = ev.currentTarget

    let file = null
    if (data.items) {
        if (data.items.length > 0 && data.items[0].kind === 'file') {
            file = data.items[0].getAsFile()
        }
    } else if (data.files.length > 0) {
        file = data.files[0]
    }

    if (file !== null) {
        beginUpload(target, file)
    }
}

let imageTarget = null
const imageViewElements = document.querySelectorAll('.image-view.image-view-upload')
imageViewElements.forEach(imageViewElement => {
    imageViewElement.addEventListener('click', e => {
        e.preventDefault()
        imageTarget = imageViewElement
        fileInput.click() // TODO: might not work for security reasons, maybe needs a simulated MouseEvent
    })

    imageViewElement.addEventListener('dragover', e => {
        e.preventDefault()
    })

    imageViewElement.addEventListener('drop', e => {
        e.preventDefault()
        dropHandler(e)
    })
})

if (fileInput) {
    fileInput.addEventListener('change', e => {
        e.preventDefault()
        beginUpload(imageTarget, fileInput[0].files[0])
        imageTarget = null
    })
}
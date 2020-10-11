document.addEventListener('dragover', () => {
    document.body.classList.add('drag-over')
})

const onEnd = function () {
    document.body.classList.remove('drag-over')
}

document.addEventListener('dragleave', onEnd)
document.addEventListener('drop', onEnd)
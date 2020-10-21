import createEventListenerMatching from '../helpers/createEventListenerMatching'

document.querySelectorAll('.color-select').forEach(colorSelectElement => {
    const onChange = createEventListenerMatching('input[type="text"]', (e, inputElement) => {
        const colorElement = inputElement.previousSibling
        colorElement.style.backgroundColor = inputElement.value
        colorElement.style.borderColor = inputElement.value
    })

    colorSelectElement.addEventListener('change', onChange)
    colorSelectElement.addEventListener('keyup', onChange)
})
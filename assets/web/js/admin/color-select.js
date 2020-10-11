document.querySelectorAll('.color-select').forEach(colorSelectElement => {
    const onChange = function (e) {
        /** @var {HTMLInputElement} inputElement */
        const inputElement  = e.target
        if (inputElement.matches('input[type="text"]')) {
            /** @var {HTMLDivElement} colorElement */
            const colorElement = inputElement.previousSibling

            colorElement.style.backgroundColor = inputElement.value
            colorElement.style.borderColor = inputElement.value
        }
    }

    colorSelectElement.addEventListener('change', onChange)
    colorSelectElement.addEventListener('keyup', onChange)
})
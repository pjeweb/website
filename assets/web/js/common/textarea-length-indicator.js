document.querySelectorAll('.text-message textarea[maxlength]').forEach(inputElement => {
    const max = inputElement.getAttribute('maxlength')
    const indicatorElement = document.createElement('div')
    indicatorElement.className = 'max-length-indicator'
    indicatorElement.textContent = max

    inputElement.addEventListener('keyup', () => {
        indicatorElement.textContent = `${max - inputElement.value.length}`
    })
    inputElement.after(indicatorElement)
});
// TODO: replace collapse from bootstrap/jquery with something else?

import $ from 'jquery'

document.querySelectorAll('.btn-show-all').forEach(buttonElement => {
    buttonElement.addEventListener('click', e => {
        e.preventDefault()

        $(document.body).find('.collapse').collapse('show')
    })
})

document.body.addEventListener('click', function (e) {
    const element = e.target
    if (element.getAttribute('data-toggle') === 'show') {
        e.preventDefault()

        const selector = element.getAttribute('href')
        const targetElement = document.querySelector(selector)
        targetElement.classList.add('show')
        element.style.display = 'none'
    }
})
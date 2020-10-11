document.querySelectorAll('.btn-post').forEach(linkElement => {
    linkElement.addEventListener('click', e => {
        e.preventDefault()

        const formElement = linkElement.closest('form')
        const confirmMessage = linkElement.getAttribute('data-confirm')

        if (!confirmMessage || confirm(confirmMessage)) {
            formElement.setAttribute('action', linkElement.getAttribute('href'))
            formElement.submit()
        }
    })
})
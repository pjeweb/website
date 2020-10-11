document.querySelectorAll('form.filter-form').forEach(function (formElement) {
    formElement.querySelectorAll('select').forEach(
        selectElement =>
            selectElement.addEventListener('change', () => formElement.submit())
    )

    formElement.querySelectorAll('button[type="reset"]').forEach(
        buttonElement =>
            buttonElement.addEventListener('click', () => {
                formElement.querySelectorAll('select, input[type="text"]').forEach(selectElement => {
                    selectElement.value = ''
                })
                formElement.submit()
            })
    )

    formElement.querySelectorAll('.pagination .page-link').forEach(linkElement => {
        linkElement.addEventListener('click', (e) => {
            e.preventDefault()

            formElement.querySelectorAll('input[name="page"]').forEach(inputElement => {
                inputElement.value = linkElement.getAttribute('data-page')
            })
            formElement.submit()
        })
    })

    formElement.querySelectorAll('table[data-sort]').forEach(tableElement => {
        const sort = tableElement.getAttribute('data-sort')
        const columnElement = tableElement.querySelector(`thead td[data-sort="${sort}"]`)

        const caretElement = document.createElement('i')
        caretElement.className = 'fas fa-caret-up mr-1'

        let order = tableElement.getAttribute('data-order')
        const applyCaret = order => {
            return order === 'ASC' ?
                caretElement.classList.remove('fa-caret-down').classList.add('fa-caret-up') :
                caretElement.classList.remove('fa-caret-up').classList.add('fa-caret-down')
        }

        tableElement.addEventListener('click', e => {
            /** @var {HTMLElement} td */
            const td = e.target
            if (td.matches('td[data-sort]')) {
                e.preventDefault()

                if (td.classList.contains('active')) {
                    order = order === 'ASC' ? 'DESC' : 'ASC'
                }

                const sort = td.getAttribute('data-sort')
                formElement.querySelectorAll('input[name="sort"]').forEach(inputElement => {
                    inputElement.value = sort
                })
                formElement.querySelectorAll('input[name="order"]').forEach(inputElement => {
                    inputElement.value = order
                })

                formElement.submit()
            }
        })

        applyCaret(order)

        columnElement
            .prepend(caretElement)
            .addClass('active')
    })
})
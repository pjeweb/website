import createEventListenerMatching from '../helpers/createEventListenerMatching'

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
            const asc = order === 'ASC'
            caretElement.classList[asc ? 'remove' : 'add']('fa-caret-down')
            caretElement.classList[asc ? 'add' : 'remove']('fa-caret-up')
        }

        tableElement.addEventListener('click', createEventListenerMatching('td[data-sort]', (e, td) => {
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
        }))

        applyCaret(order)

        columnElement.prepend(caretElement)
        columnElement.classList.add('active')
    })
})
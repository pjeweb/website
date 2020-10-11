const connectionsTableElement = document.getElementById('connections-content')

if (connectionsTableElement) {
    const btnToggleElement = document.getElementById('connectSelectToggleBtn')
    const btnRemoveElement = document.getElementById('connectRemoveBtn')
    const connectToolsFormElement = document.getElementById('connectToolsForm')

    const toggleToolsBasedOnSelection = function () {
        const someSelected = getActiveSelectorElements().length

        if (someSelected) {
            btnRemoveElement.removeAttribute('disabled')
        } else {
            btnRemoveElement.setAttribute('disabled', 'disabled')
        }
    }

    const getActiveSelectorElements = function () {
        return Array.from(connectionsTableElement.querySelectorAll('tbody td.selector.active'))
    }

    const toggleSelectorElement = function (selectorElement) {
        const activate = selectorElement.classList.contains('active')
        selectorElement.classList[activate ? 'add' : 'remove']('active')
        selectorElement.querySelector('i').className = activate ? 'far fa-dot-circle' : 'far fa-circle'
        toggleToolsBasedOnSelection()
    }

    btnToggleElement.addEventListener('click', e => {
        e.preventDefault()

        connectionsTableElement.querySelectorAll('.selector').forEach(toggleSelectorElement)
    })

    btnRemoveElement.addEventListener('click', e => {
        e.preventDefault()

        if (confirm('Are you sure? This cannot be undone!')) {
            const selectedIds = getActiveSelectorElements()
                .map(selectorElement => selectorElement.closest('tr').getAttribute('data-id'))

            connectToolsFormElement.setAttribute('action', '/profile/remove')
            selectedIds.forEach(id => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = 'selected[]'
                input.value = id
                connectToolsFormElement.append(input)
            })
            connectToolsFormElement.submit()
        }
    })

    connectionsTableElement.addEventListener('click', e => {
        if (e.target.matches('tbody td.selector')) {
            e.preventDefault()
            e.stopPropagation()

            toggleSelectorElement(e.target)
        }
    })
}
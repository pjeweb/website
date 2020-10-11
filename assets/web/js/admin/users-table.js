// TODO: replace modal from bootstrap/jquery with something else?
import $ from 'jquery'

const usersTableElement = document.getElementById('users-table')
if (usersTableElement) {
    const banUserBtnElement = document.getElementById('ban-users-btn')
    const deleteUserBtnElement = document.getElementById('delete-users-btn')
    let selected = []

    const getActiveSelectors = function () {
        return Array.from(usersTableElement.querySelectorAll('tbody td.selector.active'))
    }

    const toggleToolsBasedOnSelection = function () {
        selected = getActiveSelectors()
        const someSelected = selected.length > 0
        banUserBtnElement.classList[someSelected ? 'remove' : 'add']('disabled')
        deleteUserBtnElement.classList[someSelected ? 'remove' : 'add']('disabled')
    }

    const toggleSelector = function (selectorElement) {
        const activate = !selectorElement.classList.contains('active')
        selectorElement.classList[activate ? 'add' : 'remove']('active')
        selectorElement.querySelector('i').className = activate ? 'far fa-dot-circle' : 'far fa-circle'
        toggleToolsBasedOnSelection()
    }

    usersTableElement.addEventListener('click', e => {
        if (e.target.matches('tbody td.selector')) {
            e.preventDefault()
            toggleSelector(e.target)
        } else if (e.target.matches('thead td.selector')) {
            e.preventDefault()
            e.preventDefault()
            usersTableElement.querySelectorAll('.selector').forEach(toggleSelector)
        }
    })

    toggleToolsBasedOnSelection()

    const banUsersModalElement = document.getElementById('ban-users-modal')
    const banUsersModalFormElement = banUsersModalElement.querySelector('form')
    banUsersModalFormElement.addEventListener('submit', function () {
        banUsersModalElement.find('button').addClass('disabled')
        selected.forEach(selectedElement => {
            const id = selectedElement.getAttribute('data-id')
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'selected[]'
            input.value = id
            banUsersModalFormElement.append(input)
        })
    })

    $(banUsersModalElement).on('show.bs.modal', () => {
        banUsersModalElement.querySelector('.modal-message').innerHTML = `Do you want to Ban <strong>${selected.length}</strong> users? This cannot be undone.`
        banUsersModalElement.querySelector('[name="reason"]').focus()
    })

    $(banUsersModalElement).on('shown.bs.modal', () => {
        banUsersModalElement.querySelector('[name="reason"]').focus()
    })

    banUserBtnElement.addEventListener('click', e => {
        e.preventDefault()

        banUserBtnElement.parentElement.classList.toggle('show')
        $(banUsersModalElement).modal('show')
    })

    const deleteUsersModalElement = document.getElementById('delete-users-modal')
    const deleteUsersModalFormElement = deleteUsersModalElement.querySelector('form')
    deleteUsersModalFormElement.addEventListener('submit', () => {
        deleteUsersModalElement.querySelectorAll('button').forEach(buttonElement => {
            buttonElement.classList.add('disabled')
        })
        selected.forEach(selectedElement => {
            const id = selectedElement.getAttribute('data-id')
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'selected[]'
            input.value = id
            deleteUsersModalFormElement.append(input)
        })
    })

    $(deleteUsersModalElement).on('show.bs.modal', () => {
        deleteUsersModalElement.querySelector('.modal-message').innerHTML = `Do you want to Delete <strong>${selected.length}</strong> users? This cannot be undone.`
    })

    deleteUserBtnElement.addEventListener('click', e => {
        e.preventDefault()

        deleteUserBtnElement.parentElement.classList.toggle('show')
        $(deleteUsersModalElement).modal('show')
    })
}
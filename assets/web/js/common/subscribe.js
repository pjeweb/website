// TODO: replace slideToggle from jquery with something else?
import $ from 'jquery'

const searchUserFormElement = document.getElementById('#search-user')

if (searchUserFormElement) {
    const searchUserUsernameInputElement = searchUserFormElement.querySelector('#username-input')
    const searchUserValidFeedbackElement = searchUserFormElement.querySelector('.valid-feedback')
    const searchUserInvalidFeedbackElement = searchUserFormElement.querySelector('.invalid-feedback')
    const searchUserConfirmButtonElement = searchUserFormElement.querySelector(' > button:last-child')

    const periodsSelectablesElements = document.querySelectorAll('.periods .selectable')
    const selfSelectableElements = document.querySelectorAll('#self .selectable')
    const directGiftSelectableElements = document.querySelectorAll('#direct-gift .selectable')
    const massGiftSelectableElements = document.querySelectorAll('#mass-gift .selectable')

    const directGiftExpansionArrowElements = document.querySelector('#direct-gift .expansion-arrow')
    const gifteeFieldElement = document.querySelector('#direct-gift .value')

    const massGiftExpansionArrowElement = document.querySelector('#mass-gift .expansion-arrow')
    const quantityFieldElement = document.querySelector('#mass-gift .value')

    const quantitySelectorElement = document.getElementById('quantity-selector')
    const quantityButtonElements = quantitySelectorElement.querySelectorAll('.two-tone-button')
    //const staticQuantityButtonElements = quantitySelectorElement.querySelectorAll('#static-quantity-buttons .two-tone-button')
    const customQuantityButtonElement = quantitySelectorElement.querySelector('#custom-quantity-button .two-tone-button')
    const quantitySelectorInputElement = quantitySelectorElement.querySelector('#quantity')

    const continueFormElement = document.getElementById('continue-form')
    const subscriptionInputElement = continueFormElement.querySelector('input:first-child')
    const purchaseTypeInputElement = continueFormElement.querySelector('input:nth-child(2)')
    const gifteeInputElement = continueFormElement.querySelector('input:nth-child(3)')
    const quantityInputElement = continueFormElement.querySelector('input:nth-child(4)')
    const continueButtonElement = continueFormElement.querySelector('button')
    const continueFormInvalidFeedbackElement = continueFormElement.querySelector('.invalid-feedback')

    const selectSelectableElement = function (element) {
        // Imitate the functionality of radio buttons. If a selectable is
        // clicked, toggle it on and toggle off all other selectables in its
        // group.
        if (!element.classList.contains('selected')) {
            const group = element.getAttribute('data-select-group')
            document.querySelectorAll(`.selected[data-select-group="${group}"]`).forEach(selectedElement => {
                selectedElement.classList.remove('selected')
            })
            element.classList.remove('considering')
            element.classList.add('selected')
        }
    }

    const toggleExpandingElementForArrow = function (clickedArrowElement) {
        // Imitate Bootstrap's collapsible component.
        const targetSelector = clickedArrowElement.getAttribute('data-expansion-target')
        const targetElement = document.querySelector(targetSelector)

        if (targetElement.style.display !== 'none') {
            // Change arrow direction depending on if the element is expanded or
            // collapsed.
            clickedArrowElement.classList.remove('fa-arrow-up')
            clickedArrowElement.classList.add('fa-arrow-down')
        } else {
            clickedArrowElement.classList.remove('fa-arrow-down')
            clickedArrowElement.classList.add('fa-arrow-up')
        }

        $(targetElement).slideToggle(200)
    }

    const setSearchUserSuccess = function (message) {
        searchUserValidFeedbackElement.textContent = message
        searchUserUsernameInputElement.classList.add('is-valid')
        searchUserConfirmButtonElement.removeAttribute('disabled')
    }

    const setSearchUserError = function (message) {
        searchUserInvalidFeedbackElement.textContent = message
        searchUserUsernameInputElement.classList.add('is-invalid')
        searchUserConfirmButtonElement.setAttribute('disabled', 'disabled')
    }

    const clearSearchUserMessage = function () {
        searchUserUsernameInputElement.classList.remove('is-valid is-invalid')
        searchUserConfirmButtonElement.setAttribute('disabled', 'disabled')
    }

    const confirmGiftee = function (giftee) {
        gifteeFieldElement.textContent = giftee
        gifteeFieldElement.setAttribute('data-giftee-username', giftee)
        gifteeFieldElement.classList.add('badge badge-light')
        toggleExpandingElementForArrow(directGiftExpansionArrowElements)
        clearContinueFormErrorMessage()
    }

    const setContinueFormErrorMessage = function (message) {
        continueFormInvalidFeedbackElement.textContent = message
        continueButtonElement.classList.add('is-invalid')
    }

    const clearContinueFormErrorMessage = function () {
        continueButtonElement.classList.remove('is-invalid')
    }

    const updateQuantityButtonCosts = function () {
        const selectedSubElement = document.querySelector('.selected[data-select-group="sub-tier"]')
        const selectedSubPrice = parseInt(selectedSubElement.getAttribute('data-select-price'))

        quantityButtonElements.forEach(quantityButtonElement => {
            updateQuantityButton(quantityButtonElement, null, selectedSubPrice)
        })
    }

    const updateQuantityButton = function (buttonElement, quantity = null, subPrice = null) {
        const numberOfSubsFieldElement = buttonElement.querySelector('div:first-child > p')
        const costFieldElement = buttonElement.querySelector('div:last-child > p')

        if (!quantity) {
            quantity = buttonElement.getAttribute('data-quantity')
        }

        if (!subPrice) {
            const selectedSubElement = document.querySelector('.selected[data-select-group="sub-tier"]')
            subPrice = parseInt(selectedSubElement.getAttribute('data-select-price'))
        }

        numberOfSubsFieldElement.textContent = quantity > 1 ? `${quantity} Subs` : `${quantity} Sub`
        buttonElement.setAttribute('data-quantity', quantity)
        costFieldElement.textContent = `$${quantity * subPrice}`
    }

    $('.selectable').addEventListener('click', function (event) {
        selectSelectableElement(event.target)
    })

    $('.expansion-arrow').addEventListener('click', function (event) {
        toggleExpandingElementForArrow(event.target)
    })

    periodsSelectablesElements.forEach(periodsSelectablesElement => {
        periodsSelectablesElement.addEventListener('click', function () {
            updateQuantityButtonCosts()
        })
    })

    searchUserFormElement.addEventListener('submit', function (event) {
        event.preventDefault()

        const username = searchUserUsernameInputElement.value.trim()
        searchUserUsernameInputElement.value = username
        if (username === '') {
            return
        }

        fetch(`/api/info/giftcheck?s=${encodeURIComponent(username)}`)
            .then(response => {
                if (response.status === 403) {
                    // This is required because of a server-side check that
                    // prevents the user from gifting a sub to themselves.
                    throw Error('Sorry, you have to be logged in to search for users.')
                } else if (!response.ok) {
                    throw Error('Something went wrong. Please try again later.')
                } else {
                    return response.json
                }
            })
            .then(data => {
                if (data['valid'] && data['cangift']) {
                    setSearchUserSuccess('This user can accept gift subs!')
                } else if (!data['valid'] && !data['cangift']) {
                    setSearchUserError('This user doesn\'t exist.')
                } else if (data['valid'] && !data['cangift']) {
                    setSearchUserError('This user can\'t accept gift subs.')
                } else if (!data['valid'] && data['cangift']) {
                    setSearchUserError('YEE NEVA EVA LOSE.')
                }
            })
            .catch(e => {
                setSearchUserError(e.message)
            })
    })

    searchUserUsernameInputElement.addEventListener('keydown', function () {
        clearSearchUserMessage()
    })

    searchUserConfirmButtonElement.addEventListener('click', function () {
        confirmGiftee(searchUserUsernameInputElement.value)
    })

    selfSelectableElements.forEach(selfSelectableElement => {
        selfSelectableElement.addEventListener('click', function () {
            clearContinueFormErrorMessage()
        })
    })

    directGiftExpansionArrowElements.forEach(directGiftExpansionArrowElement => {
        directGiftExpansionArrowElement.addEventListener('click', function () {
            selectSelectableElement(directGiftSelectableElements)
        })
    })

    directGiftSelectableElements.forEach(directGiftSelectableElement => {
        directGiftSelectableElement.addEventListener('click', function () {
            toggleExpandingElementForArrow(directGiftExpansionArrowElements)
        })
    })

    massGiftSelectableElements.forEach(massGiftSelectableElement => {
        massGiftSelectableElement.addEventListener('click', function () {
            toggleExpandingElementForArrow(massGiftExpansionArrowElement)
        })
    })

    massGiftExpansionArrowElement.addEventListener('click', function () {
        selectSelectableElement(massGiftSelectableElements)
    })

    const handleQuantityChange = function (event) {
        // No negatives allowed.
        if (event.type === 'keyup' && event.which === 189) {
            return false
        }

        let quantity = parseInt(quantitySelectorInputElement.value, 10)
        if (isNaN(quantity)) {
            return
        }

        if (quantity < 1) {
            quantity = 1
            quantitySelectorInputElement.value = quantity
        } else if (quantity > 100) {
            quantity = 100
            quantitySelectorInputElement.value = quantity
        }

        updateQuantityButton(customQuantityButtonElement, quantity, null)
    }

    quantitySelectorInputElement.addEventListener('keyup', handleQuantityChange)
    quantitySelectorInputElement.addEventListener('change', handleQuantityChange)

    quantitySelectorInputElement.addEventListener('select', function (event) {
        const selection = quantitySelectorInputElement.value.substring(event.target.selectionStart, event.target.selectionEnd)
        console.log(selection)
    })

    quantityButtonElements.forEach(quantityButtonElement => {
        quantityButtonElement.addEventListener('click', function () {
            const numberOfSubsFieldElement = quantityButtonElement.querySelector('div:first-child > p')

            quantityFieldElement.textContent = numberOfSubsFieldElement.textContent.toLowerCase()
            quantityFieldElement.setAttribute('data-quantity', quantityButtonElement.getAttribute('data-quantity'))
            quantityFieldElement.classList.add('badge badge-light')

            toggleExpandingElementForArrow(massGiftExpansionArrowElement)
        })
    })

    continueFormElement.addEventListener('submit', function () {
        const selectedSubElement = document.querySelector('.selected[data-select-group="sub-tier"]')
        subscriptionInputElement.value = selectedSubElement.getAttribute('data-select-id')

        const selectedRecipientElement = document.querySelector('.selected[data-select-group="recipient"]')
        purchaseTypeInputElement.value = selectedRecipientElement.getAttribute('data-select-id')

        switch (purchaseTypeInputElement.value) {
            case 'self':
                gifteeInputElement.value = ''
                quantityInputElement.value = 1
                break

            case 'direct-gift':
                const username = gifteeFieldElement.getAttribute('data-giftee-username')
                if (username === '') {
                    setContinueFormErrorMessage('You haven\'t picked a recipient for your gift sub.')
                    return false
                }

                gifteeInputElement.value = username
                quantityInputElement.value = 1
                break

            case 'mass-gift':
                const quantity = parseInt(quantityFieldElement.getAttribute('data-quantity'))
                if (isNaN(quantity)) {
                    setContinueFormErrorMessage('You haven\'t selected how many subs to gift.')
                    return false
                }

                gifteeInputElement.value = ''
                quantityInputElement.value = quantity
                break
        }

        // Submit form normally after updating inputs.
        return true
    })
}
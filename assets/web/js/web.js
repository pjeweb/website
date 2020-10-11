import './common/textarea-length-indicator'
import './common/form-validation'
import './common/alerts'
import './common/collapse'
import './common/lazy-load-images'
import './common/popups'
import './common/tooltips'
import './common/datetime-format-and-update'
import './common/gift-user'
import './common/stream-status'
import './common/login'
import './common/btn-post'
import './common/developer'



// For `/subscribe`.
(function(){
    const $searchUserForm = $('form#search-user')
    const $searchUserUsernameInput = $searchUserForm.find('#username-input')
    const $searchUserValidFeedback = $searchUserForm.find('.valid-feedback')
    const $searchUserInvalidFeedback = $searchUserForm.find('.invalid-feedback')
    const $searchUserConfirmButton = $searchUserForm.find(' > button:last-child')

    const $periodsSelectables = $('.periods .selectable')
    const $selfSelectable = $('#self .selectable')
    const $directGiftSelectable = $('#direct-gift .selectable')
    const $massGiftSelectable = $('#mass-gift .selectable')

    const $directGiftExpansionArrow = $('#direct-gift .expansion-arrow')
    const $gifteeField = $('#direct-gift .value')

    const $massGiftExpansionArrow = $('#mass-gift .expansion-arrow')
    const $quantityField = $('#mass-gift .value')

    const $quantitySelector = $('#quantity-selector')
    const $quantityButtons = $quantitySelector.find('.two-tone-button')
    const $staticQuantityButtons = $quantitySelector.find('#static-quantity-buttons .two-tone-button')
    const $customQuantityButton = $quantitySelector.find('#custom-quantity-button .two-tone-button')
    const $quantitySelectorInput = $quantitySelector.find('#quantity')

    const $continueForm = $('#continue-form')
    const $subscriptionInput = $continueForm.find('input:first-child')
    const $purchaseTypeInput = $continueForm.find('input:nth-child(2)')
    const $gifteeInput = $continueForm.find('input:nth-child(3)')
    const $quantityInput = $continueForm.find('input:nth-child(4)')
    const $continueButton = $continueForm.find('button')
    const $continueFormInvalidFeedback = $continueForm.find('.invalid-feedback')

    // Convert an element into a jQuery object if it isn't one already.
    const makeDollar = function(element) {
        return element instanceof $ ? element : $(element)
    }

    const selectSelectableElement = function(element) {
        // Imitate the functionality of radio buttons. If a selectable is
        // clicked, toggle it on and toggle off all other selectables in its
        // group.
        const $element = makeDollar(element)

        if (!$element.hasClass('selected')) {
            const group = $element.data('select-group')
            $(`.selected[data-select-group="${group}"]`).removeClass('selected')
            $element.removeClass('considering')
            $element.addClass('selected')
        }
    }

    const toggleExpandingElementForArrow = function(clickedArrow) {
        // Imitate Bootstrap's collapsible component.
        const $clickedArrow = makeDollar(clickedArrow)
        const $target = $($clickedArrow.data('expansion-target'))

        if ($target.is(':visible')) {
            // Change arrow direction depending on if the element is expanded or
            // collapsed.
            $clickedArrow.removeClass('fa-arrow-up')
            $clickedArrow.addClass('fa-arrow-down')
        } else {
            $clickedArrow.removeClass('fa-arrow-down')
            $clickedArrow.addClass('fa-arrow-up')
        }

        $target.slideToggle(200)
    }

    const setSearchUserSuccess = function(message) {
        $searchUserValidFeedback.text(message)
        $searchUserUsernameInput.addClass('is-valid')
        $searchUserConfirmButton.prop('disabled', false)
    }

    const setSearchUserError = function(message) {
        $searchUserInvalidFeedback.text(message)
        $searchUserUsernameInput.addClass('is-invalid')
        $searchUserConfirmButton.prop('disabled', true)
    }

    const clearSearchUserMessage = function() {
        $searchUserUsernameInput.removeClass('is-valid is-invalid')
        $searchUserConfirmButton.prop('disabled', true)
    }

    const confirmGiftee = function(giftee) {
        $gifteeField.text(giftee)
        $gifteeField.data('giftee-username', giftee)
        $gifteeField.addClass('badge badge-light')
        toggleExpandingElementForArrow($directGiftExpansionArrow)
        clearContinueFormErrorMessage()
    }

    const setContinueFormErrorMesage = function(message) {
        $continueFormInvalidFeedback.text(message)
        $continueButton.addClass('is-invalid')
    }

    const clearContinueFormErrorMessage = function() {
        $continueButton.removeClass('is-invalid')
    }

    const updateQuantityButtonCosts = function() {
        const $selectedSub = $('.selected[data-select-group="sub-tier"]')
        const selectedSubPrice = parseInt($selectedSub.data('select-price'))

        $quantityButtons.each(function() {
            updateQuantityButton(this, null, selectedSubPrice)
        })
    }

    const updateQuantityButton = function(button, quantity = null, subPrice = null) {
        const $button = makeDollar(button)
        const $numberOfSubsField = $button.find('div:first-child > p')
        const $costField = $button.find('div:last-child > p')

        if (!quantity) {
            quantity = $button.data('quantity')
        }

        if (!subPrice) {
            const $selectedSub = $('.selected[data-select-group="sub-tier"]')
            subPrice = parseInt($selectedSub.data('select-price'))
        }

        $numberOfSubsField.text(`${quantity} Sub`)
        if (quantity > 1) {
            $numberOfSubsField.text($numberOfSubsField.text() + 's')
        }

        $button.data('quantity', quantity)
        $costField.text(`$${quantity * subPrice}`)
    }

    $('.selectable').click(function() {
        selectSelectableElement(this)
    })

    $('.expansion-arrow').click(function() {
        toggleExpandingElementForArrow(this)
    })

    $periodsSelectables.click(function() {
        updateQuantityButtonCosts()
    })

    $searchUserForm.submit(function(event) {
        event.preventDefault()

        const username = $searchUserUsernameInput.val().trim()
        $searchUserUsernameInput.val(username)
        if (username === '') {
            return
        }

        $.ajax({
            url: '/api/info/giftcheck',
            data: {s: username},
            type: 'GET',
            success: function(data) {
                if (data['valid'] && data['cangift']) {
                    setSearchUserSuccess('This user can accept gift subs!')
                } else if (!data['valid'] && !data['cangift']) {
                    setSearchUserError('This user doesn\'t exist.')
                } else if (data['valid'] && !data['cangift']) {
                    setSearchUserError('This user can\'t accept gift subs.')
                } else if (!data['valid'] && data['cangift']) {
                    setSearchUserError('YEE NEVA EVA LOSE.')
                }
            },
            error: function(xhr) {
                if (xhr.status === 403) {
                    // This is required because of a server-side check that
                    // prevents the user from gifting a sub to themselves.
                    setSearchUserError('Sorry, you have to be logged in to search for users.')
                } else {
                    setSearchUserError('Something went wrong. Please try again later.')
                }
            }
        })
    })

    $searchUserUsernameInput.keydown(function() {
        clearSearchUserMessage()
    })

    $searchUserConfirmButton.click(function() {
        confirmGiftee($searchUserUsernameInput.val())
    })

    $selfSelectable.click(function() {
        clearContinueFormErrorMessage()
    })

    $directGiftExpansionArrow.click(function() {
        selectSelectableElement($directGiftSelectable)
    })

    $directGiftSelectable.click(function() {
        toggleExpandingElementForArrow($directGiftExpansionArrow)
    })

    $massGiftSelectable.click(function() {
        toggleExpandingElementForArrow($massGiftExpansionArrow)
    })

    $massGiftExpansionArrow.click(function() {
        selectSelectableElement($massGiftSelectable)
    })

    $quantitySelectorInput.on('keyup change', function() {
        // No negatives allowed.
        if (event.type === 'keyup' && event.which === 189) {
            return false
        }

        let quantity = parseInt($quantitySelectorInput.val())
        if (isNaN(quantity)) {
            return
        }

        if (quantity < 1) {
            quantity = 1
            $quantitySelectorInput.val(quantity)
        } else if (quantity > 100) {
            quantity = 100
            $quantitySelectorInput.val(quantity)
        }

        updateQuantityButton($customQuantityButton, quantity, null)
    })

    $quantitySelectorInput.select(function(event) {
        const selection = $quantitySelectorInput.val().substring(this.selectionStart, this.selectionEnd)
        console.log(selection)
    })

    $quantityButtons.click(function() {
        const $clickedButton = $(this)
        const $numberOfSubsField = $clickedButton.find('div:first-child > p')

        $quantityField.text($numberOfSubsField.text().toLowerCase())
        $quantityField.data('quantity', $clickedButton.data('quantity'))
        $quantityField.addClass('badge badge-light')

        toggleExpandingElementForArrow($massGiftExpansionArrow)
    })

    $continueForm.submit(function() {
        const $selectedSub = $('.selected[data-select-group="sub-tier"]')
        $subscriptionInput.val($selectedSub.data('select-id'))

        const $selectedRecipient = $('.selected[data-select-group="recipient"]')
        $purchaseTypeInput.val($selectedRecipient.data('select-id'));

        switch ($purchaseTypeInput.val()) {
            case 'self':
                $gifteeInput.val('')
                $quantityInput.val(1)
                break
            case 'direct-gift':
                const username = $gifteeField.data('giftee-username')
                if (username === '') {
                    setContinueFormErrorMesage('You haven\'t picked a recipient for your gift sub.')
                    return false
                }

                $gifteeInput.val(username)
                $quantityInput.val(1)
                break
            case 'mass-gift':
                const quantity = parseInt($quantityField.data('quantity'))
                if (isNaN(quantity)) {
                    setContinueFormErrorMesage('You haven\'t selected how many subs to gift.')
                    return false
                }

                $gifteeInput.val('')
                $quantityInput.val(quantity)
                break
        }

        // Submit form normally after updating inputs.
        return true
    })
})()
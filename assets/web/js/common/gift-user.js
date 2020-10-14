// TODO: replace modal, button from bootstrap/jquery with something else?

let usrSearchElement = document.getElementById('usersearchmodal')
if (usrSearchElement) {
    let usrInput = usrSearchElement.querySelector('input#userSearchInput')
    let usrSelectBtn = usrSearchElement.querySelector('button#userSearchSelect')
    let usrSearchForm = usrSearchElement.querySelector('form#userSearchForm')
    let giftMsgInput = usrSearchElement.querySelector('textarea#giftmessage')
    let hasErrors = false
    let giftUsername = ''

    const checkUser = function (username, success) {
        fetch('/api/info/giftcheck?' + new URLSearchParams({s: username}).toString()).then(response => {
            if (!response.ok) {
                showLookupError('Error looking up user. Try again')
            } else {
                success(response.json())
            }
        })
    }

    const showLookupError = function (message) {
        hasErrors = true
        $(usrSelectBtn).button('reset')

        usrSelectBtn.setAttribute('disabled', 'disabled')
        usrSearchElement.querySelectorAll('label.error').forEach(labelElement => {
            labelElement.textContent = message
            labelElement.classList.remove('hidden')
        })
    }

    const cancelUserSelect = function () {
        $(usrSearchElement).modal('hide')
        usrInput.value = ''
        giftMsgInput.value = ''
        document.getElementById('subscriptionGiftUsername').textContent = ''
        document.getElementById('giftSubscriptionConfirm').classList.add('hidden')
        document.getElementById('giftSubscriptionSelect').classList.remove('hidden')

        document.querySelectorAll('input[name="gift"]').forEach(inputElement => {
            inputElement.value = ''
        })
        document.querySelectorAll('input[name="gift-message"]').forEach(inputElement => {
            inputElement.value = ''
        })
    }

    const selectUser = function (username) {
        $(usrSelectBtn).button('loading')

        checkUser(username, response => {
            if (response.valid && response.cangift) {
                giftUsername = username
                if (giftMsgInput.value === '') {
                    giftMsgInput.focus()
                } else {
                    usrSearchForm.submit()
                }

                $(usrSelectBtn).button('reset')
                usrSelectBtn.removeAttribute('disabled')

                hasErrors = false
            } else if (!response.valid) {
                showLookupError('This user was not found. Try again.')
            } else if (!response.cangift) {
                showLookupError('This user is not eligible for a gift.')
            }
        })
    }

    const checkEmpty = function (e) {
        if (e.target.value === '') {
            usrSelectBtn.setAttribute('disabled', 'disabled')
        } else {
            usrSelectBtn.removeAttribute('disabled')
        }

        usrSearchElement.querySelectorAll('label.error')
            .forEach(labelElement => labelElement.classList.add('hidden'))
    }

    usrInput.addEventListener('keydown', checkEmpty)
    usrInput.addEventListener('change', checkEmpty)

    usrSearchForm.addEventListener('submit', function (e) {
        e.preventDefault()

        usrSearchElement.querySelectorAll('label.error').forEach(labelElement => labelElement.classList.add('hidden'))

        if (giftUsername !== usrInput.val()) {
            selectUser(usrInput.val())
        } else {
            document.getElementById('subscriptionGiftUsername').textContent = usrInput.value
            document.getElementById('giftSubscriptionConfirm').classList.remove('hidden')
            document.getElementById('giftSubscriptionSelect').classList.add('hidden')

            document.querySelectorAll('input[name="gift"]').forEach(inputElement => {
                inputElement.value = usrInput.value
            })
            document.querySelectorAll('input[name="gift-message"]').forEach(inputElement => {
                inputElement.value = giftMsgInput.value
            })

            $(usrSearchElement).modal('hide')
        }
    })

    $(usrSearchElement).on('shown.bs.modal', function () {
        usrInput.focus()
    })

    $(usrSearchElement).on('hidden.bs.modal', function () {
        if (hasErrors) {
            hasErrors = false
            giftUsername = ''
            usrInput.value = ''
            giftMsgInput.value = ''
            usrSearchElement.querySelectorAll('label.error')
                .forEach(labelElement => labelElement.classList.add('hidden'))
        }
    })

    document.getElementById('cancelGiftSubscription').addEventListener('click', function (e) {
        e.preventDefault()

        usrSearchElement.querySelectorAll('label.error')
            .forEach(labelElement => labelElement.classList.add('hidden'))
        cancelUserSelect()
    })
}
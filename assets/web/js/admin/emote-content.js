const emoteContentElement = document.getElementById('emote-content')

if (emoteContentElement) {
    const emoteId = emoteContentElement.getAttribute('data-id')

    emoteContentElement.querySelectorAll('.delete-item').forEach(deleteItemElement => {
        deleteItemElement.addEventListener('click', () => {
            if (confirm('This cannot be undone. Are you sure?')) {
                document.getElementById('delete-form').submit()
            }
        })
    })

    let mustCheckPrefix = true
    const inputPrefix = document.getElementById('inputPrefix')
    const inputTheme = document.getElementById('inputTheme')
    const emoteForm = document.getElementById('emote-form')

    function validateEmote() {
        inputPrefix.classList.remove('is-invalid')

        fetch('/admin/emotes/prefix', {
            method: 'POST',
            body: new URLSearchParams({
                id: emoteId,
                theme: inputTheme.value,
                prefix: inputPrefix.value,
            }).toString(),
        })
            .then(response => {
                if (response.ok) {
                    return response.json()
                }

                throw new Error()
            })
            .then(response => {
                if (response.exists) {
                    mustCheckPrefix = true
                    inputPrefix.classList.add('is-invalid')
                } else {
                    mustCheckPrefix = false
                    emoteForm.submit()
                }
            })
            .catch(() => {
                mustCheckPrefix = true
                inputPrefix.classList.add('is-invalid')
            })
    }

    inputPrefix.addEventListener('change', () => {
        mustCheckPrefix = true
    })

    emoteForm.addEventListener('submit', e => {
        if (mustCheckPrefix) {
            e.preventDefault()
            validateEmote()
        }
    })
}
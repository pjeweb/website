// TODO: replace form validation from jquery-validation/jquery with something else?

import $ from 'jquery'

$(document.body).find('form.validate').validate({
    highlight: e => $(e).closest('.form-group').addClass('error'),
    unhighlight: e => $(e).closest('.form-group').removeClass('error'),
})
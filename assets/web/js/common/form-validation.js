// TODO: replace form validation from jquery-validation/jquery with something else?
import $ from 'jquery'

$(document.body).find('form.validate').validate({
    highlight: element => element.closest('.form-group').classList.add('error'),
    unhighlight: element => element.closest('.form-group').classList.remove('error'),
})
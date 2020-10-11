import {HtmlTextFormatter, UrlFormatter, EmoteFormatter} from 'dgg-chat-gui/assets/chat/js/formatters'

const formatterContext = {}
const formatters = [new HtmlTextFormatter(), new UrlFormatter(), new EmoteFormatter()]

export function formatMessage(message) {
    message = message.trim()
    formatters.forEach(formatter => {
        message = formatter.format(formatterContext, message)
    })

    return message
}
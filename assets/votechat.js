import 'dgg-chat-gui/assets/chat/css/style.scss'
import Chat from 'dgg-chat-gui/assets/chat/js/chat'

const script = document.getElementById('chat-include')
const chat = new Chat({
    url: `ws${location.protocol === 'https:' ? 's' : ''}://${location.host}/ws`,
    api: {base: `${location.protocol}//${location.host}`},
    cdn: {base: script.getAttribute('data-cdn')},
    cacheKey: script.getAttribute('data-cache-key'),
    banAppealUrl: script.getAttribute('data-ban-appeal-url')
});

document.documentElement.style.background = 'transparent'
document.body.style.background = 'transparent'

chat.withGui(`
    <div id="chat" class="chat votechat">
        <div id="chat-vote-frame"></div>
        <div id="chat-output-frame" style="display: none;"></div>
    </div>
`)
.then(() => chat.connect())
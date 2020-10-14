// Embedding, hosting and "navhostpill"
const initUrl = document.location.href // important this is stored before any work is done that may change this value
let streamIFrameElement = document.querySelector('#stream-panel iframe')
const hashRegex = /^#(twitch|twitch-vod|twitch-clip|youtube)\/([A-z0-9_\-]{3,64})$/

const streamWrapElement = document.getElementById('stream-wrap')
const embedInfo = {
    embed: false,
    platform: streamWrapElement.getAttribute('data-platform'),
    title: 'Bigscreen',
    name: streamWrapElement.getAttribute('data-name'),
    id: null,
    url: '/bigscreen',
    parents: streamWrapElement.getAttribute('data-twitch-parents'),
}

const streamInfo = {live: false, host: null, preview: null}
const defaultEmbedInfo = Object.assign({}, embedInfo)
const navPillClasses = ['embedded', 'hidden', 'hosting', 'online', 'offline']
const iconTwitch = '<i class="fab fa-fw fa-twitch"></i>'
const iconClose = '<i class="fas fa-fw fa-times-circle"></i>'

const navHostPillContainerElement = document.getElementById('nav-host-pill')
const navHostPillLeftElement = navHostPillContainerElement.querySelector('#nav-host-pill-type')
const navHostPillRightElement = navHostPillContainerElement.querySelector('#nav-host-pill-name')
const navHostPillIconElement = navHostPillContainerElement.querySelector('#nav-host-pill-icon')

const updateStreamFrame = function () {
    let src = ''
    switch (embedInfo.platform) {
        case 'twitch':
            src = 'https://player.twitch.tv/?' + new URLSearchParams({
                channel: embedInfo.name,
                parent: embedInfo.parents,
            }).toString()
            break

        case 'twitch-vod':
            src = 'https://player.twitch.tv/?' + new URLSearchParams({
                video: embedInfo.name,
                parent: embedInfo.parents,
            }).toString()
            break

        case 'twitch-clip':
            src = 'https://clips.twitch.tv/embed?' + new URLSearchParams({
                clip: embedInfo.name,
                parent: embedInfo.parents,
            }).toString()
            break

        case 'youtube':
            src = 'https://www.youtube.com/embed/' + encodeURIComponent(embedInfo.name)
            break
    }

    if (src !== '' && streamIFrameElement.getAttribute('src') !== src) { // avoids a flow issue when in
        const newStreamIFrameElement = streamIFrameElement.cloneNode()
        newStreamIFrameElement.setAttribute('src', src)
        streamIFrameElement.parentElement.replaceChild(newStreamIFrameElement, streamIFrameElement)
    }
}

const updateStreamPill = function () {
    navHostPillContainerElement.classList.remove(...navPillClasses)

    if (!embedInfo.embed) {
        if (streamInfo.host && !streamInfo.live) {
            navHostPillContainerElement.classList.add('hosting')
            navHostPillLeftElement.textContent = 'HOSTING'
            navHostPillRightElement.textContent = streamInfo.host.name
            navHostPillIconElement.innerHTML = iconTwitch
        } else {
            navHostPillLeftElement.textContent = streamInfo.live ? 'LIVE' : 'OFFLINE'
            navHostPillRightElement.textContent = 'Destiny'
            navHostPillIconElement.innerHTML = iconTwitch
        }
    } else {
        navHostPillContainerElement.classList.add('embedded')
        navHostPillLeftElement.textContent = 'EMBED'
        navHostPillRightElement.textContent = embedInfo.title
        navHostPillIconElement.innerHTML = iconClose
    }

    navHostPillContainerElement.classList[streamInfo.live ? 'add' : 'remove']('online')
    navHostPillContainerElement.classList[streamInfo.live ? 'remove' : 'add']('offline')
}

const toggleEmbedHost = function (e) {
    e.preventDefault()

    if (!embedInfo.embed && streamInfo.host) {
        embedInfo.embed = true
        embedInfo.platform = 'twitch'
        embedInfo.title = streamInfo.host.display_name
        embedInfo.name = streamInfo.host.name
        embedInfo.id = streamInfo.host.id
        window.history.pushState(embedInfo, null, `#twitch/${embedInfo.name}`)
    } else if (embedInfo.embed) {
        embedInfo.embed = false
        embedInfo.platform = defaultEmbedInfo.platform
        embedInfo.title = defaultEmbedInfo.title
        embedInfo.name = defaultEmbedInfo.name
        embedInfo.id = defaultEmbedInfo.id
        Object.assign(embedInfo, defaultEmbedInfo)
        window.history.pushState(embedInfo, null, `/bigscreen`)
    }

    updateStreamPill(streamInfo)
    updateStreamFrame(embedInfo)
}

const fetchStreamInfo = function () {
    return fetch('/api/info/stream')
        .then(response => response.json())
        .then(data => {
            const {live, host, preview} = data
            Object.assign(streamInfo, {live, host, preview})
            updateStreamPill()
        })
}

const handleHistoryPopState = function () {
    const state = window.history.state
    if (state === null) {
        // state is null when someone changes the hash, or back, forward browser actions are performed
        updateEmbedInfoWithBrowserLocationHash()
    } else {
        // else get the state from the history and update embedInfo
        Object.assign(embedInfo, state)
    }

    updateStreamPill(streamInfo)
    updateStreamFrame(embedInfo)
}

const parseEmbedHash = function (str) {
    const hash = str || window.location.hash || ''
    if (hash.length > 0 && hashRegex.test(hash)) {
        const [, platform, name] = hash.match(hashRegex)
        return {platform, name, id: null}
    }

    return null
}

const updateEmbedInfoWithBrowserLocationHash = function () {
    const parts = parseEmbedHash(window.location.hash)
    if (parts) {
        Object.assign(embedInfo, {
            embed: true,
            platform: parts.platform,
            title: parts.name,
            name: parts.name,
            id: parts.id,
        })
    }
}

updateEmbedInfoWithBrowserLocationHash()
updateStreamFrame()

// Makes it so the browser navigation,
window.history.replaceState(embedInfo, null, initUrl)

// When someone clicks the nav UI element
navHostPillContainerElement.addEventListener('click', toggleEmbedHost)

// When the browser navigation is changed, also happens when you change the hash in the browser
window.addEventListener('popstate', handleHistoryPopState)

// The stream status info, pinged every x seconds and on initial start up
fetchStreamInfo().then(() => window.setInterval(fetchStreamInfo, 15000))
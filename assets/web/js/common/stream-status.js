const STATUS_REFRESH_INTERVAL_MS = 15000

const streamStatusElement = document.getElementById('stream-status')
if (streamStatusElement) {
    const end = document.getElementById('stream-status-end')
    const start = document.getElementById('stream-status-start')
    const host = document.getElementById('stream-status-host')

    let status = {
        live: false,
        game: null,
        preview: '',
        status_text: '',
        started_at: null,
        ended_at: '',
        duration: 0,
        viewers: 0,
        host: {},
    }

    const updateStatus = function () {
        let state = (status.host && status.host.id !== undefined) ? 'hosting' :
            (status.live ? 'online' : 'offline')

        streamStatusElement.classList.remove('online')
        streamStatusElement.classList.remove('offline')
        streamStatusElement.classList.remove('hosting')
        streamStatusElement.classList.add(state)
        end.text(moment(status.ended_at).fromNow())
        start.text(moment(status.started_at).fromNow())
        if (state === 'hosting') {
            host.text(status.host.display_name)
            host.attr('href', status.host.url)
        }
    }

    setInterval(function () {
        fetch('/api/info/stream')
            .then(response => response.json())
            .then(data => {
                if (data) {
                    Object.assign(status, data)
                    updateStatus()
                }
            })
            .catch(ignored => {
            })
    }, STATUS_REFRESH_INTERVAL_MS)
}
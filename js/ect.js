const p = new SimplePeer({
    initiator: location.hash === '#1',
    trickle: false
})

p.on('error', err => console.log('error', err))

p.on('signal', data => {
    console.log('SIGNAL', JSON.stringify(data))
    document.querySelector('#outgoing').textContent = JSON.stringify(data)
})

document.querySelector('form').addEventListener('submit', ev => {
    ev.preventDefault()
    p.signal(JSON.parse(document.querySelector('#incoming').value))
})

p.on('connect', () => {
    console.log('CONNECT')
    p.send('whatever' + Math.random())
})

p.on('data', data => {
    console.log('data: ' + data)
})

p.on('stream', stream => {
    // got remote video stream, now let's show it in a video tag
    var video = document.getElementById('video')

    if ('srcObject' in video) {
        video.srcObject = stream
    } else {
        video.src = window.URL.createObjectURL(stream) // for older browsers
    }

    video.play()
})

function addMedia(stream) {
    p.addStream(stream) // <- add streams to peer dynamically
}

// then, anytime later...
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(addMedia).catch(() => {})
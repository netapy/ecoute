function JeSuisLanceur() {
    const p = new SimplePeer({
        initiator: true,
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
        p.send('whateveeeeer' + Math.random())
    })

    p.on('data', data => {
        console.log('data: ' + data)
    })

    //p.on('stream', stream => {
    //    // got remote video stream, now let's show it in a video tag
    //    var video = document.getElementById('video')
    //
    //    if ('srcObject' in video) {
    //        video.srcObject = stream
    //    } else {
    //        video.src = window.URL.createObjectURL(stream) // for older browsers
    //    }
    //    video.play()
    //})

    //function addMedia(stream) {
    //    p.addStream(stream) // <- add streams to peer dynamically
    //}
    // then, anytime later...
    //navigator.mediaDevices.getUserMedia({
    //    video: true,
    //    audio: true
    //}).then(addMedia).catch(() => {})
}

function jeSuisRecepteur() {
    const p = new SimplePeer({
        initiator: false,
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
        p.send('whateveeeeer' + Math.random())
    })

    p.on('data', data => {
        console.log('data: ' + data)
    })

    //p.on('stream', stream => {
    //    // got remote video stream, now let's show it in a video tag
    //    var video = document.getElementById('video')
    //
    //    if ('srcObject' in video) {
    //        video.srcObject = stream
    //    } else {
    //        video.src = window.URL.createObjectURL(stream) // for older browsers
    //    }
    //    video.play()
    //})

    //function addMedia(stream) {
    //    p.addStream(stream) // <- add streams to peer dynamically
    //}
    // then, anytime later...
    //navigator.mediaDevices.getUserMedia({
    //    video: true,
    //    audio: true
    //}).then(addMedia).catch(() => {})
}

document.getElementById("zonePrincipalee").innerHTML = '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1); position: absolute;">'

function changementDeMenu(bouton) {
    let dicoZones = {
        'EcranClasique': '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1); position: absolute;">',
        'BtnParam': "<div style=\"padding: 10px;\"><h3>Ecoute.app</h3> <p><strong>Ecoute</strong> est entièrement libre d'utilisation et fonctionne entièrement sans utiliser vos données.<br>C'est comme utiliser un <strong>talkie-walkie</strong> sous stéroïdes.</p><p>-B</p></div>",
        'BtnLaunchCom': '<form> Ton code :<br><textarea id="outgoing"></textarea><br>Son code :<br><textarea id="incoming"></textarea><br> <button type="submit">submit</button> </form><div>',
        'BtnRecepCom': '<form> Son code :<br><textarea id="outgoing"></textarea><br> <button type="submit">submit</button> <br>Son code :<br><textarea id="incoming"></textarea></form><div>',
    }
    zoneParamID = document.getElementById("zonePrincipalee")
    if (String(dicoZones[bouton.id]).trim() != String(zoneParamID.innerHTML).trim()) {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones[bouton.id];
            zoneParamID.style.transform = "rotateX(0deg)";

            if (bouton.id == "BtnLaunchCom") {
                JeSuisLanceur()
            }

        }, 300);
    }
}
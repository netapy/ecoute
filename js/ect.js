var p;

function JeSuisLanceur() {
    p = new SimplePeer({
        initiator: true,
        trickle: false
    })

    p.on('error', err => console.log('error', err))

    p.on('signal', data => {
        console.log('SIGNAL', JSON.stringify(data))
        document.querySelector('#outgoing').textContent = JSON.stringify(data)

        try {
            p.send("NV_SDP_PR_VIDEO" + String(JSON.stringify(data)))
        } catch (error) {
            console.log(error, 'cest pas grave cest le premier contact.')
        }
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
        if (data.includes('NV_SDP_PR_VIDEO')) {
            console.log("ON A RECU LE NOVEAU SDP DU CLIETN")
            p.signal(JSON.parse(String(data).replace("NV_SDP_PR_VIDEO", "")))
        }
        console.log('data: ' + data)
    })

    p.on('stream', stream => {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video')
        if ('srcObject' in video) {
            video.srcObject = stream
        } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
        }
        video.play()
        console.log("la video doit jouer laa")
    })

    function addMedia(stream) {
        p.addStream(stream) // <- add streams to peer dynamically
    }

    //navigator.mediaDevices.getUserMedia({
    //    video: true,
    //    audio: false
    //}).then(addMedia).catch(() => {})
}

function jeSuisRecepteur() {
    p = new SimplePeer({
        initiator: false,
        trickle: false
    })

    p.on('error', err => console.log('error', err))

    p.on('signal', data => {
        console.log('SIGNAL', JSON.stringify(data))
        document.querySelector('#outgoing').textContent = JSON.stringify(data)

        try {
            p.send("NV_SDP_PR_VIDEO" + String(JSON.stringify(data)))
        } catch (error) {
            console.log(error, 'cest pas grave cest le premier contact.')
        }
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
        if (data.includes('NV_SDP_PR_VIDEO')) {
            console.log("ON A RECU LE NOVEAU SDP DU CLIETN")
            p.signal(JSON.parse(String(data).replace("NV_SDP_PR_VIDEO", "")))
        }
        console.log('data: ' + data)
    })

    p.on('stream', stream => {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video')
        if ('srcObject' in video) {
            video.srcObject = stream
        } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
        }
        video.play()
        console.log("la video doit jouer laa")
    })

    function addMedia(stream) {
        p.addStream(stream) // <- add streams to peer dynamically
    }

    //navigator.mediaDevices.getUserMedia({
    //    video: true,
    //    audio: false
    //}).then(addMedia).catch(() => {})

}

document.getElementById("zonePrincipalee").innerHTML = '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1); position: absolute;">'

function changementDeMenu(bouton) {
    let dicoZones = {
        'EcranClasique': '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1); position: absolute;">',
        'BtnParam': "<div style=\"padding: 10px;\"><h3>Ecoute.app</h3> <p><strong>Ecoute</strong> est entièrement libre d'utilisation et fonctionne entièrement sans utiliser vos données.<br>C'est comme utiliser un <strong>talkie-walkie</strong> sous stéroïdes.</p><p>-B</p></div>",
        'BtnLaunchCom': '<form><h2>Init</h2><video width="320" height="240" controls></video> Donne lui ton code :<br><textarea id="outgoing"></textarea><br>Rentre son code : :<br><textarea id="incoming"></textarea><br> <button type="submit">Valider</button> </form><div>',
        'BtnRecepCom': '<form><h2>Recep</h2><video width="320" height="240" controls></video><br><br> Rentre son code :<br><textarea id="incoming"></textarea><br> <button type="submit">Valider</button> <br>Donne lui ton code :<br><textarea id="outgoing"></textarea></form><div>',
    }
    zoneParamID = document.getElementById("zonePrincipalee")
    if (String(dicoZones[bouton.id]).trim() != String(zoneParamID.innerHTML).trim()) {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones[bouton.id];
            zoneParamID.style.transform = "rotateX(0deg)";
            if (bouton.id == "BtnLaunchCom") {
                JeSuisLanceur()
            } else if (bouton.id == "BtnRecepCom") {
                jeSuisRecepteur()
            }
        }, 300);
    } else {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones["EcranClasique"];
            zoneParamID.style.transform = "rotateX(0deg)";
        }, 300);

    }
}
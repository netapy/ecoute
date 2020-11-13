var peer;
var conn;
var call;
var idAutre;
var idMoi;

function JeSuisLanceur() {
    console.log("démarrage co")
    let iddMoi = document.getElementById('SaisieIDd').value;

    peer = new Peer(iddMoi, {
        host: 'www.ecoute.app',
        port: 9000,
        path: '/ecouteapp'
    });

    peer.on('open', function (id) {
        console.log('My peer ID is: ' + String(id));
        idMoi = String(id)
    });

    peer.on('error', err => {
        console.log(err)
    });

    peer.on('connection', function (cc) {
        console.log("connexion etabllie !!!! ");
        document.getElementById("txtStatut").innerHTML = "Connecté"
        conn = cc;
        idAutre = conn.peer;
        conn.on('data', function (data) {
            alert(data);
        });
    });

    peer.on('disconnected', function () {
        console.log("reconnexion...")
        peer.reconnect();
    });

    peer.on('call', function (appel_entrant) {
        console.log("appel entrant!")
        call = appel_entrant;
        call.on('stream', function (streamOfPeer) {
            videoDiv = document.getElementById("vidFeedback");
            videoDiv.srcObject = streamOfPeer;
            videoDiv.play();
        });

        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            }).then(function (stream) {
                call.answer(stream);
            })
            .catch(function (err) {
                console.log(err)
                alert("Faudra activer ta cam pour répondre à l'appel.")
            });
    });
}

function Connexion() {
    let iddContact = document.getElementById('IdDuContact').value;
    idAutre = iddContact;
    conn = peer.connect(iddContact);
    document.getElementById("txtStatut").innerHTML = "Connecté";
    conn.on('data', function (data) {
        alert(data);
    });
}

function SendMessage() {
    let msgAEnvoyer = document.getElementById('idmsgAEnvoyer').value;
    conn.send(msgAEnvoyer)
}

function CallDude() {
    navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }).then(function (stream) {
            console.log("lancement appel... a " + String(idAutre))
            call = peer.call(idAutre, stream);
        })
        .catch(function (err) {
            console.log(err)
            alert("Faudra activer ta cam pour lancer l'appel.")
        });
}

document.getElementById("zonePrincipalee").innerHTML = '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1); position: absolute;">'

function changementDeMenu(bouton) {
    let dicoZones = {
        'EcranClasique': '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1); position: absolute;">',

        'BtnParam': "<div style=\"padding: 10px;\"><h3>Ecoute.app</h3><p><strong>Ecoute</strong> est entièrement libre d'utilisation et fonctionne entièrement sans utiliser vos données.<br>C'est comme utiliser un <strong>talkie-walkie</strong> sous stéroïdes.</p><p>-B</p></div>",

        'BtnLaunchCom': '<h2 id="txtStatut">Init</h2><input type="text" placeholder="Choisis ton ID" id="SaisieIDd"><button onclick="JeSuisLanceur()">Definition</button><br><input type="text" placeholder="ID de ton contact (laisse vide si tes le 1)" id="IdDuContact"><button onclick="Connexion()">Connexion</button><br>',

        'BtnRecepCom': '<h2>Messages</h2><video id="vidFeedback" width="320" height="240" controls></video><button onclick="CallDude()">Call</button><input type="text" placeholder="Message..." id="idmsgAEnvoyer"><button onclick="SendMessage()">Send</button>',
    }
    zoneParamID = document.getElementById("zonePrincipalee")
    if (String(dicoZones[bouton.id]).trim() != String(zoneParamID.innerHTML).trim()) {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones[bouton.id];
            zoneParamID.style.transform = "rotateX(0deg)";
        }, 300);
    } else {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones["EcranClasique"];
            zoneParamID.style.transform = "rotateX(0deg)";
        }, 300);

    }
}
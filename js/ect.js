var peer;
var conn;
var call;
var idAutre;
var idMoi = "";
let SignalingHost = {
    'host': "www.ecoute.app",
    'port': 9000,
    'path': "/ecouteapp"
};
let fakeBtnMenu = [{
    "id": "returnArrow"
}, {
    "id": "BtnUIMessages"
}, {
    "id": "BtnConnaissance"
}];
let idDefini = false;


function JeSuisLanceur(mode) {
    //let iddMoi = document.getElementById('SaisieIDd').value; ct pour choisir son id lol
    if (idDefini == false) peer = new Peer(idMoi, {
        host: SignalingHost["host"],
        port: SignalingHost["port"],
        path: SignalingHost["path"]
    });

    peer.on('open', function (id) {
        console.log('My peer ID is: ' + String(id));
        idMoi = String(id);
        document.getElementById("monIdFrr").innerHTML = idMoi;
        new QRCode(document.getElementById("qrcode"), {
            text: idMoi,
            width: 128,
            height: 128,
            colorLight: "#eeeeee"
        });
        idDefini = true;
    });
    if (idMoi != "") {
        document.getElementById("monIdFrr").innerHTML = idMoi;
    }

    peer.on('error', err => {
        console.log(err)
    });

    peer.on('connection', function (cc) {
        console.log("connexion entrante ");

        conn = cc;
        idAutre = conn.peer;
        conn.on('data', function (data) {
            alert(data);
        });
        conn.on('close', function (data) {
            alert("L'un de vous s'est deconnecté.")
            changementDeMenu(fakeBtnMenu[0])
        });
        changementDeMenu(fakeBtnMenu[1])
    });

    peer.on('disconnected', function () {
        console.log("reconnexion...");
        peer.reconnect();
    });

    peer.on('call', function (appel_entrant) {
        console.log("appel entrant!");
        call = appel_entrant;
        call.on('stream', function (streamOfPeer) {
            videoDiv = document.getElementById("vidFeedback");
            videoDiv.style.display = "";
            videoDiv.srcObject = streamOfPeer;
            videoDiv.play();
        });
        call.answer();
    });
    localStorage.removeItem('codeAmi');
}

function Connexion() {
    if (document.querySelector("#idDuContact").value != "") {
        let iddContact = document.getElementById('IdDuContact').value;
        conn = peer.connect(iddContact);
        idAutre = iddContact;
        conn.on('data', function (data) {
            alert(data);
        });
        conn.on('close', function (data) {
            alert("L'un de vous s'est deconnecté.")
            changementDeMenu(fakeBtnMenu[0])
        });
        changementDeMenu(fakeBtnMenu[1])
    } else {
        alert("Rentre le nom de ton contact.")
    }
}

function SendMessage() {
    let msgAEnvoyer = document.getElementById('idmsgAEnvoyer').value;
    conn.send(msgAEnvoyer);
}

function CallDude() {
    navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }).then(function (stream) {
            console.log("lancement appel... a " + String(idAutre));
            call = peer.call(idAutre, stream);
        })
        .catch(function (err) {
            console.log(err);
            alert("Faudra activer ta cam pour lancer l'appel.");
        });
}

var dicoZones = {
    'returnArrow': '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1);"><input class="inputEcoute" id="inputChanmax" placeholder="Ton nom...">',

    'BtnAleatoire': '<img src="assets/ecoute.svg" style="height: 100px; filter: brightness(1.1); opacity:.5">Mode aléatoire en construction.',

    'BtnParam': "<div style='padding: 10px; max-width:550px;'><h4>Ecoute.app</h4><p><strong>Ecoute</strong> est entièrement libre d'utilisation et fonctionne entièrement sans utiliser tes données.<br>C'est comme utiliser un <strong>talkie-walkie</strong> sous stéroïdes. Utilise le sans modération. Tout ce qui se passe ici reste entre toi et ton interlocuteur. </p><p>-B</p></div>",

    'BtnConnaissance': '<h4>Mon identifiant:</h4><span id="monIdFrr"></span><div id="qrcode"></div><hr><span><input class="inputEcoute" type="text" placeholder="Nom de ton ami" id="IdDuContact"><button onClick="alert(\'Camera QR code !\')">QR</button></span><button id="btn-connex" onclick="Connexion()">Connexion</button><br>',

    'BtnUIMessages': '<div><h2 id="titreConv">Messages</h2><video id="vidFeedback" width="100%"></video><button onclick="CallDude()">Camera</button><span><div class="smsContainer"></div><input type="text" class="inputEcoute" placeholder="Message..." id="idmsgAEnvoyer"><button onclick="SendMessage()">Send</button></span></div>',
}

document.getElementById("zonePrincipalee").innerHTML = dicoZones["returnArrow"];
document.querySelector("#inputChanmax").value = localStorage.getItem("pseudoAvant");

function changementDeMenu(bouton) {
    let zoneParamID = document.getElementById("zonePrincipalee");
    let zoneBoutons = document.querySelector("#boutonsMenu");
    let flecheRetour = document.querySelector("#returnArrow");
    if (idMoi == "" && document.querySelector("#inputChanmax").value != "") {
        idMoi = String(document.querySelector("#inputChanmax").value) + '-' + String(Math.floor(Math.random() * 100));
        localStorage.setItem("pseudoAvant", document.querySelector("#inputChanmax").value)
    }
    if (String(dicoZones[bouton.id]).trim() != String(zoneParamID.innerHTML).trim()) {
        zoneParamID.style.transform = "rotateX(-90deg)";
        if (bouton.id == "BtnUIMessages") {
            zoneBoutons.style.transform = "translateY(50vh)";
        } else {
            zoneParamID.style.height = "60vh";
            zoneBoutons.style.display = "";
        }
        setTimeout(() => { //to wait for animation heheh
            zonePrincipalee.innerHTML = dicoZones[bouton.id];
            zoneParamID.style.transform = "rotateX(0deg)";
            if (bouton.id == "BtnUIMessages") {
                zoneParamID.style.height = "85%";
                zoneBoutons.style.display = "none";
                flecheRetour.style.transform = "translateX(0)";
            } else {
                flecheRetour.style.transform = "translateX(50px)";
                zoneBoutons.style.transform = "translateY(0vh)"
            }
            if (bouton.id == "BtnConnaissance") {
                if (localStorage.getItem("codeAmi") != null) document.querySelector("#IdDuContact").value = idAutre
                JeSuisLanceur(bouton.id)
            }
        }, 400);
    } else {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones["returnArrow"];
            zoneParamID.style.transform = "rotateX(0deg)";
        }, 400);
    }
    setTimeout(() => {
        if (document.querySelector("#inputChanmax") != null) document.querySelector("#inputChanmax").value = localStorage.getItem("pseudoAvant");
    }, 500)
};


if (localStorage.getItem("codeAmi") != null) {
    console.log("code ami! ")
    idAutre = localStorage.getItem("codeAmi");
    changementDeMenu(fakeBtnMenu[2]);
};
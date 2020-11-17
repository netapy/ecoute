var lastPressed;
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
var streamLocal;

function JeSuisLanceur(mode) {
    //let iddMoi = document.getElementById('SaisieIDd').value; ct pour choisir son id lol
    if (idDefini == false) peer = new Peer(idMoi, {
        host: SignalingHost["host"],
        port: SignalingHost["port"],
        path: SignalingHost["path"]
    });
    let newQR = () => new QRCode(document.getElementById("qrcode"), {
        text: "https://ecoute.app/" + String(idMoi),
        width: 80,
        height: 80,
        colorLight: "#eeeeee"
    });

    peer.on('open', function (id) {
        console.log('My peer ID is: ' + String(id));
        idMoi = String(id);
        document.getElementById("monIdFrr").innerHTML = idMoi;
        uiConnex("connecte")
        idDefini = true;
        newQR()
    });
    if (idMoi != "") {
        document.getElementById("monIdFrr").innerHTML = idMoi;
    }

    if (idDefini == true) newQR()

    peer.on('error', err => {
        console.log(err)
    });

    peer.on('connection', function (cc) {
        console.log("connexion entrante ");
        conn = cc;
        idAutre = conn.peer;
        paramConn()
    });

    peer.on('disconnected', function () {
        console.log("reconnexion...");
        peer.reconnect();
    });

    peer.on('call', function (appel_entrant) {
        call = appel_entrant;
        paramCall();
        call.answer(streamLocal);
        
    });
    localStorage.removeItem('codeAmi');
}

function paramCall(){
    call.on('stream', function (streamOfPeer) {
        videoDiv = document.getElementById("vidFeedback");
        videoDiv.srcObject = streamOfPeer;
        video.addEventListener('loadedmetadata', () => {
            videoDiv.play();
        })
        videoDiv.style.display = "block";
    });
}

function Connexion() {
    let iddContact = document.getElementById('IdDuContact').value;
    conn = peer.connect(iddContact);
    idAutre = iddContact;
    paramConn();
}

function paramConn() {
    conn.on('data', function (data) {
        divSms = document.querySelector("#smsContainer");
        divSms.insertAdjacentHTML("beforeend", "<div style='text-align: left;' class='smsTxt'>" + String(data) + "</div>");
        divSms.scrollTop = divSms.scrollHeight;
    });
    conn.on('close', function (data) {
        swal("Fin de l'appel.");
        changementDeMenu(fakeBtnMenu[0]);
        streamLocal.getTracks().forEach(track => track.stop());
    });
    changementDeMenu(fakeBtnMenu[1]);
}

function SendMessage() {
    let msgAEnvoyer = document.getElementById('idmsgAEnvoyer');
    conn.send(msgAEnvoyer.value);
    let divSms = document.querySelector("#smsContainer")
    divSms.insertAdjacentHTML("beforeend", "<div class='smsTxt' style='text-align: right; opacity:.7;'>" + String(msgAEnvoyer.value) + "</div>");
    msgAEnvoyer.value = "";
    divSms.scrollTop = divSms.scrollHeight;
}

function CallDude() {
    navigator.mediaDevices.getUserMedia({
            video: {
                frameRate: {
                    ideal: 10,
                    max: 15
                },
                width: 500,
                height: 500
            },
            audio: false
        }).then(function (stream) {
            streamLocal = stream;
            call = peer.call(idAutre, streamLocal);
            paramCall();
        })
        .catch(function (err) {
            console.log(err);
        });
}

var dicoZones = {
    'returnArrow': '<img src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1);"><input class="inputEcoute" id="inputChanmax" placeholder="Ton nom...">',

    'BtnAleatoire': '<img src="assets/ecoute.svg" style="height: 100px; filter: brightness(1.1); opacity:.5">Mode aléatoire en construction.',

    'BtnParam': "<div style='padding: 10px; max-width:550px;'><h4>Ecoute.app</h4><p><strong>Ecoute</strong> est entièrement libre d'utilisation et fonctionne entièrement sans utiliser tes données.<br>C'est comme utiliser un <strong>talkie-walkie</strong> sous stéroïdes. Utilise le sans modération. Tout ce qui se passe ici reste entre toi et ton interlocuteur. </p><p>-B</p></div>",

    'BtnConnaissance': '<h4>Toi :</h4><span id="monIdFrr"></span><div id="qrcode"></div><hr><h4>Lui/Elle :</h4><span style="width:60%"><input class="inputEcoute col-10" type="text" placeholder="Son nom..." id="IdDuContact"><button class="col-2" id="qrBtn" onClick="lancementCameraQR();"><img src="assets/miniqr.svg" class="qrlogo"></button></span><button id="btn-connex" onclick="Connexion()" disabled>Connexion</button>',

    'BtnUIMessages': '<div style="display: flex; flex-flow: column; height: 100%; width:95%;"><h4 id="titreConv">_messages</h4><video id="vidFeedback" width="100%"></video><button class="buttonEct" onclick="CallDude()">Appeler ce contact</button><div id="smsContainer"></div><span><input type="text" class="col-10 inputEcoute" placeholder="Message..." id="idmsgAEnvoyer"><button class="col-2 buttonEct" onclick="SendMessage()">&#10148;</button></span></div>',
}

document.getElementById("zonePrincipalee").innerHTML = dicoZones["returnArrow"];
document.querySelector("#inputChanmax").value = localStorage.getItem("pseudoAvant");

function changementDeMenu(bouton) {
    let zoneParamID = document.getElementById("zonePrincipalee");
    let zoneBoutons = document.querySelector("#boutonsMenu");
    let flecheRetour = document.querySelector("#returnArrow");
    uiConnex("hide")
    if (idMoi == "" && document.querySelector("#inputChanmax").value != "") {
        idMoi = String(document.querySelector("#inputChanmax").value) + '-' + String(Math.floor(Math.random() * 100));
        localStorage.setItem("pseudoAvant", document.querySelector("#inputChanmax").value)
    }
    if (lastPressed != bouton.id) {
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
                zoneParamID.style.height = "92%";
                zoneBoutons.style.display = "none";
                flecheRetour.style.transform = "translateX(0)";
                document.querySelector("#titreConv").innerHTML = "✉️ " + String(idAutre)
                document.querySelector('#idmsgAEnvoyer').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        SendMessage()
                    }
                });
            } else {
                flecheRetour.style.transform = "translateX(50px)";
                zoneBoutons.style.transform = "translateY(0vh)"
            }
            if (bouton.id == "BtnConnaissance") {
                uiConnex("on")
                document.querySelector('#IdDuContact').addEventListener('keypress', function (e) {
                    if (document.querySelector('#IdDuContact').value != '' && idDefini == true) {
                        let boutonConnex = document.querySelector("#btn-connex")
                        boutonConnex.style.backgroundColor = "#5770BE";
                        boutonConnex.disabled = false;
                    }
                });
                if (localStorage.getItem("codeAmi") != null) document.querySelector("#IdDuContact").value = idAutre;
                JeSuisLanceur(bouton.id)
            }
        }, 400);
        lastPressed = bouton.id;
    } else {
        zoneParamID.style.transform = "rotateX(-90deg)";
        setTimeout(() => {
            zonePrincipalee.innerHTML = dicoZones["returnArrow"];
            zoneParamID.style.transform = "rotateX(0deg)";
        }, 400);
        lastPressed = "none";
    }
    setTimeout(() => {
        if (document.querySelector("#inputChanmax") != null) document.querySelector("#inputChanmax").value = localStorage.getItem("pseudoAvant");
    }, 500)
};


if (localStorage.getItem("codeAmi") != null) {
    console.log("code ami! ")
    idAutre = localStorage.getItem("codeAmi");
    changementDeMenu(fakeBtnMenu[2]);
    document.querySelector("#boutonsMenu").style.transform = "translateY(50vh)";
};

function uiConnex(param) {
    if (param == "on") {
        document.querySelector("#connexStat").style.display = "block";
    } else if (param == "hide") {
        document.querySelector("#connexStat").style.display = "none";
    } else if (param == "connecte") {
        document.querySelector("#connexStat").innerHTML = "Connecté <span style='color:green;'>&#10004;</span>"
        document.querySelector("#connexStat").style.animation = "none";
    }
}
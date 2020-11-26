//Service Worker Section
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}
// end SW 
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
var twocall;
var displHelp = false;

function JeSuisLanceur(mode) {
    if (displHelp) {
        swal("", "Voici ton lien et ton code QR. \nEnvoi simplement un des deux à ton contact.\n\n Il n'aura plus qu'à cliquer sur \"Connexion\", et vous serez mis en relation !", "info", {
                buttons: {
                    yes: "Okk!"
                },
            })
            .then((value) => {
                switch (value) {
                    case "yes":
                        displHelp = false;
                }
            });
    }
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
        uiConnex("connecte");
        idDefini = true;
        document.getElementById("monIdFrr").innerHTML = '<span class="shyUrl">ecoute.app/</span>' + idMoi;
        newQR();
    });
    if (idMoi != "") {
        document.getElementById("monIdFrr").innerHTML = '<span class="shyUrl">ecoute.app/</span>' + idMoi;
    }

    if (idDefini == true) newQR()

    peer.on('error', err => {
        console.log(err)
        if (err.type == 'peer-unavailable') swal('Désolé', "L'utilisateur n'existe pas ou n'est pas connecté.", 'error').then((value) => {
            changementDeMenu(fakeBtnMenu[0]);
            streamLocal.getTracks().forEach(track => track.stop());
        });
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

function paramCall() {
    call.on('stream', function (streamOfPeer) {
        affCachTxtDivs("masquer");
        let videoDiv = document.getElementById("vidYou");
        videoDiv.srcObject = streamOfPeer;
        videoDiv.play();
        document.getElementsByClassName("vidCont")[0].style.display = "block"; //1 = me
    });
    call.on('close', function () {
        affCachTxtDivs("afficher");
    })
}

function clsCall() {
    streamLocal.getTracks().forEach(track => track.stop());
    document.querySelector("#callBtn").style.display = "block";
    document.getElementsByClassName("vidCont")[1].style.display = "none";
    affCachTxtDivs("afficher");
    //call.close(); //MEERDE CA LE FERME AUSSI POUR L'AUTRE :)
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
        changementDeMenu(fakeBtnMenu[0]);
        streamLocal.getTracks().forEach(track => track.stop());
    });
    lastPressed = "none";
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
                width: 480,
                height: 480
            },
            audio: true
        }).then(function (stream) {
            affCachTxtDivs("masquer");
            streamLocal = stream;
            let videoDiv = document.getElementById("vidMe");
            videoDiv.srcObject = stream;
            videoDiv.play();
            document.getElementsByClassName("vidCont")[1].style.display = "block"; //1 = me
            document.querySelector("#callBtn").style.display = "none";
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

    'BtnParam': "<div style='padding: 10px; max-width:550px;'><h5>Ecoute,</h5><p>Dès l'instant où la connexion est établie entre vous, plus rien n'existe en dehors de votre conversation. <br>Pas de serveurs, publicités, trackers... Rien.<br>Lorsque tout disparaît, il ne reste plus que vous, votre parole et votre <strong>écoute.</strong></p><p>Profitez, personne ne vous regarde.</p><p>-B</p></div>",

    'BtnConnaissance': '<h4>Toi :</h4><div id="monIdFrr" onclick="copyToClipboard();swal(\'Ton lien a bien été copié.\')"></div><div id="qrcode"></div><hr><h4>Lui/Elle :</h4><span style="width:60%"><input class="inputEcoute col" type="text" placeholder="Son nom unique..." id="IdDuContact"></span><button id="btn-connex" onclick="Connexion()" disabled>Connexion</button>',

    'BtnUIMessages': '<div style="display: flex; flex-flow: column; height: 100%; width:95%;"><h4 id="titreConv">_messages</h4><div class="row"><div class="col-md-6 text-center vidCont"><video class="convVideo" id="vidYou" playsinline></video></div><div class="col-md-6 text-center vidCont"><span class="clsbtnCam" onclick="clsCall()">x</span><video class="convVideo" id="vidMe" muted playsinline></video></div></div><button id="callBtn" class="buttonEct" onclick="CallDude()">📷 Appel vidéo</button><div class="txtDiv" id="smsContainer"></div><span class="txtDiv"><input type="text" class="col-10 inputEcoute" placeholder="Message..." id="idmsgAEnvoyer"><button class="col-2 buttonEct" onclick="SendMessage();"><img src="assets/send.svg"></button></span></div>',
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
            zoneParamID.style.margin = "0px";
        } else {
            zoneParamID.style.height = "65%";
            zoneBoutons.style.display = "";
        }
        setTimeout(() => { //to wait for animation heheh
            zonePrincipalee.innerHTML = dicoZones[bouton.id];
            zoneParamID.style.transform = "rotateX(0deg)";
            if (bouton.id == "BtnUIMessages") {
                zoneParamID.style.height = "100vh";
                zoneParamID.style.width = "100vw";
                zoneBoutons.style.display = "none";
                flecheRetour.style.transform = "translateX(0)";
                document.querySelector("#titreConv").innerHTML = "✉️ " + String(idAutre)
                document.querySelector('#idmsgAEnvoyer').addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        SendMessage()
                    }
                });
            } else {
                zoneParamID.style.width = "auto";
                zoneParamID.style.margin = "0px 20px";
                flecheRetour.style.transform = "translateX(50px)";
                zoneBoutons.style.transform = "translateY(0vh)"
            }
            if (bouton.id == "BtnConnaissance") {
                uiConnex("on")
                let boutonConnex = document.querySelector("#btn-connex")
                document.querySelector('#IdDuContact').addEventListener('keypress', function (e) {
                    if (document.querySelector('#IdDuContact').value != '' && idDefini == true) {
                        boutonConnex.style.backgroundColor = "#5770BE";
                        boutonConnex.disabled = false;
                    }
                });
                if (localStorage.getItem("codeAmi") != null) {
                    document.querySelector("#IdDuContact").value = idAutre;
                    boutonConnex.style.backgroundColor = "#5770BE";
                    boutonConnex.disabled = false;
                }
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

function copyToClipboard() {
    var dummy = document.createElement("textarea");
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
    dummy.value = String("ecoute.app/" + idMoi);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

var borderStyleSheet = document.createElement("style");
document.head.appendChild(borderStyleSheet);
borderStyleSheet.sheet.insertRule("@media (min-aspect-ratio: 2/5) and (max-width: 767px) {.txtDiv{display: none}}", 0);

function affCachTxtDivs(choix) {
    if (choix == "masquer") {
        borderStyleSheet.disabled = false;
    } else {
        borderStyleSheet.disabled = true;
    }
}
affCachTxtDivs("afficher");

function closeBackToMenu(btn) {
    swal("T'es sûr de vouloir quitter la conv ?", {
            buttons: {
                cancel: "Nan!",
                defeat: "Oui",
            },
        })
        .then((value) => {
            switch (value) {
                case "defeat":
                    try {
                        streamLocal.getTracks().forEach(track => track.stop());
                    } catch (err) {};
                    changementDeMenu(btn);
                    peer.destroy();
                    break;
                default:
                    break;
            }
        });
}
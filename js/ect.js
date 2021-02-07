var lastPressed, peer, conn, call, idAutre;

var listePaires = [];
var listeConnexions = [];
var listeCalls = [];
var indexConn = 0;

"serviceWorker" in navigator && navigator.serviceWorker.register("service-worker.js");
var idMoi = "";

let SignalingHost,
    fakeBtnMenu = [{
        id: "returnArrow"
    }, {
        id: "BtnUIMessages"
    }, {
        id: "BtnConnaissance"
    }],
    idDefini = !1,
    paramVid = {
        frameRate: {
            ideal: 15,
            max: 16
        },
        width: 480,
        height: 480
    };
var streamLocal, twocall, displHelp = !1;
var myCallTick = "none";

function resetSignaling() {
    SignalingHost = {
        host: "www.ecoute.app",
        port: 9000,
        path: "/ecouteapp"
    }
    localStorage.setItem("signalServer", JSON.stringify(SignalingHost))
}

if (localStorage.getItem("signalServer") == null) {
    resetSignaling()
} else {
    SignalingHost = JSON.parse(localStorage.getItem("signalServer"))
}

function JeSuisLanceur(e) {
    let qrGen = () => new QRCode(document.getElementById("qrcode"), {
        text: "https://ecoute.app/" + String(idMoi),
        width: 80,
        height: 80,
        colorLight: "#eeeeee"
    });

    if (!idDefini) {
        peer = new Peer(idMoi, {
            host: SignalingHost.host,
            port: SignalingHost.port,
            path: SignalingHost.path
        });
    } else {
        document.getElementById("monIdFrr").innerHTML = '<span class="shyUrl">ecoute.app/</span>' + idMoi;
        qrGen();
    }

    peer.on("open", (function (e) {
        idMoi = String(e);
        uiConnex("connecte");
        idDefini = !0;
        document.getElementById("monIdFrr").innerHTML = '<span class="shyUrl">ecoute.app/</span>' + idMoi;
        qrGen();
    }));

    peer.on("error", e => {
        "peer-unavailable" == e.type && swal("Désolé", "L'utilisateur n'existe pas ou n'est pas connecté.", "error").then(e => {
            changementDeMenu(fakeBtnMenu[0]);
            try {
                streamLocal.getTracks().forEach(e => e.stop());
            } catch (e) {};
        })
    });
    peer.on("connection", (function (e) {
        swal(String(e.peer) + " aimerais rejoindre une conversation avec toi.", {
                buttons: {
                    accept: "Accepter",
                    defeat: "Ignorer",
                },
                closeOnClickOutside: false
            })
            .then((value) => {
                switch (value) {
                    case "accept":
                        idAutre = e.peer;

                        listeConnexions[indexConn] = e;
                        listePaires.push(e.peer);
                        paramConn(listeConnexions[indexConn]);
                        //setTimeout(() => {
                        //    listeConnexions[indexConn - 1].send("^^////" + String(listePaires));
                        //}, 2000)
                        listeConnexions[indexConn].send("^^////" + String(listePaires));
                        indexConn += 1;
                        if (myCallTick != "none") CallDude(myCallTick);
                        if (listeConnexions.length > 1) document.querySelector("#titreConv").innerHTML = "📡 Groupe"
                        break;
                    default:
                        break;
                };
            });
    }));
    peer.on("disconnected", (function () {
        peer.reconnect()
    }));
    peer.on("call", (function (e) {
        listeCalls[indexConn] = e;
        paramCall(e);
        e.answer();
        indexConn += 1
    }));
    localStorage.removeItem("codeAmi");
};

function paramCall(ecall) {
    ecall.on("stream", (function (e) {
        try {
            document.querySelector("#a" + ecall.peer).parentElement.remove();
        } catch (e) {};
        newVidChat(e, ecall.peer);
    }));
    ecall.on("close", (function () {
        console.log('call ferme');
    }));
};

function clsCall() {
    streamLocal.getTracks().forEach(e => e.stop());
    document.getElementsByClassName("vidCont")[1].style.display = "none";
};

function Connexion(e) {
    let conn = peer.connect(e);
    idAutre = e;
    listePaires.push(e);
    listeConnexions[indexConn] = conn;
    paramConn(listeConnexions[indexConn]);
    indexConn += 1;
};

function paramConn(e) {
    e.on("data", (function (e) {
        if (!String(e).includes("^^////")) {
            divSms = document.querySelector("#smsContainer");
            divSms.insertAdjacentHTML("beforeend", "<div style='text-align: left;' class='smsTxt'>" + String(e) + "</div>");
            divSms.scrollTop = divSms.scrollHeight;
        } else {
            let msg = String(e.replace("^^////", "")).split(',').filter(e => e !== idMoi);
            msg = msg.filter(e => listePaires.indexOf(e) < 0)
            if (msg.length != 0) {
                for (idpeer in msg) {
                    Connexion(msg[idpeer])
                };
            };
        };
    }));
    e.on("close", (function () {
        for (conn in listeConnexions) {
            if (listeConnexions[conn]._open === false) {
                try {
                    document.querySelector("#a" + listeConnexions[conn].peer).parentElement.remove();
                    listeConnexions[conn] = 'closed';
                    listePaires.splice(listePaires.indexOf(listeConnexions[conn].peer), 1)
                } catch (e) {}
            }
        }

    }));
    lastPressed = "none";
    //on check si on est sur le menu de conv ou pas, si c'est pas le cas on y va
    if (!document.body.contains(document.querySelector("#titreConv"))) changementDeMenu(fakeBtnMenu[1]);
}

function SendMessage() {
    let e = document.getElementById("idmsgAEnvoyer");
    for (ii in listeConnexions) {
        listeConnexions[ii].send(e.value);
    }
    let t = document.querySelector("#smsContainer");
    t.insertAdjacentHTML("beforeend", "<div class='smsTxt' style='text-align: right; opacity:.7;'>" + String(e.value) + "</div>"), e.value = "", t.scrollTop = t.scrollHeight;
}

function CallDude(e) {
    try {
        streamLocal.getTracks().forEach(e => e.stop());
    } catch (e) {};
    try {
        document.querySelector("#ait-sm-ee").parentElement.remove();
    } catch (e) {}
    let videoStreamm;
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(async theStream => {
        if (e == 'video') {
            let videoStream = await navigator.mediaDevices.getUserMedia({
                video: paramVid
            }).catch(e => {
                throw e
            });
            [videoStreamm] = videoStream.getVideoTracks();
            theStream.addTrack(videoStreamm);
            myCallTick = "video";
        } else if (e == 'ecran') {
            let videoStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            }).catch(e => {
                throw e
            });
            [videoStreamm] = videoStream.getVideoTracks();
            theStream.addTrack(videoStreamm);
            myCallTick = "ecran";
        } else {
            myCallTick = "audio";
        }
        streamLocal = theStream;
        let vid = document.querySelector('#it-sm-ee');
        vid.srcObject = streamLocal;
        vid.play();
        for (peers in listePaires) {
            let ecall = peer.call(listePaires[peers], streamLocal);
            paramCall(ecall);
        }
    }).catch(e => {
        throw e
    });
};

var dicoZones = {
    returnArrow: '<img alt="Logo de Ecoute.app" class="nudeLogo" src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1);"><input class="inputEcoute" id="inputChanmax" placeholder="Ton nom...">',
    BtnAleatoire: '<img src="assets/ecoute.svg" style="height: 100px; filter: brightness(1.1); opacity:.5">Salles d\'écoute en construction.',
    BtnParam: '<div style="padding: 10px; max-width:550px;"><h5>Paramètres :</h5><p>Tu es libre d\'utiliser le serveur de signalisation de ton choix.</p><div class="col"><input type="text" class="form-control" placeholder="Adresse"></div><div class="col"><input type="text" class="form-control" placeholder="Port"></div><div class="col"><input type="text" class="form-control" placeholder="Chemin"></div><div><button class="col-6 btn" onclick="resetSignaling();swal({text:\'Serveur Ecoute enregistré.\',icon:\'success\',button:!1,timer:1e3});">Réinitialiser</button><button class="col-6 btn" style="color:#5770BE" onclick="saveNewSignaling()">Appliquer</button></div></div>',
    BtnConnaissance: '<h4>Toi :</h4><div id="monIdFrr" onclick="copyToClipboard();swal(\'Ton lien a bien été copié.\')"></div><div id="qrcode"></div><hr><h4>Lui/Elle :</h4><span style="width:60%"><input class="inputEcoute col" type="text" placeholder="Son nom unique..." id="IdDuContact"></span><button id="btn-connex" onclick="Connexion(document.getElementById(\'IdDuContact\').value)" disabled>Connexion</button>',
    BtnUIMessages: '<div style="display: flex; flex-flow: column; height: 100%; width:95%;"><h4 id="titreConv">_messages</h4><div class="convVidContainer"></div><div class="myVidContainer"><div class="vidbloc"><video data-etatcarre="min" id="it-sm-ee" onclick="vidFullScreen(this)" muted></video></div></div><div class="row text-center"><div class="col-md-4 col-s-12"><button id="callBtn" class="buttonEct" onclick="CallDude(\'video\')">📷 Appel vidéo</button></div><div class="col-md-4 col-s-12 d-none d-md-block"><button id="callBtn" class="buttonEct" onclick="CallDude(\'ecran\')">💻 Partage d\'écran</button></div><div class="col-md-4 col-s-12"><button id="callBtn" class="buttonEct" onclick="CallDude(\'audio\')">📞 Appel vocal</button></div></div><div class="txtDiv" id="smsContainer"></div><span class="txtDiv"><input type="text" class="col-10 inputEcoute" style="background-color: #efefefbe;" placeholder="Message..." id="idmsgAEnvoyer"><button class="col-2 buttonEct" onclick="SendMessage();" style="background-color: transparent;"><img src="assets/send.svg"></button></span></div>'
};

const newVidChat = (viddt, identif) => {
    if (!document.body.contains(document.querySelector('#a' + identif))) {
        let box = document.createElement('div');
        box.classList.add("vidbloc");
        let vid = box.insertAdjacentElement("afterbegin", document.createElement('video'));
        vid.setAttribute('data-etatcarre', 'min');
        vid.id = "a" + identif;
        vid.setAttribute('onclick', 'vidFullScreen(this)');
        vid.srcObject = viddt;
        vid.play();
        document.querySelector(".convVidContainer").insertAdjacentElement("afterbegin", box);
    }
};

const vidFullScreen = (el) => {
    if (el.dataset.etatcarre == "min") {
        el.style = "position: absolute; height: 80vw; width: auto; z-index:999; box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);  top: 50%; left: 50%; transform: translate(-50%, -50%);";
        el.dataset.etatcarre = "hii";
    } else {
        el.style = '';
        el.dataset.etatcarre = "min";
    }
}

function changementDeMenu(e) {
    let t = document.getElementById("zonePrincipalee"),
        n = document.querySelector("#boutonsMenu"),
        o = document.querySelector("#returnArrow");
    uiConnex("hide");
    "" == idMoi && "" != document.querySelector("#inputChanmax").value && (idMoi = String(document.querySelector("#inputChanmax").value.replace(/[^\w\s]/gi, "").replace(/ /g, "")) + "-" + String(Math.floor(1000 * Math.random())), localStorage.setItem("pseudoAvant", document.querySelector("#inputChanmax").value));
    lastPressed != e.id ? (t.style.transform = "rotateX(-90deg)", "BtnUIMessages" == e.id ? (n.style.transform = "translateY(50vh)", t.style.margin = "0px") : (t.style.height = "65%", n.style.display = ""), setTimeout(() => {
        if (zonePrincipalee.innerHTML = dicoZones[e.id], t.style.transform = "rotateX(0deg)", "BtnUIMessages" == e.id ? (t.style.height = "100vh", t.style.width = "100vw", t.style.boxShadow = "0px 0px 0px transparent", t.style.backgroundColor = "transparent", n.style.display = "none", o.style.transform = "translateX(0)", document.querySelector("#titreConv").innerHTML = "✉️ " + String(idAutre), document.querySelector("#idmsgAEnvoyer").addEventListener("keydown", (function (e) {
                "Enter" === e.key && SendMessage()
            }))) : (t.style.width = "auto", t.style.boxShadow = "", t.style.backgroundColor = "", t.style.margin = "0px 20px", o.style.transform = "translateX(50px)", n.style.transform = "translateY(0vh)"), "BtnConnaissance" == e.id) {
            uiConnex("on");
            let t = document.querySelector("#btn-connex");
            document.querySelector("#IdDuContact").addEventListener("keypress", (function (e) {
                "" != document.querySelector("#IdDuContact").value && 1 == idDefini && (t.style.backgroundColor = "#5770BE", t.disabled = !1)
            })), null != localStorage.getItem("codeAmi") && (document.querySelector("#IdDuContact").value = idAutre, t.style.backgroundColor = "#5770BE", t.disabled = !1), JeSuisLanceur(e.id)
        }
    }, 400), lastPressed = e.id) : (t.style.transform = "rotateX(-90deg)", setTimeout(() => {
        zonePrincipalee.innerHTML = dicoZones.returnArrow, t.style.transform = "rotateX(0deg)"
    }, 400), lastPressed = "none"), setTimeout(() => {
        null != document.querySelector("#inputChanmax") && (document.querySelector("#inputChanmax").value = localStorage.getItem("pseudoAvant"))
    }, 500)
}

function uiConnex(e) {
    "on" == e ? document.querySelector("#connexStat").style.display = "block" : "hide" == e ? document.querySelector("#connexStat").style.display = "none" : "connecte" == e && (document.querySelector("#connexStat").innerHTML = "Connecté <span style='color:green;'>&#10004;</span>", document.querySelector("#connexStat").style.animation = "none")
}

function copyToClipboard() {
    var e = document.createElement("textarea");
    document.body.appendChild(e), e.value = String("ecoute.app/" + idMoi), e.select(), document.execCommand("copy"), document.body.removeChild(e)
}
document.getElementById("zonePrincipalee").innerHTML = dicoZones.returnArrow, document.querySelector("#inputChanmax").value = localStorage.getItem("pseudoAvant"), null != localStorage.getItem("codeAmi") && (idAutre = localStorage.getItem("codeAmi"), changementDeMenu(fakeBtnMenu[2]), document.querySelector("#boutonsMenu").style.transform = "translateY(50vh)");
var borderStyleSheet = document.createElement("style");


function closeBackToMenu(e) {
    swal("T'es sûr de vouloir quitter la conv ?", {
        buttons: {
            cancel: "Nan!",
            defeat: "Oui"
        }
    }).then(t => {
        switch (t) {
            case "defeat":
                try {
                    streamLocal.getTracks().forEach(e => e.stop())
                } catch (e) {}
                idDefini = !1;
                peer.destroy();
                changementDeMenu(e);
                idMoi = '';
                document.querySelector("#connexStat").innerHTML = "<span id='connexStat'>Connexion...</span>"
                break;
            default:
                break
        }
    })
}

function saveNewSignaling() {
    let listvalueInput = document.querySelector(".zonePrincipale ").getElementsByClassName("form-control")
    if (![...listvalueInput].map(x => x.value).includes("")) {
        let newSignal = {
            host: listvalueInput[0].value,
            port: listvalueInput[1].value,
            path: listvalueInput[2].value
        }
        localStorage.setItem("signalServer", JSON.stringify(newSignal))
        SignalingHost = newSignal;
        swal({
            text: "Serveur enregistré.",
            icon: "success",
            button: false,
            timer: 1000
        })
    } else {
        swal({
            text: "Saisis tous les champs.",
            icon: "error",
            button: false,
            timer: 1000
        })
    }
}

//changementDeMenu(fakeBtnMenu[1])
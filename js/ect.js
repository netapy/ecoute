var lastPressed, peer, conn, call, idAutre;
var listePaires = [];
var listeConnexions = [];
var listeCalls = [];
var indexConn = 0;
var idMoi = "";
"serviceWorker" in navigator && navigator.serviceWorker.register("service-worker.js");

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
            ideal: 20,
            max: 30
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
        colorLight: "#eeeeee",
        colorDark: "#3d3d3d"
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
            quitConv(fakeBtnMenu[0])
        })
    });
    peer.on("connection", (function (e) {
        swal(getEmoji(e.peer) + String(e.peer) + " veut rejoindre ta conversation.", {
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
                        listeConnexions[indexConn].send("^^////" + String(listePaires));
                        indexConn += 1;
                        if (listeConnexions.filter((e) => {
                                return e != null
                            }).length > 1) document.querySelector("#titreConv").innerHTML = "📡 Groupe <button class='btn' onclick='listPeersFun()'>👥</button>";
                        setTimeout(() => {
                            try {
                                document.querySelector("#attenteConv").remove();
                            } catch (e) {}
                            document.querySelector("#btnsCall").innerHTML = boutonsCall;
                            if (myCallTick != "none") CallDude(myCallTick);
                        }, 500)
                        break;
                    default:
                        break;
                };
            });
    }));
    peer.on("disconnected", (function () {
        peer.reconnect()
        console.log("Deconnecté, reconnexion...")
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
    document.querySelector("#it-sm-ee").style.display = "none";
    for (ii in listeConnexions) {
        listeConnexions[ii].send("$^^@'}" + idMoi);
    };
};

function Connexion(e) {
    let conn = peer.connect(e);
    idAutre = e;
    listePaires.push(e);
    listeConnexions[indexConn] = conn;
    paramConn(listeConnexions[indexConn]);
    indexConn += 1;
    if (listeConnexions.filter((e) => {
            return e != null
        }).length > 1) document.querySelector("#titreConv").innerHTML = "📡 Groupe <button class='btn' style='font-size:8px;opacity:.8;' onclick='listPeersFun()'>👥</button>"
};

function paramConn(e) {
    e.on("data", (function (e) {
        let divSms = document.querySelector("#smsContainer");
        if (String(e).includes("^^////")) {
            console.log(e)
            let msg = String(e.replace("^^////", "")).split(',').filter(e => e !== idMoi);
            msg = msg.filter(e => listePaires.indexOf(e) < 0)
            if (msg.length != 0) {
                for (idpeer in msg) {
                    Connexion(msg[idpeer])
                };
            };
            try {
                document.querySelector("#attenteConv").remove();
            } catch (e) {}
            document.querySelector("#btnsCall").innerHTML = boutonsCall;
        } else if (String(e).includes("=%%*=%")) {
            let sonID = e.split("=%%*=%")[1]
            divSms.insertAdjacentHTML("beforeend", "<div style='text-align: left; opacity:.6' class='smsTxt'>" + sonID + " s'est deconnecté.</div>");
        } else if (String(e).includes("$^^@'}")) {
            let sonID = e.split("$^^@'}")[1]
            document.querySelector("#a" + sonID).parentElement.remove();
        } else {
            if (String(e).includes("^!%^")) e = getEmoji(e.split("^!%^")[0].split("-")[0]) + " : " + e.split("^!%^")[1];
            divSms.insertAdjacentHTML("beforeend", "<div style='text-align: left;' class='smsTxt'>" + String(e) + "</div>");
            divSms.scrollTop = divSms.scrollHeight;
        };
    }));
    e.on("close", (function () {
        for (conn in listeConnexions) {
            if (listeConnexions[conn]._open === false) {
                try {
                    let lui = listeConnexions[conn].peer
                    document.querySelector("#a" + lui).parentElement.remove();
                    listeConnexions[conn] = 'closed';
                    listePaires.splice(listePaires.indexOf(lui), 1);
                    divSms.insertAdjacentHTML("beforeend", "<div style='text-align: left; opacity:.6' class='smsTxt'>" + lui + " s'est deconnecté.</div>");
                } catch (e) {}
            }
        }

    }));
    lastPressed = "none";
    if (!document.body.contains(document.querySelector("#titreConv"))) changementDeMenu(fakeBtnMenu[1]);
}

function SendMessage() {
    let e = document.getElementById("idmsgAEnvoyer");
    let t = document.querySelector("#smsContainer");
    let msg = e.value;
    t.insertAdjacentHTML("beforeend", "<div class='smsTxt' style='text-align: right; opacity:.7;'>" + String(e.value) + "</div>"), t.scrollTop = t.scrollHeight;
    if (listeConnexions.filter((ele) => {
            return ele != null
        }).length > 1) msg = idMoi + "^!%^" + e.value;
    for (ii in listeConnexions) {
        listeConnexions[ii].send(msg);
    };
    e.value = "";
}

function CallDude(e) {
    console.log("calling avec " + e)
    changeBtnToRaccro(e)
    try {
        streamLocal.getTracks().forEach(e => e.stop());
    } catch (e) {};
    try {
        document.querySelector("#ait-sm-ee").parentElement.remove();
    } catch (e) {}
    let videoStreamm;
    let vid = document.querySelector('#it-sm-ee');
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
            vid.style.display = "";
        } else if (e == 'ecran') {
            let videoStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            }).catch(e => {
                throw e
            });
            [videoStreamm] = videoStream.getVideoTracks();
            theStream.addTrack(videoStreamm);
            myCallTick = "ecran";
            vid.style.display = "";
        } else {
            myCallTick = "audio";
        }
        streamLocal = theStream;
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

const changeBtnToRaccro = (elem) => {
    let element = document.querySelector("#btn" + elem)
    element.onclick = () => {
        clsCall();
        document.querySelector("#btnsCall").innerHTML = boutonsCall;
    }
    element.innerHTML = "❌ Raccrocher"
};

var boutonsCall = '<div class="col-md-4 col-s-12"><button id="btnvideo" class="buttonEct callBtn" onclick="CallDude(\'video\');">📷 Appel vidéo</button></div><div class="col-md-4 col-s-12 d-none d-md-block"><button id="btnecran" class="buttonEct callBtn" onclick="CallDude(\'ecran\');">💻 Partage d\'écran</button></div><div class="col-md-4 col-s-12"><button class="buttonEct callBtn" id="btnaudio" onclick="CallDude(\'audio\');">📞 Appel vocal</button></div>'

var dicoZones = {
    returnArrow: '<img alt="Logo de Ecoute.app" class="nudeLogo" src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1);"><input class="inputEcoute" id="inputChanmax" placeholder="Ton nom..." onkeypress="return /[0-9a-zA-Z]/i.test(event.key)">',
    BtnParam: '<div style="padding: 10px; max-width:550px;"><h5>Paramètres :</h5><p>Tu es libre d\'utiliser le serveur de signalisation de ton choix.</p><div class="col"><input type="text" class="form-control" placeholder="Adresse"></div><div class="col"><input type="text" class="form-control" placeholder="Port"></div><div class="col"><input type="text" class="form-control" placeholder="Chemin"></div><div><button class="col-6 btn" onclick="resetSignaling();swal({text:\'Serveur Ecoute enregistré.\',icon:\'success\',button:!1,timer:1e3});">Réinitialiser</button><button class="col-6 btn" style="color:#5770BE" onclick="saveNewSignaling()">Appliquer</button></div></div>',
    BtnConnaissance: '<h4>Ton identifiant : </h4><div id="monIdFrr" onclick="copyToClipboard();swal({text:\'Lien copié.\',icon:\'success\',button:!1,timer:1e3})"></div><div id="qrcode"></div><hr><h4>On contacte qui ?</h4><span style="width:60%"><input class="inputEcoute col" type="text" placeholder="Son nom..." id="IdDuContact"></span><button id="btn-connex" onclick="Connexion(document.getElementById(\'IdDuContact\').value)" disabled>Connexion</button>',
    BtnSalle: '<h4>Ouverture de ta salle</h4><p>Envoi simplement le lien ou le code QR aux participants.</p><div id="qrcode"></div><div id="monIdFrr" onclick="copyToClipboard();swal({text:\'Lien copié.\',icon:\'success\',button:!1,timer:1e3})"></div><button id="btn-connex" onclick="">Ouverture</button>',
    BtnUIMessages: '<div style="display: flex; flex-flow: column; height: 100%; width:95%;"><h4 id="titreConv">_messages</h4><div class="convVidContainer"></div><div class="myVidContainer"><div class="vidbloc"><video data-etatcarre="min" id="it-sm-ee" onclick="vidFullScreen(this)" style="display:none;" muted></video></div></div><div id="attenteConv"><lottie-player  src="assets/anim/load.json" background="transparent"  speed="1"  style="width: 200px; height: 200px;" loop autoplay></lottie-player></div><div id="btnsCall" class="row text-center"></div><div class="txtDiv" id="smsContainer"></div><span class="txtDiv"><input type="text" class="col-10 inputEcoute" style="background-color: #efefefbe;" placeholder="Message..." id="idmsgAEnvoyer"><button class="col-2 buttonEct" onclick="SendMessage();" style="background-color: transparent;"><img src="assets/send.svg"></button></span></div>'
};

let noAddVideo = false;
const newVidChat = (viddt, identif) => {
    if (!document.body.contains(document.querySelector('#a' + identif)) && !noAddVideo) {
        noAddVideo = true;
        let box = document.createElement('div');
        box.classList.add("vidbloc");
        let vid = box.insertAdjacentElement("afterbegin", document.createElement('video'));
        vid.setAttribute('data-etatcarre', 'min');
        vid.id = "a" + identif;
        vid.setAttribute('onclick', 'vidFullScreen(this)');
        if (!checkStream(viddt).hasVideo) vid.style.display = "none";
        vid.srcObject = viddt;
        let playPromise = vid.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                    document.querySelector(".convVidContainer").insertAdjacentElement("afterbegin", box);
                })
                .catch(error => {
                    console.log(error)
                });
        }
        setTimeout(() => noAddVideo = false, 500)
    };
};

const vidFullScreen = (el) => {
    if (el.dataset.etatcarre == "min") {
        el.style = "position: absolute; height: 80vw; width: auto; z-index:999; box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);  top: 50%; left: 50%; transform: translate(-50%, -50%); max-height:80vw";
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
    "" == idMoi && "" != document.querySelector("#inputChanmax").value && (idMoi = String(document.querySelector("#inputChanmax").value) + "-" + String(Math.floor(100 * Math.random())), localStorage.setItem("pseudoAvant", document.querySelector("#inputChanmax").value));
    lastPressed != e.id ? (t.style.transform = "rotateX(-96deg)", "BtnUIMessages" == e.id ? (n.style.transform = "translateY(50vh)", t.style.margin = "0px") : (t.style.height = "65%", n.style.display = ""), setTimeout(() => {
        zonePrincipalee.innerHTML = dicoZones[e.id]
        t.style.transform = "rotateX(0deg)";
        "BtnUIMessages" == e.id ? (t.style.height = "100vh", t.style.width = "100vw", t.style.boxShadow = "0px 0px 0px transparent", t.style.backgroundColor = "transparent", n.style.display = "none", o.style.transform = "translateX(0)", document.querySelector("#titreConv").innerHTML = getEmoji(idAutre) + " " + String(idAutre), document.querySelector("#idmsgAEnvoyer").addEventListener("keydown", (function (e) {
            "Enter" === e.key && SendMessage()
        }))) : (t.style.width = "auto", t.style.boxShadow = "", t.style.backgroundColor = "", t.style.margin = "0px 20px", o.style.transform = "translateX(50px)", n.style.transform = "translateY(0vh)")
        if ("BtnConnaissance" == e.id) {
            uiConnex("on");
            let t = document.querySelector("#btn-connex");
            document.querySelector("#IdDuContact").addEventListener("keypress", (e) => {
                "" != document.querySelector("#IdDuContact").value && 1 == idDefini && (t.style.backgroundColor = "#5770BE", t.disabled = !1)
            })
            null != localStorage.getItem("codeAmi") && (document.querySelector("#IdDuContact").value = idAutre, t.style.backgroundColor = "#5770BE", t.disabled = !1), JeSuisLanceur(e.id)
        } else if ("BtnSalle" == e.id) {
            uiConnex("on");
            null != localStorage.getItem("codeAmi") && (document.querySelector("#IdDuContact").value = idAutre, t.style.backgroundColor = "#5770BE", t.disabled = !1), JeSuisLanceur(e.id)
        }
    }, 400), lastPressed = e.id) : (t.style.transform = "rotateX(-96deg)", setTimeout(() => {
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
                quitConv(e);
                break;
            default:
                break
        }
    })
}

function quitConv(id) {
    try {
        for (ii in listeConnexions) {
            listeConnexions[ii].send("=%%*=%" + idMoi);
        };
    } catch (e) {
        console.log(e)
    }
    try {
        streamLocal.getTracks().forEach(e => e.stop())
    } catch (e) {}
    idDefini = !1;
    peer.destroy();
    changementDeMenu(id);
    idMoi = '';
    listePaires = [];
    listeConnexions = [];
    listeCalls = [];
    document.querySelector("#connexStat").innerHTML = "<span id='connexStat'>Connexion...</span>";
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

function checkStream(stream) {
    var hasMedia = {
        hasVideo: false,
        hasAudio: false
    };
    if (stream.getAudioTracks().length)
        hasMedia.hasAudio = true;
    if (stream.getVideoTracks().length)
        hasMedia.hasVideo = true;
    return hasMedia;
}

function listPeersFun() {
    let divlistpr = document.createElement("div")
    divlistpr.insertAdjacentHTML("afterbegin", "<u>Participants : </u>")
    for (ii in listePaires) {
        divlistpr.insertAdjacentHTML("beforeend", "<p>" + getEmoji(String(listePaires[ii])) + String(listePaires[ii]) + "</p>")
    }
    swal({
        content: divlistpr,
    })
}

window.onbeforeunload = function () {
    try {
        for (ii in listeConnexions) {
            listeConnexions[ii].send("=%%*=%" + idMoi);
        };
    } catch (e) {}
}


//changementDeMenu(fakeBtnMenu[1])
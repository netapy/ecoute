var lastPressed, peer, conn, call, idAutre;
var interlocuteurs = [];
"serviceWorker" in navigator && navigator.serviceWorker.register("service-worker.js");
var idMoi = "";
let SignalingHost = {
        host: "www.ecoute.app",
        port: 9e3,
        path: "/ecouteapp"
    },
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
            ideal: 16,
            max: 16
        },
        width: 480,
        height: 480
    };
var streamLocal, twocall, displHelp = !1;

function JeSuisLanceur(e) {
    0 == idDefini && (peer = new Peer(idMoi, {
        host: SignalingHost.host,
        port: SignalingHost.port,
        path: SignalingHost.path
    }));

    let qrGen = () => new QRCode(document.getElementById("qrcode"), {
        text: "https://ecoute.app/" + String(idMoi),
        width: 80,
        height: 80,
        colorLight: "#eeeeee"
    });

    peer.on("open", (function (e) {
        idMoi = String(e), uiConnex("connecte")
        idDefini = !0, document.getElementById("monIdFrr").innerHTML = '<span class="shyUrl">ecoute.app/</span>' + idMoi;
        qrGen();
    }));

    idMoi != "" && (document.getElementById("monIdFrr").innerHTML = '<span class="shyUrl">ecoute.app/</span>' + idMoi);
    idDefini == 1 && qrGen();

    peer.on("error", e => {
        "peer-unavailable" == e.type && swal("Désolé", "L'utilisateur n'existe pas ou n'est pas connecté.", "error").then(e => {
            changementDeMenu(fakeBtnMenu[0]), streamLocal.getTracks().forEach(e => e.stop())
        })
    }), peer.on("connection", (function (e) {
        idAutre = (conn = e).peer, paramConn()
    })), peer.on("disconnected", (function () {
        peer.reconnect()
    })), peer.on("call", (function (e) {
        call = e;
        paramCall();
        call.answer();
    }))
    localStorage.removeItem("codeAmi");
}

function paramCall() {
    call.on("stream", (function (e) {
        console.log(call.peer);
        newVidChat(e, call.peer);
    })), call.on("close", (function () {
        console.log('call ferme');
    }))
};

function clsCall() {
    streamLocal.getTracks().forEach(e => e.stop());
    document.getElementsByClassName("vidCont")[1].style.display = "none";
};

function Connexion() {
    let e = document.getElementById("IdDuContact").value;
    conn = peer.connect(e);
    idAutre = e;
    paramConn();
};

function paramConn() {
    conn.on("data", (function (e) {
        divSms = document.querySelector("#smsContainer");
        divSms.insertAdjacentHTML("beforeend", "<div style='text-align: left;' class='smsTxt'>" + String(e) + "</div>");
        divSms.scrollTop = divSms.scrollHeight;
    })), conn.on("close", (function (e) {
        changementDeMenu(fakeBtnMenu[0]);
        try {
            streamLocal.getTracks().forEach(e => e.stop())
        } catch (e) {}
    })), lastPressed = "none", changementDeMenu(fakeBtnMenu[1])
}

function SendMessage() {
    let e = document.getElementById("idmsgAEnvoyer");
    conn.send(e.value);
    let t = document.querySelector("#smsContainer");
    t.insertAdjacentHTML("beforeend", "<div class='smsTxt' style='text-align: right; opacity:.7;'>" + String(e.value) + "</div>"), e.value = "", t.scrollTop = t.scrollHeight
}

function CallDude(e) {
    // try {
    //     streamLocal.getTracks().forEach(e => e.stop())
    // } catch (e) {}
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
        } else if (e == 'ecran') {
            let videoStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            }).catch(e => {
                throw e
            });
            [videoStreamm] = videoStream.getVideoTracks();
            theStream.addTrack(videoStreamm);
        };
        newVidChat(theStream, "it-sm-ee")
        call = peer.call(idAutre, streamLocal);
        paramCall();
    }).catch(e => {
        throw e
    });
};

var dicoZones = {
    returnArrow: '<img class="nudeLogo" src="assets/ecoute.svg" style="height: 150px; filter: brightness(1.1);"><input class="inputEcoute" id="inputChanmax" placeholder="Ton nom...">',
    BtnAleatoire: '<img src="assets/ecoute.svg" style="height: 100px; filter: brightness(1.1); opacity:.5">Mode productif en construction.',
    BtnParam: "<div style='padding: 10px; max-width:550px;'><h5>Ecoute,</h5><p>Dès l'instant où la connexion est établie entre vous, plus rien n'existe en dehors de votre conversation. <br>Pas de serveurs, publicités, trackers... Rien.<br>Lorsque tout disparaît, il ne reste plus que vous, votre parole et votre <strong>écoute.</strong></p><p>Profitez, personne ne vous regarde.</p><p>-B</p></div>",
    BtnConnaissance: '<h4>Toi :</h4><div id="monIdFrr" onclick="copyToClipboard();swal(\'Ton lien a bien été copié.\')"></div><div id="qrcode"></div><hr><h4>Lui/Elle :</h4><span style="width:60%"><input class="inputEcoute col" type="text" placeholder="Son nom unique..." id="IdDuContact"></span><button id="btn-connex" onclick="Connexion()" disabled>Connexion</button>',
    BtnUIMessages: '<div style="display: flex; flex-flow: column; height: 100%; width:95%;"><h4 id="titreConv">_messages</h4><div class="convVidContainer"></div><div class="row text-center"><div class="col-md-4 col-s-12"><button id="callBtn" class="buttonEct" onclick="CallDude(\'video\')">📷 Appel vidéo</button></div><div class="col-md-4 col-s-12 d-none d-md-block"><button id="callBtn" class="buttonEct" onclick="CallDude(\'ecran\')">💻 Partage d\'écran</button></div><div class="col-md-4 col-s-12"><button id="callBtn" class="buttonEct" onclick="CallDude(\'audio\')">📞 Appel vocal</button></div></div><div class="txtDiv" id="smsContainer"></div><span class="txtDiv"><input type="text" class="col-10 inputEcoute" style="background-color: #efefefbe;" placeholder="Message..." id="idmsgAEnvoyer"><button class="col-2 buttonEct" onclick="SendMessage();" style="background-color: transparent;"><img src="assets/send.svg"></button></span></div>'
};

const newVidChat = (viddt, identif) => {
    if (!document.body.contains(document.querySelector('#a' + identif))) {
        streamLocal = viddt;
        let box = document.createElement('div');
        box.classList.add("vidbloc");
        let vid = box.insertAdjacentElement("afterbegin", document.createElement('video'));
        vid.setAttribute('data-etatcarre', 'min');
        vid.id = "a" + identif;
        vid.setAttribute('onclick', 'vidFullScreen(this)');
        vid.srcObject = viddt;
        vid.play();
        document.querySelector(".convVidContainer").insertAdjacentElement("afterbegin", box);
        interlocuteurs.push(idAutre)
    }
};

const vidFullScreen = (el) => {
    if (el.dataset.etatcarre == "min") {
        el.style = "position: absolute; height: 100vw; width: auto; z-index:999; box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);  top: 50%; left: 50%; transform: translate(-50%, -50%);";
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
                changementDeMenu(e);
                break;
            default:
                break
        }
    })
}

//changementDeMenu(fakeBtnMenu[1])

var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var streaam;

function lancementCameraQR() {
    var outputData = document.getElementById("IdDuContact");
    console.log("-- fonction caméra")
    document.querySelector("#cameraDiv").style.display = "block";
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        }
    }).then(function (stream) {
        video.srcObject = stream;
        streaam = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    });

    function tick() {
        loadingMessage.innerText = "Chargement de la vidéo..."
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            loadingMessage.hidden = true;
            canvasElement.hidden = false;

            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                console.log(code.data)
                outputData.value = String(code.data).replace("https://ecoute.app/","");
                document.querySelector("#cameraDiv").style.display = "none";
                streaam.getTracks().forEach(track => track.stop())
            } 
        }
        requestAnimationFrame(tick);
    }
}
"use strict"

const proofmeCluster = "local"
const docId = window.location.href.split("design/")[1].split("/")[0]
const proofmeiFrame = `https://${proofmeCluster}.proofme.com/emptyCanva`;
let proofExists = false;


$(".editorActionShare").append(`<iframe id="proofme-iframe-receiver" src=${proofmeiFrame} width="0" height="0" style="display: none;">`)
let contentWindow
let notLetBarFinish = true
const iframe = document.getElementById('proofme-iframe-receiver');
iframe.onload = function(){
    askProofMe()
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1)
    }))
}

function askProofMe(){
    contentWindow = iframe.contentWindow;
    contentWindow.postMessage({
        reason: "windowOnLoad",
        canvaID: docId
    }, '*');
}



function setDocumentHasProof(){
    proofExists = true

    $('.buttonProofMe').html(`
        <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-version%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
        Update in ProofMe
    `)

}


function receiveMessage(event) {
    if (event.origin != `https://${proofmeCluster}.proofme.com`){
        return;
    }
    console.log("canva received event: ", event);
    if (event.data.reason === "windowOnLoad") {
        console.log("unreadCount: ", event.data.unreadCount)
        setDocumentHasProof()
    } else if (event.data.reason === "getPDFUrl") {

        notLetBarFinish = false

        setTimeout( () => {
            $(".bottomPart").css({"background": "#6ACD00"})
            $("#loading-message").remove()
            $(".beforeProgressBar").remove()
            $("#myProgress").remove()
            $("#bottomMessage").text("Success!")
            $("#bottomMessage").css({"color": "white"})
            $("#PDFUrl").html(`

                <span style="font-size: 18px;font-weight: 100;">Hooray! Here's a link to your proof:</span>

                <div style="padding: 10px;">
                    <a style="color: #04BCFF;" href='https://${proofmeCluster}.proofme.com${event.data.PDFUrl}' target="_blank">https://${proofmeCluster}.proofme.com${event.data.PDFUrl}</a>
                </div>
                `)
        }, 300)
    }


}
window.addEventListener("message", receiveMessage, false)

$(".editorActionExport").on("click", () => {
    $(".buttonBlock").on("click", () => {
            ;(function checkText () {
                    setTimeout( () => {
                    if ($(".center").html() === "Your design is ready") {
                        $(".shareButtons").append(`
                            <button class="button buttonProofMe buttonRedirect" title="Share on ProofMe">
                            <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-${proofExists?"version" : "proof"}%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
                            ${proofExists?"Update in ProofMe" : "Send to ProofMe"}
                            </button>
                        `)

                        $(".buttonRedirect").on("click", () => {
                            window.open(`https://${proofmeCluster}.proofme.com/importFromCanva?fileUrl=${b64EncodeUnicode($(".intro a").attr('href'))}&canvaID=${docId}&ifRedirect=true`)
                        })

                    } else {
                        checkText ()
                    }

                }, 300)
            })()
    })
})











$(".editorActionShare").on("click", function() {
    $(".shareButtons").append(`
        <button class="button buttonProofMe buttonExport" title="Share on ProofMe">
        <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-${proofExists?"version" : "proof"}%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
        ${proofExists?"Update in ProofMe" : "Send to ProofMe"}
        </button>
    `)

    $(".buttonExport").on("click", function() {

        $(".shareDialog").hide()
        const progressDialog = $(`
            <div style="position: fixed; width:100%;height:100%; z-index:10000">

                <div align="center" class="proofme-import-modal">
                <span class="closePopup">╳</span>
                    <div>

                    </div>
                    <div class="centerPart">
                        <div class="circleLogo">
                            <img src="https://raw.githubusercontent.com/proofme/proofme-canva/master/images/canva-sending-1%402x.png" alt="ProofMe" style="height:80px; width:80px;">
                        </div>
                        <span id="loading-message">Exporting your design to ProofMe...</span>
                        <div class="beforeProgressBar" style="height: 10px;"> </div>
                        <div id="myProgress">
                            <div id="myBar"></div>
                        </div>
                        <div class="beforeProgressBar" style="height: 15px;"> </div>

                        <div style="">
                            <span id="PDFUrl"></span>
                        </div>
                    </div>
                    <div class="bottomPart">
                        <span id="bottomMessage">It's not great until you iterate!</span>
                    </div>
                </div>
            </div>

        `)

        $('body').append(progressDialog)

        $(".closePopup").on("click", function() {
            progressDialog.remove()
            $(".modalContent").remove()
        })


        let defaultSpeed = 5
        let width = 1
        ;(function increaseBar(speed) {
            setTimeout( () => {

                width += 0.10 + Math.pow(Math.random(), 3)
                if (width > 100) width = 100
                $("#myBar").css({"width": `${width}%`})

                if (width < 100) {
                    if (!notLetBarFinish) {
                        increaseBar(1)
                    }
                    else if (width > 80) {
                        increaseBar( 5 * Math.pow((width-80), 1.5))
                    } else {
                        increaseBar(defaultSpeed)
                    }
                }
            }, speed)
        })()


        function getPDFUrl(id, token) {
            const PDFUrlRequest = $.ajax({
              url: `/_ajax/export/${id}`,
              data: {"attachment": "true"},
              headers: {
                  'content-type': 'application/json;charset=UTF-8',
                  'x-csrf-token': token
              },
              method: "GET",
              dataType: "text"
            });

            PDFUrlRequest.done( res => {
                res = JSON.parse(res.split("</x>//")[1])

                if (res.export.status === "COMPLETE") {

                    const PDFUrl = res.export.output.exportBlobs[0].url
                    contentWindow.postMessage({
                        reason: "getPDFUrl",
                        url: `https://${proofmeCluster}.proofme.com/importFromCanva?fileUrl=${b64EncodeUnicode(PDFUrl)}&canvaID=${docId}`
                    }, '*');

                    setDocumentHasProof()
                    return
                }

                return setTimeout(function () {
                    getPDFUrl(id, token)
                }, 1000)

            })
        }


        function exportPDF (token, docId, pages, docVersion) {
            const request = $.ajax({
              url: "/_ajax/export",
              headers: {
                  'content-type': 'application/json;charset=UTF-8',
                  'x-csrf-token': token
              },
              method: "POST",
              data: JSON.stringify({"attachment":true,"docId":docId,"docVersion":docVersion,"spec":{"mediaDpi":300,"mediaQuality":"SCREEN","bleed":false,"crops":false,"removeCanvas":false,"pages": pages,"targetImageSizeKb":null,"format":"PDF","type":"SCREEN"}}),
              dataType: "text"
            });



            request.done( anotherMsg => {
              const id = JSON.parse(anotherMsg.split("//")[1]).export.id
              getPDFUrl(id, token)
            });

            request.fail( err => {
                const docVersion = JSON.parse(err.responseText.split("</x>//")[1]).version
                exportPDF (token, docId, pages, docVersion)
            })
        }

        const getToken = $.ajax({
          url: "/_ajax/csrf/export",
          method: "GET",
           dataType: "text"
        });

        getToken.done( msg => {
          const token = msg.split(`//"`)[1].replace(`"`, ``)
          const numOfPages = $("section.page").length
          const pages = []
          for (let i = 1; i <= numOfPages; i++) {
              pages.push(i)
          }

          exportPDF(token, docId, pages, 1)

        });

    })
})

"use strict"

const docId = window.location.href.split("design/")[1].split("/")[0]

$(".editorActionShare").on("click", function() {
    $(".shareButtons").append(`<button class="button buttonProofMe" title="Share on Twitter">
    <img src="https://raw.githubusercontent.com/proofme/proofme-canva/26d03768dbaf28ee5ccd413e2fce78c18f5a3f8d/images/proofme-button-icon.png" alt="ProofMe" style="height: 33px; width: 33px; vertical-align: bottom;">
    Send to ProofMe</button>`)
    $(".buttonProofMe").css("background", "#6ACD00")

    $(".buttonProofMe").on("click", function() {


        const progressDialog = $(`
            <div style="position: fixed; width:100%;height:100%; z-index:10000">
            <div align="center" class="proofme-import-modal">
            <div class="converting-loader"><div class="circles"><div class="loader6"></div><div class="loader7"></div></div><div class="converting-loader-label" style="color: rgba(0, 180, 255, .9);"">Importing Files to ProofMe</div></div>
            </div>
            </div>

        `);

            $('body').append(progressDialog)



        function b64EncodeUnicode(str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        }
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
                    progressDialog.remove();
                    window.open(`https://local.proofme.com/importFromCanva?fileUrl=${b64EncodeUnicode(PDFUrl)}&canvaID=${docId}`)
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

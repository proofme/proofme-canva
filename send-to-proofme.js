"use strict"

$(".editorActionShare").on("click", function() {
    $(".shareButtons").append(`<button class="button buttonProofMe" title="Share on Twitter">Send to ProofMe</button>`)
    $(".buttonProofMe").css("background", "#6ACD00")

    $(".buttonProofMe").on("click", function() {

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
                    window.location.href = PDFUrl
                    window.open(`https://www.google.com/?q=${PDFUrl}`)
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
              data: JSON.stringify({"attachment":true,"docId":docId,"docVersion":docVersion,"spec":{"mediaDpi":300,"mediaQuality":"PRINT","bleed":false,"crops":false,"removeCanvas":false,"pages": pages,"targetImageSizeKb":null,"format":"PDF","type":"PRINT"}}),
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
          const docId = window.location.href.split("design/")[1].split("/")[0]
          for (let i = 1; i <= numOfPages; i++) {
              pages.push(i)
          }

          exportPDF(token, docId, pages, 1)

        });

    })
})

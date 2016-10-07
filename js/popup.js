"use strict"

const proofmeCluster = ""  // "", "dev.", "master.", "preflight.", "local."
window.onload = () => {

    const iframe = document.getElementById('empty-proofme');
    const contentWindow = iframe.contentWindow;
    contentWindow.postMessage({
        reason: "getUsername"
    }, '*');


    window.addEventListener("message", receiveMessage, false)


    function receiveMessage(event) {
        if (event.origin != `https://${proofmeCluster}proofme.com`){
            console.log("unsafe !")
            return;
        }

        if (event.data.reason === "getUsername") {
            const data = event.data
            console.log("data: ", data)
            if (data && data.username) {
                const username = data.username
                linkForFooterLeft = `https://${proofmeCluster}proofme.com/dashboard/my`
                footerLeft.innerHTML = username
            }
            footerLeft.addEventListener("click", () => {
                window.open(linkForFooterLeft)
            })
        }
    }

    const footerLeft = document.getElementById("footer-left")
    let linkForFooterLeft = `https://${proofmeCluster}proofme.com/login`


    document.getElementById("footer-right").addEventListener("click", () => {
        window.open(`https://${proofmeCluster}proofme.com/integrations/canva`)
    })

    document.getElementsByClassName("btn-proofme")[0].addEventListener("click", () => {
        window.open(`https://${proofmeCluster}proofme.com/dashboard/my`)
    })

    document.getElementsByClassName("btn-canva")[0].addEventListener("click", () => {
        window.open("https://canva.com")
    })
}

"use strict"

const proofmeCluster = ""  // "", "dev.", "master.", "preflight.", "local."
const docId = window.location.href.split("design/")[1].split("/")[0]
const proofmeiFrame = `https://${proofmeCluster}proofme.com/emptyCanva`;
let proofExists = false
let noOpenProofYet = true
let popupOpened = false
let urlToProof = `https://${proofmeCluster}proofme.com`
let proofId
let tooptipCache = {}
let logger = () => {}
if (window.location.href.includes("?logger=true")) logger = function() {console.log(arguments)} // don't log stuff on live


$( document ).ready( () =>  {

    $(".editorActionShare").append(`<iframe id="proofme-iframe-receiver" src=${proofmeiFrame} width="0" height="0" style="display: none;">`)
    let contentWindow
    let notLetBarFinish = true
    const iframe = document.getElementById('proofme-iframe-receiver');
    iframe.onload = function(){
        askProofMe()
    }

    function whenUsernameTooLong(userNames) {
        const joinName = userNames.join(", ")
        if (joinName.length > 25) return joinName.slice(0, 22) + "..."

        return joinName
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


    ;(function keepAskingProofMe(){
            setTimeout( () => {
                logger("asking proofme")
                askProofMe()
                keepAskingProofMe()
            }, 3000)
    })()

    function setDocumentHasProof(filesSummary, usersSummary, reviewsSummary, totalCount, unreadCount, proofUrl, itemCount){
        proofId = proofId || filesSummary[0].proof
        logger("===: ", filesSummary, usersSummary, reviewsSummary, totalCount, unreadCount, proofUrl)
        $('.buttonProofMe').html(`
            <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-version%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
            Update in ProofMe
        `)

        // if (!noOpenProofYet) $("#open-proof").remove()
        urlToProof = `https://${proofmeCluster}proofme.com${proofUrl || ""}`
        let classForCount = ""
        let countToUse
        if (unreadCount) {
            classForCount += "unread-count"
            countToUse = unreadCount
        } else {
            classForCount += "read-count"
            countToUse = totalCount
        }

        classForCount += ("" + countToUse).length > 1? " two-digits-count": ""

        const openProofInnerHTML
            = `<li id="open-proof"><a class="button editorActionOpen prerollAnimation prerollDelay2.5" href="${urlToProof}" target="_blank"> Open Proof `
            + (unreadCount
            ? `<img id="openup" alt="Unread Comment" width="22" height="22" style="transform: translateX(6px)translateY(3px);" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgaWQ9IkxheWVyXzEiCiAgIGRhdGEtbmFtZT0iTGF5ZXIgMSIKICAgd2lkdGg9IjMxIgogICBoZWlnaHQ9IjMxIgogICB2aWV3Qm94PSIwIDAgMzEgMzEiCiAgIHZlcnNpb249IjEuMSIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC40OC41IHIxMDA0MCIKICAgc29kaXBvZGk6ZG9jbmFtZT0ibmV3LWFjdGl2aXR5LnN2ZyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMjMiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyMSIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjY0MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI0ODAiCiAgICAgaWQ9Im5hbWVkdmlldzE5IgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSI3LjYxMjkwMzIiCiAgICAgaW5rc2NhcGU6Y3g9IjE1LjUiCiAgICAgaW5rc2NhcGU6Y3k9IjE1LjUiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJMYXllcl8xIiAvPgogIDx0aXRsZQogICAgIGlkPSJ0aXRsZTMiPnByb29mZXItaWNvbnM8L3RpdGxlPgogIDxnCiAgICAgaWQ9Imc1IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDEuMzM1OTExOSwwLDAsMS4zMDA0MzAxLC01LjI4NDMyNTUsLTQuODc5NjE5NSkiPgogICAgPGcKICAgICAgIGlkPSJnNyIKICAgICAgIHN0eWxlPSJvcGFjaXR5OjAuNCI+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Ik0gNi41LDIxLjggQSAxMSwxMSAwIDEgMSAxMCwyNSBsIC00LjUsMS44MSB6IgogICAgICAgICBpZD0icGF0aDkiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Ik0gMTUuNSw1IEEgMTAuNSwxMC41IDAgMSAxIDEwLDI0LjQ1IEwgNi4xNywyNiA3LDIxLjY5IEEgMTAuNDksMTAuNDkgMCAwIDEgMTUuNSw1IG0gMCwtMSBBIDExLjUxLDExLjUxIDAgMCAwIDQsMTUuNSAxMS4zOSwxMS4zOSAwIDAgMCA2LDIxLjkxIEwgNS4xOSwyNS44IDQuODIsMjcuNjEgNi41MywyNi45MiAxMCwyNS41NiBBIDExLjUsMTEuNSAwIDEgMCAxNS41LDQgaCAwIHoiCiAgICAgICAgIGlkPSJwYXRoMTEiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMxOTE5MTkiIC8+CiAgICA8L2c+CiAgICA8cmVjdAogICAgICAgeD0iNSIKICAgICAgIHk9IjUiCiAgICAgICB3aWR0aD0iMjEiCiAgICAgICBoZWlnaHQ9IjIxIgogICAgICAgcng9IjEwLjUiCiAgICAgICByeT0iMTAuNSIKICAgICAgIGlkPSJyZWN0MTMiCiAgICAgICBzdHlsZT0iZmlsbDojMDBiNGZmIiAvPgogICAgPHBvbHlnb24KICAgICAgIHBvaW50cz0iMTIsMjMuNjcgNy4zMywyMC4xNyA3LjMzLDIwLjE3IDYuMTcsMjYgIgogICAgICAgaWQ9InBvbHlnb24xNSIKICAgICAgIHN0eWxlPSJmaWxsOiMwMGI0ZmYiIC8+CiAgICA8Y2lyY2xlCiAgICAgICBjeD0iMTUuNSIKICAgICAgIGN5PSIxNS4zNyIKICAgICAgIHI9IjIuOTIwMDAwMSIKICAgICAgIGlkPSJjaXJjbGUxNyIKICAgICAgIGQ9Im0gMTguNDIsMTUuMzcgYyAwLDEuNjEyNjcxIC0xLjMwNzMyOCwyLjkyIC0yLjkyLDIuOTIgLTEuNjEyNjcyLDAgLTIuOTIsLTEuMzA3MzI5IC0yLjkyLC0yLjkyIDAsLTEuNjEyNjcyIDEuMzA3MzI4LC0yLjkyIDIuOTIsLTIuOTIgMS42MTI2NzIsMCAyLjkyLDEuMzA3MzI4IDIuOTIsMi45MiB6IgogICAgICAgc29kaXBvZGk6Y3g9IjE1LjUiCiAgICAgICBzb2RpcG9kaTpjeT0iMTUuMzciCiAgICAgICBzb2RpcG9kaTpyeD0iMi45MjAwMDAxIgogICAgICAgc29kaXBvZGk6cnk9IjIuOTIwMDAwMSIKICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmYiIC8+CiAgPC9nPgo8L3N2Zz4K">`
            : `<span id="openup" class="${classForCount}">${countToUse}</span>`)
            + `</a></li>`

        if (emptyBtnExist) {
            $("#open-proof").remove()
            emptyBtnExist = false
        }

        emptyBtnExist = true
        $("#documentMenu").prepend(openProofInnerHTML)



        $("#openup").click( (e) => {
            e.stopPropagation()
            return false;
        })

        $("#openup").hover(
            (e) => {
                e.stopPropagation()
                if (popupOpened) {
                    $('.proofme-details-popup').remove()
                }
                popupOpened = true
                const buttonOffset = $("#openup").offset()
                logger(`$("#openup").offset(): `, $("#openup").offset())

                const popup = $(`<div class="proofme-details-popup" style="transform: translateX(${buttonOffset.left - 185}px) translateY(55px)"></div>`)
                unreadCount
                    ? popup.append(`
                        <div class="header">
                            <span>Unread Comments</span>
                            <span style="float: right"><span class="markAsRead" style="color: #00c4cc; cursor:pointer;">Mark as read</span> <img class="hide-loader" src="https://raw.githubusercontent.com/proofme/proofme-canva/master/images/loader.gif">• <span style="color: #00c4cc; cursor:pointer; padding-right: 10px;" onclick="window.open('${urlToProof}');">View All</span></span>
                        </div><hr class="magicHr" />
                    `)
                    : popup.append(`
                        <div class="header">
                            <span style="float: right"><span style="color: #00c4cc; cursor:pointer; padding-right: 10px;" onclick="window.open('${urlToProof}');">View All</span></span>
                        </div><hr class="magicHr" />
                    `)


                function markAsRead(){
                    contentWindow = iframe.contentWindow;
                    contentWindow.postMessage({
                        reason: "markAsRead",
                        proofId: proofId
                    }, '*');
                }

                _.forEach( filesSummary, fileSummary => {
                    let listitem
                    const time = moment(fileSummary.updated_timestamp).fromNow(true)
                    logger("time: ", time)
                    if (fileSummary.comment_type === "ReviewDraft") {
                        logger("fileSummary: ", fileSummary)
                        logger("fileSummary.users: ", fileSummary.users)
                        const userIds = fileSummary.users
                        const oneUserId = userIds[0]
                        // const oneUserImg = `https://${proofmeCluster}proofme.com${usersSummary[oneUserId].userPic}`
                        let oneUserImg = usersSummary[oneUserId].userPic
                        console.log("oneUserImg: ", oneUserImg)
                        if (! (oneUserImg.includes("https://") || oneUserImg.includes("avatars.proofme.com"))) {
                                oneUserImg = "https://static.proofme.com/0.1259.96" + oneUserImg
                        }
                        const userNames = []
                        _.forEach(userIds, userId => {
                            userNames.push(usersSummary[userId].userName)
                        })
                        const shortedName = whenUsernameTooLong(userNames)
                        let fileContent = ""
                        if (fileSummary.contents) {
                            fileContent = `${ fileSummary.contents.length > 7 ? (fileSummary.contents.slice(0, 7) + "...") : fileSummary.contents}`
                        }
                        listitem = $(`
                            <div class="annotation-item clearfix float-my-children">
                                <img src="${oneUserImg}" width=52 height=50></img>
                                <div><span>${shortedName} </span>  <span>${fileSummary.status === '1'? '👍': '👎'}  </span> • <span> ${time}<br /> <i style="cursor:pointer;" onclick="window.open('${urlToProof}');">${fileSummary.name.length > 22 ? (fileSummary.name.slice(0, 19) + "...") : fileSummary.name}</i>  ${ fileContent} </span></div>
                                <img class="fileAvatar" src="https://${proofmeCluster}proofme.com/files/${fileSummary.file}/thumb" width=50 height=50 onclick="window.open('${urlToProof}');"></img>
                            </div>
                        `)

                    } else if (fileSummary.comment_type === "Summary") {
                        const users = fileSummary.users
                        // const oneUserId = users.pop().id

                        let mixedImg = ""
                        let count = 0
                        const userNames = []
                        _.forEach(users, user => {
                            count++
                            if (count < 6) {
                                userNames.push(usersSummary[user.id].userName)
                                let oneUserImg = usersSummary[user.id].userPic
                                if (! (oneUserImg.includes("https://") || oneUserImg.includes("avatars.proofme.com"))) {
                                        oneUserImg = "https://static.proofme.com/0.1259.96" + oneUserImg
                                }
                                mixedImg += `<td><img class="${"clip-" + users.length}" src="${oneUserImg}" width="50" height="50"></td>`
                            } else {
                                alert("@XMA: Reviewers number limit reached")
                            }
                        })
                        let countToUse
                        const ifUnread = fileSummary.unread
                        let classForCount = ""
                        if (ifUnread) {
                            countToUse = ifUnread
                            classForCount += "unread-count"
                        } else {
                            countToUse = fileSummary.total
                            classForCount += "read-count"
                        }

                        classForCount += ("" + countToUse).length > 1? " two-digits-count": ""
                        const shortedName = whenUsernameTooLong(userNames)
                        listitem = $(`
                            <div class="annotation-item clearfix float-my-children" style="height: 54px;">
                                <table width=52px cellspacing="0">
                                    <tbody>
                                        <tr>
                                            ${mixedImg}
                                        </tr>
                                    </tbody>
                                </table>
                                <div><span>${shortedName} • ${time} <br /><span class="${classForCount}">${countToUse}</span><i  style="color: #00c4cc; cursor:pointer;" onclick="window.open('${urlToProof}');">${ fileSummary.name.length > 22 ? (fileSummary.name.slice(0, 19) + "...") : fileSummary.name } ${ " >"}</i></span></div>
                                <img class="fileAvatar" src="https://${proofmeCluster}proofme.com/files/${fileSummary.file}/thumb" width=50 height=50 onclick="window.open('${urlToProof}');"></img>
                            </div>

                        `)
                    } else {
                        alert(`@XMA: New summary type: ${fileSummary}`)
                    }


                    popup.append(listitem)
                })

                if ((itemCount > 4) && (filesSummary.length > 3)) {
                    const extraItem = $(`
                            <h3 style="text-align: center; cursor:pointer; onclick="window.open('${urlToProof}');"> • • • </h3>
                        `)
                    popup.append(extraItem)
                }




                if ($('.proofme-details-popup') !== [])
                $('body').append(popup)
                $('.proofme-details-popup').stop()
                $('.proofme-details-popup').fadeIn(500 , () =>  {
                    return false
                })
                $(".markAsRead").click( () => {
                        $(".markAsRead").hide()
                        $(".hide-loader").css("display", "inline")
                        setTimeout( () => {
                            $('.proofme-details-popup').fadeOut(100, () => {
                                $('.proofme-details-popup').remove()
                            })
                        }, 4000)

                        markAsRead()
                })
                $(".proofme-details-popup").hover(
                    () => {
                        $('.proofme-details-popup').stop()
                        $('.proofme-details-popup').fadeIn(500 , () =>  {
                            return false
                        })
                    },
                    () => {
                        $('.proofme-details-popup').fadeOut(1000, () => {
                            return false
                        })
                    }
                )
            },
            () => {
                $('.proofme-details-popup').fadeOut(1000, () => {
                    return false
                })
            }
        )


    }

    function increaseBar(speed, width) {
        setTimeout( () => {
            width += 0.1 + Math.pow(Math.random(), 3)
            if (width > 100) width = 100
            $("#myBar").css({"width": `${width}%`})

            if (width < 98) {
                if (!notLetBarFinish) {
                    increaseBar(1, width)
                }
                else if (width > 80) {
                    increaseBar( 10 * Math.pow((width-80), 1.2), width)
                } else {
                    increaseBar(10, width)
                }
            } else {
                notLetBarFinish = true
            }
        }, speed)
    }

    let emptyBtnExist = false

    function receiveMessage(event) {
        if (event.origin != `https://${proofmeCluster}proofme.com`){
            return;
        }
        logger("canva received event: ", event);
        try {
            logger("_.VERSION: ", _.VERSION)
        } catch (e) {
            logger("e: ", e)
        }
        if (event.data.reason === "windowOnLoad") {
            const data = event.data
            const filesSummary = data.annotsSummary.annots
            const usersSummary = data.annotsSummary.users
            const reviewsSummary = []

            let unreadCount = 0
            _.forEach(filesSummary, fileSummary => {
                if (fileSummary.comment_type && fileSummary.comment_type === "ReviewDraft") {
                    reviewsSummary.push(fileSummary)
                } else {

                    unreadCount += fileSummary.unread
                }
            })
            const totalCount = data.totalCountOfAnnots
            logger("totalCount: ", totalCount)
            logger("unreadCount: ", unreadCount)
            logger("proofUrl: ", data.proofUrl)
            proofExists = true
            if (totalCount > 0) {
                if (JSON.stringify(tooptipCache) !== JSON.stringify(data)) setDocumentHasProof(filesSummary, usersSummary, reviewsSummary, totalCount, unreadCount, data.proofUrl, totalCount)
            } else {
                if (!emptyBtnExist) {
                    urlToProof = `https://${proofmeCluster}proofme.com${data.proofUrl || ""}`
                    const emptyBtn = `<li id="open-proof"><a class="button editorActionOpen prerollAnimation prerollDelay2.5" href="${urlToProof}" target="_blank"> Open Proof </a></li>`
                    $("#documentMenu").prepend(emptyBtn)
                    emptyBtnExist = true
                }
            }

            tooptipCache = data
        } else if (event.data.reason === "getPDFUrl") {
            const hasReviewer = !!event.data.reviewers.length
            const proofExistsCache = proofExists
            proofId = proofId || event.data.proofId
            $(".editorActionShare").append(`<iframe id="proofme-load-proof" src=https://${proofmeCluster}proofme.com${event.data.PDFUrl} width="0" height="0" style="display: none;">`)

            const iframeII = document.getElementById('proofme-load-proof');
            iframeII.onload = function(){
                    $("#myBar").css({"width": `100%`})
                    setTimeout( () => {
                        $(".bottomPart").css({"background": "#6ACD00"})
                        $("#loading-message").remove()
                        $(".beforeProgressBar").remove()
                        $("#myProgress").remove()
                        $("#bottomMessage").text("Success!")
                        $("#bottomMessage").css({"color": "white"})
                        if (proofExistsCache) {
                            var deadLine = event.data.due_date? "Set a New Deadline": "Set Deadline"
                            if (hasReviewer) {

                                $("#PDFUrl").html(`

                                    <span style="font-size: 18px;font-weight: 100;">Your proof has been updated with the latest design <br/> <small style="color: #AAAAAA">We've notified your reviewers too!</small></span>

                                    <div style="padding: 10px;">
                                        <a style="color: #04BCFF;" href='https://${proofmeCluster}proofme.com${event.data.PDFUrl}' target="_blank">https://${proofmeCluster}proofme.com${event.data.PDFUrl}</a>
                                        <br />
                                        <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com${event.data.PDFUrl}" target="_blank">Open Proof</a>
                                        <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com/dashboard/my#${proofId}canvadue" target="_blank">${deadLine}</a>
                                    </div>
                                    `)
                            } else {
                                $("#PDFUrl").html(`

                                    <span style="font-size: 18px;font-weight: 100;">Your proof has been updated with the latest design</span>

                                    <div style="padding: 10px;">
                                        <a style="color: #04BCFF;" href='https://${proofmeCluster}proofme.com${event.data.PDFUrl}' target="_blank">https://${proofmeCluster}proofme.com${event.data.PDFUrl}</a>
                                        <br />
                                        <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com${event.data.PDFUrl}" target="_blank">Open Proof</a>
                                        <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com/dashboard/my#${proofId}canvareviewers" target="_blank">Add Reviewers</a>
                                        <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com/dashboard/my#${proofId}canvadue" target="_blank">${deadLine}</a>
                                    </div>
                                    `)
                            }

                        } else {
                            $("#PDFUrl").html(`

                                <span style="font-size: 18px;font-weight: 100;">Hooray! Here's a link to your proof:</span>

                                <div style="padding: 10px;">
                                    <a style="color: #04BCFF;" href='https://${proofmeCluster}proofme.com${event.data.PDFUrl}' target="_blank">https://${proofmeCluster}proofme.com${event.data.PDFUrl}</a>
                                    <br />
                                    <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com${event.data.PDFUrl}" target="_blank">Open Proof</a>
                                    <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com/dashboard/my#${proofId}canvareviewers" target="_blank">Add Reviewers</a>
                                    <a class="button editorActionOpen prerollAnimation buttonEditPanel" href="https://${proofmeCluster}proofme.com/dashboard/my#${proofId}canvadue" target="_blank">Set Deadline</a>
                                </div>
                                `)
                        }
                        $("#proofme-load-proof").remove()
                    }, 10)



            }
        }


    }
    window.addEventListener("message", receiveMessage, false)

    $(".editorActionExport").on("click", () => {
        $(".buttonBlock").on("click", () => {
            let popupClosed = false
            ;(function checkText () {
                    setTimeout( () => {
                        $(".close").on("click", () => {
                            popupClosed = true
                        })
                        logger("popupClosed: ", popupClosed)
                        if ($(".center").html() === "Your design is ready" && !popupClosed) {
                            $(".buttonRedirect").remove()
                            $(".shareButtons").append(`
                                <button class="button buttonProofMe buttonRedirect" title="Share on ProofMe">
                                <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-${proofExists?"version" : "proof"}%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
                                ${proofExists?"Update in ProofMe" : "Send to ProofMe"}
                                </button>
                            `)

                            $(".buttonRedirect").on("click", () => {
                                $(".dialog").hide()


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
                                                <div class="beforeProgressBar" style="height: 18px;"> </div>
                                                <div id="myProgress">
                                                    <div id="myBar"></div>
                                                </div>
                                                <div class="beforeProgressBar" style="height: 23px;"> </div>

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
                                    $(".dialog").show()
                                    progressDialog.remove()
                                })

                                increaseBar(10, 1)

                                const PDFUrl = $(".intro a").attr('href')
                                contentWindow.postMessage({
                                    reason: "getPDFUrl",
                                    url: `https://${proofmeCluster}proofme.com/importFromCanva/ `,
                                    fileUrl: b64EncodeUnicode(PDFUrl),
                                    canvaID: docId
                                }, '*');

                                askProofMe()
                                return
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
                            <div class="beforeProgressBar" style="height: 18px;"> </div>
                            <div id="myProgress">
                                <div id="myBar"></div>
                            </div>
                            <div class="beforeProgressBar" style="height: 23px;"> </div>

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

            increaseBar(10, 1)


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
                            url: `https://${proofmeCluster}proofme.com/importFromCanva/ `,
                            fileUrl: b64EncodeUnicode(PDFUrl),
                            canvaID: docId
                        }, '*');

                        askProofMe()
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


})

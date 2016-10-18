"use strict"

const proofmeBuild = "0.1259.257"
const proofmeCluster = ""  // "", "dev.", "master.", "preflight.", "local."
const urlObject = window.location.href.split("design/")[1].split("/")
const docId = urlObject[0]
const secret = urlObject[1]
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

    function whenUsernameTooLong(userNames, length) {
        length = length || 20
        const joinName = userNames.join(", ")
        if (joinName.length > length) return joinName.slice(0, length - 3) + "..."

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
            Update Proof
        `)

        // if (!noOpenProofYet) $("#open-proof").remove()
        urlToProof = `https://${proofmeCluster}proofme.com${proofUrl || ""}`
        let classForCount = ""
        let countToUse
        if (unreadCount) {
            classForCount += "unread-count"
            countToUse = unreadCount
        } else {
            classForCount += "read-count-on-button"
            countToUse = totalCount
        }

        if (("" + countToUse).length === 2) {
            classForCount += " two-digits-count"
        } else if (("" + countToUse).length === 3) {
            classForCount += " three-digits-count"
        }

        const openProofInnerHTML
            = `<li id="open-proof"><a class="button editorActionOpen prerollAnimation prerollDelay2.5" href="${urlToProof}" target="_blank"> Open Proof `
            + (unreadCount
            ? `<img id="openup" alt="Unread Comment" width="22" height="22" style="transform: translateX(6px)translateY(3px);" src=${imageCollection.bubbleWithDot}>`
            : `<span id="openup" class="${classForCount}">${countToUse}</span>`)
            + `</a></li>`

        if (emptyBtnExist) {
            $("#open-proof").remove()
            emptyBtnExist = false
        }

        emptyBtnExist = true
        $("#documentMenu").prepend(openProofInnerHTML)
        if (!totalCount) {
            $('#openup').remove()
            $('.proofme-details-popup').remove()
            return
        }


        /*Take proofme sources here. NOt need reimplement it here*/
      /*  $("#openup").click( (e) => {
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

                const popup = $(`<div class="proofme-details-popup" style="transform: translateX(${buttonOffset.left - 100}px) translateY(55px) !important"></div>`)
                unreadCount
                    ? popup.append(`
                        <div class="header">
                            <span style="color: #3f4652;">Unread Comments</span>
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

                        let userIds = fileSummary.users || [fileSummary.owner || fileSummary.proof_owner]
                        _.forEach(fileSummary.replies, reply => {
                            userIds = _.unionWith(userIds, [reply.owner])
                        })

                        let mixedImg = ""
                        let count = 0
                        const userNames = []
                        _.forEach(userIds, userId => {
                            count++
                            let acronym = ""
                            if (count < 6) {
                                userNames.push(usersSummary[userId].userName)
                                let oneUserImg = usersSummary[userId].userPic
                                if (!oneUserImg) {
                                    if (users.length === 1) acronym = usersSummary[userId].acronym
                                    oneUserImg = `https://static.proofme.com/${proofmeBuild}/images/backgrounds/acronym-avatar-bg.jpg` // temp fix
                                } else if (! (oneUserImg.includes("https://") || oneUserImg.includes("avatars.proofme.com"))) {
                                    oneUserImg = `https://static.proofme.com/${proofmeBuild}` + oneUserImg
                                }

                                mixedImg += `
                                    <td>
                                        <img class="${"clip-" + userIds.length}" src="${oneUserImg}" width="50" height="50">${acronym ? ("<span class='acronym acronym-summary'>" + acronym + "</span>") : ""}
                                    </td>
                                `
                            } else {
                                alert("@XMA: Reviewers number limit reached")
                            }
                        })
                        const countToUse = 1 + (fileSummary.replies && fileSummary.replies.length || 0)
                        let classForCount = ""
                        if (unreadCount) {
                            classForCount += "unread-count"
                        } else {
                            classForCount += "read-count"
                        }

                        if (("" + countToUse).length === 2) {
                            classForCount += " two-digits-count"
                        } else if (("" + countToUse).length === 3) {
                            classForCount += " three-digits-count"
                        }

                        const fileAvatar = `https://${proofmeCluster}proofme.com/${ fileSummary.file ? ("files/" + fileSummary.file + "/thumb") :  ("proofs/thumb/" + fileSummary.proof) }`
                        const urlOnFileThumbnail = `https://${proofmeCluster}proofme.com/${ fileSummary.file ? ("f/" + fileSummary.file) :  ("p/" + fileSummary.proof) }`
                        const shortedName = whenUsernameTooLong(userNames, 15)
                        let fileContent = ""
                        if (fileSummary.replies && fileSummary.replies.length) {
                            const reply = fileSummary.replies[fileSummary.replies.length - 1]
                            fileContent = `${ reply.contents.length > 14 ? (reply.contents.slice(0, 11) + "...") : reply.contents}`
                        }
                        else if (fileSummary.contents) {
                            fileContent = `${ fileSummary.contents.length > 14 ? (fileSummary.contents.slice(0, 11) + "...") : fileSummary.contents}`
                        }
                        if (!fileSummary.name) fileSummary.name = ""
                        listitem = $(`
                            <div class="annotation-item clearfix float-my-children" style="height: 54px;">
                                <table width=52px cellspacing="0">
                                    <tbody>
                                        <tr>
                                            ${mixedImg}
                                        </tr>
                                    </tbody>
                                </table>
                                <div>
                                    <span>${shortedName.escape()} <img src="${fileSummary.status === '1'? imageCollection.approveThumbGreen: imageCollection.rejectThumbRed}" width=12 height=13 >  </img> <span class="${classForCount}"> ${countToUse}</span> • ${time} <br />
                                        <i style="cursor:pointer;" onclick="window.open('${urlOnFileThumbnail}');">${(fileSummary.name.length > 22 ? (fileSummary.name.slice(0, 19) + "...") : (fileSummary.name)).escape()} &nbsp</i>  ${ fileContent.escape()}
                                    </span>
                                </div>
                                <div class="fileAvatarContainer">
                                    <img class="fileAvatar" src="${fileAvatar}" onclick="window.open('${urlOnFileThumbnail}');"></img>
                                </div>
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
                            let acronym = ""
                            if (count < 6) {
                                userNames.push(usersSummary[user.id].userName)
                                let oneUserImg = usersSummary[user.id].userPic
                                if (!oneUserImg) {
                                    if (users.length === 1) acronym = usersSummary[user.id].acronym
                                    oneUserImg = `https://static.proofme.com/${proofmeBuild}/images/backgrounds/acronym-avatar-bg.jpg` // temp fix
                                } else if (! (oneUserImg.includes("https://") || oneUserImg.includes("avatars.proofme.com"))) {
                                    oneUserImg = `https://static.proofme.com/${proofmeBuild}` + oneUserImg
                                }

                                mixedImg += `
                                    <td>
                                        <img class="${"clip-" + users.length}" src="${oneUserImg}" width="50" height="50">${acronym ? ("<span class='acronym acronym-summary'>" + acronym + "</span>") : ""}
                                    </td>
                                `
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

                        if (("" + countToUse).length === 2) {
                            classForCount += " two-digits-count"
                        } else if (("" + countToUse).length === 3) {
                            classForCount += " three-digits-count"
                        }

                        const urlOnFileThumbnail = `https://${proofmeCluster}proofme.com/f/${fileSummary.file}`
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
                                <div>
                                    <span>${shortedName.escape()} • ${time} <br />
                                        <span class="${classForCount}">${countToUse}</span>
                                        <i class="filename-and-arrow" style="color: #00c4cc; cursor:pointer;" onclick="window.open('${urlOnFileThumbnail}');">${ (fileSummary.name.length > 30 ? (fileSummary.name.slice(0, 27) + "...") : fileSummary.name).escape() }
                                            <img class="blue-arrow" src=${imageCollection.blueArrow} height="11">
                                        </i>
                                    </span>
                                </div>
                                <div class="fileAvatarContainer">
                                    <img class="fileAvatar" src="https://${proofmeCluster}proofme.com/files/${fileSummary.file}/thumb" onclick="window.open('${urlOnFileThumbnail}');"></img>
                                </div>
                            </div>

                        `)
                    } else if (fileSummary.comment_type === "ManagerNote") {
                        const owner = fileSummary.owner || fileSummary.proof_owner
                        let userIds = [usersSummary[owner].id]
                        _.forEach(fileSummary.replies, reply => {
                            userIds = _.unionWith(userIds, [reply.owner])
                        })

                        let mixedImg = ""
                        let count = 0
                        const userNames = []
                        _.forEach(userIds, userId => {
                            count++
                            let acronym = ""
                            if (count < 6) {
                                userNames.push(usersSummary[userId].userName)
                                let oneUserImg = usersSummary[userId].userPic
                                if (!oneUserImg) {
                                    if (users.length === 1) acronym = usersSummary[userId].acronym
                                    oneUserImg = `https://static.proofme.com/${proofmeBuild}/images/backgrounds/acronym-avatar-bg.jpg` // temp fix
                                } else if (! (oneUserImg.includes("https://") || oneUserImg.includes("avatars.proofme.com"))) {
                                    oneUserImg = `https://static.proofme.com/${proofmeBuild}` + oneUserImg
                                }

                                mixedImg += `
                                    <td>
                                        <img class="${"clip-" + userIds.length}" src="${oneUserImg}" width="50" height="50">${acronym ? ("<span class='acronym acronym-summary'>" + acronym + "</span>") : ""}
                                    </td>
                                `
                            } else {
                                alert("@XMA: Reviewers number limit reached")
                            }
                        })
                        const countToUse = 1 + (fileSummary.replies && fileSummary.replies.length || 0)
                        let classForCount = ""
                        if (unreadCount) {
                            classForCount += "unread-count"
                        } else {
                            classForCount += "read-count"
                        }

                        if (("" + countToUse).length === 2) {
                            classForCount += " two-digits-count"
                        } else if (("" + countToUse).length === 3) {
                            classForCount += " three-digits-count"
                        }

                        const urlOnFileThumbnail = `https://${proofmeCluster}proofme.com/f/${fileSummary.file}`
                        const shortedName = whenUsernameTooLong(userNames, 15)
                        let fileContent = ""
                        if (fileSummary.replies && fileSummary.replies.length) {
                            const reply = fileSummary.replies[fileSummary.replies.length - 1]
                            fileContent = `${ reply.contents.length > 40 ? (reply.contents.slice(0, 37) + "...") : reply.contents}`
                        }
                        else if (fileSummary.contents) {
                            fileContent = `${ fileSummary.contents.length > 40 ? (fileSummary.contents.slice(0, 37) + "...") : fileSummary.contents}`
                        }
                        listitem = $(`
                            <div class="annotation-item clearfix float-my-children" style="height: 54px;">
                                <table width=52px cellspacing="0">
                                    <tbody>
                                        <tr>
                                            ${mixedImg}
                                        </tr>
                                    </tbody>
                                </table>
                                <div>
                                    <span>${shortedName.escape()} <span class="${classForCount}"> ${countToUse}</span> • ${time} <br />
                                        ${ fileContent.escape()}
                                    </span>
                                </div>
                                <div class="fileAvatarContainer">
                                    <img class="managerNote" src="${imageCollection.managerNote}");"></img>
                                </div>
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


                let translateX = 0
                let arrowOnHover = {}
                $('.filename-and-arrow').hover(
                    (e) => {
                        const currentArrow = $(e.target).find('.blue-arrow')
                        arrowOnHover.currentArrow = true
                        moveLeft()
                        function moveLeft () {
                            setTimeout( () => {
                                currentArrow.css({transform: `translateX(${translateX}px)`})
                                translateX += 0.1
                                if (translateX < 5 && arrowOnHover.currentArrow) moveLeft()
                            }, 1)
                        }
                    },
                    (e) => {
                        const currentArrow = $(e.target).find('.blue-arrow')
                        arrowOnHover.currentArrow = false
                        moveRight()
                        function moveRight () {
                            setTimeout( () => {
                                currentArrow.css({transform: `translateX(${translateX}px)`})
                                translateX -= 0.1
                                if (translateX > 0 && !arrowOnHover.currentArrow) moveRight()
                            }, 1)
                        }
                    }
                )
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
        )*/


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
            if (data.notFound) {
                proofExists = false
                if (document.getElementById("open-proof")) document.getElementById("open-proof").remove()
                return
            }
            const filesSummary = data.annotsSummary.annots
            const usersSummary = data.annotsSummary.users
            const reviewsSummary = []

            let unreadCount = 0
            if (data.annotsSummary.unreadList) unreadCount = data.annotsSummary.totalCount
            _.forEach(filesSummary, fileSummary => {
                if (fileSummary.comment_type && fileSummary.comment_type === "ReviewDraft") {
                    reviewsSummary.push(fileSummary)
                } else {

                    // unreadCount += fileSummary.unread
                }
            })
            const totalCount = data.totalCountOfAnnots
            logger("totalCount: ", totalCount)
            logger("unreadCount: ", unreadCount)
            logger("proofUrl: ", data.proofUrl)
            proofExists = true
            proofId = data.proofId
            if (totalCount >= 0) {
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
                $("#myBar").css({"width": `100%`})
                setTimeout( () => {
                    $(".bottomPart").css({"background": "#6aC000"})
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
                            let buttonsDom = []
                            const shareButtons = $(".shareButtons")
                            if (shareButtons.length) buttonsDom = shareButtons
                            const shareDialog__socialButtons= $(".shareDialog__socialButtons")
                            logger("shareButtons: ", shareButtons)
                            logger("shareDialog__socialButtons: ", shareDialog__socialButtons)
                            if (shareDialog__socialButtons.length) buttonsDom = shareDialog__socialButtons
                            buttonsDom.append(`
                                <button class="button buttonProofMe buttonRedirect" title="Share on ProofMe">
                                <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-${proofExists?"version" : "proof"}%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
                                ${proofExists?"Update Proof" : "Make a Proof"}
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
                                                <span id="bottomMessage">${getARandomMessage()}!</span>
                                            </div>
                                        </div>
                                    </div>

                                `)

                                $('body').append(progressDialog)

                                $(".closePopup").on("click", function() {
                                    $(".dialog").show()
                                    progressDialog.remove()
                                })

                                $(document).keyup(e => {
                                    if (e.which == 27) {
                                        progressDialog.remove()
                                        $(".modalContent").remove()
                                    }
                                })

                                increaseBar(10, 1)

                                const PDFUrl = $(".intro a").attr('href')
                                contentWindow.postMessage({
                                    reason: "getPDFUrl",
                                    url: `https://${proofmeCluster}proofme.com/importFromCanva/ `,
                                    fileUrl: b64EncodeUnicode(PDFUrl),
                                    canvaID: docId,
                                    secret: secret
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
        let buttonsDom = []
        const shareButtons = $(".shareButtons")
        if (shareButtons.length) buttonsDom = shareButtons
        const shareDialog__socialButtons= $(".shareDialog__socialButtons")
        if (shareDialog__socialButtons.length) buttonsDom = shareDialog__socialButtons
        logger("shareButtons: ", shareButtons)
        logger("shareDialog__socialButtons: ", shareDialog__socialButtons)
        buttonsDom.append(`
            <button class="button buttonProofMe buttonExport" title="Share on ProofMe">
            <img src='https://raw.githubusercontent.com/proofme/proofme-canva/master/images/icon-create-${proofExists?"version" : "proof"}%402x.png' alt="ProofMe" style="height: 20px; width: 20px; vertical-align: text-bottom;">
            ${proofExists?"Update Proof" : "Make a Proof"}
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
                            <span id="bottomMessage">${getARandomMessage()}!</span>
                        </div>
                    </div>
                </div>

            `)

            $('body').append(progressDialog)

            $(".closePopup").on("click", function() {
                document.getElementsByTagName("body")[0].setAttribute("data-modal-levels", "0")
                progressDialog.remove()
                $(".modalContent").remove()
            })

            $(document).keyup(e => {
                if (e.which == 27) {
                    progressDialog.remove()
                    $(".modalContent").remove()
                }
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
                            canvaID: docId,
                            secret: secret
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
                    try {
                        const docVersion = JSON.parse(err.responseText.split("</x>//")[1]).version
                        exportPDF (token, docId, pages, docVersion)
                    } catch (ex) {
                        exportPDF(token, docId, pages, 1)
                    }
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


              exportAfterSave() // not yet figure out how to trigger a canva save function
              function exportAfterSave() {
                  const documentSyncStatus = document.getElementById("documentSyncStatus").textContent
                  if (documentSyncStatus == "No changes made" || documentSyncStatus == "All changes saved") return exportPDF(token, docId, pages, 1)
                  return setTimeout( () => exportAfterSave(), 100)
              }

            });

        })
    })


})


function getARandomMessage () {
    const popupMessages = [
        "Your next great idea starts here",
        "It's not great until you iterate",
        "Love your feedback",
        "The best thing you can do is get started",
        "Every idea starts out as an ugly baby",
        "Creativity is nourished by conflict",
        "A perfect day for a new proof",
        "Use the feedback, Luke",
        "The hardest part is the first step",
        "Proofing makes perfect",
        "Two heads are better than one",
        "If you don't ask, you'll never know",
        "Feedback moves you forward",
        "It's never too early...",
        "Never brainstorm with a blank slate",
        "Make, make, make"
    ]

    return popupMessages[Math.floor(popupMessages.length * Math.random())]
}

const imageCollection = {
    approveThumbGreen: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/proof-update-dropdown-icons/approve-thumb-green%402x.png",
    approveThumbWhite: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/proof-update-dropdown-icons/approve-thumb-white%402x.png",
    rejectThumbRed: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/proof-update-dropdown-icons/reject-thumb-red%402x.png",
    rejectThumbWhite: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/proof-update-dropdown-icons/reject-thumb-white%402x.png",
    bubbleWithDot: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/proof-update-dropdown-icons/bubble-with-dot%402x.png",
    blueArrow: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/proof-update-dropdown-icons/Asset%205%402x.png",
    managerNote: "https://raw.githubusercontent.com/proofme/proofme-canva/master/images/owner-note.png"
}

String.prototype.escape = function() {
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

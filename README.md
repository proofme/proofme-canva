# ProofMe-Canva
When design ♥ feedback on a Chrome/Firefox/Safari extension
##Requires ProofMe@`v0.1259.96-release+ `

<!--<img src="https://github.com/proofme/proofme-canva/blob/master/images/example.png?raw=true">-->
###Features
Add two buttons to canva's "Share" and "Download" menu.

Also add a "Open Proof" button if proof exists*, including a tooltip if there are comments.

When exporting a canva design to ProofMe, if proof exists*, we create a new file version. If not create we a new proof.

When Canva provides a zip file of images, where each image is one page of the design, ProofMe will still treat them as a single file model, and set download link to original zip file.

On exporting success, able to open proof, open proof at edit panel, due date or add reviewers.


`proof exists*`: the same ProofMe user already has a proof with the same canva design

Specs: https://proofme.com/p/6hnmackbc4rp8pg/Canva-Chrome-Plugin?files

The extension will talk to production `proofme.com` by default right now.

###Setup Locally
#### Chrome
1. Clone this repo.
2. Go to chrome://extensions/
3. Enable Developer Mode
4. Click `Load Unpacked Extension` and choose whereever you cloned this repo.

#### Firefox
1. Clone this repo.
2. Go to about:debugging#addons
3. Click `Load Temporary Add-on` and choose `manifest.json`


#### Safari
1. 



###How It Works
####General Flow
1. Inject a ProofMe iframe, request to ProofMe is made through the iframe.
2. Make request to ProofMe, check if this user already a Proof of this design
3. Keep asking ProofMe to update status of the tooltip.

####Reversing Canva
Get token:

```
$.ajax({
      url: "/_ajax/csrf/export",
      method: "GET",
       dataType: "text"
    })
```
Get current design's version:

```
function exportPDF (token, docId, pages, 1)
// expect request to fail, unless it's indeed first version
// find correct version number in error message
function exportPDF (token, docId, pages, docVersion)
```

Start export task


```
// This ajax will make canva start exporing task
$.ajax({
          url: "/_ajax/export",
          headers: {
              'content-type': 'application/json;charset=UTF-8',
              'x-csrf-token': token
          },
          method: "POST",
          data: JSON.stringify({"attachment":true,"docId":docId,"docVersion":docVersion,"spec":{"mediaDpi":300,"mediaQuality":"SCREEN","bleed":false,"crops":false,"removeCanvas":false,"pages": pages,"targetImageSizeKb":null,"format":"PDF","type":"SCREEN"}}),
          dataType: "text"
        });
```

Get exported PDF Url

```
function getPDFUrl(id, token)

keep making this ajax until Canva finishes PDF export
 

$.ajax({
      url: `/_ajax/export/${id}`,
      data: {"attachment": "true"},
      headers: {
          'content-type': 'application/json;charset=UTF-8',
          'x-csrf-token': token
      },
      method: "GET",
      dataType: "text"
    });



```

####iFrame Events

`windowOnLoad`: 
> canva => proofme: canva ID;
> proofme => canva: annots summary
 
`getPDFUrl`:
>canva => proofme: url to exported file, canva ID;  
>proofme => proof url, proofId, reviewers. due date

`mark as read`:
>canva => proofme: proof ID

### Auto-update Reference

Chrome: https://developer.chrome.com/extensions/autoupdate


Firefox: https://developer.mozilla.org/en-US/docs/Extension_Versioning,_Update_and_Compatibility

Safari: https://developer.apple.com/library/content/documentation/Tools/Conceptual/SafariExtensionGuide/UpdatingExtensions/UpdatingExtensions.html#//apple_ref/doc/uid/TP40009977-CH12-SW1
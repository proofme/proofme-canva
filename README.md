# ProofMe-Canva
When design ♥ feedback on a Chrome/Firefox/Safari extension
##Requires ProofMe@`v0.1259.284-release+ `

<img src="https://lh3.googleusercontent.com/LrEVVCoEHrjNL5DV06xxT_V5QuqObcwiluQJTNjNhcqoaON_1nICCv0j7dsgHX8RaooGVjZEvg=s1280-h800-e365-rw">
###Features
Add two buttons to canva's "Share" and "Download" menu.

Also add a "Open Proof" button if proof exists*, including a tooltip if there are comments.

When exporting a canva design to ProofMe, if proof exists*, we create a new file version. If not create we a new proof.

When Canva provides a zip file of images, where each image is one page of the design, ProofMe will still treat them as a single file model, and set download link to original zip file.

On exporting success, able to open proof, open proof at edit panel, due date or add reviewers.


Browser icon open dropdown.

`proof exists*`: the same ProofMe user already has a proof with the same canva design

Initial Specs: https://proofme.com/p/6hnmackbc4rp8pg/Canva-Chrome-Plugin?files

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
1. Enable developer tools in Advanced pane of Safari preferences
2. Show extension builder in Develop
3. Fill in the form

###How It Works
####General Flow
1. State of the button on share/download is update every time you open its menu
2. State of the open proof button is update every three seconds
3. State of the dropdown on browser icon is updated every time you open the dropdown

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

try {

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

} catch (version is update at the very moment) {
	fall back to `Get current design's version` step
}

####iFrame Events
#####For injected script:
`windowOnLoad`:
> canva => proofme: canva ID;
> proofme => canva: annots summary

`getPDFUrl`:
>canva => proofme: url to exported file, canva ID;  
>proofme => proof url, proofId, reviewers. due date

`mark as read`:
>canva => proofme: proof ID

#####For browser action
`getUsername`:
>canva => proofme
>proofme => canva: username

### Account for publishing

1. Chrome: info@proofme.com
2. Firefox: team@proofme.com
3. Safari: engineering@meta-comm.com

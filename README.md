# ProofMe-Canva
A chrome extension that exports Canva designs to ProofMe
##Requires ProofMe@`v0.1259.76-release+ `

<!--<img src="https://github.com/proofme/proofme-canva/blob/master/images/example.png?raw=true">-->
###Features
Add two buttons to canva's "Share" and "Download" menu.

Also add a "Open Proof" button if proof exists*, including a tooltip if there are comments.

When exporting a canva design to ProofMe, if proof exists*, we create a new file version. If not create we a new proof.

When Canva provides a zip file of images, where each image is one page of the design, ProofMe will still treat them as a single file model, and set download link to original zip file.

On exporting success, able to open proof, open proof at edit panel, due date or add reviewers.


`proof exists*`: the same ProofMe user already has a proof with the same canva design

specs: https://proofme.com/p/6hnmackbc4rp8pg/Canva-Chrome-Plugin?files
###Setup Locally
1. Clone this repo.
2. Go to chrome://extensions/
3. Enable Developer Mode
4. Click Load Unpacked Extension choose whereever you cloned this repo.
5. The extension will talk to `local.proofme.com` by default right now.
 Feel free to go to  the beginning of `/js/send-to-proofme.js`
  and change `const proofmeCluster = "local"`
  to `""`/`"preflight"`/`"master"`/`"dev"`

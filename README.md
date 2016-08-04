# proofme-canva
A chrome extension that exports canva designs to ProofMe

<!--<img src="https://github.com/proofme/proofme-canva/blob/master/images/example.png?raw=true">-->
###Features
Add two buttons to canva's "Share" and "Download" menu.

When exporting a canva design to ProofMe, if the same ProofMe user already have a proof with the same canva design, we create a new file version. If not create we a new proof.

When canva provides a zip file of images, where each image is one page of the design, ProofMe will still treat them as a single file model, and set download link to original zip file.

###Setup Locally
1. Clone this repo.
2. Go to chrome://extensions/
3. Enable Developer Mode
4. Click Load Unpacked Extension choose whereever you cloned this repo.
5. The extension will talk to `local.proofme.com` by default right now.
 Feel free to go to  the beginning of `/js/send-to-proofme.js`
  and change `const proofmeCluster = "local"`
  to `""`/`"preflight"`/`"master"`/`"dev"`

#!/bin/bash





EXT_DIR="`dirname \"$0\"`"              # relative
EXT_DIR="`( cd \"${EXT_DIR}/..\" && pwd )`"  # absolutized and normalized
if [ -z "$EXT_DIR" ] ; then
  # error; for some reason, the path is not accessible
  # to the script (e.g. permissions re-evaled after suid)
  exit 1  # fail
fi
echo "$EXT_DIR"
rm -r ./build
rm -r ./dist

mkdir -p ./build/js
mkdir -p ./dist

BUILD_DIR="./build"
echo "build dir: ${BUILD_DIR}"



echo " building extension"
EXT_BUILD_DIR="./build/extension"
mkdir -p $EXT_BUILD_DIR/js
echo " ...copying manifest.json"
cp ./src/manifest.json  $EXT_BUILD_DIR/manifest.json
cp ./src/Info.plist  $EXT_BUILD_DIR/Info.plist

echo " ...copying css"
cp -r ./src/css  $EXT_BUILD_DIR/css

echo "...transpiling js"
#./node_modules/.bin/babel ./src/js -d $EXT_BUILD_DIR/js
./node_modules/.bin/browserify ./src/js/send-to-proofme.js  -o $EXT_BUILD_DIR/js/send-to-proofme.js -t [ babelify --presets [ es2015 ] ]





echo "== CHROME EXTENSION ============"
# build chrome files
echo "packacging chrome extesntion and signin with private key (in .pem file) "
PACK_DIR=${EXT_BUILD_DIR}
PEM_FILE="${EXT_DIR}/ssl/chrome-proofme-canva.pem"
./scripts/pack-chrome-extension.sh  ${PACK_DIR} ${PEM_FILE}
cp extension.crx ./dist/proofme-canva.crx




XAR=$(which xar)
SAFARI_INPUT=$BUILD_DIR/extension.safariextension

cp -r "./build/extension"  "./build/extension.safariextension"

pushd build
xarjs create ../dist/proofme-canva.safariextz --cert ../ssl/cert.pem --cert ../ssl/apple-intermediate.pem --cert ../ssl/apple-root.pem --private-key ../ssl/privatekey.pem extension.safariextension
popd
#set -x



# $XAR -czf $SAFARI_TARGET  --distribution  $SAFARI_INPUT
# $XAR --sign -f $SAFARI_TARGET --digestinfo-to-sign digest.dat --sig-size `cat $SSL_FOLDER/size.txt` --cert-loc $SSL_FOLDER/cert.der --cert-loc $SSL_FOLDER/cert01 --cert-loc $SSL_FOLDER/cert02
# openssl rsautl -sign -inkey $SSL_FOLDER/proofme-canva.pem -in digest.dat -out sig.dat
# $XAR --inject-sig sig.dat -f $SAFARI_TARGET
# rm -f sig.dat digest.dat






#echo "== SAFARI EXTENSION ============"
## build chrome files
#echo "packacging extesntion and signin with private key (in .pem file) "
#PACK_DIR=${EXT_BUILD_DIR}
#PEM_FILE="${EXT_DIR}/proofme-canva.pem"

#!/bin/sh -l

# --unhandled-rejections=warn
# Guarantee that we are on the same path as our *.js scripts
cd /
npm ci  # more suitable for installs from scratch 
sudo npm i puppeteer --unsafe-perm=true --allow-root
node upload.js

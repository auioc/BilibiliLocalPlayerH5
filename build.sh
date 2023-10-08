#!/bin/sh

mkdir public/lib

npm install -g typescript

curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/CommentCoreLibrary.js >src/lib/CommentCoreLibrary.js
curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/css/style.min.css >public/lib/CommentCoreLibrary.css

tsc

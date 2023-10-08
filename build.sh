#!/bin/sh

mkdir public/lib
mkdir src/lib

npm install -g typescript
npm install -g terser
npm install -g html-minifier-terser

curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/CommentCoreLibrary.js >src/lib/CommentCoreLibrary.js
curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/css/style.min.css >public/lib/CommentCoreLibrary.css

tsc

echo '{"compress":{"pure_funcs":["console.debug"]},"ecma":2017}' >terser.json

html-minifier-terser --minify-js --collapse-whitespace --remove-comments public/index.html >public/index.min.html
terser --config-file terser.json public/player.js >public/player.min.js

mv public/index.min.html public/index.html
mv public/player.min.js public/player.js
rm public/player.js.map

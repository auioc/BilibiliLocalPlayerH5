#!/bin/sh

mkdir temp
mkdir public
mkdir build

# NPM
npm install -g typescript
npm install -g terser
npm install -g html-minifier-terser

# Version
commit=$(git rev-parse --verify HEAD)
branch=$(git branch --show-current)
sed -i "s;{version};$branch@<span title=\"$commit\">$(printf '%s' "$commit" | cut -c 1-8)</span>;g" public/index.html
sed -i "s;{version};$branch@$commit;g" src/player.main.ts

# Build player.js
mkdir src/lib
curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/CommentCoreLibrary.js >src/lib/CommentCoreLibrary.js
curl -L https://github.com/weizhenye/ASS/raw/e6a3605a2343655d9ef80bdd7e9fe92f92edca22/dist/ass.js >src/lib/ass.js
tsc
rm public/player.js.map
# Minify player.js
echo '{"compress":{"pure_funcs":["console.debug"]},"ecma":2017}' >temp/terser.json
terser --config-file temp/terser.json public/player.js >temp/player.js

# Minify player.css
html-minifier-terser --collapse-whitespace public/player.css >temp/player.css
# Download CCL style
curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/css/style.min.css >temp/ccl.css

# Minify index.html
html-minifier-terser --minify-js --collapse-whitespace public/index.html >temp/index.html

# Build AIO html
cp temp/index.html temp/aio.html
sed -i 's;<link[^>]*>;;g' temp/aio.html
## Build all.min.css and fill into html
cat public/player.css >temp/all.css
cat temp/ccl.css >>temp/all.css
html-minifier-terser --collapse-whitespace temp/all.css >temp/all.min.css
sed -i 's^\\^\\\\^g' temp/all.min.css
sed -i "s^<\!--allcss-->^<style>$(cat temp/all.min.css)</style>^g" temp/aio.html
## Patch and fill script into html
sed -i 's;<script src="player.js"></script>;;g' temp/aio.html
sed 's^\\^\\\\^g' temp/player.js >temp/player.pathced.js
sed -i 's^\&^\\&^g' temp/player.pathced.js
sed -i 's^~^\\~^g' temp/player.pathced.js
sed -i "s~<\!--playerjs-->~<script>$(cat temp/player.pathced.js)</script>~g" temp/aio.html

# Build public
cp -f temp/index.html public/index.html
cp -f temp/player.js public/player.js
cp -f temp/player.css public/player.css
mkdir public/lib
cp temp/ccl.css public/lib/CommentCoreLibrary.css
cp temp/aio.html public/

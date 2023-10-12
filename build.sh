#!/bin/sh

mkdir temp

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
tsc
rm public/player.js.map
# Minify player.js
echo '{"compress":{"pure_funcs":["console.debug"]},"ecma":2017}' >temp/terser.json
terser --config-file temp/terser.json public/player.js >temp/player.js

# Minify player.css
html-minifier-terser --collapse-whitespace public/player.css >temp/player.css
# Download CCL style
curl -L https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/css/style.min.css >temp/ccl.css
# Minify CCL style
html-minifier-terser --collapse-whitespace temp/ccl.css >temp/CommentCoreLibrary.css
# Build all.css
cat public/player.css >temp/all.css
cat temp/ccl.css >>temp/all.css
# Minify all.css
html-minifier-terser --collapse-whitespace temp/player.css >temp/all.css

# Minify index.html
html-minifier-terser --minify-js --collapse-whitespace public/index.html >temp/index.html

# Build AIO html
cp temp/index.html temp/aio.html
sed -i 's;<link[^>]*>;;g' temp/aio.html
sed -i 's^\\^\\\\^g' temp/all.css
sed -i "s^<\!--allcss-->^<style>$(cat temp/all.css)</style>^g" temp/aio.html
sed -i 's;<script src="player.js"></script>;;g' temp/aio.html
sed -i 's^\\^\\\\^g' temp/player.js
sed -i 's^\&^\\&^g' temp/player.js
sed -i "s@<\!--playerjs-->@<script>$(cat temp/player.js)</script>@g" temp/aio.html

# Build public
cp -f temp/index.html public/index.html
cp -f temp/player.js public/player.js
cp -f temp/player.css public/player.css
mkdir public/lib
cp temp/CommentCoreLibrary.css public/lib/
cp temp/aio.html public/

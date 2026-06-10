purescript: find src -name '*.purs' | entr -r spago bundle --bundle-type app --platform browser --outfile build/ps.js --module Main --minify --force
style: find src tailwind.css tailwind.config.js -type f | entr -r tailwindcss -i tailwind.css -o build/style.css
parcel: parcel index.html --dist-dir docs
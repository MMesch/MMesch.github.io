#!/usr/bin/env bash
set -euo pipefail

spago bundle --bundle-type app --platform browser --outfile build/ps.js --module Main --minify
tailwindcss -i tailwind.css -o build/style.css
rm -f docs/website.*.js docs/website.*.css docs/website.*.map
parcel build index.html --dist-dir docs

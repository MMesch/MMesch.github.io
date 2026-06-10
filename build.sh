#!/usr/bin/env bash
set -euo pipefail

# Bundle PureScript
spago bundle --bundle-type app --platform browser --outfile build/ps.js --module Main

# Build Tailwind CSS
tailwindcss -i tailwind.css -o build/style.css

# Bundle with Parcel -> docs/
parcel build index.html --dist-dir docs

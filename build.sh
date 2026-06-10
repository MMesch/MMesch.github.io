#!/usr/bin/env bash
set -euo pipefail

# Compile PureScript
spago build

# Build Tailwind CSS
tailwindcss -i tailwind.css -o build/style.css

# Bundle with Parcel -> docs/
parcel build index.html --dist-dir docs

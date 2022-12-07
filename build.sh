#!/usr/bin/env bash

npx tailwindcss -i tailwind.css -o build/style.css
for i in `git diff --name-only --cached docs/posts/ | grep md`
  do pandoc $i \
          --lua-filter=util/dgram.lua \
          -M save_diagrams=true \
          --filter pandoc-katex-filter \
          --highlight-style pygments \
          -o ${i/.md/.html}
  echo $i
done

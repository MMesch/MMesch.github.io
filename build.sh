#!/bin/env bash

npx tailwindcss -i tailwind.css -o build/style.css
for i in docs/posts/*.md
  do pandoc $i --filter pandoc-katex-filter --highlight-style pygments -o ${i/.md/.html}
done

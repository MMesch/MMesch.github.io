---
title: "Running Languagetool in vim or neovim"
labels:
  - Vim
  - little trick
description: "Languagetool is a powerful open source spell and grammar checker. Here is how to integrate it with vim/neovim without plugin."
---

Languagetool is a powerful spell checker

```vim
      function LanguageTool(lang) range
        let l:cmd = "${pkgs.languagetool}/bin/languagetool-commandline -m de-DE -l ".a:lang." -"
        let output=system('echo '.shellescape(join(getline(a:firstline, a:lastline), "\n")).'|'.cmd)
        set splitbelow
        new
        call setline('.', split(output, "\n"))
      endfunction

      command -range LanguageToolEN <line1>,<line2>call LanguageTool("en-US") 
      command -range LanguageToolFR <line1>,<line2>call LanguageTool("fr") 
      command -range LanguageToolDE <line1>,<line2>call LanguageTool("de-DE") 
```

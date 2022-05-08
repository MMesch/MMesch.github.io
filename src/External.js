"use strict"

var hljs = require('highlight.js')
var mdkatex = require('markdown-it-katex')

exports._highlight = function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch (__) {}
    }

    return str;
}

exports._katex = mdkatex

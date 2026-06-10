import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import hljs from "highlight.js";

export function render(input) {
  const md = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(str, { language: lang }).value;
      }
      return "";
    }
  });
  md.use(markdownItKatex);
  return md.render(input);
}

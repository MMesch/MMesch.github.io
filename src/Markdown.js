import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";

export function render(input) {
  return function () {
    const md = new MarkdownIt({
      html: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(str, { language: lang }).value;
        }
        return "";
      }
    });
    md.use(markdownItKatex);
    return md.render(input);
  };
}

export function setInnerHTML(id) {
  return function (html) {
    return function () {
      var el = document.getElementById(id);
      if (el) {
        el.innerHTML = html;
        console.log("innerHTML set:", html.substring(0, 200));
      }
    };
  };
}

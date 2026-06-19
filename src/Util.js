export function fetchNoCache(url) {
  return function () {
    return fetch(url, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status + ": " + url);
      }
      return response.text();
    });
  };
}

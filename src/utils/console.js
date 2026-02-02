(function () {
  const logs = [];
  const BOARD_API_REGEX = /\/api\/boards/i;

  // ---- FETCH HOOK ----
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    const method = options?.method || "GET";

    const res = await originalFetch(...args);

    try {
      if (BOARD_API_REGEX.test(url)) {
        const clone = res.clone();
        const text = await clone.text();

        logs.push({
          type: "fetch",
          url,
          method,
          requestHeaders: options?.headers || {},
          requestBody: options?.body || null,
          status: res.status,
          response: safeJSON(text),
          time: new Date().toISOString(),
        });
      }
    } catch (e) {}

    return res;
  };

  // ---- XHR HOOK ----
  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url;
    this._method = method;
    return open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      if (BOARD_API_REGEX.test(this._url)) {
        logs.push({
          type: "xhr",
          url: this._url,
          method: this._method,
          requestBody: body || null,
          status: this.status,
          response: safeJSON(this.responseText),
          time: new Date().toISOString(),
        });
      }
    });
    return send.apply(this, arguments);
  };

  // ---- UTIL ----
  function safeJSON(text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  // ---- EXPORT ----
  window.__exportBoardAPIs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "boards-api-capture.json";
    a.click();
  };

  console.log(
    "%cBoard API Logger active. Use the app. Run __exportBoardAPIs() to download.",
    "color: green; font-weight: bold;"
  );
})();

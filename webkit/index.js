(() => {
  const BTN_ID = "csrep-millennium-btn";
  const is17Digit = (s) => /^\d{17}$/.test(String(s || ""));

  function isSteamProfilePage() {
    return (
      location.hostname === "steamcommunity.com" &&
      (/^\/id\/[^/]+\/?$/.test(location.pathname) ||
        /^\/profiles\/\d+\/?$/.test(location.pathname))
    );
  }

  async function fetchSteamId64FromXml() {
    const url = `${location.origin}${location.pathname.replace(/\/$/, "")}/?xml=1`;
    const res = await fetch(url, { credentials: "include" });
    const text = await res.text();
    const m = text.match(/<steamID64>(\d{17})<\/steamID64>/);
    return m ? m[1] : null;
  }

  function getSteamId64Sync() {
    const m = location.pathname.match(/^\/profiles\/(\d{17})\/?$/);
    if (m) return m[1];

    try {
      const sid = window.g_rgProfileData?.steamid;
      if (is17Digit(sid)) return String(sid);
    } catch {}

    const html = document.documentElement.innerHTML;
    const r = html.match(/"steamid"\s*:\s*"(\d{17})"/);
    if (r) return r[1];

    return null;
  }

  function buildTargetUrl(steamId64) {
    return `https://csrep.gg/player/${steamId64}`;
  }

  function insertButton() {
    if (!isSteamProfilePage()) return;
    if (document.getElementById(BTN_ID)) return;

    const target =
      document.querySelector(".profile_header_actions") ||
      document.querySelector(".profile_header_centered_persona") ||
      document.querySelector(".profile_header_bg");

    if (!target) return;

    const btn = document.createElement("a");
    btn.id = BTN_ID;
    btn.href = "javascript:void(0)";
    btn.textContent = "CSREP.GG";
    btn.className = "csrep-btn";

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      btn.textContent = "LOADING...";

      try {
        let steamId64 = getSteamId64Sync();
        if (!steamId64) steamId64 = await fetchSteamId64FromXml();

        if (!steamId64 || !is17Digit(steamId64)) {
          btn.textContent = "CSREP.GG";
          return;
        }

        location.assign(buildTargetUrl(steamId64));
      } catch {
        btn.textContent = "CSREP.GG";
      }
    });

    if (target.classList?.contains("profile_header_actions")) {
      target.prepend(btn);
    } else {
      target.appendChild(btn);
    }
  }

  function boot() {
    insertButton();
    const obs = new MutationObserver(insertButton);
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  boot();
})();

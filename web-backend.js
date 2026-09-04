/* ============================================================================
 * web-backend.js — SprinkFlow Browser Edition backend shim
 *
 * Lets the real index.html + app.js run in a browser with NO Python server.
 * It patches window.fetch, intercepts every "./api/..." call, and serves the
 * free-able endpoints entirely client-side:
 *   - boot (app-info / app-data / app-state / projects / catalog)
 *   - per-user datasheet library in IndexedDB (import / pdf / rename / delete)
 *   - PDF generation via pdf-lib (submittal, hydraulic package, merge)  -> download
 * AI + OS-only endpoints degrade gracefully (clear message, feature disabled).
 *
 * Activates ONLY in web mode. On the localhost desktop build (real server
 * present) it returns immediately and touches nothing. pdf-lib is lazy-loaded
 * only when first needed, so the desktop bundle is completely unaffected.
 * ==========================================================================*/
(function () {
  "use strict";

  // ---- activation guard --------------------------------------------------
  var params = new URLSearchParams(location.search);
  var isLocal = /^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(location.hostname);
  var WEB = params.has("web") || location.protocol === "file:" ||
            (!isLocal && location.hostname !== "");
  if (params.get("web") === "0") WEB = false;      // explicit opt-out for testing
  if (!WEB) return;                                 // desktop: do nothing
  window.__SPRINKFLOW_WEB__ = true;
  // stamped by packaging/build_web_edition.py at deploy time; "dev" locally
  var WEB_BUILD = "b0904-2331-880ff94";
  window.__SPRINKFLOW_WEB_BUILD__ = WEB_BUILD;
  console.log("[web-backend] SprinkFlow Web Edition active — build " + WEB_BUILD);
  // mobile layer: web-only stylesheet (media-query gated), never active on desktop
  (function () {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "./web-mobile.css?v=" + encodeURIComponent(WEB_BUILD);
    document.head.appendChild(l);
    // phone nav: hamburger toggle + the tool list as a vertical drawer
    // (CSS shows the button only under 760px; markup is inert elsewhere)
    function initMobileNav() {
      var shell = document.querySelector(".tool-shell");
      var tabs = document.querySelector(".tool-tabs");
      if (!shell || !tabs || document.querySelector(".sf-mnav-toggle")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sf-mnav-toggle";
      btn.setAttribute("aria-label", "Tool menu");
      btn.innerHTML = '<span class="sf-mnav-icon sf-mnav-burger">☰</span>' +
                      '<span class="sf-mnav-icon sf-mnav-close">✕</span><span>Tools</span>';
      btn.addEventListener("click", function () {
        document.body.classList.toggle("sf-mnav-open");
      });
      shell.insertBefore(btn, shell.firstChild);
      tabs.addEventListener("click", function (e) {
        var t = e.target;
        while (t && t !== tabs) {
          if (t.classList && t.classList.contains("tool-tab")) {
            document.body.classList.remove("sf-mnav-open");
            return;
          }
          t = t.parentNode;
        }
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initMobileNav);
    } else {
      initMobileNav();
    }
  })();
  // admin accounts see the build id in the version pill to verify deploys
  var WEB_ADMIN_EMAILS = ["jamesallenquinn@gmail.com", "james@calculated-fs.com"];
  function webIsAdmin() {
    var s = webSessionSafe();
    return !!(s && WEB_ADMIN_EMAILS.indexOf(String(s.email || "").toLowerCase()) >= 0);
  }
  function webSessionSafe() {
    try { return JSON.parse(localStorage.getItem("sprinkflow.web.session.v1")) || null; } catch (e) { return null; }
  }

  var AI_MSG = "This AI step runs in the desktop / Pro version. In the web edition, " +
               "add and organize your datasheets manually — everything else works.";

  // ---- real accounts (same policy as desktop v1.1.3) ---------------------
  // Sign-in goes straight to Supabase (public anon key, CORS-open from any
  // origin). The entitlement check hits the cloud API, which only allows
  // approved origins — so a failed/blocked status check can only DENY exports,
  // never grant them. Free tier = signed in: all tools usable, exports gated.
  var WEB_AUTH = {
    supabaseUrl: "https://aebghirpjiwiergkafej.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYmdoaXJwaml3aWVyZ2thZmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjA0NTQsImV4cCI6MjA5NTg5NjQ1NH0.ogDc26YGo3AEAZZcPII_p3htPml4pjQa4vOyYAU1sSg",
    apiBase: "https://sprinkflow-cloud-api.onrender.com",
  };
  var WEB_SESSION_KEY = "sprinkflow.web.session.v1";
  var WEB_OUTPUT_STATUSES = ["active", "trial", "beta", "grace"];

  function webSession() {
    try { return JSON.parse(localStorage.getItem(WEB_SESSION_KEY)) || null; } catch (e) { return null; }
  }
  function saveWebSession(s) { try { localStorage.setItem(WEB_SESSION_KEY, JSON.stringify(s)); } catch (e) {} }
  function clearWebSession() { try { localStorage.removeItem(WEB_SESSION_KEY); } catch (e) {} }

  function webLicense() {
    var s = webSession();
    if (!s || !s.accessToken) {
      return {
        authenticated: false, status: "signed_out", statusLabel: "Signed Out",
        plan: "SprinkFlow Web", email: "",
        apiConfigured: true, supabaseAuthConfigured: true, billingConfigured: true,
        enforcementRequired: true, commercialOutputsAllowed: false,
        outputAccessLabel: "Sign in to use the free tools",
        cloudConnected: false,
        studioBugAdmin: false,
        message: "Sign in with your SprinkFlow account to use the free design tools in your browser.",
      };
    }
    var status = String(s.licenseStatus || "expired").toLowerCase();
    var outputs = s.statusConfirmed === true && WEB_OUTPUT_STATUSES.indexOf(status) >= 0;
    return {
      authenticated: true,
      status: outputs ? status : (status === "past_due" ? "past_due" : "expired"),
      statusLabel: outputs ? (s.statusLabel || status) : "Free tools",
      plan: s.plan || "SprinkFlow Web", email: s.email || "",
      apiConfigured: true, supabaseAuthConfigured: true, billingConfigured: true,
      enforcementRequired: true, commercialOutputsAllowed: outputs,
      outputAccessLabel: outputs ? "SprinkFlow tools enabled" : "Free tools available - subscribe to export",
      cloudConnected: s.statusConfirmed === true,
      // Same admin list the version pill uses; the cloud still re-checks every call.
      studioBugAdmin: webIsAdmin(),
      message: outputs ? "Signed in - all tools and exports enabled."
        : (s.statusConfirmed === true
            ? "Signed in on the free tier - every tool is usable; subscribe to export documents."
            : "Signed in - free tools enabled. (Subscription status couldn't be confirmed from this site, so exports stay locked.)"),
    };
  }

  function webSupabase(path, payload) {
    return orig(WEB_AUTH.supabaseUrl + path, {
      method: "POST",
      headers: { "apikey": WEB_AUTH.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error_description || j.msg || j.error || ("Sign-in failed (HTTP " + r.status + ")"));
        return j;
      });
    });
  }

  // entitlement check against the cloud API; resolves null when unreachable
  // (CORS-blocked origin, offline, cold server) — free tier still works.
  function webFetchEntitlement(token) {
    return orig(WEB_AUTH.apiBase + "/license/status", {
      headers: { "Authorization": "Bearer " + token, "Accept": "application/json" },
    }).then(function (r) {
      if (!r.ok) return null;
      return r.json().then(function (j) {
        var lic = (j && typeof j.license === "object") ? j.license : j;
        return lic || null;
      });
    }).catch(function () { return null; });
  }

  function webSignIn(body) {
    var email = String((body && body.email) || "").trim().toLowerCase();
    var password = String((body && body.password) || "");
    if (!email || !password) return Promise.resolve(jsonResp({ ok: false, error: "Enter your email and password." }));
    return webSupabase("/auth/v1/token?grant_type=password", { email: email, password: password }).then(function (session) {
      var s = { accessToken: session.access_token, refreshToken: session.refresh_token || "",
                email: (session.user && session.user.email) || email,
                statusConfirmed: false, licenseStatus: "", statusLabel: "", plan: "" };
      return webFetchEntitlement(s.accessToken).then(function (lic) {
        if (lic) {
          s.statusConfirmed = true;
          s.licenseStatus = String(lic.status || lic.license_status || "").toLowerCase();
          s.statusLabel = lic.status_label || lic.statusLabel || "";
          s.plan = lic.plan || "";
        }
        saveWebSession(s);
        return jsonResp({ ok: true, license: webLicense() });
      });
    }).catch(function (e) {
      return jsonResp({ ok: false, error: (e && e.message) || "Sign-in failed." });
    });
  }

  function webRefresh() {
    var s = webSession();
    if (!s || !s.accessToken) return Promise.resolve(jsonResp({ ok: true, license: webLicense() }));
    return webFetchEntitlement(s.accessToken).then(function (lic) {
      if (lic) {
        s.statusConfirmed = true;
        s.licenseStatus = String(lic.status || lic.license_status || "").toLowerCase();
        s.statusLabel = lic.status_label || lic.statusLabel || "";
        s.plan = lic.plan || "";
        saveWebSession(s);
        return jsonResp({ ok: true, license: webLicense() });
      }
      // token may have aged out — try one refresh-token grant, then re-check
      if (!s.refreshToken) return jsonResp({ ok: true, license: webLicense() });
      return webSupabase("/auth/v1/token?grant_type=refresh_token", { refresh_token: s.refreshToken }).then(function (session) {
        s.accessToken = session.access_token;
        s.refreshToken = session.refresh_token || s.refreshToken;
        return webFetchEntitlement(s.accessToken).then(function (lic2) {
          if (lic2) {
            s.statusConfirmed = true;
            s.licenseStatus = String(lic2.status || lic2.license_status || "").toLowerCase();
            s.statusLabel = lic2.status_label || lic2.statusLabel || "";
            s.plan = lic2.plan || "";
          }
          saveWebSession(s);
          return jsonResp({ ok: true, license: webLicense() });
        });
      }).catch(function () {
        clearWebSession();
        return jsonResp({ ok: true, license: webLicense() });
      });
    });
  }

  function webBilling(kind) {
    var s = webSession();
    if (!s || !s.accessToken) return Promise.resolve(jsonResp({ ok: false, error: "Sign in first." }));
    var path = kind === "portal" ? "/billing/create-portal-session" : "/billing/create-checkout-session";
    var ret = { return_url: location.origin, success_url: location.origin, cancel_url: location.href };
    return orig(WEB_AUTH.apiBase + path, {
      method: "POST",
      headers: { "Authorization": "Bearer " + s.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify(ret),
    }).then(function (r) { return r.json(); }).then(function (j) {
      var url = j.url || (j.data && j.data.url);
      if (!url) throw new Error(j.detail || "Billing session unavailable.");
      window.open(url, "_blank", "noopener");
      return jsonResp({ ok: true });
    }).catch(function (e) {
      return jsonResp({ ok: false, error: "Could not open billing from this site - subscribe from the desktop app (Account -> Billing), or at sprinkflow.studio/account.html. (" + ((e && e.message) || "blocked") + ")" });
    });
  }

  // ---- Studio Bug Reports (owner-only tab) -------------------------------
  // The browser edition gets the SAME tab as the desktop, for the same reason it is
  // cheap: this page already holds the signed-in Supabase token and the cloud API
  // allows this origin. These shims call /admin/studio/bug-reports/* directly; the
  // cloud re-checks admin on every one, so a non-admin who forced the tab open sees a
  // 403, never data. Status updates use the POST alias, not PATCH, so the tab keeps
  // working from any allowed origin regardless of the CORS method list.
  function webStudioBugs(path, init) {
    var s = webSession();
    if (!s || !s.accessToken) return Promise.reject(new Error("Sign in first."));
    var options = init || {};
    options.headers = Object.assign({ "Authorization": "Bearer " + s.accessToken }, options.headers || {});
    return orig(WEB_AUTH.apiBase + path, options).then(function (r) {
      if (r.status === 403) throw new Error("This account is not a SprinkFlow admin.");
      return r;
    });
  }

  function webStudioBugsJson(path, init) {
    return webStudioBugs(path, init).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || j.ok === false) throw new Error(j.detail || j.message || ("Request failed (HTTP " + r.status + ")"));
        return (j && typeof j.data === "object" && j.data) || j;
      });
    });
  }

  function webStudioBugsList(body) {
    var query = [];
    ["status", "version", "severity"].forEach(function (key) {
      var value = String((body && body[key]) || "").trim();
      if (value && value !== "all") query.push(key + "=" + encodeURIComponent(value));
    });
    query.push("limit=" + encodeURIComponent(String((body && body.limit) || 200)));
    return webStudioBugsJson("/admin/studio/bug-reports?" + query.join("&")).then(function (data) {
      return jsonResp({
        ok: true, reports: data.reports || [], counts: data.counts || {},
        unread: data.unread || 0, open: data.open || 0, versions: data.versions || [],
      });
    }).catch(function (e) { return jsonResp({ ok: false, error: (e && e.message) || "Could not load bug reports." }); });
  }

  function webStudioBugsDetail(body) {
    var id = Number((body && body.id) || 0);
    if (!id) return Promise.resolve(jsonResp({ ok: false, error: "Which bug report?" }));
    return webStudioBugsJson("/admin/studio/bug-reports/" + id).then(function (data) {
      return jsonResp({ ok: true, report: data.report || {} });
    }).catch(function (e) { return jsonResp({ ok: false, error: (e && e.message) || "Could not open that report." }); });
  }

  function webStudioBugsUpdate(body) {
    var id = Number((body && body.id) || 0);
    if (!id) return Promise.resolve(jsonResp({ ok: false, error: "Which bug report?" }));
    var payload = {};
    if (body.status) payload.status = body.status;
    if (body.note !== undefined && body.note !== null) payload.note = String(body.note);
    return webStudioBugsJson("/admin/studio/bug-reports/" + id + "/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (data) {
      return jsonResp({ ok: true, report: data.report || {}, message: "Bug report #" + id + " updated." });
    }).catch(function (e) { return jsonResp({ ok: false, error: (e && e.message) || "Could not update that report." }); });
  }

  function webStudioBugsFile(url) {
    var params = new URLSearchParams(String(url).slice(String(url).indexOf("?") + 1));
    var id = Number(params.get("id") || 0);
    var kind = params.get("kind") === "bundle" ? "bundle" : "screenshot";
    if (!id) return Promise.resolve(jsonResp({ ok: false, error: "Which bug report?" }, 400));
    return webStudioBugs("/admin/studio/bug-reports/" + id + "/file/" + kind).then(function (r) {
      if (!r.ok) throw new Error("File unavailable (HTTP " + r.status + ")");
      return r.blob().then(function (blob) {
        return new Response(blob, { status: 200, headers: { "Content-Type": blob.type || "application/octet-stream" } });
      });
    }).catch(function (e) { return jsonResp({ ok: false, error: (e && e.message) || "File unavailable." }, 502); });
  }

  // exports/generation gate — mirrors the desktop's _require_commercial_output.
  // Returns null when allowed, or a 402 response (with the license payload so
  // the app updates its own gating UI) when the free tier blocks the action.
  function webRequireOutputs(action) {
    var lic = webLicense();
    if (lic.commercialOutputsAllowed) return null;
    var msg = lic.authenticated
      ? ("SprinkFlow cannot " + action + " on the free tier - exports and document generation need an active subscription. Subscribe in Account -> Billing to unlock them.")
      : ("Sign in to your SprinkFlow account first - the free tools unlock with any account, and exports need an active subscription.");
    return jsonResp({ ok: false, error: msg, license: lic }, 402);
  }

  // server COVER_THEMES, mirrored so covers match the desktop
  var THEMES = {
    "technical-navy":     { header:"#17313a", accent:"#28687a", panel:"#eef4f5", border:"#d0dcdf", muted:"#596a70" },
    "executive-graphite": { header:"#20262b", accent:"#b84632", panel:"#f4f6f6", border:"#d4dcde", muted:"#5f666a" },
    "earth-copper":       { header:"#1f3a34", accent:"#b56a3c", panel:"#f6f2ea", border:"#ded5c5", muted:"#625f56" },
    "blueprint-slate":    { header:"#0f3f6e", accent:"#2da6d7", panel:"#eef7fb", border:"#bcd7e6", muted:"#526774" },
    "safety-minimal":     { header:"#111820", accent:"#e0522d", panel:"#f7f8fa", border:"#d8e0e5", muted:"#5b6670" },
    "crimson-alarm":      { header:"#8a1c1c", accent:"#f0b323", panel:"#fdf3e7", border:"#ecd6b4", muted:"#6b5a4a" },
    "monochrome-press":   { header:"#0b0b0b", accent:"#4a4a4a", panel:"#f2f2f2", border:"#c9c9c9", muted:"#4f4f4f" },
    "field-amber":        { header:"#2f2a24", accent:"#f2a900", panel:"#fdf6e6", border:"#e8d6ac", muted:"#6a6259" },
    "transmittal-indigo": { header:"#28306b", accent:"#8a6fd1", panel:"#f1f1fa", border:"#d2d3ea", muted:"#5c5f78" },
    "atlas-swiss":        { header:"#141618", accent:"#ff5c35", panel:"#f4f2ee", border:"#ddd8d0", muted:"#75706a" },
    "halo-arc":           { header:"#0b1f2a", accent:"#00c2a8", panel:"#eef7f6", border:"#cfe3e0", muted:"#54666b" },
    "meridian-split":     { header:"#2b3a3a", accent:"#e07a5f", panel:"#f7f4f1", border:"#e3dcd4", muted:"#6b6660" },
    "aperture-gradient":  { header:"#1c1c1e", accent:"#ff6a3d", panel:"#f7f5f4", border:"#e3deda", muted:"#66605d" }
  };

  // ---- tiny IndexedDB kv store -------------------------------------------
  var DB = "sprinkflow-web", STORE = "kv";
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function kvGet(k) { return idb().then(function (db) { return new Promise(function (res, rej) {
    var t = db.transaction(STORE, "readonly").objectStore(STORE).get(k);
    t.onsuccess = function () { res(t.result); }; t.onerror = function () { rej(t.error); };
  }); }); }
  function kvSet(k, v) { return idb().then(function (db) { return new Promise(function (res, rej) {
    var tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put(v, k);
    tx.oncomplete = function () { res(true); }; tx.onerror = function () { rej(tx.error); };
  }); }); }
  function kvDel(k) { return idb().then(function (db) { return new Promise(function (res, rej) {
    var tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(k);
    tx.oncomplete = function () { res(true); }; tx.onerror = function () { rej(tx.error); };
  }); }); }

  // ---- lazy pdf-lib ------------------------------------------------------
  var _pdflib = null;
  function loadPdfLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (_pdflib) return _pdflib;
    _pdflib = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "./assets/vendor/pdf-lib.min.js?v=1";
      s.onload = function () { res(window.PDFLib); };
      s.onerror = function () { rej(new Error("Could not load pdf-lib.")); };
      document.head.appendChild(s);
    });
    return _pdflib;
  }

  // ---- lazy Pyodide + the REAL Python seismic engine ---------------------
  // The seismic calculator is 4,900 lines of safety-critical NFPA Python. Rather
  // than risk a divergent JS re-implementation, the web edition runs the exact
  // same engine in-browser via Pyodide (Python compiled to WASM). Loads once on
  // first use, then every calc is identical to the desktop.
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = function () { res(); };
      s.onerror = function () { rej(new Error("Could not load " + src)); };
      document.head.appendChild(s);
    });
  }
  var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var _engine = null;
  function seismicEngine() {
    if (_engine) return _engine;
    _engine = (function () {
      setBadge("Loading seismic engine (first use, ~10 MB)…");
      return loadScript(PYODIDE_URL + "pyodide.js")
        .then(function () { return window.loadPyodide({ indexURL: PYODIDE_URL }); })
        .then(function (py) {
          return fetch("./assets/seismic/seismic-engine.zip?v=" + encodeURIComponent(WEB_BUILD)).then(function (r) {
            if (!r.ok) throw new Error("seismic-engine.zip not found");
            return r.arrayBuffer();
          }).then(function (buf) {
            try { py.FS.mkdir("/app"); } catch (e) {}
            py.unpackArchive(new Uint8Array(buf), "zip", { extractDir: "/app" });
            py.runPython("import sys\nif '/app' not in sys.path: sys.path.insert(0, '/app')\nimport seismic_api");
            setBadge(null);
            return py;
          });
        })
        .catch(function (e) { setBadge(null); _engine = null; throw e; });
    })();
    return _engine;
  }
  function seismicCall(fn, payload) {
    return seismicEngine().then(function (py) {
      py.globals.set("_pl", payload == null ? null : JSON.stringify(payload));
      var code =
        "import json, seismic_api\n" +
        "_p = None if _pl is None else json.loads(_pl)\n" +
        "_r = seismic_api." + fn + "() if _p is None else seismic_api." + fn + "(_p)\n" +
        "json.dumps(_r)";
      return JSON.parse(py.runPython(code));
    });
  }
  function seismicRoute(fn, payload) {
    return seismicCall(fn, payload).then(function (r) {
      return jsonResp(Object.assign({ ok: true }, r));
    }, function (e) {
      var m = String((e && e.message) || e).split("\n").filter(Boolean).pop() || "Seismic calc failed.";
      return jsonResp({ ok: false, error: m });
    });
  }

  // ---- CAD block exploder (the REAL cad_explode.py via Pyodide) ------------
  // DXF only in the browser (DWG needs the desktop's ODA converter). Xrefs
  // bind exactly like desktop: the host + any user-added xref files are staged
  // into ONE folder (/cadx) so cad_explode.bind_xrefs resolves them there.
  var _ezdxfReady = null;
  function ensureEzdxf(py) {
    if (_ezdxfReady) return _ezdxfReady;
    setBadge("Loading DXF engine (first use)…");
    _ezdxfReady = py.loadPackage("micropip")
      .then(function () { return py.runPythonAsync("import micropip\nawait micropip.install('ezdxf')"); })
      .then(function () { setBadge(null); }, function (e) { setBadge(null); _ezdxfReady = null; throw e; });
    return _ezdxfReady;
  }

  function cadxStage(py, body) {
    // wipe + restage /cadx with the host drawing and any provided xref files
    py.runPython("import shutil, pathlib\nshutil.rmtree('/cadx', ignore_errors=True)\npathlib.Path('/cadx').mkdir()");
    var host = body.file || {};
    var name = (host.name || "drawing.dxf").replace(/[\\/]/g, "_");
    if (/\.dwg$/i.test(name)) throw new Error("DWG files need the desktop app (the free ODA converter is a Windows program). Export to DXF first, or use the desktop SprinkFlow.");
    py.FS.writeFile("/cadx/" + name, dataUrlToBytes(host.dataUrl));
    (body.xrefFiles || []).forEach(function (x) {
      var xn = (x.name || "").replace(/[\\/]/g, "_");
      if (!xn || !x.dataUrl) return;
      if (/\.dwg$/i.test(xn)) return;   // silently skip DWG xrefs; bind reports them missing
      py.FS.writeFile("/cadx/" + xn, dataUrlToBytes(x.dataUrl));
    });
    return name;
  }

  function cadxRun(body, mode) {
    return seismicEngine().then(function (py) {
      return ensureEzdxf(py).then(function () {
        var name = cadxStage(py, body);
        py.globals.set("_cadx_name", name);
        py.globals.set("_cadx_mode", mode);
        var out = py.runPython(
          "import json, base64, pathlib, importlib\n" +
          "import cad_explode\n" +
          "_p = pathlib.Path('/cadx') / _cadx_name\n" +
          "if _cadx_mode == 'analyze':\n" +
          "    _r = cad_explode.analyze(_p)\n" +
          "else:\n" +
          "    _doc, _r = cad_explode.convert(_p)\n" +
          "    _out = pathlib.Path('/cadx/__exploded.dxf')\n" +
          "    _doc.saveas(str(_out))\n" +
          "    _r['dxfB64'] = base64.b64encode(_out.read_bytes()).decode()\n" +
          "json.dumps(_r)");
        return JSON.parse(out);
      });
    });
  }

  // ===================== Vicinity map =====================
  // Port of server.py's vicinity_geocode / vicinity_streets. All three OSM
  // services allow browser CORS, so these run client-side with no backend.
  // NOTE: these MUST use orig() -- our own fetch patch would otherwise see
  // "/api/" inside photon.komoot.io/api/ and overpass-api.de/api/interpreter.
  function vicinityJson(url, init) {
    return orig(url, init).then(function (r) {
      if (!r.ok) throw new Error("Service returned " + r.status);
      return r.json();
    });
  }

  // Same ranking as the desktop: exact house-number matches beat fuzzy POIs.
  function vicinityScore(cand, queryNumber, queryTokens) {
    var score = 0;
    if (cand.house_number) {
      score += 3;
      if (queryNumber && String(cand.house_number).trim() === queryNumber) score += 6;
    }
    var labelTokens = String(cand.label || "").toLowerCase().split(/[\s,]+/).filter(function (t) { return t.length > 1; });
    queryTokens.forEach(function (t) { if (labelTokens.indexOf(t) !== -1) score += 1; });
    if (cand.source === "nominatim") score += 1;
    return score;
  }

  // Full query, then house number stripped, then the city/state tail — new
  // rural roads are often missing from OSM entirely; the degraded matches get
  // the user close enough to finish with the map picker.
  function vicinityGeocodeWeb(body) {
    var query = String((body && body.query) || "").trim().slice(0, 160);
    return vicinityGeocodeOnce(query).then(function (resp) {
      return resp.clone().json().then(function (data) {
        if ((data.results || []).length || !data.ok) return resp;
        var stripped = query.replace(/^\s*\d+[\s,]+/, "").trim();
        var tagged = function (suffix) {
          return function (resp2) {
            return resp2.json().then(function (d2) {
              (d2.results || []).forEach(function (r) { r.label = (r.label + suffix).slice(0, 140); });
              return jsonResp(d2);
            });
          };
        };
        if (stripped && stripped.toLowerCase() !== query.toLowerCase()) {
          return vicinityGeocodeOnce(stripped).then(function (resp2) {
            return resp2.json().then(function (d2) {
              // a degraded match must still share a token with the query's
              // city/state tail (Photon returns same-named streets on other
              // continents, which would mask the useful area fallback)
              var parts = query.split(",").map(function (p) { return p.trim(); }).filter(Boolean);
              var tailTokens = {};
              parts.slice(1).forEach(function (p) {
                p.toLowerCase().split(/[\s,]+/).forEach(function (t) { if (t.length > 1) tailTokens[t] = 1; });
              });
              var kept = (d2.results || []).filter(function (r) {
                if (!Object.keys(tailTokens).length) return true;
                return String(r.label || "").toLowerCase().split(/[\s,]+/).some(function (t) { return tailTokens[t]; });
              });
              if (kept.length) {
                kept.forEach(function (r) { r.label = (r.label + " — street match (no house number)").slice(0, 140); });
                return jsonResp({ ok: true, results: kept });
              }
              return vicinityGeocodeTail(query, tagged);
            });
          });
        }
        return vicinityGeocodeTail(query, tagged);
      });
    });
  }

  function vicinityGeocodeTail(query, tagged) {
    var parts = query.split(",").map(function (p) { return p.trim(); }).filter(Boolean);
    if (parts.length < 2) return Promise.resolve(jsonResp({ ok: true, results: [] }));
    return vicinityGeocodeOnce(parts.slice(-2).join(", "))
      .then(tagged(" — area match: pin the site with Pick on Map"));
  }

  function vicinityGeocodeOnce(query) {
    if (query.length < 3) return Promise.resolve(jsonResp({ ok: true, results: [] }));
    var quoted = encodeURIComponent(query);
    var numberMatch = query.match(/^\s*(\d+)\b/);
    var queryNumber = numberMatch ? numberMatch[1] : "";
    var queryTokens = query.toLowerCase().split(/[\s,]+/).filter(function (t) { return t.length > 1; });

    var nominatim = vicinityJson(
      "https://nominatim.openstreetmap.org/search?q=" + quoted +
      "&format=json&limit=6&countrycodes=us&addressdetails=1"
    ).then(function (rows) {
      return (rows || []).map(function (row) {
        var addr = row.address || {};
        return {
          label: String(row.display_name || "").slice(0, 120),
          lat: parseFloat(row.lat), lon: parseFloat(row.lon),
          house_number: addr.house_number || "", source: "nominatim",
        };
      });
    }).catch(function () { return []; });

    var photon = vicinityJson(
      "https://photon.komoot.io/api/?q=" + quoted + "&limit=6&lang=en"
    ).then(function (data) {
      return ((data && data.features) || []).map(function (feature) {
        var props = feature.properties || {};
        var coords = (feature.geometry || {}).coordinates || [];
        if (coords[1] == null) return null;
        var streetLine = [props.housenumber, props.street].filter(Boolean).join(" ").trim() || (props.name || "");
        var label = [streetLine, props.city, props.state, props.postcode].filter(Boolean).join(", ");
        if (!label) return null;
        return {
          label: label, lat: coords[1], lon: coords[0],
          house_number: props.housenumber || "", source: "photon",
        };
      }).filter(Boolean);
    }).catch(function () { return []; });

    return Promise.all([nominatim, photon]).then(function (lists) {
      var candidates = lists[0].concat(lists[1]).filter(function (c) {
        return Number.isFinite(c.lat) && Number.isFinite(c.lon);
      });
      candidates.forEach(function (c) { c._score = vicinityScore(c, queryNumber, queryTokens); });
      candidates.sort(function (a, b) { return b._score - a._score; });
      var results = [], seen = [];
      for (var i = 0; i < candidates.length && results.length < 6; i += 1) {
        var c = candidates[i];
        var dupe = seen.some(function (p) { return Math.abs(c.lat - p[0]) < 1e-4 && Math.abs(c.lon - p[1]) < 1e-4; });
        if (dupe) continue;
        seen.push([c.lat, c.lon]);
        results.push({ label: c.label, lat: c.lat, lon: c.lon });
      }
      return jsonResp({ ok: true, results: results });
    }).catch(function (e) {
      return jsonResp({ ok: false, error: (e && e.message) || "Address lookup failed." });
    });
  }

  var VICINITY_OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  function vicinityStreetsWeb(body) {
    var lat = parseFloat(body && body.lat), lon = parseFloat(body && body.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return Promise.resolve(jsonResp({ ok: false, error: "Pick an address first." }));
    }
    var halfW = Math.max(150, Math.min(2500, parseFloat(body.halfWidthM) || 650));
    var halfH = Math.max(150, Math.min(2500, parseFloat(body.halfHeightM) || 550));
    var mPerDegLat = 111320, mPerDegLon = 111320 * Math.cos(lat * Math.PI / 180);
    var south = lat - halfH / mPerDegLat, north = lat + halfH / mPerDegLat;
    var west = lon - halfW / mPerDegLon, east = lon + halfW / mPerDegLon;
    var query = '[out:json][timeout:25];way["highway"](' + south + "," + west + "," + north + "," + east + ");out geom;";
    var payload = "data=" + encodeURIComponent(query);

    // Public Overpass mirrors get overloaded; walk them like the desktop does.
    var index = 0;
    function attempt() {
      if (index >= VICINITY_OVERPASS_MIRRORS.length) {
        return Promise.resolve(jsonResp({
          ok: false,
          error: "Could not reach the OpenStreetMap street service (the public servers are busy). Please try again in a moment.",
        }));
      }
      var mirror = VICINITY_OVERPASS_MIRRORS[index++];
      return vicinityJson(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
      }).then(function (data) {
        var ways = [];
        ((data && data.elements) || []).forEach(function (element) {
          if (element.type !== "way") return;
          var tags = element.tags || {}, geometry = element.geometry || [];
          if (geometry.length < 2) return;
          ways.push({
            id: element.id,
            highway: String(tags.highway || ""),
            name: String(tags.name || ""),
            pts: geometry.map(function (g) { return [g.lat, g.lon]; }),
          });
        });
        return jsonResp({ ok: true, ways: ways });
      }).catch(function () { return attempt(); });
    }
    return attempt();
  }

  function cadxAnalyzeWeb(body) {
    return cadxRun(body, "analyze").then(function (r) {
      // token-less web flow: the frontend resends the file bytes on convert
      return jsonResp(Object.assign({ ok: true, token: "web-inline" }, r));
    }, function (e) {
      return jsonResp({ ok: false, error: String((e && e.message) || e).split("\n").filter(Boolean).pop() });
    });
  }

  function cadxConvertWeb(body) {
    var gate = webRequireOutputs("explode CAD blocks");
    if (gate) return Promise.resolve(gate);
    return cadxRun(body, "convert").then(function (r) {
      var b64 = r.dxfB64; delete r.dxfB64;
      var base = String((body.file || {}).name || "drawing").replace(/\.(dwg|dxf)$/i, "");
      var fn = cleanName(base + "-exploded") + ".dxf";
      download(dataUrlToBytes("data:application/dxf;base64," + b64), fn, "application/dxf");
      return jsonResp(Object.assign({ ok: true, path: fn }, r));
    }, function (e) {
      return jsonResp({ ok: false, error: String((e && e.message) || e).split("\n").filter(Boolean).pop() });
    });
  }

  // ---- PDF -> CAD (the REAL pdf_to_cad.py via Pyodide) ---------------------
  // Mirrors server.py's /api/pdf-to-cad/* contract exactly so app.js runs
  // unchanged: analyze/convert reference an uploaded PDF by TOKEN, and the
  // token store lives here in memory instead of USER_DATA_DIR/pdf-cad-temp.
  // Differences from desktop: output is DXF only (DWG needs the ODA converter,
  // a Windows program) and previews are rasterized by pdf.js instead of
  // pypdfium2. Everything that decides the geometry — extraction, welding,
  // text phrases, layer/colour grouping, the DXF writer — is the same Python.
  var _pdfcadTokens = {};      // token -> { name, bytes, doc, pageCount }
  var _pdfcadStaged = null;    // token currently written into the Pyodide FS
  var _pdfcadThumbs = {};      // "token|page|w|360" -> { dataUrl, width, height }
  var _pdfcadKeep = 2;         // whole PDFs live in memory; keep only the newest few

  function pdfcadStore(name, bytes) {
    var token = "pdfcad-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
    _pdfcadTokens[token] = { name: name || "drawing.pdf", bytes: bytes, doc: null, pageCount: 0 };
    var keys = Object.keys(_pdfcadTokens);
    keys.slice(0, Math.max(0, keys.length - _pdfcadKeep)).forEach(function (k) {
      delete _pdfcadTokens[k];
      if (_pdfcadStaged === k) _pdfcadStaged = null;
      Object.keys(_pdfcadThumbs).forEach(function (ck) {
        if (ck.indexOf(k + "|") === 0) delete _pdfcadThumbs[ck];
      });
    });
    return token;
  }

  // pdf.js TRANSFERS the buffer it is handed, so every call gets its own copy —
  // the master bytes must survive for the Python side and for later renders.
  function pdfcadDoc(entry) {
    if (entry.doc) return entry.doc;
    if (!window.pdfjsLib) return Promise.reject(new Error("The PDF reader has not loaded yet — try the import again."));
    entry.doc = window.pdfjsLib.getDocument({ data: entry.bytes.slice() }).promise.then(function (pdf) {
      entry.pageCount = pdf.numPages;
      return pdf;
    }, function (e) { entry.doc = null; throw new Error("That file could not be read as a PDF."); });
    return entry.doc;
  }

  // pdfminer.six does the vector/text extraction; pypdf reads the /OCProperties
  // catalog so PDF layers hidden in the source default to unchecked. ezdxf is
  // NOT pulled here — only the optional R2000 writer needs it (see convert).
  var _pdfcadReady = null;
  function ensurePdfcadDeps(py) {
    if (_pdfcadReady) return _pdfcadReady;
    setBadge("Loading PDF-to-CAD converter (first use)…");
    _pdfcadReady = py.loadPackage("micropip")
      .then(function () { return py.runPythonAsync("import micropip\nawait micropip.install(['pypdf', 'pdfminer.six'])"); })
      .then(function () {
        _pypdfReady = Promise.resolve();   // same two wheels the plan scanner needs
        setBadge(null);
      }, function (e) { setBadge(null); _pdfcadReady = null; throw e; });
    return _pdfcadReady;
  }

  function pdfcadStage(py, token, entry) {
    if (_pdfcadStaged === token) return;
    py.runPython("import shutil, pathlib\nshutil.rmtree('/pdfcad', ignore_errors=True)\npathlib.Path('/pdfcad').mkdir()");
    py.FS.writeFile("/pdfcad/in.pdf", entry.bytes);
    _pdfcadStaged = token;
  }

  function pdfcadEntry(token) {
    var entry = _pdfcadTokens[token];
    if (!entry) throw new Error("PDF is no longer available — re-import it.");
    return entry;
  }

  function pdfcadFail(e) {
    return jsonResp({ ok: false,
      error: String((e && e.message) || e).split("\n").filter(Boolean).pop() || "PDF-to-CAD failed." }, 400);
  }

  function pdfcadAnalyzeWeb(body) {
    var token = body.token;
    var entry;
    try {
      if (body.file && body.file.dataUrl) {
        token = pdfcadStore(body.file.name, dataUrlToBytes(body.file.dataUrl));
      }
      entry = pdfcadEntry(token);
    } catch (e) { return Promise.resolve(pdfcadFail(e)); }
    var page = Math.max(0, parseInt(body.page, 10) || 0);
    return pdfcadDoc(entry).then(function (pdf) {
      var pageCount = pdf.numPages || 1;
      page = Math.max(0, Math.min(page, pageCount - 1));
      return seismicEngine().then(function (py) {
        return ensurePdfcadDeps(py).then(function () {
          setBadge("Reading sheet " + (page + 1) + "…");
          try {
            pdfcadStage(py, token, entry);
            py.globals.set("_pc_page", page);
            var out = py.runPython(
              "import json, pathlib\n" +
              "import pdf_to_cad\n" +
              "_r = pdf_to_cad.analyze(pathlib.Path('/pdfcad/in.pdf'), _pc_page)\n" +
              "json.dumps(_r)");
          } finally { setBadge(null); }
          return jsonResp(Object.assign(
            { ok: true, token: token, page: page, pageCount: pageCount,
              fileName: entry.name, dwgCapable: false },
            JSON.parse(out)));
        });
      });
    }).catch(pdfcadFail);
  }

  function pdfcadPreviewWeb(body) {
    var entry;
    try { entry = pdfcadEntry(body.token); } catch (e) { return Promise.resolve(pdfcadFail(e)); }
    var page = Math.max(0, parseInt(body.page, 10) || 0);
    var width = body.width ? Math.max(80, Math.min(1600, parseInt(body.width, 10) || 360)) : 0;
    var dpi = width ? 0 : Math.max(24, Math.min(200, parseInt(body.dpi, 10) || 110));
    var ckey = body.token + "|" + page + "|" + (width ? "w" + width : "d" + dpi);
    if (_pdfcadThumbs[ckey]) return Promise.resolve(jsonResp(Object.assign({ ok: true }, _pdfcadThumbs[ckey])));
    return pdfcadDoc(entry).then(function (pdf) {
      var idx = Math.max(1, Math.min(page + 1, pdf.numPages));
      return pdf.getPage(idx).then(function (p) {
        var base = p.getViewport({ scale: 1 });
        var vp = p.getViewport({ scale: width ? (width / base.width) : (dpi / 72) });
        var cv = document.createElement("canvas");
        cv.width = Math.max(1, Math.round(vp.width));
        cv.height = Math.max(1, Math.round(vp.height));
        var ctx = cv.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cv.width, cv.height);   // JPEG has no alpha; paper is white
        return p.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
          var res = { dataUrl: cv.toDataURL("image/jpeg", 0.78), width: cv.width, height: cv.height };
          _pdfcadThumbs[ckey] = res;
          var keys = Object.keys(_pdfcadThumbs);
          if (keys.length > 420) delete _pdfcadThumbs[keys[0]];
          return jsonResp(Object.assign({ ok: true }, res));
        });
      });
    }).catch(function () { return jsonResp({ ok: false, error: "Could not render that sheet." }, 400); });
  }

  function pdfcadConvertWeb(body) {
    var gate = webRequireOutputs("convert a PDF to CAD");
    if (gate) return Promise.resolve(gate);
    var entry, token = body.token;
    try { entry = pdfcadEntry(token); } catch (e) { return Promise.resolve(pdfcadFail(e)); }
    var args = {
      page: Math.max(0, parseInt(body.page, 10) || 0),
      scale: Number(body.scale) || 96,
      selected: body.selectedHexes || [],
      includeText: body.includeText !== false,
      includeFills: body.includeFills !== false,
      dxfVersion: String(body.dxfVersion || "").toUpperCase() === "R2000" ? "R2000" : "R12",
    };
    return seismicEngine().then(function (py) {
      return ensurePdfcadDeps(py).then(function () {
        // R12 is written by hand (pure text); only the R2000 lineweight writer needs ezdxf
        return args.dxfVersion === "R2000" ? ensureEzdxf(py) : null;
      }).then(function () {
        setBadge("Converting sheet " + (args.page + 1) + " to CAD…");
        var out;
        try {
          pdfcadStage(py, token, entry);
          py.globals.set("_pc_args", JSON.stringify(args));
          out = py.runPython(
            "import json, pathlib\n" +
            "import pdf_to_cad\n" +
            "_a = json.loads(_pc_args)\n" +
            "_r = pdf_to_cad.convert(pathlib.Path('/pdfcad/in.pdf'), _a['page'], _a['selected'],\n" +
            "                        _a['scale'], include_text=_a['includeText'],\n" +
            "                        include_fills=_a['includeFills'], dxf_version=_a['dxfVersion'])\n" +
            "json.dumps(_r)");
        } finally { setBadge(null); }
        var r = JSON.parse(out);
        var dxf = r.dxf; delete r.dxf;
        var base = String(body.defaultName || entry.name || "pdf-import").replace(/\.[A-Za-z0-9]{1,5}$/, "");
        var fn = cleanName(base) + ".dxf";
        download(new TextEncoder().encode(dxf), fn, "application/dxf");
        return jsonResp(Object.assign({ ok: true, path: fn, format: "dxf", dwgFallback: false,
                                       downloaded: true }, r));
      });
    }).catch(pdfcadFail);
  }

  // ---- plans scan (the REAL plan_scan_core.py via Pyodide) -----------------
  // Identical code to the desktop scan minus the OCR fallback (that rasterizes
  // through desktop-only tooling); typed plan sets scan the same as desktop.
  var _pypdfReady = null;
  function ensurePypdf(py) {
    if (_pypdfReady) return _pypdfReady;
    setBadge("Loading plan scanner (first use)…");
    _pypdfReady = py.loadPackage("micropip")
      // pdfminer.six (pure Python) is what the title-block extractor positions
      // glyphs with; without it the lazy import fails silently and the scan
      // falls back to the old low-accuracy pypdf path.
      .then(function () { return py.runPythonAsync("import micropip\nawait micropip.install(['pypdf', 'pdfminer.six'])"); })
      .then(function () { setBadge(null); }, function (e) { setBadge(null); _pypdfReady = null; throw e; });
    return _pypdfReady;
  }

  function analyzePlansWeb(body) {
    var f = body.file || {};
    if (!f.dataUrl) return Promise.resolve(jsonResp({ ok: false, error: "The plan PDF is missing its data - drop it again." }));
    return seismicEngine().then(function (py) {
      return ensurePypdf(py).then(function () {
        py.runPython("import pathlib, shutil\nshutil.rmtree('/planscan', ignore_errors=True)\npathlib.Path('/planscan').mkdir()");
        py.FS.writeFile("/planscan/plans.pdf", dataUrlToBytes(f.dataUrl));
        py.globals.set("_ps_name", f.name || "plans.pdf");
        py.globals.set("_ps_opts", JSON.stringify(body.scanOptions || null));
        var out = py.runPython(
          "import json, pathlib\n" +
          "from plan_scan_core import analyze_plan_core\n" +
          "_r = analyze_plan_core(pathlib.Path('/planscan/plans.pdf'), _ps_name, json.loads(_ps_opts))\n" +
          "_r['notes'] = (_r.get('notes') or []) + ['Scanned in the browser - scanned/raster plan sets need the desktop app (OCR).']\n" +
          "json.dumps(_r)");
        return jsonResp({ ok: true, project: JSON.parse(out) });
      });
    }).catch(function (e) {
      return jsonResp({ ok: false, error: String((e && e.message) || e).split("\n").filter(Boolean).pop() || "Plan scan failed." });
    });
  }

  // reportlab isn't a Pyodide built-in; micropip pulls it (~1s) on first export.
  var _rlReady = null;
  function ensureReportlab(py) {
    if (_rlReady) return _rlReady;
    setBadge("Loading PDF renderer (first export)…");
    _rlReady = py.loadPackage("micropip")
      .then(function () { return py.runPythonAsync("import micropip\nawait micropip.install('reportlab')"); })
      .then(function () { setBadge(null); }, function (e) { setBadge(null); _rlReady = null; throw e; });
    return _rlReady;
  }
  // run the REAL calc-sheet renderer (reportlab) in Pyodide -> PDF bytes
  function seismicPdfBytes(payload) {
    return seismicEngine().then(function (py) {
      return ensureReportlab(py).then(function () {
        py.globals.set("_pl", JSON.stringify(payload));
        var code =
          "import json, base64, seismic_api\n" +
          "_p = json.loads(_pl)\n" +
          "_res = seismic_api.seismic_calc(_p)\n" +
          "_style = (_p.get('sheetStyle') or 'tolbrace')\n" +
          "_pdf = seismic_api.seismic_report_pdf_nfpa(_p, _res) if _style == 'nfpa' else seismic_api.seismic_report_pdf(_p, _res)\n" +
          "base64.b64encode(_pdf).decode()";
        return dataUrlToBytes("data:application/pdf;base64," + py.runPython(code));
      });
    });
  }
  function seismicExportRoute(payload) {
    var mode = payload.mode || "pdf";
    return seismicPdfBytes(payload).then(function (bytes) {
      if (mode === "png") return seismicPngFromPdf(bytes);
      var proj = payload.project || {};
      var fn = cleanName("Seismic Calc - " + (proj.braceId || proj.jobName || "brace")) + ".pdf";
      download(bytes, fn);
      return jsonResp({ ok: true, path: fn });
    }, function (e) {
      var m = String((e && e.message) || e).split("\n").filter(Boolean).pop() || "Seismic export failed.";
      return jsonResp({ ok: false, error: m });
    });
  }
  // PNG mode: render the calc sheet at 200 dpi and copy to the clipboard
  // (falls back to a download if the clipboard write is blocked).
  function seismicPngFromPdf(pdfBytes) {
    if (!window.pdfjsLib) return jsonResp({ ok: false, error: "PNG preview needs the PDF viewer." });
    return window.pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise.then(function (pdf) {
      return pdf.getPage(1).then(function (page) {
        var vp = page.getViewport({ scale: 200 / 72 });
        var cv = document.createElement("canvas"); cv.width = vp.width; cv.height = vp.height;
        return page.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise.then(function () {
          return new Promise(function (res) {
            cv.toBlob(function (blob) {
              var done = function (clip) { res(jsonResp({ ok: true, clipboard: clip, width: cv.width, height: cv.height })); };
              var dl = function () { blob.arrayBuffer().then(function (b) { download(new Uint8Array(b), "Seismic Calc.png", "image/png"); done(false); }); };
              if (navigator.clipboard && window.ClipboardItem) {
                navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]).then(function () { done(true); }, dl);
              } else { dl(); }
            }, "image/png");
          });
        });
      });
    });
  }

  // ---- helpers -----------------------------------------------------------
  function jsonResp(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200, headers: { "Content-Type": "application/json" }
    });
  }
  function dataUrlToBytes(dataUrl) {
    var b64 = String(dataUrl).slice(String(dataUrl).indexOf(",") + 1);
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
  function download(bytes, filename, type) {
    var blob = new Blob([bytes], { type: type || "application/pdf" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 6000);
  }
  function cleanName(s) { return String(s || "").replace(/[^\w .-]+/g, "").trim() || "SprinkFlow"; }
  // WinAnsi-safe text for pdf-lib StandardFonts
  function safe(s) {
    return String(s == null ? "" : s)
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-").replace(/[•]/g, "-").replace(/ /g, " ")
      .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "?");
  }

  // ====================================================================
  //  fetch patch
  // ====================================================================
  var orig = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    // Only OUR OWN "./api/*" calls get shimmed. Matching on the raw string
    // hijacked any external host with /api/ in its path -- photon.komoot.io/api/
    // and overpass-api.de/api/interpreter both came back as a fake {ok:true},
    // which is what broke the vicinity map on the web.
    var abs;
    try { abs = new URL(url, document.baseURI); } catch (e) { return orig(input, init); }
    if (abs.origin !== window.location.origin) return orig(input, init);
    var path = abs.pathname;
    if (path.indexOf("/api/") === -1) return orig(input, init);   // static/data -> real fetch
    var route = path.slice(path.indexOf("/api/"));
    var body = {};
    try { if (init && typeof init.body === "string") body = JSON.parse(init.body); } catch (e) { body = {}; }
    return dispatch(route, url, body).then(function (r) {
      return r || jsonResp({ ok: true });      // safe default keeps boot alive
    }).catch(function (e) {
      console.warn("[web-backend]", route, e);
      return jsonResp({ ok: false, error: (e && e.message) || String(e) });
    });
  };

  function dispatch(route, url, body) {
    switch (route) {
      // ---- boot ----
      case "/api/app-info":   return Promise.resolve(jsonResp({ ok: true, app: { name: "SprinkFlow", version: "1.1.20" + (webIsAdmin() ? " · " + WEB_BUILD : ""), channel: "web", publisher: "SprinkFlow" }, license: webLicense() }));
      case "/api/app-data":   return Promise.all([kvGet("state"), kvGet("projects")]).then(function (r) { return jsonResp({ ok: true, state: r[0] || {}, projects: r[1] || [] }); });
      case "/api/app-state":  return kvSet("state", body.state || {}).then(function () { return jsonResp({ ok: true }); });
      case "/api/projects":   return kvSet("projects", body.projects || []).then(function () { return jsonResp({ ok: true }); });
      case "/api/health":     return Promise.resolve(jsonResp({ ok: true, web: true }));

      // ---- real accounts (desktop v1.1.3 policy) ----
      case "/api/license/status":    return Promise.resolve(jsonResp({ ok: true, license: webLicense() }));
      case "/api/license/sign-in":   return webSignIn(body);
      case "/api/license/refresh":   return webRefresh();
      case "/api/license/heartbeat": return webRefresh();
      case "/api/license/logout":    clearWebSession(); return Promise.resolve(jsonResp({ ok: true, license: webLicense() }));
      case "/api/license/mock-login":return Promise.resolve(jsonResp({ ok: false, error: "Mock login isn't available in the web edition - sign in with your SprinkFlow account." }));
      case "/api/admin/studio-bugs/list":   return webStudioBugsList(body);
      case "/api/admin/studio-bugs/detail": return webStudioBugsDetail(body);
      case "/api/admin/studio-bugs/update": return webStudioBugsUpdate(body);
      case "/api/admin/studio-bugs/file":   return webStudioBugsFile(url);
      case "/api/billing/checkout":  return webBilling("checkout");
      case "/api/billing/portal":    return webBilling("portal");

      // ---- catalog: static seed + IndexedDB imports, like the desktop's live catalog ----
      case "/api/catalog":    return catalogListWeb();
      case "/api/import-datasheet": return importDatasheet(body).then(jsonResp);
      case "/api/catalog/rename":   return catalogRename(body).then(jsonResp);
      case "/api/catalog/delete":   return catalogDelete(body).then(jsonResp);
      case "/api/catalog/open":     return Promise.resolve(jsonResp({ ok: true, path: body.relativePath || "" }));
      case "/api/catalog/download": return catalogDownloadWeb(body);

      // ---- PDF generation (client-side; exports need an active subscription) ----
      case "/api/generate-submittal":         return Promise.resolve(webRequireOutputs("generate a material submittal") || generateSubmittal(body).then(jsonResp));
      case "/api/generate-hydraulic-package": return Promise.resolve(webRequireOutputs("generate a hydraulic calculation package") || generateHydraulic(body).then(jsonResp));
      case "/api/merge-pdfs":                 return Promise.resolve(webRequireOutputs("merge or compress PDFs") || mergePdfs(body).then(jsonResp));
      case "/api/pdf-thumbnail":              return pdfThumbnail(body).then(jsonResp);
      case "/api/save-generated-file":        return Promise.resolve(webRequireOutputs("export this file") || saveGeneratedFile(body).then(jsonResp));

      // ---- seismic engine (the REAL Python, via Pyodide) ----
      case "/api/seismic/meta":         return seismicRoute("seismic_meta", null);
      case "/api/seismic/calc":         return seismicRoute("seismic_calc", body);
      case "/api/seismic/optimize":     return seismicRoute("seismic_optimize", body);
      case "/api/seismic/suggest":      return seismicRoute("seismic_suggest", body);
      case "/api/seismic/restraint":    return seismicRoute("seismic_restraint", body);
      case "/api/seismic/riser-screen": return seismicRoute("seismic_riser_screen", body);
      case "/api/seismic/sds-lookup":   return Promise.resolve(jsonResp({ ok: false, error: "Address -> SDS lookup needs the desktop app (the browser can't reach the USGS service). Enter SDS or Ss directly." }));
      case "/api/seismic/export":       return Promise.resolve(webRequireOutputs("export a seismic bracing calculation") || seismicExportRoute(body));
      case "/api/seismic/export-batch": return Promise.resolve(jsonResp({ ok: false, error: "Export-All (batch) is coming to the web edition — export braces one at a time for now." }));
      case "/api/seismic/export-detail-dxf": return Promise.resolve(jsonResp({ ok: false, error: "Seismic detail DXF export runs in the desktop app for now — the PDF calc sheet exports here." }));

      // ---- OS / convenience (safe no-ops) ----
      case "/api/open-output-folder":  return Promise.resolve(jsonResp({ ok: true }));
      case "/api/select-output-folder":return Promise.resolve(jsonResp({ ok: true, path: "" }));
      case "/api/recent-outputs":      return kvGet("recent").then(function (r) { return jsonResp({ ok: true, items: r || [] }); });
      case "/api/file-info":           return Promise.resolve(jsonResp({ ok: true, files: [] }));
      case "/api/clipboard-copy":      return clip(body).then(function () { return jsonResp({ ok: true }); });
      case "/api/create-email-draft":  return Promise.resolve(jsonResp({ ok: false, error: "Email drafts need the desktop app." }));

      // ---- water supply: flow test sheet PDF ----
      case "/api/water-flow-sheet":     return waterFlowSheetWeb(body);

      // ---- slip sheet (visual page editor sends a page sequence) ----
      case "/api/slip-sheet-pdf":       return slipSheetWeb(body);

      // ---- vicinity map (OSM services called straight from the browser) ----
      case "/api/vicinity/geocode":     return vicinityGeocodeWeb(body);
      case "/api/vicinity/streets":     return vicinityStreetsWeb(body);

      // ---- DWG to PDF: desktop-only (rendering + ODA DWG conversion) ----
      case "/api/dwg-pdf/pick":
      case "/api/dwg-pdf/analyze":
      case "/api/dwg-pdf/generate":
        return Promise.resolve(jsonResp({ ok: false, error: "DWG to PDF runs in the desktop app - it needs the local CAD converter. Download SprinkFlow for Windows at sprinkflow.studio." }));

      // ---- CAD block exploder (real cad_explode.py via Pyodide; DXF only) ----
      case "/api/cad-explode/analyze":  return cadxAnalyzeWeb(body);
      case "/api/cad-explode/convert":  return cadxConvertWeb(body);
      case "/api/cad-explode/pick":     return Promise.resolve(jsonResp({ ok: false, error: "The file picker is desktop-only here - drop the DXF on the drop zone instead (add its xref files too and they bind before exploding)." }));

      // ---- Flatten IFC to 2D: desktop-only. The IFC engine (ifcopenshell)
      // ships OpenCASCADE as a native library and has no Pyodide build, so
      // there is nothing to run here - say so instead of failing obscurely.
      case "/api/ifc-flatten/pick":
      case "/api/ifc-flatten/analyze":
      case "/api/ifc-flatten/convert":
      case "/api/ifc-flatten/progress":
        return Promise.resolve(jsonResp({ ok: false, error: "Flatten IFC to 2D runs in the desktop app - reading an IFC model needs the local IFC engine. Download SprinkFlow for Windows at sprinkflow.studio." }));

      // ---- PDF -> CAD (real pdf_to_cad.py in Pyodide; DXF out, no ODA here) ----
      case "/api/pdf-to-cad/analyze":   return pdfcadAnalyzeWeb(body);
      case "/api/pdf-to-cad/preview":   return pdfcadPreviewWeb(body);
      case "/api/pdf-to-cad/convert":   return pdfcadConvertWeb(body);
      case "/api/pdf-to-cad/pick":      return Promise.resolve(jsonResp({ ok: false, error: "The file picker is desktop-only here — drop the PDF on the drop zone or use Choose PDF instead." }, 400));
      // no ODA File Converter in a browser, so DWG output is off everywhere in web
      case "/api/oda-status":           return Promise.resolve(jsonResp({ ok: true, dwgCapable: false, odaUrl: "" }));

      // ---- intake classification (heuristic port of the desktop classifier - no AI) ----
      case "/api/classify-pdf-upload":  return classifyPdfWeb(body).then(jsonResp);

      // ---- plans scan (the REAL local scan via Pyodide - no AI involved) ----
      case "/api/analyze-plans":       return analyzePlansWeb(body);
      // cut-sheet import: the AI reader is desktop-only, but the import flow
      // ABORTS entirely when this endpoint errors (before the review dialog
      // ever opens). Return lightweight filename-based guesses instead - the
      // review dialog lets the user fix category/name, and the desktop's
      // heuristic path works the same way when its AI is unavailable.
      case "/api/analyze-cut-sheets":
        return Promise.resolve(jsonResp({
          ok: true,
          items: ((body.files || []).map(function (f) {
            var n = String(f.name || "").toLowerCase();
            var cat = "Miscellaneous";
            if (/sprinkler|pendent|upright|sidewall|concealed|esfr|cmsa|attic/.test(n)) cat = "Sprinklers";
            else if (/valve|check|butterfly|riser|backflow|prv|deluge|preaction/.test(n)) cat = "Valves";
            else if (/coupling|fitting|tee|elbow|grooved|flange|reducer|mechanical/.test(n)) cat = "Fittings";
            else if (/hanger|clevis|strut|rod|attachment|clamp/.test(n)) cat = "Hangers";
            else if (/brace|sway|seismic|restraint/.test(n)) cat = "Bracing";
            else if (/flex|drop|braided|hose/.test(n)) cat = "Flex Drops";
            else if (/pipe|sch|schedule|tube|cpvc|blazemaster|dyna|megaflow/.test(n)) cat = "Pipe";
            return { category: cat };
          })),
        }));

      case "/api/specs/scan":
      case "/api/identify-datasheet":
      case "/api/bid-plan-intake":
      case "/api/analyze-hydraulic-calcs":
        return Promise.resolve(jsonResp({ ok: false, error: AI_MSG }));
    }
    // catalog/pdf carries a query string
    if (route === "/api/catalog/pdf") return catalogPdf(url);
    // remaining license / update / billing chatter -> benign
    if (route.indexOf("/api/license/") === 0) return Promise.resolve(jsonResp({ ok: true, license: webLicense() }));
    if (route.indexOf("/api/updates/") === 0) return Promise.resolve(jsonResp({ ok: true, update: null }));
    if (route.indexOf("/api/billing/") === 0) return Promise.resolve(jsonResp({ ok: false, error: "Subscribe from Account -> Billing, or at sprinkflow.studio." }));
    return Promise.resolve(null);   // -> safe default {ok:true}
  }

  function clip(body) {
    try { if (body && body.text && navigator.clipboard) return navigator.clipboard.writeText(body.text).catch(function(){}); } catch (e) {}
    return Promise.resolve();
  }

  // ====================================================================
  //  catalog / import  (per-user library in IndexedDB)
  // ====================================================================
  function newId() { return "web-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36); }

  function importDatasheet(body) {
    var file = body.file || {};
    if (!file.dataUrl) return Promise.resolve({ ok: false, error: "No PDF data received." });
    var bytes = dataUrlToBytes(file.dataUrl);
    var id = newId();
    var name = file.name || "Datasheet.pdf";
    return loadPdfLib().then(function (P) {
      return P.PDFDocument.load(bytes, { ignoreEncryption: true }).then(function (d) { return d.getPageCount(); }, function () { return 1; });
    }).then(function (pages) {
      return kvSet("pdf:" + id, bytes).then(function () {
        var item = {
          id: id, source: "local", datasheetStatus: "local",
          category: body.category || "Other",
          manufacturer: "", model: body.displayName || name.replace(/\.pdf$/i, ""),
          product: body.displayName || name.replace(/\.pdf$/i, ""),
          fileName: name, relativePath: name, absolutePath: "web://" + id,
          originalFileName: name, pages: pages, subcategory: body.subcategory || "",
          aliases: body.aliases || []
        };
        return rememberImportedItem(item).then(function () {
          return { ok: true, item: item, path: "web://" + id };
        });
      });
    });
  }
  function catalogPdf(url) {
    var q = new URLSearchParams(url.split("?")[1] || "");
    var id = q.get("id");
    return kvGet("pdf:" + id).then(function (bytes) {
      if (!bytes) return jsonResp({ ok: false, error: "PDF not found in this browser." }, 404);
      return new Response(bytes, { status: 200, headers: { "Content-Type": "application/pdf" } });
    });
  }
  function catalogRename(body) {
    // metadata rename is handled in app state; just echo an updated item
    return Promise.resolve({ ok: true, item: Object.assign({}, body, {
      model: body.displayName || body.model, product: body.displayName || body.product
    }) });
  }
  function catalogDelete(body) {
    if (body && body.id) {
      return Promise.all([kvDel("pdf:" + body.id), forgetImportedItem(body.id)])
        .then(function () { return { ok: true }; });
    }
    return Promise.resolve({ ok: true });
  }

  // Imported-item metadata persists in IndexedDB so imports SURVIVE catalog
  // refreshes and reloads: /api/catalog serves seed + imports merged (the
  // desktop's live catalog does the same from disk). replacedSeeds maps a
  // seed entry to the local item that superseded it, so it stops re-listing.
  function catalogListWeb() {
    return Promise.all([kvGet("importedItems"), kvGet("replacedSeeds"),
                        orig("./data/datasheet_catalog.json?ts=" + Date.now(), { cache: "no-store" })
                          .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })])
      .then(function (res) {
        var imported = res[0] || {};
        var replaced = res[1] || {};
        var seedDoc = res[2];
        var seed = Array.isArray(seedDoc) ? seedDoc : (seedDoc.items || []);
        var items = seed.filter(function (i) { return !replaced[i.id]; });
        Object.keys(imported).forEach(function (k) { items.push(imported[k]); });
        return jsonResp({ ok: true, items: items });
      });
  }

  function rememberImportedItem(item, replacedSeedId) {
    return Promise.all([kvGet("importedItems"), kvGet("replacedSeeds")]).then(function (res) {
      var imported = res[0] || {};
      var replaced = res[1] || {};
      imported[item.id] = item;
      if (replacedSeedId) replaced[replacedSeedId] = item.id;
      return Promise.all([kvSet("importedItems", imported), kvSet("replacedSeeds", replaced)]);
    });
  }

  function forgetImportedItem(id) {
    return Promise.all([kvGet("importedItems"), kvGet("replacedSeeds")]).then(function (res) {
      var imported = res[0] || {};
      var replaced = res[1] || {};
      delete imported[id];
      Object.keys(replaced).forEach(function (seedId) { if (replaced[seedId] === id) delete replaced[seedId]; });
      return Promise.all([kvSet("importedItems", imported), kvSet("replacedSeeds", replaced)]);
    });
  }

  // "Import Datasheet" on the web: route the manufacturer download through the
  // cloud datasheet proxy (browsers can't fetch their PDFs cross-origin), then
  // store it in the local IndexedDB catalog exactly like a manual import.
  function catalogDownloadWeb(body) {
    var src = String(body.sourceUrl || "");
    var s = webSession();
    if (!src) return Promise.resolve(jsonResp({ ok: false, error: "This catalog entry has no source URL - import its PDF manually." }));
    if (!s || !s.accessToken) return Promise.resolve(jsonResp({ ok: false, error: "Sign in first to import datasheets." }));
    return orig(WEB_AUTH.apiBase + "/datasheets/fetch", {
      method: "POST",
      headers: { "Authorization": "Bearer " + s.accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ url: src }),
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var why = (j && (j.detail || j.error)) ||
            (r.status === 404 ? "The datasheet import service isn't live yet." : "Datasheet fetch failed (HTTP " + r.status + ").");
          return jsonResp({ ok: false, error: why + " Use “Open datasheet” to save the PDF, then drop it into the Material Catalog." });
        });
      }
      return r.arrayBuffer().then(function (buf) {
        var bytes = new Uint8Array(buf);
        var bin = "", CH = 0x8000;
        for (var i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
        var dataUrl = "data:application/pdf;base64," + btoa(bin);
        var name = (body.name || "Datasheet").replace(/[\\/:*?"<>|]+/g, " ").trim() + ".pdf";
        return importDatasheet({ file: { name: name, dataUrl: dataUrl },
                                 category: body.category || "Miscellaneous",
                                 displayName: body.name || "" }).then(function (res) {
          if (!res.ok) return jsonResp(res);
          if (body.manufacturer) res.item.manufacturer = body.manufacturer;
          return rememberImportedItem(res.item, body.id).then(function () {
            return jsonResp({ ok: true, item: res.item });
          });
        });
      });
    }).catch(function () {
      return jsonResp({ ok: false, error: "Could not reach the datasheet import service. Use “Open datasheet” to save the PDF, then drop it into the Material Catalog." });
    });
  }

  // pull an item's PDF bytes for merging (imported items live in IndexedDB)
  function itemBytes(item) {
    if (!item) return Promise.resolve(null);
    if (item.upload && item.upload.dataUrl) return Promise.resolve(dataUrlToBytes(item.upload.dataUrl));
    var id = item.id;
    if (item.absolutePath && item.absolutePath.indexOf("web://") === 0) id = item.absolutePath.slice(6);
    return kvGet("pdf:" + id);
  }

  // ====================================================================
  //  PDF builders (pdf-lib)
  // ====================================================================
  function hex(P, h) {
    h = String(h).replace("#", "");
    return P.rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
  }

  // shared: cover + index + merged sections + bookmarks
  function assemble(P, opts) {
    // opts: { title, subtitle, contractor, project, sections:[{title,bytes}], theme, hideContractor }
    return P.PDFDocument.create().then(function (doc) {
      doc.setTitle(safe(opts.title));
      doc.setProducer("SprinkFlow Web Edition");
      return Promise.all([
        doc.embedFont(P.StandardFonts.HelveticaBold),
        doc.embedFont(P.StandardFonts.Helvetica)
      ]).then(function (fonts) {
        var H = fonts[0], R = fonts[1];
        var th = opts.theme, header = hex(P, th.header), accent = hex(P, th.accent),
            panel = hex(P, th.panel), border = hex(P, th.border), muted = hex(P, th.muted),
            ink = P.rgb(0.1, 0.14, 0.2);

        // load sections + page plan
        var loaded = [];
        var chain = Promise.resolve();
        opts.sections.forEach(function (s) {
          chain = chain.then(function () {
            return P.PDFDocument.load(s.bytes, { ignoreEncryption: true }).then(function (src) {
              loaded.push({ title: s.title, src: src, count: src.getPageCount() });
            }, function () { /* skip unreadable */ });
          });
        });

        return chain.then(function () {
          var running = 3;   // cover=1, index=2
          loaded.forEach(function (l) { l.startPage = running; running += l.count; });

          // ---------- COVER ----------
          var c = doc.addPage([612, 792]);
          c.drawRectangle({ x: 0, y: 672, width: 612, height: 120, color: header });
          c.drawRectangle({ x: 0, y: 668, width: 612, height: 4, color: accent });
          if (!opts.hideContractor && opts.contractor) {
            var ct = opts.contractor;
            c.drawText(safe(ct.name || ""), { x: 36, y: 742, size: 20, font: H, color: P.rgb(1, 1, 1) });
            var l2 = [ct.address, ct.phone].filter(Boolean).join("   |   ");
            if (l2) c.drawText(safe(l2), { x: 36, y: 722, size: 10, font: R, color: P.rgb(0.82, 0.87, 0.92) });
            if (ct.license) c.drawText("License #" + safe(ct.license), { x: 36, y: 702, size: 10, font: R, color: P.rgb(0.82, 0.87, 0.92) });
          }
          c.drawText(safe(opts.title || "MATERIAL DATA SUBMITTAL").toUpperCase(),
            { x: 36, y: 588, size: 28, font: H, color: header });
          if (opts.subtitle) c.drawText(safe(opts.subtitle), { x: 36, y: 560, size: 13, font: R, color: accent });

          // project panel
          var py = 512;
          c.drawRectangle({ x: 36, y: 300, width: 540, height: 196, color: panel, borderColor: border, borderWidth: 1 });
          var kv = function (k, v) {
            if (!v) return;
            c.drawText(String(k).toUpperCase(), { x: 54, y: py, size: 9, font: H, color: muted });
            c.drawText(safe(v), { x: 190, y: py, size: 12, font: R, color: ink }); py -= 26;
          };
          py = 470;
          var pr = opts.project || {};
          kv("Project", pr.name);
          kv("Address", pr.address);
          kv("Date", new Date().toLocaleDateString());
          // additional cover directory (AHJ / GC / engineer / owner)
          if (pr.coverAdditionalInfoEnabled && pr.additionalInfo) {
            var ai = pr.additionalInfo;
            ["ahj", "generalContractor", "engineer", "owner"].forEach(function (role) {
              var v = ai[role]; if (!v) return;
              var label = { ahj: "AHJ", generalContractor: "Gen. Contractor", engineer: "Engineer", owner: "Owner" }[role];
              var text = typeof v === "string" ? v : (v.name || "");
              if (text) kv(label, text);
            });
          }

          // disclaimer footer
          var disc = (!opts.hideContractor && opts.contractor && opts.project &&
                      opts.project.coverDisclaimerEnabled !== false) ? (opts.contractor.disclaimer || "") : "";
          if (disc) {
            c.drawRectangle({ x: 36, y: 74, width: 540, height: 0.8, color: border });
            wrap(c, safe(disc), 36, 60, 540, 8.5, R, muted);
          }
          c.drawText("Assembled in-browser by SprinkFlow  -  no server", { x: 36, y: 26, size: 8, font: R, color: muted });

          // ---------- INDEX ----------
          var ix = doc.addPage([612, 792]);
          ix.drawRectangle({ x: 0, y: 748, width: 612, height: 44, color: header });
          ix.drawText("SUBMITTAL INDEX", { x: 36, y: 762, size: 16, font: H, color: P.rgb(1, 1, 1) });
          var iy = 712;
          ix.drawText("SECTION", { x: 36, y: iy, size: 9, font: H, color: muted });
          ix.drawText("PAGE", { x: 542, y: iy, size: 9, font: H, color: muted }); iy -= 6;
          ix.drawRectangle({ x: 36, y: iy, width: 540, height: 0.8, color: border }); iy -= 22;
          loaded.forEach(function (l, i) {
            ix.drawText(String(i + 1) + ".", { x: 36, y: iy, size: 11, font: H, color: accent });
            ix.drawText(safe(l.title), { x: 58, y: iy, size: 11, font: R, color: ink });
            ix.drawText(String(l.startPage), { x: 548, y: iy, size: 11, font: R, color: ink });
            iy -= 22;
            if (iy < 56) { iy = 740; doc.addPage([612, 792]); }
          });

          // ---------- MERGE + bookmarks ----------
          var bookmarks = [{ title: "Cover Sheet", pageIndex: 0 }, { title: "Submittal Index", pageIndex: 1 }];
          var mchain = Promise.resolve();
          loaded.forEach(function (l) {
            mchain = mchain.then(function () {
              var first = doc.getPageCount();
              return doc.copyPages(l.src, l.src.getPageIndices()).then(function (pages) {
                pages.forEach(function (p) { doc.addPage(p); });
                bookmarks.push({ title: l.title, pageIndex: first });
              });
            });
          });
          return mchain.then(function () {
            addBookmarks(P, doc, bookmarks);
            return doc.save().then(function (bytes) { return { bytes: bytes, pages: doc.getPageCount(), sections: loaded.length }; });
          });
        });
      });
    });
  }

  function wrap(page, text, x, y, maxW, size, font, color) {
    var words = String(text).split(/\s+/), line = "", yy = y;
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (font.widthOfTextAtSize(test, size) > maxW) { page.drawText(line, { x: x, y: yy, size: size, font: font, color: color }); line = words[i]; yy -= size + 3; }
      else line = test;
    }
    if (line) page.drawText(line, { x: x, y: yy, size: size, font: font, color: color });
  }

  function addBookmarks(P, doc, items) {
    var ctx = doc.context, outlinesRef = ctx.nextRef();
    var refs = items.map(function () { return ctx.nextRef(); });
    items.forEach(function (it, i) {
      var pageRef = doc.getPage(it.pageIndex).ref;
      var dict = { Title: P.PDFString.of(safe(it.title)), Parent: outlinesRef, Dest: ctx.obj([pageRef, P.PDFName.of("Fit")]) };
      if (i > 0) dict.Prev = refs[i - 1];
      if (i < items.length - 1) dict.Next = refs[i + 1];
      ctx.assign(refs[i], ctx.obj(dict));
    });
    ctx.assign(outlinesRef, ctx.obj({ Type: P.PDFName.of("Outlines"), First: refs[0], Last: refs[refs.length - 1], Count: items.length }));
    doc.catalog.set(P.PDFName.of("Outlines"), outlinesRef);
  }

  // ---- generate-submittal ----
  function generateSubmittal(body) {
    var items = body.items || [];
    if (!items.length) return Promise.resolve({ ok: false, error: "Select at least one datasheet first." });
    var project = body.project || {}, contractor = body.contractor || {};
    var theme = THEMES[project.coverTemplate] || THEMES["technical-navy"];
    return loadPdfLib().then(function (P) {
      var sections = [], skipped = [];
      var chain = Promise.resolve();
      items.forEach(function (it) {
        chain = chain.then(function () {
          return itemBytes(it).then(function (bytes) {
            if (bytes && bytes.length) sections.push({ title: it.customTitle || it.model || it.product || it.fileName || "Datasheet", bytes: bytes });
            else skipped.push(it.model || it.product || it.fileName || it.id);
          });
        });
      });
      return chain.then(function () {
        if (!sections.length) return { ok: false, error: "None of the selected sheets have a stored PDF in this browser. In the web edition, import your own datasheet PDFs (drag them into the catalog) — the bundled manufacturer links can't be fetched from the browser." };
        return assemble(P, {
          title: project.coverTitle || "Material Data Submittal",
          subtitle: project.subtitle || "Fire Sprinkler System",
          contractor: contractor, project: project, sections: sections,
          theme: theme, hideContractor: !!project.hideContractor
        }).then(function (out) {
          var fn = cleanName(project.name || "Submittal") + " - Material Data Submittal.pdf";
          download(out.bytes, fn);
          var note = skipped.length ? " (" + skipped.length + " sheet(s) skipped — no PDF stored in this browser)" : "";
          return { ok: true, path: fn, pages: out.pages, sections: out.sections, note: note };
        });
      });
    });
  }

  // ---- generate-hydraulic-package (files carry dataUrls) ----
  function generateHydraulic(body) {
    var files = body.files || [];
    if (!files.length) return Promise.resolve({ ok: false, error: "Add at least one hydraulic calc PDF." });
    var project = body.project || {}, contractor = body.contractor || {};
    var theme = THEMES[project.coverTemplate] || THEMES["technical-navy"];
    return loadPdfLib().then(function (P) {
      var sections = files.map(function (f) {
        return { title: f.label || f.name || "Calculation", bytes: dataUrlToBytes(f.dataUrl) };
      });
      return assemble(P, {
        title: project.coverTitle || "Hydraulic Calculation Package",
        subtitle: project.subtitle || "Hydraulic Calculations",
        contractor: contractor, project: project, sections: sections,
        theme: theme, hideContractor: !!project.hideContractor
      }).then(function (out) {
        var fn = cleanName(project.name || "Hydraulic") + " - Hydraulic Package.pdf";
        download(out.bytes, fn);
        return { ok: true, path: fn, pages: out.pages };
      });
    });
  }

  // ---- merge-pdfs (files carry dataUrls) ----
  function mergePdfs(body) {
    var files = body.files || [];
    if (!files.length) return Promise.resolve({ ok: false, error: "Add PDFs to merge." });
    return loadPdfLib().then(function (P) {
      return P.PDFDocument.create().then(function (doc) {
        var orig = 0, chain = Promise.resolve();
        files.forEach(function (f) {
          chain = chain.then(function () {
            var bytes = dataUrlToBytes(f.dataUrl); orig += bytes.length;
            return P.PDFDocument.load(bytes, { ignoreEncryption: true }).then(function (src) {
              return doc.copyPages(src, src.getPageIndices()).then(function (pages) {
                pages.forEach(function (p) { doc.addPage(p); });
              });
            });
          });
        });
        return chain.then(function () {
          return doc.save().then(function (bytes) {
            var fn = cleanName(body.defaultName || "merged") + ".pdf";
            download(bytes, fn);
            return { ok: true, path: fn, originalBytes: orig, outputBytes: bytes.length, engine: "pdf-lib (browser)" };
          });
        });
      });
    });
  }

  // ---- pdf-thumbnail (via the already-loaded pdf.js) ----
  // Project-intake classifier: a faithful port of the desktop's HEURISTIC
  // classify_uploaded_project_pdf (server.py) - page sizes + text regexes via
  // pdf.js, no AI involved. Keep the decision tree in sync with the desktop.
  function classifyPdfWeb(body) {
    var f = body.file || {};
    var name = f.name || "PDF";
    if (!f.dataUrl) return Promise.resolve({ ok: false, error: name + " is missing PDF data." });
    if (!window.pdfjsLib) return Promise.resolve({ ok: false, error: "The PDF reader has not loaded yet - try the drop again." });
    var bytes = dataUrlToBytes(f.dataUrl);
    return window.pdfjsLib.getDocument({ data: bytes }).promise.then(function (pdf) {
      var pageCount = pdf.numPages;
      if (!pageCount) return { ok: false, error: name + " does not contain any pages." };
      var sample = Math.min(3, pageCount);
      var sizes = [], texts = [];
      var chain = Promise.resolve();
      var loadPage = function (idx) {
        chain = chain.then(function () {
          return pdf.getPage(idx).then(function (page) {
            var vp = page.getViewport({ scale: 1 });   // pdf.js units are points (1/72 in)
            sizes.push({ width: Math.round(vp.width / 72 * 100) / 100, height: Math.round(vp.height / 72 * 100) / 100 });
            return page.getTextContent().then(function (tc) {
              texts.push(tc.items.map(function (it) { return it.str; }).join(" "));
            }, function () { texts.push(""); });
          });
        });
      };
      for (var i = 1; i <= sample; i++) loadPage(i);
      return chain.then(function () {
        var first = sizes[0];
        var maxDim = 0;
        sizes.forEach(function (s) { maxDim = Math.max(maxDim, s.width, s.height); });
        var minDim = Math.min(first.width, first.height);
        var text = texts.join("\n");
        var lowerName = name.toLowerCase();
        var hasHydraulic = /\b(HYDRAULIC\s+(?:CALC|CALCULATION|CALCULATIONS|GRAPH|SUMMARY|OVERVIEW)|REMOTE\s+AREA|DESIGN\s+AREA|REPORT\s+DESCRIPTION|MEPCAD|WATER\s+SUPPLY\s+AT\s+NODE|MOST\s+DEMANDING\s+SPRINKLER)\b/i.test(text);
        var hasPlanLang = /\b(SPRINKLER\s+LEGEND|FIRE\s+SPRINKLER\s+PLANS?|SHEET\s+NO\.?|DRAWING\s+INDEX|PROJECT\s+DESIGN\s+DATA|GENERAL\s+NOTES)\b/i.test(text);
        var fileSaysCalc = /\b(calc|calcs|calculation|hydraulic|remote\s*area|ra\d*)\b/i.test(lowerName);
        var letterish = maxDim <= 17.1 && minDim <= 11.2;
        var largeFormat = maxDim >= 18 || minDim >= 12;
        var hasSpecLang = /SECTION\s+(\d{2}\s?\d{2}\s?\d{2}|\d{5})\b/.test(text.toUpperCase())
          || /\b(PROJECT\s+MANUAL|SPECIFICATIONS?\s+TABLE\s+OF\s+CONTENTS|MASTERFORMAT)\b/i.test(text);
        var fileSaysSpec = /\b(spec|specs|specification|specifications|project\s*manual|div\s*21)\b/i.test(lowerName);

        var kind = "plans";
        var reason = "Large-format or plan-like PDF.";
        if (largeFormat) {
          kind = "plans"; reason = "Detected a large-format plan sheet.";
        } else if (letterish && (hasSpecLang || (fileSaysSpec && pageCount >= 3)) && !hasHydraulic) {
          kind = "specs"; reason = "Detected a project specification document.";
        } else if (hasPlanLang && !fileSaysCalc) {
          kind = "plans"; reason = "Detected plan-sheet language.";
        } else if (hasHydraulic) {
          kind = "hydraulic"; reason = "Detected hydraulic calculation language.";
        } else if (letterish && fileSaysCalc) {
          kind = "hydraulic"; reason = "Detected a letter-size calc-named PDF.";
        } else if (letterish && !hasPlanLang && pageCount > 1) {
          kind = "hydraulic"; reason = "Detected a letter-size multi-page PDF, likely hydraulic calculations.";
        } else if (hasPlanLang) {
          kind = "plans";
        }
        return { ok: true, kind: kind, reason: reason, name: name, pageCount: pageCount,
                 pageSizes: sizes, hasText: !!text.trim() };
      });
    }, function () { return { ok: false, error: name + " could not be read as a PDF." }; });
  }

  function pdfThumbnail(body) {
    var f = body.file || {};
    if (!f.dataUrl || !window.pdfjsLib) return Promise.resolve({ ok: false, error: "No preview available." });
    var bytes = dataUrlToBytes(f.dataUrl);
    return window.pdfjsLib.getDocument({ data: bytes }).promise.then(function (pdf) {
      return pdf.getPage(1).then(function (page) {
        var vp = page.getViewport({ scale: 1 });
        var scale = 240 / vp.width, v = page.getViewport({ scale: scale });
        var cv = document.createElement("canvas"); cv.width = v.width; cv.height = v.height;
        return page.render({ canvasContext: cv.getContext("2d"), viewport: v }).promise.then(function () {
          return { ok: true, thumbnailDataUrl: cv.toDataURL("image/png"), pageCount: pdf.numPages };
        });
      });
    }).catch(function () { return { ok: false, error: "Could not render preview." }; });
  }

  // ---- water flow test sheet (port of server.py build_water_flow_sheet_pdf) ----
  // reportlab's platypus flowables have no pdf-lib equivalent, so this lays the
  // same document out manually: title, paired key/value blocks, dark section
  // bars, the hydrant table, result tiles, safety margins, and the chart image.
  function waterFlowSheetWeb(body) {
    var blocked = webRequireOutputs("generate a flow test sheet");
    if (blocked) return Promise.resolve(blocked);
    return loadPdfLib().then(function (P) {
      return P.PDFDocument.create().then(function (doc) {
        var title = safe(body.title || "HYDRANT FLOW TEST REPORT");
        doc.setTitle(title);
        doc.setProducer("SprinkFlow Web Edition");
        return Promise.all([
          doc.embedFont(P.StandardFonts.HelveticaBold),
          doc.embedFont(P.StandardFonts.Helvetica),
          doc.embedFont(P.StandardFonts.HelveticaOblique),
        ]).then(function (fonts) {
          var H = fonts[0], R = fonts[1], I = fonts[2];
          var ink = hex(P, "#111111"), muted = hex(P, "#444444"), line = hex(P, "#bbbbbb");
          var page = doc.addPage([612, 792]);
          var L = 43, RIGHT = 569, W = RIGHT - L;   // 0.6in margins, letter portrait
          var y = 792 - 40;

          function newPageIfNeeded(need) {
            if (y - need > 46) return;
            page = doc.addPage([612, 792]);
            y = 792 - 40;
          }
          function textAt(str, x, yy, size, font, color) {
            page.drawText(safe(str), { x: x, y: yy, size: size, font: font || R, color: color || ink });
          }
          function fit(str, size, font, maxW) {
            str = safe(str);
            while (str.length > 1 && font.widthOfTextAtSize(str, size) > maxW) str = str.slice(0, -1);
            return str;
          }
          function sectionBar(label) {
            newPageIfNeeded(30);
            page.drawRectangle({ x: L, y: y - 14, width: W, height: 16, color: ink });
            textAt(String(label).toUpperCase(), L + 6, y - 10, 8.5, H, P.rgb(1, 1, 1));
            y -= 24;
          }
          // paired key/value block (site info | pressure info), side by side
          function kvColumn(rows, x, colW, startY) {
            var yy = startY, keyW = colW * 0.44;
            (rows || []).forEach(function (row) {
              var k = safe((row || [])[0]), v = safe((row || [])[1]);
              page.drawText(fit(k, 8, H, keyW - 4), { x: x, y: yy, size: 8, font: H, color: muted });
              page.drawText(fit(v, 9, R, colW - keyW - 4), { x: x + keyW, y: yy, size: 9, font: R, color: ink });
              yy -= 14;
            });
            return yy;
          }
          function table(header, rows, widths, startY) {
            var yy = startY;
            page.drawRectangle({ x: L, y: yy - 12, width: W, height: 15, color: hex(P, "#eeeeee") });
            var x = L;
            (header || []).forEach(function (h, i) {
              page.drawText(fit(h, 7.5, H, widths[i] - 4), { x: x + 3, y: yy - 8, size: 7.5, font: H, color: ink });
              x += widths[i];
            });
            yy -= 18;
            (rows || []).forEach(function (row) {
              if (yy < 60) { page = doc.addPage([612, 792]); yy = 792 - 50; }
              var cx = L;
              (row || []).forEach(function (cell, i) {
                page.drawText(fit(cell, 8, R, widths[i] - 4), { x: cx + 3, y: yy, size: 8, font: R, color: ink });
                cx += widths[i];
              });
              page.drawLine({ start: { x: L, y: yy - 4 }, end: { x: RIGHT, y: yy - 4 }, thickness: 0.4, color: line });
              yy -= 14;
            });
            return yy;
          }

          // --- title block ---
          textAt(title, L, y, 17, H, ink);
          y -= 18;
          if (body.subtitle) { textAt(body.subtitle, L, y, 10, R, muted); y -= 14; }
          page.drawLine({ start: { x: L, y: y }, end: { x: RIGHT, y: y }, thickness: 1.4, color: ink });
          y -= 16;

          // --- site + pressure, two columns ---
          var half = W / 2;
          var endA = kvColumn(body.siteRows, L, half - 8, y);
          var endB = kvColumn(body.pressureRows, L + half, half - 8, y);
          y = Math.min(endA, endB) - 6;

          // --- flow hydrants ---
          sectionBar("Flow Hydrants");
          var hHeader = body.hydrantHeader || ["Hydrant", "Pitot", "Outlets", "Dia", "Coeff", "Flow", "Location"];
          var hFrac = [0.14, 0.11, 0.11, 0.09, 0.10, 0.13, 0.32];
          var hWidths = hFrac.map(function (f) { return W * f; });
          while (hWidths.length < hHeader.length) hWidths.push(W / hHeader.length);
          y = table(hHeader, body.hydrantRows, hWidths, y) - 6;

          // --- results tiles ---
          var tiles = body.resultTiles || [];
          if (tiles.length) {
            sectionBar("Results");
            newPageIfNeeded(46);
            var cols = Math.min(tiles.length, 4);
            var tw = W / cols;
            tiles.forEach(function (tile, i) {
              var col = i % cols;
              var rowTop = y - Math.floor(i / cols) * 40;
              var tx = L + col * tw;
              page.drawRectangle({ x: tx, y: rowTop - 32, width: tw, height: 36, borderColor: ink, borderWidth: 0.8 });
              page.drawText(fit(safe((tile || [])[0]).toUpperCase(), 7, H, tw - 8), { x: tx + 5, y: rowTop - 8, size: 7, font: H, color: muted });
              page.drawText(fit(safe((tile || [])[1]), 12, H, tw - 8), { x: tx + 5, y: rowTop - 25, size: 12, font: H, color: ink });
            });
            y -= Math.ceil(tiles.length / cols) * 40 + 8;
          }

          // --- safety margins ---
          var demandRows = body.demandRows || [];
          if (demandRows.length) {
            sectionBar("Safety Margins");
            var dHeader = body.demandHeader || ["Demand", "Required", "Available", "Safety Margin", "Margin %"];
            var dWidths = dHeader.map(function (_, i) { return i === 0 ? W * 0.32 : W * 0.17; });
            y = table(dHeader, demandRows, dWidths, y) - 4;
          }

          var note = safe(body.disclaimer || "").trim();
          if (note) {
            newPageIfNeeded(30);
            // wrap the note across the full width
            var words = note.split(/\s+/), lineText = "";
            words.forEach(function (word) {
              var attempt = lineText ? lineText + " " + word : word;
              if (I.widthOfTextAtSize(attempt, 8.5) > W) {
                textAt(lineText, L, y, 8.5, I, hex(P, "#333333")); y -= 11; lineText = word;
              } else { lineText = attempt; }
            });
            if (lineText) { textAt(lineText, L, y, 8.5, I, hex(P, "#333333")); y -= 11; }
            y -= 4;
          }

          // --- chart image ---
          var chart = body.chartPng || "";
          var chartStep = Promise.resolve();
          if (chart) {
            var b64 = chart.indexOf(",") >= 0 ? chart.slice(chart.indexOf(",") + 1) : chart;
            chartStep = doc.embedPng(dataUrlToBytes("data:image/png;base64," + b64)).then(function (png) {
              var scale = Math.min(W / png.width, 1);
              var h = png.height * scale;
              if (y - h < 60) { page = doc.addPage([612, 792]); y = 792 - 50; }
              page.drawImage(png, { x: L, y: y - h, width: png.width * scale, height: h });
              y -= h + 8;
            }).catch(function () { /* a bad chart must not kill the sheet */ });
          }

          return chartStep.then(function () {
            var by = safe(body.performedBy || "").trim();
            page.drawText("Generated by SprinkFlow" + (by ? "  -  Performed by " + by : ""),
              { x: L, y: 30, size: 8, font: R, color: muted });
            return doc.save();
          }).then(function (bytes) {
            var name = cleanName(body.defaultName || "Flow Test Sheet");
            if (!/\.pdf$/i.test(name)) name = name.replace(/\.[A-Za-z0-9]{1,5}$/, "") + ".pdf";
            download(bytes, name, "application/pdf");
            return jsonResp({ ok: true, path: name, bytes: bytes.length });
          });
        });
      });
    }).catch(function (e) {
      return jsonResp({ ok: false, error: (e && e.message) || "Could not build the flow test sheet." });
    });
  }

  // ---- slip sheet: assemble the editor's page sequence with pdf-lib ----
  function slipSheetWeb(body) {
    var blocked = webRequireOutputs("create a slip sheet PDF");
    if (blocked) return Promise.resolve(blocked);
    var sequence = (body && body.sequence) || [];
    if (!sequence.length) return Promise.resolve(jsonResp({ ok: false, error: "Place at least one slip-in page first." }));
    return loadPdfLib().then(function (P) {
      function loadDoc(payload, label) {
        var b64 = String((payload || {}).dataUrl || "").split(",")[1];
        if (!b64) return Promise.reject(new Error(label + " is missing PDF data."));
        return P.PDFDocument.load(dataUrlToBytes("data:application/pdf;base64," + b64), { ignoreEncryption: true });
      }
      var slips = body.slips || [];
      return Promise.all([
        P.PDFDocument.create(),
        loadDoc(body.base, "The base PDF"),
        Promise.all(slips.map(function (s, i) { return loadDoc(s, "Slip-in PDF " + (i + 1)); })),
      ]).then(function (loaded) {
        var out = loaded[0], base = loaded[1], slipDocs = loaded[2];
        out.setProducer("SprinkFlow Web Edition");
        var baseUsed = 0;
        var chain = Promise.resolve();
        sequence.forEach(function (step) {
          chain = chain.then(function () {
            var src = (step || {}).src;
            var page = Number((step || {}).page || 0);
            var doc = src === "base" ? base : slipDocs[Number(src)];
            if (!doc) throw new Error("A slip-in page references a PDF that wasn't uploaded.");
            if (page < 1 || page > doc.getPageCount()) throw new Error("Page " + page + " is out of range.");
            if (src === "base") baseUsed += 1;
            return out.copyPages(doc, [page - 1]).then(function (pages) { out.addPage(pages[0]); });
          });
        });
        return chain.then(function () { return out.save(); }).then(function (bytes) {
          var name = cleanName(body.defaultName || "slip sheet.pdf");
          if (!/\.pdf$/i.test(name)) name += ".pdf";
          download(bytes, name, "application/pdf");
          var baseCount = base.getPageCount();
          var replaced = baseCount - baseUsed;
          var inserted = sequence.length - baseUsed - replaced;
          return jsonResp({
            ok: true, path: name, pageCount: sequence.length,
            message: "Replaced " + replaced + " page" + (replaced === 1 ? "" : "s") + ", inserted " + inserted +
                     " page" + (inserted === 1 ? "" : "s") + ". " + baseCount + " pages in, " + sequence.length + " out.",
          });
        });
      });
    }).catch(function (e) {
      return jsonResp({ ok: false, error: (e && e.message) || "Could not build the slip sheet PDF." });
    });
  }

  // ---- save-generated-file -> browser download ----
  function saveGeneratedFile(body) {
    try {
      var content = body.content || "";
      var name = cleanName(body.defaultName || "export");
      var bytes;
      if (body.encoding === "base64") bytes = dataUrlToBytes("data:application/octet-stream;base64," + content);
      else bytes = new TextEncoder().encode(content);
      download(bytes, name, "application/octet-stream");
      return Promise.resolve({ ok: true, path: name });
    } catch (e) { return Promise.resolve({ ok: false, error: e.message }); }
  }

  // ---- small "web edition" badge (doubles as a busy indicator) -----------
  var _badgeEl = null;
  function ensureBadge() {
    if (_badgeEl || !document.body) return;
    _badgeEl = document.createElement("div");
    _badgeEl.style.cssText = "position:fixed;right:10px;bottom:10px;z-index:99999;background:#17313a;color:#cfe6ec;" +
      "font:600 11px system-ui,sans-serif;padding:5px 10px;border-radius:8px;opacity:.9;cursor:pointer;" +
      "box-shadow:0 2px 8px rgba(0,0,0,.25);max-width:290px";
    _badgeEl.title = "Everything runs in your browser. Click to hide.";
    _badgeEl.onclick = function () { if (_badgeEl) { _badgeEl.remove(); _badgeEl = null; } };
    document.body.appendChild(_badgeEl);
  }
  function setBadge(busyText) {
    ensureBadge(); if (!_badgeEl) return;
    _badgeEl.textContent = busyText ? ("⏳ " + busyText) : "🌐 Web Edition — running with no server";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setBadge(null); });
  else setBadge(null);
})();

(function () {
  const styleId = "shortcut-device-preview-styles";

  function injectStyles() {
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes spBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
      @keyframes spLift { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
      .sp-device { color: var(--ink, #181612); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Avenir Next", sans-serif; }
      .sp-phone { position: relative; width: min(100%, var(--sp-phone-width, 320px)); aspect-ratio: var(--sp-phone-aspect, .49); margin: 0 auto; padding: 8px; border-radius: 48px; background: #181612; box-shadow: 0 30px 60px -22px rgba(47,34,17,.34), inset 0 0 0 4px #2a2620; }
      .sp-phone-screen { position: relative; height: 100%; overflow: hidden; border-radius: 40px; background: #fbf8f1; padding-top: 44px; }
      .sp-phone-notch { position: absolute; z-index: 5; top: 12px; left: 50%; width: 96px; height: 25px; border-radius: 999px; background: #0e0c09; transform: translateX(-50%); }
      .sp-phone-status { position: absolute; z-index: 6; top: 16px; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 28px; font-size: 12px; font-weight: 700; }
      .sp-phone-bars { display: inline-flex; gap: 2px; align-items: end; }
      .sp-phone-bars span { display: block; width: 3px; border-radius: 2px; background: currentColor; }
      .sp-phone-bars span:nth-child(1) { height: 5px; } .sp-phone-bars span:nth-child(2) { height: 7px; } .sp-phone-bars span:nth-child(3) { height: 9px; }
      .sp-phone-head { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid rgba(24,22,18,.08); }
      .sp-avatar { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; background: var(--accent, #9c5c21); color: var(--paper, #fbf8f1); font-size: 11px; font-weight: 800; }
      .sp-phone-name { flex: 1; font-size: 14px; font-weight: 700; }
      .sp-phone-now { color: #8b8578; font-size: 11px; }
      .sp-chat { display: flex; flex-direction: column; gap: 10px; min-height: 128px; padding: 14px 16px; }
      .sp-bubble { max-width: 82%; padding: 9px 14px; border-radius: 18px; font-size: 14px; line-height: 1.35; }
      .sp-bubble-in { align-self: flex-start; background: #ece7da; }
      .sp-bubble-out { align-self: flex-end; background: var(--accent, #9c5c21); color: var(--paper, #fbf8f1); white-space: pre-line; animation: spLift 260ms ease-out; }
      .sp-composer { display: flex; align-items: center; gap: 8px; margin: auto 12px 6px; padding: 6px; }
      .sp-composer-field { flex: 1; min-height: 32px; display: flex; align-items: center; padding: 0 14px; border: 1px solid rgba(24,22,18,.18); border-radius: 999px; background: #fff; color: var(--accent, #9c5c21); font: 700 13px "SF Mono", Menlo, Consolas, monospace; }
      .sp-caret { display: inline-block; width: 2px; height: 16px; margin-left: 1px; background: currentColor; animation: spBlink 1s steps(1,end) infinite; }
      .sp-send { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; background: var(--accent, #9c5c21); color: #fff; font-weight: 800; }
      .sp-suggestions { display: grid; grid-template-columns: .8fr 1.5fr .8fr; gap: 6px; padding: 6px 8px; background: #ebe5d8; opacity: 0; transform: translateY(8px); transition: opacity 180ms ease, transform 180ms ease; }
      .sp-suggestions.is-visible { opacity: 1; transform: none; }
      .sp-chip { overflow: hidden; padding: 8px 7px; border-radius: 9px; background: rgba(255,255,255,.68); color: #6f695e; font-size: 11px; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
      .sp-chip-active { color: var(--ink, #181612); font-weight: 700; }
      .sp-keyboard { display: grid; gap: 6px; padding: 8px 8px 13px; background: #d8d2c6; }
      .sp-kb-row { display: flex; justify-content: center; gap: 4px; }
      .sp-key, .sp-key-wide, .sp-key-space { display: grid; place-items: center; min-width: 0; height: 28px; border-radius: 6px; background: #fbf8f1; color: #3d3a35; font-size: 11px; box-shadow: 0 1px 0 rgba(0,0,0,.18); }
      .sp-key { flex: 1; } .sp-key-wide { width: 34px; } .sp-key-space { flex: 1.8; }
      .sp-homebar { position: absolute; bottom: 5px; left: 50%; width: 90px; height: 4px; border-radius: 999px; background: rgba(24,22,18,.36); transform: translateX(-50%); }
      .sp-ipad { position: relative; width: min(100%, var(--sp-ipad-width, 480px)); aspect-ratio: 1.35; margin: 0 auto; padding: 10px; border-radius: 34px; background: #181612; box-shadow: 0 30px 60px -22px rgba(47,34,17,.34), inset 0 0 0 3px #2a2620; }
      .sp-ipad-camera { position: absolute; z-index: 4; top: 50%; right: 4px; width: 5px; height: 5px; border-radius: 999px; background: #0e0c09; transform: translateY(-50%); }
      .sp-ipad-screen { position: relative; height: 100%; overflow: hidden; border-radius: 24px; background: #fbf8f1; }
      .sp-ipad-status { display: flex; justify-content: space-between; align-items: center; padding: 10px 18px 8px; color: #181612; font-size: 12px; font-weight: 700; }
      .sp-ipad-app { display: grid; grid-template-columns: 150px 1fr; height: calc(100% - 34px); border-top: 1px solid rgba(24,22,18,.08); }
      .sp-ipad-sidebar { border-right: 1px solid rgba(24,22,18,.08); background: #f1ebdf; padding: 12px; }
      .sp-ipad-sidebar-title { margin-bottom: 12px; font-size: 13px; font-weight: 800; }
      .sp-ipad-thread { display: grid; gap: 8px; padding: 10px; border-radius: 12px; background: rgba(255,255,255,.7); }
      .sp-ipad-thread span:first-child { font-size: 12px; font-weight: 800; }
      .sp-ipad-thread span:last-child { overflow: hidden; color: #6f695e; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
      .sp-ipad-chat { display: flex; flex-direction: column; min-width: 0; }
      .sp-ipad-head { display: flex; align-items: center; gap: 10px; min-height: 42px; padding: 8px 14px; border-bottom: 1px solid rgba(24,22,18,.08); }
      .sp-ipad-name { flex: 1; font-size: 14px; font-weight: 800; }
      .sp-ipad-body { display: flex; flex: 1; flex-direction: column; gap: 10px; padding: 14px 16px 0; }
      .sp-ipad-composer { display: flex; align-items: center; gap: 8px; margin-top: auto; padding: 8px 0 10px; }
      .sp-ipad-field { flex: 1; min-height: 30px; display: flex; align-items: center; padding: 0 12px; border: 1px solid rgba(24,22,18,.18); border-radius: 999px; background: #fff; color: var(--accent, #9c5c21); font: 700 12px "SF Mono", Menlo, Consolas, monospace; }
      .sp-ipad-keyboard { display: grid; gap: 5px; padding: 7px 10px 10px; background: #d8d2c6; }
      .sp-ipad-key { display: grid; place-items: center; height: 24px; border-radius: 6px; background: #fbf8f1; color: #3d3a35; font-size: 10px; box-shadow: 0 1px 0 rgba(0,0,0,.18); flex: 1; }
      .sp-ipad-key-wide { flex: 1.35; }
      .sp-ipad-key-space { flex: 4; }
      .sp-mac { width: min(100%, 500px); margin: 0 auto; overflow: hidden; border: 1px solid rgba(24,22,18,.18); border-radius: 14px; background: #fbf8f1; box-shadow: 0 30px 60px -22px rgba(47,34,17,.28); }
      .sp-mac-titlebar { display: flex; align-items: center; gap: 7px; padding: 10px 12px; border-bottom: 1px solid rgba(24,22,18,.1); background: linear-gradient(180deg,#efe9dc,#e6dfce); }
      .sp-mac-dot { width: 11px; height: 11px; border-radius: 999px; }
      .sp-mac-title { margin-left: 10px; color: #3d3a35; font-size: 12px; font-weight: 700; }
      .sp-mac-toolbar { display: flex; gap: 10px; align-items: center; padding: 8px 14px; border-bottom: 1px solid rgba(24,22,18,.06); color: #5b554c; font-size: 13px; }
      .sp-mac-send { margin-left: auto; padding: 4px 12px; border-radius: 7px; background: #3a82f6; color: #fff; font-size: 11px; font-weight: 700; }
      .sp-mac-headers { padding: 12px 16px 8px; border-bottom: 1px solid rgba(24,22,18,.06); font-size: 13px; }
      .sp-mac-row { display: flex; gap: 10px; padding: 3px 0; }
      .sp-mac-label { width: 60px; color: #8b8578; }
      .sp-mac-body { position: relative; min-height: 150px; padding: 16px 18px 34px; font-size: 14.5px; line-height: 1.6; }
      .sp-trigger-inline { padding: 1px 5px; border-radius: 4px; background: rgba(156,92,33,.1); color: var(--accent, #9c5c21); font: 700 13px "SF Mono", Menlo, Consolas, monospace; }
      .sp-popover { position: absolute; top: 44px; left: 18px; max-width: calc(100% - 36px); min-width: min(320px, calc(100% - 36px)); padding: 8px 10px; border: 1px solid rgba(24,22,18,.18); border-radius: 8px; background: #fbf8f1; box-shadow: 0 12px 30px rgba(47,34,17,.18); animation: spLift 180ms ease-out; }
      .sp-popover-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; font-weight: 600; }
      .sp-return { padding: 1px 6px; border: 1px solid rgba(24,22,18,.18); border-radius: 4px; color: #8b8578; font: 11px "SF Mono", Menlo, monospace; }
      .sp-popover-hint { margin-top: 4px; color: #8b8578; font-size: 11px; }
      @media (prefers-reduced-motion: reduce) { .sp-caret, .sp-bubble-out, .sp-popover { animation: none; } .sp-suggestions { transition: none; } }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function truncate(value, max) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}...` : text;
  }

  function startLoop(el, render) {
    if (el._spPreviewTimer) {
      window.clearInterval(el._spPreviewTimer);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phases = reduced ? ["expanded"] : ["typing", "suggest", "expanded", "hold"];
    let index = 0;

    function tick() {
      render(phases[index]);
      index = (index + 1) % phases.length;
    }

    tick();
    if (!reduced) {
      el._spPreviewTimer = window.setInterval(tick, 1200);
    }
  }

  function renderIphonePreview(el, options = {}) {
    if (!el) return;
    injectStyles();
    if (Number.isFinite(Number(options.width))) {
      el.style.setProperty("--sp-phone-width", `${Number(options.width)}px`);
    }
    const trigger = options.trigger || ">home";
    const expansion = options.expansion || "123 Main Street, Apt 4B, Brooklyn, NY 11201";
    const initials = options.initials || "JL";
    const name = options.name || "Jordan";
    const inbound = options.inbound || "What's the address again?";
    const typed = escapeHtml(trigger);
    const escapedExpansion = escapeHtml(expansion);

    startLoop(el, (phase) => {
      const showSuggest = phase === "suggest";
      const showExpanded = phase === "expanded" || phase === "hold";
      el.innerHTML = `
        <div class="sp-device sp-phone">
          <div class="sp-phone-notch"></div>
          <div class="sp-phone-status"><span>9:41</span><span class="sp-phone-bars"><span></span><span></span><span></span></span></div>
          <div class="sp-phone-screen">
            <div class="sp-phone-head"><div class="sp-avatar">${escapeHtml(initials)}</div><div class="sp-phone-name">${escapeHtml(name)}</div><div class="sp-phone-now">now</div></div>
            <div class="sp-chat">
              <div class="sp-bubble sp-bubble-in">${escapeHtml(inbound)}</div>
              ${showExpanded ? `<div class="sp-bubble sp-bubble-out">${escapedExpansion.replaceAll("\n", "<br>")}</div>` : ""}
            </div>
            <div class="sp-composer"><div class="sp-composer-field">${showExpanded ? "" : typed}<span class="sp-caret"></span></div><div class="sp-send">↑</div></div>
            <div class="sp-suggestions ${showSuggest ? "is-visible" : ""}">
              <div class="sp-chip">"${typed}"</div>
              <div class="sp-chip sp-chip-active">${escapeHtml(truncate(expansion, 30))}</div>
              <div class="sp-chip">${escapeHtml(trigger.replace(/^./, ""))}</div>
            </div>
            <div class="sp-keyboard">
              <div class="sp-kb-row">${"qwertyuiop".split("").map((k) => `<span class="sp-key">${k}</span>`).join("")}</div>
              <div class="sp-kb-row">${"asdfghjkl".split("").map((k) => `<span class="sp-key">${k}</span>`).join("")}</div>
              <div class="sp-kb-row"><span class="sp-key-wide">shift</span>${"zxcvbnm".split("").map((k) => `<span class="sp-key">${k}</span>`).join("")}<span class="sp-key-wide">del</span></div>
              <div class="sp-kb-row"><span class="sp-key-wide">123</span><span class="sp-key-space">space</span><span class="sp-key-wide">return</span></div>
            </div>
            <div class="sp-homebar"></div>
          </div>
        </div>
      `;
    });
  }

  function renderMacPreview(el, options = {}) {
    if (!el) return;
    injectStyles();
    const trigger = options.trigger || ">home";
    const expansion = options.expansion || "123 Main Street, Apt 4B, Brooklyn, NY 11201";
    const prefix = "Sure, send it to ";

    startLoop(el, (phase) => {
      const showSuggest = phase === "suggest";
      const showExpanded = phase === "expanded" || phase === "hold";
      el.innerHTML = `
        <div class="sp-device sp-mac">
          <div class="sp-mac-titlebar">
            <span class="sp-mac-dot" style="background:#e06c5f"></span>
            <span class="sp-mac-dot" style="background:#e8c25b"></span>
            <span class="sp-mac-dot" style="background:#7fb877"></span>
            <span class="sp-mac-title">New Message</span>
          </div>
          <div class="sp-mac-toolbar"><span>Reply</span><span>Attach</span><span>A</span><span class="sp-mac-send">Send</span></div>
          <div class="sp-mac-headers">
            <div class="sp-mac-row"><span class="sp-mac-label">To:</span><span>you@example.com</span></div>
            <div class="sp-mac-row"><span class="sp-mac-label">Subject:</span><span>Shortcut Pack</span></div>
          </div>
          <div class="sp-mac-body">
            ${showExpanded
              ? `${escapeHtml(prefix)}<span>${escapeHtml(expansion)}</span>.`
              : `${escapeHtml(prefix)}<span class="sp-trigger-inline">${escapeHtml(trigger)}</span><span class="sp-caret"></span>`}
            ${showSuggest ? `
              <div class="sp-popover">
                <div class="sp-popover-row"><span>${escapeHtml(truncate(expansion, 58))}</span><span class="sp-return">return</span></div>
                <div class="sp-popover-hint">Press space or return to accept</div>
              </div>
            ` : ""}
          </div>
        </div>
      `;
    });
  }

  function renderIpadPreview(el, options = {}) {
    if (!el) return;
    injectStyles();
    if (Number.isFinite(Number(options.width))) {
      el.style.setProperty("--sp-ipad-width", `${Number(options.width)}px`);
    }
    const trigger = options.trigger || ">home";
    const expansion = options.expansion || "123 Main Street, Apt 4B, Brooklyn, NY 11201";
    const initials = options.initials || "JL";
    const name = options.name || "Jordan";
    const inbound = options.inbound || "What's the address again?";
    const typed = escapeHtml(trigger);
    const escapedExpansion = escapeHtml(expansion);

    startLoop(el, (phase) => {
      const showSuggest = phase === "suggest";
      const showExpanded = phase === "expanded" || phase === "hold";
      el.innerHTML = `
        <div class="sp-device sp-ipad">
          <div class="sp-ipad-camera"></div>
          <div class="sp-ipad-screen">
            <div class="sp-ipad-status"><span>9:41</span><span class="sp-phone-bars"><span></span><span></span><span></span></span></div>
            <div class="sp-ipad-app">
              <aside class="sp-ipad-sidebar">
                <div class="sp-ipad-sidebar-title">Messages</div>
                <div class="sp-ipad-thread"><span>${escapeHtml(name)}</span><span>${escapeHtml(inbound)}</span></div>
              </aside>
              <section class="sp-ipad-chat">
                <div class="sp-ipad-head"><div class="sp-avatar">${escapeHtml(initials)}</div><div class="sp-ipad-name">${escapeHtml(name)}</div><div class="sp-phone-now">now</div></div>
                <div class="sp-ipad-body">
                  <div class="sp-bubble sp-bubble-in">${escapeHtml(inbound)}</div>
                  ${showExpanded ? `<div class="sp-bubble sp-bubble-out">${escapedExpansion.replaceAll("\n", "<br>")}</div>` : ""}
                  <div class="sp-ipad-composer"><div class="sp-ipad-field">${showExpanded ? "" : typed}<span class="sp-caret"></span></div><div class="sp-send">↑</div></div>
                  <div class="sp-suggestions ${showSuggest ? "is-visible" : ""}">
                    <div class="sp-chip">"${typed}"</div>
                    <div class="sp-chip sp-chip-active">${escapeHtml(truncate(expansion, 30))}</div>
                    <div class="sp-chip">${escapeHtml(trigger.replace(/^./, ""))}</div>
                  </div>
                  <div class="sp-ipad-keyboard">
                    <div class="sp-kb-row">${"qwertyuiop".split("").map((k) => `<span class="sp-ipad-key">${k}</span>`).join("")}</div>
                    <div class="sp-kb-row">${"asdfghjkl".split("").map((k) => `<span class="sp-ipad-key">${k}</span>`).join("")}</div>
                    <div class="sp-kb-row"><span class="sp-ipad-key sp-ipad-key-wide">shift</span>${"zxcvbnm".split("").map((k) => `<span class="sp-ipad-key">${k}</span>`).join("")}<span class="sp-ipad-key sp-ipad-key-wide">del</span></div>
                    <div class="sp-kb-row"><span class="sp-ipad-key sp-ipad-key-wide">123</span><span class="sp-ipad-key sp-ipad-key-space">space</span><span class="sp-ipad-key sp-ipad-key-wide">return</span></div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      `;
    });
  }

  window.ShortcutDevicePreviews = {
    renderIpadPreview,
    renderIphonePreview,
    renderMacPreview,
  };
})();

(() => {
  const KEY = "learn:" + (window.SLUG || "course");
  const NS = "http://www.w3.org/2000/svg";
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const content = $("#main");
  const topicsEl = $(".topics");
  const subEl = $(".subtopics");
  const crumb = $("#crumb");
  const LANG = window.LANG || "";
  const MAN = window.MANIFEST || [];
  $(".logo__mark").textContent = (LANG.trim()[0] || "L").toUpperCase();

  // ---- state (all storage access in try/catch)
  let S = { done: [], last: "", scroll: {} };
  try {
    const j = JSON.parse(localStorage.getItem(KEY));
    if (j && typeof j === "object") S = { done: j.done || [], last: j.last || "", scroll: j.scroll || {} };
  } catch {}
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
  };
  const isDone = (s) => S.done.includes(s);
  const setDone = (s, on) => {
    S.done = S.done.filter((x) => x !== s);
    if (on) S.done.push(s);
    save();
  };

  // ---- DOM helpers (data only ever via textContent)
  const h = (t, c, x, ...k) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    e.append(...k);
    return e;
  };
  const svg = (inner, cls) => {
    const s = document.createElementNS(NS, "svg"); // inner is static markup, never data
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    s.innerHTML = inner;
    return s;
  };
  const CHECK = '<path d="M5 12l5 5 9-10"/>';
  const CROSS = '<path d="M6 6l12 12M18 6 6 18"/>';
  const ICONS = {
    "": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    tip: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    important: '<path d="M12 2l3 6.5 7 .9-5.1 4.8 1.3 7L12 17.8 5.8 21.2l1.3-7L2 9.4l7-.9z"/>',
  };
  const note = (v, label, ...kids) =>
    h("div", "note" + (v ? " note--" + v : ""), null, svg(ICONS[v], "note__icon"), h("div", "note__body", null, h("span", "note__label", label), ...kids));
  const paras = (t) => String(t || "").split(/\n\s*\n/).filter((x) => x.trim()).map((x) => h("p", null, x.trim()));

  // ---- theme (bound once; restore is inline in <head>)
  const themeBtn = $(".theme-btn");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  const MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  const syncTheme = () => {
    themeBtn.replaceChildren(svg(isDark() ? SUN : MOON));
    themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
  };
  syncTheme();
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
    syncTheme();
  });

  const LN = { python: "Python", bash: "Bash", powershell: "PowerShell", toml: "TOML", yaml: "YAML", docker: "Dockerfile", ini: "INI", json: "JSON", text: "Text" };
  // ---- drawer (bound once)
  const menuBtn = $(".menu-btn");
  const isNavOpen = () => document.body.classList.contains("nav-open");
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close topics" : "Open topics");
  };
  menuBtn.addEventListener("click", () => setNav(!isNavOpen()));
  topicsEl.addEventListener("click", (e) => e.target.closest("a") && setNav(false));
  document.addEventListener("click", (e) => {
    if (isNavOpen() && !e.target.closest(".sidebar--left, .menu-btn")) { setNav(false); menuBtn.focus(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isNavOpen()) { setNav(false); menuBtn.focus(); }
  });

  // ---- progress + active sub-topic (global listeners, query live DOM)
  const bars = document.querySelectorAll(".progress__bar, .toc-progress__fill");
  const pctText = $(".toc-progress__pct");
  const progress = $(".progress");
  const updateProgress = () => {
    const max = root.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(scrollY / max, 1) : 0;
    bars.forEach((b) => (b.style.transform = `scaleX(${pct})`));
    const n = Math.round(pct * 100);
    progress.setAttribute("aria-valuenow", n);
    pctText.textContent = `${n}%`;
  };
  const updateActive = () => {
    const links = [...subEl.querySelectorAll("a")];
    let i = 0;
    links.forEach((a, idx) => {
      const t = document.getElementById(a.getAttribute("href").slice(1));
      if (t && t.getBoundingClientRect().top < innerHeight / 3) i = idx;
    });
    links.forEach((a, idx) => a.classList.toggle("is-active", idx === i));
  };
  let restoring = false, timer, cur = "";
  const saveScroll = () => {
    if (!cur || cur === "home" || restoring) return;
    S.scroll[cur] = Math.round(scrollY);
    save();
  };
  addEventListener("scroll", () => {
    updateProgress();
    updateActive();
    clearTimeout(timer);
    timer = setTimeout(saveScroll, 300);
  }, { passive: true });
  addEventListener("resize", updateProgress);
  addEventListener("pagehide", saveScroll);

  // ---- content behaviors, re-bound per render
  const COPY = '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
  const setBtn = (btn, inner, txt) => btn.replaceChildren(svg(inner), txt);
  const bind = () => {
    content.querySelectorAll(".copy-btn").forEach((btn) => {
      setBtn(btn, COPY, "Copy");
      btn.addEventListener("click", async () => {
        const code = btn.closest(".codeblock").querySelector("code").cloneNode(true);
        code.querySelectorAll(".line-numbers-rows, .line-highlight").forEach((n) => n.remove());
        try {
          await navigator.clipboard.writeText(code.textContent.replace(/\n$/, ""));
          setBtn(btn, CHECK, "Copied");
        } catch {
          btn.textContent = "Failed";
        }
        btn.classList.add("is-copied");
        setTimeout(() => { setBtn(btn, COPY, "Copy"); btn.classList.remove("is-copied"); }, 1500);
      });
    });
    content.querySelectorAll(":is(h2, h3)[id]").forEach((x) => {
      const a = h("a", "anchor", "#");
      a.href = `#${x.id}`;
      a.setAttribute("aria-label", `Link to ${x.firstChild.textContent}`);
      x.append(a);
    });
  };

  // ---- data
  let topics = [], bySlug = {}, failed = [];
  const nav = (cur) => {
    topicsEl.replaceChildren(...topics.map((t) => {
      const a = h("a", null, t.title);
      a.href = `#${t.id}`;
      if (t.id === cur) a.setAttribute("aria-current", "page");
      if (isDone(t.id)) a.append(svg(CHECK, "done-mark"));
      return h("li", null, null, a);
    }));
  };

  const topicView = (t, i) => {
    const out = [];
    out.push(h("span", "eyebrow", `Topic ${t.order} · ${t.version}`), h("h1", null, t.title));
    if (isDone(t.id)) out[1].append(svg(CHECK, "title-done"));
    out.push(h("p", "lead", t.summary));
    if ((t.prerequisites || []).length) {
      out.push(h("ul", "meta", null, h("li", null, null, h("strong", null, "Prerequisites")),
        ...t.prerequisites.map((p) => {
          const a = h("a", null, bySlug[p] ? bySlug[p].title : p);
          a.href = `#${p}`;
          return h("li", null, null, a);
        })));
    }
    const subs = [];
    (t.subtopics || []).forEach((s) => {
      const id = `${t.id}--${s.id}`;
      subs.push([id, s.title]);
      out.push(h("h2", null, s.title));
      out[out.length - 1].id = id;
      out.push(...paras(s.explanation));
      if (s.analogy) out.push(note("tip", "Real-life analogy", ...paras(s.analogy)));
      (s.code || []).forEach((c, n) => {
        const src = String(c.source || "").replace(/\n$/, "");
        const pre = h("pre", src.split("\n").length >= 5 ? "line-numbers" : null, null, h("code", "language-" + c.language, src));
        const cb = h("figure", "codeblock", null,
          h("div", "codeblock__bar", null,
            h("span", "codeblock__dots", null, h("i"), h("i"), h("i")),
            h("span", "codeblock__tab", c.filename), h("span", "codeblock__lang", LN[c.language] || c.language),
            Object.assign(h("button", "copy-btn"), { type: "button" })), pre);
        cb.querySelector(".codeblock__dots").setAttribute("aria-hidden", "true");
        out.push(h("div", "example", null,
          h("div", "example__head", null, h("span", "example__label", `Example ${n + 1}`), h("span", "example__title", c.filename)),
          h("div", "example__body", null, ...paras(c.explanation), cb),
          ...(c.output ? [h("div", "example__output", c.output)] : [])));
      });
      if (s.productionNote) out.push(note("important", "In production", ...paras(s.productionNote)));
      if ((s.commonMistakes || []).length) out.push(note("warning", "Common mistakes", h("ul", null, null, ...s.commonMistakes.map((m) => h("li", null, m)))));
      const srcs = (s.sources || []).filter((x) => x && String(x.url).startsWith("https://"));
      if (srcs.length) {
        out.push(h("ul", "meta", null, h("li", null, null, h("strong", null, "Sources")), ...srcs.map((x) => {
          const a = h("a", null, x.title);
          a.href = x.url; a.target = "_blank"; a.rel = "noopener";
          return h("li", null, null, a);
        })));
      }
    });
    if ((t.quiz || []).length) {
      subs.push([`${t.id}--quiz`, "Quiz"]);
      out.push(h("h2", null, "Quiz"));
      out[out.length - 1].id = `${t.id}--quiz`;
      t.quiz.forEach((q, qi) => {
        const box = h("div", "quiz__opts");
        const opts = q.options.map((o, oi) => {
          const b = h("button", "quiz__opt", null, h("span", null, o));
          b.type = "button";
          b.addEventListener("click", () => {
            opts.forEach((x, xi) => {
              x.disabled = true;
              if (xi === q.answerIndex) { x.classList.add("is-right"); x.append(svg(CHECK)); }
              else if (xi === oi) { x.classList.add("is-wrong"); x.append(svg(CROSS)); }
            });
            box.after(note("", "Explanation", h("p", null, q.explanation)));
          });
          return b;
        });
        box.append(...opts);
        out.push(h("p", "quiz__q", `${qi + 1}. ${q.question}`), box);
      });
    }
    const btn = h("button", "btn", null);
    btn.type = "button";
    const sync = () => {
      btn.setAttribute("aria-pressed", isDone(t.id));
      btn.replaceChildren(...(isDone(t.id) ? [svg(CHECK), "Completed"] : ["Mark as complete"]));
    };
    sync();
    btn.addEventListener("click", () => { setDone(t.id, !isDone(t.id)); sync(); nav(t.id); });
    out.push(btn);
    const pager = h("nav", "pager");
    pager.setAttribute("aria-label", "Topic navigation");
    const link = (x, cls, lbl) => {
      const a = h("a", cls, null, h("small", null, lbl), h("strong", null, x.title));
      a.href = `#${x.id}`;
      return a;
    };
    if (topics[i - 1]) pager.append(link(topics[i - 1], "", "Previous"));
    if (topics[i + 1]) {
      const n = link(topics[i + 1], "next", "Next");
      n.addEventListener("click", () => { setDone(t.id, true); });
      pager.append(n);
    }
    out.push(pager);
    return [out, subs];
  };

  const homeView = () => {
    const first = topics.find((t) => !isDone(t.id)) || topics[0];
    const last = bySlug[S.last];
    const done = MAN.filter(isDone).length;
    const out = [h("span", "eyebrow", LANG), h("h1", null, `Learn ${LANG}`),
      h("p", "lead", `${done}/${MAN.length} topics complete`)];
    const pager = h("nav", "pager");
    if (last) {
      const a = h("a", null, null, h("small", null, "Continue"), h("strong", null, last.title));
      a.href = `#${last.id}`;
      pager.append(a);
    }
    if (first) {
      const a = h("a", "next", null, h("small", null, "Start"), h("strong", null, topics[0].title));
      a.href = `#${topics[0].id}`;
      pager.append(a);
    }
    out.push(pager);
    return out;
  };

  const show = (slug, restore, anchor) => {
    const i = topics.findIndex((t) => t.id === slug);
    const t = topics[i];
    cur = t ? slug : "home";
    const warn = failed.length
      ? [note("warning", "Some topics failed to load", h("ul", null, null, ...failed.map((f) => h("li", null, `data/${f}.js`))))]
      : [];
    let subs = [], body;
    if (t) {
      [body, subs] = topicView(t, i);
      S.last = slug;
      save();
    } else body = homeView();
    content.replaceChildren(...warn, ...body);
    subEl.replaceChildren(...subs.map(([id, title]) => {
      const a = h("a", null, title);
      a.href = `#${id}`;
      return h("li", null, null, a);
    }));
    crumb.replaceChildren(LANG + " / ", h("b", null, t ? t.title : "Home"));
    document.title = (t ? t.title + " · " : "") + "Learn " + LANG;
    nav(t ? slug : "");
    setNav(false);
    bind();
    const place = () => {
      const el = anchor && document.getElementById(anchor);
      if (el) el.scrollIntoView();
      else scrollTo(0, restore ? S.scroll[slug] || 0 : 0);
      updateProgress();
      updateActive();
    };
    restoring = true;
    try {
      if (window.Prism) Prism.highlightAllUnder(content);
    } catch {}
    place();
    setTimeout(() => { place(); restoring = false; }, 400);
  };

  const route = () => {
    const hash = location.hash.slice(1);
    const [slug, sub] = hash.split("--");
    const unknown = hash && slug !== "home" && !bySlug[slug] && !MAN.includes(slug); // e.g. skip link #main
    if (unknown && cur) return;
    if (!hash || unknown) {
      const t = S.last && bySlug[S.last] ? S.last : S.last ? (topics.find((x) => !isDone(x.id)) || topics[0] || {}).id : (topics[0] || {}).id;
      if (!t) return show("home");
      history.replaceState(null, "", "#" + t);
      return show(t, true);
    }
    if (sub && slug === cur) return; // same page: native anchor jump
    show(slug, false, sub ? hash : null);
  };

  // ---- load data files
  let pending = MAN.length;
  const finish = () => {
    topics = (window.TOPICS || []).slice().sort((a, b) => a.order - b.order);
    topics.forEach((t) => (bySlug[t.id] = t));
    failed = MAN.filter((s) => !bySlug[s]);
    addEventListener("hashchange", route);
    route();
  };
  if (!pending) finish();
  MAN.forEach((slug) => {
    const s = document.createElement("script");
    s.src = `data/${slug}.js`;
    s.onload = s.onerror = () => --pending || finish();
    document.head.append(s);
  });
})();

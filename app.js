// Mirpur Computer — public site script
const DEFAULT_SECTIONS = ["hero", "services", "how", "cta"].map(id => ({ id, on: true }));
let SERVICES = [], CFG = {}, posts = [], LIST = [], ME = null, cur = { type: "feed" };
const T = {
 en: { tHome: "Home", tServices: "Services", tPosts: "Posts", tAccount: "Account", eyebrow: "Mirpur · Dhaka", tagline: "Digital Services & Computer Solutions", lead: "Government and identity applications, Windows and software setup, and IT support — with updates on WhatsApp.", explore: "Explore Services", chat: "Chat on WhatsApp", howTitle: "How it works", s1t: "Message us", s1d: "Pick a service and chat on WhatsApp.", s2t: "We confirm", s2d: "We tell you the documents, price and time needed.", s3t: "We process", s3d: "We do the work and keep you updated.", s4t: "You receive", s4d: "Collect your completed documents.", ctaT: "Need help right now?", ctaD: "Message us on WhatsApp and we will reply as soon as possible.", like: "Like", views: "views", send: "Comment", write: "Write a comment…", nonum: "WhatsApp number is not configured yet.", hi: "Hi Mirpur Computer, ", gen: "I need help. Please guide me.", empty: "Nothing here yet.", fail: "Something went wrong. Try again.",
  loginT: "Log in", regT: "Create account", forgotT: "Forgot password?", fIdent: "Mobile number or username", fUser: "Username (shown publicly)", fPhone: "Mobile number (kept private)", fPass: "Password", fName: "Display name", fBio: "Bio", fCur: "Current password", fNew: "New password", fCode: "One-time code from Mirpur Computer",
  bLogin: "Log in", bReg: "Sign up", bSave: "Save", bLogout: "Log out", bForgot: "Request reset", bReset: "Set new password", bPost: "Post", bPhoto: "📷 Photo", bEdit: "Edit", bDel: "Delete", bCancel: "Cancel", bAppeal: "Send appeal", vPublic: "🌐 Public", vPrivate: "🔒 Only me",
  privNote: "Your mobile number is private. Only your username and display name are shown publicly.", forgotNote: "Send a request. Our team will verify you on WhatsApp and give you a one-time code to set a new password.", needLogin: "Log in to like, comment or post.", whatMind: "What's on your mind?", sure: "Delete this?", appealT: "Your account is restricted. You can send an appeal:", appealPh: "Explain why your account should be restored", sent: "Sent ✓", saved: "Saved ✓", joined: "Joined", myProfile: "View my public profile", pwChanged: "Password changed. You can log in now.", edited: "edited", changePw: "Change password", photoT: "Profile photo (auto-compressed)" },
 bn: { tHome: "হোম", tServices: "সেবা", tPosts: "পোস্ট", tAccount: "অ্যাকাউন্ট", eyebrow: "মিরপুর · ঢাকা", tagline: "ডিজিটাল সেবা ও কম্পিউটার সমাধান", lead: "সরকারি ও পরিচয়সংক্রান্ত আবেদন, উইন্ডোজ ও সফটওয়্যার সেটআপ এবং আইটি সাপোর্ট — হোয়াটসঅ্যাপে আপডেটসহ।", explore: "সেবাগুলো দেখুন", chat: "হোয়াটসঅ্যাপে চ্যাট", howTitle: "কীভাবে কাজ করে", s1t: "বার্তা পাঠান", s1d: "সেবা বেছে হোয়াটসঅ্যাপে চ্যাট করুন।", s2t: "আমরা নিশ্চিত করি", s2d: "প্রয়োজনীয় কাগজ, খরচ ও সময় জানাই।", s3t: "আমরা কাজ করি", s3d: "কাজ সম্পন্ন করি ও আপডেট দিই।", s4t: "আপনি পান", s4d: "সম্পন্ন কাগজপত্র বুঝে নিন।", ctaT: "এখনই সাহায্য দরকার?", ctaD: "হোয়াটসঅ্যাপে বার্তা দিন, আমরা যত দ্রুত সম্ভব উত্তর দেব।", like: "লাইক", views: "ভিউ", send: "মন্তব্য", write: "মন্তব্য লিখুন…", nonum: "হোয়াটসঅ্যাপ নম্বর এখনও সেট করা হয়নি।", hi: "হ্যালো মিরপুর কম্পিউটার, ", gen: "আমার সাহায্য দরকার।", empty: "এখনও কিছু নেই।", fail: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", bLogin: "লগইন", bReg: "সাইন আপ", bLogout: "লগআউট", bPost: "পোস্ট", bSave: "সংরক্ষণ", needLogin: "লাইক, মন্তব্য বা পোস্ট করতে লগইন করুন।", whatMind: "আপনি কী ভাবছেন?", vPublic: "🌐 সবার জন্য", vPrivate: "🔒 শুধু আমি" }
};
let L = "en"; try { L = localStorage.getItem("mc-lang") || "en"; } catch (e) {}
const $ = s => document.querySelector(s), t = k => (T[L] && T[L][k]) || T.en[k] || k;
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
async function api(path, method = "GET", body) {
  const r = await fetch("/api" + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || t("fail")); return d;
}
// Shrinks a photo in the browser to a small JPEG (typically 50-200 KB) before upload
function compress(file, maxDim, target) {
  return new Promise((ok, no) => {
    const img = new Image();
    img.onload = () => {
      let k = Math.min(1, maxDim / Math.max(img.width, img.height)), q = .8; const c = document.createElement("canvas");
      const draw = () => { c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k)); const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); };
      draw(); let d = c.toDataURL("image/jpeg", q);
      while (d.length * .75 > target && (q > .4 || k > .3)) { if (q > .4) q -= .1; else { k *= .8; draw(); } d = c.toDataURL("image/jpeg", q); }
      URL.revokeObjectURL(img.src); ok(d);
    };
    img.onerror = () => no(new Error("Could not read that image")); img.src = URL.createObjectURL(file);
  });
}
function openWA(k) {
  const num = (CFG.whatsapp || "").replace(/\D/g, ""); if (!num) return alert(t("nonum"));
  const s = SERVICES.find(x => x.k === k);
  window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(t("hi") + (s && s.msg ? s.msg : t("gen"))), "_blank", "noopener");
}
// ----- scroll-reveal animation -----
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .1 }) : null;
function reveal() {
  if (!io) return;
  document.querySelectorAll("#blocks .card, #blocks h2, #blocks .hero > *, #grid .card, #posts h2").forEach((e, i) => {
    e.classList.add("rv"); e.style.transitionDelay = (i % 6) * 70 + "ms";
    e.addEventListener("transitionend", () => { e.style.transitionDelay = ""; }, { once: true }); io.observe(e);
  });
}
// ----- homepage blocks (order & visibility come from the admin panel) -----
function fillGrid(g) {
  g.replaceChildren();
  SERVICES.forEach(s => {
    const c = el("article", "card"), a = el("a", "btn wa", t("chat")); a.href = "#"; a.dataset.wa = s.k;
    const im = s.image ? Object.assign(el("img", "simg"), { src: s.image, alt: "", loading: "lazy" }) : el("div", "ico", s.ic);
    c.append(im, el("h3", "", s[L][0]), el("p", "", s[L][1]), ...(s.price ? [el("strong", "", s.price)] : []), a); g.append(c);
  });
}
const BLOCKS = {
  hero() {
    const s = el("div", "blk hero");
    s.innerHTML = '<p class="eyebrow" data-i="eyebrow"></p><h1><span class="grad"></span><br><span data-i="tagline"></span></h1><p class="lead" data-i="lead"></p><div class="cta"><a class="btn primary" href="#services" data-i="explore"></a><a class="btn wa" href="#" data-wa="" data-i="chat"></a></div>';
    return s;
  },
  services() { const s = el("div", "blk"), g = el("div", "grid"); s.append(el("h2", "", t("tServices")), g); fillGrid(g); return s; },
  how() {
    const s = el("div", "blk"), g = el("div", "grid"); s.append(el("h2", "", t("howTitle")), g);
    [1, 2, 3, 4].forEach(n => { const c = el("article", "card"); c.append(el("span", "num", n), el("h3", "", t("s" + n + "t")), el("p", "", t("s" + n + "d"))); g.append(c); });
    return s;
  },
  cta() {
    const s = el("div", "blk cta-box"), a = el("a", "btn wa", t("chat")); a.href = "#"; a.dataset.wa = "";
    s.append(el("h2", "", t("ctaT")), el("p", "", t("ctaD")), a); return s;
  }
};
function updateTab() { $("#acctLbl").textContent = ME ? ME.displayName.slice(0, 12) : t("tAccount"); }
function renderStatic() {
  document.documentElement.lang = L;
  $("#blocks").replaceChildren(...(CFG.sections || DEFAULT_SECTIONS).filter(x => x.on && BLOCKS[x.id]).map(x => BLOCKS[x.id]()));
  document.querySelectorAll("[data-i]").forEach(e => e.textContent = t(e.dataset.i));
  const g = $(".grad"); if (g) g.textContent = CFG.title || "Mirpur Computer";
  const ld = $("#blocks [data-i=lead]"); if (ld && CFG.lead) ld.textContent = CFG.lead;
  $("#lang").textContent = L === "en" ? "বাংলা" : "English";
  fillGrid($("#grid")); updateTab(); reveal();
}
// ----- small form builder -----
function form(fields, submit, onSubmit) {
  const f = el("form"), inputs = {};
  fields.forEach(([name, label, type, extra]) => {
    const l = el("label", "", label), i = type === "textarea" ? el("textarea") : el("input"); if (type !== "textarea") i.type = type || "text";
    Object.assign(i, extra || {}); l.append(i); f.append(l); inputs[name] = i;
  });
  const b = el("button", "btn primary", submit), er = el("div", "err"); f.append(b, er);
  f.onsubmit = async e => { e.preventDefault(); er.textContent = ""; er.style.color = ""; try { await onSubmit(Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value])), er); } catch (x) { er.textContent = x.message; } };
  return f;
}
function avatar(src, name, big) {
  const d = el("span", "av" + (big ? " big" : "")); if (src) { const i = el("img"); i.src = src; i.alt = ""; d.append(i); } else d.textContent = (name || "?").slice(0, 1).toUpperCase(); return d;
}
async function loadMe() { try { ME = (await api("/me")).me; } catch (e) { ME = null; } updateTab(); }
function afterAuth() { updateTab(); location.hash = "#posts"; }
// ----- account page -----
function renderAccount() {
  const box = $("#account"); box.replaceChildren(el("h2", "", t("tAccount")));
  const card = (title, ...kids) => { const c = el("div", "card"); c.append(el("h3", "", title), ...kids); box.append(c); };
  if (!ME) {
    card(t("loginT"), form([["identifier", t("fIdent"), "text", { maxLength: 40, autocomplete: "username" }], ["password", t("fPass"), "password", { maxLength: 128, autocomplete: "current-password" }]], t("bLogin"), async v => { ME = (await api("/auth/login", "POST", v)).me; afterAuth(); }));
    card(t("regT"), el("p", "meta", t("privNote")), form([["username", t("fUser"), "text", { maxLength: 20, autocomplete: "off" }], ["phone", t("fPhone"), "tel", { maxLength: 16, placeholder: "01XXXXXXXXX" }], ["displayName", t("fName"), "text", { maxLength: 40 }], ["password", t("fPass"), "password", { maxLength: 128, autocomplete: "new-password" }]], t("bReg"), async v => { ME = (await api("/auth/register", "POST", v)).me; afterAuth(); }));
    card(t("forgotT"), el("p", "meta", t("forgotNote")),
      form([["phone", t("fPhone"), "tel", { maxLength: 16 }]], t("bForgot"), async (v, er) => { const r = await api("/auth/forgot", "POST", v); er.style.color = "inherit"; er.textContent = r.message; }),
      form([["phone", t("fPhone"), "tel", { maxLength: 16 }], ["code", t("fCode"), "text", { maxLength: 12, autocomplete: "off" }], ["password", t("fNew"), "password", { maxLength: 128, autocomplete: "new-password" }]], t("bReset"), async (v, er) => { await api("/auth/reset", "POST", v); er.style.color = "inherit"; er.textContent = t("pwChanged"); }));
    return;
  }
  const head = el("div", "phead"), nm = el("div", "nm"), pl = el("a", "", t("myProfile")); pl.href = "#profile/" + ME.username;
  nm.append(el("strong", "", ME.displayName), el("span", "meta", "@" + ME.username), pl); head.append(avatar(ME.avatar, ME.displayName, true), nm);
  const lo = el("button", "", t("bLogout")); lo.type = "button"; lo.onclick = async () => { await api("/auth/logout", "POST"); ME = null; updateTab(); renderAccount(); };
  card(ME.displayName, head, el("p", "meta", t("privNote")), lo);
  if (ME.status !== "active") {
    const c = el("div", "card warn"); c.append(el("h3", "", "⚠ " + ME.status.toUpperCase()), el("p", "", ME.statusReason || ""), el("p", "meta", t("appealT")),
      form([["text", t("appealPh"), "textarea", { rows: 3, maxLength: 1000 }]], t("bAppeal"), async (v, er) => { await api("/me/appeal", "POST", v); er.style.color = "inherit"; er.textContent = t("sent"); })); box.append(c);
    return;
  }
  const f = el("input"); f.type = "file"; f.accept = "image/*";
  f.onchange = async () => { if (!f.files[0]) return; try { await api("/me/avatar", "POST", { data: await compress(f.files[0], 400, 60000) }); await loadMe(); renderAccount(); } catch (e) { alert(e.message); } };
  const fl = el("label", "", t("photoT")); fl.append(f);
  card(t("bEdit"), fl, form([["displayName", t("fName"), "text", { value: ME.displayName, maxLength: 40 }], ["bio", t("fBio"), "textarea", { value: ME.bio, maxLength: 300, rows: 3 }]], t("bSave"), async (v, er) => { ME = (await api("/me/profile", "PATCH", v)).me; updateTab(); er.style.color = "inherit"; er.textContent = t("saved"); }));
  card(t("changePw"), form([["current", t("fCur"), "password", { maxLength: 128, autocomplete: "current-password" }], ["password", t("fNew"), "password", { maxLength: 128, autocomplete: "new-password" }]], t("bSave"), async (v, er) => { await api("/me/password", "POST", v); er.style.color = "inherit"; er.textContent = t("pwChanged"); }));
}
// ----- posts -----
function postCard(p) {
  const c = el("article", "card"); c.dataset.id = p.id;
  const head = el("div", "phead"), nm = el("div", "nm");
  const who = p.author.username ? Object.assign(el("a", "who", p.author.name), { href: "#profile/" + p.author.username }) : el("span", "who", p.author.name + " ✓");
  nm.append(who, el("span", "meta", new Date(p.createdAt).toLocaleString(L === "bn" ? "bn-BD" : "en-GB") + (p.editedAt ? " · " + t("edited") : "") + (p.visibility === "private" ? " · 🔒" : "")));
  head.append(avatar(p.author.avatar, p.author.name), nm); c.append(head);
  if (p.text) c.append(el("div", "post-text", p.text));
  if (p.image) { const im = el("img", "pimg"); im.src = p.image; im.alt = ""; im.loading = "lazy"; c.append(im); }
  const acts = el("div", "acts"), lk = el("button", "", "👍 " + t("like") + " · " + p.likes);
  lk.type = "button"; lk.setAttribute("aria-pressed", p.liked); lk.dataset.act = "like";
  acts.append(lk, el("span", "meta", "💬 " + p.comments.length + " · 👁 " + p.views + " " + t("views")));
  if (p.mine) [["edit", t("bEdit")], ["del", t("bDel")]].forEach(([a, l]) => { const b = el("button", "", l); b.type = "button"; b.dataset.act = a; acts.append(b); });
  c.append(acts);
  p.comments.forEach(m => {
    const d = el("div", "cm"), n = m.username ? Object.assign(el("a", "who", m.name), { href: "#profile/" + m.username }) : el("b", "", m.name);
    d.append(n, document.createTextNode(" "), el("span", "", m.text));
    if (m.mine || p.mine) { const x = el("button", "", "✕"); x.type = "button"; x.dataset.act = "cdel"; x.dataset.cid = m.id; x.setAttribute("aria-label", t("bDel")); d.append(x); }
    c.append(d);
  });
  if (ME && ME.status === "active") {
    const f = el("form"), x = el("input"), b = el("button", "btn", t("send")), er = el("div", "err");
    x.placeholder = t("write"); x.maxLength = 500; x.required = true; f.dataset.act = "comment"; f.append(x, b, er); c.append(f);
  } else { const a = el("a", "meta", t("needLogin")); a.href = "#account"; c.append(a); }
  return c;
}
function renderList(box, arr) {
  const a = document.activeElement;
  if (box.contains(a) && (a.tagName === "INPUT" || a.tagName === "TEXTAREA") && a.value) return; // don't wipe typing
  box.replaceChildren(...(arr.length ? arr.map(postCard) : [el("p", "meta", t("empty"))]));
}
function renderComposer() {
  const b = $("#composer"); b.replaceChildren();
  if (!ME) { const a = el("a", "", t("needLogin")); a.href = "#account"; b.append(a); return; }
  if (ME.status !== "active") { b.hidden = true; return; } b.hidden = false;
  const ta = el("textarea"), pv = el("img", "pimg"), file = el("input"), ph = el("button", "", t("bPhoto")), vis = el("select"), go = el("button", "btn primary", t("bPost")), er = el("span", "err"), row = el("div", "acts");
  ta.rows = 3; ta.maxLength = 2000; ta.placeholder = t("whatMind"); pv.hidden = true; file.type = "file"; file.accept = "image/*"; file.hidden = true; ph.type = go.type = "button";
  [["public", t("vPublic")], ["private", t("vPrivate")]].forEach(([v, l]) => vis.add(new Option(l, v)));
  let img = ""; ph.onclick = () => file.click();
  file.onchange = async () => { if (!file.files[0]) return; try { img = await compress(file.files[0], 1280, 200000); pv.src = img; pv.hidden = false; } catch (e) { er.textContent = e.message; } };
  go.onclick = async () => { er.textContent = ""; try { await api("/posts", "POST", { text: ta.value, image: img, visibility: vis.value }); ta.value = ""; img = ""; pv.hidden = true; file.value = ""; await loadPosts(false); } catch (e) { er.textContent = e.message; } };
  row.append(ph, vis, go, er); b.append(ta, pv, file, row);
}
function merge(u) { const i = posts.findIndex(p => p.id === u.id); if (i >= 0) posts[i] = u; }
async function loadPosts(countViews) {
  try {
    cur = { type: "feed" }; posts = await api("/posts"); LIST = posts; renderList($("#feed"), posts);
    if (countViews) { for (const p of posts) { try { merge(await api(`/posts/${p.id}/view`, "POST")); } catch (e) {} } LIST = posts; renderList($("#feed"), posts); }
  } catch (e) {}
}
async function showProfile(name) {
  cur = { type: "profile", name }; const box = $("#profile");
  try {
    const d = await api("/users/" + encodeURIComponent(name)), h = el("div", "card phd"), info = el("div"), list = el("div");
    info.append(el("h2", "", d.user.displayName), el("div", "meta", "@" + d.user.username + " · " + t("joined") + " " + new Date(d.user.createdAt).toLocaleDateString()), el("p", "", d.user.bio || ""));
    h.append(avatar(d.user.avatar, d.user.displayName, true), info); box.replaceChildren(h, list); LIST = d.posts; renderList(list, d.posts);
  } catch (e) { box.replaceChildren(el("p", "err", e.message)); }
}
const refreshCurrent = () => cur.type === "profile" ? showProfile(cur.name) : loadPosts(false);
function editPost(card, p) {
  const ta = el("textarea"), vis = el("select"), ok = el("button", "btn primary", t("bSave")), no = el("button", "", t("bCancel")), er = el("span", "err"), row = el("div", "acts");
  ta.value = p.text; ta.rows = 3; ta.maxLength = 2000; ok.type = no.type = "button";
  [["public", t("vPublic")], ["private", t("vPrivate")]].forEach(([v, l]) => vis.add(new Option(l, v))); vis.value = p.visibility;
  row.append(vis, ok, no, er); card.replaceChildren(ta, row); ta.focus();
  no.onclick = () => refreshCurrent();
  ok.onclick = async () => { try { await api("/posts/" + p.id, "PATCH", { text: ta.value, visibility: vis.value }); await refreshCurrent(); } catch (e) { er.textContent = e.message; } };
}
document.addEventListener("click", async e => {
  const w = e.target.closest("[data-wa]"); if (w) { e.preventDefault(); return openWA(w.dataset.wa); }
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const card = b.closest("[data-id]"), id = card && card.dataset.id, p = LIST.find(x => x.id === id);
  try {
    if (b.dataset.act === "like") { await api(`/posts/${id}/like`, "POST"); await refreshCurrent(); }
    else if (b.dataset.act === "del") { if (confirm(t("sure"))) { await api("/posts/" + id, "DELETE"); await refreshCurrent(); } }
    else if (b.dataset.act === "edit" && p) editPost(card, p);
    else if (b.dataset.act === "cdel") { await api(`/posts/${id}/comments/${b.dataset.cid}`, "DELETE"); await refreshCurrent(); }
  } catch (er) { alert(er.message); }
});
document.addEventListener("submit", async e => {
  const f = e.target; if (f.dataset.act !== "comment") return; e.preventDefault();
  const x = f.querySelector("input"), er = f.querySelector(".err");
  try { await api(`/posts/${f.closest("[data-id]").dataset.id}/comments`, "POST", { text: x.value }); x.value = ""; await refreshCurrent(); } catch (err) { er.textContent = err.message; }
});
$("#lang").onclick = () => { L = L === "en" ? "bn" : "en"; try { localStorage.setItem("mc-lang", L); } catch (e) {} renderStatic(); renderComposer(); route(); };
function route() {
  const [h0, arg] = (location.hash || "#home").slice(1).split("/"), id = ["home", "services", "posts", "account", "profile"].includes(h0) ? h0 : "home", tab = id === "profile" ? "posts" : id;
  document.querySelectorAll("[data-view]").forEach(s => { s.classList.toggle("on", s.id === id); s.hidden = s.id !== id; });
  document.querySelectorAll("[data-tab]").forEach(a => { a.classList.toggle("on", a.dataset.tab === tab); a.toggleAttribute("aria-current", a.dataset.tab === tab); });
  if (id === "posts") { renderComposer(); loadPosts(true); }
  else if (id === "account") renderAccount();
  else if (id === "profile") showProfile(decodeURIComponent(arg || ""));
}
window.addEventListener("hashchange", route);
setInterval(() => { if (!document.hidden && !$("#posts").hidden) loadPosts(false); }, 15000);
$("#y").textContent = new Date().getFullYear();
Promise.all([loadMe(), fetch("/api/site").then(r => r.json()).then(d => {
  CFG = d.settings;
  SERVICES = d.services.map(x => ({ k: x.id, ic: x.icon, image: x.image, price: x.price, msg: x.msg, en: [x.titleEn, x.descEn], bn: [x.titleBn || x.titleEn, x.descBn || x.descEn] }));
}).catch(() => {})]).finally(() => { renderStatic(); route(); });

const $ = s => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
async function call(url, m = 'GET', b) {
  const r = await fetch(url, { method: m, headers: { 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined });
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Error'); return d;
}
const api = (p, m, b) => call('/api/admin' + p, m, b);
let services = [], image = '', editId = '';
function show(on, settings) {
  $('#login').hidden = on; $('#panel').hidden = !on; $('#out').hidden = !on;
  if (on) { if (settings) { $('#stitle').value = settings.title; $('#swa').value = settings.whatsapp; $('#slead').value = settings.lead; secs = settings.sections; renderSecs(); } load(); }
}
async function load() { services = await api('/services'); list(); loadPeople(); }
function list() {
  const box = $('#list'); box.replaceChildren();
  services.forEach((s, i) => {
    const r = el('div', 'item' + (s.active ? '' : ' off')); r.draggable = true; r.dataset.id = s.id;
    r.append(el('span', 'handle', '⠿'), s.image ? Object.assign(el('img'), { src: s.image, alt: '' }) : el('span', '', s.icon), el('span', 'grow', s.titleEn + (s.price ? ' — ' + s.price : '') + (s.active ? '' : ' (hidden)')));
    const mk = (txt, fn) => { const b = el('button', '', txt); b.type = 'button'; b.onclick = fn; return b; };
    r.append(mk('↑', () => move(s.id, -1)), mk('↓', () => move(s.id, 1)), mk('Edit', () => edit(s)), mk('Delete', async () => { if (confirm('Delete "' + s.titleEn + '"?')) { await api('/services/' + s.id, 'DELETE'); load(); } }));
    box.append(r);
  });
}
async function move(id, dir) { services = await api('/services/' + id + '/move', 'POST', { dir }); list(); }
function setImg(u) { image = u; $('#prev').hidden = $('#rmImg').hidden = !u; if (u) $('#prev').src = u; }
function edit(s) {
  editId = s.id; $('#fl').textContent = 'Edit service'; $('#cancel').hidden = false;
  $('#icon').value = s.icon; $('#price').value = s.price; $('#tEn').value = s.titleEn; $('#tBn').value = s.titleBn; $('#dEn').value = s.descEn; $('#dBn').value = s.descBn; $('#msg').value = s.msg; $('#act').checked = s.active; setImg(s.image);
  $('#svf').scrollIntoView();
}
function reset() { editId = ''; $('#svf').reset(); $('#fl').textContent = 'Add service'; $('#cancel').hidden = true; setImg(''); $('#icon').value = '🛠️'; }
$('#cancel').onclick = reset; $('#rmImg').onclick = () => setImg('');
function pickFile(f) {
  if (!f || !f.type.startsWith('image/')) return; const img = new Image();
  img.onload = async () => {
    const k = Math.min(1, 1200 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    try { setImg((await api('/upload', 'POST', { data: c.toDataURL('image/jpeg', .82) })).url); } catch (er) { $('#verr').textContent = er.message; }
  }; img.src = URL.createObjectURL(f);
}
$('#file').onchange = e => pickFile(e.target.files[0]);
$('#svf').onsubmit = async e => {
  e.preventDefault(); $('#verr').textContent = '';
  try { await api('/services', 'POST', { id: editId, icon: $('#icon').value, price: $('#price').value, titleEn: $('#tEn').value, titleBn: $('#tBn').value, descEn: $('#dEn').value, descBn: $('#dBn').value, msg: $('#msg').value, active: $('#act').checked, image }); reset(); load(); } catch (er) { $('#verr').textContent = er.message; }
};
$('#sf').onsubmit = async e => {
  e.preventDefault();
  try { await api('/settings', 'PUT', { title: $('#stitle').value, lead: $('#slead').value, whatsapp: $('#swa').value }); $('#smsg').textContent = 'Saved ✓'; } catch (er) { $('#smsg').textContent = er.message; }
};
$('#pf').onsubmit = async e => {
  e.preventDefault();
  try { await call('/api/admin/posts', 'POST', { text: $('#ptext').value }); $('#ptext').value = ''; $('#pmsg').textContent = 'Published ✓'; } catch (er) { $('#pmsg').textContent = er.message; }
};
$('#login').onsubmit = async e => {
  e.preventDefault();
  try { await api('/login', 'POST', { key: $('#key').value }); $('#key').value = ''; show(true, (await api('/me')).settings); } catch (er) { $('#lerr').textContent = er.message; }
};
$('#out').onclick = async () => { await api('/logout', 'POST'); show(false); };
api('/me').then(d => show(true, d.settings)).catch(() => show(false));

// ----- drag & drop -----
let secs = [];
const NAMES = { hero: 'Hero (title & intro)', services: 'Services grid', how: 'How it works', cta: 'WhatsApp banner' };
function renderSecs() {
  const b = $('#secs'); b.replaceChildren();
  secs.forEach(s => {
    const r = el('div', 'item'); r.draggable = true; r.dataset.id = s.id;
    const c = el('input'); c.type = 'checkbox'; c.checked = s.on; c.style.width = 'auto'; c.setAttribute('aria-label', 'Show ' + NAMES[s.id]);
    c.onchange = () => { s.on = c.checked; saveSecs(); };
    r.append(el('span', 'handle', '⠿'), c, el('span', 'grow', NAMES[s.id])); b.append(r);
  });
}
async function saveSecs() { try { await api('/sections', 'PUT', { sections: secs }); $('#secmsg').textContent = 'Saved ✓'; } catch (e) { $('#secmsg').textContent = e.message; } }
function sortable(box, done) {
  let drag = null;
  box.addEventListener('dragstart', e => { drag = e.target.closest('[draggable]'); if (drag) { drag.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'x'); } });
  box.addEventListener('dragover', e => {
    if (!drag) return; e.preventDefault();
    const after = [...box.children].filter(c => c !== drag).find(c => e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2);
    box.insertBefore(drag, after || null);
  });
  box.addEventListener('dragend', () => { if (drag) { drag.classList.remove('drag'); drag = null; done([...box.children].map(c => c.dataset.id)); } });
}
sortable($('#secs'), ids => { secs = ids.map(id => secs.find(s => s.id === id)); saveSecs(); });
sortable($('#list'), async ids => { try { services = await api('/services/reorder', 'POST', { ids }); } catch (e) { alert(e.message); } });
const dz = $('#dz');
['dragenter', 'dragover'].forEach(n => dz.addEventListener(n, e => { e.preventDefault(); dz.classList.add('over'); }));
['dragleave', 'drop'].forEach(n => dz.addEventListener(n, e => { e.preventDefault(); dz.classList.remove('over'); }));
dz.addEventListener('drop', e => pickFile(e.dataTransfer.files[0]));

// ----- people, appeals, password-reset requests -----
const btn = (txt, fn) => { const b = el('button', '', txt); b.type = 'button'; b.onclick = fn; return b; };
async function loadPeople() {
  const [us, ap, rs] = await Promise.all([api('/users'), api('/appeals'), api('/resets')]);
  const U = $('#users'); U.replaceChildren();
  us.forEach(u => {
    const r = el('div', 'item'); r.append(el('span', 'grow', '@' + u.username + ' (' + u.displayName + ') · ' + u.phone + ' · ' + u.status + ' · ' + u.posts + ' posts'));
    [['Suspend', 'suspended'], ['Ban', 'banned'], ['Restore', 'active']].forEach(([l, st]) => { if (u.status !== st) r.append(btn(l, async () => { const reason = st === 'active' ? '' : (prompt('Reason (shown to the user):') || ''); await api('/users/' + u.id + '/status', 'POST', { status: st, reason }); loadPeople(); })); });
    U.append(r);
  });
  if (!us.length) U.append(el('span', 'meta', 'No users yet.'));
  const A = $('#appeals'); A.replaceChildren();
  ap.forEach(a => { const r = el('div', 'item'); r.append(el('span', 'grow', '@' + a.username + ' (' + a.status + '): ' + a.text)); [['Approve', true], ['Reject', false]].forEach(([l, v]) => r.append(btn(l, async () => { await api('/appeals/' + a.id + '/resolve', 'POST', { approve: v }); loadPeople(); }))); A.append(r); });
  if (!ap.length) A.append(el('span', 'meta', 'No open appeals.'));
  const R = $('#resets'); R.replaceChildren();
  rs.forEach(x => { const r = el('div', 'item'); r.append(el('span', 'grow', '@' + x.username + ' · ' + x.phone + ' · ' + new Date(x.createdAt).toLocaleString()), btn(x.hasCode ? 'New code' : 'Generate code', async () => { const d = await api('/resets/' + x.id + '/code', 'POST'); alert('One-time code for @' + d.username + ': ' + d.code + '\n\nVerify the person on WhatsApp (' + d.phone + '), then send them this code. Valid for 30 minutes.'); loadPeople(); })); R.append(r); });
  if (!rs.length) R.append(el('span', 'meta', 'No reset requests.'));
}

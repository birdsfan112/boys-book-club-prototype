// BBC prototype: state, helpers, and the main screens. ASCII-only; see data.js.
const D = window.BBC;
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// pos = where "you" (Scott) are in each friend's book. null = unknown, so everything stays locked.
const S = { tab: 'club', page: null, pos: { gs: 100, phm: 10, wager: null }, myPct: 42, rx: {}, extra: [], intro: true, finished: false, chat: [], step: 0 };

const svg = (d, w) => '<svg width="' + (w || 16) + '" height="' + (w || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const IC = {
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>'),
  open: svg('<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.5-2"></path>'),
  chev: svg('<path d="M9 6l6 6-6 6"></path>', 22),
  back: svg('<path d="M15 6l-6 6 6 6"></path>', 24),
  mic: svg('<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"></path><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path>', 20),
  check: svg('<path d="M5 12l5 5 9-10"></path>', 18),
  send: svg('<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>', 20)
};
const RXNAME = ['Fire', 'Heart', 'Laugh', 'Mind blown'];

const av = id => { const P = D.people[id]; return '<div class="av' + (P.ring ? ' ring' : '') + '" style="background:' + P.bg + ';color:' + P.fg + '" aria-hidden="true">' + P.i + '</div>'; };
const cover = (b, lg) => '<div class="cover' + (lg ? ' lg' : '') + '" style="background:' + b.cv + '" aria-hidden="true">' + esc(b.s) + '</div>';
const bar = p => '<div class="bar" role="img" aria-label="About ' + p + ' percent read"><i style="width:' + p + '%"></i></div>';
const posLabel = v => v >= 100 ? 'Finished' : 'About ' + v + '%';

function rxRow(key, base) {
  base = base || {};
  return '<div class="rx">' + D.emoji.map((e, i) => {
    const on = !!S.rx[key + '|' + i], n = (base[i] || 0) + (on ? 1 : 0);
    return '<button class="' + (on ? 'on' : '') + '" data-a="rx" data-v="' + key + '|' + i + '" aria-pressed="' + on + '" aria-label="' + RXNAME[i] + (n ? ', ' + n : '') + '">' + e + (n ? ' ' + n : '') + '</button>';
  }).join('') + '</div>';
}

function lockLink(rid) {
  const run = D.runs[rid], pos = S.pos[run.book], total = run.notes.length;
  if (!total) return '';
  const open = pos == null ? 0 : run.notes.filter(n => pos >= n.p).length;
  let txt, cls = 'link', ic = IC.open;
  if (open === total) txt = total + ' deep notes · unlocked for you';
  else if (open === 0) { txt = total + ' deep notes · locked until you ' + (pos == null ? 'finish' : 'catch up'); cls += ' locked'; ic = IC.lock; }
  else txt = open + ' of ' + total + ' deep notes unlocked';
  return '<button class="' + cls + '" data-a="book" data-v="' + rid + '">' + ic + txt + '</button>';
}

function postcard(p) {
  const run = D.runs[p.run], b = D.books[run.book], P = D.people[p.who];
  const sub = [b.t, b.series, p.where || run.where].filter(Boolean).join(' · ');
  return '<article class="card pc"><div class="row">' + av(p.who) +
    '<div class="grow"><div class="nm">' + P.name + '</div><div class="sub">' + esc(sub) + '</div></div><div class="sub">' + p.when + '</div></div>' +
    (p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') +
    '<p>' + esc(p.text || run.card) + '</p>' +
    (p.who === 'scott' ? '' : lockLink(p.run)) + rxRow(p.id, p.rx) + '</article>';
}

function notesHtml(run, rid) {
  const own = run.who === 'scott', pos = own ? 100 : S.pos[run.book];
  return run.notes.map((n, i) => {
    if (own || (pos != null && pos >= n.p)) {
      return '<div class="note"><div class="lbl or">At ' + esc(n.at || n.p + '%') + '</div><p>' + esc(n.line) + '</p>' +
        (n.q ? '<blockquote>“' + esc(n.q) + '”</blockquote>' : '') + (own ? '' : rxRow(rid + ':' + i, n.rx)) + '</div>';
    }
    return '<div class="note locked">' + IC.lock + '<span>Locked until you ' + (pos == null ? 'finish the book' : 'pass ' + n.p + '%') + '</span></div>';
  }).join('');
}

function vHome() {
  const b = D.books.anti;
  const intro = '<div class="card demo" style="flex-direction:row;align-items:center;gap:10px"><p class="sub grow"><b>Mockup.</b> Sample data, nothing is saved, friends are made up.</p>' +
    '<button class="btn sm sec" data-a="tour" data-v="0">Tour</button></div>';
  return '<header class="hdr"><div><div class="wm">BBC</div><div class="lbl">Boys Book Club · Est. 7th grade</div></div>' +
    '<button class="me" data-a="profile" aria-label="Your profile and settings">S</button></header>' +
    (S.intro ? intro : '') +
    '<button class="card" data-a="book" data-v="scott-anti" style="flex-direction:row;gap:12px">' + cover(b) +
    '<div class="grow" style="display:flex;flex-direction:column;gap:4px"><div class="lbl or">' + (S.finished ? 'You just finished' : "You're reading") + '</div>' +
    '<div class="h">' + b.t + '</div><div class="sub">' + b.a + (S.finished ? '' : ' · about ' + S.myPct + '%') + '</div>' + bar(S.finished ? 100 : S.myPct) + '</div></button>' +
    '<button class="banner" data-a="book" data-v="teddy-wager"><span><span class="lbl" style="display:block">Teddy just finished</span>' +
    '<span class="h">The Wager. See what he thought</span></span>' + IC.chev + '</button>' +
    S.extra.concat(D.feed).map(postcard).join('');
}

function vBook(rid) {
  const run = D.runs[rid], b = D.books[run.book], P = D.people[run.who], own = run.who === 'scott', pos = S.pos[run.book];
  let ctl;
  if (own) {
    ctl = '<div class="card"><div class="lbl or">Your progress · ' + (S.finished ? 'finished' : 'about ' + S.myPct + '%') + '</div>' + bar(S.finished ? 100 : S.myPct) +
      (S.finished ? '' : '<div class="row"><button class="btn sm sec wide" data-a="checkin">Check in</button><button class="btn sm wide" data-a="finish">I finished it</button></div>') + '</div>';
  } else if (pos == null) {
    ctl = '<div class="card"><div class="lbl or">Where are you?</div><p>BBC doesn\'t know where you are in this book, so every deep note stays locked until you finish. That is the safety rule: when in doubt, stay locked.</p>' +
      '<button class="btn sm sec" data-a="started" data-v="' + run.book + '">I\'m reading it</button></div>';
  } else {
    ctl = '<div class="card"><div class="row"><div class="lbl or grow">Where are you?</div><div class="bc" id="posv">' + posLabel(pos) + '</div></div>' +
      '<input type="range" min="0" max="100" value="' + pos + '" data-range="pos" data-v="' + rid + '" aria-label="Your position in this book, percent">' +
      '<p class="fine">Demo: drag it and watch ' + P.name + "'s notes lock and unlock. In the real app you just tell Claude your chapter or page.</p></div>";
  }
  return '<div class="navb"><button class="ib" data-a="back" aria-label="Back">' + IC.back + '</button><div class="lbl">' + (own ? 'Your read' : P.name + "'s read") + '</div></div>' +
    '<div class="row top">' + cover(b, true) + '<div class="grow" style="display:flex;flex-direction:column;gap:6px"><div class="h xl">' + b.t + '</div>' +
    '<div class="sub">' + [b.a, b.series].filter(Boolean).join(' · ') + '</div>' +
    '<div class="row">' + av(run.who) + '<div class="sub">' + P.name + ' · ' + run.where + '</div></div>' +
    (run.verdict ? '<span class="tag">Verdict: ' + run.verdict + '</span>' : '') + '</div></div>' + ctl +
    (run.card ? '<div class="lbl">Postcard · spoiler-free, always visible</div><div class="card pc"><p>' + esc(run.card) + '</p></div>' : '') +
    '<div class="lbl">' + (own ? 'Your deep notes' : 'Deep notes · unlock as you read') + '</div>' +
    '<div class="tl" id="notes">' + notesHtml(run, rid) + '</div>' +
    '<p class="fine">' + (own ? 'Friends see each note only after they pass that point in the book. Nobody else has started this one, so for now these are yours alone.'
      : 'Each note is stamped with where ' + P.name + ' was when he said it. Locked notes are held back on the server and never reach your phone until you pass them.') + '</p>';
}

function vShelf() {
  const b = D.books.anti;
  return '<header class="hdr"><div><div class="h xl">YOUR SHELF</div><div class="lbl">4 books since July</div></div></header>' +
    '<div class="lbl">' + (S.finished ? 'Just finished' : 'Reading now') + '</div>' +
    '<button class="card" data-a="book" data-v="scott-anti" style="flex-direction:row;gap:12px">' + cover(b) + '<div class="grow"><div class="h">' + b.t + '</div><div class="sub">' + b.a + '</div>' + bar(S.finished ? 100 : S.myPct) + '</div></button>' +
    '<div class="lbl">Finished</div>' +
    D.shelf.map(s => { const k = D.books[s.book]; return '<div class="card" style="flex-direction:row;gap:12px">' + cover(k) + '<div class="grow" style="display:flex;flex-direction:column;gap:6px"><div class="h">' + k.t + '</div><div class="sub">' + k.a + ' · ' + s.when + '</div><blockquote>“' + esc(s.q) + '”</blockquote></div></div>'; }).join('') +
    "<p class=\"fine\">These are Scott's real entries, pulled from the reading journal he already keeps with Claude.</p>";
}

function vJournal() {
  return '<header class="hdr"><div><div class="h xl">JOURNAL</div><div class="lbl">Private to you and Claude</div></div></header>' +
    '<button class="btn or wide" data-a="chat">' + IC.mic + 'Talk about your book</button>' +
    '<div class="card"><p><b>Private by default.</b> Your friends never see these conversations, so ramble and say how you really feel. The club gets Claude\'s short summary plus a few snippets of your own words that back it up, never the whole entry.</p></div>' +
    D.journal.map(j => '<div class="card"><div class="row"><div class="lbl or grow">' + j.d + ' · ' + esc(j.at) + '</div></div><div class="nm">' + D.books[j.book].t + '</div><blockquote>“' + esc(j.q) + '”</blockquote></div>').join('');
}

function vRecs() {
  return '<header class="hdr"><div><div class="h xl">RECS</div><div class="lbl">Claude knows your shelf and the club\'s</div></div></header>' +
    '<div class="chips">' + ['Something a friend loved', 'Something short', 'Surprise me'].map(c => '<button class="chip" data-a="soon">' + c + '</button>').join('') + '</div>' +
    D.recs.map(r => { const k = D.books[r.book]; return '<div class="card" style="flex-direction:row;gap:12px">' + cover(k) + '<div class="grow" style="display:flex;flex-direction:column;gap:6px"><div class="h">' + k.t + '</div><div class="sub">' + k.a + '</div><p style="font-size:14px">' + esc(r.why) + '</p></div></div>'; }).join('') +
    '<p class="fine">Sample picks. In the real app Claude builds these from what you and the club have actually read, and you can just ask it for something.</p>';
}

function render(keep) {
  const v = $('#view'), p = S.page, top = v.scrollTop, chat = p && p[0] === 'chat';
  v.innerHTML = chat ? vChat() : p ? vBook(p[1]) : ({ club: vHome, shelf: vShelf, journal: vJournal, recs: vRecs })[S.tab]();
  const f = $('#foot');
  f.className = 'foot' + (chat ? ' comp' : '');
  f.hidden = !chat && (!!p || S.tab !== 'club');
  f.innerHTML = chat ? composer() : '<button class="btn wide" data-a="chat">' + IC.mic + 'Talk about your book</button><button class="btn sec" data-a="checkin">' + IC.check + 'Check in</button>';
  $('#tabs').hidden = !!chat;
  document.querySelectorAll('#tabs button').forEach(t => { if (t.dataset.v === S.tab && !p) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
  v.scrollTop = keep ? top : 0;
  if (chat) v.scrollTop = v.scrollHeight;
}

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }
function openSheet(html) { const s = $('#sheet'); s.innerHTML = html; s.hidden = false; $('#scrim').hidden = false; s.scrollTop = 0; }
function closeSheet() { $('#sheet').hidden = true; $('#scrim').hidden = true; }

const ACT = {
  tab(v) { S.tab = v; S.page = null; render(); },
  book(v) { S.page = ['book', v]; render(); },
  back() { S.page = null; render(); },
  rx(v) { S.rx[v] = !S.rx[v]; render(true); },
  intro() { S.intro = false; render(true); },
  started(v) { S.pos[v] = 0; render(true); },
  soon() { toast('In the real app, Claude answers here.'); },
  close() { closeSheet(); }
};
const RNG = {
  pos(val, el) { const rid = el.dataset.v, run = D.runs[rid]; S.pos[run.book] = val; $('#posv').textContent = posLabel(val); $('#notes').innerHTML = notesHtml(run, rid); }
};
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && ACT[el.dataset.a]) ACT[el.dataset.a](el.dataset.v, el); });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.range && RNG[el.dataset.range]) RNG[el.dataset.range](+el.value, el); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

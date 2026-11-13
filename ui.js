// BBC prototype: journal chat, voice-memo test, and the bottom sheets. ASCII-only; see data.js.
const PH = 'Type, dictate, or hold the mic';
const MEMO = "Okay, just read another chapter and I'm still really into it.";
const WRAPN = [
  { p: 48, at: '48%', line: 'Scott thinks the specific entities are the most inventive part so far.', q: 'The specific entities are very creative and interesting.' },
  { p: 48, at: '48%', line: 'He is curious where the story is headed from here.', q: "I'm very curious where we go from here." }
];
const TOUR = [
  ['Talk about your book', 'Tell Claude what you think of what you are reading. Type, dictate, or hold the mic and ramble. It asks good questions and remembers what you said last time.'],
  ['Private by default', "Your friends never see the conversation, so say how you really feel. The club gets a short, spoiler-free summary that you can edit or keep to yourself. Your exact words only go out after you've looked at them."],
  ['Spoilers stay locked', "Your friends' detailed notes are stamped with where they were in the book. Each one unlocks only after you pass that point."],
  ['Find your next book', 'Recs come from your own shelf and from what the club is loving. Or just ask Claude for something.']
];
const goHome = () => { closeSheet(); S.page = null; S.tab = 'club'; render(); };

// ---------- Journal chat (scripted) ----------
function vChat() {
  if (!S.chat.length) S.chat.push({ c: D.script[0].c });
  const cur = D.script[S.step] || { wrap: true };
  const idle = !S.typing && !!S.chat[S.chat.length - 1].c;
  // Journaling is the main event. Sharing is a small card at the very end, not a separate step.
  const end = !S.ended ? '' : '<div class="card pc"><div class="lbl or">For the club · spoiler-free postcard</div><p>' + esc(S.draft) + '</p>' +
    '<button class="link" data-a="review">' + IC.lock + '<span>2 deep notes, locked until a friend passes 48%. Review</span></button>' +
    '<button class="btn sm or wide" data-a="post">Looks good, post it</button>' +
    '<div class="row"><button class="btn sm sec wide" data-a="edit">Edit</button><button class="btn sm sec wide" data-a="private">Keep private</button></div>' +
    "<p class=\"fine\">Do nothing and it posts on its own in about two hours. Your exact words are held back until you've looked at them.</p></div>";
  return '<div class="navb"><button class="ib" data-a="back" aria-label="Back">' + IC.back + '</button><div class="lbl grow">Journal · Antimemetics</div>' + (S.ended ? '' : '<button class="btn sm sec" data-a="wrap">Done</button>') + '</div>' +
    '<div class="priv">' + IC.lock + "<span><b>Private.</b> Your friends never see this chat. The club gets a short summary, and your exact words go out only after you've seen them. So say how you really feel.</span></div>" +
    '<p class="fine">Mockup: Claude\'s replies here are scripted.</p><div class="msgs">' +
    S.chat.map(m => m.c ? '<div class="b c">' + esc(m.c) + '</div>' : '<div class="b u">' + esc(m.u) + '</div>' + (m.diag ? '<div class="diag">' + esc(m.diag) + '</div>' : '')).join('') +
    (S.typing ? '<div class="b c" aria-label="Claude is typing">…</div>' : '') +
    (S.ended ? '<div class="b c">Saved to your journal. Here\'s the short version I\'d pass along to the guys.</div>' : '') + '</div>' + end +
    (!S.ended && idle && cur.chips ? '<div class="chips">' + cur.chips.map(c => '<button class="chip" data-a="say" data-v="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>' : '') +
    (!S.ended && idle && cur.wrap ? '<button class="btn sec wide" data-a="wrap">Done for now</button>' : '');
}
function composer() {
  return '<button class="round mic" id="mic" aria-label="Hold to record a voice memo">' + IC.mic + '</button>' +
    '<input type="text" id="say" maxlength="600" placeholder="' + PH + '" aria-label="Message to Claude" autocomplete="off">' +
    '<button class="round" data-a="send" aria-label="Send">' + IC.send + '</button>';
}
function chatPaint() { if (!S.page || S.page[0] !== 'chat') return; const v = $('#view'); v.innerHTML = vChat(); v.scrollTop = v.scrollHeight; }
function say(text, diag) {
  text = String(text || '').trim().slice(0, 600);
  if (!text || S.typing) return;
  S.chat.push({ u: text, diag: diag });
  S.ended = false; // saying more reopens the conversation; the share card comes back at the next Done
  S.step++; S.typing = true; chatPaint();
  setTimeout(() => {
    const sc = D.script[S.step];
    S.typing = false;
    if (sc && sc.pct) S.myPct = sc.pct;
    S.chat.push({ c: sc ? sc.c : "That's as far as the scripted demo goes. In the real app I'd keep talking as long as you want. Tap Done when you're finished." });
    chatPaint();
  }, 700);
}

// ---------- Voice memo: real microphone test where the browser allows it ----------
let rec = null;
function micDown(e) {
  e.preventDefault();
  if (rec || S.typing) return;
  const r = rec = { t0: Date.now(), chunks: [] };
  $('#mic').classList.add('live'); $('#say').placeholder = 'Recording... let go to send';
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { r.err = 'no microphone access in this browser'; return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(st => {
    if (r.over) { st.getTracks().forEach(t => t.stop()); return; }
    r.stream = st;
    try {
      if (window.MediaRecorder) { r.mr = new MediaRecorder(st); r.mr.ondataavailable = ev => { if (ev.data && ev.data.size) r.chunks.push(ev.data); }; r.mr.start(); }
    } catch (x) { r.mr = null; r.err = 'recorder failed: ' + (x && x.name); }
  }).catch(x => { r.err = (x && x.name) || 'blocked'; });
}
function micUp() {
  const r = rec; if (!r) return;
  rec = null; r.over = true;
  const m = $('#mic'), inp = $('#say');
  if (m) m.classList.remove('live');
  if (inp) inp.placeholder = PH;
  const secs = (Date.now() - r.t0) / 1000, stopAll = () => { if (r.stream) r.stream.getTracks().forEach(t => t.stop()); };
  const live = r.mr && r.mr.state !== 'inactive';
  if (secs < 0.5) { if (live) r.mr.stop(); stopAll(); toast('Hold the mic down to talk, let go to send.'); return; }
  const app = (navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)) ? 'yes' : 'no';
  const done = d => say(MEMO, 'Voice memo, ' + secs.toFixed(1) + 's. ' + d + ' Home-screen app: ' + app + '. The words above are a sample transcript.');
  if (live) {
    r.mr.onstop = () => {
      const bytes = r.chunks.reduce((n, c) => n + c.size, 0), kind = r.mr.mimeType || 'audio';
      stopAll();
      done(bytes ? 'Mic test passed: ' + Math.max(1, Math.round(bytes / 1024)) + ' KB (' + kind + ') recorded on this device, then thrown away.' : 'Mic test FAILED: the mic opened but 0 bytes were recorded.');
    };
    r.mr.stop();
  } else {
    stopAll();
    done(r.err ? 'The mic is blocked in this preview (' + r.err + '), so this memo is simulated.' : r.stream ? 'The mic opened but this browser cannot record. Simulated memo.' : 'The mic did not answer in time. Simulated memo.');
  }
}
document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('#mic')) micDown(e); });
document.addEventListener('pointerup', micUp);
document.addEventListener('pointercancel', micUp);
document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('#mic')) e.preventDefault(); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'say') ACT.send(); });

// ---------- Sheets ----------
const grabDraft = () => { const t = $('#draft'); if (t) S.draft = t.value.trim().slice(0, 500) || D.draft; };
const pickChips = (id, opts, sel) => '<div class="chips" id="' + id + '">' + opts.map((o, i) => '<button class="chip' + (i === sel ? ' on' : '') + '" data-a="pick" data-v="' + i + '" aria-pressed="' + (i === sel) + '">' + o + '</button>').join('') + '</div>';
const VERD = ['Loved it', 'Liked it', 'Mixed', 'Not for me'];

function wrapSheet(keep) {
  const s = $('#sheet'), top = s.scrollTop;
  S.seenQ = true; // opening this sheet is the "glance" that releases the reader's quoted words
  openSheet('<div class="lbl or">From today\'s journal</div><div class="h xl">What the club gets</div>' +
    '<div class="lbl">Postcard · spoiler-free, the whole club sees it</div>' +
    (S.tweak ? '<textarea id="draft" maxlength="500" aria-label="Edit your postcard">' + esc(S.draft) + '</textarea>' : '<div class="card pc"><p>' + esc(S.draft) + '</p></div>') +
    '<div class="lbl">Deep notes · locked until a friend passes 48%</div>' +
    WRAPN.map((n, i) => '<div class="card"><p>' + esc(n.line) + '</p>' + (S.share[i] ? '<blockquote>“' + esc(n.q) + '”</blockquote>' : '') +
      '<button class="chip' + (S.share[i] ? ' on' : '') + '" data-a="share" data-v="' + i + '" aria-pressed="' + S.share[i] + '" style="align-self:flex-start">' + (S.share[i] ? 'Sharing my exact words' : 'Summary only, my words stay private') + '</button></div>').join('') +
    '<button class="btn or wide" data-a="post">Post to the club</button>' +
    '<div class="row"><button class="btn sm sec wide" data-a="tweak">' + (S.tweak ? 'Done editing' : 'Tweak') + '</button><button class="btn sm sec wide" data-a="private">Keep private</button></div>' +
    "<p class=\"fine\">Close the app without looking? The postcard and Claude's one-line summaries post on their own after about two hours. Your own quoted words never go out until you've seen them.</p>");
  if (keep) s.scrollTop = top;
}

Object.assign(ACT, {
  chat() { closeSheet(); S.page = ['chat']; render(); },
  send() { const i = $('#say'); if (!i) return; say(i.value); i.value = ''; },
  say(v) { say(v); },
  pick(v, el) { el.parentNode.querySelectorAll('.chip').forEach(c => { c.classList.toggle('on', c === el); c.setAttribute('aria-pressed', c === el); }); S.pick[el.parentNode.id] = +v; },
  wrap() { S.draft = S.draft || D.draft; S.share = S.share || [true, true]; S.ended = true; chatPaint(); },
  review() { S.tweak = false; wrapSheet(); },
  edit() { S.tweak = true; wrapSheet(); },
  tweak() { grabDraft(); S.tweak = !S.tweak; wrapSheet(true); },
  share(v) { grabDraft(); S.share[v] = !S.share[v]; wrapSheet(true); },
  private() { S.ended = false; goHome(); toast('Kept private. Still saved in your journal.'); },
  post() {
    grabDraft();
    const held = !S.seenQ;
    if (!S.posted) { S.posted = true; WRAPN.forEach((n, i) => D.runs['scott-anti'].notes.push({ p: n.p, at: n.at, line: n.line, q: !held && S.share[i] ? n.q : '' })); }
    S.myPct = Math.max(S.myPct, 48); S.ended = false;
    S.extra.unshift({ id: 'me' + Date.now(), who: 'scott', run: 'scott-anti', when: 'Just now', where: 'about ' + S.myPct + '%', text: S.draft });
    goHome(); toast(held ? 'Posted. Your exact words stay held until you review them.' : 'Posted. Deep notes stay locked until the guys catch up.');
  },
  tour(v) {
    const i = +v || 0, T = TOUR[i];
    if (!T) { closeSheet(); return; }
    const last = i === TOUR.length - 1;
    openSheet('<div class="lbl or">Quick tour · ' + (i + 1) + ' of ' + TOUR.length + '</div><div class="h xl">' + T[0] + '</div><p>' + T[1] + '</p>' +
      (i ? '' : '<p class="fine">This is a mockup: sample data, scripted replies, nothing is saved. You are seeing the app as Scott, and the other guys are made up.</p>') +
      '<div class="row">' + (last ? '' : '<button class="btn sm sec" data-a="close">Skip</button>') + '<button class="btn sm or wide" data-a="tour" data-v="' + (i + 1) + '">' + (last ? 'Got it' : 'Next') + '</button></div>');
  },
  checkin() {
    S.ci = S.myPct; S.pick.vibes = 0;
    openSheet('<div class="lbl or">Quick check-in</div><div class="h xl">Ten seconds, no typing needed</div>' +
      '<div class="row"><div class="lbl grow">Where are you?</div><div class="bc" id="civ">About ' + S.ci + '%</div></div>' +
      '<input type="range" min="0" max="100" value="' + S.ci + '" data-range="ci" aria-label="Your progress, percent">' +
      '<div class="lbl">How\'s it going?</div>' + pickChips('vibes', D.vibes, 0) +
      '<input type="text" id="ciline" maxlength="140" placeholder="One line, if you feel like it (optional)" aria-label="Optional one-line note">' +
      '<button class="btn or wide" data-a="docheckin">Check in</button><p class="fine">Posts a small card to the club. No chat required.</p>');
  },
  docheckin() {
    const line = $('#ciline').value.trim().slice(0, 140);
    S.myPct = S.ci;
    S.extra.unshift({ id: 'me' + Date.now(), who: 'scott', run: 'scott-anti', when: 'Just now', where: 'about ' + S.ci + '%', tag: 'Quick check-in', text: S.ci + '% in · ' + D.vibes[S.pick.vibes] + (line ? ' · "' + line + '"' : '') });
    goHome(); toast('Checked in.');
  },
  finish() {
    S.pick.verd = 0;
    openSheet('<div class="lbl or">You finished</div><div class="h xl">' + D.books.anti.t + '</div><div class="lbl">Verdict</div>' + pickChips('verd', VERD, 0) +
      '<input type="text" id="fline" maxlength="140" placeholder="Final take in one line (optional)" aria-label="Optional final take">' +
      '<button class="btn or wide" data-a="dofinish">Finish the book</button><p class="fine">Finishing a book is the only thing that pings the club. No notification for every postcard.</p>');
  },
  dofinish() {
    const line = $('#fline').value.trim().slice(0, 140);
    S.finished = true;
    S.extra.unshift({ id: 'me' + Date.now(), who: 'scott', run: 'scott-anti', when: 'Just now', where: 'Finished', tag: 'Finished', text: 'Verdict: ' + VERD[S.pick.verd] + '.' + (line ? ' "' + line + '"' : '') });
    openSheet("<div class=\"lbl or\">What the guys' phones show</div>" +
      '<div class="push"><div class="ico">BBC</div><div><b>BBC · now</b>Scott just finished There Is No Antimemetics Division. See what he thought.</div></div>' +
      '<p>Your deep notes for this book now wait for anyone who reads it later, unlocking as they go.</p><button class="btn wide" data-a="home">Done</button>');
  },
  home() { goHome(); },
  onboard() {
    const inp = p => '<input type="text" maxlength="80" placeholder="' + p + '" aria-label="' + p + '">';
    openSheet('<div class="lbl or">How a new member starts</div><div class="h xl">Five minutes, then you\'re in</div>' +
      '<div class="lbl">Three books you loved</div>' + inp('Book one') + inp('Book two') + inp('Book three') +
      '<div class="lbl">One you couldn\'t stand</div>' + inp('The one you quit or hated') +
      '<div class="lbl">What you\'re reading now</div>' + inp('Current read') +
      '<p class="fine">That is enough for Claude to start recommending. Later, if you want, there is a longer chat about your taste. Totally optional. (Nothing typed here is saved in this mockup.)</p>' +
      '<button class="btn wide" data-a="close">Looks good</button>');
  },
  profile() {
    const cur = ['auto', 'light', 'dark'].indexOf(S.theme || 'auto');
    openSheet('<div class="row">' + av('scott') + '<div class="grow"><div class="nm">Scott</div><div class="sub">This is you in the mockup</div></div></div>' +
      '<div class="lbl">Look</div><div class="chips">' + ['Match my phone', 'Light', 'Dark'].map((o, i) => '<button class="chip' + (i === cur ? ' on' : '') + '" data-a="theme" data-v="' + ['auto', 'light', 'dark'][i] + '" aria-pressed="' + (i === cur) + '">' + o + '</button>').join('') + '</div>' +
      '<button class="btn sm sec" data-a="tour" data-v="0">Take the tour again</button><button class="btn sm sec" data-a="onboard">How a new member starts</button><button class="btn sm" data-a="close">Close</button>');
  },
  theme(v) { S.theme = v; if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v; ACT.profile(); }
});
S.pick = {};
RNG.ci = val => { S.ci = val; $('#civ').textContent = 'About ' + val + '%'; };

render();
ACT.tour(0); // first visit opens the tour

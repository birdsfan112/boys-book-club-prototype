// BBC prototype sample data. Scott's entries are his real words from his Reading Room journal.
// Teddy, Marcus, Owen and Nate are fictional. Friend notes avoid real plot details on purpose.
// File is kept ASCII-only (emoji and symbols are \u escapes).
window.BBC = {
  emoji: ['🔥', '❤️', '😂', '🤯'],
  vibes: ['🔥 Hooked', '🙂 Enjoying', '😐 Meh', '😴 Slog', '🤯 Whoa'],
  people: {
    scott: { name: 'Scott', i: 'S', bg: 'var(--surface)', fg: 'var(--text)', ring: true },
    teddy: { name: 'Teddy', i: 'T', bg: '#FF7A2F', fg: '#14171A' },
    marcus: { name: 'Marcus', i: 'M', bg: '#1D5FC4', fg: '#FFFFFF' },
    owen: { name: 'Owen', i: 'O', bg: 'var(--cta-bg)', fg: 'var(--cta-fg)' },
    nate: { name: 'Nate', i: 'N', bg: '#59616A', fg: '#FFFFFF' }
  },
  books: {
    anti: { t: 'There Is No Antimemetics Division', a: 'qntm', cv: '#2F4A7A', s: 'No Anti- memetics Div.' },
    gs: { t: 'Golden Son', a: 'Pierce Brown', series: 'Red Rising #2', cv: '#8A5A12', s: 'Golden Son' },
    phm: { t: 'Project Hail Mary', a: 'Andy Weir', cv: '#1F3D4F', s: 'Project Hail Mary' },
    wager: { t: 'The Wager', a: 'David Grann', cv: '#5A3B26', s: 'The Wager' },
    dcc: { t: 'Dungeon Crawler Carl', a: 'Matt Dinniman', cv: '#7A1F1F', s: 'Dungeon Crawler Carl' },
    sotf: { t: 'The Strength of the Few', a: 'James Islington', cv: '#25423A', s: 'Strength of the Few' },
    wotm: { t: 'The Will of the Many', a: 'James Islington', cv: '#4A2F5E', s: 'Will of the Many' },
    pir: { t: 'Piranesi', a: 'Susanna Clarke', cv: '#7A5C2E', s: 'Piranesi' }
  },
  // A "run" is one person's read of one book.
  runs: {
    'scott-anti': {
      who: 'scott', book: 'anti', where: 'Part 2, ch. 2',
      notes: [
        { p: 8, at: 'ch. 1', line: 'Scott is in from chapter one and gets strong vibes of the video game Control.', q: 'Reminds me a lot of the video game Control.' },
        { p: 42, at: 'Part 2, ch. 2', line: 'He finds it inventive and wants to know where it is headed.', q: "I'm finding this book to be interesting, engaging, and very creative and imaginative." }
      ]
    },
    'marcus-gs': {
      who: 'marcus', book: 'gs', where: '62%',
      card: "Marcus says book two is meaner and smarter than the first. He's quit predicting who to trust and likes being wrong.",
      notes: [
        { p: 15, line: 'Marcus thinks the sequel wastes no time raising the stakes.', q: 'No warm-up lap. I respect it.', rx: { 0: 1 } },
        { p: 38, line: 'He has given up predicting who to trust.', q: "Every time I pick a side I get burned. I've stopped picking.", rx: { 2: 2 } },
        { p: 62, line: 'He says one stretch in the middle is the best run of the series so far.', q: 'I read 120 pages standing in my kitchen.', rx: { 0: 2 } }
      ]
    },
    'owen-phm': {
      who: 'owen', book: 'phm', where: 'ch. 9',
      card: 'Owen is hooked on the problem-solving and says the narrator is growing on him. Reading way past bedtime.',
      notes: [
        { p: 6, line: 'Owen is hooked by the opening setup.', q: 'I had no idea where this was going and I loved that.' },
        { p: 14, line: 'The science-as-puzzle-solving is working for him.', q: "It's like watching a really fun teacher work a problem on the board." },
        { p: 24, line: "He hit the first big turn and didn't see it coming.", q: 'I said "no way" out loud on the train.' },
        { p: 31, line: 'Owen has a new favorite character.', q: "You'll know who when you get there." }
      ]
    },
    'teddy-wager': {
      who: 'teddy', book: 'wager', where: 'Finished', done: true, verdict: 'Loved it',
      card: "Teddy finished The Wager and says it reads like a thriller that happens to be true. He's already pushing it on everyone.",
      notes: [
        { p: 12, line: 'Teddy says the setup alone is worth the price.', q: "I didn't expect a history book to open like a heist movie." },
        { p: 35, line: "He can't believe how fast things fall apart.", q: "Every chapter I think it can't get worse. It gets worse." },
        { p: 58, line: 'Teddy has picked a side.', q: "I know exactly who I'd follow, and I'll fight about it." },
        { p: 81, line: 'He says the last act changes how you see the whole story.', q: 'I had to put it down and stare at the wall for a minute.' },
        { p: 100, line: 'Final take: best thing he has read this year.', q: 'Read it so we can argue about who was right.' }
      ]
    },
    'nate-dcc': { who: 'nate', book: 'dcc', where: '30%', notes: [] }
  },
  feed: [
    { id: 'f1', who: 'marcus', run: 'marcus-gs', when: '2h', rx: { 0: 3 } },
    { id: 'f2', who: 'owen', run: 'owen-phm', when: 'Yesterday', rx: { 1: 1 } },
    { id: 'f3', who: 'nate', run: 'nate-dcc', when: '2d', tag: 'Quick check-in', text: '30% in · 🔥 Hooked · "This is so dumb and I can\'t stop."', rx: { 2: 2 } }
  ],
  shelf: [
    { book: 'sotf', when: 'Finished Sep 23', q: 'Left me with lots of questions, but I thought it was great... pacing was spot on.' },
    { book: 'wotm', when: 'Finished Sep 4', q: 'What a way to end the book! Psyched to start Strength of the Few.' },
    { book: 'pir', when: 'Finished Jul 21', q: "Beautifully done. The ending doesn't disappoint... For the right reader, I would 100% recommend this book." }
  ],
  journal: [
    { d: 'Nov 1', book: 'anti', at: 'Part 2, ch. 2', q: "I'm very curious where we go from here." },
    { d: 'Oct 30', book: 'anti', at: 'ch. 1', q: 'After the first chapter, I am really enjoying the book so far.' },
    { d: 'Sep 23', book: 'sotf', at: 'Finished', q: 'Left me with lots of questions, but I thought it was great.' },
    { d: 'Sep 17', book: 'sotf', at: 'ch. 53', q: 'Still loving it... the pacing here is still quite strong. POV shifts are well done.' },
    { d: 'Sep 9', book: 'sotf', at: 'ch. 26', q: 'Liking it a ton, but the multiple POVs and shifting plot are a bit distracting.' },
    { d: 'Aug 31', book: 'wotm', at: 'ch. 48', q: "Really enjoying it thus far... One and only one complaint: author used the word 'agreeance'!" },
    { d: 'Jul 17', book: 'pir', at: 'Early on', q: 'Reminds me a lot of the video game Blue Prince so far.' }
  ],
  recs: [
    { book: 'wager', why: 'Teddy just finished it and loved it. His five deep notes unlock as you read.' },
    { book: 'phm', why: "Owen is a third of the way in and can't put it down. You'd be reading it side by side." },
    { book: 'dcc', why: "Nate's quick check-ins keep saying the same thing: hooked. Nobody else in the club has started it." }
  ],
  script: [
    { c: 'Hey Scott. Last time you\'d just finished Part 2, chapter 2 and said you were "very curious where we go from here." Where are you now?', chips: ['Just finished Part 2, chapter 3', 'About halfway, I think'] },
    { c: "Got it. I'll call that roughly 48% and keep every spoiler lock on the safe side. What's sticking with you?", chips: ['The specific entities are very creative and interesting', "It's engaging and very imaginative"], pct: 48 },
    { c: 'That fits what you said after chapter 1, that it reminded you of the video game Control. Still feel that way, or has it become its own thing?', chips: ['Still very Control', 'More its own thing now'] },
    { c: "Love it. Want me to wrap up? I'll draft a spoiler-free postcard for the guys and keep the specifics locked until they catch up.", wrap: true }
  ],
  draft: 'Scott is about halfway through There Is No Antimemetics Division and calls it "interesting, engaging, and very creative and imaginative." Big Control (the video game) energy. Very curious where it goes.'
};

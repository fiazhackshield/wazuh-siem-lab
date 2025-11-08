/* GUI app logic */
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

const state = {
  stepIndex: 0,
  doneSteps: new Set(JSON.parse(localStorage.getItem('doneSteps') || '[]'))
};

const els = {
  year: $('#year'),
  stepList: $('#stepList'),
  progressBar: document.querySelector('.progress-bar'),
  progressPct: $('#progressPct'),
  stepTitle: $('#stepTitle'),
  stepIntro: $('#stepIntro'),
  stepImage: $('#stepImage'),
  stepCaption: $('#stepCaption'),
  checklist: $('#checklistItems'),
  stepDone: $('#stepDone'),
  commandBlocks: $('#commandBlocks'),
  notesBody: $('#notesBody'),
  issueList: $('#issueList'),
  issueSearch: $('#issueSearch'),
  prevBtn: $('#prevBtn'),
  nextBtn: $('#nextBtn'),
  crumbSection: $('#crumbSection'),
  crumbTitle: $('#crumbTitle'),
  themeToggle: $('#themeToggle'),
  search: $('#search'),
  clearSearch: $('#clearSearch'),
  resetProgress: $('#resetProgress'),
  /* NEW: section containers for conditional rendering */
  mediaWrap: document.querySelector('.media'),
  checklistCard: $('#checklist'),
  commandsCard: $('#commands'),
  notesCard: $('#notes'),
  issuesCard: $('#issues'),
};

if (els.year) els.year.textContent = new Date().getFullYear();

/* Theme */
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') root.classList.add('light');
els.themeToggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

/* Build step list */
function buildStepList(){
  els.stepList.innerHTML = '';
  LAB_DATA.forEach((step, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = `${i+1}. ${step.title}`;
    btn.dataset.index = i;
    if (state.doneSteps.has(step.id)) btn.classList.add('done');
    if (i === state.stepIndex) btn.classList.add('active');
    btn.addEventListener('click', () => { state.stepIndex = i; render(); });
    li.appendChild(btn);
    els.stepList.appendChild(li);
  });
}

/* Progress */
function updateProgress(){
  const pct = Math.round((state.doneSteps.size / LAB_DATA.length) * 100);
  els.progressBar.style.width = pct + '%';
  els.progressPct.textContent = pct + '%';
}

/* Render current step */
function render(){
  buildStepList();
  updateProgress();

  const i = state.stepIndex;
  const step = LAB_DATA[i];

  els.crumbSection.textContent = step.section;
  els.crumbTitle.textContent = step.title;

  els.stepTitle.textContent = `${i+1}. ${step.title}`;

  // Intro
  els.stepIntro.textContent = step.intro || '';
  els.stepIntro.style.display = step.intro && step.intro.trim() ? '' : 'none';

  // Media (image + caption)
  els.stepImage.src = step.image || '';
  els.stepImage.alt = step.caption || 'Step screenshot';
  els.stepCaption.textContent = step.caption || '';
  const hasMedia = (step.image && step.image.trim()) || (step.caption && step.caption.trim());
  if (els.mediaWrap) els.mediaWrap.style.display = hasMedia ? '' : 'none';

  // Checklist
  els.checklist.innerHTML = '';
  const hasChecklist = Array.isArray(step.checklist) && step.checklist.length > 0;
  if (els.checklistCard) els.checklistCard.style.display = hasChecklist ? '' : 'none';
  if (hasChecklist){
    step.checklist.forEach((item, idx) => {
      const id = `chk-${step.id}-${idx}`;
      const li = document.createElement('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = id;
      cb.checked = getChecklistState(step.id)[idx] || false;
      cb.addEventListener('change', () => setChecklistState(step.id, idx, cb.checked));
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = item;
      li.append(cb, label);
      els.checklist.appendChild(li);
    });
  }

  // Step done toggle
  els.stepDone.checked = state.doneSteps.has(step.id);
  els.stepDone.onchange = () => {
    if (els.stepDone.checked) state.doneSteps.add(step.id);
    else state.doneSteps.delete(step.id);
    localStorage.setItem('doneSteps', JSON.stringify([...state.doneSteps]));
    buildStepList(); updateProgress();
  };

  // Commands
  els.commandBlocks.innerHTML = '';
  const cmdTpl = $('#cmdTpl');
  const hasCommands = Array.isArray(step.commands) && step.commands.length > 0;
  if (els.commandsCard) els.commandsCard.style.display = hasCommands ? '' : 'none';
  if (hasCommands){
    step.commands.forEach(block => {
      const node = cmdTpl.content.cloneNode(true);
      node.querySelector('.cmd-title').textContent = block.title;
      const codeEl = node.querySelector('.code');
      codeEl.textContent = block.code;
      const copyBtn = node.querySelector('.copy');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(block.code).then(()=>{
          copyBtn.textContent = 'Copied!'; setTimeout(()=>copyBtn.textContent='Copy', 1000);
        });
      });
      els.commandBlocks.appendChild(node);
    });
  }

  // Notes
  els.notesBody.innerHTML = '';
  const hasNotes = Array.isArray(step.notes) && step.notes.length > 0;
  if (els.notesCard) els.notesCard.style.display = hasNotes ? '' : 'none';
  if (hasNotes){
    step.notes.forEach(n => {
      const p = document.createElement('p'); p.textContent = n; els.notesBody.appendChild(p);
    });
  }

  // Issues
  const hasIssues = Array.isArray(step.issues) && step.issues.length > 0;
  if (els.issuesCard) els.issuesCard.style.display = hasIssues ? '' : 'none';
  els.issueSearch.disabled = !hasIssues;
  els.issueSearch.value = '';
  buildIssues(hasIssues ? step.issues : []);

  // Prev/Next
  els.prevBtn.disabled = i === 0;
  els.nextBtn.disabled = i === LAB_DATA.length - 1;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildIssues(issues, filter = ''){
  els.issueList.innerHTML = '';
  const tpl = $('#issueTpl');
  const q = filter.trim().toLowerCase();
  const filtered = issues.filter(it =>
    it.title.toLowerCase().includes(q) ||
    it.body.join(' ').toLowerCase().includes(q) ||
    (it.fixes||[]).some(f=> (f.label+ ' ' + (f.code||'')).toLowerCase().includes(q))
  );
  filtered.forEach(issue => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.issue-title').textContent = issue.title;
    node.querySelector('.severity').textContent = issue.severity;
    const body = node.querySelector('.issue-body');
    issue.body.forEach(p => { const para = document.createElement('p'); para.textContent = p; body.appendChild(para); });
    (issue.fixes || []).forEach(fix => {
      const wrap = document.createElement('div');
      wrap.className = 'code-block';
      const details = document.createElement('details'); details.open = true;
      const header = document.createElement('div');
      header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center';
      const title = document.createElement('span'); title.textContent = fix.label; title.style.fontWeight='700';
      const copy = document.createElement('button'); copy.className='copy'; copy.textContent='Copy';
      copy.addEventListener('click', ()=>{
        navigator.clipboard.writeText(fix.code || '').then(()=>{ copy.textContent='Copied!'; setTimeout(()=>copy.textContent='Copy', 1000); });
      });
      header.append(title, copy);
      const pre = document.createElement('pre'); const code = document.createElement('code');
      code.textContent = fix.code || ''; pre.appendChild(code);
      details.append(header, pre);
      wrap.append(details);
      body.appendChild(wrap);
    });
    els.issueList.appendChild(node);
  });
  if (!filtered.length){
    els.issueList.innerHTML = `<p class="muted">No matching issues. Try different keywords.</p>`;
  }
}

/* Checklist persistence per step */
function getChecklistState(stepId){
  const raw = localStorage.getItem('chk:'+stepId);
  return raw ? JSON.parse(raw) : {};
}
function setChecklistState(stepId, idx, value){
  const obj = getChecklistState(stepId);
  obj[idx] = value;
  localStorage.setItem('chk:'+stepId, JSON.stringify(obj));
}

/* Prev/Next */
els.prevBtn.addEventListener('click', ()=>{ if (state.stepIndex>0){ state.stepIndex--; render(); } });
els.nextBtn.addEventListener('click', ()=>{ if (state.stepIndex<LAB_DATA.length-1){ state.stepIndex++; render(); } });

/* Global search across steps & issues */
function globalSearch(q){
  const term = q.trim().toLowerCase();
  if (!term){ buildStepList(); return; }
  const scored = LAB_DATA.map((s, i)=>{
    const hay = (s.title+' '+s.intro+' '+s.notes.join(' ')+' '+s.issues.map(x=>x.title+' '+x.body.join(' ')).join(' ')).toLowerCase();
    const score = hay.includes(term) ? 1 : 0;
    return {i, score};
  }).filter(x=>x.score>0).map(x=>x.i);
  els.stepList.innerHTML='';
  if (!scored.length){
    const li = document.createElement('li'); li.innerHTML = `<div class="muted" style="padding:.5rem">No results</div>`; els.stepList.appendChild(li); return;
  }
  scored.forEach(i=>{
    const step = LAB_DATA[i];
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = `${i+1}. ${step.title}`;
    btn.addEventListener('click', ()=>{ state.stepIndex=i; render(); });
    li.appendChild(btn);
    els.stepList.appendChild(li);
  });
}
els.search.addEventListener('input', e=> globalSearch(e.target.value));
els.clearSearch.addEventListener('click', ()=>{ els.search.value=''; globalSearch(''); });

/* Issue search (current step) */
els.issueSearch.addEventListener('input', e=>{
  const step = LAB_DATA[state.stepIndex];
  buildIssues(step.issues, e.target.value);
});

/* Reset progress */
els.resetProgress.addEventListener('click', ()=>{
  if (!confirm('Clear all saved progress and checklists?')) return;
  localStorage.removeItem('doneSteps');
  LAB_DATA.forEach(s=> localStorage.removeItem('chk:'+s.id));
  state.doneSteps = new Set();
  render();
});

/* Initial render */
window.addEventListener('DOMContentLoaded', ()=>{
  buildStepList();
  render();
});


/* --- Interactive Ripple on click for buttons --- */
function attachRipples(root=document){
  root.addEventListener('click', (e)=>{
    const target = e.target.closest('.btn, .icon-btn, .steps button');
    if(!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute; width:${size}px; height:${size}px; left:${e.clientX-rect.left-size/2}px; top:${e.clientY-rect.top-size/2}px; border-radius:50%; background:rgba(255,255,255,.35); transform:scale(0); opacity:.65; pointer-events:none;`;
    target.appendChild(ripple);
    ripple.animate([{transform:'scale(0)',opacity:.65},{transform:'scale(1.4)',opacity:0}], {duration:450, easing:'ease-out'}).finished.then(()=> ripple.remove());
  }, {passive:true});
}
attachRipples();

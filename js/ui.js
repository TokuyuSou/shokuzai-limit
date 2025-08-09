// ui.js
import { $, fmtDate, daysLeft } from './utils.js';
import { loadInv, saveInv } from './storage.js';
import { renderInv } from './inventory.js';

export function renderRecipeCard(best, focusNames=[]){
  const eta = `⏱️ 約${best.time}分`; const lvl = `🎯 ${best.level}`;
  const near = focusNames.length? `優先食材: ${focusNames.map(x=>`<span class="pill">${x}</span>`).join(' ')}`: '';
  $('#recipeArea').innerHTML = `
    <div class="stack" style="justify-content:space-between;align-items:center;margin-bottom:8px">
      <h3 style="margin:0">${best.name}</h3>
      <div class="muted">${eta} ・ ${lvl}</div>
    </div>
    <div class="muted" style="margin-bottom:8px">${near}</div>
    <div><b>必要な食材:</b> ${best.need.join('、')}</div>
    <div class="muted" style="margin:6px 0"><b>あると良い:</b> ${best.opt.join('、')}</div>
    <div class="steps" id="steps">
      ${best.steps.map((s,i)=>`<div class="step" data-idx="${i}"><b>手順 ${i+1}.</b> ${s}</div>`).join('')}
    </div>
    <div class="tts-controls" style="margin-top:8px">
      <button class="btn" id="ttsPlay">▶️ 読み上げ</button>
      <button class="btn secondary" id="ttsPause">⏸️ 一時停止</button>
      <button class="btn secondary" id="ttsResume">⏯️ 再開</button>
      <button class="btn ghost" id="finishCook">🍽️ 作った！</button>
    </div>
  `;

  // TTS
  const utterances = best.steps.map((text,i)=>{
    const u = new SpeechSynthesisUtterance(`手順 ${i+1}。${text}`);
    u.lang='ja-JP'; u.rate=1.0; u.pitch=1.0; return u;
  });
  $('#ttsPlay').onclick = ()=>{
    speechSynthesis.cancel();
    utterances.forEach((u,i)=>{
      u.onstart=()=> highlightStep(i,true);
      u.onend=()=> highlightStep(i,false);
      speechSynthesis.speak(u);
    });
  };
  $('#ttsPause').onclick = ()=> speechSynthesis.pause();
  $('#ttsResume').onclick = ()=> speechSynthesis.resume();

  // 料理後
  $('#finishCook').onclick = ()=>{
    const namesToUse = best.need;
    const invNow = loadInv();
    namesToUse.forEach(n=>{
      const hit = invNow.find(x=> x.name.includes(n));
      if(hit){ hit.qty = Math.max(0,(parseFloat(hit.qty)||0)-1); }
    });
    const remaining = invNow.filter(x=> (parseFloat(x.qty)||0)>0);
    saveInv(remaining); renderInv();
    const missingNow = best.need.filter(n=> !remaining.some(m=> m.name.includes(n)) );
    setShopping(missingNow);
    alert('在庫を更新し、買い物リストを作成しました。');
  };
}

export function highlightStep(i, on){
  const el = document.querySelector(`#steps .step[data-idx="${i}"]`); if(!el) return;
  el.style.borderColor = on? '#93c5fd':'#e5e7eb';
  el.style.boxShadow = on? '0 0 0 3px rgba(147,197,253,.3)':'none';
}

export function setShopping(items){
  const list = document.querySelector('#shopping'); list.innerHTML='';
  const uniq = Array.from(new Set(items));
  uniq.forEach(x=>{ const li=document.createElement('li'); li.textContent=x; list.appendChild(li); });
}

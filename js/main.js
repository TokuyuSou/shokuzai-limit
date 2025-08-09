// main.js
import { $, $$ } from './utils.js';
import { loadInv, saveInv, wipeInv } from './storage.js';
import { renderInv, addInv, delInv, useInv } from './inventory.js';
import { startCamera, snapAndOCR } from './ocr.js';
import { genRecipeRule } from './recipe_rule.js';
import { renderRecipeCard, setShopping } from './ui.js';
import { genRecipeAI } from './ai.js';

// ======= init =======
renderInv();

// ======= form handlers =======
$('#addForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const item = {
    id: crypto.randomUUID(),
    name: $('#name').value.trim(),
    qty: parseFloat($('#qty').value)||1,
    unit: $('#unit').value,
    expiry: $('#expiry').value || null,
    category: $('#category').value
  };
  if(!item.name){ alert('食材名を入力してください'); return; }
  addInv(item); e.target.reset();
});
$('#clearForm').onclick=()=>$('#addForm').reset();
$('#quickExp').onclick=()=>{
  const d = new Date(); d.setDate(d.getDate()+3);
  $('#expiry').value = d.toISOString().slice(0,10);
};

// ======= inventory table actions =======
$('#inventory').addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const id = btn.dataset.id; const act = btn.dataset.act;
  if(act==='del'){ if(confirm('削除しますか？')) delInv(id); }
  if(act==='use'){ useInv(id, 1); }
});

// ======= export/import/wipe =======
$('#exportJson').onclick=()=>{
  const blob = new Blob([JSON.stringify(loadInv(),null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='inventory.json'; a.click();
};
$('#importBtn').onclick=()=>$('#importJson').click();
$('#importJson').addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return; const text = await file.text();
  try { const data = JSON.parse(text); if(Array.isArray(data)){ saveInv(data); renderInv(); }
    else alert('不正なJSONです'); }
  catch(err){ alert('読み込みに失敗しました'); }
});
$('#wipe').onclick=()=>{ if(confirm('在庫を全削除しますか？')){ wipeInv(); renderInv(); } };

// ======= camera & ocr =======
$('#startCam').onclick = startCamera;
$('#snap').onclick = snapAndOCR;

// ======= recipe rule-based =======
$('#gen').onclick = ()=>{
  const rule = genRecipeRule();
  if(!rule){
    document.querySelector('#recipeArea').innerHTML='<div class="muted">在庫がありません。</div>';
    return;
  }
  const inv = loadInv();
  const focus = inv.slice().filter(x=>x.expiry).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).slice(0,4).map(x=>x.name);
  renderRecipeCard({ name:rule.name, time:rule.time, level:rule.level, need:rule.need, opt:rule.opt, steps:rule.steps }, focus);
};

// ======= AI =======
$('#genAI').onclick = genRecipeAI;

// ======= shopping list controls =======
document.querySelector('#copyShop').onclick=()=>{
  const text = Array.from(document.querySelectorAll('#shopping li')).map(li=>`- ${li.textContent}`).join('\n');
  navigator.clipboard.writeText(text||'').then(()=>{
    alert('買い物リストをコピーしました');
  });
};
document.querySelector('#clearShop').onclick=()=>{ document.querySelector('#shopping').innerHTML=''; };

// inventory.js
import { $, fmtDate, daysLeft } from './utils.js';
import { loadInv, saveInv } from './storage.js';

export function renderInv(){
  const inv = loadInv().sort((a,b)=>{
    const ad = a.expiry?new Date(a.expiry):new Date('2999-12-31');
    const bd = b.expiry?new Date(b.expiry):new Date('2999-12-31');
    return ad-bd;
  });
  $('#invCount').textContent = inv.length + ' 件';
  const wrap = $('#inventory'); wrap.innerHTML='';
  inv.forEach((it, i)=>{
    const left = daysLeft(it.expiry);
    const soon = left!==null && left<=3;
    const row = document.createElement('div'); row.className='row'; row.dataset.soon = soon;
    row.innerHTML = `
      <div>${i+1}</div>
      <div>${it.name}</div>
      <div>${it.qty} ${it.unit||''}</div>
      <div>${it.expiry?fmtDate(it.expiry):'<span class="muted">—</span>'}</div>
      <div>${left===null?'<span class="muted">—</span>':left<0?'<span class="danger">期限切れ</span>':left+'日'}</div>
      <div><span class="chip">${it.category||'その他'}</span></div>
      <div class="stack">
        <button class="btn ghost" data-act="use" data-id="${it.id}">消費</button>
        <button class="btn ghost" data-act="del" data-id="${it.id}">削除</button>
      </div>`;
    wrap.appendChild(row);
  });
}

export function addInv(item){
  const inv = loadInv(); inv.push(item); saveInv(inv); renderInv();
}
export function delInv(id){
  const inv = loadInv().filter(x=>x.id!==id); saveInv(inv); renderInv();
}
export function useInv(id, amount=1){
  const inv = loadInv(); const idx = inv.findIndex(x=>x.id===id);
  if(idx>-1){ inv[idx].qty = Math.max(0, (parseFloat(inv[idx].qty)||0) - amount);
    if(inv[idx].qty===0) inv.splice(idx,1); saveInv(inv); renderInv(); }
}

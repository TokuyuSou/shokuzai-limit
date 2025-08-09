// utils.js
export const $ = (q)=>document.querySelector(q);
export const $$ = (q)=>Array.from(document.querySelectorAll(q));

export const fmtDate = (d)=> d? new Date(d).toLocaleDateString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}):'';
export const daysLeft = (d)=> {
  if(!d) return null; const target = new Date(d); target.setHours(23,59,59,999);
  const diff = target - new Date();
  return Math.ceil(diff/86400000);
};

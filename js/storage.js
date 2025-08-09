// storage.js
export const storeKey = 'shokuzai.inv.v1';
export function loadInv(){
  try { return JSON.parse(localStorage.getItem(storeKey) || '[]'); }
  catch(e){ return []; }
}
export function saveInv(arr){ localStorage.setItem(storeKey, JSON.stringify(arr)); }
export function wipeInv(){ localStorage.removeItem(storeKey); }

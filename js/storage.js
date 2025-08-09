// storage.js (patched)
export const storeKey = 'shokuzai.inv.v1';
export function loadInv(){
  try { return JSON.parse(localStorage.getItem(storeKey) || '[]'); }
  catch(e){ return []; }
}
export function saveInv(arr){
  localStorage.setItem(storeKey, JSON.stringify(arr));
  dispatchEvent(new CustomEvent('inventory:changed', { detail: arr }));
}
export function wipeInv(){
  localStorage.removeItem(storeKey);
  dispatchEvent(new CustomEvent('inventory:changed', { detail: [] }));
}

// js/sync.js (new)
import { getDB, getAuthInstance, onAuthChanged } from './firebase.js';
import { loadInv, saveInv } from './storage.js';
import { renderInv } from './inventory.js';
import { collection, doc, getDocs, writeBatch, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let unsub = null;
let applyingRemote = false;

function col(uid){
  const db = getDB();
  return collection(db, 'users', uid, 'inventory');
}

async function pushAll(uid, items){
  const db = getDB();
  const c = col(uid);
  const snap = await getDocs(c);
  const batch = writeBatch(db);
  const idsNow = new Set(items.map(x=>x.id));
  // delete removed
  snap.forEach(d=>{
    if(!idsNow.has(d.id)){
      batch.delete(doc(db, 'users', uid, 'inventory', d.id));
    }
  });
  // upsert current
  items.forEach(it=>{
    batch.set(doc(db, 'users', uid, 'inventory', it.id), it, { merge: true });
  });
  await batch.commit();
}

function listen(uid){
  const c = col(uid);
  if (unsub) unsub();
  unsub = onSnapshot(c, (qs)=>{
    const items = qs.docs.map(d=>d.data());
    applyingRemote = true;
    saveInv(items);
    renderInv();
    applyingRemote = false;
  });
}

export function initSync(){
  onAuthChanged(async (user)=>{
    if(!user){
      if(unsub){ unsub(); unsub=null; }
      return;
    }
    listen(user.uid);
    // first sync: local -> cloud
    const local = loadInv();
    await pushAll(user.uid, local);
  });

  addEventListener('inventory:changed', async (e)=>{
    const auth = getAuthInstance();
    const user = auth?.currentUser;
    if(!user || applyingRemote) return;
    const items = Array.isArray(e.detail)? e.detail : loadInv();
    await pushAll(user.uid, items);
  });
}

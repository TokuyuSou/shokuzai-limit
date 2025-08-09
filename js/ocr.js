// ocr.js
import { $ } from './utils.js';

let stream;
export async function startCamera(){
  if(stream) return;
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    const v = $('#video'); v.srcObject = stream; await v.play();
  }catch(err){ alert('カメラを開始できません: '+err.message); }
}

function extractDate(text){
  const t = text.replace(/[\s\n]+/g,' ').replace(/[年\.]/g,'/').replace(/-/g,'/');
  const m = t.match(/(20\d{2}|19\d{2}|\d{2})\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])/);
  if(!m) return null;
  let [_, y, mo, da] = m;
  if(y.length===2){ y = (parseInt(y,10) > 50 ? '19'+y : '20'+y); }
  const mm = String(mo).padStart(2,'0');
  const dd = String(da).padStart(2,'0');
  return `${y}-${mm}-${dd}`;
}

export async function snapAndOCR(){
  try{
    if(!stream) await startCamera();
    const v=$('#video'); const c=$('#canvas'); c.hidden=false; c.width=v.videoWidth; c.height=v.videoHeight;
    const ctx=c.getContext('2d'); ctx.drawImage(v,0,0,c.width,c.height);
    $('#ocrOut').textContent='OCR処理中…';
    const { data } = await Tesseract.recognize(c.toDataURL('image/png'), 'jpn+eng');
    const raw = data.text || '';
    const iso = extractDate(raw);
    if(iso){ $('#expiry').value = iso; $('#ocrOut').innerHTML = `検出: <b>${iso}</b>`; }
    else { $('#ocrOut').innerHTML = `日付を検出できませんでした。<span class="muted">テキスト: ${raw.slice(0,80)}…</span>`; }
  }catch(err){
    console.error(err); alert('OCRに失敗: '+err.message);
  }
}

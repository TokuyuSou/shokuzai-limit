// ai.js
import { loadInv } from './storage.js';
import { daysLeft, $ } from './utils.js';
import { renderRecipeCard } from './ui.js';
import { genRecipeRule } from './recipe_rule.js';

let mlcEngine = null;
let mlcReady = false;

const DEFAULT_MLC_MODEL = "TinyLlama-1.1B-Chat-v1.0-q4f16_1";
const aiStatus = (t)=>{ const el=document.getElementById('aiStatus'); if(el) el.textContent=t||''; };

async function initMLC(){
  if(mlcEngine || mlcReady) return;
  if(!('gpu' in navigator)){
    aiStatus('WebGPU非対応（AI不可）');
    return;
  }
  try{
    aiStatus('モデル読み込み中…（初回は数十秒）');
    mlcEngine = await webllm.CreateMLCEngine({ model: DEFAULT_MLC_MODEL });
    mlcReady = true;
    aiStatus('AI準備完了');
  }catch(err){
    console.error(err);
    aiStatus('AI初期化に失敗（ルールにフォールバック）');
  }
}

function buildPromptFromInventory(inv){
  const items = inv.map(x=>({ name:x.name, qty:x.qty, unit:x.unit||'', expiry:x.expiry||null, days_left:daysLeft(x.expiry), category:x.category||'その他' }));
  const constraints = { language:"ja-JP", time_limit_minutes:30, difficulty:"かんたん", prefer_near_expiry:true };
  const system = 'あなたは日本語の家庭料理アシスタントです。与えられた在庫と賞味期限を見て、できるだけ期限が近い食材を優先しつつ、30分以内・かんたん調理のレシピを1つ提案してください。出力は必ずJSONのみで、余計な文章は出力しないこと。';
  const user = { inventory: items, constraints, output_format: { title:"string", time_minutes:"number", level:"string", needed:["string"], optional:["string"], steps:["string"], shopping_list:["string"] } };
  return [ {role:'system', content:system}, {role:'user', content: JSON.stringify(user)} ];
}

function safeParseJSON(text){
  try{
    const start = text.indexOf('{'); const end = text.lastIndexOf('}');
    const slice = (start>=0 && end>=0 && end>start)? text.slice(start, end+1) : text;
    return JSON.parse(slice);
  }catch(_){ return null; }
}

export async function genRecipeAI(){
  const inv = loadInv();
  if(inv.length===0){
    $('#recipeArea').innerHTML='<div class="muted">在庫がありません。</div>';
    return;
  }
  await initMLC();
  if(!mlcReady){
    const rule = genRecipeRule();
    if(rule){
      const focus = inv.slice().filter(x=>x.expiry).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).slice(0,4).map(x=>x.name);
      renderRecipeCard({ name:rule.name, time:rule.time, level:rule.level, need:rule.need, opt:rule.opt, steps:rule.steps }, focus);
    }
    return;
  }

  aiStatus('推論中…');
  try{
    const messages = buildPromptFromInventory(inv);
    const res = await mlcEngine.chat.completions.create({ messages, temperature:0.7, max_tokens:512 });
    const text = (res?.choices?.[0]?.message?.content || '').trim();
    const data = safeParseJSON(text);
    if(!data || !data.title || !Array.isArray(data.steps)) throw new Error('AI出力が不正');

    const best = {
      name: data.title,
      time: data.time_minutes || 20,
      level: data.level || 'かんたん',
      need: data.needed || [],
      opt: data.optional || [],
      steps: data.steps || []
    };
    const focus = inv.slice().filter(x=>x.expiry).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).slice(0,4).map(x=>x.name);
    renderRecipeCard(best, focus);

    // もしAIのshopping_listがあれば、仕上げ時に使えるようDOMに保存
    if(Array.isArray(data.shopping_list)){
      const el = document.createElement('meta');
      el.id = 'aiShoppingData';
      el.dataset.items = JSON.stringify(data.shopping_list);
      document.body.appendChild(el);
    }
    aiStatus('完了');
  }catch(err){
    console.error(err);
    aiStatus('失敗：ルールにフォールバック');
    const rule = genRecipeRule();
    if(rule){
      const focus = inv.slice().filter(x=>x.expiry).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).slice(0,4).map(x=>x.name);
      renderRecipeCard({ name:rule.name, time:rule.time, level:rule.level, need:rule.need, opt:rule.opt, steps:rule.steps }, focus);
    }
  }
}

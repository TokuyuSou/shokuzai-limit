// recipe_rule.js
import { loadInv } from './storage.js';

export const RECIPES = [
  { id:'yasai-soup', name:'やさしい野菜スープ', time:20, level:'かんたん',
    need:['玉ねぎ','にんじん','じゃがいも','水'], opt:['コンソメ','ベーコン'],
    steps:[
      '野菜を一口大に切ります。',
      '鍋に油を熱し、玉ねぎ→にんじん→じゃがいもの順に炒めます。',
      '水とコンソメを入れ、中火で10〜12分煮ます。',
      '塩こしょうで味を整え、器によそいます。'
    ] },
  { id:'tamago-yakiudon', name:'たまご焼うどん', time:12, level:'かんたん',
    need:['うどん','たまご','ねぎ'], opt:['めんつゆ','醤油'],
    steps:[
      'うどんを表示時間どおりに下茹でします。',
      'フライパンに油をひき、溶き卵を炒め、うどんとねぎを加えます。',
      'めんつゆ（または醤油）で味を整えて完成。'
    ] },
  { id:'curry', name:'かんたんカレー', time:30, level:'ふつう',
    need:['カレールー','玉ねぎ','にんじん','じゃがいも','水'], opt:['肉・魚'],
    steps:[
      '野菜と肉を切って炒めます。',
      '水を加えて柔らかくなるまで煮ます。',
      '火を止めてルーを溶かし、再度とろみが出るまで加熱します。'
    ] },
  { id:'yakisoba', name:'野菜たっぷり焼きそば', time:15, level:'かんたん',
    need:['焼きそば麺','キャベツ','にんじん'], opt:['豚肉','ソース'],
    steps:[
      'フライパンで麺を軽くほぐします。',
      '野菜と（あれば）豚肉を加えて炒めます。',
      'ソースで味付けして完成。'
    ] }
];

export function genRecipeRule(){
  const inv = loadInv();
  if(inv.length===0) return null;
  const sorted = inv.slice().sort((a,b)=>{
    const ad=a.expiry?new Date(a.expiry):new Date('2999-12-31');
    const bd=b.expiry?new Date(b.expiry):new Date('2999-12-31');
    return ad-bd;
  });
  const names = inv.map(x=>x.name);
  let best = null; let bestScore=-1;
  for(const r of RECIPES){
    const haveNeed = r.need.filter(n=> names.some(m=> m.includes(n)) );
    const score = haveNeed.length - r.need.length*0.1 + r.opt.filter(o=> names.some(m=>m.includes(o)) ).length*0.05;
    if(score>bestScore){ best=r; bestScore=score; }
  }
  return best || RECIPES[0];
}

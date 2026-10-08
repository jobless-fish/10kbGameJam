// Fills src/game.html with its data: the small sprites, the two fonts, the two bosses and the music.
// Everything the game draws is kept in src/art as text you can read; here it becomes the strings the game carries.
const fs=require('fs'),path=require('path');
const SRC=path.join(__dirname,'..','src');
const rd=f=>fs.readFileSync(path.join(SRC,f),'utf8');
const {sprites,glyphs}=require(path.join(SRC,'art','sprites.js'));

// a text picture -> its rows, without the comment lines
const rows=f=>rd(f).split('\n').filter(l=>l&&l[0]!=';');

// A boss: one digit a pixel (0 black, 1 dried, 2 fresh, 3 bone, 4 clear), cut into strips 28 rows tall, each strip
// written column by column. In that order the pixel to the left of any pixel is always exactly 28 characters back,
// and the packer is told to look there (tools/packer-settings.json).
const boss=(f,w,h)=>{
  const r=rows(f);
  if(r.length!=h||r.some(l=>l.length!=w))throw new Error(f+' is not '+w+'x'+h);
  let o='';
  for(let s=0;s<Math.ceil(h/28);s++)for(let x=0;x<w;x++)for(let y=s*28;y<s*28+28;y++){
    const d=y<h?{o:0,d:1,r:2,'#':3,'.':4}[r[y][x]]:4;  // rows past the bottom are clear
    if(d==null)throw new Error(f+': bad pixel '+r[y][x]);
    o+=d
  }
  return o
};

// The title letters: nine cells of 11x28, column by column, each letter standing on the bottom of its cell.
const letters=()=>{
  const G={};let cur;
  for(const l of rd('art/title-letters.txt').split('\n')){
    if(l[0]==';'||!l)continue;
    if(l[0]=='=')G[cur=l.slice(1)]=[];else G[cur].push(l)
  }
  let o='';
  for(const k of 'LUNACRETZ'){
    const g=G[k];
    if(!g||g.length!=24||g.some(l=>l.length!=12))throw new Error('title letter '+k+' is not 12x24');
    if(g.some(l=>l[11]=='#')||g[0].includes('#'))throw new Error('title letter '+k+': keep the last column and the top row empty');
    for(let x=0;x<11;x++){o+='0000';for(let y=0;y<24;y++)o+=g[y][x]=='#'?1:0}
  }
  return o
};

exports.fill=tpl=>{
  const CH=tpl.match(/CH='([^']+)'/)[1];
  const spr=sprites.map(s=>{
    const px=[...s.replace(/\n/g,'')].map(ch=>'.or#'.indexOf(ch));
    if(px.length!=64||px.includes(-1))throw new Error('bad sprite\n'+s);
    return px.join('')
  }).join('');
  const font=[...CH].map(ch=>{const g=glyphs[ch];if(!g||g.length!=15)throw new Error('no 3x5 glyph for '+ch);return g}).join('');
  const put=(t,k,v)=>{if(t.split(k).length!=2)throw new Error('template should hold '+k+' exactly once');return t.replace(k,()=>v)};
  for(const [k,v] of [['/*MUSIC*/',rd('music.js').trimEnd()],['__SPRITES__',spr],['__FONT__',font],['__QUEEN__',boss('art/queen.txt',68,56)],['__HORROR__',boss('art/horror.txt',34,40)],['__LETTERS__',letters()]])tpl=put(tpl,k,v);
  return tpl
};

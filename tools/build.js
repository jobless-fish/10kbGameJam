// Builds the game:  node tools/build.js [--search N] [--test]
//
//   src/game.html + src/art + src/music.js
//     -> dist/luna-cruenta-source.html   the whole game as one readable file
//     -> dist/luna-cruenta-debug.html    the same, plus the phase-skip keys of src/debug.js
//     -> luna-cruenta.html               minified (terser) and packed (Roadroller): the jam entry
//
//   --search N   run N steps of the packer-settings search first and keep whatever it finds
//   --test       build dist/luna-cruenta-test.html instead of the entry: the queen arrives at 6 points, the horror at 26
//
// About the search. Roadroller packs text by predicting each character from a handful of contexts - "the last two
// characters", "the one three back" and so on - and its own tuner only tries contexts made of the last nine characters
// and scores them by an estimate of the zipped size. The sprites here are laid out so that the pixel to the left is
// 28 characters back, so the search below may also pick contexts 27 to 29 back, and it scores by the real size of
// the file. Its result is kept in tools/packer-settings.json, which is why a plain build is quick and repeatable.
const fs=require('fs'),path=require('path'),{minify}=require('terser');
const {fill}=require('./data.js');
const ROOT=path.join(__dirname,'..'),SETTINGS=path.join(__dirname,'packer-settings.json');
const arg=k=>{const i=process.argv.indexOf(k);return i<0?0:process.argv[i+1]||1};
(async()=>{
  let src=fill(fs.readFileSync(path.join(ROOT,'src','game.html'),'utf8'));
  const TEST=arg('--test');
  if(TEST)src=src.replace('sc>=500+ph*500','sc>=6+ph*20');
  else{
    fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
    fs.writeFileSync(path.join(ROOT,'dist','luna-cruenta-source.html'),src);
    fs.writeFileSync(path.join(ROOT,'dist','luna-cruenta-debug.html'),src.replace(/loop\(0\)\s*<\/script>/,fs.readFileSync(path.join(ROOT,'src','debug.js'),'utf8')+'\nloop(0)\n</script>'));
  }
  const js=src.split('<script>')[1].split('</script>')[0];
  const r=await minify(js,{ecma:2020,toplevel:true,
    compress:{ecma:2020,passes:4,toplevel:true,unsafe:true,unsafe_arrows:true,unsafe_math:true,booleans_as_integers:true,pure_getters:true},
    mangle:{toplevel:true},format:{ecma:2020,comments:false}});
  const {Packer}=await import('roadroller');
  const inputs=[{data:r.code,type:'js',action:'eval'}];
  const html=o=>{const d=new Packer(inputs,{maxMemoryMB:150,allowFreeVars:true,...o}).makeDecoder();return '<script>'+d.firstLine+d.secondLine+'</script>'};
  const len=o=>Buffer.byteLength(html(o));
  let best=JSON.parse(fs.readFileSync(SETTINGS,'utf8')),bestLen=len(best);
  const N=+arg('--search');
  if(N){
    // distances a context may reach back: the last nine characters, a glyph of the 3x5 font (15), a sprite column (27-29)
    const D=[1,2,3,4,5,6,7,8,9,15,16,27,28,29],rnd=n=>Math.random()*n|0,bit=()=>1<<D[rnd(D.length)]-1;
    const mask=()=>{let m=0;for(let k=1+rnd(4);k--;)m|=bit();return m},copy=o=>JSON.parse(JSON.stringify(o));
    let cur=copy(best),curLen=bestLen;
    for(let i=0;i<N;i++){
      if(i%250==0)cur=copy(best),curLen=bestLen;  // drifted too far? start again from the best
      const T=1.2*(1-i/N)+.1,nx=copy(cur),S=nx.sparseSelectors,m=rnd(10);
      if(m<2&&S.length<24)S.push(mask());
      else if(m<3&&S.length>6)S.splice(rnd(S.length),1);
      else if(m<5)S[rnd(S.length)]=mask();
      else if(m<8)S[rnd(S.length)]^=bit();
      else{
        const k=['recipLearningRate','modelRecipBaseCount','modelMaxCount','precision','numAbbreviations'][rnd(5)],v=nx[k];
        nx[k]=Math.max(k=='numAbbreviations'?0:1,k=='recipLearningRate'?Math.round(v*(.85+Math.random()*.3)):k=='modelRecipBaseCount'?v+rnd(7)-3:k=='numAbbreviations'?v+rnd(9)-4:v+rnd(3)-1);
        if(k=='precision')nx[k]=Math.min(21,nx[k]);
      }
      nx.sparseSelectors=[...new Set(S)].sort((a,b)=>a-b);
      let l;try{l=len(nx)}catch(e){continue}
      if(l<=curLen||Math.exp((curLen-l)/T)>Math.random()){cur=nx;curLen=l}
      if(l<bestLen){best=nx;bestLen=l;fs.writeFileSync(SETTINGS,JSON.stringify(best)+'\n');console.log('step',i,'->',bestLen,'bytes')}
    }
  }
  const out=html(best),size=Buffer.byteLength(out);
  if(![...out].every(c=>c.charCodeAt(0)<128))throw new Error('the packed file is not plain ASCII');
  fs.writeFileSync(path.join(ROOT,TEST?'dist/luna-cruenta-test.html':'luna-cruenta.html'),out);
  console.log('readable '+Buffer.byteLength(src)+' | minified '+r.code.length+' | packed '+size+' bytes | '+(1e4-size)+' under 10,000 | '+(10240-size)+' under 10,240');
  if(size>1e4)console.log('!! over 10,000 bytes');
})();

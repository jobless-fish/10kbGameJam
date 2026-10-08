// music: 16th notes scheduled just ahead of the audio clock. One tune, sixteen bars in E minor, three ways:
// in play, 140bpm and creeping up - bass and kick, then snare and hat, then the lead;
// on the title, the same tune at a walking pace - held chords over a deep root, a slow drum, the tune in octaves;
// at the end, that arrangement again at half the title's speed. Dead, only a quiet bass is left.
mus=()=>{
  if(!A)return;
  if(nt<A.currentTime)nt=A.currentTime;
  for(;nt<A.currentTime+.1;){
    let z=st>3?2.2:st?1:1.4,  // how slow: the end, play, the title
    s=ni%16,b=ni++>>4,q=b%16,on=st&1,
    r=[0,0,-4,-2,5,-4,-2,-5,0,3,-2,5,-4,-2,-5,-5][q],  // root of each bar, in semitones from E
    k=[0,3,6,8,12,14].indexOf(s),  // the tune lands on six steps of a bar
    m=parseInt('ccacf.ca7a758878c.aaceaehfchfcfc8fc8ea5eh.jebe7bjfcfj.hfafhjheaeh.hc9chlkfcfkfmhehmhnjejn.jebejb'[q*6+k],36),
    hz=(f,n)=>f*2**(n/12);
    if(z>1)
      s||[-24,0,4-(275>>q&1),7,12].map(n=>snd(hz(165,r+n),z*1.5,0,.07,nt,1)),  // chord over a deep root: minor on bars 0,1,4,8
      s%8||snd(110,.6,0,.4,nt),  // the drum
      k>=0&&m>=0&&[330,165].map(f=>snd(hz(f,m),z*.4,0,.07,nt,1,'square'));  // the tune in octaves
    else{
      s%4-1&&snd(hz(82.4,r+(on&&s%8==6)*12),.09,0,on?.13:.06,nt,1,'square');  // galloping bass
      if(on){
        (q<15||s<8)&&s%4<1&&snd(150,.15,0,.3,nt);  // kick, dropping out for the roll that ends the sixteen bars
        if(b>3)(s%8==4||q%4==3&&s>13||q>14&&s>7)&&snd(3e3,.1,1,.2,nt),(s%4==2||bh>0&&s%2)&&snd(9e3,.03,1,.07,nt);  // snare with fills, hat
        if(b>7&&k>=0&&m>=0)snd(hz(330,m),.15,0,.07,nt,1,'square')  // lead
      }
    }
    nt+=(.107-Math.min(tm,2e4)/1e6-(bh>0)*.02)*z
  }
},

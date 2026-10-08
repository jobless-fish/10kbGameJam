
// ---- DEBUG BUILD ONLY: phase-skip keys. This block is not in the submission file. ----
// Start a run, then: 1 = the queen arrives one hit from death, 2 = the horror arrives one hit from death,
// 3 = the ending starts now (the roar, the dark, the last picture, the credits), 4 = during the credits, jump to their end.
onkeydown=e=>{
  let k=+e.key;
  if(k==4&&st==4)dt=1190+ED.length*56;
  if(st!=1)return;
  if(k==1||k==2)E=[],B=[],bd=0,ph=bk=k-1,bm=k>1?45:30,bh=1,bX=46,bY=12,ba=0,bi=-1,say('',k>1?'+ I HAVE EATEN A THOUSAND KINGS +':'+ WHO DARES CHALLENGE THE THRONE +');
  if(k==3)bh=bd=0,ph=3,k2=600,tg=100
};

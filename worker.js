// worker.js - performs the Monte Carlo simulation in a background thread
self.addEventListener('message', (ev) => {
  const data = ev.data;
  if(data && data.type === 'cancel') {
    // ignore, will be handled via flag
    if(self._cancelFlag) self._cancelFlag = true;
    return;
  }
  // parameters
  const strongCount = data.strongCount || 0;
  const weakCount = data.weakCount || 0;
  const blockCount = data.blockCount || 0;
  const dodgeCount = data.dodgeCount || 0;
  const attackStance = data.attackStance || 'other';
  const defenseStance = data.defenseStance || 'other';
  const weakEyeReplace = data.weakEyeReplace || 'none';
  const weakBoltReplace = data.weakBoltReplace || 'none';
  const blockBoltReplace = data.blockBoltReplace || 'none';
  const dodgeEyeReplace = data.dodgeEyeReplace || 'none';
  const RUNS = data.runs || 1000000;

  // dice faces
  const strongDie = ['강공','강공','강공','강공','빈강공','빈약공','눈','번개'];
  const weakDie   = ['약공','약공','쌍약공','쌍약공','빈약공','눈','번개','빈칸'];
  const blockDie  = ['회피','방어','빈쌍방어','빈쌍방어','눈','번개','번개','빈칸'];
  const dodgeDie  = ['회피','회피','눈','눈','번개','빈칸','빈칸','빈칸'];

  let penetrationCount = 0;
  let cancelFlag = false;
  self._cancelFlag = false;

  const randIndex = (n) => Math.floor(Math.random()*n);

  const reportEvery = Math.max(1, Math.floor(RUNS / 200)); // update ~200 times

  for(let run=0; run<RUNS; run++){
    if(self._cancelFlag){
      self.postMessage({type:'cancelled'});
      return;
    }

    // sample attack dice
    let countS = 0; // 강공
    let countW = 0; // 약공

    for(let i=0;i<strongCount;i++){
      const face = strongDie[randIndex(8)];
      let f = face;
      // attack stance transforms
      if(attackStance === 'attack'){
        if(f === '빈강공') f = '강공';
        if(f === '빈약공') f = '약공';
      }
      // count
      if(f === '강공') countS++;
      else if(f === '약공') countW++;
      else if(f === '쌍약공') countW += 2;
      // other faces (눈, 번개, 빈칸, etc) do nothing for strong die unless replaced - UI doesn't provide replacements for strong die
    }

    for(let i=0;i<weakCount;i++){
      const face = weakDie[randIndex(8)];
      let f = face;
      // weak-die specific replacements
      if(f === '눈'){
        if(weakEyeReplace === 'weak') f = '약공';
        else if(weakEyeReplace === 'strong') f = '강공';
      } else if(f === '번개'){
        if(weakBoltReplace === 'strong') f = '강공';
      }
      // attack stance transforms
      if(attackStance === 'attack'){
        if(f === '빈강공') f = '강공';
        if(f === '빈약공') f = '약공';
      }
      if(f === '강공') countS++;
      else if(f === '약공') countW++;
      else if(f === '쌍약공') countW += 2;
    }

    // sample defense dice
    let countE = 0; // 회피
    let countB = 0; // 방어

    for(let i=0;i<blockCount;i++){
      const face = blockDie[randIndex(8)];
      let f = face;
      // block-die bolt replacement
      if(f === '번개' && blockBoltReplace === 'block'){
        f = '방어';
      }
      // defense stance transforms
      if(defenseStance === 'defense'){
        if(f === '빈쌍방어') f = '쌍방어';
      }
      if(f === '회피') countE++;
      else if(f === '방어') countB++;
      else if(f === '쌍방어') countB += 2;
    }

    for(let i=0;i<dodgeCount;i++){
      const face = dodgeDie[randIndex(8)];
      let f = face;
      if(f === '눈' && dodgeEyeReplace === 'dodge') f = '회피';
      if(f === '회피') countE++;
    }

    // Blocking algorithm (optimal defender play):
    // 1) Use 회피 (countE) to block 강공 as much as possible.
    const blockedS = Math.min(countS, countE);
    let remS = countS - blockedS;
    let remE = countE - blockedS;

    // 2) For 약공, use remaining 회피 (remE) and 방어 (countB)
    const totalBlockersForWeak = remE + countB;
    const blockedW = Math.min(countW, totalBlockersForWeak);
    const remW = countW - blockedW;

    const remainingAttacks = remS + remW;
    if(remainingAttacks > 0) penetrationCount++;

    // progress reporting
    if((run % reportEvery) === 0){
      const prog = (run / RUNS) * 100;
      self.postMessage({type:'progress', progress: prog});
    }
  }

  const penetrationRate = (penetrationCount / RUNS) * 100;
  self.postMessage({type:'result', penetrationRate: penetrationRate});
}, false);

// main.js - UI interactions and worker management
const strongCountEl = document.getElementById('strongCount');
const weakCountEl = document.getElementById('weakCount');
const blockCountEl = document.getElementById('blockCount');
const dodgeCountEl = document.getElementById('dodgeCount');

const strongCountLabel = document.getElementById('strongCountLabel');
const weakCountLabel = document.getElementById('weakCountLabel');
const blockCountLabel = document.getElementById('blockCountLabel');
const dodgeCountLabel = document.getElementById('dodgeCountLabel');

const attackStanceEl = document.getElementById('attackStance');
const defenseStanceEl = document.getElementById('defenseStance');

const weakEyeReplace = document.getElementById('weakEyeReplace');
const weakBoltReplace = document.getElementById('weakBoltReplace');
const blockBoltReplace = document.getElementById('blockBoltReplace');
const dodgeEyeReplace = document.getElementById('dodgeEyeReplace');

const runBtn = document.getElementById('runBtn');
const cancelBtn = document.getElementById('cancelBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultText = document.getElementById('resultText');
const runsLabel = document.getElementById('runsLabel');
const darkToggle = document.getElementById('darkToggle');

const RUNS = 1000000; // 1,000,000 as requested

strongCountEl.addEventListener('input', ()=> strongCountLabel.textContent = strongCountEl.value);
weakCountEl.addEventListener('input', ()=> weakCountLabel.textContent = weakCountEl.value);
blockCountEl.addEventListener('input', ()=> blockCountLabel.textContent = blockCountEl.value);
dodgeCountEl.addEventListener('input', ()=> dodgeCountLabel.textContent = dodgeCountEl.value);

darkToggle.addEventListener('change', ()=> {
  if(darkToggle.checked) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
});

runsLabel.textContent = RUNS.toLocaleString();

let worker = null;
runBtn.addEventListener('click', ()=>{
  // disable UI
  runBtn.disabled = true;
  cancelBtn.disabled = false;
  resultText.textContent = '시뮬레이션 실행 중... (브라우저가 느려질 수 있음)';
  progressFill.style.width = '0%';
  progressText.textContent = '진행률: 0%';
  resultText.scrollIntoView({behavior:'smooth', block:'center'});

  // prepare parameters
  const params = {
    strongCount: Number(strongCountEl.value),
    weakCount: Number(weakCountEl.value),
    blockCount: Number(blockCountEl.value),
    dodgeCount: Number(dodgeCountEl.value),
    attackStance: attackStanceEl.value,
    defenseStance: defenseStanceEl.value,
    weakEyeReplace: weakEyeReplace.value, // none / weak / strong
    weakBoltReplace: weakBoltReplace.value, // none / strong
    blockBoltReplace: blockBoltReplace.value, // none / block
    dodgeEyeReplace: dodgeEyeReplace.value, // none / dodge
    runs: RUNS
  };

  worker = new Worker('worker.js');
  worker.postMessage(params);

  worker.onmessage = (ev) => {
    const msg = ev.data;
    if(msg.type === 'progress'){
      progressFill.style.width = msg.progress + '%';
      progressText.textContent = '진행률: ' + msg.progress.toFixed(1) + '%';
    } else if(msg.type === 'result'){
      const pct = msg.penetrationRate;
      progressFill.style.width = '100%';
      progressText.textContent = '진행률: 100%';
      resultText.innerHTML = `<strong>관통 확률:</strong> ${pct.toFixed(4)} %`;
      runBtn.disabled = false;
      cancelBtn.disabled = true;
      worker.terminate();
      worker = null;
    } else if(msg.type === 'cancelled'){
      resultText.textContent = '시뮬레이션 취소됨.';
      runBtn.disabled = false;
      cancelBtn.disabled = true;
      worker.terminate();
      worker = null;
    }
  };

  worker.onerror = (err) => {
    resultText.textContent = '작업 중 오류가 발생했습니다: ' + err.message;
    runBtn.disabled = false;
    cancelBtn.disabled = true;
    worker.terminate();
    worker = null;
  };
});

cancelBtn.addEventListener('click', ()=>{
  if(worker){
    worker.postMessage({type:'cancel'});
    cancelBtn.disabled = true;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="container">
      <h1>🎲 주사위 시뮬레이터</h1>
      <label>기본 능력치 보정: <span id="statValue">0</span></label><br>
      <input type="range" id="statSlider" min="-2" max="3" value="0"><br><br>
      
      <h3>장비 효과</h3>
      <label><input type="checkbox" value="2"> 파워글러브 (+2)</label><br>
      <label><input type="checkbox" value="1"> 운빨 장비 (+1)</label><br>
      <label><input type="checkbox" value="-2"> 저주받은 반지 (-2)</label><br><br>
      
      <button id="rollBtn">주사위 굴리기!</button>
      <div id="result" style="margin-top:20px;"></div>
    </div>
  `;

  const statSlider = document.getElementById("statSlider");
  const statValue = document.getElementById("statValue");
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  const rollBtn = document.getElementById("rollBtn");
  const resultDiv = document.getElementById("result");

  statSlider.addEventListener("input", () => {
    statValue.textContent = statSlider.value;
  });

  rollBtn.addEventListener("click", () => {
    const baseRoll = Math.floor(Math.random() * 6) + 1;
    const gearBonus = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => Number(cb.value))
      .reduce((a,b) => a+b, 0);
    const total = baseRoll + Number(statSlider.value) + gearBonus;

    let outcome;
    if (total >= 10) outcome = '성공';
    else if (total >= 7) outcome = '부분 성공';
    else outcome = '실패';

    resultDiv.innerHTML = `
      🎯 주사위 눈: ${baseRoll}<br>
      🛡️ 장비 보정: ${gearBonus >= 0 ? '+'+gearBonus : gearBonus}<br>
      📈 총합: ${total}<br>
      ✅ 판정 결과: <b>${outcome}</b>
    `;
  });
});

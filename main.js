
document.addEventListener("DOMContentLoaded", () => {
  const state = {
    strong: 0,
    weak: 0,
    block: 0,
    dodge: 0,
    stanceAttack: false,
    boltToStrong: false,
    eyeToStrong: false,
    eyeToWeak: false,
    stanceDefense: false,
    boltToBlock: false,
    eyeToDodge: false,
  };

  const diceTypes = ["strong", "weak", "block", "dodge"];
  const diceColor = { strong: "red", weak: "yellow", block: "white", dodge: "blue" };
  const maxDice = { strong: 6, weak: 12, block: 12, dodge: 12 };

  diceTypes.forEach(type => renderDiceRow(type));

  function renderDiceRow(type) {
    const count = state[type];
    const row = document.getElementById(type + "Display");
    row.innerHTML = "";
    const max = maxDice[type];
    for (let i = 0; i < max; i++) {
      const div = document.createElement("div");
      div.className = "dice";
      div.style.backgroundImage = `url(img/dice_${i < count ? diceColor[type] : "empty"}.png)`;
      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        state[type] = (i + 1 === state[type]) ? 0 : i + 1;
        renderDiceRow(type);
        updateSimulation();
      });
      div.addEventListener("touchstart", (e) => {
        e.preventDefault();
        state[type] = (i + 1 === state[type]) ? 0 : i + 1;
        renderDiceRow(type);
        updateSimulation();
      });
      row.appendChild(div);
    }
    document.getElementById(type + "Count").textContent = count;
  }

  document.querySelectorAll("#attackOptions .toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.opt;
      state[key] = !state[key];
      btn.classList.toggle("active");
      updateSimulation();
    });
  });

  document.querySelectorAll("#defenseOptions .toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.opt;
      state[key] = !state[key];
      btn.classList.toggle("active");
      updateSimulation();
    });
  });

  function updateSimulation() {
    diceTypes.forEach(renderDiceRow);
    simulate();
  }

  function roll(die) {
    const rolls = {
      strong: ["강공", "강공", "강공", "강공", "빈 강공", "빈 약공", "눈", "번개"],
      weak: ["약공", "약공", "쌍 약공", "쌍 약공", "빈 약공", "눈", "번개", ""],
      block: ["회피", "방어", "빈 쌍 방어", "빈 쌍 방어", "눈", "번개", "번개", ""],
      dodge: ["회피", "회피", "눈", "눈", "번개", "", "", ""],
    };
    const faces = rolls[die];
    return faces[Math.floor(Math.random() * faces.length)];
  }
  
  function strongRoll(count, reroll)
  {
	  let results = [];
	  let rerollCount = 0;
	  
      for (let i = 0; i < count; i++) {
        let r = roll("strong");
        if (r === "빈 강공" && state.stanceAttack) r = "강공";
        else if (r === "빈 약공" && state.stanceAttack) r = "약공";
        else if (r === "번개" && state.boltToStrong) r = "강공";
        else if (r === "눈" && state.eyeToStrong) r = "강공";
        else if (r === "눈" && state.eyeToWeak) r = "약공";
        if (r === "강공") results.push(r);
		if (r === "약공")
		{
			if (state.stanceDefense && reroll) rerollCount++;
			else results.push(r);
		}
		if (r === "빈 강공" || r === "빈 약공" || r === "번개" || r === "눈")
			rerollCount++;
      }
	  
	  if (reroll)
		  results.push(...strongRoll(rerollCount, false));
	  
      results.sort(function compare(a, b) {
        if (a === "강공" && b === "약공") return -1;
        if (a === "약공" && b === "강공") return 1;
        return 0;
      });
	  
	  return results;
  }
  
  function weakRoll(count, reroll)
  {
	  let results = [];
	  let rerollCount = 0;
	  
      for (let i = 0; i < count; i++) {
        let r = roll("weak");
        if (r === "빈 약공" && state.stanceAttack) r = "약공";
        else if (r === "번개" && state.boltToStrong) r = "강공";
        else if (r === "눈" && state.eyeToStrong) r = "강공";
        else if (r === "눈" && state.eyeToWeak) r = "약공";
        if (r === "강공") results.push(r);
        if (r === "약공") results.push("약공");
        else if (r === "쌍 약공") {
          results.push("약공");
          results.push("약공");
        }
		if (r === "빈 약공" || r === "번개" || r === "눈" || r === "")
			rerollCount++;
      }
	  
	  if (reroll)
		  results.push(...weakRoll(rerollCount, false));
	  
	  return results;
  }
  
  function blockRoll(count, reroll)
  {
	  let results = [];
	  let rerollCount = 0;
	  
      for (let i = 0; i < count; i++) {
        let r = roll("block");
        if (r === "빈 쌍 방어" && state.stanceDefense) r = "쌍 방어";
        else if (r === "번개" && state.boltToBlock) r = "방어";
        if (r === "방어" || r === "회피") results.push(r);
        if (r === "쌍 방어") {
          results.push("방어");
          results.push("방어");
        }
		if (r === "빈 쌍 방어" || r === "번개" || r === "눈" || r === "")
			rerollCount++;
      }
	  
	  if (reroll)
		  results.push(...blockRoll(rerollCount, false));
	  
	  return results;
  }
  
  function dodgeRoll(count, reroll)
  {
	  let results = [];
	  let rerollCount = 0;
	  
      for (let i = 0; i < count; i++) {
        let r = roll("dodge");
        if (r === "눈" && state.eyeToDodge) r = "회피";
        if (r === "회피") results.push(r);
		if (r === "번개" || r === "눈" || r === "")
			rerollCount++;
      }
	  
	  if (reroll)
		  results.push(...dodgeRoll(rerollCount, false));
	  
	  return results;
  }

  function simulate() {
    let hit = 0;
    const trials = 10000;

    for (let t = 0; t < trials; t++) {
		let attacks = [
		  ...strongRoll(state.strong, state.atkReroll),
		  ...weakRoll(state.weak, state.atkReroll)
		];

		let blocks = [
		  ...blockRoll(state.block, state.defReroll),
		  ...dodgeRoll(state.dodge, state.defReroll)
		];


      let blocked = 0;
      attacks.forEach(atk => {
        if (atk === "강공") {
          const idx = blocks.indexOf("회피");
          if (idx !== -1) {
            blocks.splice(idx, 1);
            blocked++;
          }
        } else if (atk === "약공") {
          const idx = blocks.findIndex(b => b === "회피" || b === "방어");
          if (idx !== -1) {
            blocks.splice(idx, 1);
            blocked++;
          }
        }
      });

      if (blocked < attacks.length) hit++;
    }

    const percent = ((hit / trials) * 100).toFixed(1);
    document.getElementById("resultText").textContent = `관통 확률: ${percent}%`;
  }

  updateSimulation();
});

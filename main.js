
const emojiMap = {
  strong: "red",
  weak: "yellow",
  block: "white",
  dodge: "blue"
};
const maxMap = {
  strong: 6,
  weak: 10,
  block: 12,
  dodge: 10
};
const state = {
  strong: 0,
  weak: 0,
  block: 0,
  dodge: 0
};

let isDragging = false;
let dragType = null;

function renderDiceRow(type) {
  const container = document.getElementById(type + "Display");
  const counter = document.getElementById(type + "Count");
  container.innerHTML = "";
  counter.textContent = `${state[type]}`;

  for (let i = 0; i < maxMap[type]; i++) {
    const div = document.createElement("div");
    const filled = i < state[type];
    div.className = "dice";
    div.style.backgroundImage = `url('./img/dice_${filled ? emojiMap[type] : "empty"}.png')`;
    div.dataset.index = i;
    div.dataset.type = type;

    div.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragType = type;
      state[type] = i + 1;
      renderDiceRow(type);
    });
    div.addEventListener("touchstart", (e) => {
      isDragging = true;
      dragType = type;
      state[type] = i + 1;
      renderDiceRow(type);
    });

    div.addEventListener("mouseover", () => {
      if (isDragging && dragType === type) {
        state[type] = i + 1;
        renderDiceRow(type);
      }
    });
    div.addEventListener("touchmove", (e) => {
      if (isDragging && dragType === type) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.dataset && element.dataset.index !== undefined && element.dataset.type === type) {
          const newIndex = parseInt(element.dataset.index);
          state[type] = newIndex + 1;
          renderDiceRow(type);
        }
      }
    });

    div.addEventListener("click", () => {
      if (i + 1 === state[type]) {
        state[type] = 0;
      } else {
        state[type] = i + 1;
      }
      renderDiceRow(type);
    });
    div.addEventListener("touchend", () => {
      if (i + 1 === state[type]) {
        state[type] = 0;
      } else {
        state[type] = i + 1;
      }
      renderDiceRow(type);
    });

    container.appendChild(div);
  }

  updateSimulation();
}

document.addEventListener("mousemove", (e) => {
  if (isDragging && dragType) {
    const container = document.getElementById(dragType + "Display");
    const rect = container.getBoundingClientRect();
    const buffer = 18;
    if (e.clientX < rect.left + buffer) {
      if (state[dragType] !== 0) {
        state[dragType] = 0;
        renderDiceRow(dragType);
      }
    }
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  dragType = null;
});

["strong", "weak", "block", "dodge"].forEach(renderDiceRow);

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    updateSimulation();
  });
});

function updateSimulation() {
  const opts = {
    strongCount: state.strong,
    weakCount: state.weak,
    blockCount: state.block,
    dodgeCount: state.dodge,
    stanceAttack: document.querySelector('#attackOptions [data-opt="stance"]')?.classList.contains('active'),
    boltToStrong: document.querySelector('[data-opt="boltToStrong"]')?.classList.contains('active'),
    eyeToStrong: document.querySelector('[data-opt="eyeToStrong"]')?.classList.contains('active'),
    eyeToWeak: document.querySelector('[data-opt="eyeToWeak"]')?.classList.contains('active'),
    stanceDefense: document.querySelector('#defenseOptions [data-opt="stance"]')?.classList.contains('active'),
    boltToBlock: document.querySelector('[data-opt="boltToBlock"]')?.classList.contains('active'),
    eyeToDodge: document.querySelector('[data-opt="eyeToDodge"]')?.classList.contains('active'),
  };

  document.getElementById('resultText').textContent = "시뮬레이션 중...";
  setTimeout(() => {
    const result = simulate(opts);
    document.getElementById('resultText').textContent = `관통 확률: ${result}%`;
  }, 20);
}

// Simulate function stays the same as previous accurate version

function rollDice(sides) {
  const i = Math.floor(Math.random() * sides.length);
  return sides[i];
}

function simulate(opts) {
  const iterations = 1000000;
  let penetrated = 0;

  const strongDice = ["강공", "강공", "강공", "강공", "빈 강공", "빈 약공", "눈", "번개"];
  const weakDice = ["약공", "약공", "쌍 약공", "쌍 약공", "빈 약공", "눈", "번개", "빈 칸"];
  const blockDice = ["회피", "방어", "빈 쌍 방어", "빈 쌍 방어", "눈", "번개", "번개", "빈 칸"];
  const dodgeDice = ["회피", "회피", "눈", "눈", "번개", "빈 칸", "빈 칸", "빈 칸"];

  for (let t = 0; t < iterations; t++) {
    let atkHits = [];

    // Strong dice
    for (let i = 0; i < opts.strongCount; i++) {
      let face = rollDice(strongDice);

      if (opts.stanceAttack) {
        if (face === "빈 강공") face = "강공";
        if (face === "빈 약공") face = "약공";
      }

      if (face === "번개" && opts.boltToStrong) face = "강공";
      if (face === "눈") {
        if (opts.eyeToStrong) face = "강공";
        else if (opts.eyeToWeak) face = "약공";
      }

      if (face === "강공") atkHits.push("강공");
      if (face === "약공") atkHits.push("약공");
    }

    // Weak dice
    for (let i = 0; i < opts.weakCount; i++) {
      let face = rollDice(weakDice);

      if (opts.stanceAttack && face === "빈 약공") face = "약공";
      if (face === "번개" && opts.boltToStrong) face = "강공";
      if (face === "눈") {
        if (opts.eyeToStrong) face = "강공";
        else if (opts.eyeToWeak) face = "약공";
      }

      if (face === "약공") atkHits.push("약공");
      if (face === "쌍 약공") {
        atkHits.push("약공");
        atkHits.push("약공");
      }
      if (face === "강공") atkHits.push("강공");
    }

    let defBlocks = [];

    // Block dice
    for (let i = 0; i < opts.blockCount; i++) {
      let face = rollDice(blockDice);

      if (opts.stanceDefense && face === "빈 쌍 방어") face = "쌍 방어";
      if (face === "번개" && opts.boltToBlock) face = "방어";
      if (face === "눈" && opts.eyeToDodge) face = "회피";

      if (face === "방어") defBlocks.push("방어");
      if (face === "회피") defBlocks.push("회피");
      if (face === "쌍 방어") {
        defBlocks.push("방어");
        defBlocks.push("방어");
      }
    }

    // Dodge dice
    for (let i = 0; i < opts.dodgeCount; i++) {
      let face = rollDice(dodgeDice);

      if (face === "눈" && opts.eyeToDodge) face = "회피";
      if (face === "번개" && opts.boltToBlock) face = "방어";

      if (face === "회피") defBlocks.push("회피");
    }

    // Match attacks to blocks
    let blocksUsed = new Array(defBlocks.length).fill(false);
    let blockedCount = 0;

    atkHitsLoop:
    for (let hit of atkHits) {
      for (let i = 0; i < defBlocks.length; i++) {
        if (blocksUsed[i]) continue;

        if (hit === "강공" && defBlocks[i] === "회피") {
          blocksUsed[i] = true;
          blockedCount++;
          continue atkHitsLoop;
        }
        if (hit === "약공" && (defBlocks[i] === "회피" || defBlocks[i] === "방어")) {
          blocksUsed[i] = true;
          blockedCount++;
          continue atkHitsLoop;
        }
      }
    }

    if (blockedCount < atkHits.length) {
      penetrated++;
    }
  }

  return Math.round((penetrated / iterations) * 100);
}

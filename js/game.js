/**
 * game.js — Main game state, screen management, node handling, events
 *
 * FIXES aplicados:
 *  1. handleMapNode(): el nodo 'start' ya tiene su propio case (no cae al default)
 *  2. goToNextWorld() eliminado — la transición de mundo vive únicamente en afterBattle()
 */

// Validate worlds and enemies configuration
if (typeof validateWorldEnemies === 'function') {
  validateWorldEnemies();
}

// ── Global game state ──────────────────────────────────────
let gs = {
  char:            null,
  map:             null,
  wins:            0,
  currentLevel:    0,
  currentWorldId:  0,
  inventory:       [],
  equippedItems:   [],
  currentKeyblade: null,
  playerLevel:     1,
  pendingNodeId:   null,
  pendingVictory:  false,
  battleActive:    false,
  currentEnemy:    null,
  currentBattleInfo: null,
};

// ── Screen management ──────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Stars background ───────────────────────────────────────
function genStars() {
  const c = document.getElementById('stars');
  for (let i = 0; i < 70; i++) {
    const s  = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${(Math.random()*2+1).toFixed(1)}s;animation-delay:${(Math.random()*2).toFixed(1)}s;`;
    c.appendChild(s);
  }
}

// ── Character selection ────────────────────────────────────
let selIdx = null;

function renderChars() {
  const g = document.getElementById('char-grid');
  g.innerHTML = '';

  CHARS.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'char-card';
    d.id = `cc-${i}`;
    d.onclick = () => selectChar(i);

    const spriteHtml = c.selectImg
      ? `<img src="${c.selectImg}" alt="${c.name}" class="char-select-img" />`
      : c.emoji;

    const FIXED_MAX = 200;
    const hpPct  = Math.min(100, Math.round((c.hp  / FIXED_MAX) * 100));
    const mpPct  = Math.min(100, Math.round((c.mp  / FIXED_MAX) * 100));
    const atkPct = Math.min(100, Math.round((c.atk / FIXED_MAX) * 100));
    const mgkPct = Math.min(100, Math.round((c.mgk / FIXED_MAX) * 100));
    const spdPct = Math.min(100, Math.round((c.spd / FIXED_MAX) * 100));

    d.innerHTML = `
      <span class="char-sprite">${spriteHtml}</span>
      <div class="char-name">${c.name}</div>
      <div class="char-title">${c.title}</div>
      <span class="char-type-badge" style="background:${c.typeColor}22;border:1px solid ${c.typeColor}66;color:${c.typeColor};">${c.typeName}</span>
      <div class="stat-row">
        <div class="stat-label-left">HP</div>
        <div class="stat-value">${c.hp}</div>
        <div class="stat-bar stat-hp"><div class="stat-fill" style="width:${hpPct}%;"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-label-left">MP</div>
        <div class="stat-value">${c.mp}</div>
        <div class="stat-bar stat-mp"><div class="stat-fill" style="width:${mpPct}%;"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-label-left">ATK</div>
        <div class="stat-value">${c.atk}</div>
        <div class="stat-bar stat-atk"><div class="stat-fill" style="width:${atkPct}%;"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-label-left">MAGIC</div>
        <div class="stat-value">${c.mgk}</div>
        <div class="stat-bar stat-mgk"><div class="stat-fill" style="width:${mgkPct}%;"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-label-left">SPD</div>
        <div class="stat-value">${c.spd}</div>
        <div class="stat-bar stat-spd"><div class="stat-fill" style="width:${spdPct}%;"></div></div>
      </div>
    `;
    g.appendChild(d);
  });
}

function selectChar(i) {
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`cc-${i}`).classList.add('selected');
  selIdx = i;
  document.getElementById('btn-start').disabled = false;
}

// ── Stats calculation ──────────────────────────────────────
function getItemById(itemId) {
  return ITEMS.find(i => i.id === itemId) || null;
}

function getKeybladeById(keybladeId) {
  return KEYBLADES.find(k => k.id === keybladeId) || null;
}

function calculateFinalStats() {
  const c = gs.char;
  const baseChar = CHARS.find(ch => ch.id === c.id);
  const level = gs.playerLevel;
  const baseKeybladeAtk = KEYBLADES.find(kb => kb.id === 'kingdomkey')?.atk || 20;

  let finalStats = {
    hp:  baseChar.hp  + Math.floor((level - 1) * STAT_GROWTH.hp),
    atk: baseChar.atk + Math.floor((level - 1) * STAT_GROWTH.atk),
    mgk: baseChar.mgk + Math.floor((level - 1) * STAT_GROWTH.mgk),
    spd: baseChar.spd + Math.floor((level - 1) * STAT_GROWTH.spd),
    mp:  baseChar.mp  + Math.floor((level - 1) * STAT_GROWTH.mp),
  };

  if (gs.currentKeyblade) {
    finalStats.atk += gs.currentKeyblade.atk - baseKeybladeAtk;
  }

  gs.equippedItems.forEach(itemId => {
    const item = getItemById(itemId);
    if (!item) return;
    finalStats[item.stat] += item.bonus;
    if (item.mp_bonus)  finalStats.mp  += item.mp_bonus;
    if (item.mgk_bonus) finalStats.mgk += item.mgk_bonus;
  });

  if (c.bonusStats) {
    finalStats.hp  += c.bonusStats.hp  || 0;
    finalStats.atk += c.bonusStats.atk || 0;
    finalStats.mgk += c.bonusStats.mgk || 0;
    finalStats.spd += c.bonusStats.spd || 0;
    finalStats.mp  += c.bonusStats.mp  || 0;
  }

  return finalStats;
}

function updateCharStats() {
  const finalStats = calculateFinalStats();
  const c = gs.char;

  const oldMaxHp = c.hp;
  const hpRatio  = oldMaxHp > 0 ? (c.currentHp / oldMaxHp) : 1;

  c.hp  = finalStats.hp;
  c.atk = finalStats.atk;
  c.mgk = finalStats.mgk;
  c.spd = finalStats.spd;
  c.mp  = finalStats.mp;
  c.currentHp = Math.min(c.hp, Math.max(1, Math.floor(c.hp * hpRatio)));
  c.currentMp = Math.min(c.mp, c.currentMp);
}

function addInventoryItem(itemId) {
  gs.inventory.push(itemId);
  renderMapCanvas();
}

function toggleEquipItem(itemId) {
  const equippedIndex = gs.equippedItems.indexOf(itemId);
  if (equippedIndex !== -1) {
    gs.equippedItems.splice(equippedIndex, 1);
    updateCharStats();
    renderMapCanvas();
    return;
  }
  if (gs.equippedItems.length >= 2) {
    showEventOverlay({
      icon:  '⚠️',
      title: 'Equip Limit Reached',
      body:  'Only two items can be equipped at the same time. Remove one before equipping another.',
      reward: '',
      onClose: () => {}
    });
    return;
  }
  if (!gs.inventory.includes(itemId)) return;
  gs.equippedItems.push(itemId);
  updateCharStats();
  renderMapCanvas();
}

function unlockKeyblade(keybladeId) {
  const keyblade = getKeybladeById(keybladeId);
  if (!keyblade) return;
  gs.currentKeyblade = keyblade;
  renderMapCanvas();
}

// ── Start run ──────────────────────────────────────────────
function startRun() {
  if (selIdx === null) return;

  const c = CHARS[selIdx];

  gs.char = {
    ...c,
    currentHp: c.hp,
    currentMp: c.mp,
    bonusStats: { hp: 0, atk: 0, mgk: 0, spd: 0, mp: 0 },
  };

  gs.wins            = 0;
  gs.currentWorldId  = 0;
  gs.currentLevel    = 0;
  gs.playerLevel     = 1;
  gs.inventory       = [];
  gs.equippedItems   = [];
  gs.currentKeyblade = KEYBLADES.find(kb => kb.id === 'kingdomkey');
  gs.currentBattleInfo = null;

  gs.map = generateMap(gs.currentWorldId);

  renderMapCanvas();
  showScreen('s-map');
}

// ── Map node handler ───────────────────────────────────────
function handleMapNode(nodeId) {
  const node = gs.map.nodes[nodeId];
  if (!node || !node.available || node.visited) return;

  gs.pendingNodeId = nodeId;

  switch (node.type) {

    case 'start': {
      // Nodo inicial ya visitado — no hacer nada
      break;
    }

    case 'battle': {
      const enemy = pickEnemy(node.level, false, false);
      startBattle(enemy, false, false);
      break;
    }

    case 'boss': {
      const isWorldBoss = node.level === gs.map.levels.length - 1;
      const enemy = pickEnemy(node.level, true, isWorldBoss);
      startBattle(enemy, true, isWorldBoss);
      break;
    }

    case 'save': {
      const hpGain = Math.round(gs.char.hp * 0.4);
      const mpGain = Math.round(gs.char.mp * 0.5);
      gs.char.currentHp = Math.min(gs.char.hp, gs.char.currentHp + hpGain);
      gs.char.currentMp = Math.min(gs.char.mp, gs.char.currentMp + mpGain);
      showEventOverlay({
        icon:  '💾',
        title: 'Save Point',
        body:  'The warm light of the save point washes over you. Your strength is restored.',
        reward: `+${hpGain} HP · +${mpGain} MP`,
        onClose: () => completeNode(nodeId),
      });
      break;
    }

    case 'chest': {
      const rewardIsKeyblade = Math.random() < 0.45;
      if (rewardIsKeyblade) {
        const possible = KEYBLADES.filter(kb => kb.atk > gs.currentKeyblade.atk);
        if (possible.length > 0) {
          const choice = possible[Math.floor(Math.random() * possible.length)];
          gs.currentKeyblade = choice;
          showEventOverlay({
            icon:  '📦',
            title: 'Keyblade Chest',
            body:  'A new Keyblade awakens within the chest. Your base attack grows stronger.',
            reward: `Obtained: ${choice.icon} ${choice.name}`,
            onClose: () => completeNode(nodeId),
          });
          break;
        }
      }
      const itemReward = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      addInventoryItem(itemReward.id);
      showEventOverlay({
        icon:  '📦',
        title: 'Keyblade Chest',
        body:  'The Keyblade resonates with the lock. The chest springs open!',
        reward: `Found: ${itemReward.icon} ${itemReward.name}`,
        onClose: () => completeNode(nodeId),
      });
      break;
    }

    case 'mystery': {
      const ev  = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
      let res   = '';
      if (typeof ev.effect === 'function') {
        res = ev.effect(gs) || '';
      } else {
        res = ev.result || '';
      }
      showEventOverlay({
        icon:  ev.icon,
        title: ev.title,
        body:  ev.body,
        reward: res,
        onClose: () => completeNode(nodeId),
      });
      break;
    }

    case 'moogle': {
      showEventOverlay({
        icon:  '🐾',
        title: 'Moogle Shop',
        body:  'Kupo! Welcome to the Moogle Shop! (Shop system coming soon, kupo!)',
        reward: 'Nothing available yet...',
        onClose: () => completeNode(nodeId),
      });
      break;
    }

    default:
      completeNode(nodeId);
  }
}

function completeNode(nodeId) {
  advanceMap(gs.map, nodeId);
  gs.currentLevel = gs.map.nodes[nodeId].level;
  renderMapCanvas();
  showScreen('s-map');
}

// ── Event overlay ──────────────────────────────────────────
function showEventOverlay({ icon, title, body, reward, onClose }) {
  document.querySelectorAll('.event-overlay').forEach(e => e.remove());

  const ov = document.createElement('div');
  ov.className = 'event-overlay';
  ov.innerHTML = `
    <div class="event-card">
      <span class="event-icon">${icon}</span>
      <div class="event-title">${title}</div>
      <div class="event-body">${body}</div>
      <div class="event-reward">${reward}</div>
      <button class="btn primary" id="ev-close-btn">Continue</button>
    </div>
  `;
  document.getElementById('game').appendChild(ov);
  document.getElementById('ev-close-btn').onclick = () => {
    ov.remove();
    if (onClose) onClose();
  };
}

// ── Victory screen ─────────────────────────────────────────
function showVictoryScreen() {
  const ov = document.createElement('div');
  ov.className = 'event-overlay';
  ov.style.background = 'rgba(4,5,15,.96)';
  ov.innerHTML = `
    <div class="event-card" style="border-color:var(--kh-gold);text-align:center;padding:40px;">
      <span class="event-icon">♥</span>
      <div style="font-family:'Cinzel',serif;font-size:22px;color:var(--kh-gold);letter-spacing:3px;animation:victoryGlow 2s infinite;margin-bottom:10px;">THE LIGHT PREVAILS</div>
      <div class="crown-deco"></div>
      <div class="event-body" style="margin-top:12px;">"Darkness cannot prevail where light endures in the heart."</div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:var(--kh-muted);margin:16px 0;">Heartless Defeated: <span style="color:var(--kh-gold2);">${gs.wins}</span></div>
      <button class="btn primary" onclick="this.closest('.event-overlay').remove();showScreen('s-title');">New Journey</button>
    </div>
  `;
  document.getElementById('game').appendChild(ov);
}

// ── Boot ───────────────────────────────────────────────────
genStars();
renderChars();

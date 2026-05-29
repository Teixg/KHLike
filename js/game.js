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
  char: null,
  map: null,
  wins: 0,
  currentLevel: 0,
  currentWorldId: 0,
  inventory: [],
  equippedItems: [],
  currentKeyblade: null,
  playerLevel: 1,
  pendingNodeId: null,
  pendingVictory: false,
  battleActive: false,
  currentEnemy: null,
  currentBattleInfo: null,
  battleSpeed: 1,
};

// ── Screen management ──────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Save system management ──────────────────────────────────
function saveGame() {
  localStorage.setItem('khlike_savegame', JSON.stringify(gs));
  updateTitleScreenContinueButton();
}

function loadGame() {
  const data = localStorage.getItem('khlike_savegame');
  if (!data) return;
  try {
    const parsed = JSON.parse(data);
    Object.assign(gs, parsed);

    // Migration for renamed ring IDs in active saves
    if (gs.inventory && gs.inventory.length > 0) {
      gs.inventory = gs.inventory.map(id => {
        if (id === 'anillo-experto-6') return 'anillo-experto';
        if (id === 'anillo-experto-7') return 'anillo-maestro';
        return id;
      });
    }

    // Migration for old saves (equippedItems tracking string IDs instead of indices)
    if (gs.equippedItems && gs.equippedItems.length > 0 && typeof gs.equippedItems[0] === 'string') {
      const newEquipped = [];
      gs.equippedItems.forEach(itemId => {
        const idx = gs.inventory.indexOf(itemId);
        if (idx !== -1 && !newEquipped.includes(idx)) {
          newEquipped.push(idx);
        }
      });
      gs.equippedItems = newEquipped;
    }

    // Sync speed UI after loading
    if (typeof updateSpeedButtonUI === 'function') {
      updateSpeedButtonUI();
    }

    renderMapCanvas();
    showScreen('s-map');
  } catch (e) {
    console.error('Error loading save game:', e);
    clearSave();
  }
}

function clearSave() {
  localStorage.removeItem('khlike_savegame');
  updateTitleScreenContinueButton();
}

function updateTitleScreenContinueButton() {
  const btn = document.getElementById('btn-continue-journey');
  if (!btn) return;
  if (localStorage.getItem('khlike_savegame')) {
    btn.style.display = 'inline-flex';
  } else {
    btn.style.display = 'none';
  }
}

function startNewJourney() {
  if (localStorage.getItem('khlike_savegame')) {
    showEventOverlay({
      icon: '⚠️',
      title: 'Overwrite Save',
      body: 'Starting a new journey will erase your current saved game. Do you wish to proceed?',
      reward: '',
      allowReject: true,
      onAccept: () => {
        clearSave();
        showScreen('s-select');
      },
      onReject: () => { }
    });
  } else {
    showScreen('s-select');
  }
}

// ── Stars background ───────────────────────────────────────
function genStars() {
  const c = document.getElementById('stars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;--d:${(Math.random() * 2 + 1).toFixed(1)}s;animation-delay:${(Math.random() * 2).toFixed(1)}s;`;
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
    const hpPct = Math.min(100, Math.round((c.hp / FIXED_MAX) * 100));
    const mpPct = Math.min(100, Math.round((c.mp / FIXED_MAX) * 100));
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
    hp: baseChar.hp + Math.floor((level - 1) * STAT_GROWTH.hp),
    atk: baseChar.atk + Math.floor((level - 1) * STAT_GROWTH.atk),
    mgk: baseChar.mgk + Math.floor((level - 1) * STAT_GROWTH.mgk),
    mp: baseChar.mp + Math.floor((level - 1) * STAT_GROWTH.mp),
    spd: baseChar.spd + Math.floor((level - 1) * STAT_GROWTH.spd),
  };

  if (gs.currentKeyblade) {
    finalStats.atk += gs.currentKeyblade.atk - baseKeybladeAtk;
  }

  gs.equippedItems.forEach(itemIndex => {
    const itemId = gs.inventory[itemIndex];
    const item = getItemById(itemId);
    if (!item) return;
    finalStats[item.stat] += item.bonus;
    if (item.mp_bonus) finalStats.mp += item.mp_bonus;
    if (item.mgk_bonus) finalStats.mgk += item.mgk_bonus;
  });

  if (c.bonusStats) {
    finalStats.hp += c.bonusStats.hp || 0;
    finalStats.atk += c.bonusStats.atk || 0;
    finalStats.mgk += c.bonusStats.mgk || 0;
    finalStats.mp += c.bonusStats.mp || 0;
    finalStats.spd += c.bonusStats.spd || 0;
  }

  return finalStats;
}

function updateCharStats() {
  const finalStats = calculateFinalStats();
  const c = gs.char;

  const oldMaxHp = c.hp;
  const hpRatio = oldMaxHp > 0 ? (c.currentHp / oldMaxHp) : 1;

  c.hp = finalStats.hp;
  c.atk = finalStats.atk;
  c.mgk = finalStats.mgk;
  c.mp = finalStats.mp;
  c.spd = finalStats.spd;
  c.currentHp = Math.min(c.hp, Math.max(1, Math.floor(c.hp * hpRatio)));
  c.currentMp = Math.min(c.mp, c.currentMp);
}

function addInventoryItem(itemId) {
  gs.inventory.push(itemId);
  renderMapCanvas();
  recordItemUnlock(itemId);
}

function toggleEquipItem(index) {
  const idx = parseInt(index, 10);
  const equippedIndex = gs.equippedItems.indexOf(idx);
  if (equippedIndex !== -1) {
    gs.equippedItems.splice(equippedIndex, 1);
    updateCharStats();
    renderMapCanvas();
    return;
  }
  if (gs.equippedItems.length >= 2) {
    showEventOverlay({
      icon: '⚠️',
      title: 'Equip Limit Reached',
      body: 'Only two items can be equipped at the same time. Remove one before equipping another.',
      reward: '',
      onClose: () => { }
    });
    return;
  }
  if (idx < 0 || idx >= gs.inventory.length) return;
  gs.equippedItems.push(idx);
  updateCharStats();
  renderMapCanvas();
}

function recycleItem(index) {
  const idx = parseInt(index, 10);
  if (idx < 0 || idx >= gs.inventory.length) return;
  const itemId = gs.inventory[idx];
  const item = getItemById(itemId);
  if (!item) return;

  // If item is equipped, unequip it first
  const equippedIdx = gs.equippedItems.indexOf(idx);
  if (equippedIdx !== -1) {
    gs.equippedItems.splice(equippedIdx, 1);
  }

  // Remove from inventory
  gs.inventory.splice(idx, 1);

  // Since we removed an item from inventory, all equipped indices after this index need to be decremented by 1
  gs.equippedItems = gs.equippedItems.map(equippedIndex => {
    if (equippedIndex > idx) {
      return equippedIndex - 1;
    }
    return equippedIndex;
  });

  // Randomly choose a stat bonus
  const bonuses = [
    { name: 'Max HP', stat: 'hp', amount: 15, icon: '❤️' },
    { name: 'Strength', stat: 'atk', amount: 1, icon: '⚔️' },
    { name: 'Magic', stat: 'mgk', amount: 1, icon: '✨' },
    { name: 'Max MP', stat: 'mp', amount: 5, icon: '💙' }
  ];
  const choice = bonuses[Math.floor(Math.random() * bonuses.length)];

  // Apply to character's bonusStats
  if (!gs.char.bonusStats) {
    gs.char.bonusStats = { hp: 0, atk: 0, mgk: 0, spd: 0, mp: 0 };
  }
  gs.char.bonusStats[choice.stat] = (gs.char.bonusStats[choice.stat] || 0) + choice.amount;

  updateCharStats();
  renderMapCanvas();
  saveGame();

  // Show visual confirmation overlay
  showEventOverlay({
    icon: '♻️',
    title: 'Item Recycled',
    body: `You dismantled the <b>${item.name}</b> for raw essence.`,
    reward: `Gained +${choice.amount} ${choice.name} permanently! ${choice.icon}`,
    onClose: () => { }
  });
}

function unlockKeyblade(keybladeId) {
  const keyblade = getKeybladeById(keybladeId);
  if (!keyblade) return;
  gs.currentKeyblade = keyblade;
  renderMapCanvas();
  recordKeybladeUnlock(keybladeId);
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

  gs.wins = 0;
  gs.currentWorldId = 0;
  gs.currentLevel = 0;
  gs.playerLevel = 1;
  gs.inventory = [];
  gs.equippedItems = [];
  gs.currentKeyblade = KEYBLADES.find(kb => kb.id === 'kingdomkey');
  gs.currentBattleInfo = null;

  gs.map = generateMap(gs.currentWorldId);

  renderMapCanvas();
  showScreen('s-map');
  saveGame();

  recordKeybladeUnlock('kingdomkey');
  recordPlayerLevel(gs.playerLevel);
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
      saveGame();
      showEventOverlay({
        icon: "<img src='assets/extras/save.png'></img>",
        title: 'Save Point (Game Saved!)',
        body: 'The warm light of the save point washes over you. Your strength is restored.',
        reward: `+${hpGain} HP · +${mpGain} MP`,
        onClose: () => completeNode(nodeId),
      });
      break;
    }

    case 'chest': {
      const rewardIsKeyblade = Math.random() < 0.45;
      if (rewardIsKeyblade) {
        const currentWorld = gs.currentWorldId;
        const possible = KEYBLADES.filter(kb =>
          kb.atk > gs.currentKeyblade.atk &&
          (kb.world === undefined || kb.world <= currentWorld)
        );
        if (possible.length > 0) {
          const choice = possible[Math.floor(Math.random() * possible.length)];
          showEventOverlay({
            icon: '📦',
            title: 'Keyblade Chest',
            body: 'A new Keyblade awakens within the chest. Your base attack grows stronger.',
            reward: `Obtained: ${choice.icon} ${choice.name}`,
            allowReject: true,
            onAccept: () => {
              gs.currentKeyblade = choice;
              recordKeybladeUnlock(choice.id);
              completeNode(nodeId);
            },
            onReject: () => completeNode(nodeId),
          });
          break;
        }
      }
      const itemReward = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      showEventOverlay({
        icon: '📦',
        title: 'Keyblade Chest',
        body: 'The Keyblade resonates with the lock. The chest springs open!',
        reward: `Found: ${itemReward.icon} ${itemReward.name}`,
        allowReject: true,
        onAccept: () => {
          addInventoryItem(itemReward.id);
          completeNode(nodeId);
        },
        onReject: () => completeNode(nodeId),
      });
      break;
    }

    case 'mystery': {
      const ev = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
      let res = '';
      if (typeof ev.effect === 'function') {
        res = ev.effect(gs) || '';
      } else {
        res = ev.result || '';
      }
      showEventOverlay({
        icon: ev.icon,
        title: ev.title,
        body: ev.body,
        reward: res,
        onClose: () => completeNode(nodeId),
      });
      break;
    }

    case 'moogle': {
      showMoogleShop(() => completeNode(nodeId));
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
  saveGame();
}

// ── Event overlay ──────────────────────────────────────────
function showEventOverlay({ icon, title, body, reward, onClose, allowReject, onAccept, onReject }) {
  document.querySelectorAll('.event-overlay').forEach(e => e.remove());

  const ov = document.createElement('div');
  ov.className = 'event-overlay';

  let buttons = '';
  if (allowReject) {
    buttons = `
      <div style="display:flex;gap:8px;justify-content:center;">
        <button class="btn primary" id="ev-accept-btn">✓ Accept</button>
        <button class="btn small dark-btn" id="ev-reject-btn">✗ Reject</button>
      </div>
    `;
  } else {
    buttons = `<button class="btn primary" id="ev-close-btn">Continue</button>`;
  }

  const rewardHtml = reward ? `<div class="event-reward">${reward}</div>` : '';

  ov.innerHTML = `
    <div class="event-card">
      <span class="event-icon">${icon}</span>
      <div class="event-title">${title}</div>
      <div class="event-body">${body}</div>
      ${rewardHtml}
      ${buttons}
    </div>
  `;
  document.getElementById('game').appendChild(ov);

  if (allowReject) {
    document.getElementById('ev-accept-btn').onclick = () => {
      ov.remove();
      if (onAccept) onAccept();
    };
    document.getElementById('ev-reject-btn').onclick = () => {
      ov.remove();
      if (onReject) onReject();
    };
  } else {
    document.getElementById('ev-close-btn').onclick = () => {
      ov.remove();
      if (onClose) onClose();
    };
  }
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

// ── Moogle Shop ────────────────────────────────────────────
function showMoogleShop(onClose) {
  document.querySelectorAll('.event-overlay').forEach(e => e.remove());

  // Seleccionar 2 items aleatorios
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  const item1 = shuffled[0];
  const item2 = shuffled[1];

  const overlayId = 'moogle-shop-' + Date.now();
  const ov = document.createElement('div');
  ov.id = overlayId;
  ov.className = 'event-overlay';
  ov.innerHTML = `
    <div class="event-card" style="max-width:380px;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="assets/npc/Moogle.png" alt="Moogle" style="width:80px;height:auto;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));" />
      </div>
      <div class="event-title" style="text-align:center;">⭐ Moogle Shop</div>
      <div class="event-body" style="text-align:center;margin-bottom:20px;">Kupo! Choose an item for your journey!</div>
      
      <div style="display:flex;gap:12px;margin-bottom:16px;">
        <div class="shop-item-card" onclick="selectMoogleItem('${item1.id}', '${overlayId}')" style="cursor:pointer;">
          <div class="shop-item-icon">${item1.icon}</div>
          <div class="shop-item-name">${item1.name}</div>
          <div class="shop-item-stat">
            ${STAT_ICONS[item1.stat] || ''}
            +${item1.bonus}${item1.mgk_bonus ? ` / ✨+${item1.mgk_bonus}` : ''}
          </div>
        </div>
        
        <div class="shop-item-card" onclick="selectMoogleItem('${item2.id}', '${overlayId}')" style="cursor:pointer;">
          <div class="shop-item-icon">${item2.icon}</div>
          <div class="shop-item-name">${item2.name}</div>
          <div class="shop-item-stat">
            ${STAT_ICONS[item2.stat] || ''}
            +${item2.bonus}${item2.mgk_bonus ? ` / ✨+${item2.mgk_bonus}` : ''}
          </div>
        </div>
      </div>
      
      <button class="btn small dark-btn" style="width:100%;" onclick="skipMoogleShop('${overlayId}')">Skip Shopping</button>
    </div>
  `;
  document.getElementById('game').appendChild(ov);

  // Store onClose callback globally for later use
  window.currentMoogleShopClose = onClose;
}

function selectMoogleItem(itemId, overlayId) {
  addInventoryItem(itemId);
  incrementStat('moogleItemsBought', 1);

  // Remover la tienda
  const overlay = document.getElementById(overlayId);
  if (overlay) overlay.remove();

  renderMapSidePanels();
  if (window.currentMoogleShopClose) {
    window.currentMoogleShopClose();
    window.currentMoogleShopClose = null;
  }
}

function skipMoogleShop(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) overlay.remove();
  if (window.currentMoogleShopClose) {
    window.currentMoogleShopClose();
    window.currentMoogleShopClose = null;
  }
}

// ═══════════════════════════════════════
// PLAYER PROFILE & ACHIEVEMENT SYSTEM
// ═══════════════════════════════════════

let profile = {
  soraWon: false,
  rikuWon: false,
  totalKills: 0,
  unlockedKeyblades: ['kingdomkey'],
  moogleItemsBought: 0,
  unlockedAchievements: [],
  unlockedItems: [],
  closedKeyholes: [],
  maxLevelReached: 1,
  defeatedEnemies: {}
};

function loadProfile() {
  const data = localStorage.getItem('khlike_profile');
  if (data) {
    try {
      profile = JSON.parse(data);
      if (!profile.unlockedKeyblades) profile.unlockedKeyblades = [];
      if (!profile.unlockedAchievements) profile.unlockedAchievements = [];
      if (!profile.unlockedItems) profile.unlockedItems = [];
      if (!profile.closedKeyholes) profile.closedKeyholes = [];
      if (!profile.defeatedEnemies) profile.defeatedEnemies = {};

      // Migration for renamed ring IDs in persistent profile
      if (profile.unlockedItems && profile.unlockedItems.length > 0) {
        profile.unlockedItems = profile.unlockedItems.map(id => {
          if (id === 'anillo-experto-6') return 'anillo-experto';
          if (id === 'anillo-experto-7') return 'anillo-maestro';
          return id;
        });
      }
      if (profile.soraWon === undefined) profile.soraWon = false;
      if (profile.rikuWon === undefined) profile.rikuWon = false;
      if (profile.totalKills === undefined) profile.totalKills = 0;
      if (profile.moogleItemsBought === undefined) profile.moogleItemsBought = 0;
      if (profile.maxLevelReached === undefined) profile.maxLevelReached = 1;
    } catch (e) {
      console.error('Error loading profile:', e);
      resetProfile();
    }
  } else {
    resetProfile();
  }
}

function saveProfile() {
  localStorage.setItem('khlike_profile', JSON.stringify(profile));
}

function resetProfile() {
  profile = {
    soraWon: false,
    rikuWon: false,
    totalKills: 0,
    unlockedKeyblades: ['kingdomkey'],
    moogleItemsBought: 0,
    unlockedAchievements: [],
    unlockedItems: [],
    closedKeyholes: [],
    maxLevelReached: 1,
    defeatedEnemies: {}
  };
  saveProfile();
}

function incrementStat(statName, amt) {
  if (profile[statName] !== undefined) {
    profile[statName] += amt;
    saveProfile();
    checkAchievements();
  }
}

function recordKeybladeUnlock(keybladeId) {
  if (!profile.unlockedKeyblades.includes(keybladeId)) {
    profile.unlockedKeyblades.push(keybladeId);
    saveProfile();
    checkAchievements();
  }
}

function recordItemUnlock(itemId) {
  if (!profile.unlockedItems) profile.unlockedItems = [];
  if (!profile.unlockedItems.includes(itemId)) {
    profile.unlockedItems.push(itemId);
    saveProfile();
    checkAchievements();
  }
}

function recordKeyholeClosed(worldId) {
  if (!profile.closedKeyholes) profile.closedKeyholes = [];
  const numericId = parseInt(worldId, 10);
  if (!profile.closedKeyholes.includes(numericId)) {
    profile.closedKeyholes.push(numericId);
    saveProfile();
    checkAchievements();
  }
}

function recordEnemyDefeat(enemyId) {
  if (!profile.defeatedEnemies) profile.defeatedEnemies = {};
  profile.defeatedEnemies[enemyId] = (profile.defeatedEnemies[enemyId] || 0) + 1;
  saveProfile();
  checkAchievements();
}

function recordPlayerLevel(level) {
  if (!profile.maxLevelReached || level > profile.maxLevelReached) {
    profile.maxLevelReached = level;
    saveProfile();
    checkAchievements();
  }
}

function recordGameVictory(charId) {
  if (charId === 'sora') {
    profile.soraWon = true;
  } else if (charId === 'riku') {
    profile.rikuWon = true;
  }
  saveProfile();
  checkAchievements();
}

function getAchievementProgress(id) {
  switch (id) {
    case 'sora_victory':
      return profile.soraWon ? 1 : 0;
    case 'riku_victory':
      return profile.rikuWon ? 1 : 0;
    case 'kills_10':
    case 'kills_50':
    case 'kills_100':
      return profile.totalKills;
    case 'moogle_shop':
      return profile.moogleItemsBought;
    case 'moogle_shop_15':
      return profile.moogleItemsBought;
    case 'keyblades_5':
    case 'keyblades_15':
      return profile.unlockedKeyblades.length;
    case 'first_keyhole':
      return (profile.closedKeyholes || []).length;
    case 'keyholes_4':
      return (profile.closedKeyholes || []).length;
    case 'all_keyholes':
      return (profile.closedKeyholes || []).length;
    case 'all_items':
      return (profile.unlockedItems || []).length;
    case 'level_30':
      return profile.maxLevelReached || 1;
    case 'level_50':
      return profile.maxLevelReached || 1;
    default:
      return 0;
  }
}

function checkAchievements() {
  let anyNewUnlocks = false;
  ACHIEVEMENTS.forEach(ach => {
    if (profile.unlockedAchievements.includes(ach.id)) {
      return;
    }

    const progress = getAchievementProgress(ach.id);
    if (progress >= ach.maxProgress) {
      profile.unlockedAchievements.push(ach.id);
      triggerAchievementUnlock(ach);
      anyNewUnlocks = true;
    }
  });

  if (anyNewUnlocks) {
    saveProfile();
  }
}

function triggerAchievementUnlock(ach) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';

  toast.innerHTML = `
    <svg class="toast-bg" viewBox="0 0 380 80">
      <defs>
        <linearGradient id="toastGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#121212" />
          <stop offset="60%" stop-color="#181818" />
          <stop offset="100%" stop-color="#242424" />
        </linearGradient>
      </defs>
      <path d="M 58 10 L 350 10 L 375 40 L 350 70 L 58 70 A 35 35 0 1 1 58 10 Z" fill="url(#toastGrad)" stroke="#ffffff" stroke-width="2.5" />
    </svg>
    <div class="toast-icon-wrap">
      ${ach.icon}
    </div>
    <div class="toast-text-wrap">
      <div class="toast-obtained">OBTAINED</div>
      <div class="toast-name">${ach.name}</div>
      <div class="toast-desc">${ach.desc}</div>
    </div>
  `;

  const container = document.getElementById('game');
  if (container) {
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
      // Fallback removal
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 500);
    }, 4500);
  }
}

let achievementsReturnScreen = 's-title';

function showAchievements() {
  achievementsReturnScreen = 's-title';
  renderAchievements();
  showScreen('s-achievements');
}

function showAchievementsFromMap() {
  achievementsReturnScreen = 's-map';
  renderAchievements();
  showScreen('s-achievements');
}

function returnFromAchievements() {
  showScreen(achievementsReturnScreen);
}

function showTutorial() {
  const firstTabBtn = document.querySelector('.tut-tab-btn');
  if (firstTabBtn) {
    switchTutorialTab('tut-exploration', firstTabBtn);
  }
  showScreen('s-tutorial');
}

function switchTutorialTab(tabId, btn) {
  document.querySelectorAll('.tutorial-tab-content').forEach(el => el.style.display = 'none');
  const target = document.getElementById(tabId);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.tut-tab-btn').forEach(b => {
    b.classList.remove('primary');
    b.classList.add('dark-btn');
  });
  btn.classList.remove('dark-btn');
  btn.classList.add('primary');
}

function renderAchievements() {
  const container = document.getElementById('achievements-list');
  if (!container) return;
  container.innerHTML = '';

  let unlockedCount = 0;
  ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = profile.unlockedAchievements.includes(ach.id);
    if (isUnlocked) {
      unlockedCount++;
    }

    const currentProgress = getAchievementProgress(ach.id);
    const maxProgress = ach.maxProgress;
    const progressPct = Math.min(100, Math.round((currentProgress / maxProgress) * 100));

    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

    card.innerHTML = `
      <div class="achievement-icon-wrap">
        ${ach.icon}
      </div>
      <div class="achievement-info">
        <h4 class="achievement-name">${ach.name}</h4>
        <p class="achievement-desc">${ach.desc}</p>
      </div>
      <div class="achievement-progress-wrap">
        <div class="achievement-progress-text">${currentProgress} / ${maxProgress}</div>
        <div class="achievement-progress-bar">
          <div class="achievement-progress-fill" style="width: ${progressPct}%;"></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  const percentEl = document.getElementById('ach-percent');
  const summaryEl = document.getElementById('achievements-summary');
  if (percentEl) {
    const pct = ACHIEVEMENTS.length > 0 ? Math.round((unlockedCount / ACHIEVEMENTS.length) * 100) : 0;
    percentEl.textContent = `${pct}%`;
  }
  if (summaryEl) {
    const pct = ACHIEVEMENTS.length > 0 ? Math.round((unlockedCount / ACHIEVEMENTS.length) * 100) : 0;
    summaryEl.innerHTML = `Completed: <span id="ach-percent" style="color:var(--kh-gold2); font-weight:bold;">${pct}%</span> (${unlockedCount}/${ACHIEVEMENTS.length})`;
  }
}

// ═══════════════════════════════════════
// JIMINY'S JOURNAL SYSTEM
// ═══════════════════════════════════════

const WORLD_JOURNAL_INFO = {
  0: {
    story: "A quiet, dark town where travelers who have lost their worlds gather. Sora and his friends begin their journey here, uncovering the mystery of the heartless and meeting allies like Leon, Aerith, and Yuffie.",
    bossLore: "A giant suit of armor animated by Heartless energy. It guards the Town's district boundaries and must be dismantled piece by piece to restore safety."
  },
  1: {
    story: "A bizarre world full of nonsensical rules, talking cards, and shrinking potions. Riku and Sora search for Alice, who is falsely accused of theft by the tyrannical Queen of Hearts.",
    bossLore: "A tall, spindly Heartless that uses fire-tipped torches to burn down everything in its path. It moves erratic and swings violently."
  },
  2: {
    story: "A wild, uncharted rainforest filled with dense trees, vines, and primal Heartless. Guided by Tarzan, Sora and Riku learn the true meaning of trust and friendship.",
    bossLore: "A biological mass resembling a carnivorous plant combined with a locked cage, capable of swallowing its victims whole to harness their energy."
  },
  3: {
    story: "The legendary arena of heroes, ruled by Zeus and trained by Phil. Sora and Riku face trials of strength and cross paths with Hercules and the Lord of the Underworld, Hades.",
    bossLore: "The hot-headed ruler of the Underworld who uses fiery punches and pillars of flame to burn down anyone standing in his way."
  },
  4: {
    story: "A dry desert land of sandstorms and ancient treasures. Here, Aladdin and the Genie fight to protect Princess Jasmine from the evil vizier Jafar, who seeks the magic lamp.",
    bossLore: "Jafar transformed into a giant, red Genie by his final wish. He commands molten rocks and fireballs from a floating platform."
  },
  5: {
    story: "The spooky world of Halloween, populated by ghosts, ghouls, and pumpkin lanterns. Jack Skellington tries to recruit Heartless for his spooky festival, but they grow out of control.",
    bossLore: "A giant burlap sack filled with bugs and malice. He rolls dice to trigger mechanical traps and spike beds around his tower."
  },
  6: {
    story: "A grand, decaying fortress where shadows run deep. This is the birthplace of many Heartless, where Sora and Riku must confront their own dark duplicates and save their loved ones.",
    bossLore: "An replica of Riku created from data, possessing all of his strength and fighting styles, fueled by darkness and resentment."
  },
  7: {
    story: "A mysterious castle of white marble where memories fade and change. This is the final fortress where Marluxia and Organization XIII pull the strings of Sora's heart.",
    bossLore: "The Graceful Assassin and Lord of Castle Oblivion. He commands giant scythes and showers of cherry blossom petals that slice through defense."
  }
};

const ENEMY_LORE = {
  'shadow': "The most common form of Heartless. Small, swift, and prone to sinking into the floor to avoid incoming attacks.",
  'soldier': "An armored Heartless that is quick on its feet. It attacks with claw strikes and spinning kick maneuvers.",
  'guardarmor': "A giant boss Heartless composed of armored plates. It guards the Traverse Town gates.",
  'rednocturne': "A magical Heartless that floats in the air and attacks by casting Fire spells.",
  'cardspades': "A card soldier of the Queen of Hearts. It fights fiercely using its steel spear.",
  'cardhearts': "A loyal guard of the Queen's palace. It uses its halberd to protect the court.",
  'trickmaster': "A fiery boss Heartless that stalks Wonderland, wielding flaming torches.",
  'powerwild': "A mischievous ape-like Heartless that excels in leaping attacks and throwing fruit.",
  'bouncywild': "A female counterpart to Powerwild. It shoots slingshot pellets and drops slippery banana peels.",
  'creeperplant': "A stationary root-like Heartless that shoots seeds from its bulb.",
  'parasitecage': "A monstrous parasite Heartless that feeds on organic matter from inside its cage.",
  'tornadostep': "A spinning propeller-headed Heartless that attacks with high-speed dashes.",
  'pirate': "A sword-wielding Heartless modeled after sea captains. It charges forward with slashing strikes.",
  'airsoldier': "A winged Heartless that flies above the battlefield, diving down to slam its targets.",
  'hades': "The Lord of the Underworld. Wields hellfire and enters an enraged state when pushed.",
  'bandit': "A scimitar-wielding desert Heartless that runs and slices targets with high speed.",
  'fatbandit': "A heavy, fire-breathing desert Heartless. Its front side blocks all physical attacks.",
  'wizard': "A master of magic. Casts elemental spells and can teleport to escape damage.",
  'geniejafar': "Jafar's ultimate form. A towering crimson genie possessing infinite magical energy.",
  'wightknight': "A mummy-wrapped Heartless that leaps out of shadows with clawing attacks.",
  'searchghost': "A floating ghost-like Heartless that absorbs health and light from its victims.",
  'gargoyle': "A stone-winged gargoyle Heartless that throws dual energy boomerangs.",
  'oogieboogie': "A bug-filled burlap sack that uses traps and rigged games to defeat his foes.",
  'defender': "An elite knight Heartless carrying a heavy shield that casts fireballs and blocks attacks.",
  'wyvern': "A massive flying dragon Heartless that charges and stomps with heavy claws.",
  'darkball': "A shadow-like orb of pure negative energy that bites and teleports randomly.",
  'rikureplica': "A clone of Riku engineered by Vexen, using darkness to copy the Keyblade's strength.",
  'blackfungus': "A rare, metallic mushroom-like Heartless. It is extremely tough and yields gold or rare items.",
  'organizationXIII': "A mysterious coat-wearing warrior of the Organization, using rapid strikes and keyblade-like movements.",
  'neoshadow': "A highly advanced Heartless. Swift, aggressive, and capable of pinning down its targets in shadow pools.",
  'marluxia': "The Graceful Assassin, ruler of Castle Oblivion. Wields a scythe and controls cherry blossoms."
};

let journalReturnScreen = 's-title';
let activeJournalTab = 'chronicles';
let selectedJournalIndex = 0;

function showJournal() {
  journalReturnScreen = 's-title';
  showScreen('s-journal');
  switchJournalTab('chronicles', document.getElementById('tab-chronicles'));
}

function showJournalFromMap() {
  journalReturnScreen = 's-map';
  showScreen('s-journal');
  switchJournalTab('chronicles', document.getElementById('tab-chronicles'));
}

function returnFromJournal() {
  showScreen(journalReturnScreen);
}

function switchJournalTab(tabId, btn) {
  activeJournalTab = tabId;
  selectedJournalIndex = 0;

  // Clear search field when switching tabs
  const searchInput = document.getElementById('journal-search');
  if (searchInput) searchInput.value = '';

  // Show search bar only for Enemies, Keyblades, Accessories
  const searchWrap = document.getElementById('journal-search-wrap');
  if (searchWrap) {
    if (tabId === 'enemies' || tabId === 'keyblades' || tabId === 'items') {
      searchWrap.style.display = 'block';
    } else {
      searchWrap.style.display = 'none';
    }
  }

  // Update tabs active state
  document.querySelectorAll('.journal-tab').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');
  }

  // Update Left Title
  const leftTitle = document.getElementById('journal-left-title');
  if (leftTitle) {
    if (tabId === 'chronicles') leftTitle.textContent = 'Chronicles';
    else if (tabId === 'enemies') leftTitle.textContent = 'Enemies';
    else if (tabId === 'keyblades') leftTitle.textContent = 'Keyblades';
    else if (tabId === 'items') leftTitle.textContent = 'Accessories';
    else if (tabId === 'records') leftTitle.textContent = 'Records';
  }

  renderJournalList();
  renderJournalCompletionStamps();
}

function onJournalSearchInput() {
  renderJournalList();
}

function renderJournalList() {
  const listEl = document.getElementById('journal-left-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const searchInput = document.getElementById('journal-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (activeJournalTab === 'chronicles') {
    WORLDS.forEach(world => {
      // Unlocked if visited (index <= currentWorldId) OR if we closed its keyhole in a past run
      const isUnlocked = (gs.char && world.id <= gs.currentWorldId) ||
        (profile.closedKeyholes && profile.closedKeyholes.includes(world.id));

      const item = document.createElement('div');
      item.className = `journal-list-item ${isUnlocked ? 'unlocked' : 'locked'} ${selectedJournalIndex === world.id ? 'active' : ''}`;

      let isSealed = profile.closedKeyholes && profile.closedKeyholes.includes(world.id);

      item.innerHTML = `
        <span class="journal-item-name">${isUnlocked ? world.name : `World ${world.id + 1} (locked)`}</span>
        ${isSealed ? `<span class="journal-item-badge"><img src="assets/extras/MickeyChek.png" alt="Sealed" style="width:14px;height:auto;vertical-align:middle;margin-left:4px;" /></span>` : ''}
      `;

      item.onclick = () => {
        selectedJournalIndex = world.id;
        document.querySelectorAll('.journal-list-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderJournalDetail(world.id);
      };

      listEl.appendChild(item);
    });

    renderJournalDetail(selectedJournalIndex);

  } else if (activeJournalTab === 'enemies') {
    const enemies = ENEMY_TEMPLATES.filter(enemy => {
      const isDefeated = profile.defeatedEnemies && profile.defeatedEnemies[enemy.id] > 0;
      const matchName = isDefeated ? enemy.name.toLowerCase() : '???';
      return matchName.includes(query);
    });

    if (enemies.length === 0) {
      listEl.innerHTML = `<div class="journal-empty-msg">No enemies found</div>`;
      renderJournalDetail(null);
      return;
    }

    enemies.forEach((enemy, idx) => {
      const isDefeated = profile.defeatedEnemies && profile.defeatedEnemies[enemy.id] > 0;

      const item = document.createElement('div');
      item.className = `journal-list-item ${isDefeated ? 'unlocked' : 'locked'} ${selectedJournalIndex === idx ? 'active' : ''}`;

      item.innerHTML = `
        <div class="journal-item-thumb ${isDefeated ? '' : 'silhouetted'}">${enemy.icon}</div>
        <span class="journal-item-name">${isDefeated ? enemy.name : '???'}</span>
      `;

      item.onclick = () => {
        selectedJournalIndex = idx;
        document.querySelectorAll('.journal-list-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderJournalDetail(enemy);
      };

      listEl.appendChild(item);
    });

    renderJournalDetail(enemies[selectedJournalIndex] || null);

  } else if (activeJournalTab === 'keyblades') {
    const keyblades = KEYBLADES.filter(kb => {
      const isUnlocked = profile.unlockedKeyblades && profile.unlockedKeyblades.includes(kb.id);
      const matchName = isUnlocked ? kb.name.toLowerCase() : '???';
      return matchName.includes(query);
    });

    if (keyblades.length === 0) {
      listEl.innerHTML = `<div class="journal-empty-msg">No keyblades found</div>`;
      renderJournalDetail(null);
      return;
    }

    keyblades.forEach((kb, idx) => {
      const isUnlocked = profile.unlockedKeyblades && profile.unlockedKeyblades.includes(kb.id);

      const item = document.createElement('div');
      item.className = `journal-list-item ${isUnlocked ? 'unlocked' : 'locked'} ${selectedJournalIndex === idx ? 'active' : ''}`;

      item.innerHTML = `
        <div class="journal-item-thumb ${isUnlocked ? '' : 'silhouetted'}">${kb.icon}</div>
        <span class="journal-item-name">${isUnlocked ? kb.name : '???'}</span>
      `;

      item.onclick = () => {
        selectedJournalIndex = idx;
        document.querySelectorAll('.journal-list-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderJournalDetail(kb);
      };

      listEl.appendChild(item);
    });

    renderJournalDetail(keyblades[selectedJournalIndex] || null);

  } else if (activeJournalTab === 'items') {
    const items = ITEMS.filter(item => {
      const isUnlocked = profile.unlockedItems && profile.unlockedItems.includes(item.id);
      const matchName = isUnlocked ? item.name.toLowerCase() : '???';
      return matchName.includes(query);
    });

    if (items.length === 0) {
      listEl.innerHTML = `<div class="journal-empty-msg">No accessories found</div>`;
      renderJournalDetail(null);
      return;
    }

    items.forEach((item, idx) => {
      const isUnlocked = profile.unlockedItems && profile.unlockedItems.includes(item.id);

      const itemEl = document.createElement('div');
      itemEl.className = `journal-list-item ${isUnlocked ? 'unlocked' : 'locked'} ${selectedJournalIndex === idx ? 'active' : ''}`;

      itemEl.innerHTML = `
        <div class="journal-item-thumb ${isUnlocked ? '' : 'silhouetted'}">${item.icon}</div>
        <span class="journal-item-name">${isUnlocked ? item.name : '???'}</span>
      `;

      itemEl.onclick = () => {
        selectedJournalIndex = idx;
        document.querySelectorAll('.journal-list-item').forEach(el => el.classList.remove('active'));
        itemEl.classList.add('active');
        renderJournalDetail(item);
      };

      listEl.appendChild(itemEl);
    });

    renderJournalDetail(items[selectedJournalIndex] || null);

  } else if (activeJournalTab === 'records') {
    // Records left page is stats summary, right page is achievements list
    renderJournalDetail('records');
  }
}

function renderJournalDetail(selectedItem) {
  const detailEl = document.getElementById('journal-right-detail');
  if (!detailEl) return;
  detailEl.innerHTML = '';

  if (selectedItem === null) {
    detailEl.innerHTML = `<div class="journal-detail-empty">Select an entry from the index to view details.</div>`;
    return;
  }

  if (activeJournalTab === 'chronicles') {
    const worldId = selectedItem;
    const world = WORLDS[worldId];
    const isUnlocked = (gs.char && world.id <= gs.currentWorldId) ||
      (profile.closedKeyholes && profile.closedKeyholes.includes(world.id));

    if (!isUnlocked) {
      detailEl.innerHTML = `
        <div class="journal-locked-detail">
          <div class="journal-locked-icon silhouetted">${world.icon}</div>
          <h3 class="cinzel">Locked World</h3>
          <p>This world has not been visited on your journeys yet.</p>
          <p class="journal-muted-tip">Continue playing the game and clearing rooms to unlock this world page.</p>
        </div>
      `;
      return;
    }

    const isSealed = profile.closedKeyholes && profile.closedKeyholes.includes(world.id);
    const worldInfo = WORLD_JOURNAL_INFO[world.id] || { story: 'Explore the world.', bossLore: 'Defeat the boss.' };

    detailEl.innerHTML = `
      <div class="journal-detail-view scrollable-content">
        <div class="world-detail-header">
          <div class="world-detail-logo">${world.icon}</div>
          <h2 class="world-detail-title cinzel">${world.name}</h2>
          <div class="world-detail-subtitle">Floor levels: ${world.levelRange[0]} - ${world.levelRange[1]}</div>
        </div>

        <div class="world-detail-seal-status ${isSealed ? 'sealed' : 'unsealed'}">
          ${isSealed ? '🏆 Keyhole Sealed' : '⚠️ Keyhole Unsealed'}
        </div>

        <h4 class="journal-section-header">Chronicle</h4>
        <p class="journal-body-text">${worldInfo.story}</p>

        <h4 class="journal-section-header">Boss Adversary</h4>
        <p class="world-boss-name"><b>${ENEMY_TEMPLATES.find(e => e.id === world.boss)?.name || 'Unknown'}</b></p>
        <p class="journal-body-text">${worldInfo.bossLore}</p>
        
        ${isSealed ? `
          <div class="journal-gold-seal">
            <svg viewBox="0 0 100 100" class="mickey-seal">
              <circle cx="50" cy="55" r="22" fill="#c9a84c" opacity="0.8"/>
              <circle cx="28" cy="30" r="13" fill="#c9a84c" opacity="0.8"/>
              <circle cx="72" cy="30" r="13" fill="#c9a84c" opacity="0.8"/>
              <text x="50" y="90" font-family="'Cinzel', serif" font-size="8" fill="#5a461c" font-weight="bold" text-anchor="middle">SEALED</text>
            </svg>
          </div>
        ` : ''}
      </div>
    `;

  } else if (activeJournalTab === 'enemies') {
    const enemy = selectedItem;
    const isDefeated = profile.defeatedEnemies && profile.defeatedEnemies[enemy.id] > 0;

    if (!isDefeated) {
      detailEl.innerHTML = `
        <div class="journal-locked-detail">
          <div class="journal-locked-icon silhouetted">${enemy.icon}</div>
          <h3 class="cinzel">Enemy ???</h3>
          <p>You have not defeated this opponent yet.</p>
          <p class="journal-muted-tip">Find this enemy in the world nodes to log their coordinates.</p>
        </div>
      `;
      return;
    }

    const lore = ENEMY_LORE[enemy.id] || "A dark presence encountered along the way.";
    const originWorld = WORLDS[enemy.worldId] ? WORLDS[enemy.worldId].name : 'Unknown World';
    const defeatCount = profile.defeatedEnemies[enemy.id];

    detailEl.innerHTML = `
      <div class="journal-detail-view scrollable-content">
        <div class="enemy-detail-header">
          <div class="enemy-detail-sprite">${enemy.icon}</div>
          <h2 class="enemy-detail-title cinzel">${enemy.name}</h2>
          <div class="enemy-detail-type">${enemy.type || 'Heartless'} · Origin: ${originWorld}</div>
        </div>

        <h4 class="journal-section-header">Description</h4>
        <p class="journal-body-text">${lore}</p>

        <h4 class="journal-section-header">Combat Stats (Base)</h4>
        <div class="enemy-stats-grid">
          <div class="enemy-stat-card">
            <span class="stat-lbl">Base HP</span>
            <span class="stat-val">${enemy.baseHp}</span>
          </div>
          <div class="enemy-stat-card">
            <span class="stat-lbl">Base ATK</span>
            <span class="stat-val">${enemy.baseAtk}</span>
          </div>
          <div class="enemy-stat-card">
            <span class="stat-lbl">Defeated</span>
            <span class="stat-val" style="color:var(--kh-gold); font-weight:bold;">${defeatCount} ${defeatCount === 1 ? 'time' : 'times'}</span>
          </div>
        </div>
      </div>
    `;

  } else if (activeJournalTab === 'keyblades') {
    const kb = selectedItem;
    const isUnlocked = profile.unlockedKeyblades && profile.unlockedKeyblades.includes(kb.id);

    if (!isUnlocked) {
      detailEl.innerHTML = `
        <div class="journal-locked-detail">
          <div class="journal-locked-icon silhouetted" style="transform: scale(1.5); margin: 20px 0;">${kb.icon}</div>
          <h3 class="cinzel">Keyblade ???</h3>
          <p>This Keyblade has not been unlocked.</p>
          <p class="journal-muted-tip">Find this weapon in chests or clear boss fights to unlock its secrets.</p>
        </div>
      `;
      return;
    }

    const originWorld = WORLDS[kb.world] ? WORLDS[kb.world].name : 'Special Unlock';

    detailEl.innerHTML = `
      <div class="journal-detail-view scrollable-content">
        <div class="keyblade-detail-header">
          <div class="keyblade-detail-icon">${kb.icon}</div>
          <h2 class="keyblade-detail-title cinzel" style="margin-top:10px;">${kb.name}</h2>
          <div class="keyblade-detail-origin">World: ${originWorld}</div>
        </div>

        <h4 class="journal-section-header">Stats & Abilities</h4>
        <div class="keyblade-stats-box">
          <div class="keyblade-stat-line">
            <span>Strength rating (ATK)</span>
            <strong style="color:var(--kh-gold2);">${kb.atk}</strong>
          </div>
        </div>

        <h4 class="journal-section-header">Journal Entry</h4>
        <p class="journal-body-text" style="font-style: italic;">"${kb.description}"</p>
      </div>
    `;

  } else if (activeJournalTab === 'items') {
    const item = selectedItem;
    const isUnlocked = profile.unlockedItems && profile.unlockedItems.includes(item.id);

    if (!isUnlocked) {
      detailEl.innerHTML = `
        <div class="journal-locked-detail">
          <div class="journal-locked-icon silhouetted" style="transform: scale(1.5); margin: 20px 0;">${item.icon}</div>
          <h3 class="cinzel">Accessory ???</h3>
          <p>This accessory has not been discovered yet.</p>
          <p class="journal-muted-tip">Buy items from Moogle Shops or open world chests to discover accessories.</p>
        </div>
      `;
      return;
    }

    let statDescription = '';
    if (item.stat === 'spd') statDescription = `Increases character Speed by +${item.bonus} points, improving Dodge Roll and Double Strike chances in combat.`;
    else if (item.stat === 'hp') statDescription = `Increases maximum Health Points (HP) by +${item.bonus} points, enhancing durability.`;
    else if (item.stat === 'atk') statDescription = `Boosts physical Attack (ATK) power by +${item.bonus} points.`;
    else if (item.stat === 'mgk') statDescription = `Enhances Magic (MGK) rating by +${item.bonus} points, increasing spell damage and Cure spell potency.`;
    else if (item.stat === 'mp') statDescription = `Increases maximum Mana Points (MP) by +${item.bonus} points.`;

    detailEl.innerHTML = `
      <div class="journal-detail-view scrollable-content">
        <div class="item-detail-header">
          <div class="item-detail-icon">${item.icon}</div>
          <h2 class="item-detail-title cinzel" style="margin-top:10px;">${item.name}</h2>
          <div class="item-detail-stat-wrap">
            ${STAT_ICONS[item.stat] || ''} <span style="font-weight:bold; color:var(--kh-gold2);">+${item.bonus}</span>
          </div>
        </div>

        <h4 class="journal-section-header">Effect & Properties</h4>
        <p class="journal-body-text">${statDescription}</p>

        <h4 class="journal-section-header">Dismantling Bonus</h4>
        <p class="journal-body-text">Recycling this item at the forge yields a random, permanent bonus to Max HP, Max MP, Strength, or Magic.</p>
      </div>
    `;

  } else if (selectedItem === 'records') {
    // Chronicles completion calculation
    const worldSeals = profile.closedKeyholes ? profile.closedKeyholes.length : 0;
    const worldSealsPct = Math.round((worldSeals / WORLDS.length) * 100);

    // Enemies completion calculation
    const defeatedCount = Object.keys(profile.defeatedEnemies || {}).length;
    const defeatedPct = Math.round((defeatedCount / ENEMY_TEMPLATES.length) * 100);

    // Keyblades completion calculation
    const keybladeCount = profile.unlockedKeyblades ? profile.unlockedKeyblades.length : 0;
    const keybladePct = Math.round((keybladeCount / KEYBLADES.length) * 100);

    // Items completion calculation
    const itemsCount = profile.unlockedItems ? profile.unlockedItems.length : 0;
    const itemsPct = Math.round((itemsCount / ITEMS.length) * 100);

    // Achievements completion calculation
    const unlockedAchCount = profile.unlockedAchievements ? profile.unlockedAchievements.length : 0;
    const achPct = Math.round((unlockedAchCount / ACHIEVEMENTS.length) * 100);

    // Overall completion calculation
    const overallPct = Math.round((worldSealsPct + defeatedPct + keybladePct + itemsPct + achPct) / 5);

    // Left Page (rendered in the left container directly, overwriting listEl!)
    const listEl = document.getElementById('journal-left-list');
    if (listEl) {
      listEl.innerHTML = `
        <div class="journal-detail-view scrollable-content" style="color:#1a1a24; font-family:'Crimson Text', serif; font-size: 13px;">
          <h3 class="cinzel" style="font-size:16px; border-bottom:1px solid #7c683b; padding-bottom:4px; margin-bottom:10px;">General Statistics</h3>
          <div class="journal-stats-summary">
            <div class="journal-stat-line"><span>Sora Cleared:</span> <strong>${profile.soraWon ? 'YES ✅' : 'NO ❌'}</strong></div>
            <div class="journal-stat-line"><span>Riku Cleared:</span> <strong>${profile.rikuWon ? 'YES ✅' : 'NO ❌'}</strong></div>
            <div class="journal-stat-line"><span>Max Level Reached:</span> <strong>LV ${profile.maxLevelReached || 1}</strong></div>
            <div class="journal-stat-line"><span>Total Foes Defeated:</span> <strong>${profile.totalKills || 0}</strong></div>
            <div class="journal-stat-line"><span>Moogle Shop Buys:</span> <strong>${profile.moogleItemsBought || 0}</strong></div>
          </div>

          <h3 class="cinzel" style="font-size:16px; border-bottom:1px solid #7c683b; padding-bottom:4px; margin-bottom:10px; margin-top:14px;">Completion Rates</h3>
          <div class="journal-progress-rows" style="display:flex; flex-direction:column; gap:6px;">
            <div>
              <div class="journal-progress-label"><span>Worlds Sealed:</span> <span>${worldSeals}/${WORLDS.length} (${worldSealsPct}%)</span></div>
              <div class="journal-bar"><div class="journal-fill" style="width:${worldSealsPct}%"></div></div>
            </div>
            <div>
              <div class="journal-progress-label"><span>Bestiary Logged:</span> <span>${defeatedCount}/${ENEMY_TEMPLATES.length} (${defeatedPct}%)</span></div>
              <div class="journal-bar"><div class="journal-fill" style="width:${defeatedPct}%"></div></div>
            </div>
            <div>
              <div class="journal-progress-label"><span>Keyblades Unlocked:</span> <span>${keybladeCount}/${KEYBLADES.length} (${keybladePct}%)</span></div>
              <div class="journal-bar"><div class="journal-fill" style="width:${keybladePct}%"></div></div>
            </div>
            <div>
              <div class="journal-progress-label"><span>Accessories Found:</span> <span>${itemsCount}/${ITEMS.length} (${itemsPct}%)</span></div>
              <div class="journal-bar"><div class="journal-fill" style="width:${itemsPct}%"></div></div>
            </div>
            <div>
              <div class="journal-progress-label"><span>Achievements Earned:</span> <span>${unlockedAchCount}/${ACHIEVEMENTS.length} (${achPct}%)</span></div>
              <div class="journal-bar"><div class="journal-fill" style="width:${achPct}%"></div></div>
            </div>
          </div>
          
          <div class="journal-overall-score" style="margin-top:16px; padding:10px; border-radius:10px; background: rgba(90, 75, 44, 0.08); border: 1px dashed #7c683b; text-align:center;">
            <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5d5a69;">Overall Score</div>
            <div class="cinzel" style="font-size:24px; font-weight:bold; color:#7c683b;">${overallPct}%</div>
          </div>
        </div>
      `;
    }

    // Right Page details: achievements list scrollable!
    detailEl.innerHTML = `
      <div class="journal-detail-view scrollable-content">
        <h3 class="cinzel" style="font-size:16px; border-bottom:1px solid #7c683b; padding-bottom:4px; margin-bottom:12px; color:#1a1a24;">🏆 Achievements List</h3>
        <div id="journal-achievements-container" class="journal-achievements-list">
          <!-- Dynamically injected achievements cards -->
        </div>
      </div>
    `;

    // Render achievements inside the scrollable container
    const achContainer = document.getElementById('journal-achievements-container');
    if (achContainer) {
      ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = profile.unlockedAchievements.includes(ach.id);
        const currentProgress = getAchievementProgress(ach.id);
        const maxProgress = ach.maxProgress;
        const progressPct = Math.min(100, Math.round((currentProgress / maxProgress) * 100));

        const card = document.createElement('div');
        card.className = `journal-ach-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="journal-ach-icon ${isUnlocked ? '' : 'silhouetted'}">
            ${ach.icon}
          </div>
          <div class="journal-ach-info">
            <div class="journal-ach-name">${ach.name}</div>
            <div class="journal-ach-desc">${ach.desc}</div>
            <div class="journal-ach-progress-bar">
              <div class="journal-ach-progress-fill" style="width: ${progressPct}%;"></div>
            </div>
            <div class="journal-ach-progress-text">${currentProgress} / ${maxProgress}</div>
          </div>
        `;
        achContainer.appendChild(card);
      });
    }

    if (overallPct === 100) {
      detailEl.innerHTML += `
        <div class="journal-gold-seal" style="bottom: 10px; right: 10px;">
          <svg viewBox="0 0 100 100" class="mickey-seal">
            <circle cx="50" cy="55" r="22" fill="#c9a84c" opacity="0.85"/>
            <circle cx="28" cy="30" r="13" fill="#c9a84c" opacity="0.85"/>
            <circle cx="72" cy="30" r="13" fill="#c9a84c" opacity="0.85"/>
            <text x="50" y="90" font-family="'Cinzel', serif" font-size="7" fill="#5a461c" font-weight="bold" text-anchor="middle">COMPLETE</text>
          </svg>
        </div>
      `;
    }
  }
}

function renderJournalCompletionStamps() {
  // Check completion of each tab
  // Tab 1: Chronicles
  const chroniclesSealed = profile.closedKeyholes ? profile.closedKeyholes.length : 0;
  const isChroniclesComplete = (chroniclesSealed === WORLDS.length);

  // Tab 2: Enemies
  const defeatedCount = Object.keys(profile.defeatedEnemies || {}).length;
  const isEnemiesComplete = (defeatedCount === ENEMY_TEMPLATES.length);

  // Tab 3: Keyblades
  const keybladeCount = profile.unlockedKeyblades ? profile.unlockedKeyblades.length : 0;
  const isKeybladesComplete = (keybladeCount === KEYBLADES.length);

  // Tab 4: Accessories
  const itemsCount = profile.unlockedItems ? profile.unlockedItems.length : 0;
  const isItemsComplete = (itemsCount === ITEMS.length);

  // Tab 5: Records
  const unlockedAchCount = profile.unlockedAchievements ? profile.unlockedAchievements.length : 0;
  const isRecordsComplete = (unlockedAchCount === ACHIEVEMENTS.length);

  updateTabStamp('tab-chronicles', isChroniclesComplete);
  updateTabStamp('tab-enemies', isEnemiesComplete);
  updateTabStamp('tab-keyblades', isKeybladesComplete);
  updateTabStamp('tab-items', isItemsComplete);
  updateTabStamp('tab-records', isRecordsComplete);
}

function updateTabStamp(tabId, isComplete) {
  const btn = document.getElementById(tabId);
  if (!btn) return;

  // Remove existing stamp icon if any
  const oldStamp = btn.querySelector('.tab-complete-stamp');
  if (oldStamp) oldStamp.remove();

  if (isComplete) {
    const stamp = document.createElement('img');
    stamp.className = 'tab-complete-stamp';
    stamp.src = 'assets/extras/MickeyChek.png';
    stamp.style.width = '12px';
    stamp.style.height = 'auto';
    stamp.style.marginLeft = '4px';
    stamp.style.verticalAlign = 'middle';
    btn.appendChild(stamp);
  }
}

// ── Boot ───────────────────────────────────────────────────
loadProfile();
genStars();
renderChars();
updateSpeedButtonUI();
updateTitleScreenContinueButton();

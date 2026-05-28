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
      onReject: () => {}
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
    onClose: () => {}
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
  maxLevelReached: 1
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
    maxLevelReached: 1
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

// ── Boot ───────────────────────────────────────────────────
loadProfile();
genStars();
renderChars();
updateSpeedButtonUI();
updateTitleScreenContinueButton();

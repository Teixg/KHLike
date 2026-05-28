/**
 * battle.js — Turn-based battle system
 *
 * FIXES aplicados:
 *  1. pickEnemy() ahora resuelve IDs de string a objetos de ENEMY_TEMPLATES
 *  2. getScaledEnemy() eliminada de aquí — definición canónica en data.js
 *  3. endBattle(): la derrota contra jefe ya NO avanza al siguiente mundo
 *  4. afterBattle(): usa generateMap() en lugar de generateWorldMap() (inexistente)
 *  5. Lógica de transición de mundo unificada en afterBattle(); endBattle() ya no la duplica
 */

// ───────────────────────────────────────────────────────────
// pickEnemy — resuelve IDs string → objetos ENEMY_TEMPLATES
// ───────────────────────────────────────────────────────────

function pickEnemy(nodeLevel, isBoss = false, isWorldBoss = false) {

  const world = WORLDS[gs.currentWorldId];

  if (!world) {
    console.error('World not found:', gs.currentWorldId);
    return null;
  }

  let enemyPool = [];

  if (isBoss || isWorldBoss) {
    // El jefe del mundo está referenciado por world.boss (string ID)
    const bossTemplate = ENEMY_TEMPLATES.find(e => e.id === world.boss);
    if (bossTemplate) {
      enemyPool = [bossTemplate];
    } else {
      console.error(`Boss "${world.boss}" not found in ENEMY_TEMPLATES`);
      return null;
    }
  } else {
    // world.enemies es un array de string IDs — los resolvemos a objetos
    enemyPool = world.enemies
      .map(id => ENEMY_TEMPLATES.find(e => e.id === id))
      .filter(Boolean);
  }

  if (!enemyPool.length) {
    console.error('Enemy pool empty for world:', world.name);
    return null;
  }

  const enemyTemplate = enemyPool[Math.floor(Math.random() * enemyPool.length)];
  return getScaledEnemy(enemyTemplate, nodeLevel);
}

// ───────────────────────────────────────────────────────────
// startBattle
// ───────────────────────────────────────────────────────────

function startBattle(enemy, isBoss, isFinal) {
  if (!enemy || typeof enemy.hp !== 'number' || isNaN(enemy.hp)) {
    console.error('Invalid enemy in startBattle:', enemy);
    return;
  }

  enemy.currentHp = enemy.hp;

  gs.currentEnemy   = enemy;
  gs.battleActive   = true;
  gs.pendingVictory = false;

  const c = gs.char;
  document.getElementById('battle-result').style.display = 'none';
  document.getElementById('boss-banner').style.display = isBoss ? 'block' : 'none';

  const keybladeName = gs.currentKeyblade
    ? `${gs.currentKeyblade.icon} ${gs.currentKeyblade.name}`
    : 'No Keyblade';

  const levelDisplay = `
    <div style="display:flex;justify-content:space-between;width:100%;">
      <span>${c.name}</span>
      <span style="color:#ffffff;font-size:11px;">Lv.${gs.playerLevel}</span>
    </div>
    <div style="display:flex;justify-content:space-between;width:100%;font-size:10px;color:#ffffff;margin-top:2px;">
      <span>Keyblade</span><span>${keybladeName}</span>
    </div>`;

  document.getElementById('p-name').innerHTML  = levelDisplay;
  document.getElementById('p-sprite').innerHTML = c.emoji;
  document.getElementById('e-name').textContent = enemy.name;
  document.getElementById('e-type').textContent = enemy.type;
  document.getElementById('e-sprite').innerHTML  = enemy.icon;
  
  // Aplicar tamaño del sprite del enemigo
  const enemySpriteEl = document.getElementById('e-sprite');
  if (enemy.iconHeight) {
    enemySpriteEl.style.fontSize = enemy.iconHeight + 'px';
    const imgEl = enemySpriteEl.querySelector('img');
    if (imgEl) {
      imgEl.style.height = enemy.iconHeight + 'px';
      imgEl.style.width = 'auto';
    }
  }

  updateBattleBars();
  renderCommands();

  const log = document.getElementById('battle-log');
  log.innerHTML = `
    <div class="log-line log-system">— ENCOUNTER —</div>
    <div class="log-line">
      <span style="color:var(--kh-heart);font-family:'Cinzel',serif;font-size:10px;">${enemy.type.toUpperCase()}</span>
      — <b>${enemy.name}</b> appeared!
    </div>`;

  gs.currentBattleInfo = { isFinal, enemy };

  const speedBtn = document.getElementById('btn-skip-battle');
  if (speedBtn) {
    speedBtn.style.display = 'inline-flex';
    updateSpeedButtonUI();
  }

  showScreen('s-battle');
  setTimeout(() => autoBattleStart(), 600 * gs.battleSpeed);
}

// ───────────────────────────────────────────────────────────
// Auto-battle loop
// ───────────────────────────────────────────────────────────

function autoBattleStart() {
  if (!gs.battleActive) return;
  playerAutoAttack();
}

function toggleBattleSpeed() {
  if (gs.battleSpeed === 1) {
    gs.battleSpeed = 0.25; // 4x faster
  } else {
    gs.battleSpeed = 1; // Normal speed
  }
  updateSpeedButtonUI();
}

function updateSpeedButtonUI() {
  const btnBattle = document.getElementById('btn-skip-battle');
  const btnGlobal = document.getElementById('btn-global-speed');
  
  if (gs.battleSpeed === 1) {
    if (btnBattle) {
      btnBattle.innerHTML = '<img src="assets/extras/Donald-Duck.png" class="speed-btn-icon" alt="Donald" /> Fast Mode';
      btnBattle.className = 'btn small primary';
    }
    if (btnGlobal) {
      btnGlobal.innerHTML = '<img src="assets/extras/Donald-Duck.png" class="speed-btn-icon" alt="Donald" /> Fast Mode';
      btnGlobal.className = 'btn tiny primary';
    }
  } else {
    if (btnBattle) {
      btnBattle.innerHTML = '<img src="assets/extras/Goofy.png" class="speed-btn-icon" alt="Goofy" /> Normal Mode';
      btnBattle.className = 'btn small dark-btn';
    }
    if (btnGlobal) {
      btnGlobal.innerHTML = '<img src="assets/extras/Goofy.png" class="speed-btn-icon" alt="Goofy" /> Normal Mode';
      btnGlobal.className = 'btn tiny dark-btn';
    }
  }
}

function retreatFromBattle() {
  gs.battleActive = false;
  const skipBtn = document.getElementById('btn-skip-battle');
  if (skipBtn) {
    skipBtn.style.display = 'none';
  }
  showScreen('s-map');
  saveGame();
}

function playerAutoAttack() {
  if (!gs.battleActive) return;
  const c = gs.char, e = gs.currentEnemy;
  const finalStats = calculateFinalStats();

  // 1. MP Regeneration (+5 MP on player's turn)
  c.currentMp = Math.min(c.mp, (c.currentMp || 0) + 5);

  // 2. Spell Casting Checks
  // A. Cure Spell (when HP < 40% and MP >= 50, with 30% activation chance)
  if (c.currentHp < c.hp * 0.4 && c.currentMp >= 50 && Math.random() < 0.3) {
    const healAmount = Math.round(finalStats.mgk * 2.5);
    c.currentHp = Math.min(c.hp, c.currentHp + healAmount);
    c.currentMp -= 50;
    addLog(`💚 <b>${c.name}</b> casts <b>Cure</b>! <span style="color:var(--kh-green); font-weight:bold;">+${healAmount} HP</span> recovered.`, 'log-heal');
    updateBattleBars();
    
    setTimeout(enemyAutoAttack, 700 * gs.battleSpeed);
    return;
  }

  // B. Offensive Magic (30% chance when MP >= 15)
  if (c.currentMp >= 15 && Math.random() < 0.3) {
    const spellVariance = Math.floor(Math.random() * 6) - 2;
    const spellDmg = Math.max(1, Math.round(finalStats.mgk * 1.5 + spellVariance));
    e.currentHp = Math.max(0, e.currentHp - spellDmg);
    c.currentMp -= 15;
    spriteShake('e-sprite');

    if (c.id === 'riku') {
      addLog(`🔮 <b>Riku</b> casts <b>Dark Firaga</b>! Deals <b style="color:#aa44ff;">${spellDmg}</b> magic damage.`, 'log-magic');
    } else {
      const spells = [
        { name: 'Fire', color: '#ff8866', icon: '🔥' },
        { name: 'Blizzard', color: '#66ccff', icon: '❄️' },
        { name: 'Thunder', color: '#ffdd00', icon: '⚡' }
      ];
      const selectedSpell = spells[Math.floor(Math.random() * spells.length)];
      addLog(`${selectedSpell.icon} <b>Sora</b> casts <b>${selectedSpell.name}</b>! Deals <b style="color:${selectedSpell.color};">${spellDmg}</b> magic damage.`, 'log-magic');
    }
    updateBattleBars();

    if (e.currentHp <= 0) { endBattle(true); return; }
    setTimeout(enemyAutoAttack, 700 * gs.battleSpeed);
    return;
  }

  // 3. Physical Attack
  const variance   = Math.floor(Math.random() * 6) - 2;
  const dmg        = Math.max(1, Math.round(finalStats.atk + variance));
  e.currentHp = Math.max(0, e.currentHp - dmg);
  spriteShake('e-sprite');
  addLog(`🗡️ <b>${c.name}</b> attacks for <b style="color:#ff8866;">${dmg}</b>`, 'log-action');
  updateBattleBars();

  if (e.currentHp <= 0) { endBattle(true); return; }

  // 4. Double Strike Check (based on Speed, chance = spd * 0.5%, max 40%)
  const doubleStrikeChance = Math.min(40, finalStats.spd * 0.5);
  if (Math.random() * 100 < doubleStrikeChance) {
    const dVariance = Math.floor(Math.random() * 6) - 2;
    const doubleDmg = Math.max(1, Math.round(finalStats.atk + dVariance));
    e.currentHp = Math.max(0, e.currentHp - doubleDmg);
    spriteShake('e-sprite');
    addLog(`🗡️ <b>Double Strike!</b> <b>${c.name}</b> attacks again for <b style="color:#ff8866;">${doubleDmg}</b>!`, 'log-action');
    updateBattleBars();

    if (e.currentHp <= 0) { endBattle(true); return; }
  }

  setTimeout(enemyAutoAttack, 700 * gs.battleSpeed);
}

function enemyAutoAttack() {
  if (!gs.battleActive) return;
  const c = gs.char, e = gs.currentEnemy;
  const finalStats = calculateFinalStats();

  // 1. MP Regeneration (+5 MP when hit)
  c.currentMp = Math.min(c.mp, (c.currentMp || 0) + 5);

  // 2. Dodge Check (based on Speed, chance = spd * 0.4%, max 35%)
  const dodgeChance = Math.min(35, finalStats.spd * 0.4);
  if (Math.random() * 100 < dodgeChance) {
    addLog(`💨 <b>${c.name}</b> dodges the attack!`, 'log-action');
    updateBattleBars();
    setTimeout(playerAutoAttack, 600 * gs.battleSpeed);
    return;
  }

  // 3. Enemy Deal Damage
  const variance = Math.floor(Math.random() * 6) - 2;
  const dmg      = Math.max(1, Math.round(e.atk + variance));
  c.currentHp = Math.max(0, c.currentHp - dmg);
  spriteShake('p-sprite');
  addLog(`💢 <b>${e.name}</b> attacks for <b style="color:#ff6644;">${dmg}</b>`, 'log-enemy');
  updateBattleBars();

  if (c.currentHp <= 0) { endBattle(false); return; }
  setTimeout(playerAutoAttack, 600 * gs.battleSpeed);
}

// ───────────────────────────────────────────────────────────
// UI helpers
// ───────────────────────────────────────────────────────────

function updateBattleBars() {
  const c = gs.char, e = gs.currentEnemy;
  const pp = c.currentHp / c.hp * 100;
  const ep = e.currentHp / e.hp * 100;
  const mp = c.currentMp / c.mp * 100;

  document.getElementById('p-hp-txt').textContent = `${c.currentHp}/${c.hp}`;
  document.getElementById('e-hp-txt').textContent = `${e.currentHp}/${e.hp}`;

  const pb = document.getElementById('p-hp-bar');
  pb.style.width      = pp + '%';
  pb.style.background = pp > 50 
    ? 'linear-gradient(180deg, #b4ec16 0%, #299a07 100%)' 
    : pp > 20 
      ? 'linear-gradient(180deg, #ffd700 0%, #d88a00 100%)' 
      : 'linear-gradient(180deg, #ff5566 0%, #990011 100%)';
  pb.style.boxShadow = pp > 50 
    ? '0 0 8px rgba(180, 236, 22, 0.4)' 
    : pp > 20 
      ? '0 0 8px rgba(255, 215, 0, 0.4)' 
      : '0 0 8px rgba(255, 85, 102, 0.4)';

  const eb = document.getElementById('e-hp-bar');
  eb.style.width      = ep + '%';
  eb.style.background = ep > 50 
    ? 'linear-gradient(180deg, #ff6699 0%, #b30047 100%)' 
    : ep > 20 
      ? 'linear-gradient(180deg, #ffaa44 0%, #b35500 100%)' 
      : 'linear-gradient(180deg, #ff3333 0%, #800000 100%)';
  eb.style.boxShadow = ep > 50 
    ? '0 0 8px rgba(255, 102, 153, 0.4)' 
    : ep > 20 
      ? '0 0 8px rgba(255, 170, 68, 0.4)' 
      : '0 0 8px rgba(255, 51, 51, 0.4)';

  document.getElementById('p-mp-bar').style.width = mp + '%';
}

function renderCommands() {
  const menu = document.getElementById('cmd-menu');
  menu.innerHTML = `<div class="auto-battle-note">Auto Battle — actions handled automatically</div>`;
}

function addLog(html, cls) {
  const log = document.getElementById('battle-log');
  const d   = document.createElement('div');
  d.className = 'log-line' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  log.appendChild(d);
  while (log.children.length > 5) log.removeChild(log.firstChild);
  log.scrollTop = log.scrollHeight;
}

function spriteShake(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 350);
}

// ───────────────────────────────────────────────────────────
// enemyTurn
// ───────────────────────────────────────────────────────────

function enemyTurn() {
  const c = gs.char, e = gs.currentEnemy;
  const dmg = Math.max(1, e.atk + Math.floor(Math.random() * 6) - 2);
  c.currentHp  = Math.max(0, c.currentHp - dmg);
  c.currentMp  = Math.min(c.mp, c.currentMp + 10);
  spriteShake('p-sprite');
  addLog(`💢 <b>${e.name}</b> attacks for <b style="color:#ff6644;">${dmg}</b>`, 'log-enemy');
  updateBattleBars();

  if (c.currentHp <= 0) {
    endBattle(false);
  } else {
    gs.battleActive = true;
    renderCommands();
  }
}

// ───────────────────────────────────────────────────────────
// endBattle — FIX: la derrota contra jefe ya NO avanza de mundo
// ───────────────────────────────────────────────────────────

function endBattle(won) {
  gs.battleActive = false;
  renderCommands();

  const skipBtn = document.getElementById('btn-skip-battle');
  if (skipBtn) {
    skipBtn.style.display = 'none';
  }

  const ov = document.getElementById('battle-result');
  const rt = document.getElementById('res-title');
  const rs = document.getElementById('res-sub');
  const rr = document.getElementById('res-rewards');
  ov.style.display = 'flex';

  if (won) {
    gs.wins++;
    if (typeof incrementStat === 'function') {
      incrementStat('totalKills', 1);
    }

    const oldStats = {
      hp: gs.char.hp, atk: gs.char.atk,
      mgk: gs.char.mgk, mp: gs.char.mp,
    };

    gs.playerLevel++;
    updateCharStats();
    if (typeof recordPlayerLevel === 'function') {
      recordPlayerLevel(gs.playerLevel);
    }

    const statGains = {
      hp:  gs.char.hp  - oldStats.hp,
      atk: gs.char.atk - oldStats.atk,
      mgk: gs.char.mgk - oldStats.mgk,
      mp:  gs.char.mp  - oldStats.mp,
    };

    rt.textContent = '✦ VICTORY ✦';
    rt.className   = 'result-title result-victory';
    rs.textContent = `${gs.currentEnemy.name} has been defeated.`;

    let rewardsText = `
      <div class="levelup-capsule">
        <div class="levelup-left">
          <div class="levelup-lvup">LV UP!</div>
          <div class="levelup-num">${gs.playerLevel}</div>
        </div>
        <div class="levelup-right">
          <div class="levelup-watermark">LEVEL UP</div>
          <div class="levelup-stats">
            ${statGains.atk > 0 ? `<div class="levelup-stat-line">Strength increased!</div>` : ''}
            ${statGains.hp > 0 ? `<div class="levelup-stat-line">Maximum HP increased!</div>` : ''}
            ${statGains.mgk > 0 ? `<div class="levelup-stat-line">Magic increased!</div>` : ''}
            ${statGains.mp > 0 ? `<div class="levelup-stat-line">Maximum MP increased!</div>` : ''}
          </div>
          <div class="levelup-sprite-container">
            ${gs.char.id === 'riku'
              ? `<img src="assets/characters/Riku.png" class="levelup-char-sprite" alt="Riku" />`
              : `<img src="assets/characters/Sora.png" class="levelup-char-sprite" alt="Sora" />`
            }
          </div>
        </div>
      </div>
    `;

    // Curación del 15% después de cada batalla
    const healAmount = Math.ceil(gs.char.hp * 0.15);
    gs.char.currentHp = Math.min(gs.char.hp, gs.char.currentHp + healAmount);

    rewardsText += `<div class="victory-other-rewards">`;
    if (gs.currentEnemy.reward) {
      rewardsText += `<div class="victory-reward-item"><img src="assets/extras/reward.png" class="victory-reward-icon" alt="Reward" /> Reward: ${gs.currentEnemy.reward}</div>`;
    }
    rewardsText += `<div class="victory-heal-msg"><img src="assets/extras/hpOrb.png" class="victory-heal-icon" alt="HP recovered" /> +${healAmount} HP recovered</div>`;
    rewardsText += `</div>`;

    rr.innerHTML     = rewardsText;
    rr.style.display = 'block';
    document.getElementById('res-btn').textContent = 'Continue Journey';
    document.getElementById('res-btn').onclick = () => handleBossReward(gs.currentBattleInfo);
    gs.pendingVictory = true;

  } else {
    // DERROTA — nunca avanzar al siguiente mundo
    rt.textContent  = 'Darkness Prevails...';
    rt.className    = 'result-title result-defeat';
    rs.innerHTML    = '&ldquo;Even in the deepest darkness, there will always be a light to guide you.&rdquo;';
    rr.style.display = 'none';
    document.getElementById('res-btn').textContent = 'Return to Title';
    gs.pendingVictory = false;
  }
}

// ───────────────────────────────────────────────────────────
// afterBattle — FIX: usa generateMap() (existente) en lugar de
//               generateWorldMap() (inexistente); lógica de
//               transición unificada aquí, no duplicada en endBattle
// ───────────────────────────────────────────────────────────

function afterBattle() {
  if (gs.pendingVictory) {
    // ¿Era el jefe final del mundo?
    if (gs.currentBattleInfo?.isFinal) {
      if (typeof recordKeyholeClosed === 'function') {
        recordKeyholeClosed(gs.currentWorldId);
      }
      const currentWorld = WORLDS[gs.currentWorldId];
      const nextWorldId  = gs.currentWorldId + 1;

      if (nextWorldId < WORLDS.length) {
        const nextWorld = WORLDS[nextWorldId];
        gs.currentWorldId = nextWorldId;

        // Ajustar nivel del jugador al rango del nuevo mundo
        gs.playerLevel = nextWorld.levelRange[0];
        if (typeof recordPlayerLevel === 'function') {
          recordPlayerLevel(gs.playerLevel);
        }
        
        // Curación completa al cambiar de mundo
        gs.char.currentHp = gs.char.hp;

        console.log(`🌍 World transition: ${currentWorld.name} → ${nextWorld.name}`);

        // FIX: generateMap() es la función correcta (mapgen.js)
        gs.map = generateMap(gs.currentWorldId);
        gs.pendingNodeId     = null;
        gs.currentBattleInfo = null;

        renderMapCanvas();
        saveGame();

        showEventOverlay({
          icon:  nextWorld.icon || '🌍',
          title: nextWorld.name,
          body:  'A new world opens before you.',
          reward: `World ${gs.currentWorldId + 1}/${WORLDS.length}`,
          onClose: () => showScreen('s-map'),
        });

      } else {
        // ¡Juego completado!
        clearSave();
        if (typeof recordGameVictory === 'function') {
          recordGameVictory(gs.char.id);
        }
        showEventOverlay({
          icon:  '👑',
          title: 'You Have Prevailed!',
          body:  'All worlds have been conquered. The Keyblade War is over.',
          reward: '',
          onClose: () => showScreen('s-title'),
        });
      }
      return;
    }

    // Victoria en combate normal — avanzar al siguiente nodo
    if (gs.pendingNodeId) {
      advanceMap(gs.map, gs.pendingNodeId);
      gs.currentLevel = gs.map.nodes[gs.pendingNodeId].level;
    }
    gs.currentBattleInfo = null;
    renderMapCanvas();
    showScreen('s-map');
    saveGame();

  } else {
    // Derrota → volver al título
    clearSave();
    showScreen('s-title');
  }
}

// ───────────────────────────────────────────────────────────
// handleBossReward — Show accept/reject overlay for boss loot
// ───────────────────────────────────────────────────────────

function handleBossReward(battleInfo) {
  if (!battleInfo || !battleInfo.isBoss) {
    // No boss loot - proceed to next stage
    afterBattle();
    return;
  }

  const enemy = gs.currentEnemy;
  const rewardName = enemy.reward;

  // Check if reward is a keyblade
  const rewardKeyblade = KEYBLADES.find(kb => kb.name === rewardName);
  if (rewardKeyblade) {
    if (rewardKeyblade.atk > gs.currentKeyblade.atk) {
      showEventOverlay({
        icon:  '⚔️',
        title: 'Boss Keyblade Drop',
        body:  `${enemy.name} drops its treasured blade. Will you claim it?`,
        reward: `${rewardKeyblade.icon} ${rewardKeyblade.name} (ATK: ${rewardKeyblade.atk})`,
        allowReject: true,
        onAccept: () => {
          gs.currentKeyblade = rewardKeyblade;
          if (typeof recordKeybladeUnlock === 'function') {
            recordKeybladeUnlock(rewardKeyblade.id);
          }
          afterBattle();
        },
        onReject: () => afterBattle(),
      });
    } else {
      // The player already has a stronger keyblade. Convert to a random accessory.
      const rareItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      showEventOverlay({
        icon:  '📦',
        title: 'Treasure Converted',
        body:  `You already possess a stronger weapon than the ${rewardKeyblade.name}. The blade's essence condenses into a rare accessory!`,
        reward: `Obtained: ${rareItem.icon} ${rareItem.name}`,
        allowReject: true,
        onAccept: () => {
          addInventoryItem(rareItem.id);
          afterBattle();
        },
        onReject: () => afterBattle(),
      });
    }
    return;
  }

  // Check if reward is an item
  const rewardItem = ITEMS.find(i => i.name === rewardName);
  if (rewardItem) {
    showEventOverlay({
      icon:  '📦',
      title: 'Treasure Obtained',
      body:  `${enemy.name} drops a valuable treasure. Will you take it?`,
      reward: `${rewardItem.icon} ${rewardItem.name}`,
      allowReject: true,
      onAccept: () => {
        addInventoryItem(rewardItem.id);
        afterBattle();
      },
      onReject: () => afterBattle(),
    });
    return;
  }

  // Unknown reward type - just continue
  afterBattle();
}

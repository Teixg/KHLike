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
      <span style="color:var(--kh-gold);font-size:11px;">Lv.${gs.playerLevel}</span>
    </div>
    <div style="display:flex;justify-content:space-between;width:100%;font-size:10px;color:var(--kh-muted);margin-top:2px;">
      <span>Keyblade</span><span>${keybladeName}</span>
    </div>`;

  document.getElementById('p-name').innerHTML  = levelDisplay;
  document.getElementById('p-sprite').innerHTML = c.emoji;
  document.getElementById('e-name').textContent = enemy.name;
  document.getElementById('e-type').textContent = enemy.type;
  document.getElementById('e-sprite').innerHTML  = enemy.emoji;

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

  showScreen('s-battle');
  setTimeout(() => autoBattleStart(), 600);
}

// ───────────────────────────────────────────────────────────
// Auto-battle loop
// ───────────────────────────────────────────────────────────

function autoBattleStart() {
  gs.battleActive = true;
  playerAutoAttack();
}

function playerAutoAttack() {
  if (!gs.battleActive) return;
  const c = gs.char, e = gs.currentEnemy;

  const finalStats = calculateFinalStats();
  const variance   = Math.floor(Math.random() * 6) - 2;
  const dmg        = Math.max(1, Math.round(finalStats.atk + variance));

  e.currentHp = Math.max(0, e.currentHp - dmg);
  spriteShake('e-sprite');
  addLog(`🗡️ <b>${c.name}</b> attacks for <b style="color:#ff8866;">${dmg}</b>`, 'log-action');
  updateBattleBars();

  if (e.currentHp <= 0) { endBattle(true); return; }
  setTimeout(enemyAutoAttack, 700);
}

function enemyAutoAttack() {
  if (!gs.battleActive) return;
  const c = gs.char, e = gs.currentEnemy;

  const variance = Math.floor(Math.random() * 6) - 2;
  const dmg      = Math.max(1, Math.round(e.atk + variance));

  c.currentHp = Math.max(0, c.currentHp - dmg);
  spriteShake('p-sprite');
  addLog(`💢 <b>${e.name}</b> attacks for <b style="color:#ff6644;">${dmg}</b>`, 'log-enemy');
  updateBattleBars();

  if (c.currentHp <= 0) { endBattle(false); return; }
  setTimeout(playerAutoAttack, 600);
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
  pb.style.background = pp > 50 ? '#4caf7d' : pp > 20 ? '#f5c842' : '#cc3366';

  const eb = document.getElementById('e-hp-bar');
  eb.style.width      = ep + '%';
  eb.style.background = ep > 50 ? '#cc3366' : ep > 20 ? '#ff8844' : '#ff4444';

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
// useSkill — sigue disponible aunque el modo auto no lo use
// ───────────────────────────────────────────────────────────

function useSkill(idx) {
  if (!gs.battleActive) return;
  const c  = gs.char;
  const e  = gs.currentEnemy;

  if (!c.skills || !c.skills[idx]) return;
  const sk = c.skills[idx];

  if (sk.mpCost > 0 && c.currentMp < sk.mpCost) return;
  c.currentMp = Math.max(0, c.currentMp - sk.mpCost);

  gs.battleActive = false;
  renderCommands();

  if (sk.type === 'heal') {
    const healed = Math.min(c.hp, c.currentHp + Math.abs(sk.dmg)) - c.currentHp;
    c.currentHp += healed;
    addLog(`${sk.icon} <b>${sk.name}</b> — Restored <b style="color:#4caf7d;">${healed} HP</b>`, 'log-heal');
    updateBattleBars();
    setTimeout(enemyTurn, 700);

  } else if (sk.type === 'drain') {
    const variance = Math.floor(Math.random() * 8) - 3;
    const dmg      = Math.max(1, sk.dmg + (c.atk >> 2) + variance);
    const drain    = Math.round(dmg * 0.4);
    e.currentHp    = Math.max(0, e.currentHp - dmg);
    c.currentHp    = Math.min(c.hp, c.currentHp + drain);
    spriteShake('e-sprite');
    addLog(`${sk.icon} <b>${sk.name}</b> — ${e.name} takes <b>${dmg}</b> · Drained <b style="color:#4caf7d;">${drain} HP</b>`, 'log-action');
    updateBattleBars();
    if (e.currentHp <= 0) { endBattle(true); return; }
    setTimeout(enemyTurn, 700);

  } else {
    const variance = Math.floor(Math.random() * 8) - 3;
    const stat     = sk.type === 'magic' ? c.mgk : c.atk;
    const dmg      = Math.max(1, sk.dmg + (stat >> 2) + variance);
    e.currentHp    = Math.max(0, e.currentHp - dmg);
    spriteShake('e-sprite');
    const cls = sk.type === 'magic' ? 'log-magic' : 'log-action';
    addLog(`${sk.icon} <b>${sk.name}</b> — ${e.name} takes <b>${dmg}</b>`, cls);
    updateBattleBars();
    if (e.currentHp <= 0) { endBattle(true); return; }
    setTimeout(enemyTurn, 700);
  }
}

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

  const ov = document.getElementById('battle-result');
  const rt = document.getElementById('res-title');
  const rs = document.getElementById('res-sub');
  const rr = document.getElementById('res-rewards');
  ov.style.display = 'flex';

  if (won) {
    gs.wins++;

    const oldStats = {
      hp: gs.char.hp, atk: gs.char.atk,
      mgk: gs.char.mgk, spd: gs.char.spd, mp: gs.char.mp,
    };

    gs.playerLevel++;
    updateCharStats();

    const statGains = {
      hp:  gs.char.hp  - oldStats.hp,
      atk: gs.char.atk - oldStats.atk,
      mgk: gs.char.mgk - oldStats.mgk,
      spd: gs.char.spd - oldStats.spd,
      mp:  gs.char.mp  - oldStats.mp,
    };

    rt.textContent = '✦ VICTORY ✦';
    rt.className   = 'result-title result-victory';
    rs.textContent = `${gs.currentEnemy.name} has been defeated.`;

    let rewardsText = `Reward: ${gs.currentEnemy.reward}<br/>`;
    rewardsText += `<span style="color:var(--kh-gold);font-weight:bold;">Level ${gs.playerLevel}</span> `;
    rewardsText += `${statGains.hp  > 0 ? `❤️+${statGains.hp}`  : ''} `;
    rewardsText += `${statGains.atk > 0 ? `⚔️+${statGains.atk}` : ''} `;
    rewardsText += `${statGains.mgk > 0 ? `✨+${statGains.mgk}` : ''} `;
    rewardsText += `${statGains.mp  > 0 ? `💙+${statGains.mp}`  : ''}`;

    rr.innerHTML     = rewardsText;
    rr.style.display = 'block';
    document.getElementById('res-btn').textContent = 'Continue Journey';
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
      const currentWorld = WORLDS[gs.currentWorldId];
      const nextWorldId  = gs.currentWorldId + 1;

      if (nextWorldId < WORLDS.length) {
        const nextWorld = WORLDS[nextWorldId];
        gs.currentWorldId = nextWorldId;

        // Ajustar nivel del jugador al rango del nuevo mundo
        gs.playerLevel = nextWorld.levelRange[0];

        console.log(`🌍 World transition: ${currentWorld.name} → ${nextWorld.name}`);

        // FIX: generateMap() es la función correcta (mapgen.js)
        gs.map = generateMap(gs.currentWorldId);
        gs.pendingNodeId     = null;
        gs.currentBattleInfo = null;

        renderMapCanvas();

        showEventOverlay({
          icon:  nextWorld.icon || '🌍',
          title: nextWorld.name,
          body:  'A new world opens before you.',
          reward: `World ${gs.currentWorldId + 1}/${WORLDS.length}`,
          onClose: () => showScreen('s-map'),
        });

      } else {
        // ¡Juego completado!
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

  } else {
    // Derrota → volver al título
    showScreen('s-title');
  }
}

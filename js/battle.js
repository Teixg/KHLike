/**
 * battle.js — Turn-based battle system
 */

function getScaledEnemy(template, level) {
  const scale = 1 + level * 0.18;
  return {
    ...template,
    hp:      Math.round(template.baseHp  * scale),
    atk:     Math.round(template.baseAtk * scale),
    currentHp: Math.round(template.baseHp * scale),
  };
}

function pickEnemy(level, isBoss, isFinal) {
  if (isFinal) {
    const t = ENEMY_TEMPLATES.find(e => e.isFinal);
    return getScaledEnemy(t, level);
  }
  if (isBoss) {
    const bosses = ENEMY_TEMPLATES.filter(e => e.isBoss && !e.isFinal);
    return getScaledEnemy(bosses[Math.floor(Math.random() * bosses.length)], level);
  }
  const normals = ENEMY_TEMPLATES.filter(e => !e.isBoss);
  return getScaledEnemy(normals[Math.floor(Math.random() * normals.length)], level);
}

function startBattle(enemy, isBoss) {
  gs.currentEnemy  = enemy;
  gs.battleActive  = true;
  gs.pendingVictory = false;

  const c = gs.char;
  document.getElementById('battle-result').style.display = 'none';
  document.getElementById('boss-banner').style.display = isBoss ? 'block' : 'none';

  const keybladeName = gs.currentKeyblade ? `${gs.currentKeyblade.icon} ${gs.currentKeyblade.name}` : 'No Keyblade';
  const levelDisplay = `<div style="display:flex;justify-content:space-between;width:100%;"><span>${c.name}</span><span style="color:var(--kh-gold);font-size:11px;">Lv.${gs.playerLevel}</span></div><div style="display:flex;justify-content:space-between;width:100%;font-size:10px;color:var(--kh-muted);margin-top:2px;"><span>Keyblade</span><span>${keybladeName}</span></div>`;
  document.getElementById('p-name').innerHTML = levelDisplay;
  
  document.getElementById('p-sprite').innerHTML = c.emoji;
  document.getElementById('e-name').textContent = enemy.name;
  document.getElementById('e-type').textContent = enemy.type;
  document.getElementById('e-sprite').innerHTML = enemy.emoji;

  updateBattleBars();
  // In auto-battle mode we don't render command buttons
  renderCommands();

  const log = document.getElementById('battle-log');
  log.innerHTML = `
    <div class="log-line log-system">— ENCOUNTER —</div>
    <div class="log-line"><span style="color:var(--kh-heart);font-family:'Cinzel',serif;font-size:10px;">${enemy.type.toUpperCase()}</span> — <b>${enemy.name}</b> appeared!</div>
  `;

  showScreen('s-battle');

  // Start automatic combat loop after a short delay
  setTimeout(() => autoBattleStart(), 600);
}

/* ===== Auto-battle logic ===== */
function autoBattleStart() {
  // Ensure battle is active
  gs.battleActive = true;
  // Kick off with player attacking first
  playerAutoAttack();
}

function playerAutoAttack() {
  if (!gs.battleActive) return;
  const c = gs.char, e = gs.currentEnemy;
  // Calculate damage with keyblade and item bonuses
  const finalStats = calculateFinalStats();
  const variance = Math.floor(Math.random() * 6) - 2; // -2..+3
  const dmg = Math.max(1, Math.round(finalStats.atk + variance));
  e.currentHp = Math.max(0, e.currentHp - dmg);
  spriteShake('e-sprite');
  addLog(`🗡️ <b>${c.name}</b> attacks for <b style="color:#ff8866;">${dmg}</b>`, 'log-action');
  updateBattleBars();
  if (e.currentHp <= 0) { endBattle(true); return; }
  // Enemy turn after brief delay
  setTimeout(enemyAutoAttack, 700);
}

function enemyAutoAttack() {
  if (!gs.battleActive) return;
  const c = gs.char, e = gs.currentEnemy;
  const variance = Math.floor(Math.random() * 6) - 2;
  const dmg = Math.max(1, Math.round(e.atk + variance));
  c.currentHp = Math.max(0, c.currentHp - dmg);
  // No MP regen or other mechanics in auto mode
  spriteShake('p-sprite');
  addLog(`💢 <b>${e.name}</b> attacks for <b style="color:#ff6644;">${dmg}</b>`, 'log-enemy');
  updateBattleBars();
  if (c.currentHp <= 0) { endBattle(false); return; }
  // Next player attack
  setTimeout(playerAutoAttack, 600);
}

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
  const c    = gs.char;
  const menu = document.getElementById('cmd-menu');
  // Auto-battle mode: no command buttons. Show a small status note.
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
  void el.offsetWidth; // reflow
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 350);
}

function useSkill(idx) {
  if (!gs.battleActive) return;
  const c  = gs.char;
  const e  = gs.currentEnemy;
  const sk = c.skills[idx];

  if (sk.mpCost > 0 && c.currentMp < sk.mpCost) return;
  c.currentMp = Math.max(0, c.currentMp - sk.mpCost);

  // Disable commands during animation
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
    const dmg = Math.max(1, sk.dmg + (c.atk >> 2) + variance);
    const drain = Math.round(dmg * 0.4);
    e.currentHp = Math.max(0, e.currentHp - dmg);
    c.currentHp = Math.min(c.hp, c.currentHp + drain);
    spriteShake('e-sprite');
    addLog(`${sk.icon} <b>${sk.name}</b> — ${e.name} takes <b>${dmg}</b> · Drained <b style="color:#4caf7d;">${drain} HP</b>`, 'log-action');
    updateBattleBars();
    if (e.currentHp <= 0) { endBattle(true); return; }
    setTimeout(enemyTurn, 700);

  } else {
    const variance = Math.floor(Math.random() * 8) - 3;
    const stat  = sk.type === 'magic' ? c.mgk : c.atk;
    const dmg   = Math.max(1, sk.dmg + (stat >> 2) + variance);
    e.currentHp = Math.max(0, e.currentHp - dmg);
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
  c.currentHp = Math.max(0, c.currentHp - dmg);
  // MP regen on hit (like KH gauge)
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
    
    // Store old stats before level up
    const oldStats = {
      hp: gs.char.hp,
      atk: gs.char.atk,
      mgk: gs.char.mgk,
      spd: gs.char.spd,
      mp: gs.char.mp,
    };
    
    // Level up and update stats
    gs.playerLevel++;
    updateCharStats();
    
    // Calculate stat gains
    const statGains = {
      hp: gs.char.hp - oldStats.hp,
      atk: gs.char.atk - oldStats.atk,
      mgk: gs.char.mgk - oldStats.mgk,
      spd: gs.char.spd - oldStats.spd,
      mp: gs.char.mp - oldStats.mp,
    };
    
    rt.textContent  = '✦ VICTORY ✦';
    rt.className    = 'result-title result-victory';
    rs.textContent  = `${gs.currentEnemy.name} has been defeated.`;
    
    // Build rewards text
    let rewardsText = `Reward: ${gs.currentEnemy.reward}<br/>`;
    rewardsText += `<span style="color:var(--kh-gold);font-weight:bold;">Level ${gs.playerLevel}</span> `;
    rewardsText += `${statGains.hp > 0 ? `❤️+${statGains.hp}` : ''} `;
    rewardsText += `${statGains.atk > 0 ? `⚔️+${statGains.atk}` : ''} `;
    rewardsText += `${statGains.mgk > 0 ? `✨+${statGains.mgk}` : ''} `;
    rewardsText += `${statGains.mp > 0 ? `💙+${statGains.mp}` : ''}`;
    
    rr.innerHTML  = rewardsText;
    rr.style.display = 'block';
    document.getElementById('res-btn').textContent = 'Continue Journey';
    gs.pendingVictory = true;
  } else {
    rt.textContent  = 'Darkness Prevails...';
    rt.className    = 'result-title result-defeat';
    rs.innerHTML    = '&ldquo;Even in the deepest darkness, there will always be a light to guide you.&rdquo;';
    rr.style.display = 'none';
    document.getElementById('res-btn').textContent = 'Return to Title';
    gs.pendingVictory = false;
  }
}

function afterBattle() {
  if (gs.pendingVictory) {
    // Mark the node as done, update map, go back
    if (gs.pendingNodeId) {
      advanceMap(gs.map, gs.pendingNodeId);
      gs.currentLevel = gs.map.nodes[gs.pendingNodeId].level;
    }
    renderMapCanvas();
    showScreen('s-map');
  } else {
    showScreen('s-title');
  }
}

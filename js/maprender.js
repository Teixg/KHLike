/**
 * maprender.js — Renders the procedural map with SVG connection lines
 * Nodes rendered as simpler route-style pill markers for a clearer map.
 */

const NODE_W  = 64;   // node visual width reference
const NODE_H  = 84;   // cube + label total height
const LEVEL_H = 120;  // px vertical gap between level centers
const PAD_TOP = 50;   // px top padding
const PAD_X   = 50;   // px horizontal padding

/** Cube color palette by type */
const CUBE_COLORS = {
  start:   { top:'#fff8cc', left:'#e8c840', right:'#c9a030', glow:'rgba(255,220,60,.7)'  },
  battle:  { top:'#ffdd66', left:'#cc8800', right:'#885500', glow:'rgba(255,180,0,.6)'   },
  boss:    { top:'#ff6677', left:'#cc1133', right:'#880022', glow:'rgba(255,40,80,.7)'   },
  save:    { top:'#55eebb', left:'#119966', right:'#0a6644', glow:'rgba(40,220,140,.6)'  },
  chest:   { top:'#88ccff', left:'#2266cc', right:'#114488', glow:'rgba(60,140,255,.6)'  },
  mystery: { top:'#cc88ff', left:'#7722cc', right:'#440088', glow:'rgba(160,60,255,.6)'  },
  moogle:  { top:'#66eeff', left:'#1199bb', right:'#0a6677', glow:'rgba(40,200,255,.6)'  },
  end:     { top:'#ff4455', left:'#aa0011', right:'#660008', glow:'rgba(255,20,40,.8)'   },
};

const CUBE_LOCKED  = { top:'#1e2030', left:'#14162a', right:'#0c0e1a' };
const CUBE_VISITED = { top:'#383a50', left:'#242638', right:'#181a28' };

/** X center of a node */
function nodeX(node, containerW) {
  const centerX = containerW / 2;
  const usable = containerW - PAD_X * 2;
  const slotW = usable / 4;

  if (node.totalInLevel === 1) return centerX;
  if (node.totalInLevel === 2) {
    return centerX + (node.pos === 0 ? -1 : 1) * slotW;
  }

  // 3 nodes: left, center, right
  return centerX + (node.pos - 1) * slotW;
}

/** Y center of a node */
function nodeY(node) { return PAD_TOP + node.level * LEVEL_H; }

/** Total canvas height */
function canvasH(levels) { return PAD_TOP + (levels.length - 1) * LEVEL_H + NODE_H + 20; }

/** Build the route-style HTML for a node */
function buildNodeHTML(node, cfg) {
  return `
    <div class="node-circle">
      <span class="node-icon">${cfg.icon}</span>
    </div>
  `;
}

/** Render the full map into #map-canvas-wrap */
function renderMapCanvas() {
  const wrap = document.getElementById('map-canvas-wrap');
  const svg  = document.getElementById('map-svg');
  const { nodes, levels } = gs.map;
  const W = wrap.offsetWidth || 640;
  const H = canvasH(levels);

  wrap.style.minHeight = H + 'px';
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);
  svg.style.height = H + 'px';

  // Cache positions
  Object.values(nodes).forEach(n => {
    n._cx = nodeX(n, W);
    n._cy = nodeY(n);
  });

  // ── SVG lines ────────────────────────────────────────────
  svg.innerHTML = `
    <defs>
      <filter id="glow-gold" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-boss" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

  levels.forEach(levelIds => {
    levelIds.forEach(cid => {
      const cNode = nodes[cid];
      cNode.connections.forEach(nid => {
        const nNode = nodes[nid];
        const x1 = cNode._cx, y1 = cNode._cy;
        const x2 = nNode._cx, y2 = nNode._cy;
        let stroke, width, opacity, filter = '';
        if (cNode.visited && nNode.visited) {
          stroke = '#f0e68c'; width = 3.2; opacity = 1;
        } else if (cNode.visited && nNode.available) {
          const pal = CUBE_COLORS[nNode.type] || CUBE_COLORS.battle;
          stroke = pal.top; width = 3.4; opacity = 1;
          filter = nNode.type === 'boss' || nNode.type === 'end'
            ? 'url(#glow-boss)' : 'url(#glow-gold)';
        } else {
          stroke = 'rgba(200,200,200,0.35)'; width = 2.2; opacity = 0.5;
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x1},${y1} L${x2},${y2}`);
        path.setAttribute('stroke', stroke);
        path.setAttribute('stroke-width', width);
        path.setAttribute('opacity', opacity);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        // add semantic classes for CSS tweaks
        path.classList.add('map-path');
        if (cNode.visited && nNode.visited) path.classList.add('map-path-visited');
        else if (cNode.visited && nNode.available) path.classList.add('map-path-available');
        else path.classList.add('map-path-locked');
        if (!cNode.visited && !nNode.available) {
          path.setAttribute('stroke-dasharray', '4 6');
          path.setAttribute('stroke', 'rgba(200,200,200,0.25)');
        }
        if (filter) path.setAttribute('filter', filter);
        svg.appendChild(path);
      });
    });
  });

  // ── Cube node divs ───────────────────────────────────────
  wrap.querySelectorAll('.map-node').forEach(el => el.remove());

  Object.values(nodes).forEach(n => {
    const cfg = NODE_CONFIGS[n.type] || {icon:'?', label:n.type};
    const state = n.visited ? 'state-visited'
      : n.available         ? 'state-available'
      : 'state-locked';

    const div = document.createElement('div');
    div.className   = `map-node type-${n.type} ${state}`;
    div.style.left  = n._cx + 'px';
    div.style.top   = n._cy + 'px';
    div.dataset.nodeId = n.id;

    // Glow filter for available nodes
    if (state === 'state-available') {
      const pal = CUBE_COLORS[n.type] || CUBE_COLORS.battle;
      div.style.filter = `drop-shadow(0 0 8px ${pal.glow}) drop-shadow(0 2px 4px rgba(0,0,0,.8))`;
    } else if (state === 'state-locked') {
      div.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,.6))';
    } else {
      div.style.filter = 'grayscale(100%) brightness(0.7) drop-shadow(0 2px 4px rgba(0,0,0,.7))';
    }

    div.innerHTML = buildNodeHTML(n, cfg);

    if (state === 'state-available') {
      div.style.cursor = 'pointer';
      const world = WORLDS[gs.currentWorldId];

div.title = `${cfg.label} — ${world.name}`;
      div.addEventListener('click', () => handleMapNode(n.id));
    }

    wrap.appendChild(div);
  });

  updateMapHUD();
}

function updateMapHUD() {
  const world = WORLDS[gs.currentWorldId];

  document.getElementById('hud-world').textContent = world.name;
  document.getElementById('hud-world-icon').innerHTML = world.icon;

  document.getElementById('hud-kills').textContent = gs.wins;
  document.getElementById('hud-level').textContent = (gs.currentLevel || 0) + 1;

  renderMapSidePanels();
}

function renderMapSidePanels() {
  const left = document.getElementById('map-panel-left');
  const right = document.getElementById('map-panel-right');
  const c = gs.char || { emoji:'—', name:'Unknown', hp:0, currentHp:0, mp:0, currentMp:0 };
  const inventory = Array.isArray(gs.inventory) ? gs.inventory : [];
  
  if (left) {
    const hpPercent = c.hp > 0 ? Math.round((c.currentHp / c.hp) * 100) : 0;
    const mpPercent = c.mp > 0 ? Math.round((c.currentMp / c.mp) * 100) : 0;
    
    left.innerHTML = `
      <div class="panel-title">Character</div>
      <div class="panel-block">
        <div class="panel-row"><span class="panel-value" style="font-size:28px;text-align:center;width:100%;">${c.emoji}</span></div>
        <div class="panel-row"><span class="panel-label">Name</span><span class="panel-value">${c.name}</span></div>
        <div class="panel-row"><span class="panel-label">Level</span><span class="panel-value">Lv. ${gs.playerLevel}</span></div>
        <div class="panel-row" style="flex-direction:column;align-items:flex-start;">
          <span class="panel-label">HP</span>
          <div class="stat-bar-wrapper">
            <div class="stat-bar">
              <div class="stat-bar-fill" style="width:${hpPercent}%;"></div>
            </div>
            <div class="stat-text">${c.currentHp}/${c.hp}</div>
          </div>
        </div>
        <div class="panel-row" style="flex-direction:column;align-items:flex-start;">
          <span class="panel-label">MP</span>
          <div class="stat-bar-wrapper">
            <div class="stat-bar mp">
              <div class="stat-bar-fill" style="width:${mpPercent}%;"></div>
            </div>
            <div class="stat-text">${c.currentMp}/${c.mp}</div>
          </div>
        </div>
      </div>
    `;
  }
  if (right) {
    const equipped = gs.equippedItems.map(itemId => getItemById(itemId));
    right.innerHTML = `
      <div class="panel-title">⚔ Keyblade</div>
      <div class="panel-block">
        <div class="panel-row" style="flex-direction:column;align-items:flex-start;gap:6px;">
          <span class="panel-label">Equipped</span>
          <span class="panel-value" style="text-align:left;">${gs.currentKeyblade ? `${gs.currentKeyblade.icon} ${gs.currentKeyblade.name}` : '—'}</span>
          ${gs.currentKeyblade ? `<span class="stat-text">ATK: +${gs.currentKeyblade.atk}</span>` : ''}
        </div>
      </div>
      <div class="panel-title">📦 Items</div>
      <div class="panel-block">
        ${[0,1].map(slot => {
          const item = equipped[slot];
          return item ? `
            <div class="panel-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
              <span class="panel-label">Slot ${slot + 1}</span>
              <div class="item-chip-equipped">
                <div class="item-name">${item.icon} ${item.name}</div>
                <div class="item-stat">${item.stat === 'atk' ? '⚔️' : item.stat === 'mgk' ? '✨' : item.stat === 'hp' ? '❤️' : item.stat === 'mp' ? '💙' : '⚡'} +${item.bonus}${item.mgk_bonus ? ` / ✨+${item.mgk_bonus}` : ''}</div>
              </div>
            </div>
          ` : `<div class="panel-row"><span class="panel-label">Slot ${slot + 1}</span><span class="panel-value">—</span></div>`;
        }).join('')}
      </div>
      <div class="panel-title">🎒 Inventory</div>
      <div class="panel-block inventory-block">
        ${inventory.length > 0 ? inventory.map(itemId => {
          const item = getItemById(itemId);
          const isEquipped = gs.equippedItems.includes(itemId);
          const statIcon = item.stat === 'atk' ? '⚔️' : item.stat === 'mgk' ? '✨' : item.stat === 'hp' ? '❤️' : item.stat === 'mp' ? '💙' : '⚡';
          return `
            <div class="item-chip-container">
              <div class="item-chip" onclick="event.stopPropagation();">
                <div class="item-name">${item.icon} ${item.name}</div>
                <div class="item-stat">${statIcon} +${item.bonus}${item.mgk_bonus ? ` / ✨+${item.mgk_bonus}` : ''}</div>
              </div>
              <button class="item-equip-btn" onclick="toggleEquipItem('${itemId}')" title="${isEquipped ? 'Unequip' : 'Equip'}">${isEquipped ? '✓' : '+'}​</button>
            </div>
          `;
        }).join('') : '<div class="panel-row"><span class="panel-label">No items</span></div>'}
      </div>
    `;
  }
}
